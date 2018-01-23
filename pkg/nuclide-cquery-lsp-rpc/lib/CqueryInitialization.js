'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getInitializationOptions = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let getInitializationOptions = exports.getInitializationOptions = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (project) {
    if (project.hasCompilationDb) {
      return getInitializationOptionsWithCompilationDb(project.projectRoot, project.compilationDbDir);
    } else if (project.defaultFlags != null) {
      return getInitializationOptionsWithoutCompilationDb(project.projectRoot, project.defaultFlags);
    }
    return null;
  });

  return function getInitializationOptions(_x) {
    return _ref.apply(this, arguments);
  };
})();

let getInitializationOptionsWithCompilationDb = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* (projectRoot, compilationDbDir) {
    return Object.assign({}, staticInitializationOptions(), {
      compilationDatabaseDirectory: compilationDbDir,
      cacheDirectory: yield createCacheDir(compilationDbDir)
    });
  });

  return function getInitializationOptionsWithCompilationDb(_x2, _x3) {
    return _ref2.apply(this, arguments);
  };
})();

let getInitializationOptionsWithoutCompilationDb = (() => {
  var _ref3 = (0, _asyncToGenerator.default)(function* (projectRoot, defaultFlags) {
    return Object.assign({}, staticInitializationOptions(), {
      extraClangArguments: defaultFlags,
      cacheDirectory: yield createCacheDir(projectRoot)
    });
  });

  return function getInitializationOptionsWithoutCompilationDb(_x4, _x5) {
    return _ref3.apply(this, arguments);
  };
})();

let createCacheDir = (() => {
  var _ref4 = (0, _asyncToGenerator.default)(function* (rootDir) {
    const dir = (_nuclideUri || _load_nuclideUri()).default.join(_os.default.tmpdir(), 'cquery', (_nuclideUri || _load_nuclideUri()).default.split(rootDir).join('@'), CQUERY_CACHE_DIR);
    yield (_fsPromise || _load_fsPromise()).default.mkdirp(dir);
    return dir;
  });

  return function createCacheDir(_x6) {
    return _ref4.apply(this, arguments);
  };
})();

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _os = _interopRequireDefault(require('os'));

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('nuclide-commons/fsPromise'));
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

const CQUERY_CACHE_DIR = '.cquery_cache';

// TODO pelmers: expose some of these in the atom config
function staticInitializationOptions() {
  // Copied from the corresponding vs-code plugin
  return {
    indexWhitelist: [],
    indexBlacklist: [],
    extraClangArguments: [],
    resourceDirectory: '',
    maxWorkspaceSearchResults: 1000,
    indexerCount: 0,
    enableIndexing: true,
    enableCacheWrite: true,
    enableCacheRead: true,
    includeCompletionMaximumPathLength: 37,
    includeCompletionWhitelistLiteralEnding: ['.h', '.hpp', '.hh'],
    includeCompletionWhitelist: [],
    includeCompletionBlacklist: [],
    showDocumentLinksOnIncludes: true,
    diagnosticsOnParse: true,
    diagnosticsOnCodeCompletion: true,
    codeLensOnLocalVariables: false,
    enableSnippetInsertion: true,
    clientVersion: 3
  };
}