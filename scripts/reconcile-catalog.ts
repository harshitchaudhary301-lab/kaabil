import { CAREER_PATHS_DATABASE, STREAMS_CONFIG } from "../src/data/careersData";
import { CURATED_LEARNING_RESOURCES } from "../src/data/learningResourcesData";

console.log("=== KAABIL CATALOG RECONCILIATION AUDIT ===");
console.log(`Total Careers in CAREER_PATHS_DATABASE: ${CAREER_PATHS_DATABASE.length}`);

// 1. Stream Mapping & Distribution
const streamCounts: Record<string, number> = {};
const validStreams = new Set(STREAMS_CONFIG.map((s) => s.stream));

let invalidStreamCount = 0;
const invalidStreamCareers: string[] = [];

CAREER_PATHS_DATABASE.forEach((c) => {
  streamCounts[c.stream] = (streamCounts[c.stream] || 0) + 1;
  if (!validStreams.has(c.stream as any)) {
    invalidStreamCount++;
    invalidStreamCareers.push(`${c.slug} (${c.stream})`);
  }
});

console.log("\n--- Distribution across 13 Canonical Streams ---");
STREAMS_CONFIG.forEach((s) => {
  const count = streamCounts[s.stream] || 0;
  console.log(`- ${s.stream} (${s.title}): ${count} careers`);
});
console.log(`Invalid Stream Mappings: ${invalidStreamCount}`, invalidStreamCareers);

// 2. Slugs and Deduplication
const slugMap = new Map<string, string>();
const dupSlugs: string[] = [];
const titleMap = new Map<string, string>();
const dupTitles: string[] = [];

CAREER_PATHS_DATABASE.forEach((c) => {
  if (slugMap.has(c.slug)) {
    dupSlugs.push(`Slug '${c.slug}' in '${c.title}' and '${slugMap.get(c.slug)}'`);
  } else {
    slugMap.set(c.slug, c.title);
  }

  if (titleMap.has(c.title.toLowerCase())) {
    dupTitles.push(`Title '${c.title}' in '${c.slug}' and '${titleMap.get(c.title.toLowerCase())}'`);
  } else {
    titleMap.set(c.title.toLowerCase(), c.slug);
  }
});

console.log(`\nDuplicate Slugs: ${dupSlugs.length}`, dupSlugs);
console.log(`Duplicate Titles: ${dupTitles.length}`, dupTitles);

// 3. Completeness & Missing Fields Check
let missingSalary = 0;
let missingDuration = 0;
let missingExams = 0;
let missingRoadmap = 0;
let missingRegulatory = 0;
let missingSkills = 0;
let totalSkills = 0;
const allSkillNames = new Set<string>();

CAREER_PATHS_DATABASE.forEach((c) => {
  if (!c.avgStartingSalaryInr || !c.avgMidCareerSalaryInr) missingSalary++;
  if (!c.typicalDurationYears) missingDuration++;
  if (!c.keyEntranceExams || c.keyEntranceExams.length === 0) missingExams++;
  if (!c.learningRoadmapSample || c.learningRoadmapSample.length === 0) missingRoadmap++;
  if (!c.regulatoryBody) missingRegulatory++;
  if (!c.skills || c.skills.length === 0) {
    missingSkills++;
  } else {
    c.skills.forEach((s) => {
      totalSkills++;
      allSkillNames.add(s.name.trim());
    });
  }
});

console.log("\n--- Completeness Audit ---");
console.log(`Total Unique Skills in Careers: ${allSkillNames.size}`);
console.log(`Total Skill Requirements across all Careers: ${totalSkills}`);
console.log(`Careers missing Salary figures: ${missingSalary}`);
console.log(`Careers missing Duration: ${missingDuration}`);
console.log(`Careers missing Entrance Exams: ${missingExams}`);
console.log(`Careers missing Roadmap Sample: ${missingRoadmap}`);
console.log(`Careers with unstated/general regulatory body: ${missingRegulatory}`);
console.log(`Careers missing Skills: ${missingSkills}`);

// 4. Learning Resources Check
console.log("\n--- Learning Resources Audit ---");
console.log(`Total Curated Resources: ${CURATED_LEARNING_RESOURCES.length}`);
const resourceStreamCounts: Record<string, number> = {};
CURATED_LEARNING_RESOURCES.forEach((r) => {
  resourceStreamCounts[r.stream] = (resourceStreamCounts[r.stream] || 0) + 1;
});
STREAMS_CONFIG.forEach((s) => {
  const count = resourceStreamCounts[s.stream] || 0;
  console.log(`- ${s.stream}: ${count} resources`);
});

// 5. Sources and Attribution Audit
let missingSources = 0;
let totalSourcesCount = 0;
let missingSalarySource = 0;
let missingLastReviewed = 0;
const sourceNames = new Set<string>();

CAREER_PATHS_DATABASE.forEach((c) => {
  if (!c.sources || c.sources.length === 0) {
    missingSources++;
  } else {
    c.sources.forEach((src) => {
      totalSourcesCount++;
      sourceNames.add(src.name);
    });
  }
  if (!c.salarySource) missingSalarySource++;
  if (!c.lastReviewedDate) missingLastReviewed++;
});

console.log("\n--- Source Attribution Audit ---");
console.log(`Careers missing 'sources' array: ${missingSources}`);
console.log(`Total Source Citations: ${totalSourcesCount}`);
console.log(`Distinct Sources Cited: ${sourceNames.size}`);
console.log(`Careers missing 'salarySource': ${missingSalarySource}`);
console.log(`Careers missing 'lastReviewedDate': ${missingLastReviewed}`);
console.log("Sample Cited Sources:", Array.from(sourceNames).slice(0, 10));

import { devStore } from "../src/lib/dev-store";
console.log("\n--- DevStore Academy Resources Audit ---");
const acadAll = devStore.getAcademyResources();
console.log(`Total DevStore Academy Resources: ${acadAll.length}`);
STREAMS_CONFIG.forEach((s) => {
  const streamRes = devStore.getAcademyResources({ stream: s.stream });
  console.log(`- DevStore ${s.stream}: ${streamRes.length} resources`);
});

import { getCuratedResourcesForCareer } from "../src/data/learningResourcesData";
console.log("\n--- Undecided Student Neutrality Check ---");
const undecRes = getCuratedResourcesForCareer("UNDECIDED");
console.log(`Undecided resources returned: ${undecRes.length}`);
undecRes.forEach((r) => console.log(`  - [${r.stream}] ${r.title} (${r.provider})`));
const hasStemContamination = undecRes.some((r) => r.stream === "NON_MEDICAL_PCM");
console.log(`Has STEM Contamination: ${hasStemContamination} (Expected: false)`);
