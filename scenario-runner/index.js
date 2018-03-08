const Step = require('./step');
const StepManager = require('./step-manager');
const HookManager = require('../models/hook-manager');
const gatherPageObjects = require('../scripts/pageObject-finder');

// Global variables
webdriver = require('selenium-webdriver');
element = require('./element').element;
by = require('./element').by;
expect = require('chai').use(require('chai-as-promised')).expect;
global.storedValues = {};

driver = require('./selenium').driver;
until = require('./selenium').until;

class Scenario {
  constructor(scenarioJSON) {
    this.json = scenarioJSON;
    this.title = scenarioJSON.title;
    this.feature = scenarioJSON.feature;
    this.tags = scenarioJSON.tags;
    this.steps = scenarioJSON.steps;
    this.currentStep = 0;

    const scenario = this;
    process
      .on('unhandledRejection', (err, p) => {
        console.log('scenario unhandled rejection');
        console.log(err);
        process.send(scenario.JSONError(err));
        process.exit();
      })
      .on('uncaughtException', function (err) {
        console.log("scenario uncaught exception: ");
        console.log(err);
        process.send(scenario.JSONError(err));
        process.exit();
      })
      .on('message', function(m) {
        if (/END: (.*)/.test(m)) {
          const regexResults = m.match(/END: (.*)/);
          const jsonError = JSON.parse(regexResults[1]);
          process.send(scenario.JSONError(jsonError));
          process.exit();
        }
      });

  }

  JSONError(err) {
    if (!err) return 'END: ';
    return `END: ${JSON.stringify({
      stack: err.stack,
      message: err.message,
      index: this.currentStep,
    })}`;
  }

  async execute() {
    if (process.env.SELENIUM_BROWSER_INSTANCES === '1') {
      console.log(this.title);
    }

    await gatherPageObjects();

    const stepManager = await StepManager.init();
    const hookManager = await HookManager.init();

    let results = null;
    for (let step of this.steps) {
      const stepFunction = stepManager.findStep(step);
      if (!stepFunction) {
        results = new Error(`step ${step.step} not defined`);
        break;
      }

      const stepObject = new Step(step, stepFunction);

      results = await stepObject.runStep();

      if (results) break;
      this.currentStep++;
    }

    // if (results) {
    //   this.json.status = 'Fail';
    //   if (process.env.SELENIUM_BROWSER_INSTANCES !== '1') {
    //     console.log(`\x1b[31m${process.pid} - ${this.title}\x1b[0m`);
    //   }
    // }
    // else {
    //   this.json.status = 'Pass';
    //   if (process.env.SELENIUM_BROWSER_INSTANCES !== '1') {
    //     console.log(`\x1b[32m${process.pid} - ${this.title}\x1b[0m`);
    //   }
    // }

    return results;
  }

}


process.once('message', (scenario) => {
  const scenarioObject = new Scenario(scenario);
  scenarioObject.execute().then((results) => {
    console.log(`sending: ${results}`);
    process.send(scenarioObject.JSONError(results));
  }).catch((err) => {
    console.log(`senderring: ${err}`);
    process.send(scenarioObject.JSONError(err));
  });
});
