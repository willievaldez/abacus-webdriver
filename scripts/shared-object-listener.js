const express = require('express');
const readDir = require('./directory-reader');
var bodyParser = require('body-parser')
var app = express();
app.use(bodyParser.json());

class SharedObjectListener {
  constructor() {

  }

  static async init() {
    const sharedObjectListener = new SharedObjectListener();
    const sharedObjectFiles = readDir(process.env.SHARED_OBJECT_DIRECTORY, /(.*).js/);
    global.storedValues = {};
    const sharedObjects = {};
    for (let sharedObjectPath of sharedObjectFiles) {
      const SharedObject = require(`${process.env.PWD}/${sharedObjectPath}`);
      const sharedObject = await SharedObject.init();
      sharedObjects[sharedObject.name] = sharedObject;
    }

    sharedObjectListener.sharedObjects = sharedObjects;

    app.get('/:pid/:key', (req, res) => {
      res.send(sharedObjectListener.getStoredValue(req.params));
    });

    app.put('/:pid/:key/:val', (req, res) => {
      sharedObjectListener.addStoredValue(req.params);
      res.send();
    });

    app.post('/:obj/:cmd', (req, res) => {
      sharedObjects[req.params.obj][req.params.cmd](req.body).then((resp) => {
        console.log('sending');
        res.send(resp);
      });
    });

    app.listen(process.env.SHARED_OBJECT_PORT);

    return sharedObjectListener;
  }

  addStoredValue({pid, key, val}) {
    if (!global.storedValues[pid]) global.storedValues[pid] = {};
    global.storedValues[pid][key] = val;
  }

  getStoredValue({pid, key}) {
    if (!global.storedValues[pid]) return null;
    return global.storedValues[pid][key]
  }

}

module.exports = SharedObjectListener;
