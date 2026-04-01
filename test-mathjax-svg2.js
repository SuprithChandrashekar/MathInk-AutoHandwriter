const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head>
      <script>
        window.MathJax = {
          tex: { inlineMath: [['$', '$']] },
          svg: { fontCache: 'local' },
          startup: {
            ready: () => {
              MathJax.startup.defaultReady();
              MathJax.startup.promise.then(() => {
                MathJax.startup.document.inputJax[0].mmlFilters.add((args) => {
                  const walkTree = (node) => {
                    if (!node) return;
                    if (node.isKind('mi') || node.isKind('mn')) {
                      node.attributes.set('mathvariant', 'normal');
                    }
                    if (node.childNodes && node.childNodes.length > 0) {
                      for (const child of node.childNodes) walkTree(child);
                    }
                  };
                  walkTree(args.data);
                });
                console.log('MathJax ready');
              });
            }
          }
        };
      </script>
      <script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js"></script>
    </head>
    <body>
      <div id="math">$X = 1$</div>
    </body>
    </html>
  `);
  await page.waitForTimeout(2000);
  const html = await page.evaluate(() => document.getElementById('math').innerHTML);
  console.log(html);
  await browser.close();
})();
