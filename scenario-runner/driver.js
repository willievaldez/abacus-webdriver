const execute = require('./shared-objects').execute;

function wait(func, timeoutInterval, err=`wait time out`) {
  return new Promise((resolve, reject) => {
    let shouldContinue = true;
    const callback = function() {
      shouldContinue = false;
      if (!(err instanceof Error)) err = new Error(err);
      reject(err);
    };
    const timeout = setTimeout(callback, timeoutInterval);

    const callFunc = function() {
      func().then((result) => {
        if (result) {
          clearTimeout(timeout);
          resolve();
        }
        else if (shouldContinue) callFunc();
      }).catch((err) => {
        clearTimeout(timeout);
        reject(err);
      });
    };
    callFunc();
  });
}

const untilHandler = {
  get: function(obj, prop) {
    return function() {
      const args = [];
      for (arg of arguments) {
        args.push(arg);
      }
      return function() {
        return execute('webdriver', 'until', [prop, args]);
      }
    }
  }
};

const handler = {
  get: function(obj, prop) {
    if (prop === 'Key') return require('selenium-webdriver').Key;
    if (prop === 'until') return new Proxy({}, untilHandler);
    if (prop === 'wait') {
      return function() {
        const args = [];
        for (arg of arguments) {
          args.push(arg);
        }
        return wait.apply(null, args);
      }
    }
    return function() {
      const args = [];
      for (arg of arguments) {
        args.push(arg);
      }
      return execute('webdriver', prop, args);
    }
  },
  set: function(obj, prop, val) {
    console.log('set');
    return true;
  },
  apply: function(target, thisArg, argList) {
    console.log('apply');
    return true;
  }
};

module.exports = new Proxy({}, handler);
