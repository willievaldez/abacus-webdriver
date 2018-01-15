require('babel-register');

const dataTable = require('../models/data-table');
const fs = require('fs');
const {gatherHooks, runHooks} = require('../scripts/hook-finder');
const gatherPageObjects = require('../scripts/pageObject-finder');
const gatherStepDefinitions = require('../scripts/step-finder');

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

driver = new webdriver.Builder().withCapabilities(makeCapabilities()).build();
if (process.env.SELENIUM_WIDTH && process.env.SELENIUM_HEIGHT)
    driver.manage().window().setSize(parseInt(process.env.SELENIUM_WIDTH), parseInt(process.env.SELENIUM_HEIGHT));

const report = [];

const exitProcess = function () {
    runHooks('AfterAll', () => {
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
        fs.unlink(process.argv[2], (err) => {
            if (err) console.log("Unlink Error: \n" + err);
        });
    });
};

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

// helper function to replace key values at runtime
const replaceAtRuntime = function (string) {
    let newString = string;
    if (/{([^}]*)}/.test(string)) {
        const exampleReplacements = string.match(/{([^}]*)}/g);
        for (let i = 0; i < exampleReplacements.length; i++) {
            const replacement = exampleReplacements[i];
            newString = newString.replace(replacement, global[replacement.substring(1, replacement.length - 1)]);
        }

    }
    return newString;
};

const promises = [gatherPageObjects(), gatherStepDefinitions(), gatherHooks()];

Promise.all(promises).then((results) => {
    const validScenarios = require(process.argv[2]);
    const stepDefs = results[1];
    let scenarioNum = 0;
    const nextScenario = function () {
        return runHooks('AfterEach', () => {
            scenarioNum++;
            executeScenario();
        });
    };

    const executeScenario = function () {
        driver = new webdriver.WebDriver(driver.getSession(), driver.getExecutor());
        if (scenarioNum === validScenarios.length) return exitProcess();
        scenario = validScenarios[scenarioNum];

        if (process.env.SELENIUM_BROWSER_INSTANCES === '1')
            console.log(`\n\n${scenario.title}`);

        let timeoutInterval;
        const callback = function (results) {
            if (!timeoutInterval._idleStart) return;

            clearTimeout(timeoutInterval);
            timeoutInterval = timeoutInterval._idleStart;
            if (results) {
                if(process.env.SELENIUM_BROWSER_INSTANCES === '1') {
                    console.log(`\x1b[31m ${scenario.steps[stepNum - 1].keyword} ${scenario.steps[stepNum - 1].step} \x1b[0m`);
                    const printable = dataTable.format(scenario.steps[stepNum - 1].table);
                    if (printable) console.log(`\x1b[31m${printable}\x1b[0m`);
                    console.log(results);
                }
                else console.log(`\x1b[31m${process.pid} - ${scenario.title} \x1b[0m`);

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
                if (process.env.SELENIUM_BROWSER_INSTANCES === '1') {
                    console.log(`\x1b[32m ${scenario.steps[stepNum - 1].keyword} ${scenario.steps[stepNum - 1].step} \x1b[0m`);
                    const printable = dataTable.format(scenario.steps[stepNum - 1].table);
                    if (printable) console.log(`\x1b[32m${printable}\x1b[0m`);
                }
                scenario.steps[stepNum - 1].status = 'Pass';
                return callStep();
            }
        };

        let stepNum = 0;
        const callStep = function () {
            if (stepNum === scenario.steps.length) {
                scenario.status = 'Pass';
                if(process.env.SELENIUM_BROWSER_INSTANCES !== '1') console.log(`\x1b[32m${process.pid} - ${scenario.title} \x1b[0m`);
                report.push(scenario);
                return nextScenario();
            }
            scenario.steps[stepNum].step = replaceAtRuntime(scenario.steps[stepNum].step);
            const currentStep = scenario.steps[stepNum];
            stepNum++;
            let stepFound = false;
            for (let i = 0; i < stepDefs.length; i++) {
                if (stepDefs[i].regex.test(currentStep.step)) {
                    stepFound = true;
                    const regexResults = currentStep.step.match(stepDefs[i].regex);
                    regexResults.splice(0, 1);
                    if (currentStep.table) regexResults.push(new dataTable(currentStep.table));
                    regexResults.push(callback);
                    try {
                        timeoutInterval = setTimeout(callback, process.env.CUCUMBER_STEP_TIMEOUT * 1000, new Error(`TimeoutError: Step timed out after ${process.env.CUCUMBER_STEP_TIMEOUT} seconds`));
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
            if (!stepFound) {
                // Set the timeout intereval so that the callback doesn't err out
                timeoutInterval = setTimeout(callback, process.env.CUCUMBER_STEP_TIMEOUT * 1000, new Error(`TimeoutError: Step timed out after ${process.env.CUCUMBER_STEP_TIMEOUT} seconds`));
                return callback(new Error(`Step "${currentStep.step}" not defined`));
            }

        };

        return runHooks('BeforeEach', callStep);

    };

    runHooks('BeforeAll', executeScenario);

});
