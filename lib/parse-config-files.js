const readDir = require(`${__dirname}/scripts`).readDirectory;

/**
 * Register Variables in NODE_ENV process variables.
 * @param {Object} jsonObject.
 */
const registerVariables = function registerVariables(jsonObject) {
    //iterate into each Object of the Json.
    const objKeys = Object.keys(jsonObject);
    for(let i = 0; i < objKeys.length; i++) {
        const objVal = jsonObject[objKeys[i]];
        if (!process.env.hasOwnProperty(objKeys[i])) {
            if (typeof objVal === 'object') {
                //iterate into each property of the Object and assign value to environment variable.
                const objValKeys = Object.keys(objVal);
                for(let j = 0; j < objValKeys.length; j++) {
                    const property = objVal[objValKeys[j]];
                    if (Array.isArray(property)) {
                        process.env[`${objKeys[i].toUpperCase()}_${objValKeys[j].toUpperCase()}`] = JSON.stringify(property);
                    }
                    else {
                        process.env[`${objKeys[i].toUpperCase()}_${objValKeys[j].toUpperCase()}`] = property;
                    }
                }
            }
            else {
                process.env[variable.toUpperCase()] = jsonObject[variable];

            }
        }
    }

};

module.exports = function(){
    return new Promise((resolve,reject) => {
        readDir('./config/', /^(.*).json$/).then(function (jsonFiles) {
            for(let i = 0; i < jsonFiles.length; i++) {
                registerVariables(require(`../../.${jsonFiles[i]}`));
            }
            resolve();
        });
    });
};