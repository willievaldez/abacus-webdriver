const fs = require('fs');
const {SharedObject} = require('abacus-webdriver');
require('chromedriver');

const webdriver = require('selenium-webdriver');
const by = require('selenium-webdriver').By;
const until = require('selenium-webdriver').until;

class WebdriverSharedObject extends SharedObject {
  constructor() {
    super('webdriver');
    this.driver = new webdriver.Builder().withCapabilities(WebdriverSharedObject.makeCapabilities()).build();
    if (process.env.SELENIUM_WIDTH && process.env.SELENIUM_HEIGHT)
      this.driver.manage().window().setSize(parseInt(process.env.SELENIUM_WIDTH), parseInt(process.env.SELENIUM_HEIGHT));
    else this.driver.manage().window().maximize();
  }

  static async init() {
    const webdriverSharedObject = new WebdriverSharedObject();
    return webdriverSharedObject;
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

  get([url]) {
    return this.driver.get(url);
  }

  getCurrentUrl() {
    return this.driver.getCurrentUrl();
  }

  async until([func, args]) {
    if (func === "urlMatches") {
      return this.driver.wait(until.urlMatches(new RegExp(args[0])));
    }
    else if (func.indexOf('element') >= 0) {
      const elementLocator = args[0];
      const expectedText = args[1];
      const locator = by[elementLocator.by](elementLocator.locator);
      try {
        await this.driver.wait(until.elementLocated(locator), 5000, `Element ${locator} not in DOM`);
        const el = this.driver.findElement(locator);
        await this.driver.wait(until[func](el, expectedText));
        return true;
      }
      catch(err) {
        console.log('caught the error');
        return err;
      }
    }
    return this.driver.wait(until[func].apply(args));
  }

  takeScreenshot() {
    return this.driver.takeScreenshot();
  }

  quit() {
    return this.driver.quit();
  }

  sleep([timeoutInterval]) {
    return new Promise((res, rej) => {
      setTimeout(res, timeoutInterval);
    });
  }

}

module.exports = WebdriverSharedObject;
