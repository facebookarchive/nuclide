'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getInitializationOptions = getInitializationOptions;

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

function getInitializationOptions(compilationDbDir) {
  return Object.assign({}, staticInitializationOptions(), {
    compilationDatabaseDirectory: compilationDbDir,
    cacheDirectory: (_nuclideUri || _load_nuclideUri()).default.join(compilationDbDir, 'cquery_cache')
  });
}