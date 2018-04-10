const express = require('express');
const readDir = require('./directory-reader');
var bodyParser = require('body-parser')
var app = express();
app.use(bodyParser.json());

class SharedObjectListener {
  constructor() {
    this.sharedObjects = {};
  }

  static async init() {
    const sharedObjectListener = new SharedObjectListener();
    const sharedObjectFiles = readDir(process.env.SHARED_OBJECT_DIRECTORY, /(.*).js/);
    global.storedValues = {};

    for (let sharedObjectPath of sharedObjectFiles) {
      await sharedObjectListener.addSharedObject(`${process.env.PWD}/${sharedObjectPath}`);
    }

    app.get('/:pid/:key', (req, res) => {
      res.send(sharedObjectListener.getStoredValue(req.params));
    });

    app.put('/:pid/:key/:val', (req, res) => {
      sharedObjectListener.addStoredValue(req.params);
      res.send();
    });

    app.post('/webdriver/init', (req, res) => {
      sharedObjectListener.addSharedObject('../generics/webdriver-shared-object').then((wd) => {
        sharedObjectListener.addSharedObject('../generics/element-shared-object').then((element) => {
          element.driver = wd.driver;
          res.send({});
        });
      });
    })

    app.post('/:obj/:cmd', (req, res) => {
      const sharedObjects = sharedObjectListener.sharedObjects;
      sharedObjects[req.params.obj][req.params.cmd](req.body).then((resp) => {
        if (resp instanceof Error) {
          res.statusCode = 500;
          resp = {err: {stack:resp.stack, message: resp.message}};
          res.send(resp);
        }
        else res.send(resp);
      }).catch((err) => {
        res.statusCode = 500;
        const resp = {err: {stack:err.stack, message: err.message}};
        res.send(resp);
      });
    });

    app.listen(process.env.SHARED_OBJECT_PORT);

    return sharedObjectListener;
  }

  async addSharedObject(path) {
    const SharedObject = require(path);
    let sharedObject;
    if (SharedObject.init) sharedObject = await SharedObject.init();
    else sharedObject = new SharedObject();
    this.sharedObjects[sharedObject.name] = sharedObject;
    return sharedObject;
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
