const fs = require('fs');
const {SharedObject} = require('abacus-webdriver');
const by = require('selenium-webdriver').By;
const until = require('selenium-webdriver').until;

class ElementSharedObject extends SharedObject {
  constructor() {
    super('element');
  }

  async elementFunction(jsonLocator, name, arg=null) {
    const locator = by[jsonLocator.by](jsonLocator.locator);
    try {
      await this.driver.wait(until.elementLocated(locator), 5000, `Element ${locator} not in DOM`);

      const wdElement = this.driver.findElement(locator);
      this.driver.executeScript("arguments[0].scrollIntoView(false)", wdElement);
      await this.driver.wait(until.elementIsVisible(wdElement), 5000, `Element ${locator} not visible`);
      if (arg) {
        if (arg === 'ES') return this.driver.executeScript(`arguments[0].${name}()`, wdElement);
        else return wdElement[name](arg);
      }
      else return wdElement[name]();
    }
    catch(err) {
      if (err.name === "StaleElementReferenceError") {
        return this.driver.wait(until.elementLocated(locator), 5000, `Element ${locator} not in DOM`);
      }
      return err;
    }
  }

  click([locator]) {
    return this.elementFunction(locator, 'click');
  };

  sendKeys([keys, locator]) {
    return this.elementFunction(locator, 'sendKeys', keys);
  };

  clear([locator]) {
    return this.elementFunction(locator, 'clear');
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

  getText([locator]) {
    return this.elementFunction(locator, 'getText').then(function (gottenText) {
      return gottenText.trim();
    });
  };

  getAttribute([attr, locator]) {
    return this.elementFunction(locator, 'getAttribute', attr);
  };

  isDisplayed([locator]) {
    return this.elementFunction(locator, 'isDisplayed');
  };

  async waitUntil([keyValue, matchType, expected, locator]) {
    let wdElement = this.driver.findElement(locator);
    if (keyValue === "value") {
      const value = await wdElement.getAttribute(keyValue);
      wdElement = this.driver.findElement(by.css(`option[value="${value}"]`));
    }
    return this.driver.wait(
      until[`elementText${matchType}`](wdElement, expected),
      5000,
      `timeout waiting until ${keyValue} ${matchType.toLowerCase()} "${expected}"`
    );
  };

}

module.exports = ElementSharedObject;
