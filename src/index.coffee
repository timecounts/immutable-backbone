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

clone = (o) ->
  newO = {}
  for own k, v of o
    newO[k] = v
  return newO

exports.infectModelClass = (klass) ->
  throw new Error("Backbone Model Class expected") unless klass::idAttribute

  oldSet = klass::set
  klass::set = ->
    @attributes = clone @attributes
    oldSet.apply(this, arguments)

  return

exports.infectCollectionClass = (klass) ->
  throw new Error("Backbone Collection Class expected") unless klass::set

  oldSet = klass::set
  klass.set = ->
    @models = @models[..]
    oldSet.apply(this, arguments)

  old_removeModels = klass::_removeModels
  klass::_removeModels = ->
    @models = @models[..]
    old_removeModels.apply(this, arguments)

  oldSort = klass::sort
  klass.sort = ->
    @models = @models[..]
    oldSort.apply(this, arguments)

  return

exports.infect = (klass) ->
  unless klass::set
    if klass.set
      extra = ", not an instance"
    throw new Error("infect must be called on a Backbone Model/Collection class#{extra}")
  if klass::idAttribute
    exports.infectModelClass(klass)
  else
    exports.infectCollectionClass(klass)
  return
