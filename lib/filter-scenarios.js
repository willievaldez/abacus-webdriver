const gatherFeatures = require(`${__dirname}/gherkin-parser`);

const shouldIncludeScenario = function(inclusive, exclusive, scenario) {
  for(let i = 0; i < inclusive.length; i++) {

    // We need to treat scenario outlines differently because they have tags
    // for their individual example sets
    let returnTrue = false;
    if (scenario.type === 'Scenario Outline') {
      for(let k = 0; k < scenario.examples.length; k++) {
        let cont = false;
        for(let j = 0; j < exclusive.length; j++) {
          if (scenario.examples[k].tags.includes(exclusive[j])) {
            scenario.examples.splice(k, 1);
            k = k - 1;
            cont = true;
            break;
          }
        }
        if(cont) continue;
        if(scenario.examples[k].tags.includes(inclusive[i])) {
          returnTrue = true;
        }
        else {
          scenario.examples.splice(k, 1);
          k = k - 1;
          continue;
        }
      }
      return returnTrue;
    }

    // now we check the case for normal scenarios
    if (scenario.tags.includes(inclusive[i])) {
      if (exclusive.length === 0) return true;
      for(let j = 0; j < exclusive.length; j++) {
        if (scenario.tags.includes(exclusive[j])) {
          return false;
        }
      }
      return true;
    }
  }
};

const filterScenarios = function(params) {
  return new Promise((res, rej) => {
    gatherFeatures(params.featureDir).then((features)=>{
      const scenariosToExecute = [];
      let parsedFeatures = 0;
      features.forEach((feature) => {
        parsedFeatures++;
        let parsedScenarios = 0;
        feature.scenarios.forEach((scenario) => {
          parsedScenarios++;
          if (shouldIncludeScenario(params.inclusiveTags, params.exclusiveTags, scenario)) scenariosToExecute.push(scenario);
          if(parsedFeatures === features.length && parsedScenarios === feature.scenarios.length) res(scenariosToExecute);
        });
      });
    });
  });
};

module.exports = filterScenarios;