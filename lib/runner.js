require('babel-register');

const dataTable = require('../models/data-table');
const fs = require('fs');
const {gatherHooks, runHooks} = require('../scripts/hook-finder');
const gatherPageObjects = require('../scripts/pageObject-finder');
const gatherStepDefinitions = require('../scripts/step-finder');

require('chromedriver');
//// Declaration of global variables
webdriver = require('selenium-webdriver'),
    by = webdriver.By,
    until = webdriver.until;

if (process.env.SELENIUM_SAUCELABS === 'true') {
    driver = new webdriver.Builder().withCapabilities({
        'browserName': process.env.SELENIUM_BROWSER_NAME,
        'platform': process.env.SAUCELABS_PLATFORM,
        'username': process.env.SAUCELABS_USERNAME,
        'accessKey': process.env.SAUCELABS_ACCESSKEY
    }).usingServer(`http://${process.env.SAUCELABS_USERNAME}:${process.env.SAUCELABS_ACCESSKEY}@ondemand.saucelabs.com:80/wd/hub`).build();
}
else {
    driver = new webdriver.Builder()
        .forBrowser('chrome')
        .build();
}

element = require('../models/web-element');

expect = require('chai').use(require('chai-as-promised')).expect;

const report = [];

const exitProcess = function () {
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
        process.exit();
    })
    .on('uncaughtException', function (err) {
        console.log("Uncaught Exception...but now I caught it");
        console.log(err);
        exitProcess();
        process.exit();
    });

const promises = [gatherPageObjects('./page_objects/'), gatherStepDefinitions('./step_definitions/'), gatherHooks('./hooks/')];

Promise.all(promises).then((results) => {
    const validScenarios = require(process.argv[2]);
    const stepDefs = results[1];
    let scenarioNum = 0;
    const nextScenario = function () {
        runHooks('AfterEach', () => {
            scenarioNum++;
            executeScenario();
        });
    };

    const executeScenario = function () {
        driver = new webdriver.WebDriver(driver.getSession(), driver.getExecutor());
        if (scenarioNum === validScenarios.length) return exitProcess();
        scenario = validScenarios[scenarioNum];

        console.log(`\n\n${scenario.title}`);

        let timeoutInterval;
        const callback = function (results) {
            if(!timeoutInterval._idleStart) {
                console.log("WOAH CALLBACK TWICE");
                console.log(timeoutInterval);
                return;
            }
            // console.log("Clear timeout: ");
            // console.log(timeoutInterval._idleStart);
            clearTimeout(timeoutInterval);
            timeoutInterval = timeoutInterval._idleStart;
            if (results) {
                console.log(`\x1b[31m ${scenario.steps[stepNum - 1].keyword} ${scenario.steps[stepNum - 1].step} \x1b[0m`);
                console.log(results.message);
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
                if (!scenario.steps[stepNum - 1].table) console.log(`\x1b[32m ${scenario.steps[stepNum - 1].keyword} ${scenario.steps[stepNum - 1].step} \x1b[0m`);
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
                        timeoutInterval = setTimeout(callback, process.env.CUCUMBER_STEP_TIMEOUT * 1000, new Error(`TimeoutError: Step timed out after ${process.env.CUCUMBER_STEP_TIMEOUT} seconds`));
                        // console.log("Set timeout: ");
                        // console.log(timeoutInterval._idleStart);
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
