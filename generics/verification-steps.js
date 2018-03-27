const expect = require('chai');

module.exports = ({Then}) => {

    Then(/^user is taken to the "([^"]*)" page$/, async (pageURI) => {
        global.pageID = pageURI;
        if (!pageMap[global.pageID]) throw new Error(`Page Object with name ${pageURI} is not defined`);
        const result = await driver.wait(until.urlMatches(pageMap[global.pageID].URL), process.env.CUCUMBER_REDIRECT_TIMEOUT * 1000, `URL never matched ${pageMap[global.pageID].URL}`);
        if (result !== true) {
            return result;
        }

        return null;

    });

    Then(/^the "([^"]*)" element (value|text) (is|contains|matches) "(.*)"$/, async (labelText, valOrText, matchType, text) => {
        const labelID = labelText.replace(/ /g, '_').toUpperCase();
        await pageMap[global.pageID][labelID].waitUntil[valOrText][matchType](text);
    });

    Then(/^the "([^"]*)" element (value|text) (is not|does not contain|does not match) "(.*)"$/, async (labelText, valOrText, matchType, text) => {
        const labelID = labelText.replace(/ /g, '_').toUpperCase();
        expect(pageMap[global.pageID][labelID].getAttribute(valOrText)).to.eventually.not.contain(text);
    });

    Then(/^the "([^"]*)" drop down only contains the following options:$/, async (el, table) => {
        const dropDownID = el.replace(/ /g, '_').toUpperCase();
        const select = pageMap[global.pageID][dropDownID];
        const selections = await select.findElements(by.tagName('option'));
        const optionsArray = [];

        for (let selection of selections) {
            const option = await selection.getText();
            optionsArray.push(option);
        }

        for (let row of table.raw()) {
            if (row[0] !== '') {
                const ind = optionsArray.indexOf(row[0]);
                if (ind === -1) throw new Error(`${row[0]} is not an option`);
                optionsArray.splice(ind, 1);
            }
        }
        if (optionsArray.length !== 1) throw new Error(`${optionsArray} are not options`);
    });

    Then(/^the "([^"]*)" drop down is non-empty$/, async (el) => {
        const dropDownID = el.replace(/ /g, '_').toUpperCase();
        const select = pageMap[global.pageID][dropDownID];
        const selections = await select.findElements(by.tagName('option'));
        const numSelections = selections.length;
        if (numSelections <= 1) throw new Error(`${el} drop down is not showing options`);
    });

    Then(/^the "([^"]*)" text field is non-empty$/, async (buttonText) => {
        const buttonID = buttonText.replace(/ /g, '_').toUpperCase();
        expect(pageMap[global.pageID][buttonID].getAttribute('value')).to.eventually.not.equal('');
    });

    Then(/^the "([^"]*)" element (is|is not) present$/, async (elementText, yorn) => {
        const elementID = elementText.replace(/ /g, '_').toUpperCase();
        const result = await driver.wait(pageMap[global.pageID][elementID].isDisplayed(), 5000);

        if (yorn === 'is not') {
            if (result === true) throw new Error(`${elementID} Element is displayed`);
        }
        else {
            if (result !== true) throw new Error(`${elementID} Element is not displayed`);
        }
    });

    Then(/^there are ([0-9]) open browser tabs$/, async (numTabs) => {
        const handles = await driver.getAllWindowHandles();
        if (handles.length !== numTabs) throw new Error(`Expected ${numTabs} tabs, but got ${handles.length}`);
    });
};
