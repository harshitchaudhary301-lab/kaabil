// ==============================================================================
// KAABIL (काबिल) — Multi-Stream Career Projects Database
// Practical real-world project deliverables across STEM, Healthcare, Commerce, Law,
// Design, Agriculture, Vocational Trades, and Arts (Beginner, Intermediate, Advanced)
// ==============================================================================

import { CareerProject } from "@/types/learning-plan";
import { EducationalStream } from "@/types";

export const CAREER_PROJECTS_DATABASE: CareerProject[] = [
  // ==========================================================================
  // 1. NON_MEDICAL_PCM (Software / Tech)
  // ==========================================================================
  {
    id: "proj-pcm-001",
    slug: "personal-portfolio-blog",
    title: "Responsive Portfolio & Technical Showcase",
    titleHi: "रिस्पॉन्सिव पोर्टफोलियो और टेक्निकल ब्लॉग",
    titleHinglish: "Responsive Portfolio aur Tech Blog Showcase",
    stream: "NON_MEDICAL_PCM",
    streamTitle: "Non-Medical / STEM & Engineering",
    careerSlug: "full-stack-web-developer",
    careerTitle: "Full Stack Web Developer",
    difficulty: "BEGINNER",
    estimatedHours: 12,
    objective: "Build a mobile-first personal portfolio showcasing projects, interactive themes, and clean semantic code.",
    objectiveHi: "प्रोजेक्ट्स और स्वच्छ सिमेंटिक कोड को प्रदर्शित करने वाला मोबाइल-फ्रेंडली पोर्टफोलियो बनाएं।",
    objectiveHinglish: "Ek modern portfolio website banayein jismein projects aur skills neatly showcased hon.",
    requiredSkills: ["HTML5 & CSS3", "JavaScript Fundamentals", "Git & GitHub"],
    recommendedTools: ["VS Code", "GitHub Pages", "Tailwind CSS"],
    materialsOrResources: [
      { name: "MDN Web Docs: Responsive Web Design", url: "https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design", note: "Layout guidelines" },
      { name: "GitHub Pages Quickstart", url: "https://docs.github.com/en/pages", note: "Free static deployment" }
    ],
    milestones: [
      { id: "m1", stepNumber: 1, title: "Wireframe & Project Architecture", titleHi: "वायरफ्रेम और संरचना", titleHinglish: "Wireframe aur file structure setup", description: "Design a clean 3-section layout: Hero, Projects, and Contact with semantic HTML.", deliverableHint: "Figma or rough pen-paper wireframe + index.html layout" },
      { id: "m2", stepNumber: 2, title: "Responsive Styling & Mobile Breakpoints", titleHi: "स्टाइलिंग और मोबाइल रिस्पॉन्सिवनेस", titleHinglish: "CSS styling aur mobile responsiveness", description: "Implement flexbox/grid layout that looks sharp on 320px mobile up to 4K desktop.", deliverableHint: "Modular CSS file with media queries" },
      { id: "m3", stepNumber: 3, title: "Interactive UI & Dark Mode Toggle", titleHi: "इंटरैक्टिव यूआई और डार्क मोड", titleHinglish: "JavaScript theme toggle aur smooth scroll", description: "Add a theme switch storing user preference in localStorage and smooth navigation.", deliverableHint: "Clean JS script with event listeners" },
      { id: "m4", stepNumber: 4, title: "Deploy to Live URL & README", titleHi: "लाइव होस्टिंग और दस्तावेज़ीकरण", titleHinglish: "Live host karein aur README likhein", description: "Host repository on GitHub and deploy via GitHub Pages or Vercel.", deliverableHint: "Live URL and public GitHub repository link" }
    ],
    submissionTypes: ["GITHUB_REPO", "LIVE_URL"],
    completionCriteria: [
      "Responsive layout validated on mobile and desktop viewports",
      "Valid semantic HTML with accessibility (a11y) aria labels",
      "Public GitHub repo with comprehensive README and live link"
    ],
    realWorldContext: "Essential foundational project for any aspiring developer to demonstrate mastery of modern web standards."
  },
  {
    id: "proj-pcm-002",
    slug: "sprint-management-dashboard",
    title: "Agile Sprint Tracker & Task Management App",
    titleHi: "एजाइल स्प्रिंट ट्रैकर और टास्क मैनेजमेंट ऐप",
    titleHinglish: "Agile Sprint Tracker aur Task Management Dashboard",
    stream: "NON_MEDICAL_PCM",
    streamTitle: "Non-Medical / STEM & Engineering",
    careerSlug: "full-stack-web-developer",
    careerTitle: "Full Stack Web Developer",
    difficulty: "INTERMEDIATE",
    estimatedHours: 24,
    objective: "Develop a full-featured Kanban board with drag-and-drop, persistent backend data, and optimistic UI updates.",
    objectiveHi: "ड्रैग-एंड-ड्रॉप और बैकएंड डेटा पर्सिस्टेंस के साथ एक संपूर्ण कानबान बोर्ड बनाएं।",
    objectiveHinglish: "Ek interactive task board banayein jismein drag-drop aur real-time data persistence ho.",
    requiredSkills: ["React / Next.js", "Relational Databases & SQL", "RESTful APIs", "TypeScript"],
    recommendedTools: ["Next.js App Router", "Prisma ORM", "Tailwind CSS"],
    materialsOrResources: [
      { name: "Next.js App Router Documentation", url: "https://nextjs.org/docs", note: "Server actions and client components" },
      { name: "Prisma Schema Guide", url: "https://www.prisma.io/docs", note: "Relational data modeling" }
    ],
    milestones: [
      { id: "m1", stepNumber: 1, title: "Data Model & Schema Migration", titleHi: "डेटा मॉडल और माइग्रेशन", titleHinglish: "Database schema design", description: "Define Task, Column, and Sprint models with foreign keys.", deliverableHint: "Prisma schema or SQL DDL script" },
      { id: "m2", stepNumber: 2, title: "CRUD API Endpoints & Validations", titleHi: "एपीआई एंडपॉइंट्स और वैलिडेशन", titleHinglish: "Server actions ya API routes with Zod", description: "Build type-safe CRUD operations with validation checks.", deliverableHint: "Route handlers or server actions" },
      { id: "m3", stepNumber: 3, title: "Interactive Drag-and-Drop Board", titleHi: "ड्रैग-एंड-ड्रॉप बोर्ड यूआई", titleHinglish: "Client-side state & drag-and-drop", description: "Implement fluid column transitions with optimistic state updates.", deliverableHint: "Modular Board and TaskCard React components" },
      { id: "m4", stepNumber: 4, title: "Filters, Search & Production Deployment", titleHi: "फिल्टर, सर्च और लाइव डिप्लॉयमेंट", titleHinglish: "Search filters aur live deployment", description: "Add instant search by title/tag and deploy to Vercel/Render.", deliverableHint: "Live deployment URL + GitHub repository" }
    ],
    submissionTypes: ["GITHUB_REPO", "LIVE_URL"],
    completionCriteria: [
      "Zero TypeScript compilation warnings or errors",
      "Persistent data changes surviving browser refresh",
      "Keyboard accessible and mobile-usable interface"
    ],
    realWorldContext: "Mirrors internal engineering productivity tools used across modern tech startups."
  },

  // ==========================================================================
  // 2. COMMERCE & FINANCE
  // ==========================================================================
  {
    id: "proj-com-001",
    slug: "small-business-cash-flow-tracker",
    title: "Small Business Cash Flow & Working Capital Model",
    titleHi: "लघु उद्योग कैश फ्लो और वर्किंग कैपिटल मॉडल",
    titleHinglish: "Small Business Cash Flow aur Working Capital Spreadsheet Model",
    stream: "COMMERCE",
    streamTitle: "Commerce & Finance",
    careerSlug: "chartered-accountant-icai",
    careerTitle: "Chartered Accountant (CA)",
    difficulty: "BEGINNER",
    estimatedHours: 10,
    objective: "Construct an automated financial spreadsheet analyzing a retail merchant's 12-month operating cash cycle.",
    objectiveHi: "एक खुदरा व्यापारी के 12 महीने के कैश फ्लो का विश्लेषण करने वाली ऑटोमेटेड स्प्रेडशीट बनाएं।",
    objectiveHinglish: "MS Excel/Sheets mein ek retailer ka monthly cash in/out aur working capital track karein.",
    requiredSkills: ["Financial Accounting & Reporting", "Advanced MS Excel", "Working Capital Management"],
    recommendedTools: ["Microsoft Excel", "Google Sheets", "ICAI BoS Study Material"],
    materialsOrResources: [
      { name: "ICAI BoS: Cash Flow Statement (AS 3)", url: "https://www.icai.org/post/bos-knowledge-portal", note: "Statutory framework" },
      { name: "RBI MSME Guidelines", url: "https://www.rbi.org.in/", note: "Working capital ratios" }
    ],
    milestones: [
      { id: "m1", stepNumber: 1, title: "Transaction Ledger Setup", titleHi: "लेन-देन लेजर सेटअप", titleHinglish: "Ledger entries aur chart of accounts", description: "Set up standardized chart of accounts for operating, investing, and financing items.", deliverableHint: "Categorized ledger template" },
      { id: "m2", stepNumber: 2, title: "Monthly Cash Flow Projections", titleHi: "मासिक कैश फ्लो अनुमान", titleHinglish: "Formula-driven cash flow projections", description: "Build dynamic formula-driven projections linking sales seasonality and supplier credit.", deliverableHint: "Working Capital & Cash Flow worksheet" },
      { id: "m3", stepNumber: 3, title: "Liquidity Ratio Analysis", titleHi: "लिक्विडिटी अनुपात विश्लेषण", titleHinglish: "Current ratio aur cash burn analysis", description: "Calculate Current Ratio, Quick Ratio, and Day Sales Outstanding (DSO).", deliverableHint: "Ratio analysis dashboard with charts" },
      { id: "m4", stepNumber: 4, title: "Executive Financial Advisory Memo", titleHi: "वित्तीय सलाहकार रिपोर्ट", titleHinglish: "1-page advisory summary for business owner", description: "Draft actionable recommendations on inventory turnaround and debt management.", deliverableHint: "1-page executive advisory PDF memo" }
    ],
    submissionTypes: ["DOCUMENT_PDF", "CASE_STUDY_WRITEUP"],
    completionCriteria: [
      "Dynamic Excel/Sheets formulas with zero hardcoded arithmetic",
      "Compliance with AS-3 Cash Flow Statement taxonomy",
      "Clear professional recommendation for working capital optimization"
    ],
    realWorldContext: "Directly applicable to MSME accounting audits, startup financial operations, and CA articleship."
  },
  {
    id: "proj-com-002",
    slug: "gst-statutory-audit-compilation",
    title: "Comprehensive GST Statutory Audit & Input Tax Reconciliation",
    titleHi: "जीएसटी सांविधिक ऑडिट और इनपुट टैक्स क्रेडिट मिलान",
    titleHinglish: "GST Audit aur ITC Reconciliation Case Study",
    stream: "COMMERCE",
    streamTitle: "Commerce & Finance",
    careerSlug: "chartered-accountant-icai",
    careerTitle: "Chartered Accountant (CA)",
    difficulty: "INTERMEDIATE",
    estimatedHours: 20,
    objective: "Execute an end-to-end reconciliation between GSTR-2B purchase ledgers and books of accounts with mismatch resolution.",
    objectiveHi: "GSTR-2B खरीद लेजर और बुक्स ऑफ अकाउंट्स के बीच इनपुट टैक्स क्रेडिट का संपूर्ण मिलान करें।",
    objectiveHinglish: "Books vs GSTR-2B data reconcile karke ineligible ITC aur tax liabilities identify karein.",
    requiredSkills: ["GST & Direct Tax Compliance", "Statutory Audit", "Financial Statement Analysis"],
    recommendedTools: ["Excel XLOOKUP/Power Query", "GST Portal Simulator", "ClearTax Guides"],
    materialsOrResources: [
      { name: "CBIC GST Law & Rules", url: "https://www.cbic.gov.in/", note: "CGST/IGST statutory rules" },
      { name: "ICAI Technical Guide on GST Audit", url: "https://www.icai.org/", note: "Audit methodology" }
    ],
    milestones: [
      { id: "m1", stepNumber: 1, title: "Data Ingestion & Normalization", titleHi: "डेटा इनपुट और नॉर्मलाइजेशन", titleHinglish: "Data cleaning via Power Query/Excel", description: "Standardize vendor GSTINs, invoice numbers, and taxable values across datasets.", deliverableHint: "Cleaned data worksheet" },
      { id: "m2", stepNumber: 2, title: "Automated Reconciliation Script/Formula", titleHi: "रिकॉन्सिलिएशन फॉर्मूला", titleHinglish: "Automated 2B vs books matching logic", description: "Classify items into Matched, Mismatched, In Books Not in 2B, and In 2B Not in Books.", deliverableHint: "Reconciliation matrix with variance flags" },
      { id: "m3", stepNumber: 3, title: "Ineligible ITC Assessment", titleHi: "अपात्र आईटीसी मूल्यांकन", titleHinglish: "Section 17(5) blocked credit review", description: "Identify blocked credits under Section 17(5) and compute interest under Section 50.", deliverableHint: "Statutory findings table" },
      { id: "m4", stepNumber: 4, title: "Statutory Audit Memorandum & GSTR-9/9C Plan", titleHi: "ऑडिट मेमोरेंडम और रिपोर्ट", titleHinglish: "Comprehensive audit memo with annexures", description: "Draft formal management representation letter and corrective journal entries.", deliverableHint: "Formal audit memorandum PDF" }
    ],
    submissionTypes: ["DOCUMENT_PDF", "CASE_STUDY_WRITEUP"],
    completionCriteria: [
      "Rigorous adherence to CGST Act Sections 16, 17, and 50",
      "Accurate calculation of penal interest and reversal entries",
      "Executive summary tailored for enterprise CFO presentation"
    ],
    realWorldContext: "Core competency tested during corporate tax audits and tier-1 CA firm articleships."
  },

  // ==========================================================================
  // 3. MEDICAL & HEALTHCARE (PCB)
  // ==========================================================================
  {
    id: "proj-med-001",
    slug: "lifestyle-metabolic-risk-survey",
    title: "Community Metabolic Health & Hypertension Risk Audit",
    titleHi: "सामुदायिक मेटाबोलिक स्वास्थ्य और हाइपरटेंशन जोखिम सर्वे",
    titleHinglish: "Community Metabolic Health aur Hypertension Risk Audit",
    stream: "MEDICAL_PCB",
    streamTitle: "Medical & Healthcare (PCB)",
    careerSlug: "mbbs-doctor",
    careerTitle: "MBBS Doctor / Physician",
    difficulty: "BEGINNER",
    estimatedHours: 14,
    objective: "Design and analyze a standardized 50-person epidemiological screening questionnaire assessing lifestyle cardiovascular risk factors.",
    objectiveHi: "50 व्यक्तियों की स्क्रीनिंग के लिए एक मानकीकृत हृदय और मेटाबोलिक जोखिम प्रश्नावली तैयार और विश्लेषित करें।",
    objectiveHinglish: "50-person survey data analyze karke lifestyle risk factors aur preventive interventions report karein.",
    requiredSkills: ["Human Anatomy & Physiology", "Preventive Medicine & Epidemiology", "Biostatistics"],
    recommendedTools: ["WHO STEPS Instrument", "Google Forms / Sheets", "ICMR Guidelines"],
    materialsOrResources: [
      { name: "WHO STEPS Surveillance Manual", url: "https://www.who.int/teams/noncommunicable-diseases/surveillance/systems-tools/steps", note: "Standard survey protocol" },
      { name: "ICMR Non-Communicable Diseases Guidelines", url: "https://main.icmr.nic.in/", note: "Indian demographic benchmarks" }
    ],
    milestones: [
      { id: "m1", stepNumber: 1, title: "Questionnaire Design & Ethical Framework", titleHi: "प्रश्नावली और नैतिक दिशानिर्देश", titleHinglish: "Survey questionnaire design based on WHO protocol", description: "Formulate questions covering dietary sodium, physical activity (MET minutes), tobacco, and BMI.", deliverableHint: "Standardized screening questionnaire" },
      { id: "m2", stepNumber: 2, title: "Data Collection & Cohort Stratification", titleHi: "डेटा संग्रह और वर्गीकरण", titleHinglish: "Data gathering and age/gender stratification", description: "Collect sample data and categorize respondents into low, moderate, and elevated risk tiers.", deliverableHint: "Anonymized cohort dataset spreadsheet" },
      { id: "m3", stepNumber: 3, title: "Statistical Correlation & Risk Factor Analysis", titleHi: "सांख्यिकीय विश्लेषण", titleHinglish: "Statistical analysis of BMI vs sedentary hours", description: "Compute prevalence rates and cross-tabulate lifestyle factors with self-reported blood pressure.", deliverableHint: "Analytical charts and summary tables" },
      { id: "m4", stepNumber: 4, title: "Preventive Healthcare Advisory Whitepaper", titleHi: "निवारक स्वास्थ्य सलाह श्वेतपत्र", titleHinglish: "Community health intervention whitepaper", description: "Draft evidence-backed recommendations for community dietary modification and physical activity.", deliverableHint: "Clinical-grade epidemiological report PDF" }
    ],
    submissionTypes: ["DOCUMENT_PDF", "CASE_STUDY_WRITEUP"],
    completionCriteria: [
      "Strict compliance with anonymized data privacy (no personally identifiable patient info)",
      "Accurate application of WHO BMI cut-offs for Asian Indians (<23 normal, 23-24.9 overweight, >=25 obese)",
      "Clear, empathetic preventive counseling guidelines"
    ],
    realWorldContext: "Foundational community medicine project for MBBS, BAMS, Public Health, and Nursing students."
  },

  // ==========================================================================
  // 4. LAW & LEGAL STUDIES
  // ==========================================================================
  {
    id: "proj-law-001",
    slug: "commercial-nda-contract-drafting",
    title: "Bilingual Commercial Non-Disclosure & IP Protection Agreement",
    titleHi: "द्विभाषी वाणिज्यिक गोपनीयता और बौद्धिक संपदा संरक्षण अनुबंध",
    titleHinglish: "Commercial NDA aur Intellectual Property Protection Agreement Drafting",
    stream: "LAW",
    streamTitle: "Law & Legal Studies",
    careerSlug: "corporate-lawyer-mna",
    careerTitle: "Corporate Lawyer (M&A / Advisory)",
    difficulty: "BEGINNER",
    estimatedHours: 12,
    objective: "Draft an airtight, bilateral Non-Disclosure Agreement (NDA) under the Indian Contract Act, 1872 with clear carve-outs and arbitration clauses.",
    objectiveHi: "भारतीय अनुबंध अधिनियम, 1872 के तहत एक मजबूत द्विपक्षीय गोपनीयता अनुबंध तैयार करें।",
    objectiveHinglish: "Indian Contract Act ke tehat ek solid commercial NDA draft karein with dispute resolution clauses.",
    requiredSkills: ["Contract Law & Drafting", "Legal Research & Citation", "Statutory Interpretation"],
    recommendedTools: ["Indian Kanoon", "Manupatra / SCC Online", "Google Docs / MS Word"],
    materialsOrResources: [
      { name: "Indian Contract Act, 1872 (Full Text)", url: "https://www.indiacode.nic.in/handle/123456789/2187", note: "Statutory provisions" },
      { name: "Arbitration and Conciliation Act, 1996", url: "https://www.indiacode.nic.in/handle/123456789/1978", note: "Dispute resolution mechanisms" }
    ],
    milestones: [
      { id: "m1", stepNumber: 1, title: "Term Sheet & Clause Taxonomy", titleHi: "शर्तों की रूपरेखा", titleHinglish: "Term sheet analysis aur clause outlining", description: "Identify defining terms: Confidential Information, Permitted Purpose, Exclusions, and Duration.", deliverableHint: "Detailed clause outline" },
      { id: "m2", stepNumber: 2, title: "Operative Clauses Drafting", titleHi: "मुख्य धाराओं का मसौदा", titleHinglish: "Non-disclosure obligations and IP ownership clauses", description: "Draft non-use, standard of care, reverse-engineering prohibitions, and return-of-materials clauses.", deliverableHint: "First draft contract document" },
      { id: "m3", stepNumber: 3, title: "Remedies, Indemnity & Arbitration Clause", titleHi: "हर्जाना और मध्यस्थता खंड", titleHinglish: "Injunction relief, indemnity and arbitration jurisdiction", description: "Incorporate injunctive relief acknowledgement, indemnification cap, and seat of arbitration.", deliverableHint: "Full agreement draft with annotations" },
      { id: "m4", stepNumber: 4, title: "Client Advisory & Negotiation Playbook", titleHi: "क्लाइंट सलाह और नेगोशिएशन गाइड", titleHinglish: "Redline negotiation guide for corporate client", description: "Create a side-by-side negotiation guide explaining fallbacks if the counterparty pushes back.", deliverableHint: "Draft Agreement + Negotiation Playbook PDF" }
    ],
    submissionTypes: ["DOCUMENT_PDF", "CASE_STUDY_WRITEUP"],
    completionCriteria: [
      "Rigorous legal phrasing without ambiguity or conflicting provisions",
      "Jurisdiction and governing law clause compliant with Section 28 of Indian Contract Act",
      "Practical fallback positions in negotiation notes"
    ],
    realWorldContext: "Standard bread-and-butter legal drafting expected of junior corporate associates and paralegals."
  },

  // ==========================================================================
  // 5. CREATIVE ARTS & DESIGN
  // ==========================================================================
  {
    id: "proj-des-001",
    slug: "fintech-micro-savings-ux",
    title: "Micro-Savings & Daily Investment App: End-to-End UI/UX Case Study",
    titleHi: "माइक्रो-सेविंग्स ऐप: संपूर्ण यूआई/यूएक्स केस स्टडी",
    titleHinglish: "Micro-Savings App UI/UX Case Study and Interactive Prototype",
    stream: "CREATIVE_DESIGN",
    streamTitle: "Creative Arts & Design",
    careerSlug: "ui-ux-digital-product-designer",
    careerTitle: "UI/UX & Digital Product Designer",
    difficulty: "INTERMEDIATE",
    estimatedHours: 22,
    objective: "Design a high-fidelity mobile experience for first-time Tier-2/3 Indian investors, featuring voice-assist, vernacular labels, and frictionless auto-save.",
    objectiveHi: "टीयर-2/3 भारतीय उपयोगकर्ताओं के लिए एक सरल और आकर्षक माइक्रो-इन्वेस्टमेंट ऐप का प्रोटोटाइप बनाएं।",
    objectiveHinglish: "First-time retail investors ke liye intuitive Figma prototype aur usability research study banayein.",
    requiredSkills: ["Figma Design & Prototyping", "User Research & Information Architecture", "Design Systems Architecture"],
    recommendedTools: ["Figma", "FigJam", "Miro", "Material Design 3"],
    materialsOrResources: [
      { name: "Google Material Design Guidelines", url: "https://m3.material.io/", note: "Component tokens & elevation" },
      { name: "Nielsen Norman Group UX Heuristics", url: "https://www.nngroup.com/articles/ten-usability-heuristics/", note: "Usability standards" }
    ],
    milestones: [
      { id: "m1", stepNumber: 1, title: "User Persona & Journey Mapping", titleHi: "यूजर पर्सोना और जर्नी मैपिंग", titleHinglish: "User personas aur pain-point mapping", description: "Map out the mental model of a small Kirana store owner saving ₹50 daily.", deliverableHint: "Empathy map and user journey flow in Figma/FigJam" },
      { id: "m2", stepNumber: 2, title: "Low-Fidelity Wireframes & Information Architecture", titleHi: "लो-फिडेलिटी वायरफ्रेम", titleHinglish: "Information architecture and wireframe flows", description: "Design low-fidelity screens for onboarding, UPI auto-pay setup, and savings portfolio.", deliverableHint: "Set of 8-10 wireframe artboards" },
      { id: "m3", stepNumber: 3, title: "Design System Tokens & Component Library", titleHi: "डिजाइन सिस्टम और कंपोनेंट्स", titleHinglish: "Typography, color tokens and reusable components", description: "Build scalable color scales (accessible WCAG AA), typography, badges, and button states.", deliverableHint: "Figma component asset library" },
      { id: "m4", stepNumber: 4, title: "High-Fidelity Interactive Prototype & Usability Audit", titleHi: "हाई-फिडेलिटी प्रोटोटाइप और ऑडिट", titleHinglish: "Interactive clickable prototype with micro-interactions", description: "Link smart-animate transitions and document heuristic evaluation results.", deliverableHint: "Figma prototype link + Behance/PDF case study deck" }
    ],
    submissionTypes: ["DESIGN_PROTOTYPE", "LIVE_URL", "DOCUMENT_PDF"],
    completionCriteria: [
      "Figma prototype with working click-through flow from home to completed transaction",
      "WCAG 2.1 AA color contrast compliance verified across all text elements",
      "Thoughtful consideration of vernacular/Hinglish UI labels and simplified financial terminology"
    ],
    realWorldContext: "Industry standard portfolio showcase piece for digital product designer hiring at leading Indian FinTechs."
  },

  // ==========================================================================
  // 6. AGRICULTURE & FOOD TECH
  // ==========================================================================
  {
    id: "proj-agr-001",
    slug: "precision-fertigation-soil-plan",
    title: "Precision Soil Health Audit & Automated Fertigation Regimen",
    titleHi: "मृदा स्वास्थ्य ऑडिट और स्वचालित फर्टिगेशन योजना",
    titleHinglish: "Precision Soil Health Audit aur Automated Fertigation Plan",
    stream: "AGRICULTURE",
    streamTitle: "Agriculture & Food Technology",
    careerSlug: "precision-agronomist-crop-scientist",
    careerTitle: "Precision Agronomist & Crop Scientist",
    difficulty: "INTERMEDIATE",
    estimatedHours: 18,
    objective: "Formulate a precision nutrient management and drip irrigation schedule for a 5-hectare semi-arid horticulture farm based on laboratory soil test assays.",
    objectiveHi: "प्रयोगशाला मिट्टी परीक्षण रिपोर्ट के आधार पर 5 हेक्टेयर बागवानी खेत के लिए सटीक पोषक तत्व और ड्रिप सिंचाई कार्यक्रम बनाएं।",
    objectiveHinglish: "Lab soil test report ke basis par crop water requirement aur N-P-K fertigation schedule plan karein.",
    requiredSkills: ["Soil Science & Crop Nutrition", "Precision Agriculture & Drip Irrigation", "Farm Operations Management"],
    recommendedTools: ["FAO CropWat Simulator", "ICAR Soil Health Portal", "MS Excel"],
    materialsOrResources: [
      { name: "ICAR Soil Health Card Portal", url: "https://soilhealth.dac.gov.in/", note: "Standard test parameters" },
      { name: "FAO Irrigation and Drainage Guidelines (Paper 56)", url: "https://www.fao.org/land-water/databases-and-software/cropwat/en/", note: "Evapotranspiration formulas" }
    ],
    milestones: [
      { id: "m1", stepNumber: 1, title: "Soil Test Data Analysis & Deficiency Identification", titleHi: "मृदा परीक्षण विश्लेषण", titleHinglish: "Lab soil report analysis for pH, EC, and macro/micronutrients", description: "Interpret electrical conductivity, pH, organic carbon, and available N, P, K levels.", deliverableHint: "Soil nutrient balance sheet" },
      { id: "m2", stepNumber: 2, title: "Crop Evapotranspiration & Water Budgeting", titleHi: "फसल जल आवश्यकता अनुमान", titleHinglish: "Crop water requirement (ETc) calculation", description: "Calculate reference evapotranspiration (ETo) and crop coefficient (Kc) across growth stages.", deliverableHint: "Weekly water budgeting spreadsheet" },
      { id: "m3", stepNumber: 3, title: "Automated Fertigation Dosing Schedule", titleHi: "फर्टिगेशन डोजिंग शेड्यूल", titleHinglish: "Water-soluble fertilizer dosing schedule", description: "Design a stage-specific water-soluble fertilizer recipe (19:19:19, Calcium Nitrate, Micronutrient mix).", deliverableHint: "Growth-stage fertigation calendar" },
      { id: "m4", stepNumber: 4, title: "Farm Advisory Dossier & ROI Projection", titleHi: "किसान सलाहकार दस्तावेज और लागत विश्लेषण", titleHinglish: "Comprehensive farm advisory dossier with input cost analysis", description: "Compile operational guidelines for drip pressure maintenance, acid washing, and yield projections.", deliverableHint: "Complete Agronomic Management Plan PDF" }
    ],
    submissionTypes: ["DOCUMENT_PDF", "CASE_STUDY_WRITEUP"],
    completionCriteria: [
      "Precise fertilizer requirement calculations balancing soil reserve and crop uptake",
      "Clear hydraulic calculations for drip line discharge and operating pressure",
      "Cost-benefit analysis comparing flood irrigation vs precision fertigation"
    ],
    realWorldContext: "Essential professional skill for agritech consultancies, precision irrigation firms (Jain, Netafim), and FPO managers."
  },

  // ==========================================================================
  // 7. VOCATIONAL & TECHNICAL TRADES
  // ==========================================================================
  {
    id: "proj-voc-001",
    slug: "plc-conveyor-sorting-logic",
    title: "Industrial Conveyor Sorting & Safety Interlock PLC Simulation",
    titleHi: "औद्योगिक कन्वेयर सॉर्टिंग और सुरक्षा इंटरलॉक पीएलसी सिमुलेशन",
    titleHinglish: "PLC Ladder Logic Simulation: Industrial Sorting & Safety Interlock",
    stream: "VOCATIONAL_TRADES",
    streamTitle: "Vocational & Technical Trades",
    careerSlug: "industrial-mechatronics-plc-specialist",
    careerTitle: "Industrial Mechatronics & Automation Specialist",
    difficulty: "INTERMEDIATE",
    estimatedHours: 16,
    objective: "Design and verify a PLC ladder logic program controlling an automated packaging conveyor with proximity sensors, pneumatic diverters, and emergency E-Stop interlocks.",
    objectiveHi: "निकटता सेंसर, वायवीय डायवर्टर और आपातकालीन ई-स्टॉप इंटरलॉक के साथ एक पीएलसी लैडर लॉजिक प्रोग्राम बनाएं।",
    objectiveHinglish: "Sensors aur pneumatic actuators ke sath conveyor sorting ladder logic program design aur simulate karein.",
    requiredSkills: ["PLC Programming & Ladder Logic", "Industrial Sensors & Actuators", "Industrial Safety & Standards"],
    recommendedTools: ["OpenPLC Editor", "Factory I/O Simulator", "Siemens TIA Portal Demo"],
    materialsOrResources: [
      { name: "IEC 61131-3 Standard Overview", url: "https://plcopen.org/", note: "Standard programming language" },
      { name: "NPTEL Industrial Automation Resources", url: "https://nptel.ac.in/courses/108105062", note: "IIT Kharagpur lectures" }
    ],
    milestones: [
      { id: "m1", stepNumber: 1, title: "I/O Allocation & Electrical Wiring Schematic", titleHi: "इनपुट/आउटपुट आवंटन और वायरिंग आरेख", titleHinglish: "I/O memory table and electrical wiring diagram", description: "Map all digital inputs (photoelectric sensors, push buttons) and outputs (motor contactor, solenoids).", deliverableHint: "I/O assignment table and schematic diagram" },
      { id: "m2", stepNumber: 2, title: "State Transition Diagram & Control Logic", titleHi: "कंट्रोल स्टेट ट्रांजिशन डायग्राम", titleHinglish: "State machine logic for sorting sequence", description: "Map out Idle, Conveyor Run, Detection, Ejection, and Jam condition states.", deliverableHint: "Sequential Function Chart (SFC) or flow diagram" },
      { id: "m3", stepNumber: 3, title: "Ladder Logic Implementation & Safety Interlocks", titleHi: "लैडर लॉजिक कोडिंग और सुरक्षा इंटरलॉक", titleHinglish: "Ladder rungs with timers, counters, and hardwired E-Stop logic", description: "Write clean ladder rungs using TON timers, CTU counters, and latching relays with fail-safe stop.", deliverableHint: "PLC ladder logic export file or screenshot suite" },
      { id: "m4", stepNumber: 4, title: "Virtual Commissioning & Fault Simulation Report", titleHi: "सिमुलेशन परीक्षण और फॉल्ट रिपोर्ट", titleHinglish: "Simulation testing report with fault recovery procedures", description: "Test system behavior during sensor failure and emergency shutoff; document safety compliance.", deliverableHint: "Technical Commissioning & Safety Dossier PDF" }
    ],
    submissionTypes: ["DOCUMENT_PDF", "CASE_STUDY_WRITEUP", "GITHUB_REPO"],
    completionCriteria: [
      "Adherence to IEC 61131-3 ladder programming syntax",
      "Fail-safe emergency circuit preventing automatic motor restart upon power recovery",
      "Well-documented tag descriptions and rung comments"
    ],
    realWorldContext: "Fundamental competency for automation technicians in manufacturing plants, auto factories, and logistics warehouses."
  },

  // ==========================================================================
  // 8. ARTS, HUMANITIES & SOCIAL SCIENCES
  // ==========================================================================
  {
    id: "proj-art-001",
    slug: "youth-skilling-policy-brief",
    title: "Public Policy Whitepaper: Urban Youth Skilling & Apprenticeship Reform",
    titleHi: "पब्लिक पॉलिसी श्वेतपत्र: शहरी युवा कौशल और अप्रेंटिसशिप सुधार",
    titleHinglish: "Public Policy Whitepaper on Youth Skilling & Apprenticeships",
    stream: "ARTS_HUMANITIES",
    streamTitle: "Arts, Humanities & Social Sciences",
    careerSlug: "civil-services-ias-officer",
    careerTitle: "Civil Services / Public Policy Specialist",
    difficulty: "INTERMEDIATE",
    estimatedHours: 20,
    objective: "Author an evidence-driven policy brief proposing state-level incentives for apprenticeship adoption in manufacturing and service SMEs.",
    objectiveHi: "विनिर्माण और सेवा क्षेत्र में अप्रेंटिसशिप को बढ़ावा देने के लिए एक साक्ष्य-आधारित नीतिगत मसौदा तैयार करें।",
    objectiveHinglish: "Periodic Labour Force Survey (PLFS) data ke aadhar par practical skilling policy recommendations draft karein.",
    requiredSkills: ["Policy Research & Analysis", "Sociological Analysis", "Qualitative & Quantitative Evaluation"],
    recommendedTools: ["MoSPI Data Portal", "NITI Aayog Reports", "Zotero Reference Manager"],
    materialsOrResources: [
      { name: "NITI Aayog Strategy for New India", url: "https://www.niti.gov.in/", note: "Skill development policy pillar" },
      { name: "MoSPI Periodic Labour Force Survey (PLFS)", url: "https://mospi.gov.in/", note: "Empirical workforce statistics" }
    ],
    milestones: [
      { id: "m1", stepNumber: 1, title: "Literature Review & Problem Formulation", titleHi: "साहित्य समीक्षा और समस्या निरूपण", titleHinglish: "Literature review of Indian apprenticeship schemes (NAPS)", description: "Analyze National Apprenticeship Promotion Scheme (NAPS) uptake barriers among MSMEs.", deliverableHint: "Literature synthesis matrix" },
      { id: "m2", stepNumber: 2, title: "Secondary Data Analysis & Demographic Profiling", titleHi: "द्वितीयक डेटा विश्लेषण", titleHinglish: "PLFS youth unemployment data analysis", description: "Evaluate youth NEET (Not in Education, Employment, or Training) figures across Tier-2/3 districts.", deliverableHint: "Data charts and demographic findings table" },
      { id: "m3", stepNumber: 3, title: "Policy Options & Fiscal Viability Modeling", titleHi: "नीति विकल्प और वित्तीय मॉडलिंग", titleHinglish: "3 policy intervention options with fiscal cost estimates", description: "Formulate three actionable policy levers: stipend subsidies, payroll tax rebates, and cluster training hubs.", deliverableHint: "Policy alternatives comparative matrix" },
      { id: "m4", stepNumber: 4, title: "Final Policy Brief & Stakeholder Implementation Roadmap", titleHi: "अंतिम पॉलिसी ब्रीफ और क्रियान्वयन योजना", titleHinglish: "Executive policy brief for government administrators", description: "Draft executive summary, risk matrix, and 3-year phased implementation roadmap for state administrative secretaries.", deliverableHint: "Comprehensive 8-10 page Policy Brief PDF" }
    ],
    submissionTypes: ["DOCUMENT_PDF", "CASE_STUDY_WRITEUP"],
    completionCriteria: [
      "Rigorous empirical grounding referencing official government datasets (PLFS / NSSO)",
      "Balanced analysis of administrative feasibility and budget constraints",
      "Executive summary structured according to civil service policy briefing protocols"
    ],
    realWorldContext: "Directly mimics analytical briefs drafted by policy researchers at NITI Aayog, state planning boards, and think tanks."
  }
];

/**
 * Get projects matching a career slug or stream, sorted with matching career first
 */
export function getProjectsForCareer(
  stream: EducationalStream,
  careerSlug?: string
): CareerProject[] {
  const matchingCareer = careerSlug
    ? CAREER_PROJECTS_DATABASE.filter(
        (p) =>
          p.careerSlug === careerSlug ||
          careerSlug.includes(p.careerSlug) ||
          p.careerSlug.includes(careerSlug)
      )
    : [];

  const matchingStream = CAREER_PROJECTS_DATABASE.filter(
    (p) => p.stream === stream && !matchingCareer.some((m) => m.id === p.id)
  );

  const others = CAREER_PROJECTS_DATABASE.filter(
    (p) => p.stream !== stream && !matchingCareer.some((m) => m.id === p.id)
  );

  return [...matchingCareer, ...matchingStream, ...others];
}

/**
 * Get a single project by slug or ID
 */
export function getProjectBySlugOrId(identifier: string): CareerProject | undefined {
  return CAREER_PROJECTS_DATABASE.find(
    (p) => p.id === identifier || p.slug === identifier
  );
}
