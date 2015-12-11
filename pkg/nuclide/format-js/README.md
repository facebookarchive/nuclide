# format-js

This feature is a collection of codemods that automatically clean up different aspects of code so
that you do not have to worry about every little formatting detail. Right now all of the codemods
live in the `nuclide-format-js-base` feature.

## usage

The default keyboard shortcut for `nuclide-format-js:format` is `cmd-shift-i`.

## codemods

### requires

This collection of codemods automatically adds, removes, and formats your requires. It is primarily
a heuristic that works by requiring identifiers that are being used that were not declared. It is
also aware of Flow types and will properly promote type imports to requires, and demote requires to
type imports when appropriate.

There are a few best practices that you should follow in order to get the most benefit out of these
transforms:

+ Don't shadow require names anywhere in the file. The transform is very minimally aware of scope.
+ Don't alias requires (unless you specify the alias in the aliases setting).
+ Destructure in a line separate from the require.

```js
var React = require('react');
var {PropTypes} = React;
```

There are also a few things that are not supported yet that would be nice to support:

+ Relative requires, e.g. `require('../lib/module');`
+ Common destructures, e.g. `var {PropTypes} = require('react');`
+ Only add requires for known modules by maintaining a list of known modules, or by getting this
information from Flow.
+ Allow per-directory configurations.

Right now the recommended set up is to not run-on-save and instead use the default
keyboard shortcut.

Make sure to verify the requires that are added by this plugin and report any issues. If anything
is getting in your way when using this plugin you can generally work around it by modifying the
plugin's settings. It's possible to adjust things like built-ins, aliases, and even blacklist
particular transforms there.
