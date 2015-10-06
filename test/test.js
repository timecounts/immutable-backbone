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

  it("doesn't affect original backbone", function() {
    var model = new Backbone.Model({id: 1, foo: 'bar'});
    var oldAttributes = model.attributes;
    model.set('foo', 'baz');
    expect(model.attributes).to.eql(oldAttributes);
  });

  it("replaces attributes on changing a property", function() {
    var model = new ImmutableModel({id: 1, foo: 'bar'});
    var oldAttributes = model.attributes;
    model.set('foo', 'baz');
    expect(model.attributes).not.to.eql(oldAttributes);
  });

});
