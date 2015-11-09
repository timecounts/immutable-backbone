Immutable Backbone
==================

[![Circle
CI](https://circleci.com/gh/timecounts/immutable-backbone.svg?style=svg)](https://circleci.com/gh/timecounts/immutable-backbone)

This is a helper to make Backbone models and collections easier to use
with React without having to rewrite your code. It **does not** make the
Backbone models/collections themselves immutable; however it does make a
model's `attributes` and a collection's `models` immutable - that is
that after using `model.set('key', value)` the `model.attributes` object
will not be the same reference.

An example
----------

```js
var assert = require('assert');
var Backbone = require('backbone');
require('immutable-backbone').infect(Backbone);

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
```

Models
------

Makes the `attributes` property immutable - that is any time that a
property is changed within attributes, the attributes object itself is
replaced such that `oldAttributes != newAttributes`.

Collections
-----------

Makes the `models` property immutable - that is any time that a model is
added, removed, or just changed, the 'models' array itself is replaced
such that `oldModels != newModels`.

Expectations
------------

This library assumes that your code is well behaved - that is:

- you don't manipulate `models` / `attributes` directly, instead using the
  helper methods (`get` / `set` / etc)
- if attributes contains objects you immutably change those yourself
  i.e. `newO = _.extend({}, m.get('o'), {foo: bar}); m.set('o', newO);`

PureRenderMixin
---------------

This library contains a PureRenderMixin variant that understands
immutable collections/models (the regular mixin will not work since the
model itself is not immutable). However, this mixin is currently
untested (and not yet used) so no guarantees are made about it!


License: MIT
------------

Copyright © 2015 Timecounts Inc

Permission is hereby granted, free of charge, to any person obtaining a
copy of this software and associated documentation files (the
“Software”), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS
OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
