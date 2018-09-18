"use strict";

function _nullthrows() {
  const data = _interopRequireDefault(require("nullthrows"));

  _nullthrows = function () {
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

function _ClangFlagsManager() {
  const data = _interopRequireDefault(require("../lib/ClangFlagsManager"));

  _ClangFlagsManager = function () {
    return data;
  };

  return data;
}

function _nuclideTestHelpers() {
  const data = require("../../../pkg/nuclide-test-helpers");

  _nuclideTestHelpers = function () {
    return data;
  };

  return data;
}

var _path = _interopRequireDefault(require("path"));

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
jest.setTimeout(70000);
let flagsManager;
let compilationDatabase;
let requestSettings;
let emptyRequestSettings;
let testDir;
beforeEach(async () => {
  global.performance.mark = jest.fn();
  global.performance.measure = jest.fn();
  global.performance.clearMarks = jest.fn();
  global.performance.clearMeasures = jest.fn();
  testDir = await (0, _nuclideTestHelpers().copyFixture)('cpp_buck_project', _path.default.resolve(__dirname, '../__mocks__'));
  flagsManager = new (_ClangFlagsManager().default)();
  compilationDatabase = {
    file: _nuclideUri().default.join(testDir, 'compile_commands.json'),
    flagsFile: _nuclideUri().default.join(testDir, 'BUCK'),
    libclangPath: null
  };
  requestSettings = {
    compilationDatabase,
    projectRoot: null
  };
  emptyRequestSettings = {
    compilationDatabase: null,
    projectRoot: null
  };
});
it('gets flags for header files', async () => {
  let result = await flagsManager.getFlagsForSrc('header.h', requestSettings);
  const expectedFlags = ['g++', '-fPIC', '-O3', '-x', 'c++'];
  expect((0, _nullthrows().default)(result).flags).toEqual(expectedFlags);
  result = await flagsManager.getFlagsForSrc('header.hpp', requestSettings);
  expect((0, _nullthrows().default)(result).flags).toEqual(expectedFlags); // When headers are not properly owned, we should look for source files
  // in the same directory.

  result = await flagsManager.getFlagsForSrc(_nuclideUri().default.join(testDir, 'testInternal.h'), emptyRequestSettings);
  expect((0, _nullthrows().default)(result).flags).toEqual(expectedFlags);
  result = await flagsManager.getFlagsForSrc(_nuclideUri().default.join(testDir, 'test-inl.h'), emptyRequestSettings);
  expect((0, _nullthrows().default)(result).flags).toEqual(expectedFlags);
  result = await flagsManager.getFlagsForSrc(_nuclideUri().default.join(testDir, 'test2.h'), emptyRequestSettings);
  expect((0, _nullthrows().default)(result).flags).not.toBeNull();
});