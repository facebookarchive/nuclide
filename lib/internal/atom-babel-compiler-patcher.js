'use strict';
/* @noflow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

//------------------------------------------------------------------------------
// FOR DEVELOPMENT USE ONLY
//
// This module monkey-patches Atom's babel compiler so that we can apply custom
// transforms on Nuclide code only. The alternative is to run a watcher and
// always run transpiled code in Atom. As "clean" as that solution is, watchers
// require setting up, and are a departure from how the Atom development
// ecosystem works. Monkey-patching lets developers work on Nuclide in the same
// way as any other Atom package. The day this approach stops working, we'll
// re-evaluate the watcher.
//
// The additional transforms applied here are only optimizations. Nuclide code
// should be able to run on a stock Atom w/o these transforms. This ensures that
// the hackery done here doesn't break future Nuclide compatibility with Atom,
// or tooling like flow and eslint. It also keeps cowboy devs at bay from
// introducing exotic syntax, stage 0 features, and/or obscene module systems
// like Haste.
//------------------------------------------------------------------------------

/*eslint-disable prefer-object-spread/prefer-object-spread*/

const assert = require('assert');
const crypto = require('crypto');
const path = require('path');

const NodeTranspiler =
  require('../../pkg/nuclide-node-transpiler/lib/NodeTranspiler');

const nuclideBasedir = path.join(require.resolve('../../package.json'), '../');

assert(path.isAbsolute(nuclideBasedir));
assert(nuclideBasedir.endsWith(path.sep));

function isNuclideFile(filename) {
  return filename.startsWith(nuclideBasedir);
}

//---

let nodeTranspiler;
try {
  // Atom's babel-core may already be in the require cache if a module before us
  // needed "use babel" transpilation. There is no guarantee that that has
  // happened yet. require.resolve it so we fail fast if it ever goes missing.
  //
  // We could use Nuclide's own babel-core (even babel 6), but we want the exact
  // babel Atom would use in a stock setup- to be able to fallback to Atom
  // transpiling if needed.
  const babelVersion = require(path.join(
    process.resourcesPath, 'app.asar/node_modules/babel-core/package.json'
  )).version;
  const babelPath = require.resolve(path.join(
    process.resourcesPath, 'app.asar/node_modules/babel-core'
  ));
  nodeTranspiler = new NodeTranspiler(babelVersion, () => require(babelPath));
} catch (err) {
  throw new Error('babel-core was not found');
}

//---

// "babel.js" is the wrapper around Babel used by Atom. It is loaded during
// Atom's initial setup- before any "~/.atom/packages".
// https://github.com/atom/atom/blob/v1.6.2/src/babel.js
let babelCompiler;
try {
  // The babel compiler is in the require cache, but use require so we fail
  // fast if it ever goes missing.
  babelCompiler =
    require(path.join(process.resourcesPath, 'app.asar/src/babel.js'));
} catch (err) {
  throw new Error('babel.js was not found');
}

const _real_shouldCompile = babelCompiler.shouldCompile;
babelCompiler.shouldCompile = function(sourceCode, filePath) {
  const actual = NodeTranspiler.shouldCompile(sourceCode);
  const expected = _real_shouldCompile.call(this, sourceCode, filePath);
  // Verify that our own "shouldCompile" is matching Atom.
  assert(actual === expected);
  return actual;
};

const _real_getCachePath = babelCompiler.getCachePath;
babelCompiler.getCachePath = function(sourceCode, filePath) {
  if (isNuclideFile(filePath)) {
    const configDigest = nodeTranspiler.getConfigDigest();
    const fileHash = crypto
      .createHash('sha1')
      .update(sourceCode, 'utf8')
      .digest('hex');
    const cachePath = path.join('js/nuclide', configDigest, fileHash + '.js');
    return cachePath;
  } else {
    return _real_getCachePath.call(this, sourceCode, filePath);
  }
};

const _real_compile = babelCompiler.compile;
babelCompiler.compile = function(sourceCode, filePath) {
  if (isNuclideFile(filePath)) {
    return nodeTranspiler.transformWithCache(sourceCode, filePath);
  } else {
    return _real_compile.call(this, sourceCode, filePath);
  }
};
