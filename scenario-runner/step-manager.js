const readDir = require('../scripts/directory-reader');

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
    
    const stepFiles = readDir(process.env.CUCUMBER_STEP_DEFINITION_DIRECTORY, /^(.*)-steps.js$/);
    for (let i = 0; i < stepFiles.length; i++) {
      const stepsToParse = require(`${process.env.PWD}/${stepFiles[i]}`);
      stepsToParse(supportCode);
    }

    return stepManagerInstance;
  }


  findStep(step) {
    for (let i = 0; i < this.steps.length; i++) {
      if (this.steps[i].regex.test(step.step)) {
        return this.steps[i];
      }
    }
    return null;
  }

}

module.exports = StepManager;
