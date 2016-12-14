#!/usr/bin/env node
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @noflow
 */
'use strict';

/* eslint comma-dangle: [1, always-multiline], prefer-object-spread/prefer-object-spread: 0 */
/* eslint-disable no-console */

console.log(__filename);

const assert = require('assert');
const path = require('path');
const glob = require('glob');

const pathRules = require('../lib/path-rules');

//---

const includedFiles = pathRules.getIncludedFiles();

assert.ok(includedFiles.includes(__filename));

// If this file ever moves, just pick anything else that's in a VendorLib dir.
const pathToVendorLibFile =
  require.resolve('../../nuclide-fuzzy-native/VendorLib/fuzzy-native/lib/main.js');
assert.ok(!includedFiles.includes(pathToVendorLibFile));

const pathToNuclideFile =
  require.resolve('../../nuclide-fuzzy-native/lib/main.js');
assert.ok(includedFiles.includes(pathToNuclideFile));

//---

// This test verifies that `getIncludedFiles` and `isIncluded` ignore the same
// things.

const expectedFiles = pathRules.getIncludedFiles().sort();
const allFiles = glob.sync(path.join(__dirname, '../../../**/*.js')).sort();

assert.notDeepEqual(expectedFiles, allFiles);

for (let i = allFiles.length - 1; i >= 0; i--) {
  if (!pathRules.isIncluded(allFiles[i])) {
    allFiles.splice(i, 1);
  }
}

assert.deepEqual(expectedFiles, allFiles);
