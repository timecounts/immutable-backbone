Backbone = require('backbone');
ImmutableBackbone = require('..');
chai = require('chai');

infect = ImmutableBackbone.infect;
expect = chai.expect;

chai.config.includeStack = true;

describe('Immutable backbone', function() {
  var ImmutableModel = Backbone.Model.extend({});
  var ImmutableCollection = Backbone.Collection.extend({});

  infect(ImmutableModel);
  infect(ImmutableCollection);

  describe('models', function() {

    it("doesn't affect original backbone", function() {
      var model = new Backbone.Model({id: 1, foo: 'bar'});
      var oldAttributes = model.attributes;
      model.set('foo', 'baz');
      expect(model.attributes).to.equal(oldAttributes);
    });

    it("replaces attributes on changing a property", function() {
      var model = new ImmutableModel({id: 1, foo: 'bar'});
      var oldAttributes = model.attributes;
      model.set('foo', 'baz');
      expect(model.attributes).not.to.equal(oldAttributes);
    });

  });

  describe('collections', function() {

    it("doesn't affect original backbone", function() {
      var collection = new Backbone.Collection([{id: 1, foo: 'bar'}]);
      var oldModels = collection.models;
      collection.add({id: 2, foo: 'baz'});
      expect(collection.models).to.equal(oldModels);
    });

    it("replaces models on add", function() {
      var collection = new ImmutableCollection([{id: 1, foo: 'bar'}]);
      var oldModels = collection.models;
      collection.add({id: 2, foo: 'baz'});
      expect(collection.models).not.to.equal(oldModels);
    });

    it("replaces models on remove", function() {
      var collection = new ImmutableCollection([{id: 1, foo: 'bar'}, {id: 2, foo: 'baz'}]);
      var oldModels = collection.models;
      collection.remove(2);
      expect(collection.models).not.to.equal(oldModels);
    });

    it("replaces models on reset", function() {
      var collection = new ImmutableCollection([{id: 1, foo: 'bar'}, {id: 2, foo: 'baz'}]);
      var oldModels = collection.models;
      collection.reset([]);
      expect(collection.models).not.to.equal(oldModels);
    });

    it("replaces models on sort", function() {
      var collection = new ImmutableCollection([{id: 1, foo: 'bar'}, {id: 2, foo: 'baz'}]);
      var oldModels = collection.models;
      collection.comparator = 'foo';
      collection.sort();
      expect(collection.models).not.to.equal(oldModels);
    });

  });

});
