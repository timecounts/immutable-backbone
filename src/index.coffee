###
# This is a helper to make Backbone models and collections easier to use with
# React.
#
# Models: makes the 'attributes' property immutable - that is any time that a
# property is changed within attributes, the attributes object itself is
# replaced such that oldAttributes != newAttributes.
#
# Collections: makes the 'models' property immutable - that is any time that a
# model is added, removed, or just changed, the 'models' array itself is
# replaced such that oldModels != newModels.
#
# This library assumes that your code is well behaved - that is:
#
# - you don't manipulate 'models' / 'attributes' directly, instead using the
#   helper methods
# - if attributes contains objects you immutably change those yourself
#   i.e. newO = _.extend({}, m.get('o'), {foo: bar}); m.set('o', newO);
###

defaultOptions =
  freeze: true

clone = (o) ->
  newO = {}
  for own k, v of o
    newO[k] = v
  return newO

freeze = (o) ->
  if Object.freeze
    Object.freeze o
  else
    o

immutableWrap = (klass, method, properties, options = defaultOptions) ->
  oldMethod = klass.prototype[method]
  klass.prototype[method] = ->
    for property in properties
      this[property] = clone this[property]
    result = oldMethod.apply(this, arguments)
    if options.freeze
      for property in properties
        this[property] = freeze this[property]
    return result
  return

exports.infectModelClass = (klass, options) ->
  throw new Error("Backbone Model Class expected") unless klass::idAttribute
  immutableWrap(klass, 'set', ['attributes'], options)
  return

exports.infectCollectionClass = (klass, options) ->
  throw new Error("Backbone Collection Class expected") unless klass::set
  immutableWrap(klass, 'set', ['models'], options)
  immutableWrap(klass, 'sort', ['models'], options)
  immutableWrap(klass, '_removeModels', ['models'], options)
  return

exports.infect = (klass, options) ->
  unless klass::set
    if klass.set
      extra = ", not an instance"
    throw new Error("infect must be called on a Backbone Model/Collection class#{extra}")
  if klass::idAttribute
    exports.infectModelClass(klass, options)
  else
    exports.infectCollectionClass(klass, options)
  return
