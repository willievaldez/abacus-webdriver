export class PageObject {
  constructor(name, url){
    if (new.target === PageObject) throw new TypeError("Cannot construct PageObject instances directly");
    if (name === undefined) throw new TypeError("Name for this page object is not defined");
    if (url === undefined) throw new TypeError("URL for this page object is not defined");
    this.name = name;
    this.URL = new RegExp(url);
  }

}
