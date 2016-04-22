#!/usr/bin/env node
'use strict';
/* @noflow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/*eslint-disable no-var, prefer-const, no-console*/

var argv = require('yargs')
  .usage('Usage: $0 [options]')
  .option('verbose', {
    describe: 'Show files being transpiled',
    type: 'boolean',
  })
  .help('help')
  .argv;

var counter = {};
function logger(group, filename) {
  counter[group]++ || (counter[group] = 1);
  if (argv.verbose) {
    console.log('[%s] %s', group, filename);
  }
}

var assert = require('assert');
var fs = require('fs');
var glob = require('glob');
var path = require('path');

var NodeTranspiler = require('../../pkg/nuclide-node-transpiler/lib/NodeTranspiler');
var nodeTranspiler = new NodeTranspiler();

var basedir = path.join(__dirname, '../..');
var serverBasedir =
  path.dirname(require.resolve('../../pkg/nuclide-server/package.json'));

var services = require(path.join(serverBasedir, 'services-3.json'));
try {
  services = services.concat(require(path.join(serverBasedir, 'fb/fb-services-3.json')));
} catch (err) {
  console.log('no "fb-services-3.json" found');
}

var jsFiles = glob.sync(path.join(basedir, '**/*.js'), {
  ignore: [
    '**/node_modules/**',
    '**/VendorLib/**',
    '**/spec/**',
  ],
});

var excludes = services.map(function(service) {
  if (service.definition) {
    return path.join(serverBasedir, service.definition);
  } else {
    return path.join(serverBasedir, service.implementation);
  }
});

// Sanity checks:
assert(jsFiles.length > 10);
assert(excludes.length > 10);
jsFiles.forEach(function(filename) {
  assert(path.isAbsolute(filename));
});
excludes.forEach(function(exclude) {
  assert(path.isAbsolute(exclude));
  fs.statSync(exclude);
});

console.log('Looking at %s files to transpile...', jsFiles.length);

jsFiles.forEach(function(filename) {
  if (excludes.indexOf(filename) !== -1) {
    logger('exclude', filename);
    return;
  }
  var src = fs.readFileSync(filename);
  if (!NodeTranspiler.shouldCompile(src)) {
    logger('skip', filename);
    return;
  }
  logger('transpile', filename);

  var safeFilename = path.basename(filename);
  // Prevent leaking private data in the sourcemap file path
  assert(safeFilename.indexOf(process.env.HOME) === -1);

  var code = nodeTranspiler.transform(src, safeFilename);
  fs.writeFileSync(filename, code);
});

console.log(
  Object.keys(counter)
    .map(function(group) { return group + ': ' +  counter[group]; })
    .join(' | ')
);
