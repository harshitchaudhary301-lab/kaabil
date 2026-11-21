// ==============================================================================
// KAABIL (काबिल) — Native Node.js Database Seed Runner
// Universal Career, Education, Skill Development & Employment Ecosystem
// ==============================================================================

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const STREAMS = [
  { stream: "MEDICAL_PCB", title: "Medical & Healthcare", desc: "Healing, clinical research, patient care, and biotech innovation.", icon: "Stethoscope" },
  { stream: "NON_MEDICAL_PCM", title: "STEM & Pure Sciences", desc: "Engineering, mathematics, space tech, physical sciences, and software systems.", icon: "Binary" },
  { stream: "COMMERCE", title: "Commerce & Finance", desc: "Auditing, corporate taxation, investment banking, and actuarial analysis.", icon: "Coins" },
  { stream: "ARTS_HUMANITIES", title: "Arts & Humanities", desc: "Civil services, psychology, journalism, international relations, and public policy.", icon: "BookOpenCheck" },
  { stream: "LAW", title: "Law & Legal Studies", desc: "Constitutional litigation, corporate M&A, intellectual property, and judicial arbitration.", icon: "Scale" },
  { stream: "MANAGEMENT", title: "Management & Enterprise", desc: "Organizational strategy, supply chains, human capital, and venture leadership.", icon: "Briefcase" },
  { stream: "CREATIVE_DESIGN", title: "Creative Arts & Design", desc: "UI/UX, industrial product design, animation, visual storytelling, and fashion technology.", icon: "Palette" },
  { stream: "AGRICULTURE", title: "Agriculture & Food Sciences", desc: "Agritech, precision farming, food supply engineering, and soil genetics.", icon: "Sprout" },
  { stream: "VOCATIONAL_TRADES", title: "Vocational & Technical Trades", desc: "Industrial mechatronics, renewable energy tech, robotics maintenance, and precision machining.", icon: "Wrench" },
  { stream: "SPORTS_PHYSICAL_ED", title: "Sports & Physical Education", desc: "Sports management, athletic conditioning, sports physiotherapy, and telemetry analytics.", icon: "Trophy" },
  { stream: "HOSPITALITY_TOURISM", title: "Hospitality & Tourism", desc: "Luxury hotel operations, culinary arts, global aviation hospitality, and experience design.", icon: "UtensilsCrossed" },
  { stream: "INTERDISCIPLINARY", title: "Interdisciplinary & Emerging", desc: "Bioinformatics, climate data science, cognitive systems, and technology-policy synthesis.", icon: "Network" },
  { stream: "UNDECIDED", title: "Undecided / Career Discovery", desc: "Multi-disciplinary problem solving, foundational analytical skills, and diagnostic exploration.", icon: "HelpCircle" },
];

const CANONICAL_CAREERS = [
  {
    slug: "mbbs-doctor-physician",
    stream: "MEDICAL_PCB",
    domain: "Clinical Medicine & Surgery",
    title: "MBBS Doctor & General Physician",
    tagline: "Diagnose, treat, and heal patients across primary and emergency healthcare settings.",
    overview: "Medical practitioners examine patients, order and interpret diagnostic laboratory tests, prescribe medications, and coordinate patient recovery across hospital and clinical ecosystems.",
    dailyRoutine: "Morning rounds in patient wards, outpatient consultations, reviewing pathological and radiological reports, prescribing treatment regimens.",
    minStage: "UNDERGRADUATE",
    duration: "5.5 Years (4.5 Years Academic + 1 Year Mandatory Rotatory Internship)",
    salaryStart: 850000,
    salaryMid: 2400000,
    outlook: "Very High",
    automation: "Low",
    regulatory: "National Medical Commission (NMC)",
    exams: ["NEET-UG (National Eligibility cum Entrance Test)"],
    skills: [
      { name: "Clinical Diagnosis & Patient History", cat: "Domain Knowledge", level: "PROFICIENT", weight: 3.0, must: true },
      { name: "Pharmacology & Therapeutics", cat: "Domain Knowledge", level: "INTERMEDIATE", weight: 2.8, must: true },
      { name: "Emergency Life Support (BLS/ACLS)", cat: "Technical & Systems", level: "PROFICIENT", weight: 2.5, must: true },
      { name: "Patient Counseling & Medical Ethics", cat: "Interpersonal & Leadership", level: "PROFICIENT", weight: 2.2, must: true },
    ],
  },
  {
    slug: "ai-systems-engineer",
    stream: "NON_MEDICAL_PCM",
    domain: "Machine Intelligence & Software Architecture",
    title: "AI Systems & Machine Learning Engineer",
    tagline: "Architect, evaluate, and scale deep learning models for production infrastructure.",
    overview: "AI engineers build statistical learning architectures, optimize inference latencies, curate multi-modal datasets, and deploy explainable machine learning systems.",
    dailyRoutine: "Benchmarking transformer models, data pipeline curation, training loss monitoring, containerized microservice deployments.",
    minStage: "UNDERGRADUATE",
    duration: "4 Years B.Tech / B.E. (Computer Science / AI-ML / Data Science)",
    salaryStart: 1200000,
    salaryMid: 3600000,
    outlook: "Very High",
    automation: "Low",
    regulatory: "All India Council for Technical Education (AICTE)",
    exams: ["JEE Main & Advanced (Joint Entrance Examination)"],
    skills: [
      { name: "PyTorch & Deep Learning Frameworks", cat: "Technical & Systems", level: "PROFICIENT", weight: 3.0, must: true },
      { name: "Data Structures & Algorithm Design", cat: "Technical & Systems", level: "PROFICIENT", weight: 2.8, must: true },
      { name: "MLOps & Cloud Infrastructure (Kubernetes/Docker)", cat: "Technical & Systems", level: "INTERMEDIATE", weight: 2.4, must: false },
      { name: "Statistical Inference & Linear Algebra", cat: "Analytical & Quantitative", level: "PROFICIENT", weight: 2.5, must: true },
    ],
  },
  {
    slug: "chartered-accountant-icai",
    stream: "COMMERCE",
    domain: "Statutory Audit, Taxation & Corporate Advisory",
    title: "Chartered Accountant (CA - ICAI)",
    tagline: "Audit statutory accounts, structure corporate tax strategies, and ensure financial governance.",
    overview: "Chartered Accountants are statutory financial authorities in India recognized by the CA Act, 1949. They certify balance sheets, lead forensic auditing, advise on mergers, and optimize corporate tax compliance.",
    dailyRoutine: "Validating financial ledgers, auditing internal controls, filing corporate tax returns, advising corporate boards on financial risk.",
    minStage: "UNDERGRADUATE",
    duration: "4.5 to 5 Years (Foundation + Inter + 2 Years Mandatory Articleship + Final)",
    salaryStart: 1050000,
    salaryMid: 2800000,
    outlook: "High",
    automation: "Low",
    regulatory: "Institute of Chartered Accountants of India (ICAI)",
    exams: ["CA Foundation & Intermediate (ICAI)"],
    skills: [
      { name: "Statutory Financial Auditing & Ind AS", cat: "Domain Knowledge", level: "EXPERT", weight: 3.0, must: true },
      { name: "Direct & Indirect Corporate Taxation (GST/Income Tax)", cat: "Domain Knowledge", level: "PROFICIENT", weight: 2.9, must: true },
      { name: "Financial Forensic Analysis & Valuation", cat: "Analytical & Quantitative", level: "INTERMEDIATE", weight: 2.3, must: false },
      { name: "Corporate Governance & Ethics", cat: "Interpersonal & Leadership", level: "PROFICIENT", weight: 2.2, must: true },
    ],
  },
  {
    slug: "civil-services-officer-upsc",
    stream: "ARTS_HUMANITIES",
    domain: "Public Policy, Governance & District Administration",
    title: "Civil Services Officer (IAS / IPS / IFS)",
    tagline: "Lead district administration, enforce law and order, and implement national development policy.",
    overview: "Civil servants form the permanent administrative executive of India. They manage public revenue, execute social development schemes, oversee law enforcement, and formulate government policies.",
    dailyRoutine: "Conducting citizen grievance hearings, inspecting block infrastructure, coordinating district department heads, reviewing policy briefs.",
    minStage: "UNDERGRADUATE",
    duration: "3-4 Years Graduation + Competitive Preparation",
    salaryStart: 800000,
    salaryMid: 2100000,
    outlook: "High",
    automation: "Low",
    regulatory: "Union Public Service Commission (UPSC) / DoPT",
    exams: ["UPSC Civil Services Examination (CSE)"],
    skills: [
      { name: "Constitutional Law & Governance", cat: "Domain Knowledge", level: "EXPERT", weight: 3.0, must: true },
      { name: "Public Policy Analysis & Synthesis", cat: "Analytical & Quantitative", level: "PROFICIENT", weight: 2.8, must: true },
      { name: "Crisis Management & Administrative Leadership", cat: "Interpersonal & Leadership", level: "PROFICIENT", weight: 2.7, must: true },
      { name: "Socio-Economic Development Telemetry", cat: "Analytical & Quantitative", level: "INTERMEDIATE", weight: 2.1, must: false },
    ],
  },
  {
    slug: "corporate-lawyer-mna",
    stream: "LAW",
    domain: "Corporate Jurisprudence, M&A & Commercial Contracts",
    title: "Corporate Law Attorney & Transaction Counsel",
    tagline: "Structure cross-border transactions, draft commercial contracts, and protect corporate interests.",
    overview: "Corporate attorneys advise enterprises on regulatory compliance under the Companies Act 2013, negotiate private equity transactions, conduct due diligence, and draft binding contracts.",
    dailyRoutine: "Reviewing term sheets, drafting shareholder agreements, managing regulatory filings with SEBI / MCA, leading negotiation calls.",
    minStage: "UNDERGRADUATE",
    duration: "5 Years Integrated BA LLB / BBA LLB or 3 Years LLB",
    salaryStart: 1100000,
    salaryMid: 3200000,
    outlook: "Very High",
    automation: "Low",
    regulatory: "Bar Council of India (BCI)",
    exams: ["CLAT (Common Law Admission Test)"],
    skills: [
      { name: "Commercial Contract Drafting & Review", cat: "Domain Knowledge", level: "PROFICIENT", weight: 3.0, must: true },
      { name: "Companies Act 2013 & SEBI Regulations", cat: "Domain Knowledge", level: "PROFICIENT", weight: 2.8, must: true },
      { name: "Legal Negotiation & Risk Mitigation", cat: "Interpersonal & Leadership", level: "PROFICIENT", weight: 2.5, must: true },
      { name: "Due Diligence & Title Audit", cat: "Analytical & Quantitative", level: "INTERMEDIATE", weight: 2.2, must: false },
    ],
  },
  {
    slug: "enterprise-product-manager",
    stream: "MANAGEMENT",
    domain: "Product Strategy, Analytics & Market Execution",
    title: "Enterprise Product Manager (SaaS & Platforms)",
    tagline: "Define user roadmaps, prioritize engineering backlogs, and drive business growth.",
    overview: "Product Managers sit at the intersection of business, technology, and user experience. They discover market opportunities, define functional specifications, and align engineering sprints.",
    dailyRoutine: "Synthesizing customer interviews, reviewing product analytics funnels, running backlog grooming with engineers, presenting roadmap metrics.",
    minStage: "UNDERGRADUATE",
    duration: "3-4 Years Graduation + Optional MBA",
    salaryStart: 1400000,
    salaryMid: 3800000,
    outlook: "Very High",
    automation: "Low",
    regulatory: "National Educational Standards (UGC / AICTE)",
    exams: ["CUET-UG (Common University Entrance Test)"],
    skills: [
      { name: "Product Strategy & PRD Authoring", cat: "Domain Knowledge", level: "PROFICIENT", weight: 3.0, must: true },
      { name: "Quantitative Product Analytics & SQL", cat: "Analytical & Quantitative", level: "PROFICIENT", weight: 2.7, must: true },
      { name: "Cross-Functional Stakeholder Management", cat: "Interpersonal & Leadership", level: "PROFICIENT", weight: 2.6, must: true },
      { name: "User Research & Usability Testing", cat: "Technical & Systems", level: "INTERMEDIATE", weight: 2.2, must: false },
    ],
  },
  {
    slug: "ui-ux-product-designer",
    stream: "CREATIVE_DESIGN",
    domain: "Interactive Experience Architecture & User Research",
    title: "UI/UX & Digital Product Design Architect",
    tagline: "Craft intuitive, accessible digital experiences grounded in ergonomic research.",
    overview: "UI/UX architects conduct heuristic evaluations, build responsive design systems, construct clickable interactive prototypes, and validate usability.",
    dailyRoutine: "Synthesizing usability recordings, evolving Figma design system tokens, producing high-fidelity interface mockups, conducting developer design handoffs.",
    minStage: "UNDERGRADUATE",
    duration: "4 Years B.Des / B.Voc or Professional Portfolio",
    salaryStart: 750000,
    salaryMid: 2200000,
    outlook: "Very High",
    automation: "Low",
    regulatory: "National Institute of Design (NID) / AICTE",
    exams: ["NIFT Entrance Examination"],
    skills: [
      { name: "Figma & Design System Architecture", cat: "Technical & Systems", level: "PROFICIENT", weight: 3.0, must: true },
      { name: "User Journey Mapping & Information Architecture", cat: "Domain Knowledge", level: "PROFICIENT", weight: 2.7, must: true },
      { name: "Usability Testing & Accessibility (WCAG 2.1)", cat: "Technical & Systems", level: "INTERMEDIATE", weight: 2.5, must: true },
      { name: "Micro-Interaction Prototyping", cat: "Technical & Systems", level: "INTERMEDIATE", weight: 2.0, must: false },
    ],
  },
  {
    slug: "precision-agritech-specialist",
    stream: "AGRICULTURE",
    domain: "Smart Irrigation, Crop Telemetry & Soil Genetics",
    title: "Precision Agritech Specialist & Hydroponics Lead",
    tagline: "Deploy IoT telemetry, drone sensing, and hydroponic systems for maximum crop yield.",
    overview: "Agritech specialists integrate biological crop science with IoT telemetry, automated micro-irrigation, and satellite soil mapping to improve food security.",
    dailyRoutine: "Calibrating automated fertigation lines, analyzing drone multispectral imagery, monitoring greenhouse microclimates, consulting with farmer cooperatives.",
    minStage: "UNDERGRADUATE",
    duration: "4 Years B.Sc (Hons) Agriculture / Agritech",
    salaryStart: 600000,
    salaryMid: 1800000,
    outlook: "Very High",
    automation: "Low",
    regulatory: "Indian Council of Agricultural Research (ICAR)",
    exams: ["ICAR AIEEA (Indian Council of Agricultural Research)"],
    skills: [
      { name: "Hydroponic & Controlled-Environment Agriculture", cat: "Technical & Systems", level: "PROFICIENT", weight: 3.0, must: true },
      { name: "Soil Chemistry & Nutrient Diagnostics", cat: "Domain Knowledge", level: "PROFICIENT", weight: 2.8, must: true },
      { name: "IoT Sensor Telemetry & Drone Analytics", cat: "Technical & Systems", level: "INTERMEDIATE", weight: 2.3, must: false },
      { name: "Agricultural Extension & Farmer Communication", cat: "Interpersonal & Leadership", level: "INTERMEDIATE", weight: 2.0, must: true },
    ],
  },
  {
    slug: "industrial-automation-technician",
    stream: "VOCATIONAL_TRADES",
    domain: "PLC Robotics, Mechatronics & Smart Factory Maintenance",
    title: "Industrial Automation & Robotics Technician",
    tagline: "Program PLC controllers, maintain industrial robot arms, and optimize factory automation.",
    overview: "Automation technicians install, troubleshoot, and calibrate programmable logic controllers (PLCs), robotic arms, variable frequency drives, and automated assembly conveyors.",
    dailyRoutine: "Writing PLC ladder logic, troubleshooting robotic servos, performing sensor calibrations, optimizing manufacturing line cycle times.",
    minStage: "ITI",
    duration: "2-3 Years ITI / Polytechnic Diploma in Mechatronics",
    salaryStart: 450000,
    salaryMid: 1200000,
    outlook: "High",
    automation: "Low",
    regulatory: "Directorate General of Training (DGT) / NCVT",
    exams: ["CUET-UG (Common University Entrance Test)"],
    skills: [
      { name: "PLC Programming (Siemens/Allen-Bradley)", cat: "Technical & Systems", level: "PROFICIENT", weight: 3.0, must: true },
      { name: "Industrial Pneumatics & Hydraulics", cat: "Technical & Systems", level: "INTERMEDIATE", weight: 2.8, must: true },
      { name: "Electrical Schematics & Diagnostic Multimeters", cat: "Technical & Systems", level: "PROFICIENT", weight: 2.6, must: true },
      { name: "Factory Safety Standards & OSHA Protocols", cat: "Domain Knowledge", level: "INTERMEDIATE", weight: 2.2, must: true },
    ],
  },
  {
    slug: "sports-physiotherapist",
    stream: "SPORTS_PHYSICAL_ED",
    domain: "Kinesiology, Musculoskeletal Recovery & Athletic Performance",
    title: "Sports Physiotherapist & Performance Coach",
    tagline: "Rehabilitate acute athletic injuries, optimize biomechanics, and prevent training fatigue.",
    overview: "Sports physiotherapists evaluate muscular imbalances, design targeted recovery routines, lead post-operative rehabilitation, and monitor athletic workload telemetry.",
    dailyRoutine: "Conducting pre-game kinetic assessments, administering manual therapy, designing eccentric strengthening protocols, reviewing player fatigue telemetry.",
    minStage: "UNDERGRADUATE",
    duration: "4.5 Years Bachelor of Physiotherapy (BPT)",
    salaryStart: 650000,
    salaryMid: 1900000,
    outlook: "Very High",
    automation: "Low",
    regulatory: "National Commission for Allied and Healthcare Professions (NCAHP)",
    exams: ["NEET-UG (National Eligibility cum Entrance Test)"],
    skills: [
      { name: "Musculoskeletal Assessment & Kinetic Rehabilitation", cat: "Domain Knowledge", level: "PROFICIENT", weight: 3.0, must: true },
      { name: "Sports Taping & Acute Joint Mobilization", cat: "Technical & Systems", level: "PROFICIENT", weight: 2.7, must: true },
      { name: "Athletic Load Telemetry & Recovery Protocols", cat: "Analytical & Quantitative", level: "INTERMEDIATE", weight: 2.3, must: false },
      { name: "Athlete Psychology & Motivation", cat: "Interpersonal & Leadership", level: "INTERMEDIATE", weight: 2.0, must: true },
    ],
  },
  {
    slug: "luxury-hotel-general-manager",
    stream: "HOSPITALITY_TOURISM",
    domain: "Resort Operations, Guest Experience & F&B Direction",
    title: "Luxury Hotel General Manager & Asset Lead",
    tagline: "Direct 5-star resort operations, maintain world-class guest satisfaction, and maximize revenue.",
    overview: "Hotel General Managers oversee revenue management, culinary standards, housekeeping quality, and VIP guest experiences across luxury hotel properties.",
    dailyRoutine: "Morning operational briefing with department heads, inspecting executive suites, reviewing RevPAR metrics, greeting VIP dignitaries.",
    minStage: "UNDERGRADUATE",
    duration: "3-4 Years B.Sc Hospitality & Hotel Administration",
    salaryStart: 800000,
    salaryMid: 2800000,
    outlook: "High",
    automation: "Low",
    regulatory: "National Council for Hotel Management and Catering Technology (NCHMCT)",
    exams: ["CUET-UG (Common University Entrance Test)"],
    skills: [
      { name: "Hospitality Revenue Management & RevPAR Optimization", cat: "Analytical & Quantitative", level: "PROFICIENT", weight: 3.0, must: true },
      { name: "Guest Experience Architecture & Concierge Standards", cat: "Domain Knowledge", level: "EXPERT", weight: 2.8, must: true },
      { name: "Hotel Property Operations & F&B Governance", cat: "Technical & Systems", level: "PROFICIENT", weight: 2.5, must: true },
      { name: "High-EQ Crisis Resolution & Diplomatic Protocol", cat: "Interpersonal & Leadership", level: "EXPERT", weight: 2.6, must: true },
    ],
  },
  {
    slug: "bioinformatics-climate-scientist",
    stream: "INTERDISCIPLINARY",
    domain: "Computational Genomics, Climate Telemetry & Ecosystem Modeling",
    title: "Bioinformatics & Climate Systems Scientist",
    tagline: "Apply high-performance computing to genomic sequences and planetary climate models.",
    overview: "Interdisciplinary scientists combine molecular biology, computer science, and satellite telemetry to track biodiversity loss, predict disease vectors, and engineer resilient crops.",
    dailyRoutine: "Running sequence alignment algorithms on HPC clusters, analyzing satellite raster telemetry, modeling carbon capture cycles, writing multi-disciplinary grants.",
    minStage: "UNDERGRADUATE",
    duration: "4 Years B.Sc / B.Tech in Computational Biology or Interdisciplinary Sciences",
    salaryStart: 850000,
    salaryMid: 2600000,
    outlook: "Very High",
    automation: "Low",
    regulatory: "Department of Biotechnology (DBT) / ICMR",
    exams: ["CUET-UG (Common University Entrance Test)"],
    skills: [
      { name: "Genomic Sequence Alignment (BLAST/NGS)", cat: "Technical & Systems", level: "PROFICIENT", weight: 3.0, must: true },
      { name: "Python / Biopython & R Statistical Modeling", cat: "Technical & Systems", level: "PROFICIENT", weight: 2.8, must: true },
      { name: "Climate Telemetry & Satellite Raster Modeling", cat: "Analytical & Quantitative", level: "INTERMEDIATE", weight: 2.2, must: false },
      { name: "Interdisciplinary Synthesis & Communication", cat: "Interpersonal & Leadership", level: "PROFICIENT", weight: 2.0, must: true },
    ],
  },
  {
    slug: "multidisciplinary-analyst",
    stream: "UNDECIDED",
    domain: "Structured Problem Solving & Strategy Analysis",
    title: "Multi-Disciplinary Analyst & Strategy Associate",
    tagline: "Explore analytical strengths across business, communication, and digital research.",
    overview: "Ideal starting pathway for students exploring multiple interests. Focuses on quantitative reasoning, structured hypothesis testing, and cross-sector market synthesis.",
    dailyRoutine: "Conducting market research, summarizing sector reports, building basic financial and data models, preparing synthesis briefs.",
    minStage: "UNDERGRADUATE",
    duration: "Flexible 3-Year Diagnostic Discovery (BA / B.Sc / B.Com)",
    salaryStart: 600000,
    salaryMid: 1600000,
    outlook: "High",
    automation: "Medium",
    regulatory: "University Grants Commission (UGC)",
    exams: ["CUET-UG (Common University Entrance Test)"],
    skills: [
      { name: "Structured Problem Solving & Issue Trees", cat: "Analytical & Quantitative", level: "PROFICIENT", weight: 3.0, must: true },
      { name: "Written & Oral Business Articulation", cat: "Interpersonal & Leadership", level: "PROFICIENT", weight: 2.5, must: true },
      { name: "Data Fluency & Spreadsheet Models", cat: "Technical & Systems", level: "INTERMEDIATE", weight: 2.5, must: true },
      { name: "Cross-Domain Adaptability", cat: "Domain Knowledge", level: "PROFICIENT", weight: 2.0, must: true },
    ],
  },
];

async function seed() {
  console.log("🌱 Starting KAABIL Idempotent Database Seed (Native Node.js)...");

  // 1. Domains
  console.log("-> 1/5 Seeding 13 Educational Domains...");
  for (let i = 0; i < STREAMS.length; i++) {
    const s = STREAMS[i];
    await prisma.domain.upsert({
      where: { name: s.title },
      update: {
        stream: s.stream,
        description: s.desc,
        orderIndex: i,
        isActive: true,
      },
      create: {
        name: s.title,
        code: `DOM_${s.stream}`,
        stream: s.stream,
        description: s.desc,
        iconName: s.icon,
        orderIndex: i,
        isActive: true,
      },
    });
  }

  // 2. Skill Categories
  console.log("-> 2/5 Seeding Skill Categories...");
  const catNames = [
    "Technical & Systems",
    "Domain Knowledge",
    "Analytical & Quantitative",
    "Interpersonal & Leadership",
  ];
  const catMap = new Map();
  for (const name of catNames) {
    const cat = await prisma.skillCategory.upsert({
      where: { name },
      update: {},
      create: { name, description: `Competency category for ${name}` },
    });
    catMap.set(name, cat.id);
  }

  // 3. Entrance Exams
  console.log("-> 3/5 Seeding National Entrance Examinations...");
  const exams = [
    { name: "NEET-UG (National Eligibility cum Entrance Test)", code: "NEET_UG", body: "NTA" },
    { name: "JEE Main & Advanced (Joint Entrance Examination)", code: "JEE_MAIN_ADV", body: "NTA & IITs" },
    { name: "CLAT (Common Law Admission Test)", code: "CLAT", body: "Consortium of NLUs" },
    { name: "CUET-UG (Common University Entrance Test)", code: "CUET_UG", body: "NTA" },
    { name: "CA Foundation & Intermediate (ICAI)", code: "CA_ICAI", body: "ICAI" },
    { name: "UPSC Civil Services Examination (CSE)", code: "UPSC_CSE", body: "UPSC" },
    { name: "ICAR AIEEA (Indian Council of Agricultural Research)", code: "ICAR_AIEEA", body: "ICAR / NTA" },
    { name: "NIFT Entrance Examination", code: "NIFT_ENTRANCE", body: "NIFT" },
  ];
  const examMap = new Map();
  for (const ex of exams) {
    const record = await prisma.entranceExam.upsert({
      where: { shortCode: ex.code },
      update: { name: ex.name, conductingBody: ex.body },
      create: {
        name: ex.name,
        shortCode: ex.code,
        conductingBody: ex.body,
        frequency: "Annual",
        isNationalLevel: true,
      },
    });
    examMap.set(ex.code, record.id);
  }

  // 4. Careers & Multi-Stream Relations
  console.log("-> 4/5 Seeding Canonical Careers & Competency Graphs...");
  for (const career of CANONICAL_CAREERS) {
    const domain = await prisma.domain.findFirst({
      where: { stream: career.stream },
    });
    if (!domain) continue;

    const subCode = `SUB_${career.slug.toUpperCase().replace(/[^A-Z0-9]/g, "_")}`;
    const subDomain = await prisma.subDomain.upsert({
      where: { code: subCode },
      update: { name: career.domain },
      create: {
        domainId: domain.id,
        name: career.domain,
        code: subCode,
      },
    });

    const cp = await prisma.careerPath.upsert({
      where: { slug: career.slug },
      update: {
        subDomainId: subDomain.id,
        title: career.title,
        tagline: career.tagline,
        overview: career.overview,
        dailyRoutine: career.dailyRoutine,
        minEducationStage: career.minStage,
        typicalDuration: career.duration,
        avgStartingSalaryInr: career.salaryStart,
        avgMidCareerSalaryInr: career.salaryMid,
        growthOutlook: career.outlook,
        automationRisk: career.automation,
        regulatoryBody: career.regulatory,
        isRegulated: !!career.regulatory,
        isDemoData: true,
        verificationStatus: "VERIFIED",
      },
      create: {
        subDomainId: subDomain.id,
        title: career.title,
        slug: career.slug,
        tagline: career.tagline,
        overview: career.overview,
        dailyRoutine: career.dailyRoutine,
        minEducationStage: career.minStage,
        typicalDuration: career.duration,
        avgStartingSalaryInr: career.salaryStart,
        avgMidCareerSalaryInr: career.salaryMid,
        growthOutlook: career.outlook,
        automationRisk: career.automation,
        regulatoryBody: career.regulatory,
        isRegulated: !!career.regulatory,
        isDemoData: true,
        verificationStatus: "VERIFIED",
      },
    });

    // Multi-stream junction
    await prisma.careerPathStream.upsert({
      where: {
        careerPathId_stream: {
          careerPathId: cp.id,
          stream: career.stream,
        },
      },
      update: { isDirectFit: true, relevance: "PRIMARY" },
      create: {
        careerPathId: cp.id,
        stream: career.stream,
        isDirectFit: true,
        relevance: "PRIMARY",
      },
    });

    // Skills
    for (const sk of career.skills) {
      const catId = catMap.get(sk.cat) || catMap.get("Technical & Systems");
      const canonicalSlug = sk.name.toLowerCase().replace(/[^a-z0-9]/g, "-");
      const skillRecord = await prisma.skill.upsert({
        where: { name: sk.name },
        update: { isTechnical: sk.cat === "Technical & Systems" },
        create: {
          categoryId: catId,
          name: sk.name,
          canonicalSlug,
          isTechnical: sk.cat === "Technical & Systems",
        },
      });

      await prisma.careerSkillRequirement.upsert({
        where: {
          careerPathId_skillId: {
            careerPathId: cp.id,
            skillId: skillRecord.id,
          },
        },
        update: {
          requiredLevel: sk.level,
          weight: sk.weight,
          isMandatory: sk.must,
        },
        create: {
          careerPathId: cp.id,
          skillId: skillRecord.id,
          requiredLevel: sk.level,
          weight: sk.weight,
          isMandatory: sk.must,
        },
      });
    }

    // Exam linking
    for (const exName of career.exams) {
      let code = null;
      if (exName.includes("NEET")) code = "NEET_UG";
      else if (exName.includes("JEE")) code = "JEE_MAIN_ADV";
      else if (exName.includes("CLAT")) code = "CLAT";
      else if (exName.includes("CUET")) code = "CUET_UG";
      else if (exName.includes("CA")) code = "CA_ICAI";
      else if (exName.includes("UPSC")) code = "UPSC_CSE";
      else if (exName.includes("ICAR")) code = "ICAR_AIEEA";
      else if (exName.includes("NIFT")) code = "NIFT_ENTRANCE";

      if (code && examMap.has(code)) {
        await prisma.careerPathExam.upsert({
          where: {
            careerPathId_examId: {
              careerPathId: cp.id,
              examId: examMap.get(code),
            },
          },
          update: { isMandatory: true },
          create: {
            careerPathId: cp.id,
            examId: examMap.get(code),
            isMandatory: true,
          },
        });
      }
    }
  }

  // 5. Verification summary
  const [dCount, cCount, sCount, eCount] = await Promise.all([
    prisma.domain.count(),
    prisma.careerPath.count(),
    prisma.skill.count(),
    prisma.entranceExam.count(),
  ]);

  console.log("============================================================");
  console.log("✅ KAABIL Database Seed Complete!");
  console.log(`- Educational Streams / Domains Seeded : ${dCount} / 13`);
  console.log(`- Canonical Career Pathways Seeded    : ${cCount}`);
  console.log(`- Benchmark Competency Skills Seeded  : ${sCount}`);
  console.log(`- National Entrance Exams Seeded      : ${eCount}`);
  console.log("============================================================");
}

seed()
  .catch((e) => {
    console.error("⚠️ Seed Note: Could not execute PostgreSQL seed query.");
    console.error("Reason:", e.message);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
