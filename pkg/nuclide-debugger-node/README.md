nuclide-debugger-node
=====================

VendorLib
---------

Contains a fork of [`node-inspector`](https://github.com/node-inspector/node-inspector), and its relevant dependencies. `./scripts/make-vendorlib.sh` can be used to regenerate the `VendorLib` modules, so it's a good place to see how the bundled deps differ from their upstream counterparts. The modifications are:

1. Unused files have been removed to keep the repo light.
2. [`node-inspector`](https://github.com/node-inspector/node-inspector) has been slightly patched to conform with `nuclide-debugger`'s front-end.
3. [`node-pre-gyp`](https://github.com/mapbox/node-pre-gyp) has been stubbed to point to [`pre-binding`](https://github.com/zertosh/pre-binding) instead. This allows [`v8-debug`](https://github.com/node-inspector/v8-debug) and [`v8-profiler`](https://github.com/node-inspector/v8-profiler) to work without attempting to rebuild themselves.

### Directory Structure

```
VendorLib
├── node-inspector
└── node_modules
    ├── async
    ├── debug
    ├── ms
    ├── path-is-absolute
    ├── strong
    ├── truncate
    ├── v8-debug
    ├── v8-profiler
    └── node-pre-gyp -> pre-binding
```

`semver` and `ws` are used by `node-inspector` but they're not included in `Vendorlib/node_modules` because `nuclide` includes them already.

### Source Modifications

```diff
--- a/VendorLib/node-inspector/lib/RuntimeAgent.js
+++ b/VendorLib/node-inspector/lib/RuntimeAgent.js
@@ -26,8 +26,8 @@
     this._frontendClient.sendEvent('Runtime.executionContextCreated', {
       context: {
         id: 1,
-        isPageContext: true,
-        name: ''
+        isPageContext: false,
+        name: 'node-inspector'
       }
     });
   },
```
