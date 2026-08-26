const puppeteer = require("/home/ab/Documents/EvoSport/node_modules/puppeteer-core");

async function run() {
  console.log("--- TESTING NEW DARK GLASSMORPHIC LOGIN PAGE E2E ---");
  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/google-chrome",
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  try {
    // 1. Navigate to /login
    console.log("1. Navigating to http://localhost:3000/login...");
    await page.goto("http://localhost:3000/login", { waitUntil: "domcontentloaded" });
    await page.evaluate(() => new Promise((r) => setTimeout(r, 2000)));

    // Screenshot of the dark glassmorphic Login Page design
    const loginScreenshot = "/home/ab/.gemini/antigravity-cli/brain/5936c987-e368-45bc-8097-935ee3d2f5f6/glassmorphic_login_design.png";
    await page.screenshot({ path: loginScreenshot, fullPage: true });
    console.log(`Saved Login Page screenshot to: ${loginScreenshot}`);

    // 2. Perform Real Login with valid admin@evosport.com
    console.log("2. Entering user credentials (admin@evosport.com)...");
    await page.type('input[type="email"]', "admin@evosport.com");
    await page.type('input[type="password"]', "Admin123456!");

    console.log("3. Submitting login form...");
    await page.click('button[type="submit"]');

    // Wait for client router navigation to /dashboard or /admin
    await page.waitForFunction(() => !window.location.href.endsWith("/login"), { timeout: 10000 });
    await page.evaluate(() => new Promise((r) => setTimeout(r, 2000)));

    const currentUrl = page.url();
    console.log("4. Login successful! Redirected URL:", currentUrl);

    // Screenshot of Dashboard after successful login
    const dashScreenshot = "/home/ab/.gemini/antigravity-cli/brain/5936c987-e368-45bc-8097-935ee3d2f5f6/dashboard_after_login.png";
    await page.screenshot({ path: dashScreenshot, fullPage: true });
    console.log(`Saved Dashboard screenshot to: ${dashScreenshot}`);

    console.log("\n✅ VERIFICATION SUCCESSFUL: Real user login works end-to-end!");

  } catch (err) {
    console.error("E2E Test Error:", err);
  } finally {
    await browser.close();
  }
}

run();
