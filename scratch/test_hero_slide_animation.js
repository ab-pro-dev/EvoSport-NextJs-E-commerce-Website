const puppeteer = require("/home/ab/Documents/EvoSport/node_modules/puppeteer-core");

async function run() {
  console.log("--- TESTING HOMEPAGE HERO CAROUSEL SLIDE ANIMATION ---");
  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/google-chrome",
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  try {
    console.log("1. Navigating to http://localhost:3000/...");
    await page.goto("http://localhost:3000/", { waitUntil: "networkidle2" });
    await page.evaluate(() => new Promise((r) => setTimeout(r, 1000)));

    const initialScreenshot = "/home/ab/.gemini/antigravity-cli/brain/5936c987-e368-45bc-8097-935ee3d2f5f6/homepage_hero_slide1.png";
    await page.screenshot({ path: initialScreenshot });
    console.log(`Saved Slide 1 screenshot to: ${initialScreenshot}`);

    // Click Next button
    console.log("2. Clicking Next Arrow button to trigger slide transition...");
    await page.click('button[aria-label="Next banner slide"]');
    
    // Capture mid-transition frame at ~250ms
    await page.evaluate(() => new Promise((r) => setTimeout(r, 250)));
    const midScreenshot = "/home/ab/.gemini/antigravity-cli/brain/5936c987-e368-45bc-8097-935ee3d2f5f6/homepage_hero_slide_mid.png";
    await page.screenshot({ path: midScreenshot });
    console.log(`Saved Mid-slide transition screenshot to: ${midScreenshot}`);

    // Wait for transition to complete
    await page.evaluate(() => new Promise((r) => setTimeout(r, 600)));
    const finalScreenshot = "/home/ab/.gemini/antigravity-cli/brain/5936c987-e368-45bc-8097-935ee3d2f5f6/homepage_hero_slide2.png";
    await page.screenshot({ path: finalScreenshot });
    console.log(`Saved Slide 2 screenshot to: ${finalScreenshot}`);

    console.log("✅ CAROUSEL SLIDE ANIMATION VERIFICATION COMPLETE!");

  } catch (err) {
    console.error("Test Error:", err);
  } finally {
    await browser.close();
  }
}

run();
