'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _process;

function _load_process() {
  return _process = require('nuclide-commons/process');
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

exports.default = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (src, libclangPath = null) {
    if (fbFindClangServerArgs === undefined) {
      fbFindClangServerArgs = null;
      try {
        // $FlowFB
        fbFindClangServerArgs = require('./fb/find-clang-server-args').default;
      } catch (e) {
        // Ignore.
      }
    }

    let libClangLibraryFile;
    if (process.platform === 'darwin') {
      try {
        const stdout = yield (0, (_process || _load_process()).runCommand)('xcode-select', ['--print-path']).toPromise();
        libClangLibraryFile = stdout.trim();
        // If the user only has Xcode Command Line Tools installed, the path is different.
        if ((_nuclideUri || _load_nuclideUri()).default.basename(libClangLibraryFile) !== 'CommandLineTools') {
          libClangLibraryFile += '/Toolchains/XcodeDefault.xctoolchain';
        }
        libClangLibraryFile += '/usr/lib/libclang.dylib';
      } catch (err) {}
    }

    // TODO(asuarez): Fix this when we have server-side settings.
    if (global.atom) {
      const path = atom.config.get('nuclide.nuclide-clang.libclangPath');
      // flowlint-next-line sketchy-null-string:off
      if (path) {
        libClangLibraryFile = path.trim();
      }
    }

    let clangServerArgs = {
      libClangLibraryFile,
      pythonExecutable: 'python2.7',
      pythonPathEnv: (_nuclideUri || _load_nuclideUri()).default.join(__dirname, '../VendorLib')
    };

    if (typeof fbFindClangServerArgs === 'function') {
      const clangServerArgsOverrides = yield fbFindClangServerArgs(src);
      clangServerArgs = Object.assign({}, clangServerArgs, clangServerArgsOverrides);
    }

    if (libclangPath != null) {
      clangServerArgs.libClangLibraryFile = libclangPath;
    }
    return clangServerArgs;
  });

  function findClangServerArgs(_x) {
    return _ref.apply(this, arguments);
  }

  return findClangServerArgs;
})();