// ==============================================================================
// KAABIL (काबिल) — Universal Career Requirements & Competency Benchmarks
// Canonical competencies, mandatory vs recommended skills, prerequisites,
// certifications, and council standards across all 13 Indian Educational Streams.
// ==============================================================================

export interface SkillRequirement {
  skillName: string;
  category: "Domain" | "Technical" | "Analytical" | "Interpersonal" | "Foundational";
  minimumLevel: 1 | 2 | 3 | 4 | 5; // 1=Novice, 5=Expert
  importanceWeight: number; // 1.0 to 3.0
  description: string;
  assessmentAvailable: boolean; // whether KAABIL has a corresponding assessment
}

export interface EducationalPrerequisite {
  stage: string;
  requirement: string;
  isMandatory: boolean;
}

export interface CertificationRequirement {
  name: string;
  issuingBody: string;
  isMandatory: boolean;
  description: string;
}

export interface ExperienceArea {
  area: string;
  recommendedMonths: number;
  description: string;
}

export interface CareerRequirement {
  careerSlug: string;
  careerTitle: string;
  stream: string;
  regulatoryBody?: string;
  mandatorySkills: SkillRequirement[];
  recommendedSkills: SkillRequirement[];
  educationalPrerequisites: EducationalPrerequisite[];
  certifications: CertificationRequirement[];
  experienceAreas: ExperienceArea[];
}

export const CAREER_REQUIREMENTS: Record<string, CareerRequirement> = {
  // --------------------------------------------------------------------------
  // 1. MEDICAL & HEALTHCARE (PCB)
  // --------------------------------------------------------------------------
  "mbbs-doctor": {
    careerSlug: "mbbs-doctor",
    careerTitle: "MBBS Doctor (General Physician)",
    stream: "MEDICAL_PCB",
    regulatoryBody: "National Medical Commission (NMC)",
    mandatorySkills: [
      {
        skillName: "Human Physiology",
        category: "Domain",
        minimumLevel: 4,
        importanceWeight: 3.0,
        description: "Deep understanding of cardiovascular, renal, endocrine, and neural systems.",
        assessmentAvailable: true,
      },
      {
        skillName: "Clinical Diagnosis & Examination",
        category: "Domain",
        minimumLevel: 4,
        importanceWeight: 3.0,
        description: "Patient examination, differential diagnosis formulation, and clinical observation.",
        assessmentAvailable: true,
      },
      {
        skillName: "Pharmacology & Drug Protocols",
        category: "Domain",
        minimumLevel: 3,
        importanceWeight: 2.8,
        description: "Pharmacokinetics, contraindications, dosage calculation, and antibiotic stewardship.",
        assessmentAvailable: false,
      },
      {
        skillName: "Emergency Life Support (BLS/ACLS)",
        category: "Technical",
        minimumLevel: 3,
        importanceWeight: 2.5,
        description: "Airway resuscitation, cardiac arrest protocols, and triage management.",
        assessmentAvailable: false,
      },
    ],
    recommendedSkills: [
      {
        skillName: "Patient Counseling & Medical Ethics",
        category: "Interpersonal",
        minimumLevel: 3,
        importanceWeight: 2.2,
        description: "Bedside manners, empathetic communication, and informed consent compliance.",
        assessmentAvailable: false,
      },
      {
        skillName: "Biomedical Research Methodology",
        category: "Analytical",
        minimumLevel: 2,
        importanceWeight: 1.8,
        description: "Literature review, clinical trials data analysis, and epidemiology metrics.",
        assessmentAvailable: false,
      },
    ],
    educationalPrerequisites: [
      { stage: "CLASS_12", requirement: "Physics, Chemistry & Biology with minimum 50% aggregate", isMandatory: true },
      { stage: "UNDERGRADUATE", requirement: "4.5 Years MBBS Curriculum + 1 Year Rotating Internship", isMandatory: true },
    ],
    certifications: [
      { name: "State Medical Council Registration", issuingBody: "NMC / State Medical Council", isMandatory: true, description: "Permanent license to practice medicine under NMC Act 2019" },
    ],
    experienceAreas: [
      { area: "Hospital Clinical Internship", recommendedMonths: 12, description: "Compulsory Rotating Medical Internship across medicine, surgery, and pediatrics" },
    ],
  },
  "dental-surgeon-bds": {
    careerSlug: "dental-surgeon-bds",
    careerTitle: "Dental Surgeon (BDS)",
    stream: "MEDICAL_PCB",
    regulatoryBody: "Dental Council of India (DCI)",
    mandatorySkills: [
      {
        skillName: "Human Physiology",
        category: "Domain",
        minimumLevel: 3,
        importanceWeight: 2.8,
        description: "Head and neck anatomy, craniofacial neurology, and oral physiology.",
        assessmentAvailable: true,
      },
      {
        skillName: "Endodontic & Restorative Dentistry",
        category: "Domain",
        minimumLevel: 4,
        importanceWeight: 3.0,
        description: "Root canal therapy, cavity restorations, and tooth preparation.",
        assessmentAvailable: false,
      },
      {
        skillName: "Oral Radiology & Imaging",
        category: "Technical",
        minimumLevel: 3,
        importanceWeight: 2.4,
        description: "IOPA, OPG, and Cone Beam CT (CBCT) diagnostic reading.",
        assessmentAvailable: false,
      },
    ],
    recommendedSkills: [
      {
        skillName: "Local Anesthesia & Pain Control",
        category: "Domain",
        minimumLevel: 3,
        importanceWeight: 2.5,
        description: "Nerve block administration and postoperative pain management.",
        assessmentAvailable: false,
      },
    ],
    educationalPrerequisites: [
      { stage: "CLASS_12", requirement: "Class 12 with PCB and NEET-UG qualification", isMandatory: true },
      { stage: "UNDERGRADUATE", requirement: "4-year BDS degree followed by 1-year clinical rotatory internship", isMandatory: true },
    ],
    certifications: [
      { name: "State Dental Council License", issuingBody: "Dental Council of India", isMandatory: true, description: "Registered Dental Practitioner (RDP) license" },
    ],
    experienceAreas: [
      { area: "Dental Operatory Clinical Rotations", recommendedMonths: 12, description: "Exodontia, endodontics, and prosthodontics hands-on patient care" },
    ],
  },

  // --------------------------------------------------------------------------
  // 2. NON-MEDICAL / STEM (PCM)
  // --------------------------------------------------------------------------
  "ai-systems-engineer": {
    careerSlug: "ai-systems-engineer",
    careerTitle: "AI Systems Engineer",
    stream: "NON_MEDICAL_PCM",
    regulatoryBody: "All India Council for Technical Education (AICTE)",
    mandatorySkills: [
      {
        skillName: "Python",
        category: "Technical",
        minimumLevel: 4,
        importanceWeight: 3.0,
        description: "Object-oriented programming, async runtime, scientific libraries (NumPy, PyTorch).",
        assessmentAvailable: true,
      },
      {
        skillName: "Data Structures & Algorithms",
        category: "Technical",
        minimumLevel: 4,
        importanceWeight: 2.9,
        description: "Tree/graph traversals, dynamic programming, time/space complexity optimization.",
        assessmentAvailable: true,
      },
      {
        skillName: "System Architecture & High Availability",
        category: "Technical",
        minimumLevel: 3,
        importanceWeight: 2.7,
        description: "Distributed compute, microservices, model serving latency, and caching strategies.",
        assessmentAvailable: false,
      },
      {
        skillName: "Linear Algebra & Probability",
        category: "Foundational",
        minimumLevel: 3,
        importanceWeight: 2.5,
        description: "Matrix operations, gradient descent mathematics, and stochastic processes.",
        assessmentAvailable: false,
      },
    ],
    recommendedSkills: [
      {
        skillName: "MLOps & Container Orchestration",
        category: "Technical",
        minimumLevel: 3,
        importanceWeight: 2.3,
        description: "Docker, Kubernetes, Triton inference server, model monitoring.",
        assessmentAvailable: false,
      },
      {
        skillName: "API Design & REST/gRPC",
        category: "Technical",
        minimumLevel: 3,
        importanceWeight: 2.0,
        description: "High-throughput API endpoints for low-latency inference pipelines.",
        assessmentAvailable: false,
      },
    ],
    educationalPrerequisites: [
      { stage: "CLASS_12", requirement: "PCM with minimum 60% aggregate for engineering entrance", isMandatory: true },
      { stage: "UNDERGRADUATE", requirement: "B.Tech/B.E. in Computer Science, Data Science, or related field", isMandatory: true },
    ],
    certifications: [
      { name: "Cloud Machine Learning Specialist", issuingBody: "NPTEL / AICTE / AWS / Google Cloud", isMandatory: false, description: "Demonstrated competency in deploying scalable ML workloads" },
    ],
    experienceAreas: [
      { area: "Production Model Deployment & Projects", recommendedMonths: 6, description: "Building and hosting functional neural net APIs with monitored SLAs" },
    ],
  },
  "aerospace-engineer": {
    careerSlug: "aerospace-engineer",
    careerTitle: "Aerospace Propulsion Engineer",
    stream: "NON_MEDICAL_PCM",
    regulatoryBody: "AICTE / DGCA",
    mandatorySkills: [
      {
        skillName: "Aerodynamics & Fluid Dynamics",
        category: "Domain",
        minimumLevel: 4,
        importanceWeight: 3.0,
        description: "Navier-Stokes solutions, boundary layer theory, and compressible supersonic flow.",
        assessmentAvailable: false,
      },
      {
        skillName: "Thermodynamics & Heat Transfer",
        category: "Domain",
        minimumLevel: 3,
        importanceWeight: 2.8,
        description: "Brayton and Rankine cycles, combustion kinetics, and cooling systems.",
        assessmentAvailable: false,
      },
      {
        skillName: "CAD/FEA Structural Simulation",
        category: "Technical",
        minimumLevel: 3,
        importanceWeight: 2.6,
        description: "Ansys/Nastran stress analysis, modal frequency, and lightweight composites.",
        assessmentAvailable: false,
      },
    ],
    recommendedSkills: [
      {
        skillName: "Python for Engineering Calculation",
        category: "Technical",
        minimumLevel: 3,
        importanceWeight: 2.2,
        description: "Numerical computation and trajectory modeling using SciPy.",
        assessmentAvailable: true,
      },
    ],
    educationalPrerequisites: [
      { stage: "UNDERGRADUATE", requirement: "B.Tech in Aerospace, Aeronautical, or Mechanical Engineering", isMandatory: true },
    ],
    certifications: [
      { name: "Aeronautical Design Standard Certification", issuingBody: "Aeronautical Society of India (AeSI)", isMandatory: false, description: "Certified aerospace structural and propulsion associate" },
    ],
    experienceAreas: [
      { area: "Wind Tunnel or CAD Simulation Projects", recommendedMonths: 6, description: "Subsonic airfoil testing and propulsion computational modeling" },
    ],
  },

  // --------------------------------------------------------------------------
  // 3. COMMERCE & FINANCE
  // --------------------------------------------------------------------------
  "chartered-accountant-ca": {
    careerSlug: "chartered-accountant-ca",
    careerTitle: "Chartered Accountant (CA)",
    stream: "COMMERCE",
    regulatoryBody: "Institute of Chartered Accountants of India (ICAI)",
    mandatorySkills: [
      {
        skillName: "Financial Accounting & Reporting",
        category: "Domain",
        minimumLevel: 4,
        importanceWeight: 3.0,
        description: "Indian Accounting Standards (Ind AS), balance sheet preparation, consolidation.",
        assessmentAvailable: true,
      },
      {
        skillName: "Auditing & Assurance Standards",
        category: "Domain",
        minimumLevel: 4,
        importanceWeight: 2.9,
        description: "Internal and statutory audits, compliance sampling, risk detection.",
        assessmentAvailable: true,
      },
      {
        skillName: "Corporate & Direct Tax Law",
        category: "Domain",
        minimumLevel: 4,
        importanceWeight: 2.8,
        description: "Income Tax Act 1961, GST compliance, transfer pricing, and TDS regulations.",
        assessmentAvailable: false,
      },
    ],
    recommendedSkills: [
      {
        skillName: "Financial Modeling & Valuation",
        category: "Analytical",
        minimumLevel: 3,
        importanceWeight: 2.4,
        description: "Discounted cash flow (DCF), ratio analysis, sensitivity analysis in Excel.",
        assessmentAvailable: false,
      },
      {
        skillName: "ERP Systems (Tally, SAP FICO)",
        category: "Technical",
        minimumLevel: 3,
        importanceWeight: 2.2,
        description: "Ledger management and financial reporting inside corporate ERPs.",
        assessmentAvailable: false,
      },
    ],
    educationalPrerequisites: [
      { stage: "CLASS_12", requirement: "Class 12 with Commerce/Mathematics for CA Foundation registration", isMandatory: true },
      { stage: "UNDERGRADUATE", requirement: "ICAI Articleship (2 Years) + CA Intermediate & Final Cleared", isMandatory: true },
    ],
    certifications: [
      { name: "ICAI Membership & Practice Certificate (COP)", issuingBody: "ICAI", isMandatory: true, description: "Fellow/Associate Chartered Accountant designation" },
    ],
    experienceAreas: [
      { area: "ICAI Compulsory Articleship", recommendedMonths: 24, description: "Hands-on statutory audit, GST filing, and client tax representation under a practicing FCA" },
    ],
  },
  "investment-banker": {
    careerSlug: "investment-banker",
    careerTitle: "Investment Banking Analyst",
    stream: "COMMERCE",
    regulatoryBody: "Securities and Exchange Board of India (SEBI)",
    mandatorySkills: [
      {
        skillName: "Financial Accounting & Reporting",
        category: "Domain",
        minimumLevel: 4,
        importanceWeight: 3.0,
        description: "3-statement modeling, balance sheet forensics, and working capital analysis.",
        assessmentAvailable: true,
      },
      {
        skillName: "Equity Valuation & LBO Modeling",
        category: "Analytical",
        minimumLevel: 4,
        importanceWeight: 2.9,
        description: "M&A accretion/dilution, leveraged buyout projections, and comparable company analysis.",
        assessmentAvailable: false,
      },
      {
        skillName: "Capital Markets & Pitch Deck Creation",
        category: "Technical",
        minimumLevel: 3,
        importanceWeight: 2.5,
        description: "CIM creation, term sheet structuring, and investor roadshow deck synthesis.",
        assessmentAvailable: false,
      },
    ],
    recommendedSkills: [
      {
        skillName: "Quantitative Data Analysis",
        category: "Analytical",
        minimumLevel: 3,
        importanceWeight: 2.3,
        description: "Macroeconomic trend parsing, beta calculations, and Bloomberg terminal literacy.",
        assessmentAvailable: false,
      },
    ],
    educationalPrerequisites: [
      { stage: "UNDERGRADUATE", requirement: "Bachelor's in Commerce, Economics, Finance, or Engineering", isMandatory: true },
    ],
    certifications: [
      { name: "NISM Series VII / CFA Level 1", issuingBody: "NISM / CFA Institute", isMandatory: false, description: "Securities Operations and Risk Management certification" },
    ],
    experienceAreas: [
      { area: "Corporate Finance or M&A Internship", recommendedMonths: 6, description: "Financial model drafting and deal transaction support" },
    ],
  },

  // --------------------------------------------------------------------------
  // 4. ARTS, HUMANITIES & SOCIAL SCIENCES
  // --------------------------------------------------------------------------
  "civil-services-ias": {
    careerSlug: "civil-services-ias",
    careerTitle: "Civil Services Officer (IAS/IPS)",
    stream: "ARTS_HUMANITIES",
    regulatoryBody: "Union Public Service Commission (UPSC) / DoPT",
    mandatorySkills: [
      {
        skillName: "Indian Polity & Constitutional Governance",
        category: "Domain",
        minimumLevel: 4,
        importanceWeight: 3.0,
        description: "Constitutional articles, federalism, administrative law, and judiciary precedents.",
        assessmentAvailable: true,
      },
      {
        skillName: "Public Policy Formulation & Analysis",
        category: "Domain",
        minimumLevel: 4,
        importanceWeight: 2.8,
        description: "Social welfare schemes, budgeting, decentralization, and rural implementation.",
        assessmentAvailable: true,
      },
      {
        skillName: "Crisis Management & Administrative Leadership",
        category: "Interpersonal",
        minimumLevel: 4,
        importanceWeight: 2.7,
        description: "Disaster response, public crowd stabilization, and inter-departmental triage.",
        assessmentAvailable: false,
      },
    ],
    recommendedSkills: [
      {
        skillName: "Socio-Economic Data Interpretation",
        category: "Analytical",
        minimumLevel: 3,
        importanceWeight: 2.4,
        description: "NSSO, Census, NFHS demographic reports analysis for policy decisions.",
        assessmentAvailable: false,
      },
    ],
    educationalPrerequisites: [
      { stage: "UNDERGRADUATE", requirement: "Graduation in any discipline from a recognized Indian university", isMandatory: true },
    ],
    certifications: [
      { name: "UPSC Civil Services Examination Qualified", issuingBody: "UPSC", isMandatory: true, description: "Preliminary, Mains, and Personality Test qualification" },
    ],
    experienceAreas: [
      { area: "District Administrative Attachment (LBSNAA)", recommendedMonths: 12, description: "Foundation course and district collectorate field training" },
    ],
  },
  "clinical-psychologist": {
    careerSlug: "clinical-psychologist",
    careerTitle: "Clinical Psychologist",
    stream: "ARTS_HUMANITIES",
    regulatoryBody: "Rehabilitation Council of India (RCI)",
    mandatorySkills: [
      {
        skillName: "Psychological Assessment & Psychometry",
        category: "Domain",
        minimumLevel: 4,
        importanceWeight: 3.0,
        description: "Administering WAIS, MMPI, TAT, and neurocognitive diagnostic batteries.",
        assessmentAvailable: true,
      },
      {
        skillName: "Cognitive Behavioral Therapy (CBT)",
        category: "Domain",
        minimumLevel: 4,
        importanceWeight: 2.9,
        description: "Therapeutic alliance, cognitive restructuring, and behavioral activation.",
        assessmentAvailable: false,
      },
      {
        skillName: "Counseling & Crisis Intervention",
        category: "Interpersonal",
        minimumLevel: 4,
        importanceWeight: 2.7,
        description: "Suicide risk mitigation, trauma stabilization, and active listening.",
        assessmentAvailable: false,
      },
    ],
    recommendedSkills: [
      {
        skillName: "Research & Statistical Analysis (SPSS)",
        category: "Analytical",
        minimumLevel: 3,
        importanceWeight: 2.0,
        description: "Psychometric reliability metrics, ANOVA, regression for clinical studies.",
        assessmentAvailable: false,
      },
    ],
    educationalPrerequisites: [
      { stage: "UNDERGRADUATE", requirement: "B.A./B.Sc. in Psychology", isMandatory: true },
      { stage: "POSTGRADUATE", requirement: "M.A./M.Sc. in Clinical Psychology + M.Phil/Psy.D in Clinical Psychology (RCI approved)", isMandatory: true },
    ],
    certifications: [
      { name: "RCI Registration Certificate (CRR Number)", issuingBody: "Rehabilitation Council of India", isMandatory: true, description: "Official licensed clinical psychologist registry" },
    ],
    experienceAreas: [
      { area: "Psychiatric Hospital Supervised Practicum", recommendedMonths: 24, description: "Supervised clinical rounds, inpatient cases, and psychometric reports" },
    ],
  },

  // --------------------------------------------------------------------------
  // 5. LAW & LEGAL STUDIES
  // --------------------------------------------------------------------------
  "corporate-lawyer": {
    careerSlug: "corporate-lawyer",
    careerTitle: "Corporate & M&A Legal Counsel",
    stream: "LAW",
    regulatoryBody: "Bar Council of India (BCI)",
    mandatorySkills: [
      {
        skillName: "Corporate Law & Contract Drafting",
        category: "Domain",
        minimumLevel: 4,
        importanceWeight: 3.0,
        description: "Companies Act 2013, drafting term sheets, SHA/SPA, nondisclosure agreements.",
        assessmentAvailable: true,
      },
      {
        skillName: "Legal Due Diligence & Regulatory Compliance",
        category: "Domain",
        minimumLevel: 4,
        importanceWeight: 2.8,
        description: "FEMA, RBI, SEBI regulations, IP audit, and environmental clearances.",
        assessmentAvailable: true,
      },
      {
        skillName: "Commercial Negotiation & Dispute Resolution",
        category: "Interpersonal",
        minimumLevel: 3,
        importanceWeight: 2.6,
        description: "Arbitration clause drafting, ADR, and closing transaction conditions.",
        assessmentAvailable: false,
      },
    ],
    recommendedSkills: [
      {
        skillName: "Intellectual Property Law",
        category: "Domain",
        minimumLevel: 3,
        importanceWeight: 2.2,
        description: "Trademark, patent filing, and licensing agreement structure.",
        assessmentAvailable: false,
      },
    ],
    educationalPrerequisites: [
      { stage: "UNDERGRADUATE", requirement: "5-Year Integrated B.A. LL.B / B.B.A. LL.B or 3-Year LL.B", isMandatory: true },
    ],
    certifications: [
      { name: "All India Bar Examination (AIBE) Certificate", issuingBody: "Bar Council of India", isMandatory: true, description: "COP allowing practice in Indian courts and tribunals" },
    ],
    experienceAreas: [
      { area: "Corporate Law Firm Internship", recommendedMonths: 12, description: "Contract redlining, corporate filing due diligence, and board resolutions" },
    ],
  },
  "civil-judge-judiciary": {
    careerSlug: "civil-judge-judiciary",
    careerTitle: "Civil Judge (Junior Division)",
    stream: "LAW",
    regulatoryBody: "High Court of the Respective State / BCI",
    mandatorySkills: [
      {
        skillName: "Civil Procedure Code & Criminal Jurisprudence",
        category: "Domain",
        minimumLevel: 5,
        importanceWeight: 3.0,
        description: "CPC 1908, CrPC/BNSS, Indian Evidence Act/BSA, and constitutional law.",
        assessmentAvailable: true,
      },
      {
        skillName: "Judicial Reasoning & Order Writing",
        category: "Analytical",
        minimumLevel: 4,
        importanceWeight: 3.0,
        description: "Evaluating testimony credibility, admissibility of evidence, reasoned judgments.",
        assessmentAvailable: false,
      },
    ],
    recommendedSkills: [
      {
        skillName: "Courtroom Management & Decorum",
        category: "Interpersonal",
        minimumLevel: 3,
        importanceWeight: 2.5,
        description: "Adjournment protocol, contempt powers, and bail docket clearing.",
        assessmentAvailable: false,
      },
    ],
    educationalPrerequisites: [
      { stage: "UNDERGRADUATE", requirement: "LL.B Degree with enrollment in State Bar Council", isMandatory: true },
    ],
    certifications: [
      { name: "Judicial Services Exam Qualified", issuingBody: "State High Court / Public Service Commission", isMandatory: true, description: "State Judicial Services Examination" },
    ],
    experienceAreas: [
      { area: "State Judicial Academy Training", recommendedMonths: 12, description: "Courtroom simulation, revenue law, and junior civil division practice" },
    ],
  },

  // --------------------------------------------------------------------------
  // 6. MANAGEMENT & BUSINESS
  // --------------------------------------------------------------------------
  "enterprise-product-manager": {
    careerSlug: "enterprise-product-manager",
    careerTitle: "Enterprise Product Manager",
    stream: "MANAGEMENT",
    regulatoryBody: "Industry Best Practice / AICTE",
    mandatorySkills: [
      {
        skillName: "Product Lifecycle & Roadmap Strategy",
        category: "Domain",
        minimumLevel: 4,
        importanceWeight: 3.0,
        description: "PRD writing, user story mapping, feature prioritization (RICE, Kano).",
        assessmentAvailable: true,
      },
      {
        skillName: "Data-Driven Decision Making & Analytics",
        category: "Analytical",
        minimumLevel: 4,
        importanceWeight: 2.9,
        description: "Cohort retention analysis, SQL queries, A/B testing experimentation.",
        assessmentAvailable: true,
      },
      {
        skillName: "Cross-Functional Stakeholder Alignment",
        category: "Interpersonal",
        minimumLevel: 4,
        importanceWeight: 2.7,
        description: "Balancing engineering velocity, sales enablement, and executive vision.",
        assessmentAvailable: false,
      },
    ],
    recommendedSkills: [
      {
        skillName: "UX Architecture & Wireframing",
        category: "Technical",
        minimumLevel: 3,
        importanceWeight: 2.2,
        description: "Figma low-fidelity wireframing and user interview synthesis.",
        assessmentAvailable: false,
      },
    ],
    educationalPrerequisites: [
      { stage: "UNDERGRADUATE", requirement: "Bachelor's degree in Engineering, Business, or related discipline", isMandatory: true },
    ],
    certifications: [
      { name: "Certified Scrum Product Owner (CSPO) / Agile", issuingBody: "Scrum Alliance / Pragmatic Institute", isMandatory: false, description: "Agile product backlog and release planning" },
    ],
    experienceAreas: [
      { area: "SaaS Product Management or Associate PM Rotation", recommendedMonths: 12, description: "Shipping enterprise software features and driving customer adoption" },
    ],
  },
  "management-consultant": {
    careerSlug: "management-consultant",
    careerTitle: "Management Consultant",
    stream: "MANAGEMENT",
    regulatoryBody: "Industry Standards",
    mandatorySkills: [
      {
        skillName: "Structured Problem Solving & MECE Frameworks",
        category: "Analytical",
        minimumLevel: 4,
        importanceWeight: 3.0,
        description: "Issue trees, hypothesis-driven consulting, profitability diagnostics.",
        assessmentAvailable: true,
      },
      {
        skillName: "Executive Presentation & Storyboarding",
        category: "Interpersonal",
        minimumLevel: 4,
        importanceWeight: 2.8,
        description: "Pyramid principle slide creation and C-suite workshop moderation.",
        assessmentAvailable: false,
      },
    ],
    recommendedSkills: [
      {
        skillName: "Financial Modeling & Unit Economics",
        category: "Analytical",
        minimumLevel: 3,
        importanceWeight: 2.5,
        description: "Cost-benefit modeling, supply chain optimization economics.",
        assessmentAvailable: false,
      },
    ],
    educationalPrerequisites: [
      { stage: "UNDERGRADUATE", requirement: "Bachelor's in Commerce, Engineering, or Economics", isMandatory: true },
      { stage: "POSTGRADUATE", requirement: "MBA / PGDM from premier management institute", isMandatory: false },
    ],
    certifications: [
      { name: "Lean Six Sigma Green Belt", issuingBody: "ASQ / IASSC", isMandatory: false, description: "Process variation reduction and operational excellence" },
    ],
    experienceAreas: [
      { area: "Strategy or Operations Advisory Projects", recommendedMonths: 12, description: "Delivering client advisory workstreams and market entry assessments" },
    ],
  },

  // --------------------------------------------------------------------------
  // 7. CREATIVE ARTS & DESIGN
  // --------------------------------------------------------------------------
  "ui-ux-product-designer": {
    careerSlug: "ui-ux-product-designer",
    careerTitle: "UI/UX Product Designer",
    stream: "CREATIVE_DESIGN",
    regulatoryBody: "India Design Council (IDC)",
    mandatorySkills: [
      {
        skillName: "Design Systems & Figma Mastery",
        category: "Technical",
        minimumLevel: 4,
        importanceWeight: 3.0,
        description: "Auto-layout, variables, component tokenization, and multi-brand systems.",
        assessmentAvailable: true,
      },
      {
        skillName: "User Research & Usability Testing",
        category: "Analytical",
        minimumLevel: 4,
        importanceWeight: 2.8,
        description: "Heuristic evaluations, usability benchmarking, task completion rates.",
        assessmentAvailable: true,
      },
      {
        skillName: "Interaction Design & Prototyping",
        category: "Technical",
        minimumLevel: 3,
        importanceWeight: 2.6,
        description: "Micro-interactions, state transitions, mobile gesture patterns.",
        assessmentAvailable: false,
      },
    ],
    recommendedSkills: [
      {
        skillName: "Design Tokens & Frontend Basics (HTML/CSS)",
        category: "Technical",
        minimumLevel: 2,
        importanceWeight: 2.0,
        description: "Translating design specifications into Tailwind/CSS primitives.",
        assessmentAvailable: false,
      },
    ],
    educationalPrerequisites: [
      { stage: "UNDERGRADUATE", requirement: "B.Des, B.Arch, or equivalent design portfolio qualification", isMandatory: false },
    ],
    certifications: [
      { name: "Certified Usability Analyst (CUA)", issuingBody: "Human Factors International (HFI)", isMandatory: false, description: "Science-based user-centered design and testing methodology" },
    ],
    experienceAreas: [
      { area: "End-to-End Product Design Case Studies", recommendedMonths: 6, description: "Shipped digital applications with verified user feedback and metrics" },
    ],
  },
  "vfx-animation-director": {
    careerSlug: "vfx-animation-director",
    careerTitle: "VFX & Animation Technical Director",
    stream: "CREATIVE_DESIGN",
    regulatoryBody: "Media & Entertainment Skills Council (MESC)",
    mandatorySkills: [
      {
        skillName: "3D Asset Modeling & Texturing",
        category: "Technical",
        minimumLevel: 4,
        importanceWeight: 3.0,
        description: "Maya, Blender, ZBrush topological modeling and PBR shader setup.",
        assessmentAvailable: true,
      },
      {
        skillName: "Compositing & Lighting",
        category: "Technical",
        minimumLevel: 4,
        importanceWeight: 2.9,
        description: "Nuke node graphs, rotoscoping, multi-pass EXR integration.",
        assessmentAvailable: false,
      },
    ],
    recommendedSkills: [
      {
        skillName: "Python for VFX Pipeline Scripting",
        category: "Technical",
        minimumLevel: 3,
        importanceWeight: 2.3,
        description: "Automating render passes and asset ingestion into Unreal Engine.",
        assessmentAvailable: true,
      },
    ],
    educationalPrerequisites: [
      { stage: "UNDERGRADUATE", requirement: "B.Sc/Diploma in Animation, Multimedia, or VFX", isMandatory: false },
    ],
    certifications: [
      { name: "Autodesk Maya / Unreal Engine Certified Associate", issuingBody: "Autodesk / Epic Games", isMandatory: false, description: "3D scene composition and virtual production" },
    ],
    experienceAreas: [
      { area: "VFX Studio Showreel Projects", recommendedMonths: 6, description: "Commercial film production shots and photorealistic composites" },
    ],
  },

  // --------------------------------------------------------------------------
  // 8. AGRICULTURE & FOOD TECHNOLOGY
  // --------------------------------------------------------------------------
  "precision-agronomist": {
    careerSlug: "precision-agronomist",
    careerTitle: "Precision Agronomist & Crop Health Analyst",
    stream: "AGRICULTURE",
    regulatoryBody: "Indian Council of Agricultural Research (ICAR)",
    mandatorySkills: [
      {
        skillName: "Crop Nutrition & Soil Diagnostics",
        category: "Domain",
        minimumLevel: 4,
        importanceWeight: 3.0,
        description: "Soil N-P-K assays, micronutrient deficiencies, and organic amendment.",
        assessmentAvailable: true,
      },
      {
        skillName: "Remote Sensing & Drone GIS in Agriculture",
        category: "Technical",
        minimumLevel: 3,
        importanceWeight: 2.8,
        description: "NDVI vegetation index analysis, multispectral drone mapping, and yield maps.",
        assessmentAvailable: false,
      },
      {
        skillName: "Integrated Pest Management (IPM)",
        category: "Domain",
        minimumLevel: 3,
        importanceWeight: 2.6,
        description: "Biological control agents, fungal blight monitoring, and targeted spray.",
        assessmentAvailable: false,
      },
    ],
    recommendedSkills: [
      {
        skillName: "Agri-Supply Chain Logistics",
        category: "Analytical",
        minimumLevel: 2,
        importanceWeight: 2.0,
        description: "Cold-chain preservation, moisture tracking, and mandi spot prices.",
        assessmentAvailable: false,
      },
    ],
    educationalPrerequisites: [
      { stage: "UNDERGRADUATE", requirement: "B.Sc (Hons) Agriculture from ICAR-accredited university", isMandatory: true },
    ],
    certifications: [
      { name: "DGCA Remote Pilot Certificate (Agri Drone)", issuingBody: "DGCA India", isMandatory: false, description: "Commercial drone pilot license for agricultural spraying" },
    ],
    experienceAreas: [
      { area: "Farm Extension & Field Trials", recommendedMonths: 12, description: "Hands-on agronomy trials and crop disease diagnostics across Kharif/Rabi seasons" },
    ],
  },
  "dairy-food-technologist": {
    careerSlug: "dairy-food-technologist",
    careerTitle: "Dairy & Food Processing Technologist",
    stream: "AGRICULTURE",
    regulatoryBody: "FSSAI / ICAR",
    mandatorySkills: [
      {
        skillName: "Food Safety Standards & Quality Assurance (HACCP/FSSAI)",
        category: "Domain",
        minimumLevel: 4,
        importanceWeight: 3.0,
        description: "Bacterial culture counts, pasteurization validation, packaging seal integrity.",
        assessmentAvailable: true,
      },
      {
        skillName: "Dairy Chemistry & Fermentation Processing",
        category: "Domain",
        minimumLevel: 4,
        importanceWeight: 2.9,
        description: "Curdling mechanisms, butterfat extraction, whey separation, and ultra-filtration.",
        assessmentAvailable: false,
      },
    ],
    recommendedSkills: [
      {
        skillName: "Food Plant Process Automation",
        category: "Technical",
        minimumLevel: 3,
        importanceWeight: 2.2,
        description: "CIP (Clean-in-Place) automation and homogenizer pressure calibrations.",
        assessmentAvailable: false,
      },
    ],
    educationalPrerequisites: [
      { stage: "UNDERGRADUATE", requirement: "B.Tech in Dairy Technology / Food Technology", isMandatory: true },
    ],
    certifications: [
      { name: "FSSAI Food Safety Supervisor Certificate (FoSTaC)", issuingBody: "FSSAI", isMandatory: true, description: "Mandatory statutory compliance certificate for food processing units" },
    ],
    experienceAreas: [
      { area: "Dairy Processing Plant In-Plant Training", recommendedMonths: 6, description: "Pasteurization line oversight, milk quality testing, and sanitation verification" },
    ],
  },

  // --------------------------------------------------------------------------
  // 9. VOCATIONAL & TECHNICAL TRADES
  // --------------------------------------------------------------------------
  "industrial-automation-technician": {
    careerSlug: "industrial-automation-technician",
    careerTitle: "Industrial Automation & Mechatronics Technician",
    stream: "VOCATIONAL_TRADES",
    regulatoryBody: "National Council for Vocational Training (NCVT) / NCVET",
    mandatorySkills: [
      {
        skillName: "PLC Programming & Ladder Logic",
        category: "Technical",
        minimumLevel: 4,
        importanceWeight: 3.0,
        description: "Siemens/Allen-Bradley ladder programming, timers, counters, interlocking.",
        assessmentAvailable: true,
      },
      {
        skillName: "Electrical Schematics & Control Panels",
        category: "Technical",
        minimumLevel: 4,
        importanceWeight: 2.9,
        description: "Wiring diagrams, contactors, relays, VFD drives, and 3-phase power distribution.",
        assessmentAvailable: true,
      },
      {
        skillName: "Pneumatics & Hydraulic Actuation",
        category: "Domain",
        minimumLevel: 3,
        importanceWeight: 2.6,
        description: "Solenoid valves, pressure relief valves, cylinder stroke control.",
        assessmentAvailable: false,
      },
    ],
    recommendedSkills: [
      {
        skillName: "SCADA & HMI Configuration",
        category: "Technical",
        minimumLevel: 3,
        importanceWeight: 2.3,
        description: "Designing touch-panel operator interfaces and alarm trip logging.",
        assessmentAvailable: false,
      },
    ],
    educationalPrerequisites: [
      { stage: "DIPLOMA", requirement: "ITI / Polytechnic Diploma in Electrical, Mechatronics, or Instrumentation", isMandatory: true },
    ],
    certifications: [
      { name: "National Trade Certificate (NTC) in Mechatronics", issuingBody: "NCVT / Ministry of Skill Development", isMandatory: true, description: "Government recognized vocational trade credential" },
    ],
    experienceAreas: [
      { area: "Factory Floor Maintenance Apprenticeship", recommendedMonths: 12, description: "Breakdown troubleshooting, control panel rewiring, and preventive audits" },
    ],
  },
  "ev-powertrain-specialist": {
    careerSlug: "ev-powertrain-specialist",
    careerTitle: "EV Battery & Powertrain Diagnostic Specialist",
    stream: "VOCATIONAL_TRADES",
    regulatoryBody: "Automotive Skills Development Council (ASDC)",
    mandatorySkills: [
      {
        skillName: "High Voltage Electrical Safety (NFPA 70E / AIS 038)",
        category: "Domain",
        minimumLevel: 4,
        importanceWeight: 3.0,
        description: "Isolation procedures, 400V-800V PPE, interlock loop troubleshooting.",
        assessmentAvailable: true,
      },
      {
        skillName: "Battery Management System (BMS) Calibration",
        category: "Technical",
        minimumLevel: 4,
        importanceWeight: 2.8,
        description: "Cell balancing, thermal runaway mitigation, state-of-charge calculation.",
        assessmentAvailable: false,
      },
    ],
    recommendedSkills: [
      {
        skillName: "CAN Bus Diagnostics & Oscilloscope Operation",
        category: "Technical",
        minimumLevel: 3,
        importanceWeight: 2.5,
        description: "OBD-II CAN frame capture and sensor voltage waveform verification.",
        assessmentAvailable: false,
      },
    ],
    educationalPrerequisites: [
      { stage: "DIPLOMA", requirement: "ITI / Diploma in Automobile, Electrical, or EV Technology", isMandatory: true },
    ],
    certifications: [
      { name: "ASDC Certified Electric Vehicle Master Technician", issuingBody: "ASDC", isMandatory: false, description: "Industry-standard EV powertrain diagnostic qualification" },
    ],
    experienceAreas: [
      { area: "EV Service Center Diagnostic Internship", recommendedMonths: 6, description: "Battery pack teardowns, inverter replacements, and motor controller tuning" },
    ],
  },

  // --------------------------------------------------------------------------
  // 10. SPORTS & PHYSICAL EDUCATION
  // --------------------------------------------------------------------------
  "sports-physiotherapist": {
    careerSlug: "sports-physiotherapist",
    careerTitle: "Sports Physiotherapist & Injury Rehabilitation Specialist",
    stream: "SPORTS_PHYSICAL_ED",
    regulatoryBody: "National Commission for Allied and Healthcare Professions (NCAHP)",
    mandatorySkills: [
      {
        skillName: "Musculoskeletal Anatomy & Biomechanics",
        category: "Domain",
        minimumLevel: 4,
        importanceWeight: 3.0,
        description: "Joint kinematics, gait cycle analysis, ligament stress testing.",
        assessmentAvailable: true,
      },
      {
        skillName: "Athletic Taping & Acute Injury Triage",
        category: "Technical",
        minimumLevel: 4,
        importanceWeight: 2.8,
        description: "Kinesiology taping, acute concussion protocols, sprain immobilization.",
        assessmentAvailable: false,
      },
      {
        skillName: "Post-Surgical Exercise Prescription",
        category: "Domain",
        minimumLevel: 3,
        importanceWeight: 2.6,
        description: "ACL rehabilitation phases, rotator cuff conditioning, return-to-play criteria.",
        assessmentAvailable: false,
      },
    ],
    recommendedSkills: [
      {
        skillName: "Dry Needling & Myofascial Release",
        category: "Technical",
        minimumLevel: 3,
        importanceWeight: 2.2,
        description: "Trigger point deactivation and soft-tissue mobility techniques.",
        assessmentAvailable: false,
      },
    ],
    educationalPrerequisites: [
      { stage: "UNDERGRADUATE", requirement: "Bachelor of Physiotherapy (BPT) with 6 months compulsory internship", isMandatory: true },
      { stage: "POSTGRADUATE", requirement: "Master of Physiotherapy (MPT) in Sports Medicine", isMandatory: false },
    ],
    certifications: [
      { name: "State Physiotherapy Council Registration", issuingBody: "NCAHP / State Council", isMandatory: true, description: "Official licensed physiotherapist practice number" },
    ],
    experienceAreas: [
      { area: "Sports Academy or Athletic Team Physio Rotation", recommendedMonths: 12, description: "On-field matchday injury coverage and post-match recovery baths" },
    ],
  },
  "athletic-performance-coach": {
    careerSlug: "athletic-performance-coach",
    careerTitle: "Strength & Athletic Performance Coach",
    stream: "SPORTS_PHYSICAL_ED",
    regulatoryBody: "Sports Authority of India (SAI) / NSNIS",
    mandatorySkills: [
      {
        skillName: "Periodization & Strength Programming",
        category: "Domain",
        minimumLevel: 4,
        importanceWeight: 3.0,
        description: "Linear, undulating, and block periodization for peak competitive readiness.",
        assessmentAvailable: true,
      },
      {
        skillName: "Olympic Weightlifting & Plyometric Technique",
        category: "Technical",
        minimumLevel: 4,
        importanceWeight: 2.8,
        description: "Snatch, clean-and-jerk barbell mechanics and velocity-based jump training.",
        assessmentAvailable: false,
      },
    ],
    recommendedSkills: [
      {
        skillName: "Sports Nutrition & Supplement Protocols",
        category: "Domain",
        minimumLevel: 3,
        importanceWeight: 2.3,
        description: "Macronutrient partitioning, hydration strategies, and WADA compliance.",
        assessmentAvailable: false,
      },
    ],
    educationalPrerequisites: [
      { stage: "UNDERGRADUATE", requirement: "B.P.Ed / B.Sc in Sports Science or NSNIS Diploma", isMandatory: true },
    ],
    certifications: [
      { name: "NSCA Certified Strength and Conditioning Specialist (CSCS)", issuingBody: "NSCA / SAI", isMandatory: false, description: "Global gold standard for athletic conditioning" },
    ],
    experienceAreas: [
      { area: "High-Performance Sports Center Coaching", recommendedMonths: 12, description: "Supervising elite youth athletes and team conditioning camps" },
    ],
  },

  // --------------------------------------------------------------------------
  // 11. HOSPITALITY & TOURISM
  // --------------------------------------------------------------------------
  "luxury-hotel-general-manager": {
    careerSlug: "luxury-hotel-general-manager",
    careerTitle: "Luxury Hotel General Manager",
    stream: "HOSPITALITY_TOURISM",
    regulatoryBody: "National Council for Hotel Management and Catering Technology (NCHMCT)",
    mandatorySkills: [
      {
        skillName: "Hotel Revenue Management & RevPAR Optimization",
        category: "Analytical",
        minimumLevel: 4,
        importanceWeight: 3.0,
        description: "Dynamic room pricing, ADR forecasting, OTA channel distribution.",
        assessmentAvailable: true,
      },
      {
        skillName: "Guest Experience Leadership & VIP Protocol",
        category: "Interpersonal",
        minimumLevel: 5,
        importanceWeight: 2.9,
        description: "Luxury service benchmarks, conflict resolution, personalized hospitality.",
        assessmentAvailable: false,
      },
      {
        skillName: "Food & Beverage Operations Control",
        category: "Domain",
        minimumLevel: 3,
        importanceWeight: 2.6,
        description: "Menu engineering, food waste mitigation, banquet banquet staging.",
        assessmentAvailable: false,
      },
    ],
    recommendedSkills: [
      {
        skillName: "Property Management Systems (Opera PMS)",
        category: "Technical",
        minimumLevel: 3,
        importanceWeight: 2.3,
        description: "Reservations engine, front office night audits, and housekeeping status.",
        assessmentAvailable: false,
      },
    ],
    educationalPrerequisites: [
      { stage: "UNDERGRADUATE", requirement: "B.Sc in Hospitality & Hotel Administration (BHM) from IHM/NCHMCT", isMandatory: true },
    ],
    certifications: [
      { name: "Certified Hotel Administrator (CHA)", issuingBody: "AHLEI / NCHMCT", isMandatory: false, description: "Comprehensive executive hospitality credential" },
    ],
    experienceAreas: [
      { area: "5-Star Hotel Operational Management", recommendedMonths: 24, description: "Front office, F&B, and room division departmental leadership" },
    ],
  },
  "executive-master-chef": {
    careerSlug: "executive-master-chef",
    careerTitle: "Executive Master Chef & Culinary Director",
    stream: "HOSPITALITY_TOURISM",
    regulatoryBody: "NCHMCT / FSSAI / Culinary Forum of India",
    mandatorySkills: [
      {
        skillName: "Culinary Technique & Menu Engineering",
        category: "Domain",
        minimumLevel: 5,
        importanceWeight: 3.0,
        description: "Classical and modern cooking techniques, flavor profiling, ingredient pairing.",
        assessmentAvailable: true,
      },
      {
        skillName: "Kitchen Hygiene & Food Safety (FSSAI/HACCP)",
        category: "Domain",
        minimumLevel: 4,
        importanceWeight: 2.9,
        description: "Cross-contamination control, cold storage temperatures, sanitization.",
        assessmentAvailable: true,
      },
    ],
    recommendedSkills: [
      {
        skillName: "Food Costing & Portion Mathematics",
        category: "Analytical",
        minimumLevel: 3,
        importanceWeight: 2.5,
        description: "Recipe yield calculations, supplier price contracts, wastage margins.",
        assessmentAvailable: false,
      },
    ],
    educationalPrerequisites: [
      { stage: "UNDERGRADUATE", requirement: "Degree / Diploma in Culinary Arts or Hotel Management", isMandatory: false },
    ],
    certifications: [
      { name: "Certified Master Chef / FSSAI FoSTaC", issuingBody: "Indian Federation of Culinary Associations (IFCA)", isMandatory: false, description: "Master culinary professional status" },
    ],
    experienceAreas: [
      { area: "Fine Dining Brigade Kitchen Leadership", recommendedMonths: 24, description: "Managing kitchen stations, chef de partie coaching, and banquet dinner service" },
    ],
  },

  // --------------------------------------------------------------------------
  // 12. INTERDISCIPLINARY & EMERGING CAREERS
  // --------------------------------------------------------------------------
  "bioinformatics-climate-scientist": {
    careerSlug: "bioinformatics-climate-scientist",
    careerTitle: "Bioinformatics & Climate Resilience Scientist",
    stream: "INTERDISCIPLINARY",
    regulatoryBody: "Department of Biotechnology (DBT) / ICAR",
    mandatorySkills: [
      {
        skillName: "Genomic Sequence Analysis & Python (Biopython)",
        category: "Technical",
        minimumLevel: 4,
        importanceWeight: 3.0,
        description: "Next-generation sequencing (NGS), BLAST, multiple sequence alignments.",
        assessmentAvailable: true,
      },
      {
        skillName: "Statistical Modeling & R for Biosystems",
        category: "Analytical",
        minimumLevel: 4,
        importanceWeight: 2.8,
        description: "Differential expression, clustering, ecological niche modeling.",
        assessmentAvailable: true,
      },
      {
        skillName: "Molecular Biology & Genetics Foundations",
        category: "Domain",
        minimumLevel: 3,
        importanceWeight: 2.7,
        description: "Gene regulatory networks, transcription factors, CRISPR targets.",
        assessmentAvailable: false,
      },
    ],
    recommendedSkills: [
      {
        skillName: "High Performance Computing & Bash",
        category: "Technical",
        minimumLevel: 3,
        importanceWeight: 2.2,
        description: "Submitting SLURM batch jobs on university compute clusters.",
        assessmentAvailable: false,
      },
    ],
    educationalPrerequisites: [
      { stage: "UNDERGRADUATE", requirement: "B.Tech/B.Sc in Bioinformatics, Biotechnology, or Computational Biology", isMandatory: true },
      { stage: "POSTGRADUATE", requirement: "M.Tech/M.Sc in Bioinformatics / Ph.D in progress", isMandatory: false },
    ],
    certifications: [
      { name: "Bioinformatics National Certification (BINC)", issuingBody: "DBT / NII New Delhi", isMandatory: false, description: "National credential recognizing bioinformatics research capability" },
    ],
    experienceAreas: [
      { area: "Genomic Pipeline & Modeling Projects", recommendedMonths: 12, description: "Crop stress tolerance genomic screening or transcriptomic pipeline publishing" },
    ],
  },
  "computational-linguist": {
    careerSlug: "computational-linguist",
    careerTitle: "Computational Linguist (Indic NLP)",
    stream: "INTERDISCIPLINARY",
    regulatoryBody: "MeitY / Bhashini Mission",
    mandatorySkills: [
      {
        skillName: "Natural Language Processing & Transformers",
        category: "Technical",
        minimumLevel: 4,
        importanceWeight: 3.0,
        description: "HuggingFace, tokenizers, LLM fine-tuning, BERT, cross-lingual embeddings.",
        assessmentAvailable: true,
      },
      {
        skillName: "Morphology & Syntax of Indic Languages",
        category: "Domain",
        minimumLevel: 4,
        importanceWeight: 2.9,
        description: "Devanagari scripts, agglutinative morphology, POS tagging, Paninian grammar.",
        assessmentAvailable: false,
      },
    ],
    recommendedSkills: [
      {
        skillName: "Speech Processing & ASR (Wav2Vec)",
        category: "Technical",
        minimumLevel: 3,
        importanceWeight: 2.4,
        description: "Acoustic modeling, phoneme segmentation, text-to-speech synthesis.",
        assessmentAvailable: false,
      },
    ],
    educationalPrerequisites: [
      { stage: "UNDERGRADUATE", requirement: "Degree in Computer Science, Linguistics, or Cognitive Science", isMandatory: true },
    ],
    certifications: [
      { name: "Indic NLP Research Certificate", issuingBody: "Bhashini / IIIT Hyderabad", isMandatory: false, description: "Recognized contribution to open-source Indic AI models" },
    ],
    experienceAreas: [
      { area: "Indic Corpus Annotation & Model Training", recommendedMonths: 6, description: "Building bilingual translation benchmarks and fine-tuning voice models" },
    ],
  },

  // --------------------------------------------------------------------------
  // 13. UNDECIDED STUDENTS
  // --------------------------------------------------------------------------
  "multidisciplinary-analyst": {
    careerSlug: "multidisciplinary-analyst",
    careerTitle: "Multidisciplinary Research & Aptitude Explorer",
    stream: "UNDECIDED",
    regulatoryBody: "Universal Educational Guidance",
    mandatorySkills: [
      {
        skillName: "Critical Reasoning & Logical Problem Solving",
        category: "Foundational",
        minimumLevel: 3,
        importanceWeight: 3.0,
        description: "Argument evaluation, deductive logic, identifying logical fallacies.",
        assessmentAvailable: true,
      },
      {
        skillName: "Quantitative Aptitude & Data Fluency",
        category: "Foundational",
        minimumLevel: 3,
        importanceWeight: 2.8,
        description: "Percentages, ratios, interpreting line and bar graphs, statistical awareness.",
        assessmentAvailable: true,
      },
      {
        skillName: "Structured Written & Verbal Communication",
        category: "Interpersonal",
        minimumLevel: 3,
        importanceWeight: 2.6,
        description: "Expressing hypotheses clearly, writing executive summaries, active listening.",
        assessmentAvailable: false,
      },
    ],
    recommendedSkills: [
      {
        skillName: "Digital Information Literacy & Research",
        category: "Foundational",
        minimumLevel: 3,
        importanceWeight: 2.2,
        description: "Evaluating reliable sources, fact checking, cross-referencing citations.",
        assessmentAvailable: false,
      },
    ],
    educationalPrerequisites: [
      { stage: "CLASS_10", requirement: "Completion of Secondary Schooling (Class 10) in any board", isMandatory: true },
    ],
    certifications: [
      { name: "KAABIL Comprehensive Stream Readiness Diagnostic", issuingBody: "KAABIL Platform", isMandatory: false, description: "13-stream interest and aptitude profiling benchmark" },
    ],
    experienceAreas: [
      { area: "Multi-Stream Exploratory Projects", recommendedMonths: 3, description: "Shadowing different careers, completing interdisciplinary online challenges" },
    ],
  },
};

/**
 * Returns requirements for a specific career slug.
 * If not found directly, tries partial matching or returns null.
 */
export function getCareerRequirements(careerSlug: string): CareerRequirement | null {
  if (CAREER_REQUIREMENTS[careerSlug]) {
    return CAREER_REQUIREMENTS[careerSlug];
  }
  // Try case-insensitive or partial matching
  const target = careerSlug.toLowerCase().trim();
  const foundKey = Object.keys(CAREER_REQUIREMENTS).find(
    (k) => k.toLowerCase() === target || target.includes(k) || k.includes(target)
  );
  return foundKey ? CAREER_REQUIREMENTS[foundKey] : null;
}

/**
 * Returns all career requirements within a given stream.
 */
export function getCareerRequirementsByStream(stream: string): CareerRequirement[] {
  return Object.values(CAREER_REQUIREMENTS).filter((r) => r.stream === stream);
}

/**
 * Returns a list of all available career slugs with defined requirements.
 */
export function getAllCareerSlugsWithRequirements(): string[] {
  return Object.keys(CAREER_REQUIREMENTS);
}
