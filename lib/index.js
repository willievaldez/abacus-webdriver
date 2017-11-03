const dotenv = require('dotenv');
const fs = require('fs');
const open = require('open');
const { fork } = require('child_process');
const filterScenarios = require(`${__dirname}/filter-scenarios`);

dotenv.config({ path: `./env/${process.argv[2]}.env` });
let params;
try {
  params = {
    featureDir: './features/',
    inclusiveTags: JSON.parse(process.env.INCLUSIVE_TAGS),
    exclusiveTags: JSON.parse(process.env.EXCLUSIVE_TAGS)
  };
}
catch(err){
  console.log("Error: tags must be in array format. i.e. ['@TAG1','@TAG2']");
  return;
}

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

  const conglomeratedReport = [];
  // for each browser instance, fork a runner and send along a pack of scenarios to execute
  for (let i = 0; i < scenarioPacks.length; i++) {
    const pack = scenarioPacks[i];
    const pathName = `${__dirname}/scenario_pack_${i}.json`;
    fs.writeFile(pathName, JSON.stringify(pack, null, 4), 'utf8', (err) =>{
      if (err) return console.log(err);
      const childDriver = fork(`${__dirname}/runner.js`, [pathName], { env: process.env });
      childDriver.on('message', (m)=>{
        conglomeratedReport.push(m);
        if (conglomeratedReport.length === scenarioPacks.length) {
          let htmlsource = '<html><head></head><body>'
          for (let j = 0; j < conglomeratedReport.length; j++) {
            const oneProcessReport = conglomeratedReport[j];
            for (let k = 0; k < oneProcessReport.length; k++) {
              const scenarioResult = oneProcessReport[k];
              htmlsource += `<h2>${scenarioResult.title}</h2>`;
              for (let s = 0; s < scenarioResult.steps.length; s++){
                const stepResults = scenarioResult.steps[s];
                htmlsource += `<div>${stepResults.keyword} ${stepResults.step}: ${stepResults.status}</div>`;
                if (stepResults.status === 'Fail') {
                    htmlsource += `<img src="${stepResults.img}">`
                }
              }
            }
          }
          htmlsource += '</body></html>';
          
          const openFile = function() {
            open('./reports/report.html');
            process.exit(1);
          }
          fs.writeFile('./reports/report.html', htmlsource,openFile)
          // here we call the shutdown hook

        }
      });
    });
  }


});

