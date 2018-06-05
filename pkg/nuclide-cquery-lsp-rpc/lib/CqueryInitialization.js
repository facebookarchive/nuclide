'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getInitializationOptions = getInitializationOptions;

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
    progressReportFrequencyMs: 500,
    clientVersion: 3
  };
}

async function getInitializationOptions(project) {
  let options;
  if (project.hasCompilationDb) {
    options = await getInitializationOptionsWithCompilationDb(project.projectRoot, project.compilationDbDir);
  } else if (project.defaultFlags != null) {
    options = await getInitializationOptionsWithoutCompilationDb(project.projectRoot, project.defaultFlags);
  }
  if (options != null) {
    try {
      // $FlowFB
      options = require('./fb-init-options').default(options, project);
    } catch (e) {}
  }
  return options;
}

async function getInitializationOptionsWithCompilationDb(projectRoot, compilationDbDir) {
  return Object.assign({}, staticInitializationOptions(), {
    compilationDatabaseDirectory: compilationDbDir,
    cacheDirectory: await createCacheDir(compilationDbDir)
  });
}

async function getInitializationOptionsWithoutCompilationDb(projectRoot, defaultFlags) {
  return Object.assign({}, staticInitializationOptions(), {
    extraClangArguments: defaultFlags,
    cacheDirectory: await createCacheDir(projectRoot)
  });
}

async function createCacheDir(rootDir) {
  const dir = (_nuclideUri || _load_nuclideUri()).default.join(_os.default.tmpdir(), 'cquery', (_nuclideUri || _load_nuclideUri()).default.split(rootDir).join('@'), CQUERY_CACHE_DIR);
  await (_fsPromise || _load_fsPromise()).default.mkdirp(dir);
  return dir;
}