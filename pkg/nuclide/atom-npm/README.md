# nuclide-atom-npm

Package to register Atom-specific Node packages.

This global registry prevents Node packages from triggering side effects
multiple times (e.g. adding stylesheets, registering keybindings). Note that
this also prevents different Atom packages from using different versions of the
Node package.

## Register a Node package

The first argument is the root path of your package's code (the path to `lib/`).

The second argument is the path to what you'd normally put in `main.js`. This
value also functions as a key -- calling `require()` on the package will return
the first package that was registered with this key.

This approach prevents Node from having to evaluate the implementation multiple
times and allows it to load resources from `styles/` and `grammars/`.
(Other directories, such as `menus/` and `keymaps/`, are future work.)

```js
module.exports = require('nuclide-atom-npm').load(__dirname, 'AtomInput');
```

## Use the Node package

Add the dependency in `package.json` as usual:
```js
{
  "name": "nuclide-buck-toolbar",
  "dependencies": {
    "nuclide-ui-atom-input": "0.0.0",
  }
}
```

Require the package as usual:
```js
var AtomInput = require('nuclide-ui-atom-input');

module.exports = React.createClass({
  render() {
    return <AtomInput />;
  },
});
```
