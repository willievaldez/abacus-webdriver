#!/usr/bin/env node

const fs = require('fs');
const {fork} = require('child_process');
const filterScenarios = require('../scripts/filter-scenarios');
const {gatherHooks, runHooks} = require('../scripts/hook-finder');
const reporter = require('../models/reporter');
const setConfig = require('../scripts/config-file-parser');

setConfig(process.argv[2]);
const conglomeratedReport = [];

// interrupt counter
let interrupt_count = 0;
process.on('SIGINT', function() {
    if(interrupt_count === parseInt(process.env.SELENIUM_BROWSER_INSTANCES)) {
        reporter(conglomeratedReport, process.exit);
    }
});

const promises = [filterScenarios(), gatherHooks()];
// filterScenarios parses all '*.feature' files and filters them by the given scenario tags
Promise.all(promises).then((promiseResults) => {
    const validScenarios = promiseResults[0];
    const divideScenarios = function (scenarios, instances) {
        const baseNum = Math.floor(scenarios.length / instances);
        console.log(baseNum);
        let remainder = scenarios.length - (baseNum * instances);
        const scenarioPacks = [];
        let scenarioIndex = 0;
        for (let i = 0; i < instances; i++) {
            let topIndex = scenarioIndex + baseNum;
            if (remainder > 0) topIndex++;
            remainder--;
            scenarioPacks.push(scenarios.slice(scenarioIndex, topIndex));
            scenarioIndex = topIndex;
        }
        return scenarioPacks;
    };

    const scenarioPacks = divideScenarios(validScenarios, parseInt(process.env.SELENIUM_BROWSER_INSTANCES));


    const startRunner = function () {
        // for each browser instance, write a file of scenarios to execute, and fork a runner, sending the path to the scenario pack
        for (let i = 0; i < scenarioPacks.length; i++) {
            const pack = scenarioPacks[i];
            const pathName = `${__dirname}/scenario_pack_${i}.json`;
            console.log(pathName);
            fs.writeFile(pathName, JSON.stringify(pack, null, 4), 'utf8', (err) => {
                if (err) return console.log(err);
                const childDriver = fork(`${__dirname}/runner.js`, [pathName], {env: process.env});

                childDriver.on('message', (m) => {
                    conglomeratedReport.push(m);
                    childDriver.kill();
                    interrupt_count++;
                    if (conglomeratedReport.length === scenarioPacks.length) {
                        // here we call the shutdown hook
                        runHooks('shutdown', () => {
                            reporter(conglomeratedReport, process.exit);
                        });
                    }
                });


            });
        }

    };

    runHooks('init', startRunner);


});

