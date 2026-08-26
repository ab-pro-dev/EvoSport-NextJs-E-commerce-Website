const puppeteer = require("/home/ab/Documents/EvoSport/node_modules/puppeteer-core");

async function run() {
  console.log("--- TESTING PDP CART & RELATED PRODUCTS FIXES ---");
  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/google-chrome",
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  try {
    console.log("1. Navigating to http://localhost:3000/products/sports-backpack...");
    await page.goto("http://localhost:3000/products/sports-backpack", { waitUntil: "networkidle2" });

    // Print all buttons text
    const buttons = await page.evaluate(() => {
      return Array.from(document.querySelectorAll("button")).map((b) => b.textContent.trim());
    });
    console.log("All page buttons:", buttons);

    // Click Add to Cart button
    console.log("2. Clicking Add to Cart button...");
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const addBtn = btns.find((b) => b.textContent && b.textContent.toUpperCase().includes("ADD TO CART"));
      if (addBtn) addBtn.click();
    });

    await page.evaluate(() => new Promise((r) => setTimeout(r, 1500)));

    const afterButtons = await page.evaluate(() => {
      return Array.from(document.querySelectorAll("button")).map((b) => b.textContent.trim());
    });
    console.log("Buttons after click:", afterButtons);

    const hasAdded = afterButtons.some((txt) => txt.toUpperCase().includes("ADDED TO CART"));
    if (hasAdded) {
      console.log("✅ SUCCESS: Add to cart on PDP succeeded without error!");
    } else {
      console.error("❌ FAILED: Add to cart did not change to ADDED TO CART!");
    }

  } catch (err) {
    console.error("PDP Test Error:", err);
  } finally {
    await browser.close();
  }
}

run();
