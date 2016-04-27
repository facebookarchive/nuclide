

// TODO (mikeo): Make this another search provider

var doSearchDirectory = _asyncToGenerator(function* (directoryUri, query) {
  var search = fileSearchers[directoryUri];
  if (search === undefined) {
    var directory = remoteUri.parse(directoryUri).path;

    var exists = yield fsPromise.exists(directory);
    if (!exists) {
      throw new Error('Could not find directory to search : ' + directory);
    }

    var stat = yield fsPromise.stat(directory);
    if (!stat.isDirectory()) {
      throw new Error('Provided path is not a directory : ' + directory);
    }

    search = yield fileSearchForDirectory(directoryUri);
    fileSearchers[directoryUri] = search;
  }

  return yield search.query(query);
});

var getSearchProviders = _asyncToGenerator(function* (cwd) {
  var checkAvailability = _asyncToGenerator(function* (providerName) {
    (0, _assert2['default'])(providers);
    var isAvailable = yield providers[providerName].isAvailable(cwd);
    return isAvailable ? { name: providerName } : null;
  });

  var validPromises = [];

  for (var _name in providers) {
    validPromises.push(checkAvailability(_name));
  }

  var allResults = yield Promise.all(validPromises);
  // Any is required here as otherwise we get a flow error in core.js
  return allResults.filter(function (provider) {
    return provider != null;
  });
});

var doSearchQuery = _asyncToGenerator(function* (cwd, provider, query) {
  (0, _assert2['default'])(providers);
  var currentProvider = providers[provider];
  if (!currentProvider) {
    throw new Error('Invalid provider: ' + provider);
  }
  (0, _assert2['default'])(currentProvider != null);
  var results = yield currentProvider.query(cwd, query);
  return { results: results };
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _require = require('../../../nuclide-commons');

var fsPromise = _require.fsPromise;

var _require2 = require('../../../nuclide-path-search');

var fileSearchForDirectory = _require2.fileSearchForDirectory;

var remoteUri = require('../../../nuclide-remote-uri');

var providers = undefined;

/*
 * TODO(williamsc): This needs to have some better
 *                  managment tools (Adding/removing query sets).
 */

// Cache of previously indexed folders for later use.
var fileSearchers = Object.create(null);

function addProvider(name, provider) {
  providers = providers || {};
  if (providers[name]) {
    throw new Error(name + ' has already been added as a provider.');
  }
  providers[name] = provider;
}

function clearProviders() {
  providers = null;
}

function initialize() {}

function shutdown() {
  clearProviders();
  for (var k in fileSearchers) {
    fileSearchers[k].dispose();
  }
  fileSearchers = Object.create(null);
}

module.exports = {
  initialize: initialize,
  shutdown: shutdown,
  addProvider: addProvider,
  clearProviders: clearProviders,
  services: {
    '/search/query': { handler: doSearchQuery, method: 'post' },
    '/search/listProviders': { handler: getSearchProviders, method: 'post' },
    '/search/directory': { handler: doSearchDirectory }
  }
};