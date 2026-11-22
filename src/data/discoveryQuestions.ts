import { EducationalStream } from "@/types";

export interface DiscoveryOption {
  id: string;
  label: string;
  hindiLabel: string;
  hinglishLabel: string;
  description?: string;
  iconName: string;
  associatedStreams?: EducationalStream[];
  traits?: string[];
}

export interface DiscoveryQuestion {
  id: string;
  dimension:
    | "INTERESTS"
    | "SUBJECT_PREFERENCES"
    | "LOGICAL_REASONING"
    | "CREATIVITY"
    | "COMMUNICATION"
    | "PRACTICAL_PROBLEM_SOLVING"
    | "WORKSTYLE_PREFERENCES"
    | "LEARNING_GOALS";
  title: string;
  hindiTitle: string;
  hinglishTitle: string;
  subtitle: string;
  hindiSubtitle: string;
  hinglishSubtitle: string;
  scenario?: string;
  hindiScenario?: string;
  isMultiSelect: boolean;
  minSelections?: number;
  maxSelections?: number;
  options: DiscoveryOption[];
}

export const DISCOVERY_QUESTIONS: DiscoveryQuestion[] = [
  // Question 1: Broad Interests (Multi-select or Not Sure)
  {
    id: "q1_interests",
    dimension: "INTERESTS",
    title: "What activities naturally excite your curiosity?",
    hindiTitle: "कौन सी गतिविधियाँ आपको स्वाभाविक रूप से उत्साहित करती हैं?",
    hinglishTitle: "Kaun si activities aapko naturally excite karti hain?",
    subtitle: "Select up to 4 areas that spark your genuine interest, or choose 'Not Sure yet'.",
    hindiSubtitle: "अधिकतम 4 क्षेत्रों का चयन करें जो आपकी रुचि जगाते हैं, या 'अभी निश्चित नहीं' चुनें।",
    hinglishSubtitle: "Up to 4 areas choose karein jo aapko pasand hain, ya 'Not sure yet' select karein.",
    isMultiSelect: true,
    maxSelections: 4,
    options: [
      {
        id: "healthcare_healing",
        label: "Healthcare, Medicine & Helping Patients",
        hindiLabel: "स्वास्थ्य सेवा, चिकित्सा और रोगियों की देखभाल",
        hinglishLabel: "Healthcare, Medicine aur Patients ki dekhbhal",
        description: "Understanding human biology, medical diagnosis, and care.",
        iconName: "Stethoscope",
        associatedStreams: ["MEDICAL_PCB"],
        traits: ["Empathy", "Clinical Care", "Biological Sciences"],
      },
      {
        id: "technology_coding_ai",
        label: "Technology, Coding & Space Innovation",
        hindiLabel: "प्रौद्योगिकी, कोडिंग और अंतरिक्ष नवाचार",
        hinglishLabel: "Technology, Coding aur Space Innovation",
        description: "Building software, hardware, robots, and exploring space.",
        iconName: "Binary",
        associatedStreams: ["NON_MEDICAL_PCM"],
        traits: ["Algorithmic Thinking", "System Design", "Engineering"],
      },
      {
        id: "finance_markets_business",
        label: "Finance, Stocks, CA & Business Strategy",
        hindiLabel: "वित्त, शेयर बाजार, सीए और व्यावसायिक रणनीति",
        hinglishLabel: "Finance, Stock Market, CA aur Business Strategy",
        description: "Analyzing investments, auditing accounts, and understanding market trends.",
        iconName: "Coins",
        associatedStreams: ["COMMERCE", "MANAGEMENT"],
        traits: ["Financial Literacy", "Analytical Mindset", "Market Acumen"],
      },
      {
        id: "justice_governance_policy",
        label: "Law, Civil Governance & Social Justice",
        hindiLabel: "कानून, नागरिक शासन और सामाजिक न्याय",
        hinglishLabel: "Law, Civil Governance aur Social Justice",
        description: "Public administration, legal advocacy, and policy drafting.",
        iconName: "Scale",
        associatedStreams: ["LAW", "ARTS_HUMANITIES"],
        traits: ["Advocacy", "Constitutional Knowledge", "Civic Awareness"],
      },
      {
        id: "design_visual_media",
        label: "Creative Arts, UI/UX, Films & Visuals",
        hindiLabel: "रचनात्मक कला, यूआई/यूएक्स, फिल्में और दृश्य डिजाइन",
        hinglishLabel: "Creative Arts, UI/UX, Films aur Visual Design",
        description: "Graphic design, video production, storytelling, and UI/UX.",
        iconName: "Palette",
        associatedStreams: ["CREATIVE_DESIGN", "ARTS_HUMANITIES"],
        traits: ["Visual Creativity", "Storytelling", "Aesthetics"],
      },
      {
        id: "agriculture_environment_green",
        label: "Agriculture, Clean Energy & Nature",
        hindiLabel: "कृषि, स्वच्छ ऊर्जा और पर्यावरण संरक्षण",
        hinglishLabel: "Agriculture, Clean Energy aur Nature conservation",
        description: "Modern organic farming, solar power, and biodiversity protection.",
        iconName: "Sprout",
        associatedStreams: ["AGRICULTURE", "INTERDISCIPLINARY"],
        traits: ["Environmental Stewardship", "Sustainability", "Agronomy"],
      },
      {
        id: "hands_on_trades_robotics",
        label: "Hands-on Machines, EV Tech & Trades",
        hindiLabel: "हैंड्स-ऑन मशीनें, ईवी तकनीक और व्यावसायिक ट्रेड्स",
        hinglishLabel: "Hands-on Machines, EV Tech aur Practical Trades",
        description: "Working with drone piloting, electric vehicles, and CNC precision tools.",
        iconName: "Wrench",
        associatedStreams: ["VOCATIONAL_TRADES"],
        traits: ["Practical Mechanics", "Technical Precision", "Fieldwork"],
      },
      {
        id: "not_sure",
        label: "Not Sure Yet / Still Exploring",
        hindiLabel: "अभी निश्चित नहीं / खोज जारी है",
        hinglishLabel: "Abhi sure nahi hoon / Explore kar raha hoon",
        description: "I want KAABIL to help me discover what suits me best.",
        iconName: "Compass",
        associatedStreams: ["UNDECIDED"],
        traits: ["Open Curiosity", "Exploratory"],
      },
    ],
  },

  // Question 2: Subject Preferences
  {
    id: "q2_subjects",
    dimension: "SUBJECT_PREFERENCES",
    title: "Which subjects do you feel most comfortable learning?",
    hindiTitle: "किन विषयों को पढ़ने में आप सबसे अधिक सहज महसूस करते हैं?",
    hinglishTitle: "Kaun se subjects padhte waqt aap sabse comfortable feel karte hain?",
    subtitle: "Select the subjects where you feel engaged or capable (select 2–4).",
    hindiSubtitle: "उन विषयों का चयन करें जिनमें आप रुचि या आत्मविश्वास महसूस करते हैं (2-4 चुनें)।",
    hinglishSubtitle: "Wo subjects choose karein jinme aap engaged feel karte hain (select 2-4).",
    isMultiSelect: true,
    maxSelections: 4,
    options: [
      {
        id: "sub_biology",
        label: "Biology & Life Sciences",
        hindiLabel: "जीव विज्ञान और लाइफ साइंसेज",
        hinglishLabel: "Biology aur Life Sciences",
        iconName: "Microscope",
        associatedStreams: ["MEDICAL_PCB", "AGRICULTURE"],
      },
      {
        id: "sub_mathematics",
        label: "Mathematics & Statistics",
        hindiLabel: "गणित और सांख्यिकी",
        hinglishLabel: "Mathematics aur Statistics",
        iconName: "Calculator",
        associatedStreams: ["NON_MEDICAL_PCM", "COMMERCE"],
      },
      {
        id: "sub_physics_chem",
        label: "Physics & Chemistry",
        hindiLabel: "भौतिक विज्ञान और रसायन विज्ञान",
        hinglishLabel: "Physics aur Chemistry",
        iconName: "Atom",
        associatedStreams: ["NON_MEDICAL_PCM", "MEDICAL_PCB"],
      },
      {
        id: "sub_accountancy_econ",
        label: "Accountancy & Economics",
        hindiLabel: "लेखाशास्त्र और अर्थशास्त्र",
        hinglishLabel: "Accountancy aur Economics",
        iconName: "TrendingUp",
        associatedStreams: ["COMMERCE", "MANAGEMENT"],
      },
      {
        id: "sub_history_polscience",
        label: "History, Politics & Sociology",
        hindiLabel: "इतिहास, राजनीति विज्ञान और समाजशास्त्र",
        hinglishLabel: "History, Political Science aur Sociology",
        iconName: "BookOpen",
        associatedStreams: ["ARTS_HUMANITIES", "LAW"],
      },
      {
        id: "sub_computers_coding",
        label: "Computer Science & Informatics",
        hindiLabel: "कंप्यूटर विज्ञान और सूचना विज्ञान",
        hinglishLabel: "Computer Science aur Coding",
        iconName: "Terminal",
        associatedStreams: ["NON_MEDICAL_PCM"],
      },
      {
        id: "sub_art_media",
        label: "Visual Arts, Media & Literature",
        hindiLabel: "दृश्य कला, मीडिया और साहित्य",
        hinglishLabel: "Visual Arts, Media aur Literature",
        iconName: "Feather",
        associatedStreams: ["CREATIVE_DESIGN", "ARTS_HUMANITIES"],
      },
      {
        id: "sub_open",
        label: "Open to Exploring Different Subjects",
        hindiLabel: "विभिन्न विषयों को एक्सप्लोर करने के लिए तैयार",
        hinglishLabel: "Different subjects explore karne ke liye ready",
        iconName: "Sparkles",
        associatedStreams: ["UNDECIDED"],
      },
    ],
  },

  // Question 3: Logical Reasoning (Situation-based)
  {
    id: "q3_logic",
    dimension: "LOGICAL_REASONING",
    title: "How do you prefer to solve an unfamiliar problem?",
    hindiTitle: "आप किसी अपरिचित समस्या को कैसे हल करना पसंद करते हैं?",
    hinglishTitle: "Aap kisi nayi problem ko kaise solve karna pasand karte hain?",
    subtitle: "Real-world Scenario: You are tasked with organizing an important inter-school exhibition on a tight deadline.",
    hindiSubtitle: "वास्तविक परिदृश्य: आपको कम समय में एक महत्वपूर्ण अंतर-विद्यालय प्रदर्शनी आयोजित करने का काम सौंपा गया है।",
    hinglishSubtitle: "Real scenario: Aapko tight deadline mein ek inter-school exhibition organize karna hai.",
    scenario: "You are tasked with organizing an important inter-school exhibition on a tight deadline.",
    hindiScenario: "आपको कम समय में एक महत्वपूर्ण अंतर-विद्यालय प्रदर्शनी आयोजित करने का काम सौंपा गया है।",
    isMultiSelect: false,
    options: [
      {
        id: "logic_step_by_step",
        label: "Break it down into a step-by-step checklist and structured timeline",
        hindiLabel: "इसे चरणबद्ध चेकलिस्ट और संरचित समय-सीमा में विभाजित करना",
        hinglishLabel: "Step-by-step checklist aur structured timeline banana",
        description: "You like clear logic, order, and structured planning.",
        iconName: "CheckSquare",
        traits: ["Analytical", "Structured", "Methodical"],
      },
      {
        id: "logic_root_cause",
        label: "Analyze data and potential risks before making decisions",
        hindiLabel: "निर्णय लेने से पहले डेटा और संभावित जोखिमों का विश्लेषण करना",
        hinglishLabel: "Decision lene se pehle data aur risks analyze karna",
        description: "You rely on factual evidence and risk mitigation.",
        iconName: "FileSpreadsheet",
        traits: ["Critical Thinking", "Risk Assessment"],
      },
      {
        id: "logic_collaborative",
        label: "Gather opinions from teammates and brainstorm solutions together",
        hindiLabel: "साथियों की राय एकत्र करना और मिलकर समाधान तलाशना",
        hinglishLabel: "Team ke opinions lena aur milkar brainstorming karna",
        description: "You thrive when synthesizing diverse perspectives.",
        iconName: "Users",
        traits: ["Collaborative", "Synthesis"],
      },
      {
        id: "logic_experimental",
        label: "Jump in with a quick prototype and iterate through trial and error",
        hindiLabel: "तुरंत एक प्रोटोटाइप बनाकर प्रयोग करना और सुधार करना",
        hinglishLabel: "Quick prototype banakar experiment karna aur refine karna",
        description: "You learn by doing and experimenting practically.",
        iconName: "Lightbulb",
        traits: ["Agile", "Pragmatic", "Intuitive"],
      },
    ],
  },

  // Question 4: Creativity & Design Thinking (Situation-based)
  {
    id: "q4_creativity",
    dimension: "CREATIVITY",
    title: "When given complete freedom to express an idea, what do you create?",
    hindiTitle: "जब आपको कोई विचार व्यक्त करने की पूरी स्वतंत्रता दी जाती है, तो आप क्या बनाते हैं?",
    hinglishTitle: "Jab aapko apna idea express karne ki poori freedom milti hai, to aap kya create karte hain?",
    subtitle: "Scenario: Your team needs to spread awareness about clean drinking water in your town.",
    hindiSubtitle: "परिदृश्य: आपकी टीम को आपके कस्बे में स्वच्छ पेयजल के बारे में जागरूकता फैलानी है।",
    hinglishSubtitle: "Scenario: Aapki team ko town mein clean drinking water ke baare mein awareness failani hai.",
    scenario: "Your team needs to spread awareness about clean drinking water in your town.",
    hindiScenario: "आपकी टीम को आपके कस्बे में स्वच्छ पेयजल के बारे में जागरूकता फैलानी है।",
    isMultiSelect: false,
    options: [
      {
        id: "creative_visual",
        label: "A visually striking poster, video, or digital illustration",
        hindiLabel: "एक आकर्षक पोस्टर, वीडियो या डिजिटल चित्रण",
        hinglishLabel: "Eye-catching poster, short video ya digital illustration",
        iconName: "Image",
        associatedStreams: ["CREATIVE_DESIGN"],
        traits: ["Visual Arts", "Design Thinking"],
      },
      {
        id: "creative_technical_model",
        label: "A working low-cost water filtration model or mobile app alert",
        hindiLabel: "एक कम लागत वाला जल शोधन मॉडल या मोबाइल ऐप अलर्ट",
        hinglishLabel: "Working low-cost water filter model ya mobile app alert",
        iconName: "Cpu",
        associatedStreams: ["NON_MEDICAL_PCM", "VOCATIONAL_TRADES"],
        traits: ["Product Design", "Invention"],
      },
      {
        id: "creative_story_article",
        label: "A compelling story, editorial article, or podcast episode",
        hindiLabel: "एक प्रभावशाली कहानी, संपादकीय लेख या पॉडकास्ट एपिसोड",
        hinglishLabel: "Compelling story, editorial article ya podcast episode",
        iconName: "BookOpen",
        associatedStreams: ["ARTS_HUMANITIES"],
        traits: ["Narrative", "Journalism"],
      },
      {
        id: "creative_community_campaign",
        label: "A community street campaign engaging local leaders and youth",
        hindiLabel: "स्थानीय नेताओं और युवाओं को जोड़ने वाला जन जागरूकता अभियान",
        hinglishLabel: "Local leaders aur youth ko engage karne wala community campaign",
        iconName: "Megaphone",
        associatedStreams: ["MANAGEMENT", "LAW"],
        traits: ["Leadership", "Community Organizing"],
      },
    ],
  },

  // Question 5: Communication Style (Situation-based)
  {
    id: "q5_communication",
    dimension: "COMMUNICATION",
    title: "How do you communicate best in challenging situations?",
    hindiTitle: "चुनौतीपूर्ण परिस्थितियों में आप सबसे बेहतर संवाद कैसे करते हैं?",
    hinglishTitle: "Difficult situations mein aap sabse best communicate kaise karte hain?",
    subtitle: "Scenario: Two team members strongly disagree on a project direction right before a presentation.",
    hindiSubtitle: "परिदृश्य: प्रस्तुति से ठीक पहले दो साथी प्रोजेक्ट की दिशा पर असहमत हैं।",
    hinglishSubtitle: "Scenario: Presentation se pehle team ke do members mein disagreement ho gaya.",
    scenario: "Two team members strongly disagree on a project direction right before a presentation.",
    hindiScenario: "प्रस्तुति से ठीक पहले दो साथी प्रोजेक्ट की दिशा पर असहमत हैं।",
    isMultiSelect: false,
    options: [
      {
        id: "comm_empathetic_mediator",
        label: "Listen patiently to both sides and find a fair, respectful compromise",
        hindiLabel: "दोनों पक्षों को धैर्यपूर्वक सुनना और एक उचित समझौता निकालना",
        hinglishLabel: "Dono sides ko patiently sunkar fair compromise nikalna",
        iconName: "HeartHandshake",
        traits: ["Empathetic", "Counseling", "Mediation"],
      },
      {
        id: "comm_facts_logic",
        label: "Present objective data and facts to resolve the dispute neutrally",
        hindiLabel: "तटस्थ रूप से विवाद सुलझाने के लिए निष्पक्ष डेटा और तथ्य प्रस्तुत करना",
        hinglishLabel: "Objective facts aur data dikhakar neutrally resolve karna",
        iconName: "BarChart3",
        traits: ["Objective", "Data-Driven"],
      },
      {
        id: "comm_persuasive_leader",
        label: "Take charge, articulate a clear decision, and rally the team forward",
        hindiLabel: "नेतृत्व संभालना, स्पष्ट निर्णय रखना और टीम को आगे बढ़ाना",
        hinglishLabel: "Charge lena, clear decision articulate karna aur team ko aage badhana",
        iconName: "Award",
        traits: ["Persuasive", "Leadership"],
      },
      {
        id: "comm_written_structured",
        label: "Write down the key pros and cons in a concise summary memo",
        hindiLabel: "संक्षिप्त मेमो में मुख्य फायदे और नुकसान लिखकर साझा करना",
        hinglishLabel: "Short summary memo mein key pros & cons clearly likhna",
        iconName: "FileText",
        traits: ["Written Clarity", "Structured"],
      },
    ],
  },

  // Question 6: Practical Problem Solving
  {
    id: "q6_practical",
    dimension: "PRACTICAL_PROBLEM_SOLVING",
    title: "Which type of challenge makes you feel most accomplished?",
    hindiTitle: "किस प्रकार की चुनौती को हल करने पर आपको सबसे अधिक संतुष्टि मिलती है?",
    hinglishTitle: "Kaun sa challenge solve karke aapko sabse zyada satisfaction milti hai?",
    subtitle: "Think of an accomplishment that made you genuinely proud.",
    hindiSubtitle: "उस उपलब्धि के बारे में सोचें जिस पर आपको वास्तव में गर्व महसूस हुआ।",
    hinglishSubtitle: "Aise achievement ke baare mein sochein jisse aapko proud feel hua ho.",
    isMultiSelect: false,
    options: [
      {
        id: "prac_curing_comforting",
        label: "Relieving someone's pain, treating an illness, or supporting personal well-being",
        hindiLabel: "किसी का दर्द कम करना, बीमारी का इलाज करना या व्यक्तिगत कल्याण में मदद करना",
        hinglishLabel: "Kisi ka dard kam karna, treat karna ya well-being mein madad karna",
        iconName: "ShieldAlert",
        associatedStreams: ["MEDICAL_PCB"],
        traits: ["Clinical Impact", "Care"],
      },
      {
        id: "prac_building_fixing",
        label: "Fixing a broken machine, building a circuit, or writing clean working code",
        hindiLabel: "खराब मशीन को ठीक करना, सर्किट बनाना या सही कोड लिखना",
        hinglishLabel: "Machine repair karna, circuit assemble karna ya clean code likhna",
        iconName: "Wrench",
        associatedStreams: ["NON_MEDICAL_PCM", "VOCATIONAL_TRADES"],
        traits: ["Technical Problem Solving"],
      },
      {
        id: "prac_optimizing_saving",
        label: "Balancing a budget, cutting unnecessary costs, or organizing a profitable plan",
        hindiLabel: "बजट संतुलित करना, अनावश्यक खर्च घटाना या लाभदायक योजना बनाना",
        hinglishLabel: "Budget balance karna, unnecessary expense bachana ya profitable plan banana",
        iconName: "DollarSign",
        associatedStreams: ["COMMERCE", "MANAGEMENT"],
        traits: ["Financial Optimization"],
      },
      {
        id: "prac_standing_rights",
        label: "Advocating for someone who was treated unfairly and securing their justice",
        hindiLabel: "किसी अन्याय के शिकार व्यक्ति के अधिकारों के लिए खड़ा होना और न्याय दिलाना",
        hinglishLabel: "Kisi ke fair rights ke liye stand lena aur unhe justice dilana",
        iconName: "Scale",
        associatedStreams: ["LAW", "ARTS_HUMANITIES"],
        traits: ["Justice Advocacy"],
      },
    ],
  },

  // Question 7: Workstyle Preferences
  {
    id: "q7_workstyle",
    dimension: "WORKSTYLE_PREFERENCES",
    title: "What is your ideal day-to-day work environment?",
    hindiTitle: "आपका आदर्श दैनिक कार्य वातावरण कैसा होना चाहिए?",
    hinglishTitle: "Aapka ideal day-to-day work environment kaisa hona chahiye?",
    subtitle: "Where do you envision yourself working happily over the long term?",
    hindiSubtitle: "आप लंबे समय में खुद को किस प्रकार के वातावरण में काम करते हुए देखते हैं?",
    hinglishSubtitle: "Long term mein aap khud ko kis environment mein happily kaam karte dekhte hain?",
    isMultiSelect: false,
    options: [
      {
        id: "env_hospital_clinic",
        label: "Hospitals, diagnostic labs, or healthcare clinics",
        hindiLabel: "अस्पताल, डायग्नोस्टिक लैब या स्वास्थ्य केंद्र",
        hinglishLabel: "Hospitals, diagnostic labs ya healthcare clinics",
        iconName: "Cross",
        associatedStreams: ["MEDICAL_PCB"],
      },
      {
        id: "env_office_tech",
        label: "Modern tech office, corporate headquarters, or remote workstation",
        hindiLabel: "आधुनिक टेक कार्यालय, कॉर्पोरेट मुख्यालय या रिमोट वर्कस्टेशन",
        hinglishLabel: "Modern tech office, corporate HQ ya remote work setup",
        iconName: "Laptop",
        associatedStreams: ["NON_MEDICAL_PCM", "MANAGEMENT", "COMMERCE"],
      },
      {
        id: "env_field_outdoors",
        label: "Outdoors, agricultural farms, sports grounds, or flight skies",
        hindiLabel: "खुले मैदान, कृषि फार्म, खेल के मैदान या विमानन आकाश",
        hinglishLabel: "Outdoors, agricultural farms, sports fields ya aviation skies",
        iconName: "Sun",
        associatedStreams: ["AGRICULTURE", "SPORTS_PHYSICAL_ED", "VOCATIONAL_TRADES"],
      },
      {
        id: "env_court_public",
        label: "Courts of law, civil secretariats, or community centers",
        hindiLabel: "न्यायालय, नागरिक सचिवालय या सामुदायिक केंद्र",
        hinglishLabel: "Courts of law, civil secretariats ya community field centres",
        iconName: "Landmark",
        associatedStreams: ["LAW", "ARTS_HUMANITIES"],
      },
      {
        id: "env_creative_studio",
        label: "Design studio, animation bay, film set, or architectural workshop",
        hindiLabel: "डिजाइन स्टूडियो, एनिमेशन बे, फिल्म सेट या आर्किटेक्चर वर्कशॉप",
        hinglishLabel: "Design studio, animation lab, film set ya creative workshop",
        iconName: "Palette",
        associatedStreams: ["CREATIVE_DESIGN"],
      },
    ],
  },

  // Question 8: Learning Goals & Immediate Horizon
  {
    id: "q8_goals",
    dimension: "LEARNING_GOALS",
    title: "What is your primary goal on KAABIL right now?",
    hindiTitle: "इस समय 'काबिल' पर आपका प्राथमिक लक्ष्य क्या है?",
    hinglishTitle: "Is time KAABIL par aapka primary goal kya hai?",
    subtitle: "This helps us tailor your roadmap and recommendations to your immediate needs.",
    hindiSubtitle: "यह आपके रोडमैप और सिफारिशों को आपकी प्राथमिक आवश्यकता के अनुसार अनुकूलित करने में मदद करता है।",
    hinglishSubtitle: "Isse hum aapke roadmap aur recommendations ko aapki need ke according customize kar sakenge.",
    isMultiSelect: false,
    options: [
      {
        id: "goal_stream_discovery",
        label: "I need help choosing the right educational stream (Class 10/11)",
        hindiLabel: "मुझे सही स्ट्रीम चुनने में मार्गदर्शन चाहिए (कक्षा 10/11)",
        hinglishLabel: "Mujhe right stream choose karne mein guidance chahiye (Class 10/11)",
        iconName: "Compass",
      },
      {
        id: "goal_entrance_prep",
        label: "I want to prepare for national entrance exams (NEET, JEE, CUET, CLAT, etc.)",
        hindiLabel: "मैं राष्ट्रीय प्रवेश परीक्षाओं (NEET, JEE, CUET, CLAT आदि) की तैयारी करना चाहता हूँ",
        hinglishLabel: "National entrance exams (NEET, JEE, CUET, CLAT, etc.) ki tayari karni hai",
        iconName: "GraduationCap",
      },
      {
        id: "goal_skills_projects",
        label: "I am in college and want to bridge skill gaps and build projects",
        hindiLabel: "मैं कॉलेज में हूँ और स्किल गैप कम करके प्रोजेक्ट बनाना चाहता हूँ",
        hinglishLabel: "Main college mein hoon aur skill gaps bridge karke projects banana chahta hoon",
        iconName: "Code",
      },
      {
        id: "goal_internships_jobs",
        label: "I want to prepare for verified internships or early career opportunities",
        hindiLabel: "मैं सत्यापित इंटर्नशिप या शुरुआती करियर अवसरों की तैयारी करना चाहता हूँ",
        hinglishLabel: "Verified internships ya early career opportunities ke liye prepare karna hai",
        iconName: "Briefcase",
      },
    ],
  },
];
