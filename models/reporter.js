const fs = require('fs');
const open = require('open');

const writeJson = function(conglomeratedReport, cb) {
    const finalReport = [];
    for(let i = 0; i < conglomeratedReport.length; i++) {
        const singleRunner = conglomeratedReport[i];
        finalReport.push.apply(finalReport, singleRunner);
    }
    fs.writeFile('./reports/report.json', JSON.stringify(finalReport),cb);
}


module.exports = function(conglomeratedReport, callback) {
    writeJson(conglomeratedReport, () => {
        let htmlsource = '<html><head><style>'
        htmlsource += '*{padding: 5;margin: 5;}.fit {max-width: 100%;max-height: 100%;}.center {display: block;margin: auto;}';
        htmlsource += '</style></head><body>';
        htmlsource += '<script> function toggleShow(id) {var x = document.getElementById(id);if (x.style.display === "none") {x.style.display = "block";} else {x.style.display = "none";}} </script>';
        for (let j = 0; j < conglomeratedReport.length; j++) {
            const oneProcessReport = conglomeratedReport[j];
            for (let k = 0; k < oneProcessReport.length; k++) {
                const scenarioResult = oneProcessReport[k];
                let color = 'green';
                if (scenarioResult.status === 'Fail') color = 'red';
                htmlsource += `<h2 onclick="toggleShow('${j}_${k}')" style="color:${color};">${scenarioResult.title}</h2>`;
                htmlsource += `<div id="${j}_${k}" style="display: none;">`;
                for (let s = 0; s < scenarioResult.steps.length; s++){
                    const stepResults = scenarioResult.steps[s];
                    color = 'green';
                    if (stepResults.status === undefined) color = '#e6e6e6';
                    else if (stepResults.status === 'Fail') color = 'red';
                    htmlsource += `<div style="color:${color};">${stepResults.keyword} ${stepResults.step}</div>`;
                    if (stepResults.status === 'Fail') {
                        htmlsource += `<button onclick="toggleShow('${j}_${k}_${s}_img')"> Show/Hide Image </button>`;
                        htmlsource += `<button onclick="toggleShow('${j}_${k}_${s}_err')"> Show/Hide Error </button>`;
                        htmlsource += `<img id="${j}_${k}_${s}_img" style="display: none;" class="center fit" src="${stepResults.img}">`;
                        htmlsource += `<pre id="${j}_${k}_${s}_err" style="display: none; color:${color};"><code>${stepResults.error.message}</code></pre>`
                    }
                }
                htmlsource += `</div>`;
            }
        }
        htmlsource += '</body></html>';

        const openFile = function() {
            open('./reports/report.html');
            callback();
        };
        fs.writeFile('./reports/report.html', htmlsource,openFile);
    });

};