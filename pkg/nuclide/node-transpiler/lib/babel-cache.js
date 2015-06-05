/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
/**
 * Because this file helps set up the transpiling, it must be written in ES5 because
 * it will be evaluated before the transpiling is in place.
 */

var babel = require('babel-core');
var crypto = require('crypto');
var fs = require('fs');
var path = require('path');
var temp = require('temp').track();

var babelVersion = require('babel-core/package.json')['version'];
var cacheDir = path.join(__dirname, '../babel-cache');
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir);
}

cacheDir = path.join(cacheDir, createCachePathComponentForBabelVersionAndOptions());
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir);
}

function createCachePathComponentForBabelVersionAndOptions() {
  var shasum = crypto.createHash('sha1');

  // Include the version of Babel in the cache key.
  shasum.update(babelVersion, 'utf8');
  shasum.update('\u0000', 'utf8');

  // Include the options used by createOrFetchFromCache() in the cache key.
  var options = createOptions(/* filePath */ '', /* isYieldSupported */ false);
  updateDigestForJsonValue(shasum, options);
  return shasum.digest('hex');
}

/**
 * @param sourceCode string of JavaScript source code that starts with the 'use babel' pragma.
 * @param filePath identifies the path on disk where `sourceCode` came from.
 */
function createOrFetchFromCache(sourceCode, filePath) {
  // Use the SHA-1 of the file contents as the cache key. (The Babel version and transpilation
  // options are already encoded via the cacheDir.)
  var shasum = crypto.createHash('sha1');
  shasum.update(sourceCode, 'utf8');
  var sha1 = shasum.digest('hex');

  // Check whether the cached transpilation of this file already exists.
  var transpiledFile = path.join(cacheDir, sha1);
  if (fs.existsSync(transpiledFile)) {
    return fs.readFileSync(transpiledFile, 'utf8');
  }

  var options = createOptions(filePath, /* isYieldSupported */ false);
  var code = transpileFileWithOptions(sourceCode, options, filePath);

  // Asynchronously write the result to the cache. Write the file to a temp file first and then move
  // it so the write to the cache is atomic. Although Node is single-threaded, there could be
  // multiple Node processes running simulanesously that are using the cache.
  temp.open(/* prefix */ 'nuclide-node-transpiler', function(openError, info) {
    if (openError) {
      return;
    }

    fs.writeFile(info.path, code, function(writeError) {
      if (writeError) {
        return;
      }

      fs.rename(info.path, transpiledFile);
    });
  });

  return code;
}

/**
 * @param filePath identifies the path on disk where `sourceCode` that the options are for came
 *     from.
 * @param isYieldSupported whether the target environment supports yield/generators.
 *     This is an optional boolean argument that defaults to false.
 * @return object specifying Babel transpilation options.
 */
function createOptions(filePath, isYieldSupported) {
  // These options should be kept in sync with
  // https://github.com/atom/atom/blob/master/src/babel.coffee.
  //
  // The one exception is regenerator vs. asyncToGenerator because we must use
  // regenerator when targetting Node 0.10.x, but we can use asyncToGenerator
  // when targetting io.js.
  return {
    filename: filePath,
    sourceMap: 'inline',
    blacklist: [
      'useStrict',
    ],
    optional: [
      (isYieldSupported ? 'asyncToGenerator' : 'regenerator'),
    ],
    stage: 0,
  };
}

/**
 * @param shasum hash with an `update()` method.
 * @param value to hash. Must be a value that could be returned by `JSON.parse()`.
 * @return shasum
 */
function updateDigestForJsonValue(shasum, value) {
  var type = typeof value;
  if (type === 'string') {
    shasum.update('"', 'utf8');
    shasum.update(value, 'utf8');
    return shasum.update('"', 'utf8');
  } else if (type === 'boolean' || type === 'number') {
    return shasum.update(value.toString(), 'utf8');
  } else if (value === null) {
    return shasum.update('null', 'utf8');
  } else if (Array.isArray(value)) {
    shasum.update('[', 'utf8');
    value.forEach(function(item) {
      updateDigestForJsonValue(shasum, item);
      shasum.update(',', 'utf8');
    });
    return shasum.update(']', 'utf8');
  } else {
    var keys = Object.keys(value);
    keys.sort();
    shasum.update('{', 'utf8');
    keys.forEach(function(key) {
      updateDigestForJsonValue(shasum, key);
      shasum.update(': ', 'utf8');
      updateDigestForJsonValue(shasum, value[key]);
      shasum.update(',', 'utf8');
    });
    return shasum.update('}', 'utf8');
  }
}

/**
 * @param sourceCode string of JavaScript source code that starts with the 'use babel' pragma.
 * @param filePath identifies the path on disk where `sourceCode` came from.
 * @param isYieldSupported whether the target environment supports yield/generators.
 *     This is an optional boolean argument that defaults to false.
 * @return the transpiled code as a string.
 */
function transpileFile(sourceCode, filePath, isYieldSupported) {
  var options = createOptions(filePath, isYieldSupported);
  return transpileFileWithOptions(sourceCode, options, filePath);
}

/**
 * @param sourceCode string of JavaScript source code that starts with the 'use babel' pragma.
 * @param options object specifying Babel transpilation options.
 * @return the transpiled code as a string.
 */
function transpileFileWithOptions(sourceCode, options, filePath) {
  try {
    return babel.transform(sourceCode, options).code;
  } catch (e) {
    /* eslint-disable no-console */
    console.error('Error transpiling ' + filePath, e);
    /* eslint-enable no-console */
    throw e;
  }
}

module.exports = {
  createOrFetchFromCache: createOrFetchFromCache,

  // Exported for nuclide-node-transpiler/bin/transpile.
  transpileFile: transpileFile,
};
