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

import type {CqueryProject} from './types';

import nuclideUri from 'nuclide-commons/nuclideUri';
import os from 'os';
import fsPromise from '../../../modules/nuclide-commons/fsPromise';
import fs from 'fs';

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
    clientVersion: 3,
  };
}

export async function getInitializationOptions(
  project: CqueryProject,
): Promise<?Object> {
  if (project.hasCompilationDb) {
    return getInitializationOptionsWithCompilationDb(
      project.projectRoot,
      project.compilationDbDir,
    );
  } else if (project.defaultFlags != null) {
    return getInitializationOptionsWithoutCompilationDb(
      project.projectRoot,
      project.defaultFlags,
    );
  }
  return null;
}

async function getInitializationOptionsWithCompilationDb(
  projectRoot: string,
  compilationDbDir: string,
): Promise<Object> {
  return {
    ...staticInitializationOptions(),
    compilationDatabaseDirectory: compilationDbDir,
    cacheDirectory: await verifyOrCreateFallbackCacheDir(
      nuclideUri.join(compilationDbDir, CQUERY_CACHE_DIR),
    ),
  };
}

async function getInitializationOptionsWithoutCompilationDb(
  projectRoot: string,
  defaultFlags: string[],
): Promise<Object> {
  return {
    ...staticInitializationOptions(),
    extraClangArguments: defaultFlags,
    cacheDirectory: await verifyOrCreateFallbackCacheDir(
      nuclideUri.join(projectRoot, CQUERY_CACHE_DIR),
    ),
  };
}

async function verifyOrCreateFallbackCacheDir(cacheDir: string) {
  // If the cache directory can't be created, then we fallback to putting it
  // in the system's tempdir. This makes caching unreliable but otherwise
  // cquery would crash.
  if (!await fsPromise.access(cacheDir, fs.W_OK + fs.R_OK)) {
    return nuclideUri.join(os.tmpdir(), cacheDir);
  }
  return cacheDir;
}
