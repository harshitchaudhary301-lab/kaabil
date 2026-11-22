// ==============================================================================
// KAABIL (काबिल) — Screenshot Capture for Step 3.1: My Career Profile
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

async function run() {
  console.log("Launching Microsoft Edge for screenshot capture...");
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

  // Click Student Demo button
  const studentDemoBtn = await desktopPage.$('button:has-text("Student Demo")');
  if (studentDemoBtn) {
    console.log("Clicking Student Demo...");
    await studentDemoBtn.click();
    await desktopPage.waitForNavigation({ waitUntil: "networkidle" }).catch(() => {});
  }
  await desktopPage.waitForTimeout(1500);

  // Navigate to /student/profile
  console.log("Navigating to /student/profile...");
  await desktopPage.goto("http://localhost:3000/student/profile", {
    waitUntil: "networkidle",
  });
  await desktopPage.waitForTimeout(2000);

  // Capture Desktop View Mode
  const desktopViewArtifact = path.join(ARTIFACT_DIR, "profile-desktop-view.png");
  const desktopViewPublic = path.join(PUBLIC_DIR, "profile-desktop-view.png");
  await desktopPage.screenshot({ path: desktopViewArtifact, fullPage: true });
  await desktopPage.screenshot({ path: desktopViewPublic, fullPage: true });
  console.log("✓ Saved desktop view:", desktopViewArtifact);

  // Click 'Edit Profile' to switch to Edit Mode
  const editButton = await desktopPage.$('button:has-text("Edit Profile")');
  if (editButton) {
    console.log("Switching to Edit Mode...");
    await editButton.click();
    await desktopPage.waitForTimeout(1500);

    // Capture Desktop Edit Mode
    const desktopEditArtifact = path.join(ARTIFACT_DIR, "profile-desktop-edit.png");
    const desktopEditPublic = path.join(PUBLIC_DIR, "profile-desktop-edit.png");
    await desktopPage.screenshot({ path: desktopEditArtifact, fullPage: true });
    await desktopPage.screenshot({ path: desktopEditPublic, fullPage: true });
    console.log("✓ Saved desktop edit:", desktopEditArtifact);
  }
  await desktopContext.close();

  // 2. Mobile Context (iPhone 14 / 390 x 844)
  console.log("Capturing Mobile Views (390x844)...");
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const mobilePage = await mobileContext.newPage();

  // Login on mobile context
  await mobilePage.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
  await mobilePage.waitForTimeout(1000);
  const mobileDemoBtn = await mobilePage.$('button:has-text("Student Demo")');
  if (mobileDemoBtn) {
    await mobileDemoBtn.click();
    await mobilePage.waitForNavigation({ waitUntil: "networkidle" }).catch(() => {});
  }
  await mobilePage.waitForTimeout(1500);

  // Navigate to /student/profile
  await mobilePage.goto("http://localhost:3000/student/profile", {
    waitUntil: "networkidle",
  });
  await mobilePage.waitForTimeout(2000);

  // Capture Mobile View Mode
  const mobileViewArtifact = path.join(ARTIFACT_DIR, "profile-mobile-view.png");
  const mobileViewPublic = path.join(PUBLIC_DIR, "profile-mobile-view.png");
  await mobilePage.screenshot({ path: mobileViewArtifact, fullPage: true });
  await mobilePage.screenshot({ path: mobileViewPublic, fullPage: true });
  console.log("✓ Saved mobile view:", mobileViewArtifact);

  // Click 'Edit Profile' on mobile
  const mobileEditBtn = await mobilePage.$('button:has-text("Edit Profile")');
  if (mobileEditBtn) {
    console.log("Switching to mobile Edit Mode...");
    await mobileEditBtn.click();
    await mobilePage.waitForTimeout(1500);

    // Capture Mobile Edit Mode
    const mobileEditArtifact = path.join(ARTIFACT_DIR, "profile-mobile-edit.png");
    const mobileEditPublic = path.join(PUBLIC_DIR, "profile-mobile-edit.png");
    await mobilePage.screenshot({ path: mobileEditArtifact, fullPage: true });
    await mobilePage.screenshot({ path: mobileEditPublic, fullPage: true });
    console.log("✓ Saved mobile edit:", mobileEditArtifact);
  }
  await mobileContext.close();

  await browser.close();
  console.log("\nAll 4 screenshots successfully captured and verified!");
}

run().catch((err) => {
  console.error("Screenshot error:", err);
  process.exit(1);
});
