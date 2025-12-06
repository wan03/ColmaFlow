const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.setViewportSize({ width: 375, height: 812 });

  try {
    // Navigate to a store page using the ID from the seed (La Bendición)
    await page.goto('http://localhost:3000/store/c01m4d0s-0001-4000-8000-000000000001');

    // Wait for content to load
    await page.waitForTimeout(3000);

    await page.screenshot({ path: 'verification/store_mobile.png' });
    console.log('Screenshot taken');

  } catch (e) {
    console.error(e);
  } finally {
    await browser.close();
  }
})();
