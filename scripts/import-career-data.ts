// ==============================================================================
// KAABIL (काबिल) — CLI Career & Learning Resources Data Import Runner
// Usage:
//   npx tsx scripts/import-career-data.ts [--dry-run] [--validate-only] [--stream=<STREAM>]
// ==============================================================================

import { CareerDataImportPipeline } from "../src/lib/data-pipeline/career-import-pipeline";
import { EducationalStream } from "../src/types";

async function main() {
  const args = process.argv.slice(2);
  const isDryRun = !args.includes("--live-write");
  const isValidateOnly = args.includes("--validate-only");
  const streamArg = args.find((a) => a.startsWith("--stream="));
  const targetStream = streamArg
    ? (streamArg.split("=")[1] as EducationalStream)
    : "ALL";

  console.log("=========================================================");
  console.log("  KAABIL (काबिल) Career Data & Resource Import Pipeline  ");
  console.log("=========================================================");
  console.log(`Execution Mode   : ${isDryRun ? "DRY-RUN (Safe Simulation)" : "LIVE WRITE"}`);
  console.log(`Target Stream    : ${targetStream}`);
  console.log(`Timestamp        : ${new Date().toISOString()}`);
  console.log("---------------------------------------------------------");

  const report = await CareerDataImportPipeline.run({
    dryRun: isDryRun,
    targetStream,
    validateOnly: isValidateOnly,
  });

  console.log(`Validation Status : ${report.success ? "PASSED (0 Errors)" : "FAILED (" + report.errors.length + " Errors)"}`);
  console.log(`Careers Evaluated : ${report.totalCareersEvaluated} (Valid: ${report.validCareersCount}, Invalid: ${report.invalidCareersCount})`);
  console.log(`Unique Skills     : ${report.totalUniqueSkills}`);
  console.log(`Resources Checked : ${report.totalResourcesEvaluated} (Valid: ${report.validResourcesCount}, Invalid: ${report.invalidResourcesCount})`);

  console.log("\n--- Stream Coverage Breakdown ---");
  for (const [st, stats] of Object.entries(report.streamBreakdown)) {
    const statusIcon = stats.isComplete ? "[OK]" : "[WARN]";
    console.log(
      `${statusIcon} ${st.padEnd(22)} : ${stats.careersCount.toString().padStart(2)} careers, ${stats.skillsCount.toString().padStart(3)} skills, ${stats.resourcesCount.toString().padStart(2)} resources`
    );
  }

  if (report.errors.length > 0) {
    console.log("\n--- Validation Errors ---");
    report.errors.slice(0, 10).forEach((err, i) => {
      console.log(`  ${i + 1}. [${err.entityType}] ${err.identifier} -> ${err.field ? err.field + ": " : ""}${err.message}`);
    });
    if (report.errors.length > 10) {
      console.log(`  ... and ${report.errors.length - 10} more errors.`);
    }
  }

  console.log("---------------------------------------------------------");
  console.log(`Existing Student Progress Preserved : ${report.summary.existingStudentProgressPreserved}`);
  console.log("=========================================================\n");

  if (!report.success) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Pipeline execution failed unexpectedly:", err);
  process.exit(1);
});
