"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _process() {
  const data = require("../../../modules/nuclide-commons/process");

  _process = function () {
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
 */
let fbFindClangServerArgs;

var findClangServerArgs = async function findClangServerArgs(src, libclangPath = null, configLibclangPath) {
  if (fbFindClangServerArgs === undefined) {
    fbFindClangServerArgs = null;

    try {
      // $FlowFB
      fbFindClangServerArgs = require("./fb/find-clang-server-args").default;
    } catch (e) {// Ignore.
    }
  }

  let libClangLibraryFile;

  if (process.platform === 'darwin') {
    try {
      const stdout = await (0, _process().runCommand)('xcode-select', ['--print-path']).toPromise();
      libClangLibraryFile = stdout.trim(); // If the user only has Xcode Command Line Tools installed, the path is different.

      if (_nuclideUri().default.basename(libClangLibraryFile) !== 'CommandLineTools') {
        libClangLibraryFile += '/Toolchains/XcodeDefault.xctoolchain';
      }

      libClangLibraryFile += '/usr/lib/libclang.dylib';
    } catch (err) {}
  }

  if (configLibclangPath != null) {
    libClangLibraryFile = configLibclangPath.trim();
  }

  let clangServerArgs = {
    libClangLibraryFile,
    pythonExecutable: 'python2.7',
    pythonPathEnv: _nuclideUri().default.join(__dirname, '../VendorLib')
  };

  if (typeof fbFindClangServerArgs === 'function') {
    const clangServerArgsOverrides = await fbFindClangServerArgs(src);
    clangServerArgs = Object.assign({}, clangServerArgs, clangServerArgsOverrides);
  }

  if (libclangPath != null) {
    clangServerArgs.libClangLibraryFile = libclangPath;
  }

  return clangServerArgs;
};

exports.default = findClangServerArgs;