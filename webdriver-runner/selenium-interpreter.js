require('chromedriver');
//// Declaration of global variables
const webdriver = require('selenium-webdriver');
const until = require('selenium-webdriver').until;
const Element = require('./element-interpreter');

class SeleniumDriver {
  constructor() {
    this.driver = new webdriver.Builder().withCapabilities(SeleniumDriver.makeCapabilities()).build();
    if (process.env.SELENIUM_WIDTH && process.env.SELENIUM_HEIGHT)
      this.driver.manage().window().setSize(parseInt(process.env.SELENIUM_WIDTH), parseInt(process.env.SELENIUM_HEIGHT));

    Element.driver = this.driver;
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
        console.log(`sending WD: ${uniqueId} - ${result}`);
        if (childDriver.connected) childDriver.send(`${uniqueId} - ${result}`);
      }).catch((err) => {
        if (childDriver.connected) childDriver.send(SeleniumDriver.jsonError(err));
      });
    }
    else if (/WDE: (\d+) - (.*)/.test(m)) {
      const regexResults = m.match(/WDE: (\d+) - (.*)/);
      const uniqueId = regexResults[1];
      console.log('WDE MESSAGE RECEIVED', m);

      this.callWDElementFunction(regexResults[2]).then((result) => {
        console.log(`sending WDE: ${uniqueId} - ${result}`);
        if (childDriver.connected) childDriver.send(`${uniqueId} - ${result}`);
      }).catch((err) => {
        if (childDriver.connected) childDriver.send(SeleniumDriver.jsonError(err));
      });
    }
    else if (/UNTIL: (\d+) - (.*)/.test(m)) {
      const regexResults = m.match(/UNTIL: (\d+) - (.*)/);
      const uniqueId = regexResults[1];
      console.log('UNTIL MESSAGE RECEIVED', m);

      this.waitUntil(regexResults[2]).then((result) => {
        console.log(`sending UNTIL: ${uniqueId} - ${result}`);
        if (childDriver.connected) childDriver.send(`${uniqueId} - ${result}`);
      }).catch((err) => {
        if (childDriver.connected) childDriver.send(SeleniumDriver.jsonError(err));
      });
    }
  }

  callWDFunction(commandString) {
    const command = JSON.parse(commandString);
    return this.driver[command.func].apply(this.driver, command.params);
  }

  callWDElementFunction(commandString) {
    const command = JSON.parse(commandString);
    const element = new Element(command.params[0]);
    command.params.splice(0,1);
    return element[command.func].apply(element, command.params);
  }

  quit() {
    return this.driver.quit();
  }

  screenshot() {
    return this.driver.takeScreenshot();
  }

  waitUntil(commandString) {
    const command = JSON.parse(commandString);
    if (command.func === "urlMatches") {
      return this.driver.wait(until.urlMatches(new RegExp(command.params[0])));
    }
    return this.driver.wait(until[command.func].apply(command.params));
  }
}

module.exports = SeleniumDriver;
