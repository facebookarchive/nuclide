'use strict';

var _;

function _load_() {
  return _ = require('..');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _testHelpers;

function _load_testHelpers() {
  return _testHelpers = require('../../../modules/nuclide-commons/test-helpers');
}

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('../../../modules/nuclide-commons/fsPromise'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('ClangService.formatCode', () => {
  it('uses clang-format correctly', async () => {
    await (async () => {
      const fixtureCode = await (_fsPromise || _load_fsPromise()).default.readFile((_nuclideUri || _load_nuclideUri()).default.join(__dirname, '../__mocks__/fixtures/cpp_buck_project/test.cpp'), 'utf8');
      const projectDir = await (0, (_testHelpers || _load_testHelpers()).generateFixture)('project', new Map([['test.cpp', fixtureCode]]));
      const testFile = (_nuclideUri || _load_nuclideUri()).default.join(projectDir, 'test.cpp');
      const spy = jest.spyOn(require('../../../modules/nuclide-commons/process'), 'runCommand').mockReturnValue(_rxjsBundlesRxMinJs.Observable.of('{ "Cursor": 4, "Incomplete": false }\ntest2'));
      const result = await (0, (_ || _load_()).formatCode)(testFile, 'test', 1, 2, 3);
      expect(result).toEqual({
        newCursor: 4,
        formatted: 'test2'
      });
      expect(spy).toHaveBeenCalledWith('clang-format', ['-style=file', '-assume-filename=' + testFile, '-cursor=1', '-offset=2', '-length=3'], { input: 'test' });
    })();
  });
}); /**
     * Copyright (c) 2015-present, Facebook, Inc.
     * All rights reserved.
     *
     * This source code is licensed under the license found in the LICENSE file in
     * the root directory of this source tree.
     *
     *  strict-local
     * @format
     */