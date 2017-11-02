const PageObject = function(name, url) {
  if (new.target === PageObject) throw new TypeError("Cannot construct PageObject instances directly");
  if (name === undefined) throw new TypeError("Name for this page object is not defined");
  if (url === undefined) throw new TypeError("URL for this page object is not defined");
  this.name = name;
  this.URL = new RegExp(url);

};

PageObject.prototype.waitForUrlChange = function () {
  return new Promise((resolve, reject) => {
    let newUrl;
    driver.getCurrentUrl().then(function(url){
      console.log(url);
      driver.wait(function() {
        return driver.getCurrentUrl().then(function(newURI) {
          console.log(newURI);
            newUrl = newURI;
          return newUrl !== url;
        });
      }, 5000).catch(function() {
        reject(`Browser never navigated away from ${newUrl}`);
      }).then(function() {
        resolve(newUrl);
      });
    });

  });
};

PageObject.prototype.urlIsNot = function (url) {
  return new Promise((resolve, reject) => {
    let newUrl;
    driver.wait(function() {
      return driver.getCurrentUrl().then(function(newURI) {
        newUrl = newURI;
        return newUrl !== url;
      });
    }, 5000).catch(function() {
      reject(`Browser never navigated away from ${url}`);
    }).then(function() {
      resolve(newUrl);
    });

  });
};


module.exports = PageObject;