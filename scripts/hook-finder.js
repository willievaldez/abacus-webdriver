const readDir = require('./directory-reader');

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

const gatherHooks = function () {

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
        readDir(process.env.CUCUMBER_HOOK_DIRECTORY, /^(.*)-hooks.js$/).then(function (hookFiles) {
            if (hookFiles.length === 0) res([]);
            let readFiles = 0;
            hookFiles.forEach((hookFilepath) => {
                const hooksToParse = require(`${process.env.PWD}/${hookFilepath}`);
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