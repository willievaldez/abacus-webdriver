const readDir = require('../scripts/directory-reader');
const dataTable = require('./data-table');

class StepManager {
  constructor() {
    this.steps = [];
  }

  static async init() {
    const stepManagerInstance = new StepManager();
    const stepParser = function(regex, step) {
      stepManagerInstance.steps.push({regex, step})
    }
    const supportCode = {
      Given: stepParser,
      When: stepParser,
      Then: stepParser,
      And: stepParser,
      But: stepParser,
    };

    //include the generic steps in the repo
    const actionSteps = require('../generics/action-steps');
    actionSteps(supportCode);
    const verificationSteps = require('../generics/verification-steps');
    verificationSteps(supportCode);

    const stepFiles = await readDir(process.env.CUCUMBER_STEP_DEFINITION_DIRECTORY, /^(.*)-steps.js$/);
    for (let i = 0; i < stepFiles.length; i++) {
      const stepsToParse = require(`${process.env.PWD}/${stepFiles[i]}`);
      stepsToParse(supportCode);
    }

    return stepManagerInstance;
  }

  // helper function to replace key values at runtime
  static replaceAtRuntime(string) {
      let newString = string;
      if (/{([^}]*)}/.test(string)) {
          const exampleReplacements = string.match(/{([^}]*)}/g);
          for (let i = 0; i < exampleReplacements.length; i++) {
              const replacement = exampleReplacements[i];
              newString = newString.replace(replacement, global.storedValues[replacement.substring(1, replacement.length - 1)]);
          }
      }
      return newString;
  }

  runStep(step) {
    step.step = StepManager.replaceAtRuntime(step.step);

    for (let i = 0; i < this.steps.length; i++) {
      if (this.steps[i].regex.test(step.step)) {
        return new Promise((resolve, reject) => {

          let timeoutInterval;
          const callback = function(err){
            clearTimeout(timeoutInterval);
            if (err) {
              if(process.env.SELENIUM_BROWSER_INSTANCES === '1') {
                  console.log(`\x1b[31m ${step.keyword} ${step.step} \x1b[0m`);
                  const printable = dataTable.format(step.table);
                  if (printable) console.log(`\x1b[31m${printable}\x1b[0m`);
                  console.log('\t'+err.message.replace('\n','\n\t'));
              }
              step.status = 'Fail';
              step.error = {message: err.message, stack: err.stack};
              driver.takeScreenshot().then((png) => {
                step.img = `data:image/png;base64, ${png}`;
                resolve(err);
              });
            }
            else {
              if (process.env.SELENIUM_BROWSER_INSTANCES === '1') {
                  console.log(`\x1b[32m ${step.keyword} ${step.step} \x1b[0m`);
                  const printable = dataTable.format(step.table);
                  if (printable) console.log(`\x1b[32m${printable}\x1b[0m`);
              }
              step.status = 'Pass';
              resolve();
            }
          };

          const regexResults = step.step.match(this.steps[i].regex);
          regexResults.splice(0, 1);
          if (step.table) regexResults.push(new dataTable(step.table));
          regexResults.push(callback);
          try {
            timeoutInterval = setTimeout(callback, process.env.CUCUMBER_STEP_TIMEOUT * 1000, new Error(`TimeoutError: Step timed out after ${process.env.CUCUMBER_STEP_TIMEOUT} seconds`));
            this.steps[i].step.apply(this, regexResults);
          }
          catch (err) {
            console.log("Caught an error");
            console.log(err);
            return callback(err);
          }
        });
      }
    }

    return new Promise((resolve, reject) => {
      resolve(new Error(`Step "${step.step}" not defined`));
    });
  }
  
}

module.exports = StepManager;
