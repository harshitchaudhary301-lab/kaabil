export interface SkillRequirement {
  skill: string;
  required: number; // 0-100 target benchmark for entry-level
  weight: number;   // weights sum to 1.0
  importance: number; // 0-1 multiplier for gap prioritization
  category: 'core' | 'tool' | 'soft' | 'domain';
  description: string;
  prerequisite?: string; // Prerequisite skill needed before this
}

export interface CareerRole {
  id: string;
  title: string;
  category: string;
  shortDescription: string;
  overview: string;
  averageFresherCTC: string;
  marketDemand: 'Very High' | 'High' | 'Growing';
  hiringCompanies: string[];
  interestTags: string[];
  keywords: string[];
  corpus: string;
  skillRequirements: SkillRequirement[];
}

export const CAREER_ROLES: CareerRole[] = [
  {
    id: 'data-analyst',
    title: 'Data Analyst',
    category: 'Analytics & Insights',
    shortDescription: 'Transform raw company data into clean dashboards, SQL models, and actionable executive insights.',
    overview: 'Data Analysts bridge business problems and data by querying databases with SQL, building dashboards in Power BI/Tableau, and running statistical exploratory data analysis in Python.',
    averageFresherCTC: '₹6.5 – 12 LPA',
    marketDemand: 'Very High',
    hiringCompanies: ['Swiggy', 'Zomato', 'Fractal', 'Mu Sigma', 'Flipkart', 'Accenture'],
    interestTags: ['Data & Analytics', 'Dashboards', 'Problem Solving', 'Business Intelligence', 'Mathematics'],
    keywords: [
      'sql', 'database', 'queries', 'joins', 'aggregation', 'python', 'pandas', 'numpy',
      'statistics', 'hypothesis testing', 'eda', 'power bi', 'tableau', 'excel', 'vlookup',
      'pivot tables', 'communication', 'business acumen', 'metrics', 'retention', 'kpis'
    ],
    corpus: 'data analyst role querying transactional databases with sql complex joins aggregations window functions data cleaning with python pandas exploratory data analysis descriptive and inferential statistics creating interactive dashboards with power bi or tableau presenting data insights to cross-functional stakeholders measuring business kpis conversion rate churn and cohort analysis',
    skillRequirements: [
      {
        skill: 'SQL',
        required: 80,
        weight: 0.25,
        importance: 0.25,
        category: 'core',
        description: 'Writing CTEs, multi-table joins, subqueries, and window functions for analytical queries.'
      },
      {
        skill: 'Python',
        required: 80,
        weight: 0.25,
        importance: 0.25,
        category: 'core',
        description: 'Data wrangling, cleaning missing values, and EDA with pandas and numpy.',
        prerequisite: 'SQL'
      },
      {
        skill: 'Statistics',
        required: 70,
        weight: 0.20,
        importance: 0.20,
        category: 'core',
        description: 'Probability distributions, confidence intervals, p-values, and A/B test interpretation.'
      },
      {
        skill: 'Projects',
        required: 60,
        weight: 0.20,
        importance: 0.20,
        category: 'domain',
        description: 'Real-world end-to-end dataset analysis documented on GitHub or Notion.',
        prerequisite: 'Python'
      },
      {
        skill: 'Communication',
        required: 70,
        weight: 0.10,
        importance: 0.10,
        category: 'soft',
        description: 'Translating analytical metrics into clear business recommendations and visual charts.'
      }
    ]
  },
  {
    id: 'business-analyst',
    title: 'Business Analyst',
    category: 'Product & Strategy',
    shortDescription: 'Deconstruct complex business operations, evaluate bottlenecks, and map tech solutions to revenue goals.',
    overview: 'Business Analysts collaborate with leadership, operations, and product teams to translate company bottlenecks into requirement specifications (BRDs), functional user stories, and financial models.',
    averageFresherCTC: '₹7.0 – 14 LPA',
    marketDemand: 'Very High',
    hiringCompanies: ['McKinsey Knowledge', 'Deloitte', 'Razorpay', 'CRED', 'KPMG', 'EY'],
    interestTags: ['Business Strategy', 'Stakeholder Management', 'Problem Solving', 'Process Optimization'],
    keywords: [
      'business analysis', 'brd', 'frd', 'jira', 'excel', 'financial modeling', 'sql',
      'process mapping', 'uml', 'stakeholder management', 'communication', 'user stories',
      'kpis', 'market research', 'gap analysis', 'agile'
    ],
    corpus: 'business analyst bridging business needs and software solutions writing business requirement documents brds user stories process workflows wireframes basic sql querying for ad-hoc validation stakeholder interviews gap analysis agile scrum facilitation advanced excel modeling',
    skillRequirements: [
      {
        skill: 'Excel',
        required: 85,
        weight: 0.25,
        importance: 0.25,
        category: 'tool',
        description: 'Advanced lookup functions, financial forecasting models, and interactive scenario planners.'
      },
      {
        skill: 'SQL',
        required: 65,
        weight: 0.20,
        importance: 0.20,
        category: 'core',
        description: 'Validating metrics, tracking user journeys, and extracting reports from production DBs.'
      },
      {
        skill: 'Communication',
        required: 85,
        weight: 0.20,
        importance: 0.20,
        category: 'soft',
        description: 'Leading client walkthroughs, documenting user stories, and conflict resolution.'
      },
      {
        skill: 'Product Thinking',
        required: 70,
        weight: 0.20,
        importance: 0.20,
        category: 'domain',
        description: 'Creating PRDs, root-cause 5 Whys analysis, and customer journey maps.'
      },
      {
        skill: 'Projects',
        required: 60,
        weight: 0.15,
        importance: 0.15,
        category: 'domain',
        description: 'Documented case studies evaluating unit economics or business workflow overhauls.'
      }
    ]
  },
  {
    id: 'frontend-developer',
    title: 'Frontend Developer',
    category: 'Software Engineering',
    shortDescription: 'Craft lightning-fast, accessible, and reactive user interfaces that delight millions of end-users.',
    overview: 'Frontend Developers engineer responsive client-side web applications using React, modern JavaScript/TypeScript, and modern CSS frameworks, ensuring peak performance and delightful micro-interactions.',
    averageFresherCTC: '₹7.5 – 15 LPA',
    marketDemand: 'Very High',
    hiringCompanies: ['Zepto', 'Juspay', 'PhonePe', 'Postman', 'Groww', 'BrowserStack'],
    interestTags: ['Web Development', 'UI/UX Design', 'Coding & Algorithms', 'Design Systems'],
    keywords: [
      'react', 'javascript', 'typescript', 'html', 'css', 'tailwind', 'redux', 'nextjs',
      'responsive design', 'rest apis', 'git', 'dom', 'component architecture', 'framer motion',
      'web performance', 'accessibility'
    ],
    corpus: 'frontend developer building modern reactive web applications using react typescript modern javascript es6 state management hooks tailwind css component design systems integrating rest apis responsive design cross browser testing git version control web vitals accessibility',
    skillRequirements: [
      {
        skill: 'React',
        required: 85,
        weight: 0.30,
        importance: 0.30,
        category: 'core',
        description: 'Hooks, custom hooks, context API, component lifecycle, and state optimization.',
        prerequisite: 'JavaScript'
      },
      {
        skill: 'JavaScript',
        required: 80,
        weight: 0.25,
        importance: 0.25,
        category: 'core',
        description: 'Closures, event loop, async/await, ES6+ modules, and DOM manipulation.'
      },
      {
        skill: 'Git',
        required: 70,
        weight: 0.15,
        importance: 0.15,
        category: 'tool',
        description: 'Branching strategies, resolving merge conflicts, and GitHub pull request workflows.'
      },
      {
        skill: 'Projects',
        required: 75,
        weight: 0.20,
        importance: 0.20,
        category: 'domain',
        description: 'Deployed web apps on Vercel/Netlify with live responsive demos and clean repo commits.',
        prerequisite: 'React'
      },
      {
        skill: 'Communication',
        required: 60,
        weight: 0.10,
        importance: 0.10,
        category: 'soft',
        description: 'Collaborating smoothly with designers, writing concise PR descriptions, and tech discussions.'
      }
    ]
  },
  {
    id: 'python-backend-developer',
    title: 'Python Backend Developer',
    category: 'Software Engineering',
    shortDescription: 'Architect robust RESTful APIs, asynchronous services, and secure database layers in Python.',
    overview: 'Backend Developers design scalable server architectures, database schemas, and microservices using FastAPI, Django, PostgreSQL, and Redis to power high-throughput web and mobile apps.',
    averageFresherCTC: '₹8.0 – 16 LPA',
    marketDemand: 'Very High',
    hiringCompanies: ['Urban Company', 'InMobi', 'Zoho', 'Zerodha', 'Amazon India', 'Cisco'],
    interestTags: ['Backend Architecture', 'Coding & Algorithms', 'Databases', 'Cloud Systems'],
    keywords: [
      'python', 'fastapi', 'django', 'rest api', 'sql', 'postgresql', 'docker', 'redis',
      'orm', 'authentication', 'jwt', 'git', 'data structures', 'system design', 'asyncio'
    ],
    corpus: 'python backend developer writing clean scalable rest apis using fastapi or django orm relational database design postgresql indexing transactions asynchronous processing redis caching docker containerization unit testing git version control authentication jwt security',
    skillRequirements: [
      {
        skill: 'Python',
        required: 85,
        weight: 0.30,
        importance: 0.30,
        category: 'core',
        description: 'Object-oriented programming, generators, decorators, typing, and standard library.'
      },
      {
        skill: 'SQL',
        required: 75,
        weight: 0.25,
        importance: 0.25,
        category: 'core',
        description: 'Relational schema design, normalization, ACID properties, and ORM query optimization.'
      },
      {
        skill: 'FastAPI',
        required: 70,
        weight: 0.20,
        importance: 0.20,
        category: 'tool',
        description: 'Building async endpoints, Pydantic schemas, dependency injection, and JWT auth.',
        prerequisite: 'Python'
      },
      {
        skill: 'Git',
        required: 70,
        weight: 0.10,
        importance: 0.10,
        category: 'tool',
        description: 'Feature branching, rebasing, code reviews, and CI/CD basics.'
      },
      {
        skill: 'Projects',
        required: 65,
        weight: 0.15,
        importance: 0.15,
        category: 'domain',
        description: 'Production-ready backend API deployed on Render/Railway with Swagger docs.',
        prerequisite: 'FastAPI'
      }
    ]
  },
  {
    id: 'product-analyst',
    title: 'Product Analyst',
    category: 'Product & Strategy',
    shortDescription: 'Decipher user engagement, run A/B experiments, and direct roadmap features with behavioral data.',
    overview: 'Product Analysts sit at the intersection of engineering and product management, examining event streams (Mixpanel, Amplitude), feature funnels, and test metrics to optimize retention and adoption.',
    averageFresherCTC: '₹8.0 – 16 LPA',
    marketDemand: 'High',
    hiringCompanies: ['Dunzo', 'Meesho', 'Paytm', 'ShareChat', 'CleverTap', 'Cars24'],
    interestTags: ['Product Thinking', 'Data & Analytics', 'Behavioral Psychology', 'Growth & Metrics'],
    keywords: [
      'product analytics', 'funnel analysis', 'retention', 'churn', 'cohorts', 'sql',
      'a/b testing', 'experimentation', 'python', 'mixpanel', 'amplitude', 'product thinking',
      'user onboarding', 'feature adoption', 'kpis'
    ],
    corpus: 'product analyst analyzing product funnels user onboarding cohorts churn and lifetime value writing sql queries to extract user interaction events designing a/b tests sample size statistical power collaborating with product managers defining tracking specs',
    skillRequirements: [
      {
        skill: 'SQL',
        required: 80,
        weight: 0.25,
        importance: 0.25,
        category: 'core',
        description: 'Event-level querying, sessionization, window functions, and cohort matrices.'
      },
      {
        skill: 'Product Thinking',
        required: 80,
        weight: 0.25,
        importance: 0.25,
        category: 'domain',
        description: 'North Star metrics, wireframe user flows, friction mapping, and prioritization frameworks (RICE).'
      },
      {
        skill: 'Statistics',
        required: 70,
        weight: 0.20,
        importance: 0.20,
        category: 'core',
        description: 'Hypothesis testing, sample size calculation, p-values, and statistical significance.'
      },
      {
        skill: 'Communication',
        required: 75,
        weight: 0.15,
        importance: 0.15,
        category: 'soft',
        description: 'Preparing experiment outcome decks for product leaders and engineering leads.'
      },
      {
        skill: 'Projects',
        required: 60,
        weight: 0.15,
        importance: 0.15,
        category: 'domain',
        description: 'Tear-downs of popular apps (e.g. Swiggy vs Zomato onboarding) with event metrics.'
      }
    ]
  },
  {
    id: 'operations-associate',
    title: 'Operations Associate',
    category: 'Business & Operations',
    shortDescription: 'Streamline daily fulfillment, monitor vendor SLAs, and manage scalable ground operations.',
    overview: 'Operations Associates keep high-velocity startups running seamlessly by monitoring service level agreements, optimizing supply chain hubs, and automating spreadsheet reporting.',
    averageFresherCTC: '₹5.0 – 9 LPA',
    marketDemand: 'High',
    hiringCompanies: ['Delhivery', 'Shadowfax', 'Amazon Logistics', 'Blinkit', 'Porter', 'BigBasket'],
    interestTags: ['Supply Chain & Ops', 'Process Optimization', 'Field Execution', 'Problem Solving'],
    keywords: [
      'operations', 'logistics', 'supply chain', 'excel', 'vendor management', 'sla',
      'turnaround time', 'tat', 'process improvement', 'communication', 'inventory',
      'coordination', 'problem solving', 'reporting'
    ],
    corpus: 'operations associate managing day-to-day fulfillment monitoring delivery slas turnaround time vendor partner coordination troubleshooting exceptions advanced excel tracking process optimization cost reduction root cause analysis operational metrics',
    skillRequirements: [
      {
        skill: 'Excel',
        required: 80,
        weight: 0.30,
        importance: 0.30,
        category: 'tool',
        description: 'Daily operational MIS trackers, pivot summaries, conditional alerts, and roster sheets.'
      },
      {
        skill: 'Communication',
        required: 85,
        weight: 0.30,
        importance: 0.30,
        category: 'soft',
        description: 'Vendor negotiations, cross-department coordination, and incident management handling.'
      },
      {
        skill: 'Process Optimization',
        required: 70,
        weight: 0.20,
        importance: 0.20,
        category: 'domain',
        description: 'SOP writing, eliminating operational bottlenecks, and reducing fulfillment TAT.'
      },
      {
        skill: 'SQL',
        required: 50,
        weight: 0.10,
        importance: 0.10,
        category: 'core',
        description: 'Pulling operational incident counts and dispatch logs directly from databases.'
      },
      {
        skill: 'Projects',
        required: 55,
        weight: 0.10,
        importance: 0.10,
        category: 'domain',
        description: 'Documented process re-engineering or warehouse/hub optimization case study.'
      }
    ]
  },
  {
    id: 'financial-analyst',
    title: 'Financial Analyst',
    category: 'Finance & Growth',
    shortDescription: 'Construct discounted cash flow models, analyze earnings reports, and guide capital investment decisions.',
    overview: 'Financial Analysts evaluate investment opportunities, build 3-statement forecast models, and track variance between actuals and corporate budgets.',
    averageFresherCTC: '₹7.0 – 14 LPA',
    marketDemand: 'High',
    hiringCompanies: ['Goldman Sachs India', 'TresVista', 'Crisil', 'DE Shaw', 'ICICI Securities', 'Nomura'],
    interestTags: ['Finance & Accounting', 'Stock Markets', 'Financial Modeling', 'Mathematics'],
    keywords: [
      'financial modeling', 'dcf', 'valuation', 'excel', 'accounting', 'p&l', 'balance sheet',
      'cash flow', 'ratio analysis', 'finance', 'variance analysis', 'cfa', 'equity research',
      'ebitda', 'capital budgeting'
    ],
    corpus: 'financial analyst building integrated three-statement financial models in excel discounted cash flow dcf valuation equity research financial statement analysis p&l balance sheet cash flow variance analysis cost of capital wacc investment memos',
    skillRequirements: [
      {
        skill: 'Financial Modeling',
        required: 80,
        weight: 0.30,
        importance: 0.30,
        category: 'core',
        description: '3-statement financial projection models, DCF valuations, and sensitivity tables.'
      },
      {
        skill: 'Excel',
        required: 85,
        weight: 0.25,
        importance: 0.25,
        category: 'tool',
        description: 'Complex financial formulas (XIRR, NPV, INDEX/MATCH), dynamic formatting, shortcuts.'
      },
      {
        skill: 'Accounting & Finance',
        required: 75,
        weight: 0.20,
        importance: 0.20,
        category: 'domain',
        description: 'Understanding GAAP/Ind-AS, working capital cycles, debt schedules, and EBITDA adjustments.'
      },
      {
        skill: 'Communication',
        required: 70,
        weight: 0.15,
        importance: 0.15,
        category: 'soft',
        description: 'Drafting structured investment memos and presenting valuation drivers concisely.'
      },
      {
        skill: 'Projects',
        required: 60,
        weight: 0.10,
        importance: 0.10,
        category: 'domain',
        description: 'Published equity research note or complete valuation model of a listed Indian stock.'
      }
    ]
  },
  {
    id: 'digital-marketing-associate',
    title: 'Digital Marketing Associate',
    category: 'Marketing & Growth',
    shortDescription: 'Scale customer acquisition, optimize ad creatives across Meta/Google, and build organic search funnels.',
    overview: 'Digital Marketers engineer organic and paid user acquisition through performance marketing (Google Ads, Meta Ads), search engine optimization (SEO), and conversion rate experiments.',
    averageFresherCTC: '₹5.5 – 10 LPA',
    marketDemand: 'Growing',
    hiringCompanies: ['Nykaa', 'Lenskart', 'Mamaearth', 'Schbang', 'Dentsu', 'Simplilearn'],
    interestTags: ['Marketing & Growth', 'Content Creation', 'Performance Ads', 'Creative Strategy'],
    keywords: [
      'digital marketing', 'seo', 'sem', 'google ads', 'meta ads', 'cac', 'roas', 'analytics',
      'copywriting', 'content strategy', 'email marketing', 'conversion rate', 'keyword research',
      'campaign management'
    ],
    corpus: 'digital marketing associate running performance campaigns on google search and meta ads tracking cac roas and ltv conducting on-page and off-page seo keyword research writing high-converting ad copy a/b testing landing pages google analytics 4 attribution',
    skillRequirements: [
      {
        skill: 'Digital Marketing & Ads',
        required: 80,
        weight: 0.30,
        importance: 0.30,
        category: 'core',
        description: 'Setting up Meta Ads Manager, Google Search campaigns, audience targeting, and ROAS calculations.'
      },
      {
        skill: 'SEO & Content',
        required: 75,
        weight: 0.25,
        importance: 0.25,
        category: 'core',
        description: 'Keyword intent mapping, on-page optimization, content cluster creation, and backlink outreach.'
      },
      {
        skill: 'Excel',
        required: 65,
        weight: 0.15,
        importance: 0.15,
        category: 'tool',
        description: 'Aggregating weekly campaign performance, blended CAC sheets, and ad spend reconciliations.'
      },
      {
        skill: 'Communication',
        required: 80,
        weight: 0.15,
        importance: 0.15,
        category: 'soft',
        description: 'Persuasive ad copywriting, social storytelling, and cross-channel brand messaging.'
      },
      {
        skill: 'Projects',
        required: 60,
        weight: 0.15,
        importance: 0.15,
        category: 'domain',
        description: 'Live campaigns or portfolio case study proving organic traffic growth or lead gen funnels.'
      }
    ]
  }
];

export const ALL_INTEREST_TAGS = [
  'Data & Analytics',
  'Coding & Algorithms',
  'Problem Solving',
  'Business Strategy',
  'Web Development',
  'UI/UX Design',
  'Financial Modeling',
  'Finance & Accounting',
  'Marketing & Growth',
  'Supply Chain & Ops',
  'Product Thinking',
  'Process Optimization',
  'Mathematics',
  'Creative Strategy'
];
