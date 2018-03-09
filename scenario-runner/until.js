const Driver = require('./selenium');

class Until {
  constructor() {

  }

  urlMatches(regex) {
    return function() {
      // regex = new RegExp(regex).toString();
      return Driver.callWDFunction('UNTIL', 'urlMatches', [regex]);
    }
  }
}

module.exports = Until;
