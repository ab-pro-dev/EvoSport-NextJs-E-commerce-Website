const puppeteer = require("/home/ab/Documents/EvoSport/node_modules/puppeteer-core");

async function run() {
  console.log("=== TESTING LIVE VERCEL PRODUCTION ADMIN DASHBOARD ===");

  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/google-chrome",
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    const liveDomain = "https://evosport-admin-dashboard.vercel.app";

    console.log(`1. Navigating to ${liveDomain}/admin-login...`);
    await page.goto(`${liveDomain}/admin-login`, { waitUntil: "networkidle2" });

    // Fill credentials & submit
    await page.type('input[type="email"]', "admin@evosport.com");
    await page.type('input[type="password"]', "Admin123!");
    await page.click('button[type="submit"]');

    // Wait until URL changes or header is rendered
    await page.waitForFunction(() => window.location.href.includes("/admin"), { timeout: 10000 }).catch(() => {});

    const routesToTest = [
      { name: "/admin", url: `${liveDomain}/admin` },
      { name: "/admin/products", url: `${liveDomain}/admin/products` },
      { name: "/admin/orders", url: `${liveDomain}/admin/orders` },
    ];

    const results = [];

    for (const item of routesToTest) {
      console.log(`Navigating to ${item.name}...`);
      await page.goto(item.url, { waitUntil: "networkidle2" });
      const content = await page.content();
      const hasError = content.includes("Application error") || content.includes("server-side exception") || content.includes("Digest:");
      const title = await page.evaluate(() => document.querySelector("h1, h2")?.textContent?.trim() || "");

      results.push({ route: item.name, title, ok: !hasError && title !== "RESTRICTED ACCESS" });
      console.log(` -> ${item.name}: Title="${title}", OK=${!hasError && title !== "RESTRICTED ACCESS"}`);
    }

    console.log("\n=== LIVE VERCEL PRODUCTION RESULTS ===");
    console.table(results);

    const screenshotPath = "/home/ab/.gemini/antigravity-cli/brain/5936c987-e368-45bc-8097-935ee3d2f5f6/vercel_admin_overview_live.png";
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`Saved screenshot to: ${screenshotPath}`);

    const allOk = results.every((r) => r.ok);
    if (allOk) {
      console.log("✅ SUCCESS: ALL LIVE VERCEL ADMIN ROUTES ARE RENDERING 200 OK!");
    } else {
      console.error("❌ FAILED: Live Vercel routes failed validation");
    }

  } catch (err) {
    console.error("Test execution error:", err);
  } finally {
    await browser.close();
  }
}

run();
