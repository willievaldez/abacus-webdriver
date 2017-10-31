module.exports = ({ Given, When, Then }) => {

  // Given(/^user goes to "([^"]*)" page$/, { timeout: 1000 * 1000 }, (pageURI, next) => {
  //   let url = pageURI;
  //   if (pageURI === 'home') url = '';
  //   basePage.goTo(url).then(next);
  // });

  Given(/^user clicks on the "(.*)" button$/, (buttonText, next) => {
    const buttonID = buttonText.replace(/ /g, '_').toUpperCase();
    driver.wait(until.elementLocated(pageMap[global.pageID][buttonID]), 10000, 'Element taking too long to appear in the DOM').then(() => {
      const elementToClick = driver.findElement(pageMap[global.pageID][buttonID]);
      driver.executeScript("arguments[0].scrollIntoView()", elementToClick);
      elementToClick.click().then(next);

    });
  });

  // // Generic click on item of a list, this step can be used along the site
  // When(/^user clicks on "([^"]*)" number "([^"]*)"$/, (buttonsText, number, next) => {
  //   const buttonsID = buttonsText.replace(/ /g, '_').toUpperCase();
  //   const listOfButtons = pageMap[global.pageID][buttonsID];
  //   browser.wait(until.presenceOf(listOfButtons), 10000, 'Elements taking too long to appear in the DOM').then(() => {
  //     listOfButtons.get(Number(number) - 1).click().then(next);
  //   });
  // });
  //
  // // Generic click button by text, this step can be used along the site
  // When(/^user clicks on the "([^"]*)" ([^"]*) by text$/, (text, elementText, next) => {
  //   const selector = element(by.xpath(`//${elementText}[normalize-space(text()) = "${text}"]`));
  //   browser.wait(until.elementToBeClickable(selector), 10000, 'Element taking too long to appear in the DOM').then((elem) => {
  //     elem.click().then(next);
  //   });
  // });

  When(/^user enters "(.*)" into the "(.*)" field$/, (text, textField, next) => {
    const fieldID = textField.replace(/ /g, '_').toUpperCase();

    let expectedString = text;

    // TODO: Implement localstorage and random generation
    // if (text.match(/(?:\*)/)) expectedString = localStorage.getItem(text.match(/\*([^*]*)\*/)[1]);
    /* else */if (text.match(/(?:#)/)) {
      expectedString = process.env[text.match(/#([^#]*)#/)[1]];
    } // else if (text.match(/(?:%)/)) {
    //   const generator = text.match(/%([^%]*)%/)[1];
    //   if (generator.match(/between([0-9]{2})and([0-9]{2})/)) {
    //     const min = generator.match(/between([0-9]{2})and([0-9]{2})/)[1];
    //     const max = generator.match(/between([0-9]{2})and([0-9]{2})/)[2];
    //     expectedString = generatedValues.randomBirthdayWithinRange(min, max);
    //   }        else          { expectedString = generatedValues[generator](); }
    // }

    driver.findElement(pageMap[global.pageID][fieldID]).clear();
    driver.findElement(pageMap[global.pageID][fieldID]).sendKeys(expectedString).then(next);
  });

  When(/^user selects "(.*)" from the "(.*)" drop down$/, (text, buttonText, next) => {
    const buttonID = buttonText.replace(/ /g, '_').toUpperCase();
    driver.findElement(pageMap[global.pageID][buttonID]).click().then(() => {
      driver.findElement(pageMap[global.pageID][buttonID]).findElements(By.xpath(`*[normalize-space(text()) = "${text}" and not(contains(@style,'display') and contains(@style,'none'))]`)).then((elements)=>{
        const toClick = elements[elements.length - 1];
        toClick.click().then(next);
      });
    });
  });

  When(/^user presses the (.*) key/, (key, next) => {
    expect(driver.actions().sendKeys(webdriver.Key[key]).perform()).to.eventually.be.ok.and.notify(next);
  });

  Then(/^user waits for ([0-9]+) seconds$/, (num, next) => {
    driver.sleep(num * 1000).then(next);
  });
  //
  // Then(/^user waits for "([^"]*)" element to be present$/, { timeout: 2 * 60 * 1000 }, (elementText, next) => {
  //   const elementID = elementText.replace(/ /g, '_').toUpperCase();
  //   browser.wait(until.presenceOf(pageMap[global.pageID][elementID])).then(next);
  // });
  //
  // Given(/^browser size is set to ([^"]*)x([^"]*)$/, (x, y) => {
  //   browser.manage().window().setSize(x, y);
  // });
  //
  // /**
  //  * Switch Selenium context to last browser tab
  //  */
  // Given(/^user switches to the last tab$/, (callback) => {
  //   browser.driver.getAllWindowHandles().then((handles) => {
  //     return browser.driver.switchTo().window(handles[handles.length - 1]);
  //   }).then(() => {
  //     return browser.driver.executeScript('window.focus();');
  //   })
  //     .then(callback);
  // });
  //
  // /**
  //  * Switch Selenium context to first browser tab
  //  */
  // Given(/^user switches to the first tab$/, (callback) => {
  //   browser.driver.getAllWindowHandles().then((handles) => {
  //     return browser.driver.switchTo().window(handles[0]);
  //   }).then(() => {
  //     return browser.driver.executeScript('window.focus();');
  //   })
  //     .then(callback);
  // });
  //
  // When(/^user closes the current tab$/, (next) => {
  //   browser.driver.close();
  //   browser.driver.getAllWindowHandles().then((handles) => {
  //     browser.driver.switchTo().window(handles[0]).then(next);
  //   });
  // });
  //
  // When(/^user refreshes the window$/, (next) => {
  //   browser.driver.navigate().refresh();
  //   browser.sleep(1500).then(next);
  // });
  //
  // When(/^browser is set to (non|)angular$/, (torf) => {
  //   if (torf === 'non') browser.ignoreSynchronization = true;
  //   else browser.ignoreSynchronization = false;
  // });
  //
  // When(/^user accepts confirmation dialog$/, (next) => {
  //   browser.switchTo().alert().then((alert) => {
  //     alert.accept().then(next);
  //   }, () => {
  //     console.log('Workaround: Handling alert exception');
  //   });
  // });
  //
  // When(/^user cancels confirmation dialog$/, (next) => {
  //   browser.switchTo().alert().then((alert) => {
  //     alert.dismiss().then(next);
  //   }, () => {
  //     console.log('Workaround: Handling alert exception');
  //   });
  // });

};
