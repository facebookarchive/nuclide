#!/bin/bash

# This script should be run from the base of "nuclide-debugger-node".
# It'll download the relevant parts of "node-inspector" used by
# "nuclide-debugger-node", and its dependencies. It'll also stub "node-pre-gyp".

mkdir -p VendorLib/node-inspector
curl https://registry.npmjs.org/node-inspector/-/node-inspector-0.12.7.tgz |
  tar -xz -C VendorLib/node-inspector --strip-components=1 \
  --include='./package/LICENSE' \
  --include='./package/package.json' \
  --include='./package/lib/' \
  --exclude='./package/lib/config.js' \
  --exclude='./package/lib/debug-server.js'

mkdir -p VendorLib/node_modules/v8-debug
curl https://registry.npmjs.org/v8-debug/-/v8-debug-0.7.0.tgz |
  tar -xz -C VendorLib/node_modules/v8-debug --strip-components=1 \
  --include='./package/build/debug/v0.7.0/' \
  --include='./package/InjectedScript' \
  --include='./package/tools/NODE_NEXT.js' \
  --include='./package/LICENSE' \
  --include='./package/package.json' \
  --include='./package/v8-debug.js'

mkdir -p VendorLib/node_modules/v8-profiler
curl https://registry.npmjs.org/v8-profiler/-/v8-profiler-5.5.0.tgz |
  tar -xz -C VendorLib/node_modules/v8-profiler --strip-components=1 \
  --include='./package/build/profiler/v5.5.0/' \
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

mkdir -p VendorLib/node_modules/node-pre-gyp
cat <<EOF > VendorLib/node_modules/node-pre-gyp/index.js
// "pre-binding" behaves like "node-pre-gyp"'s "find", but doesn't include
// anything else (e.g. building).
'use strict';
module.exports = require('pre-binding');
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
