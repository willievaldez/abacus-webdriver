const fs = require('fs');
const open = require('open');


module.exports = function(conglomeratedReport, callback) {
    let htmlsource = '<html><head><style>';
    htmlsource += '*{padding: 5;margin: 5;}.fit {max-width: 100%;max-height: 100%;}.center {display: block;margin: auto;}';
    htmlsource += '</style></head><body>';
    for (let j = 0; j < conglomeratedReport.length; j++) {
        const oneProcessReport = conglomeratedReport[j];
        for (let k = 0; k < oneProcessReport.length; k++) {
            const scenarioResult = oneProcessReport[k];
            let color = 'green';
            if (scenarioResult.status === 'Fail') color = 'red';
            htmlsource += `<h2 style="color:${color};">${scenarioResult.title}</h2>`;
            for (let s = 0; s < scenarioResult.steps.length; s++){
                const stepResults = scenarioResult.steps[s];
                color = 'green';
                if (stepResults.status === undefined) color = 'grey';
                else if (stepResults.status === 'Fail') color = 'red';
                htmlsource += `<div style="color:${color};">${stepResults.keyword} ${stepResults.step}</div>`;
                if (stepResults.status === 'Fail') {
                    htmlsource += `<img  class="center fit" src="${stepResults.img}">`;
                }
            }
        }
    }
    htmlsource += '</body></html>';

    const openFile = function() {
        open('./reports/report.html');
        callback();
    };
    fs.writeFile('./reports/report.html', htmlsource,openFile);
};