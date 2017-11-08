const readDir = require(`${__dirname}/scripts`).readDirectory;

return new Promise((res, rej) => {
    readDir('./config/', /^(.*).json$/).then(function (jsonFiles) {
        jsonFiles.forEach((jsonPath)=>{
            registerVariables(require(`../../.${jsonPath}`));
        });
    });
});

/**
 * Register Variables in NODE_ENV process variables.
 * @param {Object} jsonObject.
 */
function registerVariables(jsonObject) {
    //iterate into each Object of the Json.
    Object.keys(jsonObject).forEach((variable) => {
        if (!process.env.hasOwnProperty(variable)) {
            if (typeof jsonObject[variable] === 'object') {
                //iterate into each property of the Object and assign value to environment variable.
                Object.keys(jsonObject[variable]).forEach((property) => {
                    process.env[`${variable.toUpperCase()}_${property.toUpperCase()}`] = jsonObject[variable][property];
                });
            }
            else
                process.env[variable.toUpperCase()] = jsonObject[variable];
        }
    });
}