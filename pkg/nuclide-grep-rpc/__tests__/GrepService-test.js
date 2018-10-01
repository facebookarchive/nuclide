"use strict";

function _fsPromise() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/fsPromise"));

  _fsPromise = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _testHelpers() {
  const data = require("../../../modules/nuclide-commons/test-helpers");

  _testHelpers = function () {
    return data;
  };

  return data;
}

function _() {
  const data = require("..");

  _ = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 * @emails oncall+nuclide
 */
describe('GrepService.grepReplace', () => {
  let tempDir;
  beforeEach(async () => {
    tempDir = await (0, _testHelpers().generateFixture)('grepReplace', new Map([['test.txt', 'test\ntest2\n'], ['nomatch.txt', 'nomatch']]));
  });
  it('can find and replace matches', async () => {
    const results = await (0, _().grepReplace)([_nuclideUri().default.join(tempDir, 'test.txt'), _nuclideUri().default.join(tempDir, 'nomatch.txt'), _nuclideUri().default.join(tempDir, 'nonexistent.txt')], /test/g, 'replace').refCount().toArray().toPromise();
    expect(results.sort((a, b) => a.filePath.localeCompare(b.filePath))).toEqual([{
      type: 'success',
      filePath: _nuclideUri().default.join(tempDir, 'nomatch.txt'),
      replacements: 0
    }, {
      type: 'error',
      filePath: _nuclideUri().default.join(tempDir, 'nonexistent.txt'),
      message: expect.any(String)
    }, {
      type: 'success',
      filePath: _nuclideUri().default.join(tempDir, 'test.txt'),
      replacements: 2
    }]);
    expect((await _fsPromise().default.readFile(_nuclideUri().default.join(tempDir, 'test.txt'), 'utf8'))).toBe('replace\nreplace2\n');
    expect((await _fsPromise().default.readFile(_nuclideUri().default.join(tempDir, 'nomatch.txt'), 'utf8'))).toBe('nomatch');
  });
});