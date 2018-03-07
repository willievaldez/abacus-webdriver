let uniqueID = 0;
let openRequests = 0;
let resolve = null;
function callWDFunction(func, params=[]) {
  uniqueID++;
  openRequests++;
  const callID = uniqueID;
  const wdCall = {
    func,
    params
  };
  process.send(`WD: ${process.pid}${callID} - ${JSON.stringify(wdCall)}`);
  return new Promise((resolve, reject) => {
    const listener = (m) => {
      if (/WD: (\d+) - (.*)/.test(m)) {
        const regexResults = m.match(/WD: (\d+) - (.*)/);
        uniqueId = regexResults[1];
        if (uniqueId === `${process.pid}${callID}`) {
          console.log('SR WD MESSAGE RECEIVED', m);
          process.removeListener('message', listener);
          resolve(regexResults[2]);
          openRequests--;
          if (openRequests === 0 && resolve) {
            resolve();
          }
        }
      }


    };
    process.on('message', listener);

  });
}

const driver = {
  get: function(url) {
    return callWDFunction('get', [url]);
  },
  getCurrentUrl: function() {
    return callWDFunction('getCurrentUrl');
  },
  wait: function(func, timeoutInterval, err=new Error(`wait time out`)) {
    console.log(`timeout interval ${timeoutInterval}`);
    return new Promise((resolve, reject) => {
      let shouldContinue = true;
      const callback = function(){
        shouldContinue = false;
        reject(err);
      }
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

  },
  getOpenRequests: function() {
    console.log('getting open selenium requests...');
    return new Promise((res, rej) => {
      if (openRequests === 0) res();
      else resolve = res;
    });
  },
  sleep: function(timeoutInterval) {
    return new Promise((res, rej) => {
      const timeout = setTimeout(res, timeoutInterval);
    });
  }
};

module.exports = {
  driver
};


