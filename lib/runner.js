require('babel-register');

const Scenario = require('../models/scenario');
const HookManager = require('../models/hook-manager');
const StepManager = require('../models/step-manager');
const gatherPageObjects = require('../scripts/pageObject-finder');

const makeCapabilities = function() {
    const desiredCapabilities = {
        'browserName': process.env.SELENIUM_BROWSER
    };

    if (process.env.SELENIUM_SAUCELABS === 'true') {
        desiredCapabilities.username = process.env.SAUCELABS_USERNAME;
        desiredCapabilities.accessKey = process.env.SAUCELABS_ACCESSKEY;
        if (process.env.SAUCELABS_PLATFORM) desiredCapabilities.platform = process.env.SAUCELABS_PLATFORM;
        if (process.env.SAUCELABS_SCREEN_RESOLUTION) desiredCapabilities.screenResolution = process.env.SAUCELABS_SCREEN_RESOLUTION;
        if (process.env.SAUCELABS_MAX_DURATION) desiredCapabilities.maxDuration = process.env.SAUCELABS_MAX_DURATION;
        desiredCapabilities.name = process.pid;
        process.env.SELENIUM_REMOTE_URL = `http://${process.env.SAUCELABS_USERNAME}:${process.env.SAUCELABS_ACCESSKEY}@ondemand.saucelabs.com:80/wd/hub`;
    }
    return desiredCapabilities
}

require('chromedriver');
//// Declaration of global variables
webdriver = require('selenium-webdriver'),
  by = webdriver.By,
  until = webdriver.until;
element = require('../models/web-element');
expect = require('chai').use(require('chai-as-promised')).expect;
global.storedValues = {};

driver = new webdriver.Builder().withCapabilities(makeCapabilities()).build();
if (process.env.SELENIUM_WIDTH && process.env.SELENIUM_HEIGHT)
    driver.manage().window().setSize(parseInt(process.env.SELENIUM_WIDTH), parseInt(process.env.SELENIUM_HEIGHT));

// interrupt graceful failure
process.on('SIGINT', function () {
  exitProcess();
});

process.on('SIGTERM', function () {
  console.log(`${process.pid} - exiting...`);
  process.exit();
});

process
  .on('unhandledRejection', (reason, p) => {
    console.error(reason, 'Unhandled Rejection at Promise...but now I handled it', p);
    exitProcess();
  })
  .on('uncaughtException', function (err) {
    console.log("Uncaught Exception...but now I caught it");
    console.log(err);
    exitProcess();
  });

async function exitProcess(report=[]) {
  console.log(`${process.pid} - quitting selenium`);
  driver.quit()
    .catch((err) => {
    });

  try {
      console.log(`${process.pid} - sending report`);
      process.send(report);
  }
  catch (err) {
      console.log("process sending error");
      console.log(err);
      process.exit();
  }

};

async function executeScenarios(scenarios) {
  await gatherPageObjects();
  let hookManager, stepManager;
  try {
    hookManager = await HookManager.init();
    stepManager = await StepManager.init();
  }
  catch(err) {
    return console.log(`Error Parsing: ${err.message}`);
  }

  await hookManager.runHooks('BeforeAll');
  for (let i = 0; i < scenarios.length; i++) {
    await hookManager.runHooks('BeforeEach');
    const scenario = new Scenario(scenarios[i]);
    await scenario.execute(stepManager);
    await hookManager.runHooks('AfterEach');
  }
  await hookManager.runHooks('AfterAll');

  return scenarios;
}

process.on('message', (scenarios) => {
  executeScenarios(scenarios)
    .then((report) => {
      exitProcess(report);

    })
    .catch((err) => {
      exitProcess();
    });
});
