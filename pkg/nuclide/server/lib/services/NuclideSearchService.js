'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

type SearchQuery = {
  provider: string;
  query: string;
}

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

var url = require('url');

var {fileSearchForDirectory} = require('nuclide-path-search');
var {fsPromise} = require('nuclide-commons');

var providers;

/*
 * TODO(williamsc): This needs to have some better
 *                  managment tools (Adding/removing query sets).
 */

// Cache of previously indexed folders for later use.
var fileSearchers: any = {};

// TODO (mikeo): Make this another search provider
async function doSearchDirectory(directoryUri: string, query: string): Promise<Array<FileSearchResult>> {
  var search = fileSearchers[directoryUri];
  if (search === undefined) {
    var directory = url.parse(directoryUri).path;

    var exists = await fsPromise.exists(directory);
    if (!exists) {
      throw new Error('Could not find directory to search : ' + directory);
    }

    var stat = await fsPromise.stat(directory);
    if (!stat.isDirectory()) {
      throw new Error('Provided path is not a directory : ' + directory);
    }

    search = await fileSearchForDirectory(directoryUri);
    fileSearchers[directoryUri] = search;
  }

  return await search.query(query);
}

async function getSearchProviders(cwd: string): Promise<Array<ProviderInfo>> {
  var validPromises = [];

  async function checkAvailability(providerName) {
    var isAvailable = await providers[providerName].isAvailable(cwd);
    return isAvailable ? {name: providerName} : null;
  }

  for (var name in providers) {
    validPromises.push(checkAvailability(name));
  }

  var results = await Promise.all(validPromises);
  return results.filter((provider) => !!provider);
}

async function doSearchQuery(cwd: string, provider: string, query: string): Promise<SearchResponse> {
  var currentProvider = providers[provider];
  if (!currentProvider) {
    throw new Error(`Invalid provider: ${provider}`);
  }
  var results = await currentProvider.query(cwd, query);
  return {results};
}

function addProvider(name: string, provider) {
  providers = providers || {};
  if (providers[name]) {
    throw new Error(`${name} has already been added as a provider.`);
  }
  providers[name] = provider;
}

function clearProviders() {
  providers = undefined;
}

function initialize(server) {
  var HackProvider = require('./search/HackProvider');
  addProvider('hack', new HackProvider(server));

  var BigGrepProvider;
  try {
    BigGrepProvider = require('./search/fb/BigGrepProvider');
  } catch (e) {
  }
  if (BigGrepProvider) {
    addProvider('biggrep', new BigGrepProvider(server));
  }
}

function shutdown(server) {
  clearProviders();
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
