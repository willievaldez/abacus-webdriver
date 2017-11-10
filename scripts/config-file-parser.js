const readDir = require('./directory-reader');

/**
 * Register Variables in NODE_ENV process variables.
 * @param {Object} jsonObject.
 */
const registerVariables = function registerVariables(jsonObject, keyName) {
    //iterate into each Object of the Json.
    const objKeys = Object.keys(jsonObject);
    for(let i = 0; i < objKeys.length; i++) {
        const objVal = jsonObject[objKeys[i]];
        if (!process.env.hasOwnProperty(objKeys[i])) {
            if (Array.isArray(objVal)) {
                process.env[`${keyName}${objKeys[i].toUpperCase()}`] = JSON.stringify(objVal);
            }
            else if (typeof objVal === 'object') {
                registerVariables(objVal, `${keyName}${objKeys[i].toUpperCase()}_`);
            }
            else {
                process.env[`${keyName}${objKeys[i].toUpperCase()}`] = objVal;
            }
        }
    }
};

module.exports = function(){
    return new Promise((resolve,reject) => {
        readDir('./config/', /^(.*).json$/).then(function (jsonFiles) {
            for(let i = 0; i < jsonFiles.length; i++) {
                registerVariables(require(`../../.${jsonFiles[i]}`), '');
            }
            resolve();
        });
    });
};