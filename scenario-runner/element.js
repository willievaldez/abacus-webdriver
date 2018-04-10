const execute = require('./shared-objects').execute;


const element = function(locator) {
  const handler = {
    get: function(obj, prop) {
      if (prop === 'locator') return locator;
      return function() {
        const args = [];
        for (arg of arguments) {
          args.push(arg);
        }
        args.push(locator);
        return execute('element', prop, args);;
      }
    },
    set: function(obj, prop, val) {
      console.log('set');
      return true;
    },
    apply: function(target, thisArg, argList) {
      console.log('apply');
      return true;
    }
  };

  return new Proxy(function(){}, handler);
}

const by = {
  css: function(locator) {
    return {
      by: "css",
      locator
    }
  },

  xpath: function(locator) {
    return {
      by: "xpath",
      locator
    }
  },

  name: function(locator) {
    return {
      by: "name",
      locator
    }
  },

  id: function(locator) {
    return {
      by: "id",
      locator
    }
  },

  className: function(locator) {
    return {
      by: "className",
      locator
    }
  }
};

module.exports = {element, by};
