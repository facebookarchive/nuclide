'use strict';

var _FindReferences;

function _load_FindReferences() {
  return _FindReferences = require('../lib/FindReferences');
}

var _nuclideTestHelpers;

function _load_nuclideTestHelpers() {
  return _nuclideTestHelpers = require('../../nuclide-test-helpers');
}

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */

const projectRoot = '/test/';
const file1Path = '/test/file1.php';
const file2Path = '/test/file2.php';

describe('FindReferences', () => {
  it('convertReferences', () => {
    expect((0, (_FindReferences || _load_FindReferences()).convertReferences)([{
      name: '\\TestClass::testFunction',
      filename: file1Path,
      line: 13,
      char_start: 5,
      char_end: 7
    }, {
      name: '\\TestClass::testFunction',
      filename: file2Path,
      line: 11,
      char_start: 1,
      char_end: 3
    }], projectRoot)).toMatchSnapshot();
  });
});