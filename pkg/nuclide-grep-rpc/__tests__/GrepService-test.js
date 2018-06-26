'use strict';

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('../../../modules/nuclide-commons/fsPromise'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _testHelpers;

function _load_testHelpers() {
  return _testHelpers = require('../../../modules/nuclide-commons/test-helpers');
}

var _;

function _load_() {
  return _ = require('..');
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
 */

describe('GrepService.grepReplace', () => {
  let tempDir;
  beforeEach(async () => {
    tempDir = await (0, (_testHelpers || _load_testHelpers()).generateFixture)('grepReplace', new Map([['test.txt', 'test\ntest2\n'], ['nomatch.txt', 'nomatch']]));
  });

  it('can find and replace matches', async () => {
    const results = await (0, (_ || _load_()).grepReplace)([(_nuclideUri || _load_nuclideUri()).default.join(tempDir, 'test.txt'), (_nuclideUri || _load_nuclideUri()).default.join(tempDir, 'nomatch.txt'), (_nuclideUri || _load_nuclideUri()).default.join(tempDir, 'nonexistent.txt')], /test/g, 'replace').refCount().toArray().toPromise();

    expect(results.sort((a, b) => a.filePath.localeCompare(b.filePath))).toEqual([{
      type: 'success',
      filePath: (_nuclideUri || _load_nuclideUri()).default.join(tempDir, 'nomatch.txt'),
      replacements: 0
    }, {
      type: 'error',
      filePath: (_nuclideUri || _load_nuclideUri()).default.join(tempDir, 'nonexistent.txt'),
      message: jasmine.any(String)
    }, {
      type: 'success',
      filePath: (_nuclideUri || _load_nuclideUri()).default.join(tempDir, 'test.txt'),
      replacements: 2
    }]);

    expect((await (_fsPromise || _load_fsPromise()).default.readFile((_nuclideUri || _load_nuclideUri()).default.join(tempDir, 'test.txt'), 'utf8'))).toBe('replace\nreplace2\n');
    expect((await (_fsPromise || _load_fsPromise()).default.readFile((_nuclideUri || _load_nuclideUri()).default.join(tempDir, 'nomatch.txt'), 'utf8'))).toBe('nomatch');
  });
});