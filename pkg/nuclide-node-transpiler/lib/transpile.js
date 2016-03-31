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
/*eslint-disable no-var */

var fs = require('fs');
var createOrFetchFromCache = require('./babel-cache').createOrFetchFromCache;

function startsWith(str, prefix) {
  return str.lastIndexOf(prefix, 0) === 0;
}

function loadFile(module, filePath) {
  var sourceCode = fs.readFileSync(filePath, 'utf8');
  var js;

  if (!startsWith(sourceCode, '"use babel"') &&
      !startsWith(sourceCode, "'use babel'")) {
    js = sourceCode;
  } else {
    js = createOrFetchFromCache(sourceCode, filePath);
  }

  return module._compile(js, filePath);
}

function startTranspile() {
  Object.defineProperty(require.extensions, '.js', {
    enumerable: true,
    writable: false,
    value: loadFile,
  });
}

module.exports = {
  startTranspile: startTranspile,
};
