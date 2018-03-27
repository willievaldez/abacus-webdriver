const by = require('selenium-webdriver').By;
const until = require('selenium-webdriver').until;
class Element {
  constructor(elementJSON) {
    this.locator = by[elementJSON.by](elementJSON.locator);
  }

  async elementFunction(name, arg) {
    try {
      await Element.driver.wait(until.elementLocated(this.locator), 5000, `Element ${this.locator} not in DOM`);

      const wdElement = Element.driver.findElement(this.locator);
      Element.driver.executeScript("arguments[0].scrollIntoView(false)", wdElement);
      await Element.driver.wait(until.elementIsVisible(wdElement), 5000, `Element ${this.locator} not visible`);
      if (arg) {
        if (arg === 'ES') return Element.driver.executeScript(`arguments[0].${name}()`, wdElement);
        else return wdElement[name](arg);
      }
      else return wdElement[name]();
    }
    catch(err) {
      if (err.name === "StaleElementReferenceError") {
        return Element.driver.wait(until.elementLocated(this.locator), 5000, `Element ${this.locator} not in DOM`);
      }
      return err;
    }
  }

  click() {
    return this.elementFunction('click');
  };

  sendKeys(keys) {
    return this.elementFunction('sendKeys', keys);
  };

  clear() {
    return this.elementFunction('clear');
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

  getText() {
    return this.elementFunction('getText').then(function (gottenText) {
      return gottenText.trim();
    });
  };

  getAttribute(attr) {
    return this.elementFunction('getAttribute', attr);
  };

  isDisplayed() {
    return this.elementFunction('isDisplayed');
  };

  async waitUntil(keyValue, matchType, expected) {
    let wdElement = Element.driver.findElement(this.locator);
    if (keyValue === "value") {
      const value = await wdElement.getAttribute(keyValue);
      wdElement = Element.driver.findElement(by.css(`option[value="${value}"]`));
    }
    return Element.driver.wait(
      until[`elementText${matchType}`](wdElement, expected),
      5000,
      `timeout waiting until ${keyValue} ${matchType.toLowerCase()} "${expected}"`
    );
  };
}

module.exports = Element;
