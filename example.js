var assert = require('assert');
var Backbone = require('backbone');
require('.').infect(Backbone);

var MyModel = Backbone.Model.extend({});
var MyCollection = Backbone.Collection.extend({
  model: MyModel
});

var collection = new MyCollection();
var oldModels = collection.models;
var model = collection.add({id: 1, name: 'Foo'});
assert(oldModels != collection.models);
var oldAttributes = model.attributes;
oldModels = collection.models;
model.set('name', 'Bar');
assert(oldAttributes != model.attributes);
assert(oldModels != collection.models);
