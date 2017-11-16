const dataTable = function(table) {
  for(let i = 0; i < table.length; i++) {
    const row = table[i];
    for(let j = 0; j < row.length; j++) {
        if (/{([^}]*)}/.test(row[j])) {
            const exampleReplacements = row[j].match(/{([^}]*)}/g);
            for (let k = 0; k < exampleReplacements.length; k++) {
                const replacement = exampleReplacements[k];
                row[j] = row[j].replace(replacement,global[replacement.substring(1,replacement.length-1)]);
            }
        }
    }
  }
  this.table = table;
};

dataTable.prototype.hashes = function() {
  const keys = this.table[0];
  const hashArray = [];
  for (let i = 1; i < this.table.length; i++) {
    for (let j = 0; j < this.table[i].length; j++) {
      const hashObject = {};
      hashObject[keys[j]] = this.table[i][j];
      hashArray.push(hashObject);
    }
  }
};

dataTable.prototype.rows = function() {
  return this.table.slice(1, this.table.length);
};

dataTable.prototype.raw = function() {
  return this.table;
};

dataTable.prototype.rowsHash = function() {
  const hashObject = {};
  for (let i = 0; i < this.table.length; i++) {
    hashObject[this.table[i][0]] = this.table[i][1];
  }
  return hashObject;

};

module.exports = dataTable;