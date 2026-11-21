export interface CanonicalSkill {
  id: string;
  name: string;
  category: 'core' | 'tool' | 'soft' | 'domain';
  defaultProficiency: number;
  aliases: string[];
}

export const CANONICAL_SKILLS: CanonicalSkill[] = [
  {
    id: 'python',
    name: 'Python',
    category: 'core',
    defaultProficiency: 60,
    aliases: ['python', 'py', 'python3', 'pandas', 'numpy', 'scipy', 'matplotlib', 'seaborn', 'jupyter', 'pyspark']
  },
  {
    id: 'sql',
    name: 'SQL',
    category: 'core',
    defaultProficiency: 50,
    aliases: ['sql', 'mysql', 'postgres', 'postgresql', 'sqlite', 'sql queries', 'dbms', 'rdbms', 'tsql', 'plsql', 'database management']
  },
  {
    id: 'statistics',
    name: 'Statistics',
    category: 'core',
    defaultProficiency: 45,
    aliases: ['statistics', 'stats', 'probability', 'hypothesis testing', 'inferential statistics', 'statistical analysis', 'linear regression', 'anova', 'p-value', 'bayes']
  },
  {
    id: 'excel',
    name: 'Excel',
    category: 'tool',
    defaultProficiency: 65,
    aliases: ['excel', 'ms excel', 'microsoft excel', 'spreadsheets', 'vlookup', 'xlookup', 'pivot tables', 'index match', 'google sheets']
  },
  {
    id: 'power-bi',
    name: 'Power BI',
    category: 'tool',
    defaultProficiency: 40,
    aliases: ['power bi', 'powerbi', 'dax', 'power query', 'pbi', 'microsoft power bi']
  },
  {
    id: 'tableau',
    name: 'Tableau',
    category: 'tool',
    defaultProficiency: 40,
    aliases: ['tableau', 'tableau desktop', 'tableau public', 'data visualization']
  },
  {
    id: 'react',
    name: 'React',
    category: 'core',
    defaultProficiency: 55,
    aliases: ['react', 'reactjs', 'react.js', 'redux', 'next.js', 'nextjs', 'react hooks', 'jsx', 'frontend framework']
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    category: 'core',
    defaultProficiency: 60,
    aliases: ['javascript', 'js', 'es6', 'es6+', 'vanilla js', 'ecmascript', 'typescript', 'ts']
  },
  {
    id: 'fastapi',
    name: 'FastAPI',
    category: 'tool',
    defaultProficiency: 45,
    aliases: ['fastapi', 'fast api', 'pydantic', 'uvicorn', 'asyncio', 'flask', 'django', 'backend api']
  },
  {
    id: 'git',
    name: 'Git',
    category: 'tool',
    defaultProficiency: 55,
    aliases: ['git', 'github', 'version control', 'gitlab', 'git bash', 'pull requests', 'git branches']
  },
  {
    id: 'communication',
    name: 'Communication',
    category: 'soft',
    defaultProficiency: 65,
    aliases: ['communication', 'comm', 'presentations', 'public speaking', 'interpersonal skills', 'client communication', 'presentation skills', 'documentation', 'written communication']
  },
  {
    id: 'financial-modeling',
    name: 'Financial Modeling',
    category: 'core',
    defaultProficiency: 40,
    aliases: ['financial modeling', 'dcf', 'discounted cash flow', 'valuation', 'financial projections', '3 statement model', 'financial analysis', 'corporate finance']
  },
  {
    id: 'product-thinking',
    name: 'Product Thinking',
    category: 'domain',
    defaultProficiency: 45,
    aliases: ['product thinking', 'prd', 'product management', 'user stories', 'wireframing', 'user journeys', 'rice framework', 'customer empathy', 'feature prioritisation']
  },
  {
    id: 'process-optimization',
    name: 'Process Optimization',
    category: 'domain',
    defaultProficiency: 50,
    aliases: ['process optimization', 'process improvement', 'sop', 'six sigma', 'sla management', 'operations workflow', 'lean', 'bottleneck analysis']
  },
  {
    id: 'digital-marketing',
    name: 'Digital Marketing & Ads',
    category: 'core',
    defaultProficiency: 50,
    aliases: ['digital marketing', 'performance marketing', 'google ads', 'meta ads', 'facebook ads', 'ad campaigns', 'roas', 'cac', 'sem', 'ppc']
  },
  {
    id: 'seo-content',
    name: 'SEO & Content',
    category: 'core',
    defaultProficiency: 50,
    aliases: ['seo', 'search engine optimization', 'content writing', 'copywriting', 'keyword research', 'blogging', 'on-page seo', 'backlinks', 'ahrefs', 'semrush']
  },
  {
    id: 'accounting-finance',
    name: 'Accounting & Finance',
    category: 'domain',
    defaultProficiency: 50,
    aliases: ['accounting', 'finance', 'p&l', 'balance sheet', 'cash flow', 'gaap', 'financial statements', 'ratio analysis', 'working capital']
  },
  {
    id: 'projects',
    name: 'Projects',
    category: 'domain',
    defaultProficiency: 40,
    aliases: ['projects', 'academic project', 'capstone', 'portfolio', 'case studies', 'github repo', 'live demo', 'internship project']
  },
  {
    id: 'problem-solving',
    name: 'Problem Solving',
    category: 'soft',
    defaultProficiency: 65,
    aliases: ['problem solving', 'analytical skills', 'critical thinking', 'logical reasoning', 'root cause analysis', 'troubleshooting']
  },
  {
    id: 'data-structures',
    name: 'Data Structures & Algorithms',
    category: 'core',
    defaultProficiency: 50,
    aliases: ['data structures', 'dsa', 'algorithms', 'leetcode', 'trees', 'graphs', 'dynamic programming', 'arrays']
  },
  {
    id: 'machine-learning',
    name: 'Machine Learning',
    category: 'core',
    defaultProficiency: 45,
    aliases: ['machine learning', 'ml', 'scikit-learn', 'sklearn', 'regression', 'classification', 'random forest', 'deep learning']
  },
  {
    id: 'docker',
    name: 'Docker',
    category: 'tool',
    defaultProficiency: 40,
    aliases: ['docker', 'containers', 'containerization', 'dockerfile', 'docker-compose']
  },
  {
    id: 'cloud-aws',
    name: 'AWS / Cloud',
    category: 'tool',
    defaultProficiency: 40,
    aliases: ['aws', 'amazon web services', 's3', 'ec2', 'cloud computing', 'gcp', 'azure']
  },
  {
    id: 'html-css',
    name: 'HTML & CSS',
    category: 'core',
    defaultProficiency: 70,
    aliases: ['html', 'html5', 'css', 'css3', 'flexbox', 'grid', 'responsive web design']
  },
  {
    id: 'tailwind-css',
    name: 'Tailwind CSS',
    category: 'tool',
    defaultProficiency: 60,
    aliases: ['tailwind', 'tailwindcss', 'tailwind css', 'utility first css']
  },
  {
    id: 'rest-apis',
    name: 'REST APIs',
    category: 'core',
    defaultProficiency: 55,
    aliases: ['rest api', 'restful apis', 'api integration', 'postman', 'http', 'crud', 'endpoints']
  },
  {
    id: 'business-intelligence',
    name: 'Business Intelligence',
    category: 'domain',
    defaultProficiency: 50,
    aliases: ['business intelligence', 'bi', 'dashboards', 'kpi reporting', 'executive dashboards', 'data storytelling']
  },
  {
    id: 'agile-scrum',
    name: 'Agile & Scrum',
    category: 'domain',
    defaultProficiency: 55,
    aliases: ['agile', 'scrum', 'jira', 'sprints', 'kanban', 'trello', 'confluence']
  },
  {
    id: 'market-research',
    name: 'Market Research',
    category: 'domain',
    defaultProficiency: 50,
    aliases: ['market research', 'competitive analysis', 'industry trends', 'secondary research', 'survey design', 'swot']
  },
  {
    id: 'operations-management',
    name: 'Operations Management',
    category: 'domain',
    defaultProficiency: 50,
    aliases: ['operations', 'supply chain', 'logistics', 'vendor management', 'inventory management', 'fulfillment']
  },
  {
    id: 'time-management',
    name: 'Time & Task Management',
    category: 'soft',
    defaultProficiency: 65,
    aliases: ['time management', 'prioritization', 'multitasking', 'deadlines', 'organization skills']
  },
  {
    id: 'leadership',
    name: 'Leadership & Teamwork',
    category: 'soft',
    defaultProficiency: 65,
    aliases: ['leadership', 'teamwork', 'team player', 'collaboration', 'mentoring', 'peer guidance']
  },
  {
    id: 'c-plus-plus',
    name: 'C++',
    category: 'core',
    defaultProficiency: 50,
    aliases: ['c++', 'cpp', 'c/c++', 'object oriented programming c++']
  },
  {
    id: 'java',
    name: 'Java',
    category: 'core',
    defaultProficiency: 50,
    aliases: ['java', 'core java', 'spring boot', 'jvm']
  },
  {
    id: 'data-cleaning',
    name: 'Data Cleaning & Wrangling',
    category: 'core',
    defaultProficiency: 55,
    aliases: ['data cleaning', 'data wrangling', 'data preprocessing', 'outlier detection', 'missing values imputation']
  },
  {
    id: 'a-b-testing',
    name: 'A/B Testing & Experimentation',
    category: 'domain',
    defaultProficiency: 45,
    aliases: ['a/b testing', 'ab testing', 'experimentation', 'split testing', 'conversion rate optimization', 'cro']
  },
  {
    id: 'stakeholder-management',
    name: 'Stakeholder Management',
    category: 'soft',
    defaultProficiency: 55,
    aliases: ['stakeholder management', 'client management', 'cross-functional collaboration', 'business partnering']
  },
  {
    id: 'email-marketing',
    name: 'Email & Lifecycle Marketing',
    category: 'domain',
    defaultProficiency: 45,
    aliases: ['email marketing', 'mailchimp', 'crm marketing', 'retention marketing', 'push notifications']
  },
  {
    id: 'linux-bash',
    name: 'Linux & Shell Scripting',
    category: 'tool',
    defaultProficiency: 45,
    aliases: ['linux', 'bash', 'shell script', 'terminal', 'unix', 'cli']
  },
  {
    id: 'figma',
    name: 'Figma & UI Prototyping',
    category: 'tool',
    defaultProficiency: 50,
    aliases: ['figma', 'ui design', 'prototyping', 'wireframes', 'mockups', 'user experience']
  }
];

export const SKILL_ALIAS_MAP: Record<string, string> = {};
CANONICAL_SKILLS.forEach(skill => {
  skill.aliases.forEach(alias => {
    SKILL_ALIAS_MAP[alias.toLowerCase().trim()] = skill.name;
  });
});
