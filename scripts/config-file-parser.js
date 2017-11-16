/**
 * Register Variables in NODE_ENV process variables.
 * @param {Object} jsonObject.
 */
const registerVariables = function registerVariables(jsonObject, keyName) {
    //iterate into each Object of the Json.
    const objKeys = Object.keys(jsonObject);
    for(let i = 0; i < objKeys.length; i++) {
        const objVal = jsonObject[objKeys[i]];
        if (!process.env.hasOwnProperty(`${keyName}${objKeys[i].toUpperCase()}`)) {
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

module.exports = function(config){
    if(config){
        if (config.substring(0,2) !== './') config = `./${config}`;
    }
    else {
        config = './abacus-conf.json';
    }
    registerVariables(require(`${process.env.PWD}/${config}`), '');

    // If the user missed any required variables, supply the default variables
    registerVariables({
        "cucumber": {
            "feature_directory": "./features/",
            "page_object_directory":"./page_objects/",
            "step_definition_directory":"./step_definitions/",
            "hook_directory":"./hooks/",
            "inclusive_tags": [],
            "exclusive_tags": [],
            "step_timeout": "20",
            "redirect_timeout":"10"
        },
        "selenium": {
            "browser": "chrome",
            "browser_instances":"1"
        }
    },'');
};