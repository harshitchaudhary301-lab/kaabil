export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface SkillQuiz {
  skillId: string;
  skillName: string;
  title: string;
  description: string;
  passingScorePercent: number; // usually 60
  questions: QuizQuestion[];
}

export const QUIZ_DATABASE: Record<string, SkillQuiz> = {
  'SQL': {
    skillId: 'sql',
    skillName: 'SQL',
    title: 'SQL Analytical Querying Checkpoint',
    description: 'Test your understanding of multi-table joins, GROUP BY aggregations, WHERE vs HAVING, and window functions.',
    passingScorePercent: 60,
    questions: [
      {
        id: 'sql-1',
        question: 'Which clause is used to filter records after an aggregate function (e.g. COUNT or SUM) has already been applied?',
        options: ['WHERE', 'HAVING', 'GROUP BY', 'QUALIFY'],
        correctIndex: 1,
        explanation: 'HAVING is evaluated after GROUP BY aggregation, whereas WHERE filters individual rows before aggregation occurs.'
      },
      {
        id: 'sql-2',
        question: 'What is the primary difference between LEFT JOIN and INNER JOIN?',
        options: [
          'LEFT JOIN returns only non-matching rows from the left table',
          'INNER JOIN returns all rows from the right table regardless of matches',
          'LEFT JOIN preserves all rows from the left table, filling unmatched right columns with NULL',
          'They produce identical result sets if foreign keys exist'
        ],
        correctIndex: 2,
        explanation: 'A LEFT JOIN guarantees that every row from the left table is included in the output. If no match exists in the right table, NULL values are returned for the right table columns.'
      },
      {
        id: 'sql-3',
        question: 'In PostgreSQL and MySQL 8+, which window function assigns sequential rank integers without skipping numbers when ties occur?',
        options: ['RANK()', 'DENSE_RANK()', 'ROW_NUMBER()', 'NTILE()'],
        correctIndex: 1,
        explanation: 'DENSE_RANK() assigns ranks without gaps (e.g. 1, 2, 2, 3), whereas RANK() skips values following ties (e.g. 1, 2, 2, 4).'
      },
      {
        id: 'sql-4',
        question: 'What is the performance implication of using "SELECT *" on large production tables in analytical queries?',
        options: [
          'It automatically speeds up query planning by omitting column parsing',
          'It causes unnecessary disk I/O, network bandwidth exhaustion, and prevents index-only scans',
          'It prevents SQL injection vulnerabilities',
          'It forces SQLite compatibility mode'
        ],
        correctIndex: 1,
        explanation: 'Querying all columns with SELECT * fetches unneeded text/blob fields, wastes RAM and cache lines, and prevents database query planners from executing fast index-only scans.'
      },
      {
        id: 'sql-5',
        question: 'What will "COUNT(column_name)" return if 3 out of 10 rows in that column contain NULL values?',
        options: ['10', '7', '3', 'NULL'],
        correctIndex: 1,
        explanation: 'COUNT(column_name) ignores NULL values and counts only valid non-null entries (10 - 3 = 7). In contrast, COUNT(*) counts total rows including NULLs.'
      }
    ]
  },
  'Python': {
    skillId: 'python',
    skillName: 'Python',
    title: 'Python & Pandas Analysis Checkpoint',
    description: 'Verify your core skills in pandas DataFrames, vectorized operations, missing values, and data structures.',
    passingScorePercent: 60,
    questions: [
      {
        id: 'py-1',
        question: 'In pandas, what is the most performant method to calculate a new column based on two existing numerical columns?',
        options: [
          'Looping over df.iterrows() with a standard Python for-loop',
          'Using df.apply() with an unvectorized lambda function',
          'Direct vectorized column arithmetic (e.g., df["c"] = df["a"] + df["b"])',
          'Converting the DataFrame to a list of dicts and rebuilding it'
        ],
        correctIndex: 2,
        explanation: 'Direct vectorized operations in pandas execute at compiled C/NumPy speed, bypassing Python interpreter overhead and running up to 100x faster than iterrows.'
      },
      {
        id: 'py-2',
        question: 'Which method should you use to check the count of missing (NaN) values across each column in a DataFrame?',
        options: [
          'df.isna().sum()',
          'df.count_nulls()',
          'df.describe(include="null")',
          'df.drop_duplicates().size'
        ],
        correctIndex: 0,
        explanation: 'df.isna().sum() (or df.isnull().sum()) generates a boolean mask for nulls and aggregates the sum per column.'
      },
      {
        id: 'py-3',
        question: 'What is the fundamental difference between a Python List and a Tuple?',
        options: [
          'Tuples can only store integers, while Lists can store any object',
          'Lists are mutable (can be changed in-place); Tuples are immutable',
          'Lists use parentheses () while Tuples use square brackets []',
          'Tuples cannot be indexed'
        ],
        correctIndex: 1,
        explanation: 'Lists are mutable sequences whose elements can be modified, appended, or removed. Tuples are immutable and cannot be changed once created.'
      },
      {
        id: 'py-4',
        question: 'In pandas, what does `df.groupby("category")["revenue"].agg(["mean", "median"])` produce?',
        options: [
          'An in-place modification of the original revenue values',
          'A grouped summary table displaying both average and 50th percentile revenue per category',
          'A single boolean filter series',
          'An error because agg() only accepts one function at a time'
        ],
        correctIndex: 1,
        explanation: 'Passing a list of aggregation strings into .agg() produces a multi-metric summary dataframe broken down by the group key.'
      },
      {
        id: 'py-5',
        question: 'Which keyword in Python is used to create a generator function that produces values lazily on demand?',
        options: ['return', 'yield', 'async', 'lambda'],
        correctIndex: 1,
        explanation: 'The `yield` keyword turns a standard function into a generator iterator, yielding items one at a time without loading large sequences into memory all at once.'
      }
    ]
  },
  'Statistics': {
    skillId: 'statistics',
    skillName: 'Statistics',
    title: 'Applied Statistics & Probability Checkpoint',
    description: 'Test your understanding of hypothesis testing, p-values, variance, and standard distributions.',
    passingScorePercent: 60,
    questions: [
      {
        id: 'stat-1',
        question: 'What does a p-value of 0.03 indicate when testing at a 5% (alpha = 0.05) significance level?',
        options: [
          'The null hypothesis is 97% likely to be true',
          'The observed difference is statistically significant; we reject the null hypothesis',
          'There is a 3% probability that the experiment failed',
          'The sample size was too small to make a conclusion'
        ],
        correctIndex: 1,
        explanation: 'Since p (0.03) is less than alpha (0.05), we reject the null hypothesis in favor of the alternative hypothesis, concluding the observed effect is unlikely due to random chance.'
      },
      {
        id: 'stat-2',
        question: 'In a heavily right-skewed salary distribution, which measure of central tendency is most representative of a typical worker?',
        options: ['Mean', 'Median', 'Standard Deviation', 'Range'],
        correctIndex: 1,
        explanation: 'The mean is pulled dramatically upwards by high-earning outliers. The median represents the 50th percentile and remains robust against extreme values.'
      },
      {
        id: 'stat-3',
        question: 'What is Type I error in statistical hypothesis testing?',
        options: [
          'Failing to reject the null hypothesis when it is actually false (false negative)',
          'Rejecting the true null hypothesis when no actual effect exists (false positive)',
          'Calculating standard deviation using n instead of n-1',
          'Having an undersized sample test'
        ],
        correctIndex: 1,
        explanation: 'Type I error is a False Positive: rejecting the null hypothesis when it is actually true (concluding an effect exists when it does not).'
      },
      {
        id: 'stat-4',
        question: 'According to the Central Limit Theorem (CLT), what happens to the sampling distribution of the sample mean as sample size n grows large (n >= 30)?',
        options: [
          'It becomes uniformly distributed',
          'It approaches a normal (bell-shaped) distribution regardless of the underlying population shape',
          'Its standard deviation increases linearly with n',
          'It degenerates into a single discrete spike'
        ],
        correctIndex: 1,
        explanation: 'The Central Limit Theorem proves that sample means of sufficiently large independent samples will approximate a normal distribution, regardless of the population distribution.'
      },
      {
        id: 'stat-5',
        question: 'What is the formula for standard deviation in relation to variance?',
        options: [
          'Standard Deviation = Variance squared',
          'Standard Deviation = Square root of Variance',
          'Standard Deviation = Mean divided by Variance',
          'Standard Deviation = Variance multiplied by sample size'
        ],
        correctIndex: 1,
        explanation: 'Standard deviation is defined as the square root of the variance, expressing dispersion in the exact same physical units as the original dataset.'
      }
    ]
  },
  'Excel': {
    skillId: 'excel',
    skillName: 'Excel',
    title: 'Advanced Excel & Business Modeling Checkpoint',
    description: 'Test your mastery of modern lookup formulas, pivot summaries, logic checks, and financial functions.',
    passingScorePercent: 60,
    questions: [
      {
        id: 'xl-1',
        question: 'Why is XLOOKUP generally preferred over traditional VLOOKUP in modern Excel spreadsheets?',
        options: [
          'XLOOKUP requires columns to be sorted in ascending order',
          'XLOOKUP can search to the left, defaults to exact match, and does not break when columns are inserted',
          'XLOOKUP only works on numeric data types',
          'XLOOKUP consumes less storage space on disk'
        ],
        correctIndex: 1,
        explanation: 'XLOOKUP does not require a hardcoded column index number, searches left or right, handles exact match by default, and provides built-in fallback values for missing items.'
      },
      {
        id: 'xl-2',
        question: 'Which formula correctly sums sales in column C where region in column A is "North" and status in column B is "Completed"?',
        options: [
          '=SUMIF(A:A, "North", C:C) + SUMIF(B:B, "Completed", C:C)',
          '=SUMIFS(C:C, A:A, "North", B:B, "Completed")',
          '=COUNTIFS(C:C, A:A, "North", B:B, "Completed")',
          '=TOTAL(C:C, "North", "Completed")'
        ],
        correctIndex: 1,
        explanation: 'SUMIFS takes the sum range as the first argument, followed by pairs of criteria ranges and criteria strings.'
      },
      {
        id: 'xl-3',
        question: 'In an Excel Pivot Table, what happens if you place a timestamp field into the "Values" area by default?',
        options: [
          'It computes the financial depreciation rate',
          'It defaults to COUNT of the timestamps rather than SUM',
          'It corrupts the worksheet memory buffer',
          'It automatically converts timestamps to USD currency'
        ],
        correctIndex: 1,
        explanation: 'When non-numeric or date fields are dragged into the Values quadrant, Excel defaults to the COUNT aggregation function.'
      },
      {
        id: 'xl-4',
        question: 'What is the purpose of the "$" symbol in cell references like `$B$4`?',
        options: [
          'It formats the number as US Dollars',
          'It locks the row and column reference as absolute so it does not shift when copied across cells',
          'It denotes that the cell contains an external SQL query',
          'It indicates an error condition'
        ],
        correctIndex: 1,
        explanation: 'The $ character locks the row and column coordinates, creating an absolute cell reference that stays pinned when formulas are dragged or pasted.'
      },
      {
        id: 'xl-5',
        question: 'Which tool under Data Tools allows you to test multiple input scenarios (e.g. interest rate vs loan tenure) to observe monthly EMI impact?',
        options: ['Flash Fill', 'Text to Columns', 'Data Table (What-If Analysis)', 'Consolidate'],
        correctIndex: 2,
        explanation: 'Data Tables in What-If Analysis allow one-variable and two-variable sensitivity testing across different model parameters.'
      }
    ]
  },
  'React': {
    skillId: 'react',
    skillName: 'React',
    title: 'React & Component Engineering Checkpoint',
    description: 'Assess your understanding of React hooks, component re-renders, state management, and effects.',
    passingScorePercent: 60,
    questions: [
      {
        id: 'react-1',
        question: 'What is the primary rule regarding the dependencies array in `useEffect(fn, deps)`?',
        options: [
          'You should never pass state variables into the dependencies array',
          'Any reactive value (props, state, or functions) referenced inside the effect must be declared in the array',
          'The array must always contain exactly two variables',
          'Passing an empty array causes the effect to re-run on every render'
        ],
        correctIndex: 1,
        explanation: 'To prevent stale closures and synchronization bugs, any reactive prop or state value read inside the effect function must be listed in its dependency array.'
      },
      {
        id: 'react-2',
        question: 'Why should you avoid using array index as a `key` prop in dynamically rendered lists that can be reordered or filtered?',
        options: [
          'Indices cannot be converted to strings in JSX',
          'Using index causes component state mixing and incorrect DOM recycling during deletions or insertions',
          'React throws a compilation error when index is used',
          'It disables CSS styling on child elements'
        ],
        correctIndex: 1,
        explanation: 'Keys provide identity across renders. When items are inserted or removed, index keys shift, causing React to mismatch component internal states with DOM nodes.'
      },
      {
        id: 'react-3',
        question: 'What hook should be used to cache an expensive calculation between re-renders when inputs have not changed?',
        options: ['useCallback', 'useMemo', 'useRef', 'useState'],
        correctIndex: 1,
        explanation: '`useMemo` caches the calculated result of a function and only recalculates it when one of its specified dependencies changes.'
      },
      {
        id: 'react-4',
        question: 'What happens when `useRef(initialValue)` value (`ref.current`) is mutated?',
        options: [
          'The entire component subtree re-renders immediately',
          'The value updates silently without triggering a component re-render',
          'The browser executes a page reload',
          'An unhandled exception is thrown'
        ],
        correctIndex: 1,
        explanation: 'Unlike useState, changing `ref.current` is a synchronous mutation that does not trigger a re-render of the component.'
      },
      {
        id: 'react-5',
        question: 'What is the purpose of lifting state up in React architecture?',
        options: [
          'To move UI state into local storage for caching',
          'To share common state between sibling components by placing it in their closest common ancestor',
          'To convert functional components into class components',
          'To improve Lighthouse SEO scores'
        ],
        correctIndex: 1,
        explanation: 'Lifting state up allows two or more sibling components to synchronize and reflect the same changing data through their shared parent component.'
      }
    ]
  },
  'Communication': {
    skillId: 'communication',
    skillName: 'Communication',
    title: 'Workplace & Stakeholder Communication Checkpoint',
    description: 'Test your ability to structure analytical insights, manage stakeholder expectations, and write concise summaries.',
    passingScorePercent: 60,
    questions: [
      {
        id: 'comm-1',
        question: 'When presenting data analysis to a Vice President or C-level executive, which presentation structure is most effective?',
        options: [
          'Explain the step-by-step SQL queries and Python code first, followed by caveats, then the conclusion',
          'Start with the "Bottom Line Up Front" (BLUF / executive recommendation), followed by supporting metrics and next steps',
          'Avoid sharing any numbers and talk only in abstract adjectives',
          'Send a 120-page raw CSV file without commentary'
        ],
        correctIndex: 1,
        explanation: 'Senior leaders have limited time; using BLUF (Bottom Line Up Front) provides the actionable business takeaway immediately, allowing deeper exploration as needed.'
      },
      {
        id: 'comm-2',
        question: 'What does the SCQA framework stand for in structured business communication?',
        options: [
          'Scope, Cost, Quality, Agility',
          'Situation, Complication, Question, Answer',
          'Standard, Code, Query, Analysis',
          'Strategy, Customer, Quota, Allocation'
        ],
        correctIndex: 1,
        explanation: 'SCQA (Situation, Complication, Question, Answer) is the classic McKinsey narrative framework for storytelling and pitch synthesis.'
      },
      {
        id: 'comm-3',
        question: 'What is the best way to deliver bad news to a project manager (e.g. data pipeline is delayed by 3 days)?',
        options: [
          'Wait until the deadline day and hope they do not ask',
          'Notify them proactively as soon as identified, explain the root bottleneck, revised ETA, and mitigation steps',
          'Blame the client database architecture publicly on Slack',
          'Send an encrypted zip file'
        ],
        correctIndex: 1,
        explanation: 'Early, transparent communication with root cause analysis and a concrete recovery plan builds stakeholder trust even during setbacks.'
      },
      {
        id: 'comm-4',
        question: 'When creating chart visuals for a cross-functional dashboard, what is best practice for data ink ratio?',
        options: [
          'Add heavy 3D gradients, dark background grids, and 12 bright rainbow colors',
          'Maximize signal-to-noise by removing decorative grid lines, unnecessary legends, and emphasizing key data points',
          'Include every metric on a single pie chart with 30 slices',
          'Use comic sans typography for warmth'
        ],
        correctIndex: 1,
        explanation: 'Edward Tufte data-ink ratio guideline advises removing chart clutter so viewers can immediately spot the trend and key variance points.'
      },
      {
        id: 'comm-5',
        question: 'In an agile standup meeting, what three questions should an individual contributor answer concisely?',
        options: [
          'What did I accomplish yesterday? What will I do today? What blockers are in my way?',
          'What is wrong with our company strategy? Who is hiring? When is lunch?',
          'How many lines of code did I write? What is my salary expectation? Who reviewed my PR?',
          'How many bugs were created by other teams?'
        ],
        correctIndex: 0,
        explanation: 'The standard daily scrum format focuses precisely on yesterday progress, today goals, and any blockers impeding delivery.'
      }
    ]
  },
  'Projects': {
    skillId: 'projects',
    skillName: 'Projects',
    title: 'Portfolio & Capstone Project Readiness Checkpoint',
    description: 'Evaluate your ability to document, package, and present real-world data and software projects to recruiters.',
    passingScorePercent: 60,
    questions: [
      {
        id: 'proj-1',
        question: 'What is the most common reason recruiters ignore student GitHub repositories?',
        options: [
          'The repository has too many commits',
          'Missing a comprehensive README with project overview, setup instructions, live demo link, and key findings/screenshots',
          'The code is written in Python rather than Assembly',
          'The repo has a MIT license'
        ],
        correctIndex: 1,
        explanation: 'Hiring managers rarely clone repos to run them locally; an attractive README with problem context, business impact metrics, and a live demo link is critical to make the shortlist.'
      },
      {
        id: 'proj-2',
        question: 'Which of the following resume project bullets follows the Google XYZ formula ("Accomplished [X] as measured by [Y], by doing [Z]")?',
        options: [
          'Worked on a Machine Learning project using Python and pandas',
          'Built an automated churn prediction dashboard reducing customer drop-off by 14% across 10k users using Random Forest & Streamlit',
          'Learned SQL and wrote queries on a Kaggle dataset',
          'Responsible for data analysis and meetings'
        ],
        correctIndex: 1,
        explanation: 'The second option specifies the exact business accomplishment [X], measured metric [Y], and technical implementation [Z].'
      },
      {
        id: 'proj-3',
        question: 'Why should a candidate avoid using generic Kaggle Titanic or Boston Housing datasets as their primary portfolio centerpiece?',
        options: [
          'Those datasets are illegal under copyright law',
          'They are overused tutorial benchmarks that fail to demonstrate authentic data cleaning, novel problem framing, or real-world messy data handling',
          'Python cannot process CSV files under 1 megabyte',
          'They do not support SQL queries'
        ],
        correctIndex: 1,
        explanation: 'Recruiters review hundreds of identical Titanic notebooks. Original datasets scraped or sourced from government portals (e.g. data.gov.in) demonstrate genuine curiosity and problem solving.'
      },
      {
        id: 'proj-4',
        question: 'What should be included in the `.gitignore` file of any software or data project repository?',
        options: [
          'All source code files (.py, .ts, .sql)',
          'Virtual environments, sensitive API keys (.env), node_modules, and heavy binary cache files',
          'The README.md file',
          'The MIT license file'
        ],
        correctIndex: 1,
        explanation: 'Gitignore keeps bulky dependencies, build artifacts, and critical secrets from leaking into public version control.'
      },
      {
        id: 'proj-5',
        question: 'When deploying a web dashboard for portfolio review, what is the best practice for hosting?',
        options: [
          'Running a localhost server on your laptop with ngrok only when asked',
          'Deploying to a free cloud host (Vercel, Netlify, Streamlit Cloud, Render) with a permanent HTTPS link in your resume',
          'Emailing a 500MB zip file to the HR manager',
          'Posting screenshots only on Instagram'
        ],
        correctIndex: 1,
        explanation: 'Permanent, fast HTTPS links on Vercel or Streamlit allow any interviewer or recruiter to test your work in 5 seconds on their phone or laptop.'
      }
    ]
  }
};

export function getQuizForSkill(skillName: string): SkillQuiz {
  if (QUIZ_DATABASE[skillName]) {
    return QUIZ_DATABASE[skillName];
  }
  // Generic fallback quiz for other skills
  return {
    skillId: skillName.toLowerCase().replace(/\s+/g, '-'),
    skillName: skillName,
    title: `${skillName} Practical Checkpoint`,
    description: `Evaluate your core comprehension, best practices, and real-world applied knowledge of ${skillName}.`,
    passingScorePercent: 60,
    questions: [
      {
        id: `${skillName}-q1`,
        question: `When applying ${skillName} in a professional industry setting, what is the primary baseline practice?`,
        options: [
          `Documenting assumptions, adhering to standard conventions, and testing edge cases`,
          `Relying entirely on undocumented shortcuts`,
          `Ignoring version control and tracking changes manually in text files`,
          `Skipping stakeholder validation`
        ],
        correctIndex: 0,
        explanation: `Industry quality standards require systematic documentation, convention compliance, and proactive testing.`
      },
      {
        id: `${skillName}-q2`,
        question: `How do senior practitioners measure quality and impact in ${skillName}?`,
        options: [
          `By the sheer hours spent sitting at the desk`,
          `By clear operational benchmarks, error rate reductions, and measurable business deliverables`,
          `By avoiding any metric or quantitative review`,
          `By subjective opinions alone`
        ],
        correctIndex: 1,
        explanation: `Measurable impact on speed, accuracy, and business metrics is the hallmark of real competence.`
      },
      {
        id: `${skillName}-q3`,
        question: `What is the most effective workflow when encountering an unknown bottleneck in ${skillName}?`,
        options: [
          `Immediately guess random configurations`,
          `Isolate variables, inspect logs or error traces, reproduce minimally, and consult official documentation`,
          `Delete the codebase and start from scratch`,
          `Ignore the bottleneck and ship to production`
        ],
        correctIndex: 1,
        explanation: `Systematic debugging through isolation and minimal reproduction isolates the root cause rapidly.`
      },
      {
        id: `${skillName}-q4`,
        question: `Why is cross-functional collaboration vital when implementing ${skillName} solutions?`,
        options: [
          `To ensure output directly aligns with end-user expectations and overall system architecture`,
          `To shift responsibility to other team members`,
          `To artificially inflate meeting hours`,
          `It is not important; work in complete isolation`
        ],
        correctIndex: 0,
        explanation: `Solutions must fit customer and system contexts to create genuine long-term value.`
      },
      {
        id: `${skillName}-q5`,
        question: `How should you demonstrate competence in ${skillName} during an entry-level hiring interview?`,
        options: [
          `Recite dictionary definitions without examples`,
          `Explain a tangible project where you handled tradeoffs, solved bottlenecks, and delivered measurable outcomes`,
          `Claim 100% mastery of all facets without showing evidence`,
          `Refuse to answer technical questions`
        ],
        correctIndex: 1,
        explanation: `Recruiters look for practical problem-solving evidence and clear discussion of real engineering or analytical tradeoffs.`
      }
    ]
  };
}
