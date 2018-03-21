const rp = require('request-promise-native');

const handler = {
  get: function(obj, prop) {

  },
  set: function(obj, prop, val) {

  }
};

global.storedValues = new Proxy({}, handler);

class SharedObjects {
  constructor() {

  }

  static async execute(obj, command, data={}) {
    console.log('posting');
    const options = {
      method: 'POST',
      uri: `http://localhost:${process.env.SHARED_OBJECT_PORT}/${obj}/${command}`,
      body: data,
      json: true // Automatically stringifies the body to JSON
    };

    return rp(options);
  }
}

module.exports = SharedObjects;
