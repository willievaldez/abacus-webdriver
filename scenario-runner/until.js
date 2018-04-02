// const Driver = require('./selenium');

class Until {
  constructor() {

  }

  urlMatches(regex) {
    return function() {
      return driver.until('urlMatches',[regex]);
    }
  }
}

module.exports = Until;
