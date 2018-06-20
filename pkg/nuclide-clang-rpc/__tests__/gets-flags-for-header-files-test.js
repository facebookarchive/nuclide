'use strict';

var _nullthrows;

function _load_nullthrows() {
  return _nullthrows = _interopRequireDefault(require('nullthrows'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _ClangFlagsManager;

function _load_ClangFlagsManager() {
  return _ClangFlagsManager = _interopRequireDefault(require('../lib/ClangFlagsManager'));
}

var _nuclideTestHelpers;

function _load_nuclideTestHelpers() {
  return _nuclideTestHelpers = require('../../../pkg/nuclide-test-helpers');
}

var _utils;

function _load_utils() {
  return _utils = require('../lib/utils');
}

var _path = _interopRequireDefault(require('path'));

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
 */

jest.setTimeout(70000);


let flagsManager;
let compilationDatabase;
let requestSettings;
let emptyRequestSettings;
let testDir;
beforeEach(async () => {
  testDir = await (0, (_nuclideTestHelpers || _load_nuclideTestHelpers()).copyFixture)('cpp_buck_project', _path.default.resolve(__dirname, '../__mocks__'));
  flagsManager = new (_ClangFlagsManager || _load_ClangFlagsManager()).default();
  compilationDatabase = {
    file: (_nuclideUri || _load_nuclideUri()).default.join(testDir, 'compile_commands.json'),
    flagsFile: (_nuclideUri || _load_nuclideUri()).default.join(testDir, 'BUCK'),
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
  expect((0, (_nullthrows || _load_nullthrows()).default)(result).flags).toEqual(expectedFlags);

  result = await flagsManager.getFlagsForSrc('header.hpp', requestSettings);
  expect((0, (_nullthrows || _load_nullthrows()).default)(result).flags).toEqual(expectedFlags);

  // When headers are not properly owned, we should look for source files
  // in the same directory.
  result = await flagsManager.getFlagsForSrc((_nuclideUri || _load_nuclideUri()).default.join(testDir, 'testInternal.h'), emptyRequestSettings);
  expect((0, (_nullthrows || _load_nullthrows()).default)(result).flags).toEqual(expectedFlags);

  result = await flagsManager.getFlagsForSrc((_nuclideUri || _load_nuclideUri()).default.join(testDir, 'test-inl.h'), emptyRequestSettings);
  expect((0, (_nullthrows || _load_nullthrows()).default)(result).flags).toEqual(expectedFlags);

  result = await flagsManager.getFlagsForSrc((_nuclideUri || _load_nuclideUri()).default.join(testDir, 'test2.h'), emptyRequestSettings);
  expect((0, (_nullthrows || _load_nullthrows()).default)(result).flags).not.toBeNull();
});