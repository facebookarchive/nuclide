/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import nuclideUri from 'nuclide-commons/nuclideUri';
import os from 'os';
import fsPromise from 'nuclide-commons/fsPromise';

const CQUERY_CACHE_DIR = '.cquery_cache';

// TODO pelmers: expose some of these in the atom config
function staticInitializationOptions(): Object {
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
    clientVersion: 3,
  };
}

export function getInitializationOptions(
  cacheDirectory: string,
  compilationDatabaseDirectory: string,
): Object {
  let options = {
    ...staticInitializationOptions(),
    cacheDirectory,
    compilationDatabaseDirectory,
  };
  try {
    // $FlowFB
    options = require('./fb-init-options').default(options);
  } catch (e) {}
  return options;
}

export async function createCacheDir(rootDir: string) {
  const dir = nuclideUri.join(
    os.tmpdir(),
    'cquery',
    nuclideUri.split(rootDir).join('@'),
    CQUERY_CACHE_DIR,
  );
  await fsPromise.mkdirp(dir);
  return dir;
}
