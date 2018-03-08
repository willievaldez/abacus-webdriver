require('chromedriver');
//// Declaration of global variables
const webdriver = require('selenium-webdriver');
const by = require('selenium-webdriver').By;
const until = require('selenium-webdriver').until;

class SeleniumDriver {
  constructor() {
    this.driver = new webdriver.Builder().withCapabilities(SeleniumDriver.makeCapabilities()).build();
    if (process.env.SELENIUM_WIDTH && process.env.SELENIUM_HEIGHT)
      this.driver.manage().window().setSize(parseInt(process.env.SELENIUM_WIDTH), parseInt(process.env.SELENIUM_HEIGHT));
  }

  static makeCapabilities() {
    const desiredCapabilities = {
      'browserName': process.env.SELENIUM_BROWSER
    };

    if (process.env.SELENIUM_SAUCELABS === 'true') {
      desiredCapabilities.username = process.env.SAUCELABS_USERNAME;
      desiredCapabilities.accessKey = process.env.SAUCELABS_ACCESSKEY;
      if (process.env.SAUCELABS_PLATFORM) desiredCapabilities.platform = process.env.SAUCELABS_PLATFORM;
      if (process.env.SAUCELABS_SCREEN_RESOLUTION) desiredCapabilities.screenResolution = process.env.SAUCELABS_SCREEN_RESOLUTION;
      if (process.env.SAUCELABS_MAX_DURATION) desiredCapabilities.maxDuration = process.env.SAUCELABS_MAX_DURATION;
      desiredCapabilities.name = process.pid;
      process.env.SELENIUM_REMOTE_URL = `http://${process.env.SAUCELABS_USERNAME}:${process.env.SAUCELABS_ACCESSKEY}@ondemand.saucelabs.com:80/wd/hub`;
    }
    return desiredCapabilities;
  }


  static jsonError(err) {
    if (!err) return 'END: ';
    return `END: ${JSON.stringify({
      stack: err.stack,
      message: err.message
    })}`;
  }

  interpret(m,childDriver) {
    if (/WD: (\d+) - (.*)/.test(m)) {
      const regexResults = m.match(/WD: (\d+) - (.*)/);
      const uniqueId = regexResults[1];
      console.log('WD MESSAGE RECEIVED', m);

      this.callWDFunction(regexResults[2]).then((result) => {
        if (childDriver) childDriver.send(`WD: ${uniqueId} - ${result}`);
      }).catch((err) => {
        if (childDriver) childDriver.send(SeleniumDriver.jsonError(err));
      });
    }
    else if (/WDE: (\d+) - (.*)/.test(m)) {
      const regexResults = m.match(/WDE: (\d+) - (.*)/);
      const uniqueId = regexResults[1];
      console.log('WDE MESSAGE RECEIVED', m);

      this.callWDElementFunction(regexResults[2]).then((result) => {
        if (childDriver) childDriver.send(`WDE: ${uniqueId} - ${result}`);
      }).catch((err) => {
        if (childDriver) childDriver.send(SeleniumDriver.jsonError(err));
      });
    }
  }

  callWDFunction(commandString) {
    const command = JSON.parse(commandString);
    return this.driver[command.func].apply(this.driver, command.params);
  }

  callWDElementFunction(commandString) {
    const command = JSON.parse(commandString);
    const element = webElement(command.element, this.driver);
    return element[command.func].apply(element, command.params);
  }

  quit() {
    return this.driver.quit();
  }

  screenshot() {
    return this.driver.takeScreenshot();
  }
}

const webElement = function (elementJSON, driver) {
  const element = {};
  element.locator = by[elementJSON.by](elementJSON.locator);

  async function elementFunction(name, arg) {
    console.log(name);
    await driver.wait(until.elementLocated(element.locator), 5000, `Element ${element.locator} not in DOM`);

    const wdElement = driver.findElement(element.locator);
    driver.executeScript("arguments[0].scrollIntoView(false)", wdElement);
    await driver.wait(until.elementIsVisible(wdElement), 5000, `Element ${element.locator} not visible`)
    try {
      if (arg) {
        if (arg === 'ES') return driver.executeScript(`arguments[0].${name}()`, wdElement);
        else return wdElement[name](arg);
      }
      else return wdElement[name]();
    }
    catch(err) {
      if (err.name === "StaleElementReferenceError") {
        await driver.wait(until.elementLocated(element.locator), 5000, `Element ${element.locator} not in DOM`)
      }
      return err;
    }
  }

  element.click = function () {
    return elementFunction('click');
  };

  element.sendKeys = function (keys) {
    return elementFunction('sendKeys', keys);
  };

  element.clear = function () {
    return elementFunction('clear');
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
    return elementFunction('getText').then(function (gottenText) {
      return gottenText.trim();
    });
  };

  element.getAttribute = function (attr) {
    return elementFunction('getAttribute', attr);
  };

  element.isDisplayed = function () {
    return elementFunction('isDisplayed');
  };

  element.waitUntil = async function (keyValue, matchType, expected) {
    let wdElement = driver.findElement(element.locator);
    if (keyValue === "value") {
      const value = await wdElement.getAttribute(keyValue);
      wdElement = driver.findElement(by.css(`option[value="${value}"]`));
    }
    return driver.wait(
      until[`elementText${matchType}`](wdElement, expected),
      5000,
      new Error(`timeout waiting until ${keyValue} ${matchType.toLowerCase()} "${expected}"`)
    );
  };

  return element;
};


module.exports = SeleniumDriver;
