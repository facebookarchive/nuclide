

// TODO (mikeo): Make this another search provider

var doSearchDirectory = _asyncToGenerator(function* (directoryUri, query) {
  var search = fileSearchers[directoryUri];
  if (search === undefined) {
    var directory = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.parse(directoryUri).path;

    var exists = yield (_nuclideCommons2 || _nuclideCommons()).fsPromise.exists(directory);
    if (!exists) {
      throw new Error('Could not find directory to search : ' + directory);
    }

    var stat = yield (_nuclideCommons2 || _nuclideCommons()).fsPromise.stat(directory);
    if (!stat.isDirectory()) {
      throw new Error('Provided path is not a directory : ' + directory);
    }

    search = yield (0, (_nuclidePathSearch2 || _nuclidePathSearch()).fileSearchForDirectory)(directoryUri);
    fileSearchers[directoryUri] = search;
  }

  return yield search.query(query);
});

var getSearchProviders = _asyncToGenerator(function* (cwd) {
  var checkAvailability = _asyncToGenerator(function* (providerName) {
    (0, (_assert2 || _assert()).default)(providers);
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
  (0, (_assert2 || _assert()).default)(providers);
  var currentProvider = providers[provider];
  if (!currentProvider) {
    throw new Error('Invalid provider: ' + provider);
  }
  (0, (_assert2 || _assert()).default)(currentProvider != null);
  var results = yield currentProvider.query(cwd, query);
  return { results: results };
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _nuclideCommons2;

function _nuclideCommons() {
  return _nuclideCommons2 = require('../../../nuclide-commons');
}

var _nuclidePathSearch2;

function _nuclidePathSearch() {
  return _nuclidePathSearch2 = require('../../../nuclide-path-search');
}

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../../../nuclide-remote-uri'));
}

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