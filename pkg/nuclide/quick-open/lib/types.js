'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

// TODO(7865619): Currently, this hardcodes the structure of file name search results, but this
// should be a disjoint union of all known search result types.
export type FileResult = {
  matchIndexes: Array<number>;
  path: string;
  score: number;
};

export type DirectoryName = string;
export type ServiceName = string;

export type GroupedResult = {
  [key: DirectoryName]: {
    [key: ServiceName]: {
      items: Promise<Array<FileResult>>;
    }
  }
};

export type GroupedResultPromise = Promise<GroupedResult>;

var QuickSelectionProvider = require('./QuickSelectionProvider');
export type QuickSelectionProvider = QuickSelectionProvider;
