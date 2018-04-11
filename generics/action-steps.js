module.exports = ({When}) => {

  When(/^user clicks on the "(.*)" button$/, async (buttonText) => {
    const buttonID = buttonText.replace(/ /g, '_').toUpperCase();
    await pageMap[global.pageID][buttonID].click();
  });

  When(/^user enters "(.*)" into the "(.*)" field$/, async (text, textField) => {
    const fieldID = textField.replace(/ /g, '_').toUpperCase();
    await pageMap[global.pageID][fieldID].clear();
    await pageMap[global.pageID][fieldID].sendKeys(text);
  });

  When(/^user selects "(.*)" from the "(.*)" drop down$/, async (text, buttonText) => {
    const buttonID = buttonText.replace(/ /g, '_').toUpperCase();
    await pageMap[global.pageID][buttonID].sendKeys(text);
  });

  When(/^user enters values into the following fields$/, async (table) => {
    const hash = table.rowsHash();
    const keys = Object.keys(hash);
    for (let i = 0; i < keys.length; i++) {
      const fieldID = keys[i].replace(/ /g, '_').toUpperCase();
      await pageMap[global.pageID][fieldID].clear().catch((err) => {
        console.log(fieldID);
      });

      try {
        const result = await pageMap[global.pageID][fieldID].sendKeys(hash[keys[i]]);
        if (result) return result;
      }
      catch (err) {
        throw new Error(`Error sending keys to the ${fieldID} element of ${global.pageID}`);
      }
    }
  });

  When(/^user presses the (.*) key/, async (key) => {
    await driver.sendKeys(driver.Key[key]);
  });

  When(/^user waits for ([0-9]+) seconds$/, async (num) => {
    await driver.sleep(num * 1000);
  });

  When(/^user refreshes the page/, async () => {
    await driver.navigate().refresh();
  });

};
