// ==============================================================================
// KAABIL (काबिल) — Screenshot Capture for Step 3.4: Evidence-Backed Skill Passport & Career Readiness
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
  fs.copyFileSync(artifactPath, publicPath);
  console.log(`Saved screenshot: ${filename}`);
}

async function run() {
  console.log("Launching browser for Step 3.4 Skill Passport screenshot capture...");
  const browser = await chromium.launch({
    channel: "msedge",
    headless: true,
    args: ["--no-sandbox", "--disable-gpu"],
  });

  // 1. Desktop Context (1280 x 850)
  console.log("Capturing Desktop Views (1280x850)...");
  const desktopContext = await browser.newContext({
    viewport: { width: 1280, height: 850 },
    deviceScaleFactor: 1.5,
  });
  const desktopPage = await desktopContext.newPage();

  // Navigate to /login and click Student Demo
  await desktopPage.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
  await desktopPage.waitForTimeout(1000);

  const studentDemoBtn = await desktopPage.$('button:has-text("Student Demo")');
  if (studentDemoBtn) {
    console.log("Clicking Student Demo...");
    await studentDemoBtn.click();
    await desktopPage.waitForNavigation({ waitUntil: "networkidle" }).catch(() => {});
  }
  await desktopPage.waitForTimeout(1500);

  // Navigate to /student/passport
  console.log("Navigating to /student/passport...");
  await desktopPage.goto("http://localhost:3000/student/passport", {
    waitUntil: "networkidle",
  });
  
  await desktopPage.waitForSelector('button:has-text("Share Passport")', { timeout: 15000 });
  await desktopPage.waitForTimeout(1200);

  // 1. Desktop: Passport Overview (Top section with summary stats, badges, minor privacy shield)
  console.log("Capturing passport-desktop-overview.png...");
  await saveScreenshot(desktopPage, "passport-desktop-overview.png");

  // 2. Desktop: Click 'Platform Assessed' filter tab to highlight 3-tier distinction
  console.log("Filtering by Platform Assessed...");
  const assessedFilterBtn = await desktopPage.$('button:has-text("Platform Assessed")');
  if (assessedFilterBtn) {
    await assessedFilterBtn.click();
    await desktopPage.waitForTimeout(600);
    console.log("Capturing passport-desktop-skills-tier.png...");
    await saveScreenshot(desktopPage, "passport-desktop-skills-tier.png");
  }

  // Click back to 'All Skills'
  const allSkillsBtn = await desktopPage.$('button:has-text("All Skills")');
  if (allSkillsBtn) {
    await allSkillsBtn.click();
    await desktopPage.waitForTimeout(400);
  }

  // 3. Desktop: Click Share Passport to capture share modal and privacy controls
  console.log("Opening Share Passport modal...");
  const shareBtn = await desktopPage.$('button:has-text("Share Passport")');
  if (shareBtn) {
    await shareBtn.click();
    await desktopPage.waitForTimeout(800);
    console.log("Capturing passport-desktop-share-modal.png...");
    await saveScreenshot(desktopPage, "passport-desktop-share-modal.png");

    // Close modal
    const closeBtn = await desktopPage.$('button:has-text("Close")');
    if (closeBtn) {
      await closeBtn.click();
      await desktopPage.waitForTimeout(500);
    }
  }

  // 4. Navigate to dedicated /student/readiness page
  console.log("Navigating to /student/readiness...");
  await desktopPage.goto("http://localhost:3000/student/readiness", {
    waitUntil: "networkidle",
  });
  await desktopPage.waitForSelector('text=Career Readiness Index', { timeout: 15000 });
  await desktopPage.waitForTimeout(1200);

  console.log("Capturing readiness-desktop-scorecard.png...");
  await saveScreenshot(desktopPage, "readiness-desktop-scorecard.png");

  await desktopContext.close();

  // 2. Mobile Context (390 x 844 - iPhone 12/13/14)
  console.log("Capturing Mobile Views (390x844)...");
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
  });
  const mobilePage = await mobileContext.newPage();

  // Login as Student Demo
  await mobilePage.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
  await mobilePage.waitForTimeout(1000);

  const mobileStudentBtn = await mobilePage.$('button:has-text("Student Demo")');
  if (mobileStudentBtn) {
    await mobileStudentBtn.click();
    await mobilePage.waitForNavigation({ waitUntil: "networkidle" }).catch(() => {});
  }
  await mobilePage.waitForTimeout(1500);

  // Navigate to /student/passport
  console.log("Navigating to mobile /student/passport...");
  await mobilePage.goto("http://localhost:3000/student/passport", {
    waitUntil: "networkidle",
  });
  await mobilePage.waitForSelector('button:has-text("Share Passport")', { timeout: 15000 });
  await mobilePage.waitForTimeout(1200);

  console.log("Capturing passport-mobile-overview.png...");
  await saveScreenshot(mobilePage, "passport-mobile-overview.png");

  // Navigate to mobile /student/readiness
  console.log("Navigating to mobile /student/readiness...");
  await mobilePage.goto("http://localhost:3000/student/readiness", {
    waitUntil: "networkidle",
  });
  await mobilePage.waitForSelector('text=Career Readiness Index', { timeout: 15000 });
  await mobilePage.waitForTimeout(1200);

  console.log("Capturing readiness-mobile-scorecard.png...");
  await saveScreenshot(mobilePage, "readiness-mobile-scorecard.png");

  await mobileContext.close();
  await browser.close();

  console.log("All Step 3.4 screenshots captured successfully!");
}

run().catch((err) => {
  console.error("Error capturing Step 3.4 screenshots:", err);
  process.exit(1);
});
