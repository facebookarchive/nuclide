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
// introducing exotic syntax, stage 0 features, and/oor obscene module systems
// like Haste.
//------------------------------------------------------------------------------

/*eslint-disable prefer-object-spread/prefer-object-spread*/

const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Atom's babel defaults:
// https://github.com/atom/atom/blob/v1.6.2/static/babelrc.json
//
// {
//   "breakConfig": true,
//   "sourceMap": "inline",
//   "blacklist": ["es6.forOf", "useStrict"],
//   "optional": ["asyncToGenerator"],
//   "stage": 0
// }

const defaultOptions = {
  breakConfig: true,
  // sourceMap: 'inline',
  blacklist: [
    'es6.forOf',
    'es6.templateLiterals',
    'useStrict',
  ],
  optional: [
    'asyncToGenerator',
  ],
  // TODO(asuarez): Improve perf by explicitly running only the transforms we use.
  stage: 1,
  plugins: [
  ],
  // comments: false,
  // compact: true,
  // externalHelpers: true,
  // loose: [
  //   'es6.classes',
  //   'es6.destructuring',
  //   'es6.forOf',
  //   'es6.modules',
  //   'es6.properties.computed',
  //   'es6.spread',
  //   'es6.templateLiterals',
  // ],
};

//---

const nuclideBasedir = path.join(require.resolve('../../package.json'), '../');

assert(path.isAbsolute(nuclideBasedir));
assert(nuclideBasedir.endsWith(path.sep));

function isNuclideFile(filename) {
  return filename.startsWith(nuclideBasedir);
}

//---

let babel;
try {
  // Atom's babel-core may already be in the require cache if a module before us
  // needed "use babel" transpilation. There is no guarantee that that has
  // happened yet. require it so we fail fast if it ever goes missing.
  //
  // We could use Nuclide's own babel-core (even babel 6), but we want the exact
  // babel Atom would use in a stock setup- to be able to fallback to Atom
  // transpiling if needed.
  babel =
    require(path.join(process.resourcesPath, 'app.asar/node_modules/babel-core'));
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
  // passthrough
  return _real_shouldCompile.call(this, sourceCode, filePath);
};

const _real_getCachePath = babelCompiler.getCachePath;
babelCompiler.getCachePath = function(sourceCode, filePath) {
  if (isNuclideFile(filePath)) {
    const cacheDirectory = getCacheDirectory();
    const fileHash = crypto
      .createHash('sha1')
      .update(sourceCode, 'utf8')
      .digest('hex');
    const cachePath = path.join(cacheDirectory, fileHash + '.js');
    return cachePath;
  } else {
    return _real_getCachePath.call(this, sourceCode, filePath);
  }
};

const _real_compile = babelCompiler.compile;
babelCompiler.compile = function(sourceCode, filePath) {
  if (isNuclideFile(filePath)) {
    const options = Object.assign({filename: filePath}, defaultOptions);
    return babel.transform(sourceCode, options).code;
  } else {
    return _real_compile.call(this, sourceCode, filePath);
  }
};

let _cacheDirectory;
function getCacheDirectory() {
  if (!_cacheDirectory) {
    const hash = crypto
      .createHash('sha1')
      .update('babel-core', 'utf8')
      .update('\0', 'utf8')
      .update(babel.version, 'utf8')
      .update('\0', 'utf8')
      .update(JSON.stringify(defaultOptions), 'utf8');
    // The source of this file and that of plugins is used as part of the hash
    // as a way to version our transforms.
    [__filename]
      .concat(defaultOptions.plugins)
      .filter(Boolean)
      .forEach(pluginFile => {
        hash
          .update(fs.readFileSync(pluginFile))
          .update('\0', 'utf8');
      });
    const digest = hash.digest('hex');
    _cacheDirectory = path.join('js', 'nuclide', digest);
  }
  return _cacheDirectory;
}
