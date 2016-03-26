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

var fs = require('fs');
var path = require('path');

var basedir = path.join(__dirname, '../..');

var packageJsonPath = path.join(basedir, 'package.json');
var packageJson = fs.readFileSync(packageJsonPath, 'utf8');
var pkg = JSON.parse(packageJson);

/**
 * package.json:
 */
var pkgCopy = JSON.parse(JSON.stringify(pkg));
delete pkgCopy.private;
var newPackageJson = JSON.stringify(pkgCopy, null, 2) + '\n';
fs.writeFileSync(packageJsonPath, newPackageJson);

/**
 * npm-shrinkwrap.json:
 */
try {
  var prodShrinkwrapPath = require.resolve('../../npm-shrinkwrap.production.json');
  var realShrinkwrapPath = require.resolve('../../npm-shrinkwrap.json');
  fs.renameSync(prodShrinkwrapPath, realShrinkwrapPath);
} catch (err) {
  if (!/Error: Cannot find module/.test(err)) {
    throw err;
  }
}
