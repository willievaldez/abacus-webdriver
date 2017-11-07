require('babel-register');

const dataTable = require(`${__dirname}/../models/data-table`);
const fs = require('fs');
const {gatherHooks, runHooks} = require(`${__dirname}/hook-finder`);
const gatherPageObjects = require(`${__dirname}/pageObject-finder`);
const gatherStepDefinitions = require(`${__dirname}/step-finder`);

require('chromedriver');
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

const report = [];

const exitProcess = function() {
    runHooks('AfterAll', () => {
        driver.quit();
        process.send(report);
        fs.unlink(process.argv[2], (err) => {
            if (err) throw err;
        });
    });
};

process
  .on('unhandledRejection', (reason, p) => {
      console.error(reason, 'Unhandled Rejection at Promise...but now I handled it', p);
      exitProcess();
      process.exit(1);
  })
  .on('uncaughtException', function (err) {
      console.log("Uncaught Exception...but now I caught it");
      console.log(err);
      exitProcess();
      process.exit(1);
  });

const promises = [gatherPageObjects('./page_objects/'), gatherStepDefinitions('./step_definitions/'), gatherHooks('./hooks/')];

Promise.all(promises).then((results) => {
    const validScenarios = require(process.argv[2]);
    const stepDefs = results[1];
    let scenarioNum = 0;
    const nextScenario = function() {
        runHooks('AfterEach', () => {
            scenarioNum++;
            executeScenario();
        });
    };

    const executeScenario = function () {
        driver = new webdriver.WebDriver(driver.getSession(), driver.getExecutor());
        if (scenarioNum === validScenarios.length) return exitProcess();
        scenario = validScenarios[scenarioNum];
        
        console.log(scenario.title);

        let timeoutInterval;
        const callback = function (results) {
            clearTimeout(timeoutInterval);
            if (results) {
                console.log(`\x1b[31m ${scenario.steps[stepNum - 1].keyword} ${scenario.steps[stepNum - 1].step} \x1b[0m`);
                console.log(results);
                report.push(scenario);
                scenario.status = 'Fail';
                scenario.steps[stepNum - 1].status = 'Fail';
                scenario.steps[stepNum - 1].error = {message: results.message, stack: results.stack};
                return driver.takeScreenshot().then((png) => {
                    scenario.steps[stepNum - 1].img = `data:image/png;base64, ${png}`;
                    return nextScenario();
                });
            }
            else {
                if(!scenario.steps[stepNum - 1].table) console.log(`\x1b[32m ${scenario.steps[stepNum - 1].keyword} ${scenario.steps[stepNum - 1].step} \x1b[0m`);
                scenario.steps[stepNum - 1].status = 'Pass';
                return callStep();
            }
        };

        let stepNum = 0;
        const callStep = function () {
            if (stepNum === scenario.steps.length) {
                scenario.status = 'Pass';
                report.push(scenario);
                return nextScenario();
            }
            const currentStep = scenario.steps[stepNum];
            stepNum++;
            let stepFound = false;
            for (let i = 0; i < stepDefs.length; i++) {
                if (stepDefs[i].regex.test(currentStep.step)) {
                    stepFound = true;
                    const regexResults = currentStep.step.match(stepDefs[i].regex);
                    regexResults.splice(0, 1);
                    if (currentStep.table) {
                        regexResults.push(new dataTable(currentStep.table));
                        console.log(`\x1b[32m ${scenario.steps[stepNum - 1].keyword} ${scenario.steps[stepNum - 1].step} \x1b[0m`);
                    }
                    regexResults.push(callback);
                    try {
                        timeoutInterval = setTimeout(callback, 10000, new Error("TimeoutError: Step timed out after 10 seconds"));
                        stepDefs[i].step.apply(this, regexResults);
                    }
                    catch (err) {
                        console.log("Caught an error");
                        console.log(err);
                        return callback(err);
                    }
                    break;
                }
            }
            if (!stepFound) return callback(new Error(`Step "${currentStep.step}" not defined`));

        };

        return runHooks('BeforeEach', callStep);

    };

    runHooks('BeforeAll', executeScenario);

});
