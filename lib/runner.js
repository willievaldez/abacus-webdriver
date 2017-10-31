const gatherStepDefinitions = require(`${__dirname}/step-finder`);
const gatherPageObjects = require(`${__dirname}/pageObject-finder`);

webdriver = require('selenium-webdriver'),
  By = webdriver.By,
  until = webdriver.until;

driver = new webdriver.Builder()
  .forBrowser('chrome')
  .build();

expect = require('chai').use(require('chai-as-promised')).expect;

const promises = [gatherPageObjects('./page_objects/'),gatherStepDefinitions('./step_definitions/')];

const cleanUp = function(){
  console.log("Cleaning up");
  driver.quit();
};

Promise.all(promises).then((results) => {
  const validScenarios = JSON.parse(process.argv[2]);
  const stepDefs = results[1];
  let scenarioNum = 0;

  const executeScenario = function(scenario) {
    if (scenarioNum === validScenarios.length) return cleanUp();
    console.log(scenario.title);
    const callback = function(results) {
      if(results) {
        console.log("\x1b[31m", scenario.steps[stepNum-1].step, "\x1b[0m");
        console.log(results);
        scenarioNum++;
        executeScenario(validScenarios[scenarioNum]);
      }
      else {
        console.log("\x1b[32m", scenario.steps[stepNum-1].step, "\x1b[0m");
        callStep();
      }
    };

    let stepNum = 0;
    const callStep = function() {
      if (stepNum === scenario.steps.length) {
        scenarioNum++;
        return executeScenario(validScenarios[scenarioNum]);
      }
      const currentStep = scenario.steps[stepNum];
      let stepFound = false;
      for (let i = 0; i < stepDefs.length; i++) {
        if (stepDefs[i].regex.test(currentStep.step)) {
          stepFound = true;
          stepNum++;
          const regexResults = currentStep.step.match(stepDefs[i].regex);
          regexResults.splice(0,1);
          regexResults.push(callback);
          try {
            stepDefs[i].step.apply(this, regexResults);
          }
          catch(err) {
            callback(err);
          }
          break;
        }
      }
      if(!stepFound) callback(`Step "${currentStep.step}" not defined`);

    };

    callStep();
  };

  executeScenario(validScenarios[0]);

});
