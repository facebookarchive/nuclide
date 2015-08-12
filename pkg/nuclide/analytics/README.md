# nuclide-analytics package

Provides a standard API that packages can use to send analytics, in a consistent way, to arbitrary providers.

Common usage:

```js
var {track} = require('nuclide-analytics');

var booleanState = false;
var numericState = 42;
var stringState = 'foobar';

function doStuff(arg: string) {
  // Note that all metadata values on the second argument must be strings.
  track('example-package-doStuff', {
    bool: String(booleanState),
    num: String(numericState),
    str: stringState,
  });
}
```
