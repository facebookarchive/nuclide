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

function _utils() {
  const data = require("../lib/utils");

  _utils = function () {
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
jest.setTimeout(30000);
describe('ClangFlagsManager', () => {
  let flagsManager;
  let compilationDatabase;
  let requestSettings;
  let emptyRequestSettings;
  let testDir;
  beforeEach(async () => {
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
  it('sanitizeCommand()', () => {
    const originalArgs = ['/usr/bin/clang', '-mios-simulator-version-min=7.0', '-c', '-x', 'objective-c', '-std=gnu11', '-Wno-deprecated', '-Wno-conversion', '-fobjc-arc', '-F', 'local/path', '-F', '/absolute/path', '-Flocal/path', '-F/absolute/path', '-MF', '/path/to/Makefile', '-I', 'local/path', '-I', '/absolute/path', '-Ilocal/path', '-I/absolute/path', '-include', 'local/path', '-include-pch', 'local/path', '-include', '/absolute/path', // This is nonsensical, but should not be transformed.
    '-include/absolute/path', '-iquote', 'local/path', '-iquote', '/absolute/path', '-isysroot', 'local/path', '-isysroot', '/absolute/path', '-isystem', 'local/path', '-isystem', '/absolute/path', '-fmodules-cache-path=local/path', '-o', 'buck-out/local/path/EXExample.o', 'local/path/EXExample.m'];
    const buckProjectRoot = '/Users/whoami/project/';
    const sanitizedCommandArgs = flagsManager.sanitizeEntry({
      file: '/Users/whoami/project/local/path/EXExample.m',
      arguments: originalArgs,
      directory: buckProjectRoot
    }, _nuclideUri().default.join(buckProjectRoot, 'BUCK')).flags;
    const expectedArgs = ['/usr/bin/clang', '-mios-simulator-version-min=7.0', '-c', '-x', 'objective-c', '-std=gnu11', '-Wno-deprecated', '-Wno-conversion', '-fobjc-arc', '-F', buckProjectRoot + 'local/path', '-F', '/absolute/path', '-F' + buckProjectRoot + 'local/path', '-F/absolute/path', '-I', buckProjectRoot + 'local/path', '-I', '/absolute/path', '-I' + buckProjectRoot + 'local/path', '-I/absolute/path', '-include', buckProjectRoot + 'local/path', '-include-pch', buckProjectRoot + 'local/path', '-include', '/absolute/path', '-include/absolute/path', '-iquote', buckProjectRoot + 'local/path', '-iquote', '/absolute/path', '-isysroot', buckProjectRoot + 'local/path', '-isysroot', '/absolute/path', '-isystem', buckProjectRoot + 'local/path', '-isystem', '/absolute/path', `-fmodules-cache-path=${buckProjectRoot}local/path`];
    expect(sanitizedCommandArgs).toEqual(expectedArgs);
  });
  it.skip('gets flags for a source file', async () => {
    const expectedFlags = ['g++', '-fPIC', '-O3', '-x', 'c++'];

    const srcPath = _nuclideUri().default.join(testDir, 'test.cpp');

    let result = await flagsManager.getFlagsForSrc(srcPath, requestSettings);
    expect((0, _nullthrows().default)(result).flags).toEqual(expectedFlags);
    expect((0, _nullthrows().default)(result).flagsFile).toEqual(_nuclideUri().default.join(testDir, 'BUCK'));
    result = await flagsManager.getFlagsForSrc('test.h', requestSettings);
    expect((0, _nullthrows().default)(result).flags).toEqual(expectedFlags); // Make sure cache gets reset.

    flagsManager.reset();
    result = await flagsManager.getFlagsForSrc(srcPath, requestSettings);
    expect((0, _nullthrows().default)(result).flags).toEqual(expectedFlags);
  });
  it('supports negative caching', async () => {
    // Unowned projects shouldn't invoke Buck again.
    let result = await flagsManager.getFlagsForSrc('test', requestSettings);
    expect((0, _nullthrows().default)(result).flags).toEqual([]);
    result = await flagsManager.getFlagsForSrc('test', requestSettings);
    expect((0, _nullthrows().default)(result).flags).toEqual([]);
  });
  it('gets flags from the compilation database', async () => {
    const expectedFlags = ['g++', '-fPIC', '-O3', '-x', 'c++'];

    let testFile = _nuclideUri().default.join(testDir, 'test.cpp');

    let result = await flagsManager.getFlagsForSrc(testFile, emptyRequestSettings);
    expect((0, _nullthrows().default)(result).flags).toEqual(expectedFlags);
    testFile = _nuclideUri().default.join(testDir, 'test.h');
    result = await flagsManager.getFlagsForSrc(testFile, emptyRequestSettings);
    expect((0, _nullthrows().default)(result).flags).toEqual(expectedFlags); // Fall back to Buck if it's not in the compilation DB.

    testFile = _nuclideUri().default.join(testDir, 'test2.cpp');
    result = await flagsManager.getFlagsForSrc(testFile, emptyRequestSettings);
    expect((0, _nullthrows().default)(result).flags).toEqual([]);
  });
  it('gets project flags in addition to compilation database flags', async () => {
    const expectedFlags = ['g++', '-fPIC', '-x', 'c++', '-D_THIS_IS_MY_CRAZY_DEFINE', '-O2', '-isystem', '/usr/local/include'];
    const cmakeTestDir = await (0, _nuclideTestHelpers().copyFixture)('cpp_cmake_project', _path.default.resolve(__dirname, '../__mocks__'));

    let testFile = _nuclideUri().default.join(cmakeTestDir, 'test.cpp');

    let result = await flagsManager.getFlagsForSrc(testFile, emptyRequestSettings);
    expect((0, _nullthrows().default)(result).flags).toEqual(expectedFlags);
    testFile = _nuclideUri().default.join(cmakeTestDir, 'test.h');
    result = await flagsManager.getFlagsForSrc(testFile, emptyRequestSettings);
    expect((0, _nullthrows().default)(result).flags).toEqual(expectedFlags);
  });
  it('can guess locations of build files', async () => {
    const file = await (0, _utils().guessBuildFile)(_nuclideUri().default.join(testDir, 'a.cpp'));
    expect(file).toBe(_nuclideUri().default.join(testDir, 'compile_commands.json'));
  });
});