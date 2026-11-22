// ==============================================================================
// KAABIL (काबिल) — Authentic Curated Learning Resources Database
// Trustworthy, free, verified Indian and international public learning resources
// (NPTEL, Swayam, MIT OCW, Khan Academy, ICAI BoS, ICAR, AICTE, MedlinePlus)
// ==============================================================================

import { CuratedLearningResource } from "@/types/learning-plan";
import { EducationalStream } from "@/types";

export const CURATED_LEARNING_RESOURCES: CuratedLearningResource[] = [
  // --- NON_MEDICAL_PCM / Software / Engineering ---
  {
    id: "res-pcm-001",
    title: "Programming, Data Structures and Algorithms using Python",
    provider: "NPTEL / IIT Madras (Prof. Madhavan Mukund)",
    url: "https://nptel.ac.in/courses/106106145",
    isFree: true,
    estimatedHours: 30,
    stream: "NON_MEDICAL_PCM",
    targetSkillName: "Data Structures & Algorithms",
    format: "VIDEO_SERIES",
    description: "Rigorous algorithmic foundations covering sorting, searching, recursion, dynamic programming, and data structures.",
    accreditedBy: "Ministry of Education, Govt. of India / IIT Madras",
  },
  {
    id: "res-pcm-002",
    title: "Full Stack Web Development & Modern JavaScript",
    provider: "MDN Web Docs & FreeCodeCamp",
    url: "https://developer.mozilla.org/en-US/docs/Learn",
    isFree: true,
    estimatedHours: 40,
    stream: "NON_MEDICAL_PCM",
    targetSkillName: "Web Development (React / Next.js)",
    format: "DOCUMENTATION",
    description: "Comprehensive industry-standard curriculum for semantic HTML5, CSS layout, JavaScript ES6+, and API integration.",
    accreditedBy: "Mozilla Foundation & Open Web Standards",
  },
  {
    id: "res-pcm-003",
    title: "Database Management Systems (DBMS)",
    provider: "Swayam / IIT Kharagpur (Prof. Partha Pratim Das)",
    url: "https://swayam.gov.in/explorer?searchText=DBMS",
    isFree: true,
    estimatedHours: 24,
    stream: "NON_MEDICAL_PCM",
    targetSkillName: "Relational Databases & SQL",
    format: "INTERACTIVE_COURSE",
    description: "Relational model, SQL querying, normal forms, transaction processing, indexing, and ACID properties.",
    accreditedBy: "AICTE / Swayam",
  },
  {
    id: "res-pcm-004",
    title: "Introduction to Computer Science and Programming in Python",
    provider: "MIT OpenCourseWare (6.0001)",
    url: "https://ocw.mit.edu/courses/6-0001-introduction-to-computer-science-and-programming-in-python-fall-2016/",
    isFree: true,
    estimatedHours: 35,
    stream: "NON_MEDICAL_PCM",
    targetSkillName: "Python Programming",
    format: "VIDEO_SERIES",
    description: "World-class introduction to algorithmic thinking, computational complexity, object-oriented concepts, and numerical methods.",
    accreditedBy: "Massachusetts Institute of Technology (MIT)",
  },

  // --- COMMERCE & FINANCE ---
  {
    id: "res-com-001",
    title: "ICAI BoS Knowledge Portal: Foundation & Intermediate Financial Accounting",
    provider: "Institute of Chartered Accountants of India (ICAI)",
    url: "https://www.icai.org/post/bos-knowledge-portal",
    isFree: true,
    estimatedHours: 45,
    stream: "COMMERCE",
    targetSkillName: "Financial Accounting & Reporting",
    format: "OFFICIAL_CURRICULUM",
    description: "Official statutory curriculum for Indian Accounting Standards (Ind AS), journal entries, depreciation, and final accounts.",
    accreditedBy: "Statutory Regulatory Body: ICAI",
  },
  {
    id: "res-com-002",
    title: "Corporate Accounting & GST Statutory Compliance",
    provider: "Swayam / CEC (Consortium for Educational Communication)",
    url: "https://swayam.gov.in/explorer?searchText=Corporate+Accounting",
    isFree: true,
    estimatedHours: 28,
    stream: "COMMERCE",
    targetSkillName: "GST & Direct Tax Compliance",
    format: "INTERACTIVE_COURSE",
    description: "Practical guide to Goods and Services Tax law, input tax credit, reverse charge mechanism, and e-way billing.",
    accreditedBy: "UGC / CEC",
  },
  {
    id: "res-com-003",
    title: "Financial Education & Banking Awareness Portal",
    provider: "Reserve Bank of India (RBI)",
    url: "https://www.rbi.org.in/financialeducation/",
    isFree: true,
    estimatedHours: 15,
    stream: "COMMERCE",
    targetSkillName: "Financial Literacy & Banking",
    format: "DOCUMENTATION",
    description: "Official RBI publications on monetary mechanisms, digital payments security, credit appraisal, and risk management.",
    accreditedBy: "Reserve Bank of India",
  },

  // --- MEDICAL & HEALTHCARE (PCB) ---
  {
    id: "res-med-001",
    title: "Human Anatomy and Physiology Foundations",
    provider: "Khan Academy Health & Medicine",
    url: "https://www.khanacademy.org/science/health-and-medicine",
    isFree: true,
    estimatedHours: 35,
    stream: "MEDICAL_PCB",
    targetSkillName: "Human Anatomy & Physiology",
    format: "VIDEO_SERIES",
    description: "Detailed cellular and organ-system anatomy: cardiovascular, nervous, endocrine, respiratory, and renal systems.",
    accreditedBy: "Khan Academy Open Education",
  },
  {
    id: "res-med-002",
    title: "Medical Biochemistry & Clinical Pathology",
    provider: "Swayam / NPTEL (Prof. Swagata Dasgupta, IIT Kharagpur)",
    url: "https://nptel.ac.in/courses/104105076",
    isFree: true,
    estimatedHours: 30,
    stream: "MEDICAL_PCB",
    targetSkillName: "Biochemistry & Pathology",
    format: "VIDEO_SERIES",
    description: "Structure and function of biomolecules, enzymatic kinetics, metabolic disorders, and diagnostic markers.",
    accreditedBy: "NPTEL / IIT Kharagpur",
  },
  {
    id: "res-med-003",
    title: "MedlinePlus Health & Clinical Information Reference",
    provider: "US National Library of Medicine (NLM / NIH)",
    url: "https://medlineplus.gov/",
    isFree: true,
    estimatedHours: 20,
    stream: "MEDICAL_PCB",
    targetSkillName: "Clinical Case Knowledge",
    format: "DOCUMENTATION",
    description: "Peer-reviewed medical reference covering diseases, diagnostic procedures, drug monographs, and clinical protocols.",
    accreditedBy: "National Institutes of Health (NIH)",
  },

  // --- LAW & LEGAL STUDIES ---
  {
    id: "res-law-001",
    title: "Constitutional Law of India & Jurisprudence",
    provider: "e-PG Pathshala (MHRD / UGC / INFLIBNET)",
    url: "https://epgp.inflibnet.ac.in/",
    isFree: true,
    estimatedHours: 35,
    stream: "LAW",
    targetSkillName: "Constitutional Law",
    format: "OFFICIAL_CURRICULUM",
    description: "In-depth modules on fundamental rights, judicial review, separation of powers, and landmark Supreme Court verdicts.",
    accreditedBy: "University Grants Commission (UGC)",
  },
  {
    id: "res-law-002",
    title: "Indian Contract Act & Commercial Arbitration",
    provider: "National Law School of India University / Swayam",
    url: "https://swayam.gov.in/explorer?searchText=Contract+Law",
    isFree: true,
    estimatedHours: 25,
    stream: "LAW",
    targetSkillName: "Contract Law & Drafting",
    format: "VIDEO_SERIES",
    description: "Formation of contracts, void agreements, breach remedies, indemnities, and commercial dispute resolution.",
    accreditedBy: "NLSIU Bengaluru / Swayam",
  },

  // --- CREATIVE ARTS & DESIGN ---
  {
    id: "res-des-001",
    title: "Interaction Design & User Research Fundamentals",
    provider: "Interaction Design Foundation (Open Articles) & NPTEL",
    url: "https://nptel.ac.in/courses/107103083",
    isFree: true,
    estimatedHours: 20,
    stream: "CREATIVE_DESIGN",
    targetSkillName: "User Research & Information Architecture",
    format: "VIDEO_SERIES",
    description: "IIT Guwahati course on user-centered design, persona development, wireframing, and usability heuristics.",
    accreditedBy: "IIT Guwahati / NPTEL",
  },
  {
    id: "res-des-002",
    title: "Figma Community Tutorials & UI Systems Architecture",
    provider: "Figma Learn & Material Design Guidelines",
    url: "https://help.figma.com/hc/en-us/categories/360002051613-Figma-Design",
    isFree: true,
    estimatedHours: 15,
    stream: "CREATIVE_DESIGN",
    targetSkillName: "Figma Design & Prototyping",
    format: "DOCUMENTATION",
    description: "Mastering auto-layout, component variants, design tokens, responsive constraints, and interactive micro-animations.",
    accreditedBy: "Official Figma Education",
  },

  // --- AGRICULTURE & FOOD TECH ---
  {
    id: "res-agr-001",
    title: "ICAR e-Courses: Principles of Agronomy & Soil Science",
    provider: "Indian Council of Agricultural Research (ICAR)",
    url: "https://ecoursesonline.iasri.res.in/",
    isFree: true,
    estimatedHours: 30,
    stream: "AGRICULTURE",
    targetSkillName: "Soil Science & Crop Nutrition",
    format: "OFFICIAL_CURRICULUM",
    description: "Standard undergraduate curriculum for soil chemistry, macro/micro nutrient management, and sustainable tillage practices.",
    accreditedBy: "ICAR / IASRI",
  },
  {
    id: "res-agr-002",
    title: "Precision Farming and Protected Cultivation",
    provider: "Swayam / ICAR-IARI (Pusa Institute)",
    url: "https://swayam.gov.in/explorer?searchText=Precision+Farming",
    isFree: true,
    estimatedHours: 22,
    stream: "AGRICULTURE",
    targetSkillName: "Precision Agriculture & Drip Irrigation",
    format: "INTERACTIVE_COURSE",
    description: "Sensory IoT devices, fertigation automation, greenhouse microclimate control, and yield analytics.",
    accreditedBy: "ICAR-IARI / Swayam",
  },

  // --- VOCATIONAL & TECHNICAL TRADES ---
  {
    id: "res-voc-001",
    title: "Industrial Automation: Sensors, Actuators & PLC Programming",
    provider: "NPTEL / IIT Kharagpur (Prof. S. Mukhopadhyay)",
    url: "https://nptel.ac.in/courses/108105062",
    isFree: true,
    estimatedHours: 32,
    stream: "VOCATIONAL_TRADES",
    targetSkillName: "PLC Programming & Ladder Logic",
    format: "VIDEO_SERIES",
    description: "Industrial sensors, signal conditioning, relay logic, PLC ladder programming, and SCADA monitoring architectures.",
    accreditedBy: "IIT Kharagpur / NPTEL",
  },
  {
    id: "res-voc-002",
    title: "Bharat Skills Digital Learning Portal for ITI & Diplomas",
    provider: "Directorate General of Training (DGT / MSDE, Govt. of India)",
    url: "https://bharatskills.gov.in/",
    isFree: true,
    estimatedHours: 25,
    stream: "VOCATIONAL_TRADES",
    targetSkillName: "Industrial Electrical & Mechatronics",
    format: "OFFICIAL_CURRICULUM",
    description: "Official National Instructional Media Institute (NIMI) study materials, question banks, and trade practical blueprints.",
    accreditedBy: "Ministry of Skill Development & Entrepreneurship (MSDE)",
  },

  // --- MANAGEMENT & BUSINESS ---
  {
    id: "res-mgt-001",
    title: "Operations & Supply Chain Management",
    provider: "NPTEL / IIT Roorkee",
    url: "https://nptel.ac.in/courses/110107074",
    isFree: true,
    estimatedHours: 25,
    stream: "MANAGEMENT",
    targetSkillName: "Supply Chain & Operations",
    format: "VIDEO_SERIES",
    description: "Demand forecasting, inventory optimization (EOQ), logistics scheduling, and lean production paradigms.",
    accreditedBy: "IIT Roorkee / NPTEL",
  },

  // --- ARTS & HUMANITIES ---
  {
    id: "res-art-001",
    title: "Introduction to Indian Society and Social Structure",
    provider: "e-PG Pathshala & Swayam",
    url: "https://epgp.inflibnet.ac.in/",
    isFree: true,
    estimatedHours: 20,
    stream: "ARTS_HUMANITIES",
    targetSkillName: "Sociological Analysis",
    format: "OFFICIAL_CURRICULUM",
    description: "Sociological theory, demographic shifts, rural-urban dynamics, caste, gender, and affirmative policy frameworks in India.",
    accreditedBy: "UGC / CEC",
  },
];

/**
 * Returns curated learning resources matching a stream, target skill, or career slug
 */
export function getCuratedResourcesForCareer(
  stream: EducationalStream,
  targetSkillNames: string[] = []
): CuratedLearningResource[] {
  const normalizedTargets = targetSkillNames.map((s) => s.toLowerCase());

  // Prioritize resources matching skills, then stream
  const matchingSkills = CURATED_LEARNING_RESOURCES.filter(
    (res) =>
      res.stream === stream &&
      normalizedTargets.some(
        (target) =>
          res.targetSkillName.toLowerCase().includes(target) ||
          target.includes(res.targetSkillName.toLowerCase())
      )
  );

  const matchingStream = CURATED_LEARNING_RESOURCES.filter(
    (res) => res.stream === stream && !matchingSkills.some((m) => m.id === res.id)
  );

  const fallback = CURATED_LEARNING_RESOURCES.filter((res) => res.stream !== stream);

  return [...matchingSkills, ...matchingStream, ...fallback].slice(0, 5);
}
