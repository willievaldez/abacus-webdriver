const readDirectory = function(dir, fileRegex) {
  const fs = require('fs');
  const readDirectories = {};
  let allFilesArray = [];

  const readDir = function(dir, level) {
    let filesRead = 0;
    return new Promise((res, rej) => {
      readDirectories[dir] = false;
      fs.readdir(dir, (err, files) => {
        if(err) console.log(err);
        if(files.length === 0) {
          readDirectories[dir] = true;
          return res([]);
        }
        files.forEach((file) => {
          fs.lstat(`${dir}${file}`, (err, stats) => {
            filesRead++;
            if (err) console.log(err);
            else if (stats.isDirectory()) {
              readDir(`${dir}${file}/`, level+1).then((moreFilesArray) => {
                allFilesArray = allFilesArray.concat(moreFilesArray);
                if (filesRead === files.length) {
                  readDirectories[dir] = true;
                  let returnFromFunc = true;
                  const directories = Object.keys(readDirectories);
                  for (let i = 0; i < directories.length; i++) {
                    if(readDirectories[directories[i]] === false) returnFromFunc = false;
                  }
                  if (returnFromFunc) res(moreFilesArray);
                }
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

  return readDir(dir, 0);
};

module.exports = {readDirectory};