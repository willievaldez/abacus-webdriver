const gatherStepDefinitions = require(`${__dirname}/step-finder`);

webdriver = require('selenium-webdriver'),
  By = webdriver.By,
  until = webdriver.until;

driver = new webdriver.Builder()
  .forBrowser('chrome')
  .build();


// TODO: add calls to hooks and what not here
gatherStepDefinitions(process.argv[3]).then((stepDefs) => {
  const validScenarios = JSON.parse(process.argv[2]);

  validScenarios.forEach((scenario) => {
    let stepNum = 0;
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
