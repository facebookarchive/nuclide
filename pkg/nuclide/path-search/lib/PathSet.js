'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {MatchResult} from '../../fuzzy-native';

import os from 'os';
import {Matcher} from '../../fuzzy-native';

export class PathSet {
  _matcher: Matcher;

  constructor(paths: Array<string>) {
    this._matcher = new Matcher(paths);
  }

  addPaths(paths: Array<string>) {
    this._matcher.addCandidates(paths);
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
}
