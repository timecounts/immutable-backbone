/*
 * This is a helper to make Backbone models and collections easier to use with
 * React.
 *
 * Models: makes the 'attributes' property immutable - that is any time that a
 * property is changed within attributes, the attributes object itself is
 * replaced such that oldAttributes != newAttributes.
 *
 * Collections: makes the 'models' property immutable - that is any time that a
 * model is added, removed, or just changed, the 'models' array itself is
 * replaced such that oldModels != newModels.
 *
 * This library assumes that your code is well behaved - that is:
 *
 * - you don't manipulate 'models' / 'attributes' directly, instead using the
 *   helper methods
 * - if attributes contains objects you immutably change those yourself
 *   i.e. newO = _.extend({}, m.get('o'), {foo: bar}); m.set('o', newO);
 */

var defaultOptions = {
  freeze: true
};

function clone(o) {
  if (Object.assign) {
    return Object.assign({}, o);
  } else {
    var newO = {};
    for (var k in o) {
      if (o.hasOwnProperty(k)) {
        newO[k] = o[k];
      }
    }
    return newO;
  }
}

function freeze(o) {
  if (Object.freeze) {
    return Object.freeze(o);
  } else {
    return o;
  }
}

function immutableWrap(klass, method, properties, options) {
  var oldMethod = klass.prototype[method];
  options = options || defaultOptions;
  klass.prototype[method] = function() {
    var i, l;
    for (i = 0, l = properties.length; i < l; i++) {
      this[properties[i]] = clone(this[properties[i]]);
    }
    var result = oldMethod.apply(this, arguments);
    if (options.freeze) {
      for (i = 0, l = properties.length; i < l; i++) {
        this[properties[i]] = freeze(this[properties[i]]);
      }
    }
    return result;
  };
}

exports.infectModelClass = function(klass, options) {
  if (!klass.prototype.idAttribute) {
    throw new Error("Backbone Model Class expected");
  }
  immutableWrap(klass, 'set', ['attributes'], options);
};

exports.infectCollectionClass = function(klass, options) {
  if (!klass.prototype.set) {
    throw new Error("Backbone Collection Class expected");
  }
  immutableWrap(klass, 'set', ['models'], options);
  immutableWrap(klass, 'sort', ['models'], options);
  immutableWrap(klass, '_removeModels', ['models'], options);
};

exports.infect = function(klass, options) {
  if (!klass.prototype.set) {
    var extra = "";
    if (klass.set) {
      extra = ", not an instance";
    }
    throw new Error("infect must be called on a Backbone Model/Collection class" + extra);
  }
  if (klass.prototype.idAttribute) {
    exports.infectModelClass(klass, options);
  } else {
    exports.infectCollectionClass(klass, options);
  }
};
