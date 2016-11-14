nuclide-debugger-node
=====================

VendorLib
---------

Contains a fork of [`node-inspector`](https://github.com/node-inspector/node-inspector), and its relevant dependencies. `./scripts/make-vendorlib.sh` can be used to regenerate the `VendorLib` modules, so it's a good place to see how the bundled deps differ from their upstream counterparts. The modifications are:

1. Unused files have been removed to keep the repo light.
2. [`node-inspector`](https://github.com/node-inspector/node-inspector) has been slightly patched to conform with `nuclide-debugger`'s front-end.
3. [`v8-debug`](https://github.com/node-inspector/v8-debug) has been patched to load binary deps like [`v8-profiler`](https://github.com/node-inspector/v8-profiler) does.

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
    └── v8-profiler
```

`semver` and `ws` are used by `node-inspector` but they're not included in `Vendorlib/node_modules` because `nuclide` includes them already.

### Source Modifications

```diff
--- a/VendorLib/node_modules/v8-debug/v8-debug.js
+++ b/VendorLib/node_modules/v8-debug/v8-debug.js
@@ -1,8 +1,14 @@
 var binary = require('node-pre-gyp');
 var fs = require('fs');
 var path = require('path');
-var binding_path = binary.find(path.resolve(path.join(__dirname,'./package.json')));
-var binding = require(binding_path);
+var pack = require('./package.json');
+var binding = require('./' + [
+  'build',
+  'debug',
+  'v' + pack.version,
+  ['node', 'v' + process.versions.modules, process.platform, process.arch].join('-'),
+  'debug.node'
+].join('/'));
 var EventEmitter = require('events').EventEmitter;
 var inherits = require('util').inherits;
 var extend = require('util')._extend;
```

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

```diff
--- a/VendorLib/node-inspector/lib/InjectorClient.js
+++ b/VendorLib/node-inspector/lib/InjectorClient.js
@@ -105,10 +105,10 @@
         return prop.name == 'NativeModule';
       });

-      if (!NM.length)
-        error = new Error('No NativeModule in target scope');
+      if (!NM.length || !NM[0])
+        return cb(new Error('No NativeModule in target scope'));

-      cb(error, NM[0].ref);
+      cb(null, NM[0].ref);
     }.bind(this));
 };

```
