const { removeAllChildNodes } = require('./util.js');
const puppeteer = require('puppeteer');
const {Eyes, Target} = require('@applitools/eyes-puppeteer')
const RandomTextGenerator = require("random-text-generator");

// Unit test
test('Should remove all child elements', () => {
  let ul = document.createElement('ul');
  ul.appendChild(document.createElement('li'));
  ul.appendChild(document.createElement('li'));
  ul.appendChild(document.createElement('li'));
  removeAllChildNodes(ul);
  expect(ul.childNodes.length).toBe(0);
})

// Visual regression test using applitools.
// test('Should load homepage', async () => {
//   const browser = await puppeteer.launch({
//     headless: false,
//     slowMo: 20,
//     args: ['--window-size=1920,1080']
//   });
//   const page = await browser.newPage();
//   await page.setViewport({ width: 1920, height: 1080});
//   await page.goto('http://localhost:4200');
//   const eyes = await new Eyes();
//   // await eyes.setApiKey('');
//   await eyes.open(page, 'Personal Budget', 'Homepage looks good', {width: 1920, height: 1080});
//   await eyes.check('Home Page', Target.window().fully());
//   await eyes.close()
//   const homeText = await page.$eval('.menu a', el => el.textContent);
//   expect(homeText).toBe('Home');
//   await browser.close();
// })

// End to end testing
test('Should show error when trying to add a duplicate budget item', async () => {
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 20,
    args: ['--window-size=1920,1080']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080});
  await page.goto('http://localhost:4200');
  await page.click('#login');
  await page.waitForNavigation({waitUntil: 'domcontentloaded'});
  console.log('hit');
  await page.click('.changeAction a');
  let randomTextGenerator = new RandomTextGenerator(rtgSettings);
  for (let username of trainUsernames) randomTextGenerator.learn(username);
  let username = randomTextGenerator.generate();
  await page.type('input.username', username);
  await page.type('input.email', username + '@email.com');
  await page.type('input.password', 'aW18O##MXj&pdY#BH%Xr');
  await page.click('.form button');
  await delay(2000);
  await page.type('input#new-title', 'a new budget item');
  await page.type('input#target-expense-amount', '22');
  await page.type('input#actual-expense-amount', '33');
  await page.click('.form button');
  await delay(2000);
  await page.type('input#new-title', 'a new budget item');
  await page.type('input#target-expense-amount', '12');
  await page.type('input#actual-expense-amount', '21');
  await page.click('.form button');
  await delay(2000);
  const errorText = await page.$eval('.budget-operation-error', el => el.textContent);
  expect(errorText).toBe('You are trying to add a budget item that already exists');
  await browser.close();
});


const trainUsernames = ["StinkyTomato", "Alextron234", "BattleDash", "berkey10", "Ezblox23", "robiko858", "zakizakowski", "MrArtur1337", "AzisDeus", "AustrianPainter1889", "pomidorek2pl", "JoeMamma", "MafiaBoss75", "SciManDan", "siuras_ogoras986", "jacob.flix", "malario", "BenDrowned", "pickupthefox", "okboomer", "GHPL", "Firstbober"];

const rtgSettings = {
  minLength: 1,
  maxLength: 10
}

function delay(time) {
  return new Promise(function(resolve) {
      setTimeout(resolve, time)
  });
}
