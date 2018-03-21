const readDir = require('./directory-reader');

const rvgs = [];
const storedValues = {};

const init = function() {
    const appendRVGS = function(regex, rvgFunc) {
        rvgs.push({regex, rvgFunc});
    };

//include the generic rvg in the repo
    const genericRVGs = require('../generics/generic-rvg');
    genericRVGs(appendRVGS);

    return new Promise((res, rej) => {
        const rvgFiles = readDir(process.env.CUCUMBER_RVG_DIRECTORY, /^(.*)-rvg.js$/);
        for(let rvgFilepath of rvgFiles) {
          const rvgsToParse = require(`${process.env.PWD}/${rvgFilepath}`);
          rvgsToParse(appendRVGS);
        }
        
        res(true);

    });

};

const callRVGFunction = function(testRVG) {
    let rvgFound = false;
    for (let i = 0; i < rvgs.length; i++) {
        if (rvgs[i].regex.test(testRVG)) {
            rvgFound = true;
            const regexResults = testRVG.match(rvgs[i].regex);
            regexResults.splice(0, 1);
            return rvgs[i].rvgFunc.apply(null, regexResults);
        }
    }
    if (!rvgFound) throw new Error(`${testRVG} is not a random value generator function`);
};

const randomize = function(string) {
    let newString = string;
    if (/%([^%]*)%/.test(string)) {
        const exampleReplacements = string.match(/%([^%]*)%/g);

        for (let i = 0; i < exampleReplacements.length; i++) {
            const replacement = exampleReplacements[i];
            const functionToCall = replacement.substring(1, replacement.length - 1);
            let functionResult;

            if (/(.*)_(\d*)/.test(functionToCall)) {
                const funcArgs = functionToCall.match(/(.*)_(\d*)/);
                functionResult = callRVGFunction(funcArgs[1]);
                storedValues[`${funcArgs[1]}_${funcArgs[2]}`] = functionResult;
            }
            else {
                functionResult = callRVGFunction(functionToCall);
                storedValues[functionToCall] = functionResult;
            }

            newString = newString.replace(replacement, functionResult);
        }


    }
    return newString;
};

const getRandomValues = function(string) {
    let newString = string;
    if (/\*([^*]*)\*/.test(string)) {
        const exampleReplacements = string.match(/\*([^*]*)\*/g);
        for (let i = 0; i < exampleReplacements.length; i++) {
            const replacement = exampleReplacements[i];
            newString = newString.replace(replacement, storedValues[replacement.substring(1, replacement.length - 1)]);
        }

    }
    return newString;
};


module.exports = {init, randomize, getRandomValues};
