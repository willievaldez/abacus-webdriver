const PageObject = function(name, url) {
  if (new.target === PageObject) throw new TypeError("Cannot construct PageObject instances directly");
  if (name === undefined) throw new TypeError("Name for this page object is not defined");
  if (url === undefined) throw new TypeError("URL for this page object is not defined");
  this.name = name;
  this.URL = url;
};

PageObject.prototype.waitForUrlChange = async function () {
  let url = await driver.getCurrentUrl();
  url = url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
  const regex = `^((?!^${url}$).)*$`;
  await driver.wait(until.urlMatches(regex));
  return driver.getCurrentUrl();
};

PageObject.prototype.urlIsNot = async function (url) {
  url = url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
  const regex = `^((?!^${url}$).)*$`;
  await driver.wait(until.urlMatches(regex), 10000, `Browser never navigated away from ${url}`);
  return driver.getCurrentUrl();
};


module.exports = PageObject;
