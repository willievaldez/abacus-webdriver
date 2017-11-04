const readDir = require(`${__dirname}/scripts`).readDirectory;

const hooks = {
    init: [],
    beforeall: [],
    beforeeach: [],
    aftereach: [],
    afterall: [],
    shutdown: []
};


const runHooks = function(hookType, callback) {
    let hookNum = 0;
    let hookArray = hooks[hookType.toLowerCase()];
    
    const runHook = function() {
        if(hookNum === hookArray.length) return callback();
        const hook = hookArray[hookNum];
        hookNum++;
        return hook(runHook);
    };

    runHook();
};

const gatherHooks = function (dir) {


    const supportCode = {
        Init: function (hook) {
            hooks.init.push(hook);
        },
        BeforeAll: function (hook) {
            hooks.beforeall.push(hook);
        },
        BeforeEach: function (hook) {
            hooks.beforeeach.push(hook);
        },
        AfterEach: function (hook) {
            hooks.aftereach.push(hook);
        },
        AfterAll: function (hook) {
            hooks.afterall.push(hook);
        },
        Shutdown: function(hook) {
            hooks.shutdown.push(hook);
        }
    };

    return new Promise((res, rej) => {
        readDir(dir, /^(.*)-hooks.js$/).then(function (hookFiles) {
            if (hookFiles.length === 0) res([]);
            let readFiles = 0;
            hookFiles.forEach((hookFilepath) => {
                const hooksToParse = require("../../." + hookFilepath);
                hooksToParse(supportCode);
                readFiles++;
                if (readFiles === hookFiles.length) {
                    res(hooks);
                }
            });
        });
    });

};

module.exports = {gatherHooks, runHooks};