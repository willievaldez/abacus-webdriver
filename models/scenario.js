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

    let stepNum = 0;
    const steps = this.steps;

    if (process.env.SELENIUM_BROWSER_INSTANCES === '1') {
      console.log(`\x1b[32m\n\n${this.title}\x1b[0m`);
    }

    const executionError = await new Promise((resolve, reject) => {
      const runStep = function (err) {
        if (err) return resolve(err);
        if (stepNum === steps.length) return resolve();
        const step = steps[stepNum];
        stepNum++;
        stepManager.runStep(step).then(runStep).catch(runStep);
      };

      runStep();
    });

    if (executionError) {
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
