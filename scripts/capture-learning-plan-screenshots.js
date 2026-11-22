// ==============================================================================
// KAABIL (काबिल) — Screenshot Capture for Step 3.3: Personalized Learning Plan & Projects Hub
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
  console.log("Launching browser for Step 3.3 screenshot capture...");
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

  // Navigate to /student/learning-plan
  console.log("Navigating to /student/learning-plan...");
  await desktopPage.goto("http://localhost:3000/student/learning-plan", {
    waitUntil: "networkidle",
  });
  
  // Explicitly wait for main page elements to render
  console.log("Waiting for page content to load...");
  await desktopPage.waitForSelector('button:has-text("Customize Schedule")', { timeout: 15000 });
  await desktopPage.waitForTimeout(1000);

  // 1. Desktop: Learning Sprints & Daily Tasks tab
  console.log("Capturing desktop sprints tab...");
  await saveScreenshot(desktopPage, "learning-plan-desktop-sprints.png");

  // 2. Desktop: Customize Schedule Modal
  console.log("Opening Customize Schedule modal...");
  const customizeBtn = await desktopPage.$('button:has-text("Customize Schedule")');
  if (customizeBtn) {
    await customizeBtn.click();
    await desktopPage.waitForSelector('h3:has-text("Customize Learning Routine")', { timeout: 5000 });
    await desktopPage.waitForTimeout(600);
    await saveScreenshot(desktopPage, "learning-plan-preferences-modal.png");
    // Close modal
    const cancelBtn = await desktopPage.$('button:has-text("Cancel")');
    if (cancelBtn) await cancelBtn.click();
    await desktopPage.waitForTimeout(600);
  }

  // 3. Desktop: Switch to Projects Hub tab
  console.log("Switching to Multi-Stream Projects Hub tab...");
  const projectsTab = await desktopPage.$('button:has-text("Multi-Stream Projects Hub")');
  if (projectsTab) {
    await projectsTab.click();
    await desktopPage.waitForSelector('h3:has-text("Explore Stream Career Projects")', { timeout: 5000 });
    await desktopPage.waitForTimeout(800);
    await saveScreenshot(desktopPage, "learning-plan-desktop-projects.png");

    // 4. Desktop: Open Project Detail Modal
    console.log("Opening project detail drawer...");
    const projectCard = await desktopPage.$('h3:has-text("Responsive Portfolio")');
    if (projectCard) {
      await projectCard.click();
      await desktopPage.waitForSelector('h4:has-text("Project Objective")', { timeout: 5000 });
      await desktopPage.waitForTimeout(600);
      await saveScreenshot(desktopPage, "learning-plan-project-detail.png");
      // Close modal
      const closeBtn = await desktopPage.$('button:has-text("Close")');
      if (closeBtn) await closeBtn.click();
      await desktopPage.waitForTimeout(600);
    }
  }

  await desktopContext.close();

  // 2. Mobile Context (390 x 844 iPhone 14)
  console.log("Capturing Mobile Views (390x844)...");
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
  });
  const mobilePage = await mobileContext.newPage();

  // Login again for mobile session
  await mobilePage.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
  const mobileDemoBtn = await mobilePage.$('button:has-text("Student Demo")');
  if (mobileDemoBtn) {
    await mobileDemoBtn.click();
    await mobilePage.waitForNavigation({ waitUntil: "networkidle" }).catch(() => {});
  }
  await mobilePage.waitForTimeout(1500);

  // Navigate to /student/learning-plan on mobile
  await mobilePage.goto("http://localhost:3000/student/learning-plan", {
    waitUntil: "networkidle",
  });
  await mobilePage.waitForSelector('button:has-text("Customize Schedule")', { timeout: 15000 });
  await mobilePage.waitForTimeout(1000);

  // 5. Mobile Sprints view
  console.log("Capturing mobile sprints view...");
  await saveScreenshot(mobilePage, "learning-plan-mobile-sprints.png");

  // 6. Mobile Projects view
  console.log("Switching to projects tab on mobile...");
  const mobileProjectsTab = await mobilePage.$('button:has-text("Multi-Stream Projects Hub")');
  if (mobileProjectsTab) {
    await mobileProjectsTab.click();
    await mobilePage.waitForSelector('h3:has-text("Explore Stream Career Projects")', { timeout: 5000 });
    await mobilePage.waitForTimeout(800);
    await saveScreenshot(mobilePage, "learning-plan-mobile-projects.png");
  }

  await mobileContext.close();
  await browser.close();
  console.log("Step 3.3 Screenshot capture complete!");
}

run().catch((err) => {
  console.error("Error capturing screenshots:", err);
  process.exit(1);
});
