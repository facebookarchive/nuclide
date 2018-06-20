'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getInitializationOptions = getInitializationOptions;
exports.createCacheDir = createCacheDir;

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _os = _interopRequireDefault(require('os'));

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('../../../modules/nuclide-commons/fsPromise'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const CQUERY_CACHE_DIR = '.cquery_cache'; /**
                                           * Copyright (c) 2015-present, Facebook, Inc.
                                           * All rights reserved.
                                           *
                                           * This source code is licensed under the license found in the LICENSE file in
                                           * the root directory of this source tree.
                                           *
                                           * 
                                           * @format
                                           */

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
      onType: false
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
    options = require('./fb-init-options').default(options);
  } catch (e) {}
  return options;
}

async function createCacheDir(rootDir) {
  const dir = (_nuclideUri || _load_nuclideUri()).default.join(_os.default.tmpdir(), 'cquery', (_nuclideUri || _load_nuclideUri()).default.split(rootDir).join('@'), CQUERY_CACHE_DIR);
  await (_fsPromise || _load_fsPromise()).default.mkdirp(dir);
  return dir;
}