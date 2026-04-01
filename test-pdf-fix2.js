const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('dialog', dialog => console.log('Dialog:', dialog.message()));
  await page.goto('http://localhost:8000');
  await page.fill('#text-input', 'Testing PDF export with Math $E = mc^2$ and lots of spaces');
  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 15000 }).catch(e => console.log(e)),
    page.click('#generate-pdf')
  ]);
  if (download) console.log('Downloaded', download.suggestedFilename());
  await browser.close();
})();
