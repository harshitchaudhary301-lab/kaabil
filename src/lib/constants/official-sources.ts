// ==============================================================================
// KAABIL (काबिल) — Official Statutory & Educational Authority Source Directory
// Curated directory of official regulatory councils, statutory examination bodies,
// and government authorities in India for verified source linking.
// ==============================================================================

export interface OfficialSourceInfo {
  name: string;
  shortName: string;
  officialUrl: string;
  category: "REGULATORY_COUNCIL" | "EXAM_AUTHORITY" | "GOVERNMENT_BODY" | "INDUSTRY_BODY";
  description: string;
}

export const OFFICIAL_SOURCES: Record<string, OfficialSourceInfo> = {
  NMC: {
    name: "National Medical Commission",
    shortName: "NMC",
    officialUrl: "https://www.nmc.org.in",
    category: "REGULATORY_COUNCIL",
    description: "Statutory regulatory body for medical education and medical professionals in India.",
  },
  AICTE: {
    name: "All India Council for Technical Education",
    shortName: "AICTE",
    officialUrl: "https://www.aicte-india.org",
    category: "REGULATORY_COUNCIL",
    description: "Statutory council for technical, engineering, and management education in India.",
  },
  BCI: {
    name: "Bar Council of India",
    shortName: "BCI",
    officialUrl: "http://www.barcouncilofindia.org",
    category: "REGULATORY_COUNCIL",
    description: "Statutory body regulating legal practice and legal education in India.",
  },
  ICAI: {
    name: "Institute of Chartered Accountants of India",
    shortName: "ICAI",
    officialUrl: "https://www.icai.org",
    category: "REGULATORY_COUNCIL",
    description: "Statutory body established by Parliament under the Chartered Accountants Act, 1949.",
  },
  ICSI: {
    name: "Institute of Company Secretaries of India",
    shortName: "ICSI",
    officialUrl: "https://www.icsi.edu",
    category: "REGULATORY_COUNCIL",
    description: "Premier national professional body under an Act of Parliament.",
  },
  ICMAI: {
    name: "Institute of Cost Accountants of India",
    shortName: "ICMAI",
    officialUrl: "https://icmai.in",
    category: "REGULATORY_COUNCIL",
    description: "Statutory body regulating the profession of Cost and Management Accountancy.",
  },
  UGC: {
    name: "University Grants Commission",
    shortName: "UGC",
    officialUrl: "https://www.ugc.gov.in",
    category: "REGULATORY_COUNCIL",
    description: "Statutory organization for the coordination, determination and maintenance of university education standards.",
  },
  UPSC: {
    name: "Union Public Service Commission",
    shortName: "UPSC",
    officialUrl: "https://upsc.gov.in",
    category: "EXAM_AUTHORITY",
    description: "Constitutional body conducting Civil Services, Engineering Services, and National Defence examinations.",
  },
  NTA: {
    name: "National Testing Agency",
    shortName: "NTA",
    officialUrl: "https://nta.ac.in",
    category: "EXAM_AUTHORITY",
    description: "Premier testing agency conducting NEET-UG, JEE Main, CUET-UG, and UGC-NET.",
  },
  NEET: {
    name: "NEET-UG Official Portal (NTA)",
    shortName: "NEET-UG",
    officialUrl: "https://neet.nta.nic.in",
    category: "EXAM_AUTHORITY",
    description: "Official portal for National Eligibility cum Entrance Test (UG).",
  },
  JEE: {
    name: "JEE (Main) Official Portal (NTA)",
    shortName: "JEE Main",
    officialUrl: "https://jeemain.nta.nic.in",
    category: "EXAM_AUTHORITY",
    description: "Official portal for Joint Entrance Examination (Main).",
  },
  CLAT: {
    name: "Consortium of National Law Universities",
    shortName: "CLAT",
    officialUrl: "https://consortiumofnlus.ac.in",
    category: "EXAM_AUTHORITY",
    description: "Official authority conducting the Common Law Admission Test.",
  },
  DGCA: {
    name: "Directorate General of Civil Aviation",
    shortName: "DGCA",
    officialUrl: "https://dgca.gov.in",
    category: "REGULATORY_COUNCIL",
    description: "Statutory body overseeing civil aviation, flight crew licenses, and safety regulation in India.",
  },
  ICAR: {
    name: "Indian Council of Agricultural Research",
    shortName: "ICAR",
    officialUrl: "https://icar.org.in",
    category: "REGULATORY_COUNCIL",
    description: "Autonomous organization coordinating agricultural research and education in India.",
  },
  DCI: {
    name: "Dental Council of India",
    shortName: "DCI",
    officialUrl: "https://dciindia.gov.in",
    category: "REGULATORY_COUNCIL",
    description: "Statutory body regulating dental education and the dental profession in India.",
  },
  PCI: {
    name: "Pharmacy Council of India",
    shortName: "PCI",
    officialUrl: "https://www.pci.nic.in",
    category: "REGULATORY_COUNCIL",
    description: "Statutory body governing the regulation of pharmacy education and profession in India.",
  },
  INC: {
    name: "Indian Nursing Council",
    shortName: "INC",
    officialUrl: "https://www.indiannursingcouncil.org",
    category: "REGULATORY_COUNCIL",
    description: "National regulatory body for nurses and nurse education in India.",
  },
  COA: {
    name: "Council of Architecture",
    shortName: "COA",
    officialUrl: "https://www.coa.gov.in",
    category: "REGULATORY_COUNCIL",
    description: "Statutory authority regulating education and practice of architecture under Architects Act, 1972.",
  },
  NID: {
    name: "National Institute of Design",
    shortName: "NID",
    officialUrl: "https://www.nid.edu",
    category: "EXAM_AUTHORITY",
    description: "Institution of National Importance conducting NID DAT admissions.",
  },
  NSDC: {
    name: "National Skill Development Corporation",
    shortName: "NSDC",
    officialUrl: "https://nsdcindia.org",
    category: "GOVERNMENT_BODY",
    description: "Public-private partnership promoting skill development and vocational trades in India.",
  },
  PAY_COMMISSION: {
    name: "7th Central Pay Commission (Department of Expenditure)",
    shortName: "7th CPC",
    officialUrl: "https://doe.gov.in/seventh-cpc-reports",
    category: "GOVERNMENT_BODY",
    description: "Official government salary structures, pay matrices, and allowances.",
  },
  NASSCOM: {
    name: "National Association of Software and Service Companies",
    shortName: "NASSCOM",
    officialUrl: "https://nasscom.in",
    category: "INDUSTRY_BODY",
    description: "Non-profit industry association and benchmark voice for India's tech & IT-BPM sector.",
  },
  RBI: {
    name: "Reserve Bank of India",
    shortName: "RBI",
    officialUrl: "https://www.rbi.org.in",
    category: "REGULATORY_COUNCIL",
    description: "India's central bank and regulatory body responsible for financial system regulation.",
  },
  SEBI: {
    name: "Securities and Exchange Board of India",
    shortName: "SEBI",
    officialUrl: "https://www.sebi.gov.in",
    category: "REGULATORY_COUNCIL",
    description: "Regulatory body for securities and commodity markets in India.",
  },
  NEP: {
    name: "National Education Policy (Ministry of Education)",
    shortName: "NEP 2020",
    officialUrl: "https://www.education.gov.in/nep-2020",
    category: "GOVERNMENT_BODY",
    description: "Comprehensive educational framework by the Ministry of Education, Government of India.",
  },
  DPDP: {
    name: "Digital Personal Data Protection Act 2023",
    shortName: "DPDP Act 2023",
    officialUrl: "https://www.meity.gov.in/content/digital-personal-data-protection-act-2023",
    category: "GOVERNMENT_BODY",
    description: "Statutory framework governing personal data processing, privacy, and minor child safety.",
  },
};

/**
 * Resolves an official portal URL from a source citation text.
 * Performs fuzzy keyword matching against known Indian authorities.
 */
export function resolveOfficialSourceUrl(sourceText: string): { url: string; label: string } | null {
  if (!sourceText) return null;
  const s = sourceText.toUpperCase();

  if (s.includes("NMC") || s.includes("NATIONAL MEDICAL COMMISSION") || s.includes("MCI")) {
    return { url: OFFICIAL_SOURCES.NMC.officialUrl, label: "National Medical Commission (NMC)" };
  }
  if (s.includes("AICTE") || s.includes("TECHNICAL EDUCATION")) {
    return { url: OFFICIAL_SOURCES.AICTE.officialUrl, label: "All India Council for Technical Education (AICTE)" };
  }
  if (s.includes("BCI") || s.includes("BAR COUNCIL")) {
    return { url: OFFICIAL_SOURCES.BCI.officialUrl, label: "Bar Council of India (BCI)" };
  }
  if (s.includes("ICAI") || s.includes("CHARTERED ACCOUNTANT")) {
    return { url: OFFICIAL_SOURCES.ICAI.officialUrl, label: "Institute of Chartered Accountants of India (ICAI)" };
  }
  if (s.includes("ICSI") || s.includes("COMPANY SECRETAR")) {
    return { url: OFFICIAL_SOURCES.ICSI.officialUrl, label: "Institute of Company Secretaries of India (ICSI)" };
  }
  if (s.includes("ICMAI") || s.includes("COST ACCOUNTANT")) {
    return { url: OFFICIAL_SOURCES.ICMAI.officialUrl, label: "Institute of Cost Accountants of India (ICMAI)" };
  }
  if (s.includes("UGC") || s.includes("UNIVERSITY GRANTS")) {
    return { url: OFFICIAL_SOURCES.UGC.officialUrl, label: "University Grants Commission (UGC)" };
  }
  if (s.includes("UPSC") || s.includes("UNION PUBLIC SERVICE") || s.includes("CIVIL SERVICES")) {
    return { url: OFFICIAL_SOURCES.UPSC.officialUrl, label: "Union Public Service Commission (UPSC)" };
  }
  if (s.includes("NEET")) {
    return { url: OFFICIAL_SOURCES.NEET.officialUrl, label: "NEET (UG) Portal (NTA)" };
  }
  if (s.includes("JEE")) {
    return { url: OFFICIAL_SOURCES.JEE.officialUrl, label: "JEE Main Portal (NTA)" };
  }
  if (
    s.includes("NTA") ||
    s.includes("NATIONAL TESTING AGENCY") ||
    s.includes("CENTRAL TESTING AGENCY") ||
    s.includes("EXAMINATION AUTHORITY") ||
    s.includes("EXAM INFORMATION")
  ) {
    return { url: OFFICIAL_SOURCES.NTA.officialUrl, label: "National Testing Agency (NTA)" };
  }
  if (s.includes("CLAT") || s.includes("NATIONAL LAW")) {
    return { url: OFFICIAL_SOURCES.CLAT.officialUrl, label: "Consortium of NLUs (CLAT)" };
  }
  if (s.includes("DGCA") || s.includes("CIVIL AVIATION") || s.includes("PILOT")) {
    return { url: OFFICIAL_SOURCES.DGCA.officialUrl, label: "Directorate General of Civil Aviation (DGCA)" };
  }
  if (s.includes("ICAR") || s.includes("AGRICULTURAL RESEARCH")) {
    return { url: OFFICIAL_SOURCES.ICAR.officialUrl, label: "Indian Council of Agricultural Research (ICAR)" };
  }
  if (s.includes("DCI") || s.includes("DENTAL COUNCIL")) {
    return { url: OFFICIAL_SOURCES.DCI.officialUrl, label: "Dental Council of India (DCI)" };
  }
  if (s.includes("PCI") || s.includes("PHARMACY COUNCIL")) {
    return { url: OFFICIAL_SOURCES.PCI.officialUrl, label: "Pharmacy Council of India (PCI)" };
  }
  if (s.includes("INC") || s.includes("NURSING COUNCIL")) {
    return { url: OFFICIAL_SOURCES.INC.officialUrl, label: "Indian Nursing Council (INC)" };
  }
  if (s.includes("COA") || s.includes("COUNCIL OF ARCHITECTURE")) {
    return { url: OFFICIAL_SOURCES.COA.officialUrl, label: "Council of Architecture (COA)" };
  }
  if (s.includes("NID") || s.includes("DESIGN")) {
    return { url: OFFICIAL_SOURCES.NID.officialUrl, label: "National Institute of Design (NID)" };
  }
  if (
    s.includes("NSDC") ||
    s.includes("SKILL DEVELOPMENT") ||
    s.includes("ITI") ||
    s.includes("COMPETENCY") ||
    s.includes("PROJECTS FRAMEWORK") ||
    s.includes("SKILL STANDARDS")
  ) {
    return { url: OFFICIAL_SOURCES.NSDC.officialUrl, label: "National Skill Development Corporation (NSDC)" };
  }
  if (
    s.includes("PAY COMMISSION") ||
    s.includes("MOHFW") ||
    s.includes("7TH PAY") ||
    s.includes("CENTRAL PAY") ||
    s.includes("PAY GAZETTE") ||
    s.includes("PAY STANDARDS") ||
    s.includes("GOVERNMENT PAY")
  ) {
    return { url: OFFICIAL_SOURCES.PAY_COMMISSION.officialUrl, label: "7th Central Pay Commission Gazette" };
  }
  if (s.includes("NASSCOM")) {
    return { url: OFFICIAL_SOURCES.NASSCOM.officialUrl, label: "NASSCOM Industry Benchmarks" };
  }
  if (s.includes("RBI") || s.includes("RESERVE BANK")) {
    return { url: OFFICIAL_SOURCES.RBI.officialUrl, label: "Reserve Bank of India (RBI)" };
  }
  if (s.includes("SEBI") || s.includes("SECURITIES AND EXCHANGE")) {
    return { url: OFFICIAL_SOURCES.SEBI.officialUrl, label: "Securities and Exchange Board of India (SEBI)" };
  }
  if (s.includes("NEP") || s.includes("EDUCATION POLICY")) {
    return { url: OFFICIAL_SOURCES.NEP.officialUrl, label: "National Education Policy (NEP 2020)" };
  }
  if (s.includes("DPDP") || s.includes("DATA PROTECTION")) {
    return { url: OFFICIAL_SOURCES.DPDP.officialUrl, label: "DPDP Act 2023 Gazette" };
  }
  if (
    s.includes("STATUTORY") ||
    s.includes("REGULATORY") ||
    s.includes("TAXONOMY") ||
    s.includes("MINISTRY OF EDUCATION") ||
    s.includes("EDUCATION FRAMEWORK")
  ) {
    return { url: OFFICIAL_SOURCES.AICTE.officialUrl, label: "AICTE / Statutory Regulatory Council" };
  }

  return null;
}
