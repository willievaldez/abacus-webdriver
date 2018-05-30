const fs = require('fs');

const readDirectory = function (dir, fileRegex) {
    if (dir.substring(0,2) !== './') dir = `./${dir}`;
    if (dir.charAt(dir.length-1) !== '/') dir = `${dir}/`;

    if (!fs.existsSync(dir)) {
        return [];
    }

    // Recursive function that takes in a file directory and returns all files that match fileRegex
    // if an object in the directory is a directory itself, call readDir on that directory
    const readDir = function (dir, level) {
        let filesFound = [];
        const files = fs.readdirSync(dir);

        for (let file of files) {
          const stats = fs.lstatSync(`${dir}${file}`);
          if (stats.isDirectory()) filesFound = filesFound.concat(readDir(`${dir}${file}/`, level + 1));
          else if (stats.isFile()) if (fileRegex.test(file)) filesFound.push(`${dir}${file}`);

        }
        return filesFound;
    };

    return readDir(dir, 0);
};

module.exports = readDirectory;
