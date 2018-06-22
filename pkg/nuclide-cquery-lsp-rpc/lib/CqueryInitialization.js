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

function staticInitializationOptions(): Object {
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
      localVariables: false,
    },
    completion: {
      enableSnippets: true,
      includeBlacklist: [],
    },
    diagnostics: {
      blacklist: [],
      onParse: true,
      onType: true,
    },
    index: {
      blacklist: [],
    },
  };
}

export function getInitializationOptions(
  cacheDirectory: string,
  compilationDatabaseDirectory: string,
  extraClangArguments: Array<string> = [],
): Object {
  let options = {
    ...staticInitializationOptions(),
    cacheDirectory,
    compilationDatabaseDirectory,
    extraClangArguments,
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
