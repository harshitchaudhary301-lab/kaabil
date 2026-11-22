import { CareerPathData, StreamOverview } from "@/types";
import { MEDICAL_CAREERS } from "./careers/medical";
import { ENGINEERING_CAREERS } from "./careers/engineering";
import { PURE_SCIENCES_CAREERS } from "./careers/pureSciences";
import { COMMERCE_CAREERS } from "./careers/commerce";
import { MANAGEMENT_CAREERS } from "./careers/management";
import { ARTS_HUMANITIES_CAREERS } from "./careers/arts";
import { LAW_CAREERS } from "./careers/law";
import { DESIGN_CAREERS } from "./careers/design";
import { AGRICULTURE_CAREERS } from "./careers/agriculture";
import { MEDIA_CAREERS } from "./careers/media";
import { EDUCATION_CAREERS } from "./careers/education";
import { HOSPITALITY_SPORTS_CAREERS } from "./careers/hospitalitySports";
import { VOCATIONAL_EMERGING_CAREERS } from "./careers/vocationalEmerging";
import { UNDECIDED_CAREERS } from "./careers/undecided";

export const STREAMS_CONFIG: StreamOverview[] = [
  {
    stream: "MEDICAL_PCB",
    title: "Medical & Healthcare",
    hindiTitle: "चिकित्सा और स्वास्थ्य सेवा",
    badgeColor: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
    },
    iconName: "Stethoscope",
    shortDescription: "Healing, clinical research, patient care, and biotech innovation.",
    topCareers: ["MBBS Doctor", "Dental Surgeon", "Clinical Pharmacist", "Physiotherapist", "Nursing Officer"],
    typicalSubjects: ["Physics", "Chemistry", "Biology", "English"],
  },
  {
    stream: "NON_MEDICAL_PCM",
    title: "STEM & Pure Sciences",
    hindiTitle: "विज्ञान, प्रौद्योगिकी व गणित",
    badgeColor: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
    },
    iconName: "Binary",
    shortDescription: "Engineering, mathematics, space tech, physical sciences, and software systems.",
    topCareers: ["AI Systems Engineer", "Aerospace Engineer", "Renewable Energy Engineer", "Civil Engineer", "Cryptographer"],
    typicalSubjects: ["Physics", "Chemistry", "Mathematics", "Computer Science"],
  },
  {
    stream: "COMMERCE",
    title: "Commerce & Finance",
    hindiTitle: "वाणिज्य और वित्तीय सेवाएं",
    badgeColor: {
      bg: "bg-indigo-50",
      text: "text-indigo-700",
      border: "border-indigo-200",
    },
    iconName: "Coins",
    shortDescription: "Auditing, corporate taxation, investment banking, and actuarial analysis.",
    topCareers: ["Chartered Accountant (CA)", "Investment Banker", "Actuary", "Tax Consultant", "Portfolio Manager"],
    typicalSubjects: ["Accountancy", "Economics", "Business Studies", "Applied Math"],
  },
  {
    stream: "ARTS_HUMANITIES",
    title: "Arts & Humanities",
    hindiTitle: "कला, मानविकी और लोक नीति",
    badgeColor: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
    },
    iconName: "BookOpen",
    shortDescription: "Civil governance, psychology, literature, public policy, and sociology.",
    topCareers: ["Civil Services (IAS/IPS)", "Clinical Psychologist", "Investigative Journalist", "Public Policy Analyst"],
    typicalSubjects: ["History", "Political Science", "Psychology", "Sociology", "English"],
  },
  {
    stream: "LAW",
    title: "Law & Legal Studies",
    hindiTitle: "विधि और न्यायशास्त्र",
    badgeColor: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
    },
    iconName: "Scale",
    shortDescription: "Corporate jurisprudence, litigation, judiciary, cyber law, and civil rights.",
    topCareers: ["Corporate Lawyer", "High Court Litigator", "Civil Judge (Judiciary)", "Cyber Law Counsel"],
    typicalSubjects: ["Legal Studies", "Political Science", "English", "Economics"],
  },
  {
    stream: "MANAGEMENT",
    title: "Management & Business",
    hindiTitle: "प्रबंधन और व्यवसाय प्रशासन",
    badgeColor: {
      bg: "bg-rose-50",
      text: "text-rose-700",
      border: "border-rose-200",
    },
    iconName: "Briefcase",
    shortDescription: "Product strategy, operations leadership, management consulting, and ventures.",
    topCareers: ["Enterprise Product Manager", "Management Consultant", "Supply Chain Director", "Startup Founder"],
    typicalSubjects: ["Business Studies", "Economics", "Mathematics", "Communication"],
  },
  {
    stream: "CREATIVE_DESIGN",
    title: "Creative Arts & Design",
    hindiTitle: "रचनात्मक कला और डिज़ाइन",
    badgeColor: {
      bg: "bg-pink-50",
      text: "text-pink-700",
      border: "border-pink-200",
    },
    iconName: "Palette",
    shortDescription: "UI/UX, industrial design, animation, fashion, film production, and visual arts.",
    topCareers: ["UI/UX Product Designer", "VFX Animation Director", "Industrial Designer", "Fashion Designer"],
    typicalSubjects: ["Fine Arts", "Design Thinking", "Computer Graphics", "English"],
  },
  {
    stream: "AGRICULTURE",
    title: "Agriculture & Food Tech",
    hindiTitle: "कृषि और खाद्य प्रौद्योगिकी",
    badgeColor: {
      bg: "bg-lime-50",
      text: "text-lime-700",
      border: "border-lime-200",
    },
    iconName: "Sprout",
    shortDescription: "Agronomy, hydroponics, food technology, agtech drones, and soil sciences.",
    topCareers: ["Precision Agronomist", "Hydroponic Farm Director", "Dairy Food Technologist", "AgTech Drone Specialist"],
    typicalSubjects: ["Agriculture Science", "Biology", "Chemistry", "Agronomy"],
  },
  {
    stream: "VOCATIONAL_TRADES",
    title: "Vocational & Technical Trades",
    hindiTitle: "व्यावसायिक और तकनीकी ट्रेड",
    badgeColor: {
      bg: "bg-orange-50",
      text: "text-orange-700",
      border: "border-orange-200",
    },
    iconName: "Wrench",
    shortDescription: "Industrial mechatronics, EV powertrain diagnostics, CNC tooling, and smart grids.",
    topCareers: ["Industrial Automation Technician", "EV Powertrain Specialist", "5-Axis CNC Machinist", "Solar Grid Installer"],
    typicalSubjects: ["Workshop Technology", "Applied Mechanics", "Engineering Drawing", "Electrical Circuits"],
  },
  {
    stream: "SPORTS_PHYSICAL_ED",
    title: "Sports & Physical Education",
    hindiTitle: "खेल और शारीरिक शिक्षा",
    badgeColor: {
      bg: "bg-teal-50",
      text: "text-teal-700",
      border: "border-teal-200",
    },
    iconName: "Activity",
    shortDescription: "Sports physiotherapy, athletic performance coaching, kinesiology, and league management.",
    topCareers: ["Sports Physiotherapist", "Athletic Performance Coach", "Sports Data Analyst", "Tournament Director"],
    typicalSubjects: ["Physical Education", "Human Physiology", "Biomechanics", "Sports Psychology"],
  },
  {
    stream: "HOSPITALITY_TOURISM",
    title: "Hospitality & Tourism",
    hindiTitle: "आतिथ्य और पर्यटन प्रबंधन",
    badgeColor: {
      bg: "bg-cyan-50",
      text: "text-cyan-700",
      border: "border-cyan-200",
    },
    iconName: "Coffee",
    shortDescription: "Resort management, molecular gastronomy, airline operations, and luxury ecotourism.",
    topCareers: ["Luxury Hotel General Manager", "Executive Master Chef", "Aviation Cabin Crew Director", "Ecotourism Director"],
    typicalSubjects: ["Hospitality Studies", "Food Production", "Tourism Geography", "Business Communication"],
  },
  {
    stream: "INTERDISCIPLINARY",
    title: "Interdisciplinary & Emerging",
    hindiTitle: "अंतःविषय और उभरते क्षेत्र",
    badgeColor: {
      bg: "bg-violet-50",
      text: "text-violet-700",
      border: "border-violet-200",
    },
    iconName: "Sparkles",
    shortDescription: "Bioinformatics, cognitive science, Indic NLP, ESG auditing, and space awareness.",
    topCareers: ["Bio-fabrication Specialist", "Forensic Evidence Specialist", "GIS Spatial Specialist", "Waste-to-Energy Engineer"],
    typicalSubjects: ["Mathematics", "Biology", "Computer Science", "Environmental Science"],
  },
  {
    stream: "UNDECIDED",
    title: "Undecided & Exploration",
    hindiTitle: "करियर खोज और मार्गदर्शन",
    badgeColor: {
      bg: "bg-slate-100",
      text: "text-slate-700",
      border: "border-slate-300",
    },
    iconName: "Compass",
    shortDescription: "Structured diagnostic mapping, multidisciplinary problem solving, and aptitude exploration.",
    topCareers: ["Multidisciplinary Analyst", "Digital Humanities Specialist", "Sustainable Systems Generalist"],
    typicalSubjects: ["Core Foundational Subjects", "Critical Thinking", "Data Fluency"],
  },
];

/**
 * Master multi-stream career database combining authentic verified pathways across all 13 streams.
 * Total pathways: 127
 */
export const CAREER_PATHS_DATABASE: CareerPathData[] = [
  ...MEDICAL_CAREERS,
  ...ENGINEERING_CAREERS,
  ...PURE_SCIENCES_CAREERS,
  ...COMMERCE_CAREERS,
  ...MANAGEMENT_CAREERS,
  ...ARTS_HUMANITIES_CAREERS,
  ...LAW_CAREERS,
  ...DESIGN_CAREERS,
  ...AGRICULTURE_CAREERS,
  ...MEDIA_CAREERS,
  ...EDUCATION_CAREERS,
  ...HOSPITALITY_SPORTS_CAREERS,
  ...VOCATIONAL_EMERGING_CAREERS,
  ...UNDECIDED_CAREERS,
];

// Helper functions for catalogue exploration
export const ALL_CAREERS = CAREER_PATHS_DATABASE;

export function getAllCareers(): CareerPathData[] {
  return CAREER_PATHS_DATABASE;
}

export function getCareerBySlug(slug: string): CareerPathData | undefined {
  return CAREER_PATHS_DATABASE.find((c) => c.slug === slug);
}

export function getCareersByStream(stream: string): CareerPathData[] {
  if (stream === "ALL") return CAREER_PATHS_DATABASE;
  return CAREER_PATHS_DATABASE.filter((c) => c.stream === stream);
}

export function searchCareers(query: string, stream?: string): CareerPathData[] {
  let results = CAREER_PATHS_DATABASE;
  if (stream && stream !== "ALL") {
    results = results.filter((c) => c.stream === stream);
  }
  if (!query || query.trim() === "") return results;

  const q = query.toLowerCase().trim();
  return results.filter(
    (c) =>
      c.title.toLowerCase().includes(q) ||
      (c.overview && c.overview.toLowerCase().includes(q)) ||
      (c.tagline && c.tagline.toLowerCase().includes(q)) ||
      (c.domainName && c.domainName.toLowerCase().includes(q)) ||
      (c.skills && c.skills.some((s) => s.name.toLowerCase().includes(q))) ||
      (c.relevantSubjects && c.relevantSubjects.some((s) => s.toLowerCase().includes(q))) ||
      (c.keyEntranceExams && c.keyEntranceExams.some((e) => e.toLowerCase().includes(q)))
  );
}
