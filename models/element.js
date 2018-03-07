let uniqueID = 0;
let openRequests = 0;
let resolve = null;

const getOpenRequests = function() {
  console.log('getting open element requests');
  return new Promise((res, rej) => {
    if (openRequests === 0) res();
    else resolve = res;
  });
}

const element = function(el) {
  const element = {};
  element.locator = el;

  function callWDElementFunction(func, params=[]) {
    uniqueID++;
    openRequests++;
    const callID = uniqueID;
    const wdCall = {
      element: el,
      func,
      params
    };
    process.send(`WDE: ${process.pid}${callID} - ${JSON.stringify(wdCall)}`);
    return new Promise((resolve, reject) => {
      const listener = (m) => {
        if (/WDE: (\d+) - (.*)/.test(m)) {
          const regexResults = m.match(/WDE: (\d+) - (.*)/);
          uniqueId = regexResults[1];
          if (uniqueId === `${process.pid}${callID}`) {
            console.log('SR WDE MESSAGE RECEIVED', m);
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

  element.click = function () {
    return callWDElementFunction('click');
  };

  element.sendKeys = function (keys) {
    return callWDElementFunction('sendKeys', [keys]);
  };

  element.clear = function () {
    return callWDElementFunction('clear');
  };

  // // // // // These functions expose the user to raw webdriver, which can lead to complete execution failure
  // element.findElements = function (byLocator) {
  //   return callWDElementFunction('findElements', byLocator);
  // };
  //
  // element.findElement = function (byLocator) {
  //   return callWDElementFunction('findElement', byLocator);
  // };
  // // // // //

  element.getText = function () {
    return callWDElementFunction('getText').then(function (gottenText) {
      return gottenText.trim();
    });
  };

  element.getAttribute = function (attr) {
    return callWDElementFunction('getAttribute', [attr]);
  };

  element.isDisplayed = function () {
    return callWDElementFunction('isDisplayed');
  };

  return element;
};

const by = {
  css: function(locator) {
    return {
      by: "css",
      locator
    }
  },

  xpath: function(locator) {
    return {
      by: "xpath",
      locator
    }
  },

  name: function(locator) {
    return {
      by: "name",
      locator
    }
  },

  id: function(locator) {
    return {
      by: "id",
      locator
    }
  }
};

module.exports = {element, by, getOpenRequests};
