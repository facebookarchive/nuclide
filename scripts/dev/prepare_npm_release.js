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

/* NON-TRANSPILED FILE */
/* eslint-disable babel/func-params-comma-dangle, prefer-object-spread/prefer-object-spread */

const fs = require('fs');
const path = require('path');

const basedir = path.join(__dirname, '../..');

const packageJsonPath = path.join(basedir, 'package.json');
const packageJson = fs.readFileSync(packageJsonPath, 'utf8');
const pkg = JSON.parse(packageJson);

/**
 * package.json:
 */
const pkgCopy = JSON.parse(JSON.stringify(pkg));
delete pkgCopy.private;
pkgCopy.main = './lib/main.js';
const newPackageJson = JSON.stringify(pkgCopy, null, 2) + '\n';
fs.writeFileSync(packageJsonPath, newPackageJson);

/**
 * npm-shrinkwrap.json:
 */
try {
  const prodShrinkwrapPath = require.resolve('../../npm-shrinkwrap.production.json');
  const realShrinkwrapPath = require.resolve('../../npm-shrinkwrap.json');
  fs.renameSync(prodShrinkwrapPath, realShrinkwrapPath);
} catch (err) {
  if (!/Error: Cannot find module/.test(err)) {
    throw err;
  }
}
