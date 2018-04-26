const puppeteer = require('puppeteer');
const csv = require('csvtojson');

(async() => {
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();

  await page.goto('https://electricityoutlook.jemena.com.au/login/index');
  await page.type('input#login_email', '');
  await page.type('input#login_password', '');
  await page.click('#loginButton');

  await page.waitForNavigation();
  const usage = await page.evaluate(async () => {
    const res = await fetch('https://electricityoutlook.jemena.com.au/electricityView/download',{credentials: 'include'});
    return await res.text();
  });

  csv()
    .fromString(usage)
    .on('end_parsed', json => console.log(json.slice(-1)));

  await browser.close();
})();
