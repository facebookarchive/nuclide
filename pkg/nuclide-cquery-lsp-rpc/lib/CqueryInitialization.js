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
    cacheDirectory: await createCacheDir(compilationDbDir),
  };
}

async function getInitializationOptionsWithoutCompilationDb(
  projectRoot: string,
  defaultFlags: string[],
): Promise<Object> {
  return {
    ...staticInitializationOptions(),
    extraClangArguments: defaultFlags,
    cacheDirectory: await createCacheDir(projectRoot),
  };
}

async function createCacheDir(rootDir: string) {
  const dir = nuclideUri.join(
    os.tmpdir(),
    'cquery',
    nuclideUri.split(rootDir).join('@'),
    CQUERY_CACHE_DIR,
  );
  await fsPromise.mkdirp(dir);
  return dir;
}
