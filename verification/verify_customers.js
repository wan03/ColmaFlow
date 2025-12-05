const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.setViewportSize({ width: 375, height: 812 });

  try {
    await page.goto('http://localhost:3000/customers');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'verification/customers_mobile.png' });
    console.log('Screenshot taken');
  } catch (e) {
    console.error(e);
  } finally {
    await browser.close();
  }
})();
