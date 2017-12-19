'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.determineCqueryProject = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let getCompilationDbAndFlagsFile = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (settings, file) {
    const compilationDbDir = yield (0, (_utils || _load_utils()).secondIfFirstIsNull)(getCompilationDbDirFromSettings(settings), (0, _asyncToGenerator.default)(function* () {
      return findNearestCompilationDbDir(file);
    }));
    if (compilationDbDir == null) {
      return { hasCompilationDb: false, defaultFlags: (0, (_libclang || _load_libclang()).getDefaultFlags)() };
    }
    return {
      hasCompilationDb: true,
      compilationDbDir,
      flagsFile: yield (0, (_utils || _load_utils()).secondIfFirstIsNull)(getFlagsFileFromSettings(settings), (0, _asyncToGenerator.default)(function* () {
        return getCompilationDbFile(compilationDbDir);
      }))
    };
  });

  return function getCompilationDbAndFlagsFile(_x, _x2) {
    return _ref.apply(this, arguments);
  };
})();

let determineCqueryProject = exports.determineCqueryProject = (() => {
  var _ref4 = (0, _asyncToGenerator.default)(function* (path) {
    const settings = yield (0, (_libclang || _load_libclang()).getClangRequestSettings)(path);
    const compilationDbAndFlags = yield getCompilationDbAndFlagsFile(settings, path);
    const projectRoot = getProjectRootFromClangRequestSettingsOrAtom(settings, path);
    // We have to do this because flow needs a path in the AST that leads to
    // true/false values for the hasCompilationDb flag.
    return compilationDbAndFlags.hasCompilationDb ? Object.assign({}, compilationDbAndFlags, { projectRoot }) : Object.assign({}, compilationDbAndFlags, { projectRoot });
  });

  return function determineCqueryProject(_x3) {
    return _ref4.apply(this, arguments);
  };
})();

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _libclang;

function _load_libclang() {
  return _libclang = require('../../nuclide-clang/lib/libclang');
}

var _CqueryLanguageServer;

function _load_CqueryLanguageServer() {
  return _CqueryLanguageServer = require('../../nuclide-cquery-lsp-rpc/lib/CqueryLanguageServer');
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _utils;

function _load_utils() {
  return _utils = require('./utils');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// eslint-disable-next-line rulesdir/no-cross-atom-imports
function getProjectRootFromAtom(path) {
  const atomProjectPath = atom.project.relativizePath(path)[0];
  return atomProjectPath != null ? atomProjectPath : (_nuclideUri || _load_nuclideUri()).default.dirname(path);
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */

function getProjectRootFromClangRequestSettingsOrAtom(settings, path) {
  return settings != null && settings.projectRoot != null ? settings.projectRoot : getProjectRootFromAtom(path);
}

function getCompilationDbDirFromSettings(settings) {
  return settings != null && settings.compilationDatabase != null && settings.compilationDatabase.file != null ? (_nuclideUri || _load_nuclideUri()).default.dirname(settings.compilationDatabase.file) : null;
}

function getFlagsFileFromSettings(settings) {
  return settings != null && settings.compilationDatabase != null ? settings.compilationDatabase.flagsFile : null;
}

function findNearestCompilationDbDir(file) {
  return (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getCqueryLSPServiceByNuclideUri)(file).findNearestCompilationDbDir(file);
}

function getCompilationDbFile(compilationDbDir) {
  return (_nuclideUri || _load_nuclideUri()).default.join(compilationDbDir, (_CqueryLanguageServer || _load_CqueryLanguageServer()).COMPILATION_DATABASE_FILE);
}