const express = require('express');
const { chromium, firefox, webkit } = require('playwright');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/api/hackathons', async (req, res) => {
  let browser;
  try {
    // Try Firefox first, then WebKit, then Chromium as fallback
    try {
      browser = await firefox.launch({ headless: true });
    } catch (e) {
      try {
        browser = await webkit.launch({ headless: true });
      } catch (e) {
        browser = await chromium.launch({ headless: true });
      }
    }

    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    await page.goto('https://unstop.com/hackathons', { waitUntil: 'networkidle' });

    const titles = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('h1, h2')).map(el => el.innerText.trim());
    });

    await browser.close();

    res.json({ titles });
  } catch (error) {
    console.error('Error scraping:', error);
    if (browser) await browser.close();
    res.status(500).json({ error: 'Failed to fetch hackathons' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

