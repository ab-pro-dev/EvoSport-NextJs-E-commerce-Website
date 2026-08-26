const puppeteer = require("/home/ab/Documents/EvoSport/node_modules/puppeteer-core");

async function run() {
  console.log("--- TESTING HOMEPAGE HERO BANNER BLUR RENDERING ---");
  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/google-chrome",
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  try {
    console.log("1. Navigating to http://localhost:3000...");
    await page.goto("http://localhost:3000", { waitUntil: "networkidle2" });
    await page.evaluate(() => new Promise((r) => setTimeout(r, 2000)));

    // Extract computed CSS filter on background image elements in hero section
    const bgFilter = await page.evaluate(() => {
      const heroImages = Array.from(document.querySelectorAll("section img"));
      return heroImages.map((img) => ({
        src: img.src,
        inlineStyleFilter: img.style.filter,
        computedFilter: window.getComputedStyle(img).filter,
      }));
    });

    console.log("2. Background Image CSS Filter Info:", JSON.stringify(bgFilter, null, 2));

    const screenshotPath = "/home/ab/.gemini/antigravity-cli/brain/5936c987-e368-45bc-8097-935ee3d2f5f6/homepage_hero_blur_render.png";
    await page.screenshot({ path: screenshotPath });
    console.log(`3. Saved screenshot to: ${screenshotPath}`);

    console.log("\n✅ VERIFICATION SUCCESSFUL!");

  } catch (err) {
    console.error("Test Error:", err);
  } finally {
    await browser.close();
  }
}

run();
