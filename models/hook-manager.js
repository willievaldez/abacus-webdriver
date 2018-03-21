const readDir = require('../scripts/directory-reader');

class HookManager {
  constructor() {
    this.init = [];
    this.beforeall = [];
    this.beforeeach = [];
    this.aftereach = [];
    this.afterall = [];
    this.shutdown = [];
  }

  static async init() {
    const hookManagerInstance = new HookManager();
    const supportCode = {
      Init: function (hook) {
        hookManagerInstance.init.push(hook);
      },
      BeforeAll: function (hook) {
        hookManagerInstance.beforeall.push(hook);
      },
      BeforeEach: function (hook) {
        hookManagerInstance.beforeeach.push(hook);
      },
      AfterEach: function (hook) {
        hookManagerInstance.aftereach.push(hook);
      },
      AfterAll: function (hook) {
        hookManagerInstance.afterall.push(hook);
      },
      Shutdown: function (hook) {
        hookManagerInstance.shutdown.push(hook);
      }
    };

    const hookFiles = readDir(process.env.CUCUMBER_HOOK_DIRECTORY, /^(.*)-hooks.js$/);
    for (let i = 0; i < hookFiles.length; i++) {
      const hooksToParse = require(`${process.env.PWD}/${hookFiles[i]}`);
      hooksToParse(supportCode);
    }

    return hookManagerInstance;
  }

  runHooks(hookType) {
    let hookNum = 0;
    let hookArray = this[hookType.toLowerCase()];

    return new Promise((resolve, reject) => {
      const runHook = function (err) {
        if (err) reject(err);
        if (hookNum === hookArray.length) return resolve();
        const hook = hookArray[hookNum];
        hookNum++;
        try {
          hook(runHook);
        }
        catch(err) {
          runHook(new Error(`error running ${hookType} hook: ${err.message}`));
        }
      };

      runHook();
    });

  };

}

module.exports = HookManager;
