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

import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {CodeSearchResult} from './types';

import {search as agAckSearch} from './AgAckService';
import {search as rgSearch} from './RgService';
import {search as grepSearch} from './GrepService';
import {search as vcsSearch} from './VcsService';
import {ConnectableObservable, Observable} from 'rxjs';
import {asyncFind} from 'nuclide-commons/promise';
import which from 'nuclide-commons/which';
import {
  isNfs,
  isFuse,
} from '../../nuclide-server/lib/services/FileSystemService';
import os from 'os';

const WINDOWS_TOOLS = ['rg', 'grep'];
const POSIX_TOOLS = ['ag', 'rg', 'ack', 'grep'];

async function resolveTool(tool: ?string): Promise<?string> {
  if (tool != null) {
    return tool;
  }
  return asyncFind(os.platform() === 'win32' ? WINDOWS_TOOLS : POSIX_TOOLS, t =>
    which(t).then(cmd => (cmd != null ? t : null)),
  );
}

export async function isEligibleForDirectory(
  rootDirectory: NuclideUri,
): Promise<boolean> {
  const checks = await Promise.all([
    resolveTool(null).then(tool => tool == null),
    isNfs(rootDirectory),
    isFuse(rootDirectory),
  ]);
  if (checks.some(x => x)) {
    return false;
  }

  return true;
}

const searchToolHandlers = new Map([
  [
    'ag',
    (directory: string, query: string) => agAckSearch(directory, query, 'ag'),
  ],
  [
    'ack',
    (directory: string, query: string) => agAckSearch(directory, query, 'ack'),
  ],
  ['rg', rgSearch],
  ['grep', grepSearch],
]);

export function codeSearch(
  tool: ?string,
  useVcsSearch: boolean,
  directory: NuclideUri,
  query: string,
  maxResults: number,
): ConnectableObservable<CodeSearchResult> {
  return (useVcsSearch
    ? vcsSearch(directory, query).catch(() =>
        searchWithTool(tool, directory, query),
      )
    : searchWithTool(tool, directory, query)
  )
    .take(maxResults)
    .publish();
}

function searchWithTool(
  tool: ?string,
  directory: NuclideUri,
  query: string,
): Observable<CodeSearchResult> {
  return Observable.defer(() => resolveTool(tool)).switchMap(actualTool => {
    const handler = searchToolHandlers.get(actualTool);
    if (handler != null) {
      return handler(directory, query);
    }
    return Observable.empty();
  });
}
