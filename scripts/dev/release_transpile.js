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

/* eslint-disable no-console */

const argv = require('yargs')
  .usage('Usage: $0 [options]')
  .option('verbose', {
    describe: 'Show files being transpiled',
    type: 'boolean',
  })
  .help('help')
  .argv;

const counter = {};
function logger(group, filename) {
  counter[group]++ || (counter[group] = 1);
  if (argv.verbose) {
    console.log('[%s] %s', group, filename);
  }
}

const assert = require('assert');
const fs = require('fs');
const glob = require('glob');
const path = require('path');
const os = require('os');

const NodeTranspiler = require('../../pkg/nuclide-node-transpiler/lib/NodeTranspiler');
const nodeTranspiler = new NodeTranspiler();

const basedir = path.join(__dirname, '../..');
const serverBasedir =
  path.dirname(require.resolve('../../pkg/nuclide-server/package.json'));

let services = require(path.join(serverBasedir, 'services-3.json'));
try {
  services = services.concat(require(path.join(serverBasedir, 'fb/fb-services-3.json')));
} catch (err) {
  console.log('no "fb-services-3.json" found');
}

const jsFiles = glob.sync(path.join(basedir, '**/*.js'), {
  ignore: [
    '**/node_modules/**',
    '**/VendorLib/**',
    '**/spec/**',
  ],
});

const excludes = services.map(service => {
  if (service.definition) {
    return path.join(serverBasedir, service.definition);
  } else {
    return path.join(serverBasedir, service.implementation);
  }
});

// Sanity checks:
assert(jsFiles.length > 10);
assert(excludes.length > 10);
jsFiles.forEach(filename => {
  assert(path.isAbsolute(filename));
});
excludes.forEach(exclude => {
  assert(path.isAbsolute(exclude));
  fs.statSync(exclude);
});

console.log('Looking at %s files to transpile...', jsFiles.length);

jsFiles.forEach(filename => {
  if (excludes.indexOf(filename) !== -1) {
    logger('exclude', filename);
    return;
  }
  const src = fs.readFileSync(filename);
  if (!NodeTranspiler.shouldCompile(src)) {
    logger('skip', filename);
    return;
  }
  logger('transpile', filename);

  const safeFilename = path.basename(filename);
  // Prevent leaking private data in the sourcemap file path
  assert(safeFilename.indexOf(os.homedir()) === -1);

  try {
    const code = nodeTranspiler.transform(src, safeFilename);
    fs.writeFileSync(filename, code);
  } catch (err) {
    console.error('Error transpiling %j', filename);
    throw err;
  }
});

console.log(
  Object.keys(counter)
    .map(group => { return group + ': ' + counter[group]; })
    .join(' | ')
);
