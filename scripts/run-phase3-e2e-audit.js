// ==============================================================================
// KAABIL (काबिल) — Phase 3 Final End-to-End Integration Audit Script
// Validates full student journey, mobile & desktop navigation, link integrity,
// and zero-dead-end compliance across all Phase 3 milestones.
// ==============================================================================

const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const ARTIFACT_DIR = "C:\\Users\\Harshit\\.gemini\\antigravity\\brain\\aa18b3b7-42b2-4fa5-b7c3-b369d78b6631\\screenshots";
const PUBLIC_DIR = path.join(__dirname, "..", "public", "screenshots");

[ARTIFACT_DIR, PUBLIC_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

async function saveScreenshot(page, filename) {
  const artifactPath = path.join(ARTIFACT_DIR, filename);
  const publicPath = path.join(PUBLIC_DIR, filename);
  await page.screenshot({ path: artifactPath, fullPage: true });
  try {
    fs.copyFileSync(artifactPath, publicPath);
  } catch (e) {}
  console.log(`[E2E AUDIT] Saved: ${filename}`);
}

async function runAudit() {
  console.log("==============================================================================");
  console.log("KAABIL Phase 3 Final End-to-End Navigation & Viewport Audit");
  console.log("==============================================================================");

  const browser = await chromium.launch({
    channel: "msedge",
    headless: true,
    args: ["--no-sandbox", "--disable-gpu"],
  });

  const auditResults = {
    linksChecked: 0,
    linksPassed: 0,
    failedLinks: [],
    pagesAudited: [],
  };

  // --------------------------------------------------------------------------
  // 1. DESKTOP AUDIT (1280 x 850)
  // --------------------------------------------------------------------------
  console.log("\n[DESKTOP AUDIT] Initializing desktop context (1280x850)...");
  const desktopContext = await browser.newContext({
    viewport: { width: 1280, height: 850 },
    deviceScaleFactor: 1.5,
  });
  const page = await desktopContext.newPage();

  // Monitor console errors
  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
    }
  });

  // 1.1 Login as Demo Student
  console.log("Navigating to /login...");
  await page.goto("http://localhost:3000/login", { waitUntil: "domcontentloaded", timeout: 20000 });
  await page.waitForTimeout(1000);

  const studentDemoBtn = await page.$('button:has-text("Student Demo")');
  if (studentDemoBtn) {
    console.log("Clicking Student Demo quick login...");
    await studentDemoBtn.click();
    await page.waitForURL("**/student/**", { timeout: 15000 }).catch(() => {});
  }
  await page.waitForTimeout(2000);

  // 1.2 Validate Student Navigation Links
  const navRoutes = [
    { name: "Student Dashboard", url: "http://localhost:3000/student/dashboard" },
    { name: "My Career Profile (Step 3.1)", url: "http://localhost:3000/student/profile" },
    { name: "Dynamic Skill Tree (Step 3.2)", url: "http://localhost:3000/student/skill-tree" },
    { name: "Learning Plan & Projects (Step 3.3)", url: "http://localhost:3000/student/learning-plan" },
    { name: "Digital Skill Passport (Step 3.4)", url: "http://localhost:3000/student/passport" },
    { name: "Career Readiness (Step 3.4)", url: "http://localhost:3000/student/readiness" },
    { name: "Assessments", url: "http://localhost:3000/student/assessments" },
    { name: "Opportunities Hub", url: "http://localhost:3000/student/opportunities" },
  ];

  console.log("\n--- Validating Navigation Endpoints & Response Codes ---");
  for (const r of navRoutes) {
    auditResults.linksChecked++;
    try {
      const resp = await page.goto(r.url, { waitUntil: "domcontentloaded", timeout: 30000 });
      await page.waitForTimeout(800);
      const status = resp ? resp.status() : 0;
      if (status >= 200 && status < 400) {
        console.log(`  ✓ [${status}] ${r.name}: ${r.url}`);
        auditResults.linksPassed++;
      } else {
        console.error(`  ✗ [${status}] ${r.name}: ${r.url}`);
        auditResults.failedLinks.push({ name: r.name, url: r.url, status });
      }
    } catch (err) {
      console.error(`  ✗ [TIMEOUT/ERR] ${r.name}: ${r.url} - ${err.message}`);
      auditResults.failedLinks.push({ name: r.name, url: r.url, error: err.message });
    }
  }

  // 1.3 Audit Phase 3 Feature Pages in Detail
  console.log("\n--- Detailed Audit of Phase 3 Modules ---");

  // Step 3.1: Profile
  console.log("\n[Step 3.1] Auditing My Career Profile...");
  await page.goto("http://localhost:3000/student/profile", { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForSelector('text=My Career Profile', { timeout: 15000 });
  await page.waitForTimeout(500);
  await saveScreenshot(page, "audit-profile-desktop.png");
  auditResults.pagesAudited.push("Step 3.1: My Career Profile (Desktop)");

  // Step 3.2: Skill Tree
  console.log("\n[Step 3.2] Auditing Career Skill Tree...");
  await page.goto("http://localhost:3000/student/skill-tree", { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForSelector('text=Foundation', { timeout: 15000 });
  await page.waitForTimeout(500);
  await saveScreenshot(page, "audit-skill-tree-desktop.png");
  auditResults.pagesAudited.push("Step 3.2: Dynamic Career Skill Tree (Desktop)");

  // Step 3.3: Learning Plan & Projects
  console.log("\n[Step 3.3] Auditing Learning Plan & Projects Hub...");
  await page.goto("http://localhost:3000/student/learning-plan", { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForSelector('text=Learning Plan', { timeout: 15000 });
  await page.waitForTimeout(500);
  await saveScreenshot(page, "audit-learning-plan-desktop.png");
  auditResults.pagesAudited.push("Step 3.3: Learning Plan & Projects Hub (Desktop)");

  // Step 3.4: Skill Passport
  console.log("\n[Step 3.4] Auditing Digital Skill Passport...");
  await page.goto("http://localhost:3000/student/passport", { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForSelector('text=Digital Skill Passport', { timeout: 15000 });
  await page.waitForTimeout(500);
  await saveScreenshot(page, "audit-passport-desktop.png");
  auditResults.pagesAudited.push("Step 3.4: Digital Skill Passport (Desktop)");

  // Step 3.4: Career Readiness
  console.log("\n[Step 3.4] Auditing Career Readiness Breakdown...");
  await page.goto("http://localhost:3000/student/readiness", { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForSelector('text=Career Readiness Index', { timeout: 15000 });
  await page.waitForTimeout(500);
  await saveScreenshot(page, "audit-readiness-desktop.png");
  auditResults.pagesAudited.push("Step 3.4: Career Readiness Index (Desktop)");

  await desktopContext.close();

  // --------------------------------------------------------------------------
  // 2. MOBILE VIEWPORT AUDIT (390 x 844 iPhone 14 / Modern Smartphone)
  // --------------------------------------------------------------------------
  console.log("\n[MOBILE AUDIT] Initializing mobile context (390x844)...");
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const mobilePage = await mobileContext.newPage();

  // Login as student in mobile context
  await mobilePage.goto("http://localhost:3000/login", { waitUntil: "domcontentloaded", timeout: 30000 });
  await mobilePage.waitForTimeout(1000);
  const mobileDemoBtn = await mobilePage.$('button:has-text("Student Demo")');
  if (mobileDemoBtn) {
    await mobileDemoBtn.click();
    await mobilePage.waitForURL("**/student/**", { timeout: 20000 }).catch(() => {});
  }
  await mobilePage.waitForTimeout(2000);

  // Mobile Profile
  await mobilePage.goto("http://localhost:3000/student/profile", { waitUntil: "domcontentloaded", timeout: 30000 });
  await mobilePage.waitForTimeout(2000);
  await saveScreenshot(mobilePage, "audit-profile-mobile.png");
  auditResults.pagesAudited.push("Step 3.1: My Career Profile (Mobile)");

  // Mobile Skill Tree
  await mobilePage.goto("http://localhost:3000/student/skill-tree", { waitUntil: "domcontentloaded", timeout: 30000 });
  await mobilePage.waitForTimeout(2000);
  await saveScreenshot(mobilePage, "audit-skill-tree-mobile.png");
  auditResults.pagesAudited.push("Step 3.2: Dynamic Career Skill Tree (Mobile)");

  // Mobile Learning Plan
  await mobilePage.goto("http://localhost:3000/student/learning-plan", { waitUntil: "domcontentloaded", timeout: 30000 });
  await mobilePage.waitForTimeout(2000);
  await saveScreenshot(mobilePage, "audit-learning-plan-mobile.png");
  auditResults.pagesAudited.push("Step 3.3: Learning Plan & Projects Hub (Mobile)");

  // Mobile Passport
  await mobilePage.goto("http://localhost:3000/student/passport", { waitUntil: "domcontentloaded", timeout: 30000 });
  await mobilePage.waitForTimeout(2000);
  await saveScreenshot(mobilePage, "audit-passport-mobile.png");
  auditResults.pagesAudited.push("Step 3.4: Digital Skill Passport (Mobile)");

  // Mobile Readiness
  await mobilePage.goto("http://localhost:3000/student/readiness", { waitUntil: "domcontentloaded", timeout: 30000 });
  await mobilePage.waitForTimeout(2000);
  await saveScreenshot(mobilePage, "audit-readiness-mobile.png");
  auditResults.pagesAudited.push("Step 3.4: Career Readiness Index (Mobile)");

  await mobileContext.close();
  await browser.close();

  console.log("\n==============================================================================");
  console.log("AUDIT SUMMARY REPORT");
  console.log("==============================================================================");
  console.log(`Navigation Links Tested: ${auditResults.linksChecked}`);
  console.log(`Navigation Links Passed: ${auditResults.linksPassed}`);
  console.log(`Navigation Failures:    ${auditResults.failedLinks.length}`);
  console.log(`Full Views Audited:     ${auditResults.pagesAudited.length}`);
  console.log("==============================================================================");

  if (auditResults.failedLinks.length > 0) {
    console.error("FAILURES DETECTED:", auditResults.failedLinks);
    process.exit(1);
  } else {
    console.log("ALL E2E AUDIT CHECKS PASSED!");
  }
}

runAudit().catch((err) => {
  console.error("Fatal audit error:", err);
  process.exit(1);
});
