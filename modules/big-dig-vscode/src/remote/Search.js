/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import type {FileSearchProvider, TextSearchProvider} from 'vscode';

import * as vscode from 'vscode';
import pathModule from 'path';
import {arrayFlatten} from 'nuclide-commons/collection';
import {observableFromSubscribeFunction} from 'nuclide-commons/event';
import {getLogger} from 'log4js';

import {getConnectedFilesystems} from './state';
import {ConnectionWrapper} from '../ConnectionWrapper';
import {RemoteFileSystem} from '../RemoteFileSystem';

const logger = getLogger('search');

export function startSearchProviders(): IDisposable {
  const searcher = new Search();
  // TODO(hansonw): Remove after 1.26 is deployed.
  if (vscode.workspace.registerFileSearchProvider != null) {
    return vscode.Disposable.from(
      vscode.workspace.registerFileSearchProvider('big-dig', searcher),
      vscode.workspace.registerTextSearchProvider('big-dig', searcher),
    );
  } else {
    return vscode.workspace.registerSearchProvider('big-dig', searcher);
  }
}

// TODO(hansonw): Split after deploying 1.26.
class Search implements FileSearchProvider, TextSearchProvider {
  async provideFileSearchResults(
    query: vscode.FileSearchQuery,
    options: vscode.FileSearchOptions,
    token: vscode.CancellationToken,
    token123Compat?: vscode.CancellationToken,
  ): Promise<Array<vscode.Uri>> {
    // For compatibility with 1.23's provideFileSearchResults:
    // https://github.com/Microsoft/vscode/blob/1.23.1/src/vs/vscode.proposed.d.ts#L75
    if (typeof query === 'string' && token123Compat != null) {
      const results = await Promise.all(
        getConnectedFilesystems().map(({fs, conn}) =>
          this._fileSearch(fs, conn, query, token123Compat),
        ),
      );
      for (const uri of arrayFlatten(results)) {
        ((token: any): vscode.Progress<vscode.Uri>).report(uri);
      }
      return [];
    } else {
      // TODO: (hansonw) T31478806 Actually use the fields in FileSearchOptions.
      const results = await Promise.all(
        getConnectedFilesystems().map(({fs, conn}) =>
          this._fileSearch(fs, conn, query.pattern, token),
        ),
      );
      return arrayFlatten(results);
    }
  }

  async provideTextSearchResults(
    query: vscode.TextSearchQuery,
    options: vscode.TextSearchOptions,
    progress: vscode.Progress<vscode.TextSearchResult>,
    token: vscode.CancellationToken,
  ): Promise<void> {
    await Promise.all(
      getConnectedFilesystems().map(({fs, conn}) =>
        this._textSearch(fs, conn, query, options, progress, token),
      ),
    );
  }

  async _fileSearch(
    fs: RemoteFileSystem,
    conn: ConnectionWrapper,
    query: string,
    token: vscode.CancellationToken,
  ): Promise<vscode.Uri[]> {
    const basePaths = fs
      .getWorkspaceFolders()
      .map(({uri}) => fs.uriToPath(uri));
    if (basePaths.length === 0) {
      // No work to do.
      return [];
    }

    const allResults = await Promise.all(
      // TODO(T29797318): the RPC should support multiple base paths
      basePaths.map(async path => {
        const results = await conn.searchForFiles(path, query);
        if (token.isCancellationRequested) {
          return [];
        }
        return results.results.map(result => fs.pathToUri(result));
      }),
    ).catch(error => {
      logger.warn(`Could not search ${conn.getAddress()}: ${error.message}`);
      return [];
    });

    return arrayFlatten(allResults);
  }

  async _textSearch(
    fs: RemoteFileSystem,
    conn: ConnectionWrapper,
    query: vscode.TextSearchQuery,
    options: vscode.TextSearchOptions,
    progress: vscode.Progress<vscode.TextSearchResult>,
    token: vscode.CancellationToken,
  ): Promise<void> {
    const paths = fs.getWorkspaceFolders().map(({uri}) => fs.uriToPath(uri));
    if (paths.length === 0) {
      // No work to do.
      return;
    }

    // TODO: (hansonw) T31478806 Use new fields in TextSearchOptions.
    const includes = getGlobalPatterns(options.includes);
    const excludes = getGlobalPatterns(options.excludes);
    const basePaths = paths.map(path => ({
      path,
      includes: [...includes, ...resolveGlobPatterns(path, options.includes)],
      excludes: [...excludes, ...resolveGlobPatterns(path, options.excludes)],
    }));
    return conn
      .searchForText({
        query: query.pattern,
        basePaths,
        options: {
          isRegExp: query.isRegExp || false,
          isCaseSensitive: query.isCaseSensitive || false,
          isWordMatch: query.isWordMatch || false,
        },
      })
      .do(match => {
        progress.report({
          uri: fs.pathToUri(match.path),
          range: match.range,
          preview: {
            // For compatibility with 1.23's TextSearchResultPreview:
            // https://github.com/Microsoft/vscode/blob/1.23.1/src/vs/vscode.proposed.d.ts#L71
            ...match.preview,
            text:
              match.preview.leading +
              match.preview.matching +
              match.preview.trailing,
            match: match.range,
          },
        });
      })
      .takeUntil(
        observableFromSubscribeFunction(cb =>
          token.onCancellationRequested(cb),
        ),
      )
      .ignoreElements()
      .toPromise()
      .catch(error =>
        logger.warn(`Could not search ${conn.getAddress()}: ${error.message}`),
      );
  }
}

/**
 * Filters out the patterns that are specifically applicable under `basePath`.
 * Plain string patterns are also filtered. `RelativePattern` is filtered out if
 * its `base` is not a subpath of `basePath`.
 *
 * TODO(siegebell): this is our current best-guess on the semantics of
 * `RelativePattern`, but we need to double-check.
 */
function resolveGlobPatterns(
  basePath: string,
  patterns: Array<vscode.GlobPattern>,
): Array<string> {
  return (
    patterns
      // Remove globally-applicable patterns:
      .map(pattern => (typeof pattern === 'string' ? null : pattern))
      .filter(Boolean)
      // Keep only patterns that are under `basePath`:
      .map(pattern => {
        const relPattern = pathModule.relative(basePath, pattern.base);
        if (relPattern == null || relPattern.startsWith('..')) {
          return null;
        } else {
          return pattern.pattern;
        }
      })
      .filter(Boolean)
  );
}

/**
 * Extract the patterns that are global across all base paths (i.e. are not
 * `RelativePattern`s).
 */
function getGlobalPatterns(patterns: Array<vscode.GlobPattern>): Array<string> {
  return patterns.map(p => (typeof p === 'string' ? p : null)).filter(Boolean);
}
