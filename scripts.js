const readDir = function(dir, fileRegex) {
  const fs = require('fs');
  const readDirectories = {};
  let allFilesArray = [];

  const readDir = function(dir) {
    let filesRead = 0;
    return new Promise((res, rej)=> {
      readDirectories[dir] = false;
      fs.readdir(dir, (err, files) => {
        if(err) return console.log(err);
        files.forEach((file) => {
          fs.lstat(`${dir}${file}`, (err, stats) => {
            filesRead++;
            if (err) return console.log(err);
            else if (stats.isDirectory()) {
              readDir(`${dir}${file}/`).then((moreFilesArray)=> {
                allFilesArray = allFilesArray.concat(moreFilesArray);
              });
            }
            else if (stats.isFile() && fileRegex.test(file)) {
              allFilesArray.push(`${dir}${file}`);
            }
            if (filesRead === files.length) {
              readDirectories[dir] = true;
              let returnFromFunc = true;
              const directories = Object.keys(readDirectories);
              for (let i = 0; i < directories.length; i++) {
                if(readDirectories[directories[i]] === false) returnFromFunc = false;
              }

              if (returnFromFunc) res(allFilesArray);
            }
          });
        });
      });
    });
  };

  return readDir(dir);
};

module.exports = {readDir};