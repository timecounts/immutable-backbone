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
  if (Array.isArray(o)) {
    return o.slice();
  } else if (Object.assign) {
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

function immutableWrap(klass, method, properties, options, criteria) {
  var oldMethod = klass.prototype[method];
  options = options || defaultOptions;
  klass.prototype[method] = function() {
    var i, l;
    var doIt = !criteria || criteria.apply(this, arguments);
    if (doIt) {
      for (i = 0, l = properties.length; i < l; i++) {
        this[properties[i]] = clone(this[properties[i]]);
      }
    }
    var result = oldMethod.apply(this, arguments);
    if(doIt) {
      if (options.freeze) {
        for (i = 0, l = properties.length; i < l; i++) {
          this[properties[i]] = freeze(this[properties[i]]);
        }
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
  klass.prototype._immutableBackboneModel = true;
};

exports.infectCollectionClass = function(klass, options) {
  if (!klass.prototype.set) {
    throw new Error("Backbone Collection Class expected");
  }
  if (klass.prototype.model && !klass.prototype.model.prototype._immutableBackboneModel) {
    throw new Error("Cannot make a collection immutable unless it's models are immutable");
  }
  immutableWrap(klass, 'set', ['models'], options);
  immutableWrap(klass, 'sort', ['models'], options);
  immutableWrap(klass, '_removeModels', ['models'], options);
  immutableWrap(klass, '_onModelEvent', ['models'], options, function(event) { return event === 'change';});
  klass.prototype._immutableBackboneCollection = true;
};

exports.infect = function(klass, options) {
  if (klass.Model && klass.Collection) {
    // Must be 'Backbone' itself?
    infect(klass.Model, options);
    infect(klass.Collection, options);
    return;
  }
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

function updateStash(newStash, oldStash, key, modelOrCollection, properties) {
  var changed = false, i, property;
  if (!oldStash[key]) {
    changed = true;
  } else {
    for (i in properties) {
      property = properties[i];
      changed = changed || oldStash[key][property] !== modelOrCollection[property];
    }
  }
  if (changed) {
    newStash[key] = {};
    for (i in properties) {
      property = properties[i];
      newStash[key][property] = modelOrCollection[property];
    }
  } else {
    newStash[key] = oldStash[key];
  }
  return changed;
}

exports.PureRenderMixin = {
  componentDidMount: function() {
    this._immutableBackbonePropsStash = this.stashBackbone({}, {}, this.props).stash;
    this._immutableBackboneStateStash = this.stashBackbone({}, {}, this.state).stash;
  },
  componentWillUpdate: function(nextProps, nextState) {
    this._immutableBackbonePropsStash = this.stashBackbone(this._immutableBackbonePropsStash, this.props, nextProps).stash;
    this._immutableBackboneStateStash = this.stashBackbone(this._immutableBackboneStateStash, this.state, nextState).stash;
  },
  componentWillUnmount: function() {
    delete this._immutableBackbonePropsStash;
    delete this._immutableBackboneStateStash;
  },
  shouldComponentUpdate: function(nextProps, nextState) {
    var changed =
      this.stashBackbone(this._immutableBackbonePropsStash, this.props, nextProps).changed ||
      this.stashBackbone(this._immutableBackboneStateStash, this.state, nextState).changed;
    return changed;
  },
  stashBackbone: function(oldStash, oldObjects, newObjects) {
    var key, modelOrCollection, changed = false, newStash = {};
    oldObjects = oldObjects || {};
    newObjects = newObjects || {};
    var newKeys = Object.keys(newObjects);
    var oldKeys = Object.keys(oldObjects);
    if (!changed) {
      changed = (newKeys.length !== oldKeys.length);
    }
    for (key in newObjects) {
      if (!changed) {
        changed = oldKeys.indexOf(key) === -1;
      }
      if (!changed) {
        changed = (oldObjects[key] !== value);
      }
      modelOrCollection = newObjects[key];
      if (modelOrCollection._immutableBackboneModel) {
        changed = updateStash(newStash, oldStash, key, modelOrCollection, ['attributes']) || changed;
      } else if (modelOrCollection._immutableBackboneCollection) {
        changed = updateStash(newStash, oldStash, key, modelOrCollection, ['models']) || changed;
      }
    }
    return {changed: changed, stash: newStash};
  }
};
