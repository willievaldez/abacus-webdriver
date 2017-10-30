const gatherStepDefinitions = require(`${__dirname}/step-finder`);
const gatherPageObjects = require(`${__dirname}/pageObject-finder`);

// Global objects that will be seen by step definitions and page objects
webdriver = require('selenium-webdriver'),
  By = webdriver.By,
  until = webdriver.until;

driver = new webdriver.Builder()
  .forBrowser('chrome')
  .build();


// gatherPageObjects: Look through all page object files, and construct a pageMap of the objects
// gatherStepDefinitions: parse through all step definition files
const promises = [gatherPageObjects('./page_objects/'),gatherStepDefinitions('./step_definitions/')];

return Promise.all(promises).then((results) => {
  // console.log("Done with both");
  const validScenarios = JSON.parse(process.argv[2]);
  const stepDefs = results[1];

  //for each scenario in the pack, loop through each step and call the corresponding step definition function
  validScenarios.forEach((scenario) => {
    let stepNum = 0;

    // recursive function that is called for each step in a scenario
    const callStep = function() {
      if (stepNum === scenario.steps.length) return;
      const currentStep = scenario.steps[stepNum];
      for (let i = 0; i < stepDefs.length; i++) {
        if (stepDefs[i].regex.test(currentStep.step)) {
          stepNum++;
          const regexResults = currentStep.step.match(stepDefs[i].regex);
          regexResults.splice(0,1);
          regexResults.push(callStep);
          stepDefs[i].step.apply(this, regexResults);
          break;
        }
      }
    };

    callStep();

  });
});
