import { CANONICAL_SKILLS, CanonicalSkill, SKILL_ALIAS_MAP } from '../data/skillAliases';

export interface ExtractedSkill {
  id: string;
  skill: string;
  matchedToken: string;
  stage: 'alias' | 'fuzzy';
  similarity: number;
  currentProficiency: number;
  category: 'core' | 'tool' | 'soft' | 'domain';
}

/**
 * Generates character 3-grams for fuzzy matching
 */
function getChar3Grams(str: string): Map<string, number> {
  const clean = `  ${str.toLowerCase().trim()}  `;
  const grams = new Map<string, number>();
  for (let i = 0; i < clean.length - 2; i++) {
    const gram = clean.slice(i, i + 3);
    grams.set(gram, (grams.get(gram) || 0) + 1);
  }
  return grams;
}

/**
 * Computes Cosine Similarity between two 3-gram frequency vectors
 */
function cosineSimilarity3Gram(gramsA: Map<string, number>, gramsB: Map<string, number>): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  gramsA.forEach((val, key) => {
    normA += val * val;
    if (gramsB.has(key)) {
      dotProduct += val * (gramsB.get(key) || 0);
    }
  });

  gramsB.forEach(val => {
    normB += val * val;
  });

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Pre-computed 3-grams for canonical skill names and key aliases
const CANONICAL_GRAMS = CANONICAL_SKILLS.map(skill => ({
  skill,
  nameGrams: getChar3Grams(skill.name),
  aliasGrams: skill.aliases.map(a => ({ alias: a, grams: getChar3Grams(a) }))
}));

/**
 * Extracts raw text from client-side File (supports .txt, .pdf stream parsing, .json)
 */
export async function extractTextFromFile(file: File): Promise<string> {
  if (file.name.endsWith('.pdf')) {
    try {
      const buffer = await file.arrayBuffer();
      const uint8 = new Uint8Array(buffer);
      // Fast client-side PDF text stream extractor
      let extracted = '';
      const textDecoder = new TextDecoder('latin1');
      const rawString = textDecoder.decode(uint8);

      // Search for text operators BT ... ET and strings inside parentheses or brackets
      const streamRegex = /BT[\s\S]*?ET/g;
      const matches = rawString.match(streamRegex);

      if (matches && matches.length > 0) {
        for (const block of matches) {
          // Extract text inside (...) Tj or [(...)] TJ
          const tjMatches = block.match(/\(([^()]*)\)\s*Tj/g) || [];
          for (const tj of tjMatches) {
            const inner = tj.replace(/^\(/, '').replace(/\)\s*Tj$/, '');
            extracted += inner + ' ';
          }
          const tjArrayMatches = block.match(/\[(.*?)\]\s*TJ/g) || [];
          for (const tja of tjArrayMatches) {
            const innerStrings = tja.match(/\(([^()]*)\)/g) || [];
            for (const str of innerStrings) {
              extracted += str.slice(1, -1) + ' ';
            }
          }
        }
      }

      if (extracted.trim().length > 30) {
        return cleanExtractedText(extracted);
      }

      // Fallback: look for plaintext ascii word tokens in the PDF bytes
      const words = rawString.match(/[A-Za-z0-9+#.]{2,}/g) || [];
      return cleanExtractedText(words.slice(0, 500).join(' '));
    } catch (err) {
      console.warn('PDF stream parse fallback:', err);
      return file.name;
    }
  }

  // Standard text/markdown/plain files
  return await file.text();
}

function cleanExtractedText(text: string): string {
  return text
    .replace(/[^\x20-\x7E\n]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Two-stage Skill Extraction Engine
 * Stage 1: Case-insensitive Alias Map lookup
 * Stage 2: Fuzzy character 3-gram TF-IDF cosine similarity (threshold >= 0.72)
 */
export function extractSkillsFromText(rawText: string): ExtractedSkill[] {
  if (!rawText || rawText.trim().length === 0) return [];

  const textLower = rawText.toLowerCase();
  const extractedMap = new Map<string, ExtractedSkill>();

  // Helper to add or keep highest confidence match
  const recordSkill = (
    canonical: CanonicalSkill,
    matchedToken: string,
    stage: 'alias' | 'fuzzy',
    similarity: number
  ) => {
    if (extractedMap.has(canonical.name)) {
      const existing = extractedMap.get(canonical.name)!;
      if (similarity > existing.similarity) {
        extractedMap.set(canonical.name, {
          ...existing,
          matchedToken,
          similarity
        });
      }
      return;
    }

    // Heuristic: boost default proficiency if text mentions advanced terms
    let initialProficiency = canonical.defaultProficiency;
    const regexAdvanced = new RegExp(`(advanced|lead|expert|senior|mastery|proficient|3\\+|5\\+)\\s+.*${canonical.name.toLowerCase()}`, 'i');
    if (regexAdvanced.test(textLower)) {
      initialProficiency = Math.min(95, initialProficiency + 15);
    }

    extractedMap.set(canonical.name, {
      id: canonical.id,
      skill: canonical.name,
      matchedToken,
      stage,
      similarity,
      currentProficiency: initialProficiency,
      category: canonical.category
    });
  };

  // ================= STAGE 1: ALIAS MAP (Case-insensitive) =================
  for (const skill of CANONICAL_SKILLS) {
    for (const alias of skill.aliases) {
      const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Look for boundary-matched occurrences
      const pattern = new RegExp(`(^|[^a-zA-Z0-9+#])${escaped}([^a-zA-Z0-9+#]|$)`, 'i');
      if (pattern.test(textLower)) {
        recordSkill(skill, alias, 'alias', 1.0);
        break; // matched this canonical skill via alias
      }
    }
  }

  // ================= STAGE 2: FUZZY 3-GRAM COSINE SIMILARITY =================
  // Split input into words/short candidate phrases
  const candidateWords = Array.from(
    new Set(
      textLower
        .replace(/[^a-z0-9+#\s-]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length >= 3 && w.length <= 25)
    )
  );

  // Also include 2-word sliding windows for phrases like "data clean" or "ab test"
  const wordTokens = textLower.replace(/[^a-z0-9+#\s-]/g, ' ').split(/\s+/).filter(Boolean);
  for (let i = 0; i < wordTokens.length - 1; i++) {
    const bigram = `${wordTokens[i]} ${wordTokens[i + 1]}`;
    if (bigram.length >= 6 && bigram.length <= 30) {
      candidateWords.push(bigram);
    }
  }

  const FUZZY_THRESHOLD = 0.72;

  for (const candidate of candidateWords) {
    const candidateGrams = getChar3Grams(candidate);

    for (const item of CANONICAL_GRAMS) {
      // Check against canonical name
      const nameSim = cosineSimilarity3Gram(candidateGrams, item.nameGrams);
      if (nameSim >= FUZZY_THRESHOLD) {
        recordSkill(item.skill, candidate, 'fuzzy', Number(nameSim.toFixed(2)));
        continue;
      }

      // Check against key aliases
      for (const ag of item.aliasGrams) {
        const aliasSim = cosineSimilarity3Gram(candidateGrams, ag.grams);
        if (aliasSim >= FUZZY_THRESHOLD) {
          recordSkill(item.skill, candidate, 'fuzzy', Number(aliasSim.toFixed(2)));
          break;
        }
      }
    }
  }

  return Array.from(extractedMap.values());
}

/**
 * Pre-filled sample resume text for 1-click student demo
 */
export const SAMPLE_RESUME_TEXT = `
AARAV MEHTA
Final Year B.Tech Computer Science | Indian Institute of Technology (BHU)
Email: aarav.mehta@example.edu.in | GitHub: github.com/aaravm-analyst | LinkedIn: linkedin.com/in/aaravm

CAREER OBJECTIVE
Aspiring Data & Business Analyst with strong foundations in SQL query optimization, Python data analysis, exploratory statistics, and dashboarding. Seeking entry-level roles to leverage data-driven problem solving and deliver business impact.

EDUCATION
B.Tech in Computer Science & Engineering (2022 - 2026) | CGPA: 8.4/10
Relevant Coursework: Database Management Systems (DBMS), Probability & Statistics, Object-Oriented Programming, Data Structures & Algorithms.

TECHNICAL SKILLS
- Programming: Python 3, Pandas, NumPy, Scikit-learn, SQL (PostgreSQL, MySQL), C++
- Data & Analytics: Exploratory Data Analysis (EDA), Hypothesis Testing, Linear Regression, Descriptive Stats
- BI & Tools: MS Excel (VLOOKUP, Pivot Tables, SUMIFS), Power BI, Git & GitHub, Jupyter Notebook
- Professional: Business Communication, Technical Presentation, Problem Solving, Cross-functional teamwork

PROJECTS
1. E-Commerce Customer Retention & Cohort Analysis (Python, PostgreSQL, Power BI)
- Extracted and cleaned 250,000+ transactional records using advanced SQL joins, CTEs, and window functions.
- Performed statistical cohort analysis in Python pandas to identify a 32% user drop-off point during 2nd month subscription.
- Designed an interactive executive Power BI dashboard tracking monthly churn, repeat purchase frequency, and CAC.

2. Academic Placement Prediction & Hypothesis Testing (Python, Scikit-learn, Stats)
- Formulated null hypothesis and conducted two-sample t-tests to evaluate correlation between student coding scores and salary packages.
- Achieved 81% prediction accuracy using logistic regression and documented end-to-end findings on GitHub.
`;
