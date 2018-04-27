const puppeteer = require('puppeteer');
const csv = require('csvtojson');
const { JEMENA_USERNAME, JEMENA_PASSWORD, PS_USERNAME, PS_PASSWORD } = process.env;

(async() => {
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();

  await page._client.send('Page.setDownloadBehavior', {behavior: 'allow', downloadPath: './'});
  await page.goto('https://electricityoutlook.jemena.com.au/login/index');
  await page.type('input#login_email', JEMENA_USERNAME);
  await page.type('input#login_password', JEMENA_PASSWORD);
  await page.click('#loginButton');

  await page.waitFor(5000)
  await page.click('#refresh-data');
  await page.waitForSelector('#fancybox-wrap', { hidden: true, timeout: 3000 });
  const usage = await page.evaluate(async () => {
    const res = await fetch('https://electricityoutlook.jemena.com.au/electricityView/download',{credentials: 'include'});
    return await res.text();
  });

  const getTotalUsageToday = () => {
    return new Promise((resolve, reject) => {
      csv()
        .fromString(usage)
        .on('error', err => reject(err))
        .on('end_parsed', json => {
          const [power] = json.slice(-1);
          const total = Number(Object.values(power).slice(5).filter(item => !!item).reduce((total, item) => parseFloat(total) + parseFloat(item)).toFixed(3));
          resolve(total);
        });
    })
  }

  var totalUsageToday = await getTotalUsageToday();

  await page.goto('https://secure.powershop.com.au/reports/meter_readings');
  await page.type('input#email', PS_USERNAME);
  await page.type('input#password', PS_PASSWORD);
  await page.click('#login_button');

  await page.waitForNavigation();
  const totalUsage = await page.evaluate(() =>  {
    const [full, decimal] = document.querySelectorAll('input[type="number"]');
    return Number(`${full.value}.${decimal.value}`);
  });

  console.log(`Powershops latest estimate: ${totalUsage}`);
  console.log(`New total: ${totalUsage + totalUsageToday}`);

  await browser.close();
})();
