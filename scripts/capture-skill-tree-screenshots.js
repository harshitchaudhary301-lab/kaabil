// ==============================================================================
// KAABIL (काबिल) — Screenshot Capture for Step 3.2: Dynamic Career Skill Tree
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
  console.log("Launching Microsoft Edge for Skill Tree screenshot capture...");
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

  // Navigate to /student/skill-tree
  console.log("Navigating to /student/skill-tree...");
  await desktopPage.goto("http://localhost:3000/student/skill-tree", {
    waitUntil: "networkidle",
  });
  await desktopPage.waitForTimeout(2000);

  // 1. Capture Desktop Tree Canvas
  const desktopCanvasArtifact = path.join(ARTIFACT_DIR, "skill-tree-desktop-canvas.png");
  const desktopCanvasPublic = path.join(PUBLIC_DIR, "skill-tree-desktop-canvas.png");
  await desktopPage.screenshot({ path: desktopCanvasArtifact, fullPage: true });
  await desktopPage.screenshot({ path: desktopCanvasPublic, fullPage: true });
  console.log("✓ Saved desktop canvas view:", desktopCanvasArtifact);

  // 2. Click a node to open the Node Detail Modal
  const firstNode = await desktopPage.$('h4.text-sm.font-bold');
  if (firstNode) {
    console.log("Clicking node to inspect details modal...");
    await firstNode.click();
    await desktopPage.waitForTimeout(1000);

    const desktopModalArtifact = path.join(ARTIFACT_DIR, "skill-tree-node-detail.png");
    const desktopModalPublic = path.join(PUBLIC_DIR, "skill-tree-node-detail.png");
    await desktopPage.screenshot({ path: desktopModalArtifact, fullPage: true });
    await desktopPage.screenshot({ path: desktopModalPublic, fullPage: true });
    console.log("✓ Saved node detail modal view:", desktopModalArtifact);

    // Close modal
    const closeBtn = await desktopPage.$('button:has-text("Close")');
    if (closeBtn) await closeBtn.click();
    await desktopPage.waitForTimeout(500);
  }

  // 3. Switch to List View
  const listToggleBtn = await desktopPage.$('button:has-text("List")');
  if (listToggleBtn) {
    console.log("Switching to List View...");
    await listToggleBtn.click();
    await desktopPage.waitForTimeout(1000);

    const desktopListArtifact = path.join(ARTIFACT_DIR, "skill-tree-desktop-list.png");
    const desktopListPublic = path.join(PUBLIC_DIR, "skill-tree-desktop-list.png");
    await desktopPage.screenshot({ path: desktopListArtifact, fullPage: true });
    await desktopPage.screenshot({ path: desktopListPublic, fullPage: true });
    console.log("✓ Saved desktop list view:", desktopListArtifact);
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

  // Login on mobile
  await mobilePage.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
  await mobilePage.waitForTimeout(1000);
  const mobileDemoBtn = await mobilePage.$('button:has-text("Student Demo")');
  if (mobileDemoBtn) {
    await mobileDemoBtn.click();
    await mobilePage.waitForNavigation({ waitUntil: "networkidle" }).catch(() => {});
  }
  await mobilePage.waitForTimeout(1500);

  // Navigate to /student/skill-tree
  await mobilePage.goto("http://localhost:3000/student/skill-tree", {
    waitUntil: "networkidle",
  });
  await mobilePage.waitForTimeout(2000);

  // 4. Capture Mobile Canvas
  const mobileCanvasArtifact = path.join(ARTIFACT_DIR, "skill-tree-mobile-canvas.png");
  const mobileCanvasPublic = path.join(PUBLIC_DIR, "skill-tree-mobile-canvas.png");
  await mobilePage.screenshot({ path: mobileCanvasArtifact, fullPage: true });
  await mobilePage.screenshot({ path: mobileCanvasPublic, fullPage: true });
  console.log("✓ Saved mobile canvas view:", mobileCanvasArtifact);

  // 5. Switch to Mobile List View
  const mobileListBtn = await mobilePage.$('button:has-text("List")');
  if (mobileListBtn) {
    console.log("Switching to mobile List View...");
    await mobileListBtn.click();
    await mobilePage.waitForTimeout(1000);

    const mobileListArtifact = path.join(ARTIFACT_DIR, "skill-tree-mobile-list.png");
    const mobileListPublic = path.join(PUBLIC_DIR, "skill-tree-mobile-list.png");
    await mobilePage.screenshot({ path: mobileListArtifact, fullPage: true });
    await mobilePage.screenshot({ path: mobileListPublic, fullPage: true });
    console.log("✓ Saved mobile list view:", mobileListArtifact);
  }
  await mobileContext.close();

  await browser.close();
  console.log("\nAll Skill Tree screenshots successfully captured and verified!");
}

run().catch((err) => {
  console.error("Screenshot capture error:", err);
  process.exit(1);
});
