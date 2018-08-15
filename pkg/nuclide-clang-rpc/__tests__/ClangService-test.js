"use strict";

function _() {
  const data = require("..");

  _ = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _testHelpers() {
  const data = require("../../../modules/nuclide-commons/test-helpers");

  _testHelpers = function () {
    return data;
  };

  return data;
}

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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 * @emails oncall+nuclide
 */
describe('ClangService.formatCode', () => {
  it('uses clang-format correctly', async () => {
    const fixtureCode = await _fsPromise().default.readFile(_nuclideUri().default.join(__dirname, '../__mocks__/fixtures/cpp_buck_project/test.cpp'), 'utf8');
    const projectDir = await (0, _testHelpers().generateFixture)('project', new Map([['test.cpp', fixtureCode]]));

    const testFile = _nuclideUri().default.join(projectDir, 'test.cpp');

    const spy = jest.spyOn(require("../../../modules/nuclide-commons/process"), 'runCommand').mockReturnValue(_RxMin.Observable.of('{ "Cursor": 4, "Incomplete": false }\ntest2'));
    const result = await (0, _().formatCode)(testFile, 'test', 1, 2, 3);
    expect(result).toEqual({
      newCursor: 4,
      formatted: 'test2'
    });
    expect(spy).toHaveBeenCalledWith('clang-format', ['-style=file', '-assume-filename=' + testFile, '-cursor=1', '-offset=2', '-length=3'], {
      input: 'test'
    });
  });
});