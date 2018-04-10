const rp = require('request-promise-native');

let openRequests = 0;
let openRequestResolve = null;

class SharedObjects {
  constructor() {

  }

  static getOpenRequests() {
    return new Promise((res, rej) => {
      if (openRequests === 0) res();
      else openRequestResolve = res;
    });
  }

  static async execute(obj, command, data={}) {
    console.log('posting - ', `http://localhost:${process.env.SHARED_OBJECT_PORT}/${obj}/${command}`,JSON.stringify(data));
    const options = {
      method: 'POST',
      uri: `http://localhost:${process.env.SHARED_OBJECT_PORT}/${obj}/${command}`,
      body: data,
      json: true // Automatically stringifies the body to JSON
    };

    const httpPromise = rp(options);

    openRequests++;
    return new Promise((resolve, reject) => {
      httpPromise.then((response) => {
        openRequests--;
        if (openRequests === 0 && openRequestResolve) openRequestResolve();
        resolve(response);
      }).catch((err) => {
        openRequests--;
        if (openRequests === 0 && openRequestResolve) openRequestResolve();
        reject(err);
      });
    });


  }
}

module.exports = SharedObjects;
