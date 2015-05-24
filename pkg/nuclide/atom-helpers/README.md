# nuclide-atom-helpers

Common utilities for Nuclide packages for accessing the Atom API.

This is an ordinary npm package (which would make it easier to depend on in
`package.json`), but until Nuclide is public, we are not publishing anything
to npm.

In the meantime, the correct way to require this package is:

```js
require('nuclide-atom-helpers')
```
