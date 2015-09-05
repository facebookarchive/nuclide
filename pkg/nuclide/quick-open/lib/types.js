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
  matchIndexes?: Array<number>;
  score?: number;
};

export type quickopen$ProviderResult = {
  error: ?Object;
  loading: boolean;
  result: Array<quickopen$FileResult>;
};

export type quickopen$DirectoryName = string;
export type quickopen$ServiceName = string;

export type quickopen$GroupedResult = {
  [key: quickopen$DirectoryName]: {
    [key: quickopen$ServiceName]: quickopen$ProviderResult
  }
};

export type quickopen$Provider = {
  getProviderType: Function;
  executeQuery: Function;
  getTabTitle: Function;
};

export type quickopen$ProviderSpec = {
  action: string;
  debounceDelay: number;
  name: string;
  prompt: string;
  title: string;
}

export type quickopen$GroupedResultPromise = Promise<quickopen$GroupedResult>;

import type {Dispatcher} from 'flux';
export type quickopen$Dispatcher = Dispatcher;
