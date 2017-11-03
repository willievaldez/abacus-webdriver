require('babel-register');


const gatherStepDefinitions = require(`${__dirname}/step-finder`);
const gatherPageObjects = require(`${__dirname}/pageObject-finder`);
const dataTable = require(`${__dirname}/../models/data-table`);


//// Declaration of global variables
webdriver = require('selenium-webdriver'),
  by = webdriver.By,
  until = webdriver.until;

driver = new webdriver.Builder()
  .forBrowser('chrome')
  .build();

element = require(`${__dirname}/../models/web-element`);

expect = require('chai').use(require('chai-as-promised')).expect;
////


process
  .on('unhandledRejection', (reason, p) => {
    console.error(reason, 'Unhandled Rejection at Promise...but now I handled it', p);
  })
  .on('uncaughtException', function (err) {
    console.log("Uncaught Exception...but now I caught it");
    console.log(err);
    driver.quit();
    process.exit(1);
  });

const promises = [gatherPageObjects('./page_objects/'),gatherStepDefinitions('./step_definitions/')];

const cleanUp = function(){
  console.log("Cleaning up");
  driver.quit();
};

Promise.all(promises).then((results) => {
  const validScenarios = require(process.argv[2]);
  const stepDefs = results[1];
  let scenarioNum = 0;

  const executeScenario = function(scenario) {
    driver = new webdriver.WebDriver(driver.getSession(), driver.getExecutor());
    if (scenarioNum === validScenarios.length) return cleanUp();
    console.log(scenario.title);

    let timeoutInterval;
    const callback = function(results) {
      clearTimeout(timeoutInterval);
      if(results) {
        console.log(`\x1b[31m ${scenario.steps[stepNum-1].keyword} ${scenario.steps[stepNum-1].step} \x1b[0m`);
        console.log(results);
        scenarioNum++;
        executeScenario(validScenarios[scenarioNum]);
      }
      else {
        console.log(`\x1b[32m ${scenario.steps[stepNum-1].keyword} ${scenario.steps[stepNum-1].step} \x1b[0m`);
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
          if (currentStep.table) regexResults.push(new dataTable(currentStep.table));
          regexResults.push(callback);
          try {
            timeoutInterval = setTimeout(callback, 10000, "TimeoutError: Step timed out after 10 seconds");
            stepDefs[i].step.apply(this, regexResults);
          }
          catch(err) {
            console.log("Caught an error");
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
