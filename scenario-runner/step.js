const dataTable = require('../models/data-table');
const {driver} = require('./selenium');
const element = require('./element');
class Step {
  constructor(stepJSON, stepFunction) {
    this.step = stepJSON;
    this.step.step = Step.replaceAtRuntime(this.step.step);
    this.stepFunction = stepFunction;
    this.regexResults = this.step.step.match(this.stepFunction.regex);

    this.regexResults.splice(0, 1);
    if (this.step.table) this.regexResults.push(new dataTable(this.step.table));

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


  callback(stepObj, err){
    clearTimeout(stepObj.timeout);

    if (err) {
      if(process.env.SELENIUM_BROWSER_INSTANCES === '1') {
        console.log(`\x1b[31m ${stepObj.step.keyword} ${stepObj.step.step} \x1b[0m`);
        const printable = dataTable.format(stepObj.step.table);
        if (printable) console.log(`\x1b[31m${printable}\x1b[0m`);
        console.log('\t'+err.message.replace('\n','\n\t'));
      }
    //   stepObj.step.status = 'Fail';
    //   stepObj.step.error = {message: err.message, stack: err.stack};
    //   driver.takeScreenshot().then((png) => {
    //     stepObj.step.img = `data:image/png;base64, ${png}`;
    //     stepObj.resolve(true);
    //   });
    }
    else {
      if (process.env.SELENIUM_BROWSER_INSTANCES === '1') {
        console.log(`\x1b[32m ${stepObj.step.keyword} ${stepObj.step.step} \x1b[0m`);
        const printable = dataTable.format(stepObj.step.table);
        if (printable) console.log(`\x1b[32m${printable}\x1b[0m`);
      }
    //   stepObj.step.status = 'Pass';
    //   stepObj.resolve();
    }

    stepObj.resolve(err);

  };

  runStep() {
    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;

      this.timeout = setTimeout(this.callback, process.env.CUCUMBER_STEP_TIMEOUT * 1000, this, new Error(`TimeoutError: Step timed out after ${process.env.CUCUMBER_STEP_TIMEOUT} seconds`));
      this.stepFunction.step.apply(this, this.regexResults).then((results) => {
        const promises = [driver.getOpenRequests(), element.getOpenRequests()];
        Promise.all(promises).then((promiseResults) => {
          this.callback(this, results);
        });
      });


    });

  }

}

module.exports = Step;
