const readDir = require(`${__dirname}/scripts`).readDir;

module.exports = function(dir) {
  const stepDefs = [];

  // SP stands for step parser
  const sp = function(regex, step){
    stepDefs.push({regex, step});
  };

  return new Promise((res, rej)=>{
    readDir(dir, /^(.*)-steps.js$/).then((stepDefinitionFiles)=>{
      let readFiles = 0;
      stepDefinitionFiles.forEach((stepDefFilepath)=>{
        const stepsToParse = require(stepDefFilepath);
        stepsToParse(sp, sp, sp, sp, sp);
        readFiles++;
        if(readFiles === stepDefinitionFiles.length) res(stepDefs);
      });
    });
  });

};