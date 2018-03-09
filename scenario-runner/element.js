const Driver = require('./selenium');

const element = function(el) {
  const element = {};
  element.locator = el;

  element.click = function () {
    return Driver.callWDFunction('WDE', 'click', [el]);
  };

  element.sendKeys = function (keys) {
    return Driver.callWDFunction('WDE', 'sendKeys', [el, keys]);
  };

  element.clear = function () {
    return Driver.callWDFunction('WDE', 'clear', [el]);
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
    return Driver.callWDFunction('WDE', 'getText', [el]).then(function (gottenText) {
      return gottenText.trim();
    });
  };

  element.getAttribute = function (attr) {
    return Driver.callWDFunction('WDE', 'getAttribute', [el, attr]);
  };

  element.isDisplayed = function () {
    return Driver.callWDFunction('WDE', 'isDisplayed', [el]);
  };

  element.waitUntil = {
    text: {
      is: function(text) {
        return Driver.callWDFunction('WDE', 'waitUntil', [el, 'text', 'Is', text])
      },
      matches: function(regex) {
        return Driver.callWDFunction('WDE', 'waitUntil', [el, 'text', 'Matches', regex])
      },
      contains: function(text) {
        return Driver.callWDFunction('WDE', 'waitUntil', [el, 'text', 'Contains', text])
      }
    },
    value: {
      is: function(text) {
        return Driver.callWDFunction('WDE', 'waitUntil', [el, 'value', 'Is', text])
      },
      matches: function(regex) {
        return Driver.callWDFunction('WDE', 'waitUntil', [el, 'value', 'Matches', regex])
      },
      contains: function(text) {
        return Driver.callWDFunction('WDE', 'waitUntil', [el, 'value', 'Contains', text])
      }
    }
  }

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

module.exports = {element, by};
