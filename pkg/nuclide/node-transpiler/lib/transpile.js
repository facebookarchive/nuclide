/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * Because this file sets up the transpiling, it must be written in ES5 because
 * it will be evaluated before the transpiling is in place.
 */

var fs = require('fs');
var createOrFetchFromCache = require('./babel-cache').createOrFetchFromCache;

function startsWith(str, prefix) {
  return str.lastIndexOf(prefix, 0) === 0;
}

function loadFile(module, filePath) {
  var sourceCode = fs.readFileSync(filePath, 'utf8');
  var js;

  if (!startsWith(sourceCode, '"use babel"') &&
      /* eslint-disable quotes */
      !startsWith(sourceCode, "'use babel'"))
      /* eslint-enable quotes */ {
    js = sourceCode;
  } else {
    js = createOrFetchFromCache(sourceCode, filePath);
  }

  return module._compile(js, filePath);
}

function startTranspile() {
  // While transpiling, babel's `regenerator` optional option relies on babel's runtime to get
  // regeneratorRuntime and Promise. However, babel's `runtime` optional option will insert
  // dependencies code to transpiled JavaScript, and dependencies of nuclide-server won't be able
  // to load them. To walk around this, we create regeneratorRuntime and Promise to global variable.
  if (global.regeneratorRuntime === undefined) {
    global.regeneratorRuntime = require('babel-runtime/regenerator').default;
  }

  Object.defineProperty(require.extensions, '.js', {
    enumerable: true,
    writable: false,
    value: loadFile,
  });
}

module.exports = {
  startTranspile: startTranspile,
};
