import { CareerRole } from '../data/roles';
import { SkillMathBreakdown } from './scoringEngine';

export interface RoadmapTask {
  id: string;
  title: string;
  completed: boolean;
  hours: number;
}

export interface RoadmapResource {
  name: string;
  url: string;
  type: 'Interactive' | 'Course' | 'Practice' | 'Docs';
  tag: string;
}

export interface RoadmapWeek {
  id: string;
  weekLabel: string; // e.g. "Week 1", "Week 1b", "Week 2"
  displayOrder: number;
  title: string;
  focusSkill: string;
  objective: string;
  estimatedHours: number;
  tasks: RoadmapTask[];
  resources: RoadmapResource[];
  quizSkill: string;
  isReinforcement: boolean;
  status: 'locked' | 'unlocked' | 'review_recommended' | 'completed';
  quizResult?: {
    score: number;
    total: number;
    percentage: number;
    passed: boolean;
    timestamp: string;
  };
}

export const CURATED_RESOURCES: Record<string, RoadmapResource[]> = {
  'SQL': [
    { name: 'SQLBolt (Interactive Browser Exercises)', url: 'https://sqlbolt.com/', type: 'Interactive', tag: 'Hands-on Drills' },
    { name: 'Mode SQL Tutorial for Data Analysis', url: 'https://mode.com/sql-tutorial/', type: 'Course', tag: 'Industry Standard' },
    { name: 'Kaggle Learn: Advanced SQL & BigQuery', url: 'https://www.kaggle.com/learn/advanced-sql', type: 'Practice', tag: 'Real Datasets' }
  ],
  'Python': [
    { name: 'Kaggle Python Micro-Course', url: 'https://www.kaggle.com/learn/python', type: 'Interactive', tag: 'Fast-Track' },
    { name: 'Pandas Official 10-Minute Guide', url: 'https://pandas.pydata.org/docs/user_guide/10min.html', type: 'Docs', tag: 'Official Reference' },
    { name: 'freeCodeCamp: Data Analysis with Python', url: 'https://www.freecodecamp.org/learn/data-analysis-with-python/', type: 'Course', tag: 'Free Certification' }
  ],
  'Statistics': [
    { name: 'Khan Academy: Statistics & Probability', url: 'https://www.khanacademy.org/math/statistics-probability', type: 'Course', tag: 'Conceptual Clarity' },
    { name: 'Seeing Theory: Visual Intro to Probability', url: 'https://seeing-theory.brown.edu/', type: 'Interactive', tag: 'Visual Learning' },
    { name: 'StatQuest with Josh Starmer (YouTube)', url: 'https://www.youtube.com/c/joshstarmer', type: 'Course', tag: 'Best Intuition' }
  ],
  'Excel': [
    { name: 'Excel Easy: Functions & Formulas', url: 'https://www.excel-easy.com/', type: 'Interactive', tag: 'Step-by-step' },
    { name: 'Chandoo: Advanced Pivot Tables & Lookups', url: 'https://chandoo.org/', type: 'Course', tag: 'Business Case Studies' },
    { name: 'Corporate Finance Institute (CFI) Free Excel Crash Course', url: 'https://corporatefinanceinstitute.com/course/free-excel-crash-course-for-finance/', type: 'Course', tag: 'Wall Street Grade' }
  ],
  'React': [
    { name: 'React.dev: Quick Start & Interactive Tutorials', url: 'https://react.dev/learn', type: 'Docs', tag: 'Official Modern React' },
    { name: 'Scrimba: Learn React for Free', url: 'https://scrimba.com/learn/learnreact', type: 'Interactive', tag: 'In-Browser Editor' },
    { name: 'freeCodeCamp: Frontend Development Libraries', url: 'https://www.freecodecamp.org/learn/front-end-development-libraries/', type: 'Course', tag: 'Comprehensive' }
  ],
  'JavaScript': [
    { name: 'javascript.info: The Modern JavaScript Tutorial', url: 'https://javascript.info/', type: 'Docs', tag: 'Deep Dive' },
    { name: 'MDN Web Docs: JavaScript Fundamentals', url: 'https://developer.mozilla.org/en-US/docs/Learn/JavaScript', type: 'Docs', tag: 'Standard Reference' },
    { name: 'Exercism JavaScript Practice Track', url: 'https://exercism.org/tracks/javascript', type: 'Practice', tag: 'Mentored Exercises' }
  ],
  'Communication': [
    { name: 'Barbara Minto: The Pyramid Principle Summary', url: 'https://untools.co/minto-pyramid/', type: 'Docs', tag: 'Executive Synthesis' },
    { name: 'Harvard Business Review: How to Tell a Story with Data', url: 'https://hbr.org/2013/04/how-to-tell-a-story-with-data', type: 'Docs', tag: 'Leadership Insights' },
    { name: 'Toastmasters Public Speaking & Delivery Tips', url: 'https://www.toastmasters.org/resources/public-speaking-tips', type: 'Practice', tag: 'Confidence & Delivery' }
  ],
  'Projects': [
    { name: 'Open Government Data Platform India (data.gov.in)', url: 'https://data.gov.in/', type: 'Practice', tag: 'Authentic Indian Data' },
    { name: 'GitHub: Awesome Public Datasets', url: 'https://github.com/awesomedata/awesome-public-datasets', type: 'Practice', tag: 'Free Datasets' },
    { name: 'Google XYZ Resume Formula Guide', url: 'https://www.inc.com/bill-murphy-jr/google-recruiters-say-these-5-words-are-secret-to-a-perfect-resume.html', type: 'Docs', tag: 'Resume Impact' }
  ]
};

export function getResourcesForSkill(skillName: string): RoadmapResource[] {
  if (CURATED_RESOURCES[skillName]) {
    return CURATED_RESOURCES[skillName];
  }
  return [
    { name: `${skillName} Official Documentation & Guides`, url: 'https://developer.mozilla.org/', type: 'Docs', tag: 'Official Reference' },
    { name: `Kaggle & freeCodeCamp Practice Community`, url: 'https://www.kaggle.com/learn', type: 'Practice', tag: 'Community Exercises' },
    { name: `GitHub Open Source Implementations`, url: 'https://github.com/', type: 'Course', tag: 'Real Codebases' }
  ];
}

/**
 * Generates an adaptive 4-week roadmap based on skill-gap priorities & weekly study hours
 */
export function generateAdaptiveRoadmap(
  role: CareerRole,
  rankedGaps: SkillMathBreakdown[],
  weeklyHours: number = 10
): RoadmapWeek[] {
  // Filter gaps that need attention, or fallback to the top requirements
  const skillsToAddress = [...rankedGaps];
  
  // If user is already near target on everything, focus on high-weight portfolio and advanced topics
  if (skillsToAddress.length < 4) {
    role.skillRequirements.forEach(req => {
      if (!skillsToAddress.some(s => s.skill === req.skill)) {
        skillsToAddress.push({
          skill: req.skill,
          current: 70,
          required: req.required,
          weight: req.weight,
          ratio: 1,
          cappedRatio: 1,
          contribution: req.weight,
          gap: 15,
          importance: req.importance,
          priority: 2.0
        });
      }
    });
  }

  // Handle prerequisites: if skill B requires skill A, ensure skill A comes first
  const orderedSkills: string[] = [];
  const reqMap = new Map(role.skillRequirements.map(r => [r.skill, r]));

  // Build list by priority while respecting prerequisites
  for (const item of skillsToAddress) {
    const req = reqMap.get(item.skill);
    if (req?.prerequisite && !orderedSkills.includes(req.prerequisite)) {
      orderedSkills.push(req.prerequisite);
    }
    if (!orderedSkills.includes(item.skill)) {
      orderedSkills.push(item.skill);
    }
    if (orderedSkills.length >= 4) break;
  }

  // Fill remaining slots up to 4 weeks
  for (const req of role.skillRequirements) {
    if (orderedSkills.length >= 4) break;
    if (!orderedSkills.includes(req.skill)) {
      orderedSkills.push(req.skill);
    }
  }

  // Generate 4 structured weeks
  const weeks: RoadmapWeek[] = orderedSkills.slice(0, 4).map((skillName, idx) => {
    const weekNum = idx + 1;
    const req = reqMap.get(skillName);
    const gapItem = rankedGaps.find(g => g.skill === skillName);
    const gapAmount = gapItem ? gapItem.gap : 20;

    // Scale task hours to sum roughly to weeklyHours
    const hourBudget = Math.max(6, Math.min(25, weeklyHours));
    const h1 = Math.round(hourBudget * 0.3);
    const h2 = Math.round(hourBudget * 0.35);
    const h3 = Math.max(1, hourBudget - h1 - h2);

    let title = `Week ${weekNum}: ${skillName} Core Competency`;
    let objective = `Master key fundamentals of ${skillName} and bridge the ${gapAmount} pt gap required for entry-level ${role.title}.`;
    let tasks: RoadmapTask[] = [];

    if (skillName === 'SQL') {
      title = `Week ${weekNum}: SQL Analytical Joins & Subqueries`;
      objective = `Master multi-table relational joins, GROUP BY aggregations, and CTEs on real transactional data schemas.`;
      tasks = [
        { id: `w${weekNum}-t1`, title: 'Complete SQLBolt interactive lessons 1 through 12 (SELECT, WHERE, JOINs)', completed: false, hours: h1 },
        { id: `w${weekNum}-t2`, title: 'Solve 5 practical query drills on Mode Analytics (HAVING, CASE WHEN, GROUP BY)', completed: false, hours: h2 },
        { id: `w${weekNum}-t3`, title: 'Write 3 complex analytical queries using Common Table Expressions (CTEs)', completed: false, hours: h3 }
      ];
    } else if (skillName === 'Python') {
      title = `Week ${weekNum}: Python & Pandas Data Analysis`;
      objective = `Build fluency in pandas DataFrame operations, data cleaning, missing value imputation, and exploratory analysis.`;
      tasks = [
        { id: `w${weekNum}-t1`, title: 'Complete Kaggle Learn Pandas tutorial (indexing, grouping, sorting)', completed: false, hours: h1 },
        { id: `w${weekNum}-t2`, title: 'Clean a messy 10,000-row CSV dataset (handle nulls, string stripping, type casting)', completed: false, hours: h2 },
        { id: `w${weekNum}-t3`, title: 'Generate descriptive statistics & distribution plots using seaborn/matplotlib', completed: false, hours: h3 }
      ];
    } else if (skillName === 'Statistics') {
      title = `Week ${weekNum}: Applied Statistics & Hypothesis Testing`;
      objective = `Understand probability distributions, p-value calculations, confidence intervals, and A/B test results.`;
      tasks = [
        { id: `w${weekNum}-t1`, title: 'Work through Khan Academy probability distributions and central limit theorem', completed: false, hours: h1 },
        { id: `w${weekNum}-t2`, title: 'Perform two-sample t-tests and Chi-Square tests in Python / Excel on sample cohorts', completed: false, hours: h2 },
        { id: `w${weekNum}-t3`, title: 'Draft a 1-page statistical summary explaining p-value results in plain business English', completed: false, hours: h3 }
      ];
    } else if (skillName === 'Excel') {
      title = `Week ${weekNum}: Excel Lookups & Interactive MIS Modeling`;
      objective = `Build rock-solid automated spreadsheets with dynamic XLOOKUP, nested logic, and pivot tables.`;
      tasks = [
        { id: `w${weekNum}-t1`, title: 'Master modern formulas: XLOOKUP, INDEX/MATCH, SUMIFS, and dynamic array formulas', completed: false, hours: h1 },
        { id: `w${weekNum}-t2`, title: 'Build a multi-tab business MIS tracker with Pivot Tables and interactive slicers', completed: false, hours: h2 },
        { id: `w${weekNum}-t3`, title: 'Conduct What-If analysis (Goal Seek & Data Tables) for revenue scenarios', completed: false, hours: h3 }
      ];
    } else if (skillName === 'React') {
      title = `Week ${weekNum}: React Hooks & State Architecture`;
      objective = `Build interactive, responsive UI components with clean state management and REST API integrations.`;
      tasks = [
        { id: `w${weekNum}-t1`, title: 'Read React.dev: Learn state management, lifting state up, and custom hooks', completed: false, hours: h1 },
        { id: `w${weekNum}-t2`, title: 'Build a responsive filtering dashboard with live search and optimistic updates', completed: false, hours: h2 },
        { id: `w${weekNum}-t3`, title: 'Integrate real async API fetching with error handling and loading skeletons', completed: false, hours: h3 }
      ];
    } else if (skillName === 'Projects') {
      title = `Week ${weekNum}: Capstone Project & Google XYZ Resume Bullets`;
      objective = `Package an end-to-end portfolio project with a public GitHub repo, live demo link, and impact metrics.`;
      tasks = [
        { id: `w${weekNum}-t1`, title: 'Select a real-world Indian dataset (from data.gov.in or Kaggle) and formulate 3 business questions', completed: false, hours: h1 },
        { id: `w${weekNum}-t2`, title: 'Deploy a clean dashboard or web demo on Vercel/Streamlit with full README documentation', completed: false, hours: h2 },
        { id: `w${weekNum}-t3`, title: 'Rewrite 3 resume bullet points following Google XYZ formula ("Accomplished [X] measured by [Y] by doing [Z]")', completed: false, hours: h3 }
      ];
    } else {
      tasks = [
        { id: `w${weekNum}-t1`, title: `Complete curated drills covering core principles of ${skillName}`, completed: false, hours: h1 },
        { id: `w${weekNum}-t2`, title: `Implement a practical mini-deliverable or case study utilizing ${skillName}`, completed: false, hours: h2 },
        { id: `w${weekNum}-t3`, title: `Document your methodology, edge cases handled, and key takeaways`, completed: false, hours: h3 }
      ];
    }

    return {
      id: `w${weekNum}`,
      weekLabel: `Week ${weekNum}`,
      displayOrder: weekNum,
      title,
      focusSkill: skillName,
      objective,
      estimatedHours: hourBudget,
      tasks,
      resources: getResourcesForSkill(skillName),
      quizSkill: skillName,
      isReinforcement: false,
      status: weekNum === 1 ? 'unlocked' : 'locked'
    };
  });

  return weeks;
}

/**
 * Inserts a dedicated Reinforcement Week when student scores < 60% on a checkpoint quiz.
 * Shifts subsequent weeks down and locks them until reinforcement is conquered!
 */
export function insertReinforcementWeek(
  currentRoadmap: RoadmapWeek[],
  failedWeekIndex: number,
  failedSkill: string
): RoadmapWeek[] {
  const updated = [...currentRoadmap];
  const originalWeek = updated[failedWeekIndex];

  // Check if reinforcement already exists immediately after
  const nextItem = updated[failedWeekIndex + 1];
  if (nextItem && nextItem.isReinforcement && nextItem.focusSkill === failedSkill) {
    // Already inserted; reset its status to unlocked so student can retry
    nextItem.status = 'unlocked';
    return updated;
  }

  const reinforcementWeek: RoadmapWeek = {
    id: `${originalWeek.id}b-reinforce`,
    weekLabel: `${originalWeek.weekLabel}b`,
    displayOrder: originalWeek.displayOrder + 0.5,
    title: `${originalWeek.weekLabel}b: ${failedSkill} Foundations Reinforcement`,
    focusSkill: failedSkill,
    objective: `Score was below 60%. KAABIL added this focused drill week to cement fundamental mental models before you advance.`,
    estimatedHours: Math.max(5, Math.round(originalWeek.estimatedHours * 0.7)),
    tasks: [
      { id: `${originalWeek.id}b-t1`, title: `Review foundational syntax and core misconceptions in ${failedSkill}`, completed: false, hours: 2 },
      { id: `${originalWeek.id}b-t2`, title: `Hand-trace and solve 5 beginner-to-intermediate problem walkthroughs`, completed: false, hours: 2 },
      { id: `${originalWeek.id}b-t3`, title: `Self-explain the quiz questions you missed without looking at solutions`, completed: false, hours: 1 }
    ],
    resources: [
      ...getResourcesForSkill(failedSkill),
      { name: `${failedSkill} Beginner Crash Course & Mental Models`, url: 'https://youtube.com', type: 'Course', tag: 'Remediation' }
    ],
    quizSkill: failedSkill,
    isReinforcement: true,
    status: 'unlocked'
  };

  // Insert right after the failed week
  updated.splice(failedWeekIndex + 1, 0, reinforcementWeek);

  // Lock all subsequent weeks
  for (let i = failedWeekIndex + 2; i < updated.length; i++) {
    updated[i].status = 'locked';
  }

  return updated;
}
