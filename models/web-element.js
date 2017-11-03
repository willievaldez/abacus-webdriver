module.exports = function(locator){
  const myElement = {};
  myElement.locator = locator;

  myElement.click = function() {
    return driver.wait(until.elementLocated(myElement.locator), 5000, "Element not in DOM").then(function(){
      const elementToClick = driver.findElement(myElement.locator);
      driver.executeScript("arguments[0].scrollIntoView({block: 'center'})", elementToClick);
      return elementToClick.click();
    });
  };

  myElement.sendKeys = function(keys) {
    return driver.wait(until.elementLocated(myElement.locator), 5000, "Element not in DOM").then(function(){
      const elementToClick = driver.findElement(myElement.locator);
      driver.executeScript("arguments[0].scrollIntoView({block: 'center'})", elementToClick);
      return elementToClick.sendKeys(keys);
    });
  };

  myElement.clear = function() {
    return driver.wait(until.elementLocated(myElement.locator), 5000, "Element not in DOM").then(function(){
      const elementToClick = driver.findElement(myElement.locator);
      driver.executeScript("arguments[0].scrollIntoView({block: 'center'})", elementToClick);
      return elementToClick.clear();
    });
  };

  myElement.findElements = function(byLocator) {
    return driver.wait(until.elementLocated(myElement.locator), 5000, "Element not in DOM").then(function(){
      const parentElement = driver.findElement(myElement.locator);
      return parentElement.findElements(byLocator);
    });
  };

  myElement.findElement = function(byLocator) {
    return driver.wait(until.elementLocated(myElement.locator), 5000, "Element not in DOM").then(function(){
      const parentElement = driver.findElement(myElement.locator);
      return parentElement.findElement(byLocator);
    });
  };

  myElement.getText = function() {
    return driver.wait(until.elementLocated(myElement.locator), 5000, "Element not in DOM").then(function(){
      const elementToRead = driver.findElement(myElement.locator);
      return driver.wait(until.elementIsVisible(elementToRead)).then(function() {
        return elementToRead.getText();
      });
    });
  };

  return myElement;
};
