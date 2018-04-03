const HookManager = require('../models/hook-manager');
const {fork} = require('child_process');
const driver = require('../scenario-runner/driver');
let childDriver = null;

// interrupt graceful failure
process.on('SIGINT', () => {
    exitProcess();
  })
  .on('SIGTERM', () => {
    console.log(`${process.pid} - exiting...`);
    process.exit();
  })
  .on('unhandledRejection', (err, p) => {
    console.error('Unhandled rejection within webdriver-runner context');
    console.log(err);
    exitProcess();
  })
  .on('uncaughtException', (err) => {
    console.log("Uncaught Exception within webdriver-runner context");
    console.log(err);
    exitProcess();
  });

async function exitProcess(report=[]) {
  if (childDriver) childDriver.kill();
  try {
      console.log(`${process.pid} - quitting selenium`);
      await driver.quit();
      console.log(`${process.pid} - sending report`);
      process.send(report);
  }
  catch (err) {
      console.log("process sending error");
      console.log(err);
      process.exit();
  }

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

    childDriver = fork(`${__dirname}/../scenario-runner/index.js`, [process.pid], {env: process.env});
    childDriver.send(scenarioJSON);
    console.log(`WDCONTEXT: spawned scenario process ${childDriver.pid}`);

    const result = await new Promise((resolve, reject) => {
      childDriver.on('message', (m) => {
        if (/END: (.*)/.test(m)) {
          // console.log('end message received', m);
          const regexResults = m.match(/END: (.*)/);
          childDriver.kill();
          if (regexResults[1] !== '') resolve(JSON.parse(regexResults[1]));
          else resolve();
        }
        // driver.interpret(m, childDriver);
      });
    });



    if (result) console.log(result.stack);

    if (result) {
      scenarioJSON.status = scenarioJSON.steps[result.index].status = 'Fail';
      scenarioJSON.steps[result.index].error = {"message": result.message, "stack": result.stack};
      scenarioJSON.steps[result.index].img =  `data:image/png;base64, ${await driver.takeScreenshot()}`;
    }
    else scenarioJSON.status = 'Pass';
    console.log(`WDCONTEXT: killed scenario process ${childDriver.pid}`);

    await hookManager.runHooks('AfterEach');
    console.log('post AE');
  }
  await hookManager.runHooks('AfterAll');

  return scenarios;
}

process.once('message', async (scenarios) => {
  await driver.init();
  try {
    const report = await executeScenarios(scenarios);
    exitProcess(report);
  }
  catch(err) {
    exitProcess();
  }
});
