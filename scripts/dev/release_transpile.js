#!/usr/bin/env node --harmony
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
var babelCore = require('babel-core');
var fs = require('fs');
var glob = require('glob');
var path = require('path');

var basedir = path.join(__dirname, '../..');
var serverBasedir = path.join(basedir, 'pkg/nuclide/server');

var services = require(path.join(serverBasedir, 'services-3.json'));
try {
  services = services.concat(require(path.join(serverBasedir, 'fb/fb-services-3.json')));
} catch (err) {
  console.log('no "fb-services-3.json" found');
}

var jsFiles = glob.sync(path.join(basedir, '**/*.js'), {
  ignore: [
    '**/node_modules/**',
    '**/spec/**',
  ],
});

var excludes = services.map(function(service) {
  return path.join(serverBasedir, service.implementation);
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
  var src = fs.readFileSync(filename, 'utf8');
  if (!hasUseBabel(src)) {
    logger('skip', filename);
    return;
  }
  logger('transpile', filename);
  var safeFilename = path.basename(filename);
  // Prevent leaking private data in the sourcemap file path
  assert(safeFilename.indexOf(process.env.HOME) === -1);
  var opts = {
    filename: safeFilename,
    breakConfig: true,
    // comments: false,
    // shouldPrintComment: function(comment) {
    //   return (/^ \* Copyright/m).test(comment);
    // },
    // compact: true,
    // loose: [
    //   'es6.classes',
    //   'es6.spread',
    //   'es6.destructuring',
    //   'es6.properties.computed',
    //   'es6.modules',
    //   'es6.forOf',
    //   'es6.templateLiterals',
    // ],
    sourceMap: 'inline',
    blacklist: [
      'es6.forOf',
      'useStrict',
      // 'es6.templateLiterals',
    ],
    optional: [
      'asyncToGenerator',
    ],
    stage: 0,
    plugins: [stripUseBabel],
  };
  var result = babelCore.transform(src, opts);
  fs.writeFileSync(filename, result.code);
});

console.log(
  Object.keys(counter)
    .map(function(group) { return group + ': ' +  counter[group]; })
    .join(' | ')
);

function hasUseBabel(str) {
  return /^('use babel'|"use babel"|\/\*\* @babel \*\/)/.test(str);
}

function stripUseBabel(babel) {
  function isUseBabel(node) {
    return (
      node &&
      node.type === 'ExpressionStatement' &&
      node.expression.type === 'Literal' &&
      node.expression.value === 'use babel'
    ) || (
      node &&
      node.type === 'CommentBlock' &&
      node.value === '* @babel ' // yes, with the "*" and the trailing space
    );
  }
  return new babel.Plugin('strip-use-babel', {
    visitor: {
      Program: function(node, parent, scope, state) {
        if (isUseBabel(parent.comments[0])) {
          parent.comments[0].value = '';
          return;
        }
        for (var i = 0; i < node.body.length; i++) {
          if (isUseBabel(node.body[i])) {
            this.get('body')[i].dangerouslyRemove();
            return;
          }
        }
      },
    },
  });
}
