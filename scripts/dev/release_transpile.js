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

var assert = require('assert');
var babel = require('babel-core');
var fs = require('fs');
var glob = require('glob');
var path = require('path');

var basedir = path.join(__dirname, '../..');
var serverBasedir = path.join(basedir, 'pkg/nuclide/server');

var services = [];

[].push.apply(services, require(path.join(serverBasedir, 'services-3.json')));
try {
  [].push.apply(services, require(path.join(serverBasedir, 'fb/fb-services-3.json')));
} catch (err) {
  console.log('no "fb-services-3.json" found');
}

var excludes = services.map(function(service) {
  return path.join(basedir, 'pkg/nuclide/server', service.implementation);
});

excludes.forEach(function(filename) {
  // absolute paths are expected
  assert(filename[0] === '/');
  // sanity check
  fs.statSync(filename);
});

// something went wrong if this number is too small
assert(excludes.length > 10);

var jsFiles = glob.sync(
  path.join(basedir, '**/*.js'),
  {ignore: ['**/node_modules/**']}
);

var babelPrefixesRe = /^('use babel'|"use babel"|\/\*\* @babel \*\/)/;
// var fbLicenseRe = /^ \* Copyright/m;

jsFiles.forEach(function(filename) {
  // absolute paths are expected
  assert(filename[0] === '/');
  var relPath = path.relative(basedir, filename);
  if (excludes.indexOf(filename) !== -1) {
    console.log('[Exclude] %s', filename);
    return;
  }
  var src = fs.readFileSync(filename, 'utf8');
  if (!babelPrefixesRe.test(src)) {
    console.log('[Skip] "%s"', relPath);
    return;
  }
  console.log('[Transpile] "%s"', relPath);
  var safeFilename = path.basename(filename);
  // Do not leak your info in the sourcemap file path
  assert(safeFilename.indexOf(process.env.HOME) === -1);
  var opts = {
    filename: safeFilename,
    breakConfig: true,
    // comments: false,
    // shouldPrintComment: function(comment) {
    //   return fbLicenseRe.test(comment);
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
  var result = babel.transform(src, opts);
  fs.writeFileSync(filename, result.code);
});

function stripUseBabel() {
  function isUseBabel(node) {
    return (
      node &&
      node.type === 'ExpressionStatement' &&
      node.expression.type === 'Literal' &&
      node.expression.value === 'use babel'
    );
  }
  return new babel.Plugin('strip-use-babel', {
    visitor: {
      Program: function(node, parent, scope, state) {
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
