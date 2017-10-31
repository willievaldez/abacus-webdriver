const gatherFeatures = require(`${__dirname}/gherkin-parser`);

const shouldIncludeScenario = function(inclusive, exclusive, scenario) {
  for(let i = 0; i < inclusive.length; i++) {
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

const constructScenariosFromOutline = function(scenario) {
  const scenarioArray = [];
  for(let i = 0; i < scenario.examples.length; i++) {
    const example = scenario.examples[i];
    for(let j = 0; j < example.vals.length; j++) {
      const singleLine = example.vals[j];
      const newScenario = {
        type: scenario.type,
        title: scenario.title,
        tags: scenario.tags.concat(example.tags),
        steps: JSON.parse(JSON.stringify(scenario.steps.slice())) // Make a copy
      };
      scenarioArray.push(newScenario);

      // Look in the title for any scenario outline variables
      if (/<([^>]*)>/.test(newScenario.title)) {
        const exampleReplacements = newScenario.title.match(/<([^>]*)>/g);
        exampleReplacements.forEach((replacement)=>{
          newScenario.title = newScenario.title.replace(replacement,singleLine[replacement.substring(1,replacement.length-1)]);
        });
      }

      //look in each step for any scenario outline variables
      let stepsParsed = 0;
      newScenario.steps.forEach((step, i)=>{
        stepsParsed++;
        if (/<([^>]*)>/.test(step.step)) {
          const exampleReplacements = step.step.match(/<([^>]*)>/g);
          exampleReplacements.forEach((replacement)=>{
            newScenario.steps[i].step = step.step.replace(replacement,singleLine[replacement.substring(1,replacement.length-1)]);
          });
        }
      });
    }
  }

  return scenarioArray;

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
          if (scenario.type === "Scenario") {
            if (shouldIncludeScenario(params.inclusiveTags, params.exclusiveTags, scenario)) {
              scenariosToExecute.push(scenario);
            }
            if(parsedFeatures === features.length && parsedScenarios === feature.scenarios.length) res(scenariosToExecute);
          }
          else { // Right here we need to parse through a scenario outline and make it a scenario
            const scenarios = constructScenariosFromOutline(scenario);
            let convertedScenarios = 0;
            scenarios.forEach((constructedScenario)=>{
              if (shouldIncludeScenario(params.inclusiveTags, params.exclusiveTags, constructedScenario)) {
                scenariosToExecute.push(constructedScenario);
              }
              convertedScenarios++;
              if(convertedScenarios == scenarios.length && parsedFeatures === features.length && parsedScenarios === feature.scenarios.length) res(scenariosToExecute);
            });
          }

        });
      });
    });
  });
};

module.exports = filterScenarios;