// ==============================================================================
// KAABIL (काबिल) — Universal Skill Assessment Question Banks
// Covers all 13 Educational Streams from Class 8/10 to College & Trades
// Supports Objective Auto-Grading & Scenario-Based Rubric Evaluation
// ==============================================================================

export interface AssessmentOption {
  optionKey: "A" | "B" | "C" | "D";
  optionText: string;
  isCorrect: boolean;
}

export interface AssessmentQuestionData {
  id: string;
  questionOrder: number;
  questionType: "MULTIPLE_CHOICE" | "SCENARIO_ANALYSIS";
  questionText: string;
  explanation: string;
  rubricGuide?: string;
  points: number;
  options: AssessmentOption[];
}

export interface AssessmentData {
  id: string;
  title: string;
  slug: string;
  description: string;
  stream: string; // EducationalStream
  category: "FOUNDATION" | "SUBJECT_SPECIFIC" | "CAREER_AWARENESS" | "LOGICAL_REASONING" | "DOMAIN_COMPETENCY";
  targetSkillName: string;
  difficultyLevel: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  minEducationStage: "CLASS_8" | "CLASS_10" | "CLASS_12" | "UNDERGRADUATE";
  durationMinutes: number;
  passingPercentage: number;
  rubricCriteria: {
    accuracyWeight: number;
    reasoningWeight: number;
    applicationWeight: number;
  };
  questions: AssessmentQuestionData[];
}

export const KAABIL_ASSESSMENTS: AssessmentData[] = [
  // 1. MEDICAL (PCB)
  {
    id: "asm-med-01",
    title: "Clinical Reasoning & Human Physiology Foundations",
    slug: "clinical-reasoning-human-physiology",
    description: "Assess foundational knowledge of cardiovascular and renal systems, homeostatic regulation, and diagnostic reasoning for medical aspirants.",
    stream: "MEDICAL_PCB",
    category: "SUBJECT_SPECIFIC",
    targetSkillName: "Human Physiology",
    difficultyLevel: "INTERMEDIATE",
    minEducationStage: "CLASS_12",
    durationMinutes: 15,
    passingPercentage: 70,
    rubricCriteria: { accuracyWeight: 50, reasoningWeight: 30, applicationWeight: 20 },
    questions: [
      {
        id: "q-med-1",
        questionOrder: 1,
        questionType: "MULTIPLE_CHOICE",
        questionText: "A patient presents with acute dehydration following strenuous exercise. Which physiological compensatory mechanism occurs first to preserve glomerular filtration rate (GFR)?",
        explanation: "In response to mild-to-moderate renal hypoperfusion, renin is released triggering angiotensin II, which preferentially constricts the efferent arteriole, thereby elevating glomerular hydrostatic pressure and preserving GFR.",
        points: 20,
        options: [
          { optionKey: "A", optionText: "Constriction of the afferent arteriole by endothelin", isCorrect: false },
          { optionKey: "B", optionText: "Preferential constriction of the efferent arteriole mediated by Angiotensin II", isCorrect: true },
          { optionKey: "C", optionText: "Suppression of antidiuretic hormone (ADH) secretion from posterior pituitary", isCorrect: false },
          { optionKey: "D", optionText: "Dilation of the efferent arteriole to reduce intravascular resistance", isCorrect: false },
        ],
      },
      {
        id: "q-med-2",
        questionOrder: 2,
        questionType: "MULTIPLE_CHOICE",
        questionText: "Which heart valve closure corresponds directly to the first heart sound (S1) heard during cardiac auscultation?",
        explanation: "The first heart sound (S1) is produced by the sudden closure of the atrioventricular (AV) valves (mitral and tricuspid) at the onset of ventricular systole.",
        points: 20,
        options: [
          { optionKey: "A", optionText: "Aortic and pulmonary semilunar valves", isCorrect: false },
          { optionKey: "B", optionText: "Mitral and tricuspid atrioventricular valves", isCorrect: true },
          { optionKey: "C", optionText: "Aortic valve only during diastole", isCorrect: false },
          { optionKey: "D", optionText: "Eustachian valve and the coronary sinus valve", isCorrect: false },
        ],
      },
      {
        id: "q-med-3",
        questionOrder: 3,
        questionType: "SCENARIO_ANALYSIS",
        questionText: "Clinical Scenario: An 18-year-old athlete collapses on a hot afternoon with a core temperature of 39.5°C, cessation of sweating, confusion, and tachycardia. What is the immediate life-saving triage priority before pharmacological intervention?",
        explanation: "Exertional heat stroke is an extreme medical emergency. Immediate evaporative or whole-body cold-water immersion cooling is the gold standard priority to prevent multi-organ failure and encephalopathy.",
        rubricGuide: "Requires rapid identification of heat stroke symptoms and prioritization of immediate external cooling over IV antipyretics.",
        points: 20,
        options: [
          { optionKey: "A", optionText: "Administer high-dose oral paracetamol immediately", isCorrect: false },
          { optionKey: "B", optionText: "Rapid active external cooling (cold-water immersion or evaporative misting) and airway support", isCorrect: true },
          { optionKey: "C", optionText: "Wait 30 minutes in shade before taking any intervention", isCorrect: false },
          { optionKey: "D", optionText: "Perform urgent blood transfusion without diagnostic confirmation", isCorrect: false },
        ],
      },
    ],
  },

  // 2. NON-MEDICAL / STEM (PCM)
  {
    id: "asm-stem-01",
    title: "Algorithmic Thinking & Python Problem Solving",
    slug: "algorithmic-thinking-python",
    description: "Evaluates computational complexity, dynamic data structures, asymptotic notation, and algorithmic optimization in software engineering.",
    stream: "NON_MEDICAL_PCM",
    category: "DOMAIN_COMPETENCY",
    targetSkillName: "Data Structures & Algorithms",
    difficultyLevel: "INTERMEDIATE",
    minEducationStage: "CLASS_12",
    durationMinutes: 15,
    passingPercentage: 65,
    rubricCriteria: { accuracyWeight: 40, reasoningWeight: 35, applicationWeight: 25 },
    questions: [
      {
        id: "q-stem-1",
        questionOrder: 1,
        questionType: "MULTIPLE_CHOICE",
        questionText: "What is the worst-case time complexity of searching for an element in a Balanced Binary Search Tree (such as an AVL or Red-Black Tree) containing N nodes?",
        explanation: "Balanced binary search trees maintain a height strictly bounded by O(log N), guaranteeing that search, insertion, and deletion operate in O(log N) worst-case time.",
        points: 20,
        options: [
          { optionKey: "A", optionText: "O(1)", isCorrect: false },
          { optionKey: "B", optionText: "O(log N)", isCorrect: true },
          { optionKey: "C", optionText: "O(N)", isCorrect: false },
          { optionKey: "D", optionText: "O(N log N)", isCorrect: false },
        ],
      },
      {
        id: "q-stem-2",
        questionOrder: 2,
        questionType: "MULTIPLE_CHOICE",
        questionText: "In Python, which built-in data structure provides average O(1) time complexity for lookup, insertion, and deletion operations based on hashing?",
        explanation: "Python dictionaries (and sets) are implemented as hash tables with open addressing, providing expected average O(1) amortized complexity for lookups and insertions.",
        points: 20,
        options: [
          { optionKey: "A", optionText: "List", isCorrect: false },
          { optionKey: "B", optionText: "Tuple", isCorrect: false },
          { optionKey: "C", optionText: "Dict", isCorrect: true },
          { optionKey: "D", optionText: "LinkedDeque", isCorrect: false },
        ],
      },
      {
        id: "q-stem-3",
        questionOrder: 3,
        questionType: "SCENARIO_ANALYSIS",
        questionText: "Engineering Scenario: You need to detect cycles in an undirected graph representing a microservice dependency network. Which graph traversal algorithm with visited state tracking is optimal?",
        explanation: "Cycle detection in an undirected graph is optimally achieved using Depth-First Search (DFS) or Breadth-First Search (BFS) with parent tracking, operating in O(V + E) time.",
        points: 20,
        options: [
          { optionKey: "A", optionText: "Depth-First Search (DFS) tracking visited vertices and parent references in O(V + E)", isCorrect: true },
          { optionKey: "B", optionText: "Dijkstra's Single Source Shortest Path Algorithm in O(E log V)", isCorrect: false },
          { optionKey: "C", optionText: "Floyd-Warshall All-Pairs Algorithm in O(V^3)", isCorrect: false },
          { optionKey: "D", optionText: "Brute-force matrix inversion in O(N^3)", isCorrect: false },
        ],
      },
    ],
  },

  // 3. COMMERCE
  {
    id: "asm-comm-01",
    title: "Financial Statement Analysis & Corporate Accounting",
    slug: "financial-statement-analysis",
    description: "Demonstrate mastery over balance sheets, cash flow categorization, working capital management, and solvency ratios under Indian Accounting Standards (Ind AS).",
    stream: "COMMERCE",
    category: "SUBJECT_SPECIFIC",
    targetSkillName: "Financial Analysis",
    difficultyLevel: "INTERMEDIATE",
    minEducationStage: "CLASS_12",
    durationMinutes: 15,
    passingPercentage: 65,
    rubricCriteria: { accuracyWeight: 50, reasoningWeight: 30, applicationWeight: 20 },
    questions: [
      {
        id: "q-comm-1",
        questionOrder: 1,
        questionType: "MULTIPLE_CHOICE",
        questionText: "Under Cash Flow Statement reporting (Ind AS 7 / AS 3), where does the purchase of manufacturing machinery for cash get classified?",
        explanation: "Purchase of property, plant, and equipment constitutes an outflow of economic resources aimed at generating future income, classifying it strictly under Cash Flows from Investing Activities.",
        points: 20,
        options: [
          { optionKey: "A", optionText: "Cash Flow from Operating Activities", isCorrect: false },
          { optionKey: "B", optionText: "Cash Flow from Investing Activities", isCorrect: true },
          { optionKey: "C", optionText: "Cash Flow from Financing Activities", isCorrect: false },
          { optionKey: "D", optionText: "Cash and Cash Equivalents reserve adjustment", isCorrect: false },
        ],
      },
      {
        id: "q-comm-2",
        questionOrder: 2,
        questionType: "MULTIPLE_CHOICE",
        questionText: "If a company has a Current Ratio of 2.5:1 and a Quick (Acid-Test) Ratio of 0.8:1, what does this significant divergence typically indicate?",
        explanation: "The Quick Ratio excludes inventories and prepaid expenses from current assets. A large disparity between Current Ratio (2.5) and Quick Ratio (0.8) indicates that a major portion of current assets is tied up in slow-moving inventory.",
        points: 20,
        options: [
          { optionKey: "A", optionText: "Extremely high cash liquidity with minimal liabilities", isCorrect: false },
          { optionKey: "B", optionText: "A substantial proportion of current assets is locked in inventory", isCorrect: true },
          { optionKey: "C", optionText: "The company has zero short-term debt obligations", isCorrect: false },
          { optionKey: "D", optionText: "Accounts receivable are collected faster than industry average", isCorrect: false },
        ],
      },
      {
        id: "q-comm-3",
        questionOrder: 3,
        questionType: "SCENARIO_ANALYSIS",
        questionText: "Auditing Scenario: During annual closure, a retailer counts ₹50 Lakh in damaged stock that cannot be sold at cost. Under conservative accounting principles, how should this inventory be valued?",
        explanation: "Under Ind AS 2 (Inventories), inventory must be measured at the lower of Cost and Net Realizable Value (NRV). The write-down must be recognized immediately as an expense.",
        points: 20,
        options: [
          { optionKey: "A", optionText: "Retain at historical acquisition cost until physically discarded", isCorrect: false },
          { optionKey: "B", optionText: "Value at Net Realizable Value (NRV) and recognize the impairment loss immediately", isCorrect: true },
          { optionKey: "C", optionText: "Capitalize the damage as deferred operational expenditure over 5 years", isCorrect: false },
          { optionKey: "D", optionText: "Offset directly against share capital reserves", isCorrect: false },
        ],
      },
    ],
  },

  // 4. ARTS & HUMANITIES
  {
    id: "asm-arts-01",
    title: "Critical Textual Analysis & Sociological Reasoning",
    slug: "critical-textual-analysis-sociology",
    description: "Evaluates qualitative analysis, primary source evaluation, sociological paradigms, and structured argumentative discourse.",
    stream: "ARTS_HUMANITIES",
    category: "FOUNDATION",
    targetSkillName: "Critical Analysis",
    difficultyLevel: "BEGINNER",
    minEducationStage: "CLASS_10",
    durationMinutes: 15,
    passingPercentage: 60,
    rubricCriteria: { accuracyWeight: 35, reasoningWeight: 40, applicationWeight: 25 },
    questions: [
      {
        id: "q-arts-1",
        questionOrder: 1,
        questionType: "MULTIPLE_CHOICE",
        questionText: "In historical historiography, what is the key distinction between a 'primary source' and a 'secondary source'?",
        explanation: "A primary source is an artifact, document, diary, or recording created during the exact time under study, whereas a secondary source interprets, analyzes, or synthesizes primary sources after the event.",
        points: 20,
        options: [
          { optionKey: "A", optionText: "Primary sources are always unbiased peer-reviewed articles", isCorrect: false },
          { optionKey: "B", optionText: "Primary sources originate directly from the historical period under examination", isCorrect: true },
          { optionKey: "C", optionText: "Secondary sources must always be written in the vernacular language", isCorrect: false },
          { optionKey: "D", optionText: "There is no methodological distinction between primary and secondary sources", isCorrect: false },
        ],
      },
      {
        id: "q-arts-2",
        questionOrder: 2,
        questionType: "MULTIPLE_CHOICE",
        questionText: "Which foundational sociological concept, popularized by C. Wright Mills, refers to the ability to see the relationship between individual biographical experiences and larger societal structures?",
        explanation: "The Sociological Imagination is the capacity to shift from one perspective to another—from personal troubles to public issues of social structure.",
        points: 20,
        options: [
          { optionKey: "A", optionText: "The Sociological Imagination", isCorrect: true },
          { optionKey: "B", optionText: "Mechanical Solidarity", isCorrect: false },
          { optionKey: "C", optionText: "Social Darwinism", isCorrect: false },
          { optionKey: "D", optionText: "The Panopticon Effect", isCorrect: false },
        ],
      },
      {
        id: "q-arts-3",
        questionOrder: 3,
        questionType: "SCENARIO_ANALYSIS",
        questionText: "Editorial Scenario: An essay argues that urbanization solely causes cultural erosion, ignoring economic mobility and educational access for marginalized communities. What analytical fallacy is present?",
        explanation: "By reducing a multifaceted historical phenomenon to a single negative causal claim while ignoring counter-evidence, the argument exhibits a mono-causal reductionist fallacy.",
        points: 20,
        options: [
          { optionKey: "A", optionText: "Mono-causal reductionism and selective confirmation bias", isCorrect: true },
          { optionKey: "B", optionText: "Ad hominem personal attack", isCorrect: false },
          { optionKey: "C", optionText: "Circular tautology", isCorrect: false },
          { optionKey: "D", optionText: "Equivocation error", isCorrect: false },
        ],
      },
    ],
  },

  // 5. LAW
  {
    id: "asm-law-01",
    title: "Constitutional Law & Legal Reasoning Principles",
    slug: "constitutional-law-legal-reasoning",
    description: "Test your understanding of fundamental rights under the Constitution of India, doctrine of basic structure, and principles of natural justice.",
    stream: "LAW",
    category: "SUBJECT_SPECIFIC",
    targetSkillName: "Legal Reasoning",
    difficultyLevel: "INTERMEDIATE",
    minEducationStage: "CLASS_12",
    durationMinutes: 15,
    passingPercentage: 70,
    rubricCriteria: { accuracyWeight: 50, reasoningWeight: 30, applicationWeight: 20 },
    questions: [
      {
        id: "q-law-1",
        questionOrder: 1,
        questionType: "MULTIPLE_CHOICE",
        questionText: "Under Article 21 of the Constitution of India, the landmark Supreme Court judgement in K.S. Puttaswamy v. Union of India (2017) unanimously held that:",
        explanation: "In K.S. Puttaswamy (2017), a nine-judge bench unanimously affirmed that the Right to Privacy is an intrinsic part of the Right to Life and Personal Liberty under Article 21.",
        points: 20,
        options: [
          { optionKey: "A", optionText: "Right to Privacy is merely a statutory right governed by the IT Act", isCorrect: false },
          { optionKey: "B", optionText: "Right to Privacy is a protected Fundamental Right intrinsic to Article 21", isCorrect: true },
          { optionKey: "C", optionText: "Right to property is reinstated as a fundamental right", isCorrect: false },
          { optionKey: "D", optionText: "Fundamental Rights can be amended without judicial review", isCorrect: false },
        ],
      },
      {
        id: "q-law-2",
        questionOrder: 2,
        questionType: "MULTIPLE_CHOICE",
        questionText: "Which landmark doctrine prevents Parliament from altering the core framework and values of the Indian Constitution through constitutional amendments?",
        explanation: "The Basic Structure Doctrine, established in the historic Kesavananda Bharati v. State of Kerala (1973) case, limits Parliament's amending power under Article 368.",
        points: 20,
        options: [
          { optionKey: "A", optionText: "Doctrine of Severability", isCorrect: false },
          { optionKey: "B", optionText: "Basic Structure Doctrine", isCorrect: true },
          { optionKey: "C", optionText: "Doctrine of Pith and Substance", isCorrect: false },
          { optionKey: "D", optionText: "Doctrine of Eclipse", isCorrect: false },
        ],
      },
      {
        id: "q-law-3",
        questionOrder: 3,
        questionType: "SCENARIO_ANALYSIS",
        questionText: "Legal Scenario: A government agency revokes a citizen's trade license without issuing a show-cause notice or providing an opportunity to be heard. Which fundamental principle of administrative law is violated?",
        explanation: "Audi alteram partem ('listen to the other side') is a cornerstone of natural justice requiring fair notice and an opportunity to present defense before adverse administrative action.",
        points: 20,
        options: [
          { optionKey: "A", optionText: "Audi alteram partem (Rule of Fair Hearing) under Natural Justice", isCorrect: true },
          { optionKey: "B", optionText: "Res judicata", isCorrect: false },
          { optionKey: "C", optionText: "Nemo judex in causa sua", isCorrect: false },
          { optionKey: "D", optionText: "Caveat emptor", isCorrect: false },
        ],
      },
    ],
  },

  // 6. MANAGEMENT
  {
    id: "asm-mgmt-01",
    title: "Strategic Decision-Making & Marketing Analytics",
    slug: "strategic-decision-making-marketing",
    description: "Evaluates market positioning frameworks, customer lifetime value (CLV), unit economics, and competitive advantage strategies.",
    stream: "MANAGEMENT",
    category: "DOMAIN_COMPETENCY",
    targetSkillName: "Business Strategy",
    difficultyLevel: "INTERMEDIATE",
    minEducationStage: "UNDERGRADUATE",
    durationMinutes: 15,
    passingPercentage: 65,
    rubricCriteria: { accuracyWeight: 40, reasoningWeight: 35, applicationWeight: 25 },
    questions: [
      {
        id: "q-mgmt-1",
        questionOrder: 1,
        questionType: "MULTIPLE_CHOICE",
        questionText: "In Michael Porter's Five Forces framework, which factor primarily determines the bargaining power of buyers in an industry?",
        explanation: "When buyers face low switching costs between alternative suppliers and purchase standardized products, their bargaining power is significantly amplified.",
        points: 20,
        options: [
          { optionKey: "A", optionText: "High switching costs incurred by customers when changing vendors", isCorrect: false },
          { optionKey: "B", optionText: "Low product differentiation and minimal buyer switching costs", isCorrect: true },
          { optionKey: "C", optionText: "Supplier market concentration being higher than buyer concentration", isCorrect: false },
          { optionKey: "D", optionText: "Strict patent protections held by incumbent manufacturers", isCorrect: false },
        ],
      },
      {
        id: "q-mgmt-2",
        questionOrder: 2,
        questionType: "MULTIPLE_CHOICE",
        questionText: "If a SaaS company spends ₹3,000 on digital acquisition to acquire a customer who generates ₹12,000 in gross margin over their retention lifecycle, what is the LTV:CAC ratio?",
        explanation: "Customer Lifetime Value (LTV) divided by Customer Acquisition Cost (CAC) = ₹12,000 / ₹3,000 = 4.0x. A ratio above 3.0x is widely recognized as a healthy unit economics benchmark.",
        points: 20,
        options: [
          { optionKey: "A", optionText: "1:4 (0.25x)", isCorrect: false },
          { optionKey: "B", optionText: "4:1 (4.0x)", isCorrect: true },
          { optionKey: "C", optionText: "3:1 (3.0x)", isCorrect: false },
          { optionKey: "D", optionText: "0.75x", isCorrect: false },
        ],
      },
      {
        id: "q-mgmt-3",
        questionOrder: 3,
        questionType: "SCENARIO_ANALYSIS",
        questionText: "Operations Scenario: An e-commerce startup faces rising delivery delays during festive sale spikes. Which methodology focuses on eliminating process waste (Muda) and shortening cycle times?",
        explanation: "Lean operations and Kaizen methodologies focus on identifying and eliminating non-value-adding waste to streamline throughput and reduce lead times.",
        points: 20,
        options: [
          { optionKey: "A", optionText: "Lean Operations & Continuous Improvement (Kaizen)", isCorrect: true },
          { optionKey: "B", optionText: "Predatory pricing strategy", isCorrect: false },
          { optionKey: "C", optionText: "Horizontal conglomerate diversification", isCorrect: false },
          { optionKey: "D", optionText: "Debt-financed leveraged buyout", isCorrect: false },
        ],
      },
    ],
  },

  // 7. CREATIVE ARTS & DESIGN
  {
    id: "asm-des-01",
    title: "User Experience Heuristics & Design Systems",
    slug: "ux-heuristics-design-systems",
    description: "Evaluates Nielsen Norman usability heuristics, WCAG accessibility standards, visual hierarchy, and atomic design system tokens.",
    stream: "CREATIVE_ARTS_DESIGN",
    category: "DOMAIN_COMPETENCY",
    targetSkillName: "UX/UI Design",
    difficultyLevel: "BEGINNER",
    minEducationStage: "CLASS_10",
    durationMinutes: 15,
    passingPercentage: 65,
    rubricCriteria: { accuracyWeight: 45, reasoningWeight: 35, applicationWeight: 20 },
    questions: [
      {
        id: "q-des-1",
        questionOrder: 1,
        questionType: "MULTIPLE_CHOICE",
        questionText: "Under Jakob Nielsen's 10 Usability Heuristics, what does 'Visibility of System Status' require an interface to do?",
        explanation: "Visibility of system status dictates that users should always be kept informed about what is going on, through appropriate feedback within reasonable time (e.g. progress bars, loaders).",
        points: 20,
        options: [
          { optionKey: "A", optionText: "Display backend server source code on the homepage", isCorrect: false },
          { optionKey: "B", optionText: "Keep users informed about current actions with timely and clear feedback", isCorrect: true },
          { optionKey: "C", optionText: "Prevent users from making any changes to UI preferences", isCorrect: false },
          { optionKey: "D", optionText: "Use maximal animations regardless of device performance", isCorrect: false },
        ],
      },
      {
        id: "q-des-2",
        questionOrder: 2,
        questionType: "MULTIPLE_CHOICE",
        questionText: "According to Web Content Accessibility Guidelines (WCAG 2.1 AA), what is the minimum required contrast ratio for regular body text against its background?",
        explanation: "WCAG 2.1 Level AA requires a minimum visual contrast ratio of 4.5:1 for normal text and 3:1 for large-scale text (18pt or 14pt bold).",
        points: 20,
        options: [
          { optionKey: "A", optionText: "2.0:1", isCorrect: false },
          { optionKey: "B", optionText: "4.5:1", isCorrect: true },
          { optionKey: "C", optionText: "7.0:1", isCorrect: false },
          { optionKey: "D", optionText: "10:1", isCorrect: false },
        ],
      },
      {
        id: "q-des-3",
        questionOrder: 3,
        questionType: "SCENARIO_ANALYSIS",
        questionText: "Design Scenario: A mobile checkout screen shows an error message saying 'Error 500: Invalid payload' without telling the user which field failed or how to fix it. Which design principle is violated?",
        explanation: "This violates 'Help users recognize, diagnose, and recover from errors' (expressed in plain language without tech codes, constructive remedy provided).",
        points: 20,
        options: [
          { optionKey: "A", optionText: "Help users recognize, diagnose, and recover from errors in plain language", isCorrect: true },
          { optionKey: "B", optionText: "Fitts's Law of target distance and size", isCorrect: false },
          { optionKey: "C", optionText: "Hick's Law of decision time", isCorrect: false },
          { optionKey: "D", optionText: "Skeuomorphism principle", isCorrect: false },
        ],
      },
    ],
  },

  // 8. AGRICULTURE
  {
    id: "asm-agri-01",
    title: "Agronomy Principles & Sustainable Soil Management",
    slug: "agronomy-soil-management",
    description: "Evaluates soil pH, macro-nutrient balancing (NPK), drip irrigation efficiency, and integrated pest management (IPM).",
    stream: "AGRICULTURE",
    category: "SUBJECT_SPECIFIC",
    targetSkillName: "Soil Science & Agronomy",
    difficultyLevel: "BEGINNER",
    minEducationStage: "CLASS_10",
    durationMinutes: 15,
    passingPercentage: 60,
    rubricCriteria: { accuracyWeight: 50, reasoningWeight: 30, applicationWeight: 20 },
    questions: [
      {
        id: "q-agri-1",
        questionOrder: 1,
        questionType: "MULTIPLE_CHOICE",
        questionText: "Which primary macronutrient is crucial for chlorophyll synthesis, vegetative leaf growth, and amino acid formation in crops?",
        explanation: "Nitrogen (N) is an essential constituent of protein and chlorophyll, driving vegetative growth and green foliage development.",
        points: 20,
        options: [
          { optionKey: "A", optionText: "Nitrogen (N)", isCorrect: true },
          { optionKey: "B", optionText: "Phosphorus (P)", isCorrect: false },
          { optionKey: "C", optionText: "Potassium (K)", isCorrect: false },
          { optionKey: "D", optionText: "Boron (B)", isCorrect: false },
        ],
      },
      {
        id: "q-agri-2",
        questionOrder: 2,
        questionType: "MULTIPLE_CHOICE",
        questionText: "In Integrated Pest Management (IPM), what is the first line of defense before applying chemical pesticides?",
        explanation: "IPM prioritizes preventive cultural, mechanical, and biological controls (e.g. crop rotation, resistant varieties, predatory insects) before considering chemical interventions.",
        points: 20,
        options: [
          { optionKey: "A", optionText: "Broad-spectrum synthetic organophosphate spraying", isCorrect: false },
          { optionKey: "B", optionText: "Cultural practices, crop rotation, and biological control agents", isCorrect: true },
          { optionKey: "C", optionText: "Complete soil fumigation with methyl bromide", isCorrect: false },
          { optionKey: "D", optionText: "Continuous flood irrigation", isCorrect: false },
        ],
      },
      {
        id: "q-agri-3",
        questionOrder: 3,
        questionType: "SCENARIO_ANALYSIS",
        questionText: "Field Scenario: A farmer in a water-scarce semi-arid region wishes to minimize water evaporative loss while delivering soluble nutrients directly to root zones. Which irrigation technology is most effective?",
        explanation: "Drip (micro-irrigation) systems deliver water and dissolved fertilizers (fertigation) directly to the crop root zone with efficiency exceeding 90%.",
        points: 20,
        options: [
          { optionKey: "A", optionText: "Drip irrigation with fertigation integration", isCorrect: true },
          { optionKey: "B", optionText: "Traditional flood furrow irrigation", isCorrect: false },
          { optionKey: "C", optionText: "High-pressure uncontrolled overhead sprinklers", isCorrect: false },
          { optionKey: "D", optionText: "Deep canal wild flooding", isCorrect: false },
        ],
      },
    ],
  },

  // 9. VOCATIONAL / SKILLED TRADES
  {
    id: "asm-voc-01",
    title: "Electrical Safety & Industrial Circuit Troubleshooting",
    slug: "electrical-safety-circuit-troubleshooting",
    description: "Evaluates standard safety protocols, Lockout/Tagout (LOTO), multimeter diagnostic procedures, and circuit protection devices.",
    stream: "VOCATIONAL_SKILLED",
    category: "DOMAIN_COMPETENCY",
    targetSkillName: "Electrical Systems",
    difficultyLevel: "BEGINNER",
    minEducationStage: "CLASS_8",
    durationMinutes: 15,
    passingPercentage: 65,
    rubricCriteria: { accuracyWeight: 50, reasoningWeight: 30, applicationWeight: 20 },
    questions: [
      {
        id: "q-voc-1",
        questionOrder: 1,
        questionType: "MULTIPLE_CHOICE",
        questionText: "What is the mandatory primary procedure before inspecting or repairing an energized industrial electrical panel?",
        explanation: "Lockout/Tagout (LOTO) de-energizes the circuit, isolates energy sources, and ensures no accidental re-energization can occur during maintenance.",
        points: 20,
        options: [
          { optionKey: "A", optionText: "Wearing dry cotton gloves while working live", isCorrect: false },
          { optionKey: "B", optionText: "Lockout / Tagout (LOTO) and zero-energy state verification with a calibrated meter", isCorrect: true },
          { optionKey: "C", optionText: "Touching conductor with the back of one finger to test current", isCorrect: false },
          { optionKey: "D", optionText: "Bypassing the main circuit breaker with a jumper wire", isCorrect: false },
        ],
      },
      {
        id: "q-voc-2",
        questionOrder: 2,
        questionType: "MULTIPLE_CHOICE",
        questionText: "Which electrical safety device trips automatically when it detects a small leakage of current to ground (e.g., 30mA) to protect humans against fatal electric shock?",
        explanation: "A Residual Current Circuit Breaker (RCCB) or Earth Leakage Circuit Breaker (ELCB) detects imbalance between phase and neutral currents and trips within milliseconds.",
        points: 20,
        options: [
          { optionKey: "A", optionText: "Standard rewireable fuse wire", isCorrect: false },
          { optionKey: "B", optionText: "Residual Current Circuit Breaker (RCCB / RCD)", isCorrect: true },
          { optionKey: "C", optionText: "Step-up autotransformer", isCorrect: false },
          { optionKey: "D", optionText: "Knife switch", isCorrect: false },
        ],
      },
      {
        id: "q-voc-3",
        questionOrder: 3,
        questionType: "SCENARIO_ANALYSIS",
        questionText: "Diagnostic Scenario: An induction motor hums loudly but fails to rotate when switched on. A technician measures zero voltage on one phase while the other two are normal. What is the diagnosis?",
        explanation: "This condition is known as 'single-phasing', where one phase is lost due to a blown fuse or loose connection, causing high current in remaining phases and stalling.",
        points: 20,
        options: [
          { optionKey: "A", optionText: "Single-phasing condition due to an open phase conductor or blown fuse", isCorrect: true },
          { optionKey: "B", optionText: "Motor is running at excessive synchronous speed", isCorrect: false },
          { optionKey: "C", optionText: "Bearing lubrication is excessively high", isCorrect: false },
          { optionKey: "D", optionText: "Inverted neutral wire connection", isCorrect: false },
        ],
      },
    ],
  },

  // 10. SPORTS & PHYSICAL EDUCATION
  {
    id: "asm-sport-01",
    title: "Exercise Physiology & Athletic Conditioning Principles",
    slug: "exercise-physiology-conditioning",
    description: "Evaluates energy systems (ATP-PC, Glycolytic, Aerobic), periodization models, injury prevention, and athletic recovery protocols.",
    stream: "SPORTS",
    category: "SUBJECT_SPECIFIC",
    targetSkillName: "Sports Physiology",
    difficultyLevel: "BEGINNER",
    minEducationStage: "CLASS_10",
    durationMinutes: 15,
    passingPercentage: 60,
    rubricCriteria: { accuracyWeight: 45, reasoningWeight: 35, applicationWeight: 20 },
    questions: [
      {
        id: "q-sport-1",
        questionOrder: 1,
        questionType: "MULTIPLE_CHOICE",
        questionText: "Which metabolic energy system is the primary source of adenosine triphosphate (ATP) during an all-out 100-meter sprint lasting under 10 seconds?",
        explanation: "The Phosphagen (ATP-PCr) system supplies immediate maximal energy without oxygen for explosive physical bursts lasting up to 10 seconds.",
        points: 20,
        options: [
          { optionKey: "A", optionText: "Aerobic oxidative phosphorylation", isCorrect: false },
          { optionKey: "B", optionText: "Phosphagen (ATP-PCr / Creatine Phosphate) system", isCorrect: true },
          { optionKey: "C", optionText: "Beta-oxidation of free fatty acids", isCorrect: false },
          { optionKey: "D", optionText: "Gluconeogenesis in the liver", isCorrect: false },
        ],
      },
      {
        id: "q-sport-2",
        questionOrder: 2,
        questionType: "MULTIPLE_CHOICE",
        questionText: "What does the 'RICE' / 'PRICE' protocol stand for in acute sports injury first aid management?",
        explanation: "PRICE stands for Protect, Rest, Ice, Compression, and Elevation, aimed at limiting inflammation and secondary tissue damage in acute soft-tissue sprains.",
        points: 20,
        options: [
          { optionKey: "A", optionText: "Push, Run, Incline, Check, Exercise", isCorrect: false },
          { optionKey: "B", optionText: "Protect, Rest, Ice, Compress, Elevate", isCorrect: true },
          { optionKey: "C", optionText: "Pull, Reheat, Ingest, Cool, Extend", isCorrect: false },
          { optionKey: "D", optionText: "Plan, React, Inject, Clamp, Evaluate", isCorrect: false },
        ],
      },
      {
        id: "q-sport-3",
        questionOrder: 3,
        questionType: "SCENARIO_ANALYSIS",
        questionText: "Training Scenario: A middle-distance runner exhibits persistent elevated resting heart rate, chronic fatigue, and performance decline despite increasing training volume. What condition should be addressed?",
        explanation: "Overtraining Syndrome (OTS) results from prolonged imbalance between excessive training stress and inadequate physiological recovery, requiring rest and volume periodization.",
        points: 20,
        options: [
          { optionKey: "A", optionText: "Overtraining Syndrome requiring active deload, sleep optimization, and caloric rest", isCorrect: true },
          { optionKey: "B", optionText: "Under-training requiring doubling daily track intervals immediately", isCorrect: false },
          { optionKey: "C", optionText: "Normal adaptation requiring no schedule changes", isCorrect: false },
          { optionKey: "D", optionText: "Excessive carbohydrate intake requiring fasting", isCorrect: false },
        ],
      },
    ],
  },

  // 11. HOSPITALITY & TOURISM
  {
    id: "asm-hosp-01",
    title: "Hospitality Operations & Guest Service Excellence",
    slug: "hospitality-operations-service-excellence",
    description: "Evaluates front-office management, food safety standards (HACCP), guest conflict resolution, and revenue management metrics.",
    stream: "HOSPITALITY_TOURISM",
    category: "DOMAIN_COMPETENCY",
    targetSkillName: "Guest Relations & Operations",
    difficultyLevel: "BEGINNER",
    minEducationStage: "CLASS_10",
    durationMinutes: 15,
    passingPercentage: 65,
    rubricCriteria: { accuracyWeight: 40, reasoningWeight: 40, applicationWeight: 20 },
    questions: [
      {
        id: "q-hosp-1",
        questionOrder: 1,
        questionType: "MULTIPLE_CHOICE",
        questionText: "What does the critical hotel revenue metric 'RevPAR' stand for and how is it calculated?",
        explanation: "RevPAR stands for Revenue Per Available Room, calculated either by multiplying Average Daily Rate (ADR) by Occupancy Rate, or total room revenue divided by total available rooms.",
        points: 20,
        options: [
          { optionKey: "A", optionText: "Revenue Per Allocated Restaurant (Dining revenue divided by tables)", isCorrect: false },
          { optionKey: "B", optionText: "Revenue Per Available Room (Average Daily Rate × Occupancy Percentage)", isCorrect: true },
          { optionKey: "C", optionText: "Return on Expense Per Added Reservation", isCorrect: false },
          { optionKey: "D", optionText: "Reservation Value Per Active Resident", isCorrect: false },
        ],
      },
      {
        id: "q-hosp-2",
        questionOrder: 2,
        questionType: "MULTIPLE_CHOICE",
        questionText: "In culinary and food production hygiene, what is the temperature 'Danger Zone' where bacteria multiply most rapidly?",
        explanation: "The food temperature Danger Zone is widely defined between 5°C and 60°C (41°F to 140°F), where pathogenic bacterial proliferation occurs rapidly.",
        points: 20,
        options: [
          { optionKey: "A", optionText: "-18°C to 0°C", isCorrect: false },
          { optionKey: "B", optionText: "5°C to 60°C (41°F to 140°F)", isCorrect: true },
          { optionKey: "C", optionText: "75°C to 100°C", isCorrect: false },
          { optionKey: "D", optionText: "Above 120°C", isCorrect: false },
        ],
      },
      {
        id: "q-hosp-3",
        questionOrder: 3,
        questionType: "SCENARIO_ANALYSIS",
        questionText: "Service Scenario: An agitated guest approaches the front desk complaining their booked room is not ready 45 minutes past guaranteed check-in time. What is the professional service recovery sequence?",
        explanation: "Service recovery frameworks (such as LAST: Listen, Apologize, Solve, Thank) require empathetic active listening, sincere acknowledgement, an immediate remedy (complimentary lounge/refreshment & priority room readiness), and proactive follow-through.",
        points: 20,
        options: [
          { optionKey: "A", optionText: "Listen empathetically, apologize genuinely, provide complimentary lounge access/refreshments, and expedite housekeeping with proactive manager follow-up", isCorrect: true },
          { optionKey: "B", optionText: "Inform the guest that delays happen everywhere and request them to wait outside", isCorrect: false },
          { optionKey: "C", optionText: "Blame the housekeeping staff directly in front of the guest", isCorrect: false },
          { optionKey: "D", optionText: "Cancel the reservation immediately without guest consent", isCorrect: false },
        ],
      },
    ],
  },

  // 12. INTERDISCIPLINARY
  {
    id: "asm-inter-01",
    title: "Data-Driven Public Policy & Interdisciplinary Problem Solving",
    slug: "data-driven-public-policy",
    description: "Evaluates intersection of data analytics, behavioural economics, socio-legal ethics, and public policy formulation.",
    stream: "INTERDISCIPLINARY",
    category: "LOGICAL_REASONING",
    targetSkillName: "Interdisciplinary Problem Solving",
    difficultyLevel: "INTERMEDIATE",
    minEducationStage: "UNDERGRADUATE",
    durationMinutes: 15,
    passingPercentage: 65,
    rubricCriteria: { accuracyWeight: 40, reasoningWeight: 35, applicationWeight: 25 },
    questions: [
      {
        id: "q-inter-1",
        questionOrder: 1,
        questionType: "MULTIPLE_CHOICE",
        questionText: "In behavioural economics and public policy design, what is a 'Nudge' as conceptualized by Thaler and Sunstein?",
        explanation: "A nudge alters people's behaviour in a predictable way without forbidding any options or significantly changing their economic incentives (e.g. setting green energy as default).",
        points: 20,
        options: [
          { optionKey: "A", optionText: "A mandatory penal law carrying criminal sanctions for non-compliance", isCorrect: false },
          { optionKey: "B", optionText: "An alteration in choice architecture that steers decisions without forbidding choices or altering financial payoffs", isCorrect: true },
          { optionKey: "C", optionText: "A direct cash subsidy paid to private corporations", isCorrect: false },
          { optionKey: "D", optionText: "A complete ban on advertising consumer goods", isCorrect: false },
        ],
      },
      {
        id: "q-inter-2",
        questionOrder: 2,
        questionType: "MULTIPLE_CHOICE",
        questionText: "When evaluating public health interventions using observational datasets, what does 'Selection Bias' refer to?",
        explanation: "Selection bias occurs when the individuals selected into the treatment group systematically differ in baseline health or socioeconomic characteristics from the comparison group.",
        points: 20,
        options: [
          { optionKey: "A", optionText: "Systematic differences between treatment and comparison groups that confound the observed outcomes", isCorrect: true },
          { optionKey: "B", optionText: "Simple typographical errors in data entry forms", isCorrect: false },
          { optionKey: "C", optionText: "Choosing a fast programming language over a slow one", isCorrect: false },
          { optionKey: "D", optionText: "Random fluctuation that cancels out over large sample sizes", isCorrect: false },
        ],
      },
      {
        id: "q-inter-3",
        questionOrder: 3,
        questionType: "SCENARIO_ANALYSIS",
        questionText: "Policy Scenario: A smart city uses AI to predict traffic congestion but discovers the model routes heavy vehicles through narrow historical school zones. What ethical governance framework must be enforced?",
        explanation: "Algorithmic impact assessments and multi-stakeholder safety constraints must override pure optimization metrics when pedestrian safety and civic infrastructure are impacted.",
        points: 20,
        options: [
          { optionKey: "A", optionText: "Enforce algorithmic safety constraints, environmental impact audits, and pedestrian protection guardrails", isCorrect: true },
          { optionKey: "B", optionText: "Ignore the school zone routes since traffic travel time was minimized", isCorrect: false },
          { optionKey: "C", optionText: "Demolish the school zone buildings to widen the streets for trucks", isCorrect: false },
          { optionKey: "D", optionText: "Hide the model's routing logs from civic oversight", isCorrect: false },
        ],
      },
    ],
  },

  // 13. UNDECIDED / FOUNDATIONAL
  {
    id: "asm-undec-01",
    title: "Universal Logical Reasoning & Aptitude Diagnostic",
    slug: "universal-logical-reasoning",
    description: "Evaluates deductive reasoning, quantitative estimation, pattern synthesis, and evidence-based decision-making for any educational stream.",
    stream: "UNDECIDED",
    category: "FOUNDATION",
    targetSkillName: "Critical Problem Solving",
    difficultyLevel: "BEGINNER",
    minEducationStage: "CLASS_8",
    durationMinutes: 15,
    passingPercentage: 60,
    rubricCriteria: { accuracyWeight: 50, reasoningWeight: 30, applicationWeight: 20 },
    questions: [
      {
        id: "q-undec-1",
        questionOrder: 1,
        questionType: "MULTIPLE_CHOICE",
        questionText: "Premise 1: All innovative architects understand structural integrity.\nPremise 2: Some software engineers are innovative architects.\nConclusion: Which deduction must logically follow?",
        explanation: "Because some software engineers belong to the set of innovative architects, and all members of that set understand structural integrity, some software engineers must understand structural integrity.",
        points: 20,
        options: [
          { optionKey: "A", optionText: "All software engineers understand structural integrity", isCorrect: false },
          { optionKey: "B", optionText: "Some software engineers understand structural integrity", isCorrect: true },
          { optionKey: "C", optionText: "No software engineer understands structural integrity", isCorrect: false },
          { optionKey: "D", optionText: "Architects never write software code", isCorrect: false },
        ],
      },
      {
        id: "q-undec-2",
        questionOrder: 2,
        questionType: "MULTIPLE_CHOICE",
        questionText: "If the price of a study book is first increased by 20% and then subsequently discounted by 20%, what is the net percentage change relative to the initial price?",
        explanation: "Let initial price = 100. After 20% increase = 120. After 20% discount on 120 = 120 - 24 = 96. Net change = (96 - 100) / 100 = 4% decrease.",
        points: 20,
        options: [
          { optionKey: "A", optionText: "0% change (price remains unchanged)", isCorrect: false },
          { optionKey: "B", optionText: "4% net decrease", isCorrect: true },
          { optionKey: "C", optionText: "2% net increase", isCorrect: false },
          { optionKey: "D", optionText: "10% net decrease", isCorrect: false },
        ],
      },
      {
        id: "q-undec-3",
        questionOrder: 3,
        questionType: "SCENARIO_ANALYSIS",
        questionText: "Diagnostic Scenario: You are tasked with deciding between two career options: Career A has high immediate pay but low growth, while Career B has lower starting pay but quadruples in demand over 5 years. What analytical tool assists this trade-off?",
        explanation: "Net Present Value (NPV) or compound growth forecasting evaluates time-discounted future returns against short-term trade-offs.",
        points: 20,
        options: [
          { optionKey: "A", optionText: "Long-term horizon compound utility and opportunity-cost analysis", isCorrect: true },
          { optionKey: "B", optionText: "Relying purely on gut instinct without looking at growth trajectories", isCorrect: false },
          { optionKey: "C", optionText: "Assuming the first year salary never changes in any career", isCorrect: false },
          { optionKey: "D", optionText: "Choosing at random with a coin flip", isCorrect: false },
        ],
      },
    ],
  },
];
