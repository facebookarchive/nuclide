"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getInitializationOptions = getInitializationOptions;
exports.resolveCacheDir = resolveCacheDir;
exports.createCacheDir = createCacheDir;

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

var _os = _interopRequireDefault(require("os"));

function _fsPromise() {
  const data = _interopRequireDefault(require("../../../../modules/nuclide-commons/fsPromise"));

  _fsPromise = function () {
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
const CQUERY_CACHE_DIR = '.cquery_cache';

function staticInitializationOptions() {
  // Copied from the corresponding vs-code plugin
  return {
    resourceDirectory: '',
    discoverSystemIncludes: false,
    showDocumentLinksOnIncludes: false,
    // Nuclide-specific option.
    disableInitialIndex: true,
    progressReportFrequencyMs: 500,
    clientVersion: 3,
    codeLens: {
      localVariables: false
    },
    completion: {
      enableSnippets: true,
      includeBlacklist: []
    },
    diagnostics: {
      blacklist: [],
      onParse: true,
      onType: true
    },
    index: {
      blacklist: []
    }
  };
}

function getInitializationOptions(cacheDirectory, compilationDatabaseDirectory, extraClangArguments = []) {
  let options = Object.assign({}, staticInitializationOptions(), {
    cacheDirectory,
    compilationDatabaseDirectory,
    extraClangArguments
  });

  try {
    // $FlowFB
    options = require("./fb-init-options").default(options);
  } catch (e) {}

  return options;
}

function resolveCacheDir(rootDir) {
  return _nuclideUri().default.join(_os.default.tmpdir(), 'cquery', _nuclideUri().default.split(rootDir).join('@'), CQUERY_CACHE_DIR);
}

async function createCacheDir(rootDir) {
  const dir = resolveCacheDir(rootDir);
  await _fsPromise().default.mkdirp(dir);
  return dir;
}