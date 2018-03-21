class SharedObject {
  constructor(name) {
    console.log('constructing shared object');
    console.log(name);
    this.name = name;
  }

  static async init(name) {
    return new SharedObject(name);
  }

  addListener() {

  }


}

module.exports = SharedObject;
