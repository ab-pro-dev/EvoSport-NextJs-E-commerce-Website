const puppeteer = require("/home/ab/Documents/EvoSport/node_modules/puppeteer-core");

async function run() {
  console.log("--- DEBUGGING REAL USER LOGIN POST-AUTH REDIRECT ---");
  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/google-chrome",
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  try {
    console.log("1. Navigating to http://localhost:3000/login...");
    await page.goto("http://localhost:3000/login", { waitUntil: "networkidle2" });

    console.log("2. Entering user credentials...");
    await page.type('input[type="email"]', "admin@evosport.com");
    await page.type('input[type="password"]', "Admin123456!");

    console.log("3. Submitting form...");
    await page.click('button[type="submit"]');

    for (let i = 1; i <= 10; i++) {
      await page.evaluate(() => new Promise((r) => setTimeout(r, 1000)));
      const url = page.url();
      console.log(`[t=${i}s] Current URL: ${url}`);
      if (url === "http://localhost:3000/") {
        console.log("SUCCESS! Reached Homepage!");
        break;
      }
    }

    const finalUrl = page.url();
    console.log(`\nFinal URL: ${finalUrl}`);

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await browser.close();
  }
}

run();
