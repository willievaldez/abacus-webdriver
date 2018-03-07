const Step = require('./step');

class Scenario {
  constructor(scenarioJSON) {
    this.json = scenarioJSON;
    this.title = scenarioJSON.title;
    this.feature = scenarioJSON.feature;
    this.tags = scenarioJSON.tags;
    this.steps = scenarioJSON.steps;
  }

  async execute(stepManager) {
    driver = new webdriver.WebDriver(driver.getSession(), driver.getExecutor());

    if (process.env.SELENIUM_BROWSER_INSTANCES === '1') {
      console.log(this.title);
    }

    let fail;
    for (let step of this.steps) {
      const stepFunction = stepManager.findStep(step);
      if (!stepManager) {
        fail = true;
        break;
      }

      const stepObject = new Step(step, stepFunction);

      let results = null;
      try {
        results = await stepObject.runStep();
      }
      catch(err) {
        console.log(err);
        results = err;
      }
      if (results) {
        fail = true;
        break;
      }
    }

    if (fail) {
      this.json.status = 'Fail';
      if (process.env.SELENIUM_BROWSER_INSTANCES !== '1') {
        console.log(`\x1b[31m${process.pid} - ${this.title}\x1b[0m`);
      }
    }
    else {
      this.json.status = 'Pass';
      if (process.env.SELENIUM_BROWSER_INSTANCES !== '1') {
        console.log(`\x1b[32m${process.pid} - ${this.title}\x1b[0m`);
      }
    }
  }

}

module.exports = Scenario;
