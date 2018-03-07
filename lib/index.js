#!/usr/bin/env node

const {fork} = require('child_process');
const scl = require('sauce-connect-launcher');
const filterScenarios = require('../scripts/filter-scenarios');
const HookManager = require('../models/hook-manager');
const reporter = require('../models/reporter');
const setConfig = require('../scripts/config-file-parser');

// If the exit process is unresponsive, allow for a back door to cancel the process
let interrupt_count = 0;
process.on('SIGINT', function () {
  if (interrupt_count > parseInt(process.env.SELENIUM_BROWSER_INSTANCES)) {
    reporter(conglomeratedReport, process.exit);
  }
  interrupt_count++;
});

// Helper functions:
// distributes equal work to the number of specified runners
function divideScenarios(scenarios, instances) {
  const baseNum = Math.floor(scenarios.length / instances);
  console.log(`Total Scenarios: ${scenarios.length}`);
  console.log(`Each runner will receive ${baseNum} scenarios`);
  let remainder = scenarios.length - (baseNum * instances);
  const scenarioPacks = [];
  let scenarioIndex = 0;
  for (let i = 0; i < instances; i++) {
    let topIndex = scenarioIndex + baseNum;
    if (remainder > 0) topIndex++;
    remainder--;
    scenarioPacks.push(scenarios.slice(scenarioIndex, topIndex));
    scenarioIndex = topIndex;
  }
  return scenarioPacks;
};

async function launchSauceConnect() {
  return new Promise((resolve, reject) => {
    if (process.env.SAUCELABS_SAUCE_CONNECT === "true") {
      console.log('launching sauce connect proxy...');
      scl({
        username: process.env.SAUCELABS_USERNAME,
        accessKey: process.env.SAUCELABS_ACCESSKEY
      }, function (err, scProcess) {
        if (err) throw err;
        resolve();
      });
    }
    else resolve();
  });
}


// Main function: set configuration, launch sauce connect, gather scenarios, divide scenarios, fork runners
async function run() {
  setConfig(process.argv[2]);
  await launchSauceConnect();
  const scenarios = await filterScenarios();
  const scenarioPacks = divideScenarios(scenarios, process.env.SELENIUM_BROWSER_INSTANCES);

  let hookManager;
  try {
    hookManager = await HookManager.init();
  }
  catch(err) {
    return console.log(`Error Parsing Hooks: ${err.message}`);
  }

  await hookManager.runHooks('Init');

  const fullReportPromise = new Promise((resolve, reject) => {
    const fullReport = [];
    for (let i = 0; i < scenarioPacks.length; i++) {
      const childDriver = fork(`${__dirname}/runner.js`, [], {env: process.env});
      console.log('sent: '+childDriver.pid);
      childDriver.send(scenarioPacks[i]);
      childDriver.on('message', (m) => {
        fullReport.push(m);
        childDriver.kill();
        interrupt_count++;
        if (fullReport.length === scenarioPacks.length) {
          resolve(fullReport);
        }
      });
    }
  });

  const fullReport = await fullReportPromise;
  const numFailed = await reporter(fullReport);
  await hookManager.runHooks('Shutdown');
  if (numFailed > 0) process.exit(-1);
  else process.exit();
}

run();
