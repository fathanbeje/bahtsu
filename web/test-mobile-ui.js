import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\Administrator\\.gemini\\antigravity\\brain\\2d4f0011-b739-47e3-8f89-9b1b11fee3f0';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function run() {
  console.log('Launching mobile browser...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--ignore-certificate-errors'],
    defaultViewport: {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true
    }
  });

  const page = await browser.newPage();

  // Pre-seed localStorage with token so we bypass passcode gate
  await page.goto('https://bahtsu.mia02sgs.sch.id', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.setItem('bahtsu_passcode', 'klangopan2026');
  });

  // Check if passcode modal input is present
  const passInput = await page.$('input[placeholder*="passcode"]');
  if (passInput) {
    console.log('Passcode modal detected, typing passcode...');
    await passInput.type('klangopan2026');
    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) await submitBtn.click();
    await new Promise(r => setTimeout(r, 2000));
  }

  // 1. Capture Studio View
  const studioPath = path.join(ARTIFACT_DIR, 'mobile_studio.png');
  await page.screenshot({ path: studioPath, fullPage: false });
  console.log('Saved studio screenshot to:', studioPath);

  // 2. Open Mobile Menu Drawer (the 3-dots button)
  const menuButtons = await page.$$('header button');
  if (menuButtons.length > 0) {
    // Last button in header is the mobile menu
    await menuButtons[menuButtons.length - 1].click();
    await new Promise(r => setTimeout(r, 600));
    const menuPath = path.join(ARTIFACT_DIR, 'mobile_menu.png');
    await page.screenshot({ path: menuPath, fullPage: false });
    console.log('Saved menu screenshot to:', menuPath);

    // Open 9Router Cockpit from Menu
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const routerBtn = buttons.find(b => b.innerText.includes('9Router Remote Cockpit'));
      if (routerBtn) routerBtn.click();
    });
    await new Promise(r => setTimeout(r, 1200));

    // Switch to 'Sisa Kuota Akun' tab
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const quotaTab = buttons.find(b => b.innerText.includes('Sisa Kuota Akun'));
      if (quotaTab) quotaTab.click();
    });
    await new Promise(r => setTimeout(r, 800));

    const routerPath = path.join(ARTIFACT_DIR, 'mobile_9router.png');
    await page.screenshot({ path: routerPath, fullPage: false });
    console.log('Saved 9router screenshot to:', routerPath);

    // Close 9Router modal (click X button)
    await page.evaluate(() => {
      const closeBtn = document.querySelector('button[title="Segarkan Data 9Router"]')?.nextElementSibling;
      if (closeBtn) closeBtn.click();
    });
    await new Promise(r => setTimeout(r, 500));
  }

  // 3. Switch to Arsip View
  await page.evaluate(() => {
    // Find button containing 'Arsip'
    const buttons = Array.from(document.querySelectorAll('button'));
    const arsipBtn = buttons.find(b => b.innerText.includes('Arsip') || b.getAttribute('title')?.includes('Arsip'));
    if (arsipBtn) arsipBtn.click();
  });
  await new Promise(r => setTimeout(r, 1500));
  const arsipPath = path.join(ARTIFACT_DIR, 'mobile_arsip.png');
  await page.screenshot({ path: arsipPath, fullPage: false });
  console.log('Saved arsip screenshot to:', arsipPath);

  // 4. Click the 'Baca' toggle button to test reader view
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const bacaBtn = buttons.find(b => b.innerText.trim() === 'Baca');
    if (bacaBtn) bacaBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  const readerPath = path.join(ARTIFACT_DIR, 'mobile_reader.png');
  await page.screenshot({ path: readerPath, fullPage: false });
  console.log('Saved reader screenshot to:', readerPath);

  await browser.close();
  console.log('Done capturing mobile UI!');
}

run().catch(err => {
  console.error('Error running mobile capture:', err);
  process.exit(1);
});
