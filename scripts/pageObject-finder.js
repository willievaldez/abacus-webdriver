const readDir = require('./directory-reader');

pageMap = {};

module.exports = function() {
  return new Promise((res, rej)=>{
    readDir(process.env.CUCUMBER_PAGE_OBJECT_DIRECTORY, /^(.*)-page.js$/).then(function(pageObjectFiles) {
      let readFiles = 0;
      pageObjectFiles.forEach((pageObjectFilePath) => {
        const pageObjectClass = require(`${process.env.PWD}/${pageObjectFilePath}`);
        const pageObjectInstance = new pageObjectClass();
        pageMap[pageObjectInstance.name] = pageObjectInstance;
        readFiles++;
        if(readFiles === pageObjectFiles.length) {
          res(true);
        }
      });
    });
  });
};