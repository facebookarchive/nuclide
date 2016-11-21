'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {FileSearchResult} from './rpc-types';

import os from 'os';
import {makeRe} from 'minimatch';
import nuclideUri from '../../commons-node/nuclideUri';
import {Matcher} from '../../nuclide-fuzzy-native';

export class PathSet {
  _matcher: Matcher;
  _ignoredPatterns: Array<RegExp>;
  _rootPath: string;

  constructor(
    paths: Array<string>,
    ignoredNames: Array<string>,
    rootPath: string,
  ) {
    this._ignoredPatterns = ignoredNames
      .map(name => makeRe(name, {matchBase: true, dot: true}))
      // makeRe returns false for invalid patterns.
      .filter(x => x);
    this._matcher = new Matcher(paths.filter(path => !this._isIgnored(path)));
    this._rootPath = rootPath;
  }

  addPaths(paths: Array<string>) {
    this._matcher.addCandidates(paths.filter(path => !this._isIgnored(path)));
  }

  removePaths(paths: Array<string>) {
    this._matcher.removeCandidates(paths);
  }

  query(query: string): Array<FileSearchResult> {
    // Attempt to relativize paths that people might e.g. copy + paste.
    let relQuery = query;
    // Remove the leading home directory qualifier.
    if (relQuery.startsWith('~/')) {
      relQuery = relQuery.substr(2);
    }
    // If a full path is pasted, make the path relative.
    const rootPath = nuclideUri.ensureTrailingSeparator(this._rootPath);
    if (relQuery.startsWith(rootPath)) {
      relQuery = relQuery.substr(rootPath.length);
    } else {
      // Also try to relativize queries that start with the dirname alone.
      const dirname = nuclideUri.dirname(this._rootPath);
      if (relQuery.startsWith(nuclideUri.ensureTrailingSeparator(dirname))) {
        relQuery = relQuery.substr(dirname.length + 1);
      }
    }

    return this._matcher
      .match(relQuery, {
        maxResults: 20,
        numThreads: os.cpus().length,
        recordMatchIndexes: true,
      })
      // Expand the search results to the full path.
      .map(result => {
        let {matchIndexes} = result;
        if (matchIndexes != null) {
          matchIndexes = matchIndexes
            .map(idx => idx + rootPath.length);
        }
        return {
          score: result.score,
          path: rootPath + result.value,
          matchIndexes: matchIndexes || [],
        };
      });
  }

  _isIgnored(path: string): boolean {
    // This is 2x as fast as using Array.some...
    for (let i = 0; i < this._ignoredPatterns.length; i++) {
      if (this._ignoredPatterns[i].test(path)) {
        return true;
      }
    }
    return false;
  }
}
