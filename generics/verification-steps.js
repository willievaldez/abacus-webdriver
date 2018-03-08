module.exports = ({Then}) => {

    Then(/^user is taken to the "([^"]*)" page$/, async (pageURI) => {
        global.pageID = pageURI;

        if (!pageMap[global.pageID]) throw new Error(`Page Object with name ${pageURI} is not defined`);
        const result = await driver.wait(until.urlMatches(pageMap[global.pageID].URL), process.env.CUCUMBER_REDIRECT_TIMEOUT * 1000, `URL never matched ${pageMap[global.pageID].URL}`)
        if (result !== true) {
          return result;
        }

    });

    Then(/^the "([^"]*)" element (value|text) (is|contains|matches) "(.*)"$/, async (labelText, valOrText, matchType, text) => {
        const labelID = labelText.replace(/ /g, '_').toUpperCase();
        await pageMap[global.pageID][labelID].waitUntil[valOrText][matchType](text);
    });


    // Then(/^the "([^"]*)" element value does not contain "([^"]*)"$/, (buttonText, text, next) => {
    //   const buttonID = buttonText.replace(/ /g, '_').toUpperCase();
    //   browser.wait(pageMap[global.pageID][buttonID].isPresent()).then(() => {
    //     expect(pageMap[global.pageID][buttonID].getAttribute('value')).to.eventually.not.contain(text).and.notify(next);
    //   });
    // });
    //
    // Then(/^the "([^"]*)" element text does not contain "([^"]*)"$/, (labelText, text, next) => {
    //   const labelID = labelText.replace(/ /g, '_').toUpperCase();
    //
    //   let expectedString = text;
    //   if (text.match(/(?:\*)/)) expectedString = localStorage.getItem(text.match(/\*([^*]*)\*/)[1]).toUpperCase();
    //
    //   browser.wait(pageMap[global.pageID][labelID].isPresent()).then(() => {
    //     expect(pageMap[global.pageID][labelID].getText()).to.eventually.not.contain(expectedString)
    //       .and.notify(next);
    //   });
    //
    // });
    //
    // Then(/^"([^"]*)" element is greater than or equal to "([^"]*)" element$/, (ele1, ele2, next) => {
    //   const el1 = ele1.replace(/ /g, '_').toUpperCase();
    //   const el2 = ele2.replace(/ /g, '_').toUpperCase();
    //   const promise = pageMap[global.pageID].stringToNumber(pageMap[global.pageID][el1].getText());
    //   pageMap[global.pageID].stringToNumber(pageMap[global.pageID][el2].getText())
    //     .then((promiseText) => {
    //       expect(promise).to.eventually.be.at.least(promiseText).and.notify(next);
    //     });
    //
    // });


    Then(/^the "([^"]*)" drop down only contains the following options:$/, (el, table, next) => {
        const dropDownID = el.replace(/ /g, '_').toUpperCase();
        const select = pageMap[global.pageID][dropDownID];

        const optionsPromise = new Promise((res, rej) => {
            select.findElements(by.tagName('option')).then((selections) => {
                const optionsArray = [];
                selections.forEach((selection) => {
                    selection.getText().then((option) => {
                        optionsArray.push(option);
                        if (optionsArray.length === selections.length) res(optionsArray);
                    });
                });
            });
        });

        optionsPromise.then((options) => {
            const numRows = table.raw().length;
            let cont = true;
            table.raw().forEach((row, i) => {
                if (!cont) return;
                if (row[0] !== '') {
                    const ind = options.indexOf(row[0]);
                    if (ind === -1) {
                        cont = false;
                        return next(new Error(`${row[0]} is not an option`));
                    }
                    options.splice(ind, 1);
                }
                if (i === numRows - 1) {
                    if(options.length !== 1) next(new Error(`${options} are not options`));
                    else next();
                }
            });
        });

    });

    Then(/^the "([^"]*)" drop down is non-empty$/, (el, next) => {
        const dropDownID = el.replace(/ /g, '_').toUpperCase();
        const select = pageMap[global.pageID][dropDownID];

        const optionsPromise = new Promise((res, rej) => {
            select.findElements(by.tagName('option')).then((selections) => {
                const numSelections = selections.length;
                res(numSelections > 1);
            });
        });

        expect(optionsPromise).to.eventually.be.ok.and.notify(next);
    });

    // Then(/^the "([^"]*)" text field is non-empty$/, (buttonText, next) => {
    //   const buttonID = buttonText.replace(/ /g, '_').toUpperCase();
    //   browser.wait(pageMap[global.pageID][buttonID].isPresent()).then(() => {
    //     expect(pageMap[global.pageID][buttonID].getAttribute('value')).to.eventually.not.equal('').and.notify(next);
    //   });
    // });
    //
    // Then(/^the page (displays|does not display) "([^"]*)"$/, (torf, text, next) => {
    //   const testEl = element(by.xpath(`//*[text()="${text}"]`));
    //   testEl.isPresent().then((pres) => {
    //     if (pres) {
    //       expect(testEl.isDisplayed()).to.eventually.equal(torf === 'displays').and.notify(next);
    //     } else {
    //       expect(testEl.isPresent()).to.eventually.equal(torf === 'displays').and.notify(next);
    //     }
    //   });
    // });

    Then(/^the "([^"]*)" element (is|is not) present$/, (elementText, yorn, next) => {
        const elementID = elementText.replace(/ /g, '_').toUpperCase();

        driver.wait(pageMap[global.pageID][elementID].isDisplayed(), 5000)
          .catch((err) => {
              next(err);
          })
          .then((result) => {
              if (yorn === 'is not') {
                  if (result === true) next(new Error(`${elementID} Element is displayed`));
                  else next();
              }
              else {
                  if (result === true) next();
                  else {
                      next(new Error(`${elementID} Element is not displayed`));
                  }
              }
          });
    });

    // const validateImages = function (webTitle) {
    //   return new Promise((fulfill, reject) => {
    //     resemble('imgs/reference/' + webTitle + '.png')
    //               .compareTo('imgs/test/' + webTitle + '.png')
    //               .onComplete((data) => {
    //                 global.diff_urls.urls.push(data.getImageDataUrl());
    //                 if (data.misMatchPercentage > 0.0) {
    //                   fulfill(false);
    //                   return false;
    //                 }
    //
    //                 fulfill(true);
    //                 return true;
    //
    //               });
    //   });
    // };
    //
    // Given(/^"([^"]*)" element is visually validated$/, (el, next) => {
    //   const elementID = el.replace(/ /g, '_').toUpperCase();
    //
    //   basePage.elementScreenshot(pageMap[global.pageID][elementID], elementID).then(() => {
    //     expect(validateImages(elementID)).to.eventually.be.ok.and.notify(next);
    //   });
    // });
    //
    // Given(/^([^"]*) page is validated$/, (el, next) => {
    //   const elementID = el.replace(/ /g, '_').toUpperCase();
    //
    //   basePage.pageScreenshot(pageMap[global.pageID][elementID], elementID).then(() => {
    //     expect(validateImages(elementID)).to.eventually.be.ok.and.notify(next);
    //   });
    // });

    Then(/^there are ([0-9]) open browser tabs$/, (numTabs, next) => {
      driver.getAllWindowHandles().then((handles) => {
        if (handles.length != numTabs) next(new Error(`Expected ${numTabs} tabs, but got ${handles.length}`));
        else next();
      });
    });
};
