module.exports = ({Given, When, Then}) => {

    // Given(/^user goes to "([^"]*)" page$/, { timeout: 1000 * 1000 }, (pageURI, next) => {
    //   let url = pageURI;
    //   if (pageURI === 'home') url = '';
    //   basePage.goTo(url).then(next);
    // });

    Given(/^user clicks on the "(.*)" button$/, (buttonText, next) => {
        const buttonID = buttonText.replace(/ /g, '_').toUpperCase();
        pageMap[global.pageID][buttonID].click().then(next);
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

        pageMap[global.pageID][fieldID].clear();
        pageMap[global.pageID][fieldID].sendKeys(text).then(next);
    });

    When(/^user selects "(.*)" from the "(.*)" drop down$/, (text, buttonText, next) => {
        const buttonID = buttonText.replace(/ /g, '_').toUpperCase();
        pageMap[global.pageID][buttonID].sendKeys(text).then(next);
        // element(by.xpath(`//option[normalize-space()="${text}"]`)).click().then(next);
    });


    When(/^user enters values into the following fields$/, (table, next) => {
        const hash = table.rowsHash();
        const keys = Object.keys(hash);
        let valuesEntered = 0;
        for (let i = 0; i < keys.length; i++) {
            const fieldID = keys[i].replace(/ /g, '_').toUpperCase();
            try {
                pageMap[global.pageID][fieldID].clear();
                pageMap[global.pageID][fieldID].sendKeys(hash[keys[i]]).then((result) => {
                    if (result) {
                        // console.log(`\x1b[31m\t${keys[i]} -> ${hash[keys[i]]} \x1b[0m`);
                        return next(result);
                    }
                    driver.actions().sendKeys(webdriver.Key.TAB).perform().then((result) => {
                        valuesEntered++;
                        // console.log(`\x1b[32m\t${keys[i]} -> ${hash[keys[i]]} \x1b[0m`);
                        if (valuesEntered === keys.length) next();
                    });
                });
            }
            catch(err) {
                throw new Error(`Error sending keys to the ${fieldID} element of ${global.pageID}`);
            }

        }
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
