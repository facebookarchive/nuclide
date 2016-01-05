'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

type ProviderInfo = {
  name: string;
}

type SearchQueryResult = {
  line: number;
  column: number;
  name: string;
  path: string;
  length: number;
  scope: string;
  additionalInfo: string;
  action: string;
}

type SearchResponse = {
  results: Array<SearchQueryResult>;
}

import invariant from 'assert';
import type {FileSearchResult} from '../../../path-search';

const {fsPromise} = require('../../../commons');
const {fileSearchForDirectory} = require('../../../path-search');
const remoteUri = require('../../../remote-uri');

type SearchProvider = {
  isAvailable: (cwd: string) => boolean;
  query: (cwd: string, query: string) => Promise<Array<SearchQueryResult>>;
};

let providers: ?{[providerName: string]: SearchProvider};

/*
 * TODO(williamsc): This needs to have some better
 *                  managment tools (Adding/removing query sets).
 */

// Cache of previously indexed folders for later use.
let fileSearchers: any = Object.create(null);

// TODO (mikeo): Make this another search provider
async function doSearchDirectory(
  directoryUri: string,
  query: string
): Promise<Array<FileSearchResult>> {
  let search = fileSearchers[directoryUri];
  if (search === undefined) {
    const directory = remoteUri.parse(directoryUri).path;

    const exists = await fsPromise.exists(directory);
    if (!exists) {
      throw new Error('Could not find directory to search : ' + directory);
    }

    const stat = await fsPromise.stat(directory);
    if (!stat.isDirectory()) {
      throw new Error('Provided path is not a directory : ' + directory);
    }

    search = await fileSearchForDirectory(directoryUri);
    fileSearchers[directoryUri] = search;
  }

  return await search.query(query);
}

async function getSearchProviders(cwd: string): Promise<Array<ProviderInfo>> {
  const validPromises: Array<Promise<?ProviderInfo>> = [];

  async function checkAvailability(providerName: string): Promise<?ProviderInfo> {
    invariant(providers);
    const isAvailable = await providers[providerName].isAvailable(cwd);
    return isAvailable ? {name: providerName} : null;
  }

  for (const name in providers) {
    validPromises.push(checkAvailability(name));
  }

  const allResults: Array<?ProviderInfo> =
      await Promise.all((validPromises: Array<Promise<?ProviderInfo>>));
  // Any is required here as otherwise we get a flow error in core.js
  return (allResults.filter(provider => provider != null): any);
}

async function doSearchQuery(
  cwd: string,
  provider: string,
  query: string
): Promise<SearchResponse> {
  invariant(providers);
  const currentProvider: ?SearchProvider = providers[provider];
  if (!currentProvider) {
    throw new Error(`Invalid provider: ${provider}`);
  }
  invariant(currentProvider != null);
  const results: Array<SearchQueryResult> = await currentProvider.query(cwd, query);
  return {results};
}

function addProvider(name: string, provider: SearchProvider): void {
  providers = providers || {};
  if (providers[name]) {
    throw new Error(`${name} has already been added as a provider.`);
  }
  providers[name] = provider;
}

function clearProviders(): void {
  providers = null;
}

function initialize(): void {
}

function shutdown(): void {
  clearProviders();
  for (const k in fileSearchers) {
    fileSearchers[k].dispose();
  }
  fileSearchers = Object.create(null);
}

module.exports = {
  initialize,
  shutdown,
  addProvider,
  clearProviders,
  services: {
    '/search/query': {handler: doSearchQuery, method: 'post'},
    '/search/listProviders': {handler: getSearchProviders, method: 'post'},
    '/search/directory': {handler: doSearchDirectory},
  },
};
