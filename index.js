const dotenv = require('dotenv');
const { fork } = require('child_process');
const filterScenarios = require(`${__dirname}/filter-scenarios`);

dotenv.config({ path: `./env/${process.argv[2]}.env` });

const params = {featureDir:'./features/', inclusiveTags: JSON.parse(process.env.INCLUSIVE_TAGS), exclusiveTags: JSON.parse(process.env.EXCLUSIVE_TAGS)};

// filterScenarios parses all '*.feature' files and filters them by the given scenario tags
filterScenarios(params).then((validScenarios)=>{
  // TODO for this function: given the number of browser instances, divide the valid scenarios into packs and return an array of packs
  const divideScenarios = function(scenarios, instances) {
    if(instances == 1)
      return [scenarios];
    else
      return [scenarios.slice(0,1), scenarios.slice(1,scenarios.length)]
  };

  const scenarioPacks = divideScenarios(validScenarios, process.env.BROWSER_INSTANCES);

  // for each browser instance, fork a runner and send along a pack of scenarios to execute
  scenarioPacks.forEach((pack)=>{
    // TODO might be easier to write pack to a json, and pass the filepath to the child process
    fork(`${__dirname}/runner.js`, [JSON.stringify(pack)], { env: process.env });
  });
});

