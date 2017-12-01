const dataTable = function(table) {
  for (let i = 0; i < table.length; i++) {
    const row = table[i];
    for (let j = 0; j < row.length; j++) {
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

dataTable.format = function(table) {
    if(!table) return '';

    // transpose function
    const transpose = function (oldTable) {
        const newTable = [];
        for (let i = 0; i < oldTable[0].length; i++) {
            const colToRow = [];
            for (let j = 0; j < oldTable.length; j++) {
                colToRow.push(oldTable[j][i]);
            }
            newTable.push(colToRow);
        }
        return newTable;
    }

    const transposeTable = transpose(table);
    for (let i = 0; i < transposeTable.length; i++) {
        let maxEntry = '';
        for (let j = 0; j < transposeTable[i].length; j++) {
            if (transposeTable[i][j].length > maxEntry.length) maxEntry = transposeTable[i][j];
        }
        for (let j = 0; j < transposeTable[i].length; j++) {
            const diff = maxEntry.length - transposeTable[i][j].length;
            for (let k = 0; k < diff; k++) {
                transposeTable[i][j] += ' ';
            }
        }
    }
    
    let stringTable = JSON.stringify(transpose(transposeTable));
    stringTable = stringTable.replace( /\[\[/g ,'\t| ');
    stringTable = stringTable.replace( /],\[/g ,' |\n\t| ');
    stringTable = stringTable.replace( /]]/g ,' |');
    stringTable = stringTable.replace( /,/g ,' | ');
    stringTable = stringTable.replace( /"/g ,'');

    return stringTable;

};

module.exports = dataTable;