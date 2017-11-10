const readDir = require('./directory-reader');

module.exports = function() {
  const stepDefs = [];

  // SP stands for step parser
  const sp = function(regex, step){
    stepDefs.push({regex, step});
  };

  const supportCode = {
    Given: sp,
    When: sp,
    Then: sp,
    And: sp,
    But: sp,
  };

  //include the generic steps in the repo
  const actionSteps = require(`${__dirname}/../step_definitions/action-steps`);
  actionSteps(supportCode);
  const verificationSteps = require(`${__dirname}/../step_definitions/verification-steps`);
  verificationSteps(supportCode);

  return new Promise((res, rej)=>{
    readDir(process.env.CUCUMBER_STEP_DEFINITION_DIRECTORY, /^(.*)-steps.js$/).then(function(stepDefinitionFiles) {
      let readFiles = 0;
      stepDefinitionFiles.forEach((stepDefFilepath)=>{
        const stepsToParse = require(`${process.env.PWD}/${stepDefFilepath}`);
        stepsToParse(supportCode);
        readFiles++;
        if(readFiles === stepDefinitionFiles.length) {
          res(stepDefs);
        }
      });
    });
  });

};