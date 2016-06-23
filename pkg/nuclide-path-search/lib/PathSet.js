'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {MatchResult} from '../../nuclide-fuzzy-native';

import os from 'os';
import {makeRe} from 'minimatch';
import {Matcher} from '../../nuclide-fuzzy-native';

export class PathSet {
  _matcher: Matcher;
  _ignoredPatterns: Array<RegExp>;

  constructor(
    paths: Array<string>,
    ignoredNames: Array<string>,
  ) {
    this._ignoredPatterns = ignoredNames
      .map(name => makeRe(name, {matchBase: true, dot: true}))
      // makeRe returns false for invalid patterns.
      .filter(x => x);
    this._matcher = new Matcher(paths.filter(path => !this._isIgnored(path)));
  }

  addPaths(paths: Array<string>) {
    this._matcher.addCandidates(paths.filter(path => !this._isIgnored(path)));
  }

  removePaths(paths: Array<string>) {
    this._matcher.removeCandidates(paths);
  }

  match(query: string): Array<MatchResult> {
    return this._matcher.match(query, {
      maxResults: 20,
      numThreads: os.cpus().length,
      recordMatchIndexes: true,
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
