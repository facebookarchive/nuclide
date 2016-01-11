nuclide-debugger-node
=====================

VendorLib
---------

These are forks of [`node-inspector`](https://github.com/node-inspector/node-inspector), [`v8-debug`](https://github.com/node-inspector/v8-debug) and [`v8-profiler`](https://github.com/node-inspector/v8-profiler). `v8-debug` and `v8-profiler` have a modified version of [node-pre-gyp](https://github.com/mapbox/node-pre-gyp).

The modifications are so `node-pre-gyp` doesn't try to compile `v8-debug` or `v8-profiler`, but instead only returns one of the pre-built versions of either. For `nuclide-debugger-node` to work, we have to bundle these modified dependencies so that `apm install` / `apm rebuild` don't attempt to compile them. Since `v8-debug` and `v8-profiler` are not meant to be consumed by Atom/Electron, but rather by the node process you're trying to debug, it doesn't make sense to let `apm`/`npm` compile them.

##### The exact subset of files used here was gathered with:

```sh
cd pkg/nuclide/debugger/node

mkdir -p VendorLib/{v8-debug,v8-profiler}

curl https://registry.npmjs.org/v8-debug/-/v8-debug-0.7.0.tgz |
  tar -xz -C resources/VendorLib/v8-debug --strip-components=1 \
  --exclude='./binding.gyp' \
  --exclude='./build/debug/v0.6.2' \
  --exclude='./src' \
  --exclude='./tools/prepublish.js'

curl https://registry.npmjs.org/v8-profiler/-/v8-profiler-5.5.0.tgz |
  tar -xz -C resources/VendorLib/v8-profiler --strip-components=1 \
  --exclude='./binding.gyp' \
  --exclude='./src' \
  --exclude='./tools/prepublish.js'

mkdir -p resources/VendorLib/{v8-debug,v8-profiler}/node-pre-gyp

curl https://registry.npmjs.org/node-pre-gyp/-/node-pre-gyp-0.6.18.tgz |
  tar -xz -C resources/VendorLib/v8-debug/node-pre-gyp --strip-components=1 \
  --include='./package/LICENSE' \
  --include='./package/README.md' \
  --include='./package/lib/pre-binding.js' \
  --include='./package/lib/util/abi_crosswalk.json' \
  --include='./package/lib/util/versioning.js' \
  --include='./package/package.json'

curl https://registry.npmjs.org/node-pre-gyp/-/node-pre-gyp-0.6.18.tgz |
  tar -xz -C resources/VendorLib/v8-profiler/node-pre-gyp --strip-components=1 \
  --include='./package/LICENSE' \
  --include='./package/README.md' \
  --include='./package/lib/pre-binding.js' \
  --include='./package/lib/util/abi_crosswalk.json' \
  --include='./package/lib/util/versioning.js' \
  --include='./package/package.json'
```

**Important:** Both `v8-debug` and `v8-profiler` depend on `semver` (via `node-pre-gyp`).

##### Source modifications:

`require` and `require.resolve` paths were made relative, since the modules don't like in `node_modules`.
