class Driver {
  constructor() {
    Driver.uniqueID = 0;
    Driver.openRequests = 0;
    Driver.resolveOpenRequests = null;
  }

  static callWDFunction(scope, func, params=[]) {
    Driver.uniqueID++;
    Driver.openRequests++;
    const callID = Driver.uniqueID;
    const wdCall = {
      func,
      params
    };
    process.send(`${scope}: ${process.pid}${callID} - ${JSON.stringify(wdCall)}`);
    return new Promise((resolve, reject) => {
      const listener = (m) => {
        if (/(\d+) - (.*)/.test(m)) {
          const regexResults = m.match(/(\d+) - (.*)/);
          if (regexResults[1] === `${process.pid}${callID}`) {
            // console.log(`SR ${scope} MESSAGE RECEIVED`, m);
            process.removeListener('message', listener);
            resolve(regexResults[2]);
            Driver.openRequests--;
            if (Driver.openRequests === 0 && Driver.resolveOpenRequests) {
              Driver.resolveOpenRequests();
            }
          }
        }
      };
      process.on('message', listener);

    });
  }

  get(url) {
    return Driver.callWDFunction('WD', 'get', [url]);
  }

  getCurrentUrl() {
    return Driver.callWDFunction('WD', 'getCurrentUrl');
  }

  wait(func, timeoutInterval, err=new Error(`wait time out`)) {
    return new Promise((resolve, reject) => {
      let shouldContinue = true;
      const callback = function(){
        shouldContinue = false;
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
        })
      };
      callFunc();
    });

  }

  static getOpenRequests() {
    return new Promise((res, rej) => {
      if (Driver.openRequests === 0) res();
      else Driver.resolveOpenRequests = res;
    });
  }

  sleep(timeoutInterval) {
    return new Promise((res, rej) => {
      setTimeout(res, timeoutInterval);
    });
  }
}

module.exports = Driver;


