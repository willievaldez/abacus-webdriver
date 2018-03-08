const fs = require('fs');
const open = require('open');
const dataTable = require('../models/data-table');


module.exports = function(conglomeratedReport) {
    let numPassed = 0;
    let numFailed = 0;
    const featureLUT = {};

    // combine the arrays of each process report into one huge report and write it to a json file.
    const finalReport = [];
    for(let i = 0; i < conglomeratedReport.length; i++) {
        const singleRunner = conglomeratedReport[i];
        finalReport.push.apply(finalReport, singleRunner);
        for (let j = 0; j < singleRunner.length; j++) {
            const scenario = singleRunner[j];
            if (!featureLUT[scenario.feature]) featureLUT[scenario.feature] = [];
            featureLUT[scenario.feature].push(scenario);
        }
    }

    fs.writeFileSync('./reports/report.json', JSON.stringify(finalReport));


    let htmlSource = '';

    const features = Object.keys(featureLUT);
    for (let i = 0; i < features.length; i++) {
        let featureHTML = `<div id="${i}" style="display: none;">`;

        let featureColor = 'green';
        for (let k = 0; k < featureLUT[features[i]].length; k++) {
            const scenarioResult = featureLUT[features[i]][k];
            let color = 'green';
            if (scenarioResult.status === 'Fail') {
                featureColor = 'red';
                numFailed++;
                color = 'red';
            }                else numPassed++;
            featureHTML += `<h2 onclick="toggleShow('${i}_${k}')" style="color:${color};">${scenarioResult.title}</h2>`;
            featureHTML += `<div id="${i}_${k}" style="display: none;">`;
            for (let s = 0; s < scenarioResult.steps.length; s++) {
                const stepResults = scenarioResult.steps[s];
                color = 'green';
                if (stepResults.status === undefined) color = '#e6e6e6';
                else if (stepResults.status === 'Fail') color = 'red';
                featureHTML += `<div style="color:${color};">${stepResults.keyword} ${stepResults.step}`;
                if (stepResults.table) featureHTML += `<pre>${dataTable.format(stepResults.table)}</pre>`;
                featureHTML += '</div>';
                if (stepResults.status === 'Fail') {
                    featureHTML += `<button onclick="toggleShow('${i}_${k}_${s}_img')"> Show/Hide Image </button>`;
                    featureHTML += `<button onclick="toggleShow('${i}_${k}_${s}_err')"> Show/Hide Error </button>`;
                    featureHTML += `<img id="${i}_${k}_${s}_img" style="display: none;" class="center fit" src="${stepResults.img}">`;
                    featureHTML += `<pre id="${i}_${k}_${s}_err" style="display: none; color:${color};"><code>${stepResults.error.message}</code></pre>`;
                }
            }
            featureHTML += '</div>';
        }
        featureHTML = `<h2 style="color:${featureColor};" onclick="toggleShow('${i}')">${features[i]}</h2>` + featureHTML + '</div>';
        htmlSource += featureHTML;
    }

    htmlSource += '</body></html>';

    htmlSource = `<center><h1>PASS: ${numPassed}</h1><h1>FAIL: ${numFailed}</h1></center>` + htmlSource;
    let header = '<html><head><style>';
    header += '*{padding: 5;margin: 5;}.fit {max-width: 100%;max-height: 100%;}.center {display: block;margin: auto;}';
    header += '</style></head><body>';
    header += '<script> function toggleShow(id) {var x = document.getElementById(id);if (x.style.display === "none") {x.style.display = "block";} else {x.style.display = "none";}} </script>';
    htmlSource = header + htmlSource;

    fs.writeFileSync('./reports/report.html', htmlSource);
    open('./reports/report.html');
    return numFailed;

};
