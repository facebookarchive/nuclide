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

import type {CodeSearchResult} from './types';
import type {NuclideUri} from 'nuclide-commons/nuclideUri';

import {search as agAckSearch} from './AgAckHandler';
import {search as grepSearch} from './GrepHandler';
import {search as rgSearch} from './RgHandler';
import {search as vcsSearch} from './VcsSearchHandler';
import {Minimatch} from 'minimatch';
import fsPromise from 'nuclide-commons/fsPromise';
import nuclideUri from 'nuclide-commons/nuclideUri';
import {asyncFind} from 'nuclide-commons/promise';
import which from 'nuclide-commons/which';
import os from 'os';
import {Observable} from 'rxjs';

export const WINDOWS_TOOLS = ['rg', 'grep'];
export const POSIX_TOOLS = ['ag', 'rg', 'ack', 'grep'];

const searchToolHandlers = new Map([
  [
    'ag',
    (directory: string, query: RegExp) => agAckSearch(directory, query, 'ag'),
  ],
  [
    'ack',
    (directory: string, query: RegExp) => agAckSearch(directory, query, 'ack'),
  ],
  ['rg', rgSearch],
  ['grep', grepSearch],
]);

export async function resolveTool(tool: ?string): Promise<?string> {
  if (tool != null) {
    return tool;
  }
  return asyncFind(os.platform() === 'win32' ? WINDOWS_TOOLS : POSIX_TOOLS, t =>
    which(t).then(cmd => (cmd != null ? t : null)),
  );
}

async function resolveToolWithDefault(
  tool: ?string,
  defaultTool: string,
): Promise<string> {
  const resolvedTool = await resolveTool(tool);
  return resolvedTool == null ? defaultTool : resolvedTool;
}

export function searchInDirectory(
  directory: NuclideUri,
  regex: RegExp,
  tool: ?string,
  useVcsSearch: boolean,
): Observable<CodeSearchResult> {
  return useVcsSearch
    ? vcsSearch(directory, regex).catch(() =>
        searchWithTool(tool, directory, regex),
      )
    : searchWithTool(tool, directory, regex);
}

export function searchWithTool(
  tool: ?string,
  directory: NuclideUri,
  regex: RegExp,
): Observable<CodeSearchResult> {
  return Observable.defer(() => resolveTool(tool)).switchMap(actualTool => {
    const handler = searchToolHandlers.get(actualTool);
    if (handler != null) {
      return handler(directory, regex);
    }
    return Observable.empty();
  });
}

export function searchInDirectories(
  directory: NuclideUri,
  regex: RegExp,
  subdirs: Array<string>,
  useVcsSearch: boolean,
  tool?: string,
): Observable<CodeSearchResult> {
  // Resolve tool once here so we do not call 'which' for each subdir.
  return Observable.defer(() => resolveToolWithDefault(tool, '')).switchMap(
    actualTool => {
      if (!subdirs || subdirs.length === 0) {
        // Since no subdirs were specified, run search on the root directory.
        return searchInDirectory(directory, regex, tool, useVcsSearch);
      } else if (subdirs.find(subdir => subdir.includes('*'))) {
        // Mimic Atom and use minimatch for glob matching.
        const matchers = subdirs.map(subdir => {
          let pattern = subdir;
          if (!pattern.includes('*')) {
            // Automatically glob-ify the non-globs.
            pattern = nuclideUri.ensureTrailingSeparator(pattern) + '**';
          }
          return new Minimatch(pattern, {matchBase: true, dot: true});
        });
        // TODO: This should walk the subdirectories and filter by glob before searching.
        return searchInDirectory(directory, regex, tool, useVcsSearch).filter(
          result =>
            Boolean(matchers.find(matcher => matcher.match(result.file))),
        );
      } else {
        // Run the search on each subdirectory that exists.
        return Observable.from(subdirs)
          .concatMap(async subdir => {
            try {
              const stat = await fsPromise.lstat(
                nuclideUri.join(directory, subdir),
              );
              if (stat.isDirectory()) {
                return searchInDirectory(
                  nuclideUri.join(directory, subdir),
                  regex,
                  tool,
                  useVcsSearch,
                );
              } else {
                return Observable.empty();
              }
            } catch (e) {
              return Observable.empty();
            }
          })
          .mergeAll();
      }
    },
  );
}
