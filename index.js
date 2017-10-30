const dotenv = require('dotenv');
const { fork } = require('child_process');
const filterScenarios = require(`${__dirname}/filter-scenarios`);

dotenv.config({ path: `./env/${process.argv[2]}.env` });

const params = {featureDir:'./features/', inclusiveTags: JSON.parse(process.env.INCLUSIVE_TAGS), exclusiveTags: JSON.parse(process.env.EXCLUSIVE_TAGS)};

filterScenarios(params).then((validScenarios)=>{
  const divideScenarios = function(scenarios, instances) {
    // TODO: Yeah...
    if(instances == 1)
      return [scenarios];
    else
      return [scenarios.slice(0,1), scenarios.slice(1,scenarios.length)]
  };

  const scenarioPacks = divideScenarios(validScenarios, process.env.BROWSER_INSTANCES);
  scenarioPacks.forEach((pack)=>{
    // TODO might be easier to write pack to a json, and pass the filepath to the child process
    fork(`${__dirname}/runner.js`, [JSON.stringify(pack)], { env: process.env });
  });
});

