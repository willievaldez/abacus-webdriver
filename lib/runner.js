const Scenario = require('../models/scenario');
const HookManager = require('../models/hook-manager');
const {fork} = require('child_process');
const SeleniumDriver = require('../models/selenium-driver');
const driver = new SeleniumDriver();
let childDriver = null;

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

async function exitProcess(report=[]) {
  if (childDriver) childDriver.kill();
  console.log(`${process.pid} - quitting selenium`);
  driver.quit()
    .catch((err) => {
      console.log(err);
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

};

function JSONError(err) {
  if (!err) return 'END: ';
  return `END: ${JSON.stringify({
    stack: err.stack,
    message: err.message
  })}`;
}

async function executeScenarios(scenarios) {
  let hookManager;
  try {
    hookManager = await HookManager.init();
  }
  catch(err) {
    return console.log(`Error Parsing: ${err.message}`);
  }

  await hookManager.runHooks('BeforeAll');
  for (let scenarioJSON of scenarios) {
    await hookManager.runHooks('BeforeEach');

    childDriver = fork(`${__dirname}/scenario-runner.js`, [process.pid], {env: process.env});
    childDriver.send(scenarioJSON);


    const result = await new Promise((resolve, reject) => {
      childDriver.on('message', (m) => {
        if (/END: (.*)/.test(m)) {
          console.log('end message received');
          const regexResults = m.match(/END: (.*)/);
          childDriver.kill();
          childDriver = null;
          if (regexResults[1] !== '') resolve(JSON.parse(regexResults[1]));
          else resolve();
        }
        else if (/WD: (\d+) - (.*)/.test(m)) {
          const regexResults = m.match(/WD: (\d+) - (.*)/);
          const uniqueId = regexResults[1];
          console.log('WD MESSAGE RECEIVED', m);

          driver.callWDFunction(regexResults[2]).then((result) => {
            if (childDriver) childDriver.send(`WD: ${uniqueId} - ${result}`);
          }).catch((err) => {
            if (childDriver) childDriver.send(JSONError(err));
          });
        }
        else if (/WDE: (\d+) - (.*)/.test(m)) {
          const regexResults = m.match(/WDE: (\d+) - (.*)/);
          const uniqueId = regexResults[1];
          console.log('WDE MESSAGE RECEIVED', m);

          driver.callWDElementFunction(regexResults[2]).then((result) => {
            if (childDriver) childDriver.send(`WDE: ${uniqueId} - ${result}`);
          }).catch((err) => {
            if (childDriver) childDriver.send(JSONError(err));
          });
        }

      });
    });

    if (result) {
      scenarioJSON.status = scenarioJSON.steps[result.index].status = 'Fail';
      scenarioJSON.steps[result.index].error = {"message": result.message, "stack": result.stack};
      scenarioJSON.steps[result.index].img =  `data:image/png;base64, ${await driver.screenshot()}`;
    }
    else scenarioJSON.status = 'Pass';

    await hookManager.runHooks('AfterEach');
  }
  await hookManager.runHooks('AfterAll');

  return scenarios;
}

process.once('message', (scenarios) => {
  executeScenarios(scenarios)
    .then((report) => {
      exitProcess(report);

    })
    .catch((err) => {
      exitProcess();
    });
});
