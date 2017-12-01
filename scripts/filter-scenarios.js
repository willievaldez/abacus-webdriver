const gatherFeatures = require('./gherkin-parser');
const rvg = require('./random-value-generator');

const shouldIncludeScenario = function (scenario) {
    const inclusive = JSON.parse(process.env.CUCUMBER_INCLUSIVE_TAGS);
    const exclusive = JSON.parse(process.env.CUCUMBER_EXCLUSIVE_TAGS);

    for (let i = 0; i < inclusive.length; i++) {
        if (scenario.tags.includes(inclusive[i])) {
            if (exclusive.length === 0) return true;
            for (let j = 0; j < exclusive.length; j++) {
                if (scenario.tags.includes(exclusive[j])) {
                    return false;
                }
            }
            return true;
        }
    }
};

const constructScenariosFromOutline = function (scenario) {
    const scenarioArray = [];
    for (let i = 0; i < scenario.examples.length; i++) {
        const example = scenario.examples[i];
        for (let j = 0; j < example.vals.length; j++) {
            const singleLine = example.vals[j];
            const newScenario = {
                type: scenario.type,
                title: scenario.title,
                feature: scenario.feature,
                tags: scenario.tags.concat(example.tags),
                steps: JSON.parse(JSON.stringify(scenario.steps.slice())) // Make a copy
            };
            scenarioArray.push(newScenario);

            // Look in the title for any scenario outline variables
            if (/<([^>]*)>/.test(newScenario.title)) {
                const exampleReplacements = newScenario.title.match(/<([^>]*)>/g);
                exampleReplacements.forEach((replacement) => {
                    newScenario.title = newScenario.title.replace(replacement, singleLine[replacement.substring(1, replacement.length - 1)]);
                });
            }

            //look in each step for any scenario outline variables
            let stepsParsed = 0;
            newScenario.steps.forEach((step, i) => {
                stepsParsed++;
                if (/<([^>]*)>/.test(step.step)) {
                    const exampleReplacements = step.step.match(/<([^>]*)>/g);
                    exampleReplacements.forEach((replacement) => {
                        newScenario.steps[i].step = step.step.replace(replacement, singleLine[replacement.substring(1, replacement.length - 1)]);
                    });
                }

                // if the step has a data table, look for any scenario outline variables
                if (step.table) {
                    step.table.forEach((row, j) => {
                        row.forEach((entry, k) => {
                            if (/<([^>]*)>/.test(entry)) {
                                const exampleReplacements = entry.match(/<([^>]*)>/g);
                                exampleReplacements.forEach((replacement) => {
                                    step.table[j][k] = entry.replace(replacement, singleLine[replacement.substring(1, replacement.length - 1)]);
                                });
                            }
                        });
                    });
                }
            });


        }
    }

    return scenarioArray;

};

// used to replace
const replaceKeyValues = function (scenario) {
    const randomValues = new rvg();

    // Look in the title for any rvg variables
    scenario.title = randomValues.randomize(scenario.title);
    scenario.title = randomValues.getRandomValues(scenario.title);

    //look in each step for any rvg variables
    for (let i = 0; i < scenario.steps.length; i++) {
        const step = scenario.steps[i];
        scenario.steps[i].step = randomValues.randomize(step.step);
        scenario.steps[i].step = randomValues.getRandomValues(step.step);

        // if the step has a data table, look for any rvg variables
        if (step.table) {
            for(let j = 0; j < step.table.length; j++) {
                const row = step.table[j];
                for(let k = 0; k < row.length; k++) {
                    const entry = row[k];
                    scenario.steps[i].table[j][k] = randomValues.randomize(entry);
                    scenario.steps[i].table[j][k] = randomValues.getRandomValues(scenario.steps[i].table[j][k]);
                }
            }
        }

    }
};

const filterScenarios = function () {
    return new Promise((res, rej) => {
        gatherFeatures().then((features) => {
            const scenariosToExecute = [];
            let parsedFeatures = 0;
            features.forEach((feature) => {
                parsedFeatures++;
                let parsedScenarios = 0;
                feature.scenarios.forEach((scenario) => {

                    parsedScenarios++;
                    if (scenario.type === "Scenario") {
                        if (shouldIncludeScenario(scenario)) {
                            replaceKeyValues(scenario);
                            scenariosToExecute.push(scenario);

                        }
                        if (parsedFeatures === features.length && parsedScenarios === feature.scenarios.length) res(scenariosToExecute);
                    }
                    else { // Right here we need to parse through a scenario outline and make it a scenario
                        const scenarios = constructScenariosFromOutline(scenario);
                        let convertedScenarios = 0;
                        scenarios.forEach((constructedScenario) => {
                            if (shouldIncludeScenario(constructedScenario)) {
                                replaceKeyValues(constructedScenario);
                                scenariosToExecute.push(constructedScenario);
                            }
                            convertedScenarios++;
                            if (convertedScenarios === scenarios.length && parsedFeatures === features.length && parsedScenarios === feature.scenarios.length) res(scenariosToExecute);
                        });
                    }

                });
            });
        });
    });
};

module.exports = filterScenarios;