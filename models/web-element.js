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

  return myElement;
};
