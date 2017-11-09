const fs = require('fs');

const readDirectory = function (dir, fileRegex) {

    // Recursive function that takes in a file directory and returns all files that match fileRegex
    // if an object in the directory is a directory itself, call readDir on that directory
    const readDir = function (dir, level) {
        // console.log(`Reading ${dir} level ${level}`);
        let filesFound = [];
        const readDirectories = {};
        let filesRead = 0;
        return new Promise((res, rej) => {
            readDirectories[dir] = false;
            fs.readdir(dir, (err, files) => {
                if (err) console.log(err);
                if (files.length === 0) {
                    readDirectories[dir] = true;
                    return res([]);
                }

                // This function concatinates the inputted argument to the filesArray and checks if all subdirectories have been read
                const checkEndCase = function (filesArray) {
                    filesFound = filesFound.concat(filesArray);
                    if (filesRead === files.length) {
                        readDirectories[dir] = true;
                        // if(level === 0)
                        //     console.log(readDirectories);
                        let returnFromFunc = true;
                        const directories = Object.keys(readDirectories);
                        for (let i = 0; i < directories.length; i++) {
                            if (readDirectories[directories[i]] === false) returnFromFunc = false;
                        }
                        if (returnFromFunc) res(filesFound);

                    }
                };

                // for each object in the current directory, check if it is a directory or file
                files.forEach((file) => {
                    fs.lstat(`${dir}${file}`, (err, stats) => {
                        filesRead++;
                        // console.log('\t'+`${dir}${file}`);

                        if (err) return console.log(err);
                        //if the object is a directory, call readDir on it
                        else if (stats.isDirectory()) {
                            readDirectories[`${dir}${file}/`] = false;
                            readDir(`${dir}${file}/`, level + 1).then((readFiles) => {
                                readDirectories[`${dir}${file}/`] = true;
                                // if(level === 0)
                                //     console.log("Thenning from readDir");
                                checkEndCase(readFiles);
                            });
                        }
                        // if the object is a file, and it matches fileRegex, push the file to the returned array
                        else if (stats.isFile()) {
                            if (fileRegex.test(file)) checkEndCase([`${dir}${file}`]);
                            else checkEndCase([]);
                        }
                    });
                });

            });
        });
    };

    return readDir(dir, 0);
};

module.exports = {readDirectory};