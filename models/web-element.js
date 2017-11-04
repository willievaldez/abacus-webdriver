module.exports = function(locator){
  const myElement = {};
  myElement.locator = locator;

  myElement.click = function() {
    return driver.wait(until.elementLocated(myElement.locator), 5000, "Element not in DOM")
      .then(function(){
        const elementToClick = driver.findElement(myElement.locator);
        driver.executeScript("arguments[0].scrollIntoView({block: 'center'})", elementToClick);
        return elementToClick.click();
      })
      .catch(function(err){
        return err;
      });
  };

  myElement.sendKeys = function(keys) {
    return driver.wait(until.elementLocated(myElement.locator), 5000, "Element not in DOM")
      .then(function(){
        const elementToClick = driver.findElement(myElement.locator);
        driver.executeScript("arguments[0].scrollIntoView({block: 'center'})", elementToClick);
        return elementToClick.sendKeys(keys);
      })
      .catch(function(err){
        return err;
      });
  };

  myElement.clear = function() {
    return driver.wait(until.elementLocated(myElement.locator), 5000, "Element not in DOM")
      .then(function(){
        const elementToClick = driver.findElement(myElement.locator);
        driver.executeScript("arguments[0].scrollIntoView({block: 'center'})", elementToClick);
        return elementToClick.clear();
      })
      .catch(function(err){
        return err;
      });
  };

  myElement.findElements = function(byLocator) {
    return driver.wait(until.elementLocated(myElement.locator), 5000, "Element not in DOM")
      .then(function(){
        const parentElement = driver.findElement(myElement.locator);
        return parentElement.findElements(byLocator);
      })
      .catch(function(err){
        return err;
      });
  };

  myElement.findElement = function(byLocator) {
    return driver.wait(until.elementLocated(myElement.locator), 5000, "Element not in DOM")
      .then(function(){
        const parentElement = driver.findElement(myElement.locator);
        return parentElement.findElement(byLocator);
      })
      .catch(function(err){
        return err;
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
