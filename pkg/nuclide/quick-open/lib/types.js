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
export type quickopen$FileResult = {
  path: string;
  matchIndexes: ?Array<number>;
  score: ?number;
};

export type quickopen$DirectoryName = string;
export type quickopen$ServiceName = string;

export type quickopen$GroupedResult = {
  [key: quickopen$DirectoryName]: {
    [key: quickopen$ServiceName]: {
      results: Array<quickopen$FileResult>;
      error: ?Object;
      loading: boolean;
    }
  }
};

export type quickopen$Provider = {
  getProviderType: Function;
  executeQuery: Function;
  getTabTitle: Function;
};

export type quickopen$TabInfo = {
  providerName: string;
  title: string;
  action: string;
};

var QuickSelectionProvider = require('./QuickSelectionProvider');
export type QuickSelectionProvider = QuickSelectionProvider;
export type quickopen$GroupedResultPromise = Promise<quickopen$GroupedResult>;
