#!/bin/bash

# This script should be run from the base of "nuclide-debugger-node".
# It'll download the relevant parts of "node-inspector" used by
# "nuclide-debugger-node", and its dependencies. It'll also stub "node-pre-gyp".

# Pro-tip: To generate patches use:
#   hg diff -U 3 --reverse --root ./pkg/nuclide-debugger-node-rpc

mkdir -p VendorLib/node-inspector
curl https://registry.npmjs.org/node-inspector/-/node-inspector-0.12.8.tgz |
  tar -xz -C VendorLib/node-inspector --strip-components=1 \
  --include='./package/LICENSE' \
  --include='./package/package.json' \
  --include='./package/lib/' \
  --exclude='./package/lib/config.js' \
  --exclude='./package/lib/debug-server.js'

# mkdir -p VendorLib/node_modules/v8-debug
# curl https://registry.npmjs.org/v8-debug/-/v8-debug-0.7.7.tgz |
#   tar -xz -C VendorLib/node_modules/v8-debug --strip-components=1 \
#   --include='./package/build/debug/v0.7.7/' \
#   --include='./package/InjectedScript' \
#   --include='./package/tools/NODE_NEXT.js' \
#   --include='./package/LICENSE' \
#   --include='./package/package.json' \
#   --include='./package/v8-debug.js'

# v8-debug published an incomplete v0.7.7, so it's necessary to download the
# binaries separately - unlike v8-profiler.
mkdir -p VendorLib/node_modules/v8-debug
curl https://registry.npmjs.org/v8-debug/-/v8-debug-0.7.7.tgz |
  tar -xz -C VendorLib/node_modules/v8-debug --strip-components=1 \
  --include='./package/InjectedScript' \
  --include='./package/tools/NODE_NEXT.js' \
  --include='./package/LICENSE' \
  --include='./package/package.json' \
  --include='./package/v8-debug.js'
V8_DEBUG_BINDINGS=(
  node-v11-darwin-x64
  node-v11-linux-x64
  node-v11-win32-ia32
  node-v11-win32-x64
  node-v14-darwin-x64
  node-v14-linux-x64
  node-v14-win32-ia32
  node-v14-win32-x64
  node-v46-darwin-x64
  node-v46-linux-x64
  node-v46-win32-ia32
  node-v46-win32-x64
  node-v47-darwin-x64
  node-v47-linux-x64
  node-v47-win32-ia32
  node-v47-win32-x64
  node-v48-darwin-x64
  node-v48-linux-x64
  node-v48-win32-ia32
  node-v48-win32-x64
)
mkdir -p "VendorLib/node_modules/v8-debug/build/debug/v0.7.7/"
for binding in "${V8_DEBUG_BINDINGS[@]}"; do
  curl -L "https://node-inspector.s3.amazonaws.com/debug/v0.7.7/${binding}.tar.gz" |
    tar -xz -C "VendorLib/node_modules/v8-debug/build/debug/v0.7.7/"
done

mkdir -p VendorLib/node_modules/v8-profiler
curl https://registry.npmjs.org/v8-profiler/-/v8-profiler-5.6.5.tgz |
  tar -xz -C VendorLib/node_modules/v8-profiler --strip-components=1 \
  --include='./package/build/profiler/v5.6.5/' \
  --include='./package/LICENSE' \
  --include='./package/package.json' \
  --include='./package/v8-profiler.js'

mkdir -p VendorLib/node_modules/async
curl https://registry.npmjs.org/async/-/async-0.9.2.tgz |
  tar -xz -C VendorLib/node_modules/async --strip-components=1 \
  --include='./package/lib/async.js' \
  --include='./package/LICENSE' \
  --include='./package/package.json'

mkdir -p VendorLib/node_modules/debug
curl https://registry.npmjs.org/debug/-/debug-2.2.0.tgz |
  tar -xz -C VendorLib/node_modules/debug --strip-components=1 \
  --include='./package/debug.js' \
  --include='./package/node.js' \
  --include='./package/package.json'

mkdir -p VendorLib/node_modules/ms
curl https://registry.npmjs.org/ms/-/ms-0.7.1.tgz |
  tar -xz -C VendorLib/node_modules/ms --strip-components=1 \
  --include='./package/index.js' \
  --include='./package/LICENSE' \
  --include='./package/package.json'

mkdir -p VendorLib/node_modules/path-is-absolute
curl https://registry.npmjs.org/path-is-absolute/-/path-is-absolute-1.0.0.tgz |
  tar -xz -C VendorLib/node_modules/path-is-absolute --strip-components=1 \
  --include='./package/index.js' \
  --include='./package/license' \
  --include='./package/package.json'

mkdir -p VendorLib/node_modules/strong-data-uri
curl https://registry.npmjs.org/strong-data-uri/-/strong-data-uri-1.0.3.tgz |
  tar -xz -C VendorLib/node_modules/strong-data-uri --strip-components=1 \
  --include='./package/index.js' \
  --include='./package/LICENSE.md' \
  --include='./package/package.json'

mkdir -p VendorLib/node_modules/truncate
curl https://registry.npmjs.org/truncate/-/truncate-1.0.5.tgz |
  tar -xz -C VendorLib/node_modules/truncate --strip-components=1 \
  --include='./package/package.json' \
  --include='./package/truncate.js'

cat <<EOF | patch -p1
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
EOF

cat <<EOF | patch -p1
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
EOF

# Fix from https://github.com/node-inspector/node-inspector/pull/932
cat <<EOF | patch -p1
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

EOF
