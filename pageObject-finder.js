const readDir = require(`${__dirname}/scripts`).readDir;

pageMap = {};

module.exports = function(dir) {

  return new Promise((res, rej)=>{
    readDir(dir, /^(.*)-page.js$/).then((pageObjectFiles)=>{
      let readFiles = 0;
      pageObjectFiles.forEach((pageObjectFilePath) => {
        const pageObjectClass = require(pageObjectFilePath);
        const pageObjectInstance = new pageObjectClass();
        pageMap[pageObjectInstance.name] = pageObjectInstance;
        readFiles++;
        if(readFiles === pageObjectFiles.length) res(true);
      });
    });
  });

};