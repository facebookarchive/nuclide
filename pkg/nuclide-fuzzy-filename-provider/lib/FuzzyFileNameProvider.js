function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _utils2;

function _utils() {
  return _utils2 = require('./utils');
}

var _nuclideRemoteConnection2;

function _nuclideRemoteConnection() {
  return _nuclideRemoteConnection2 = require('../../nuclide-remote-connection');
}

var FuzzyFileNameProvider = {

  // Give preference to filename results in OmniSearch.
  getPriority: function getPriority() {
    return 1;
  },

  getName: function getName() {
    return 'FuzzyFileNameProvider';
  },

  getProviderType: function getProviderType() {
    return 'DIRECTORY';
  },

  isRenderable: function isRenderable() {
    return true;
  },

  getDebounceDelay: function getDebounceDelay() {
    return 0;
  },

  getAction: function getAction() {
    return 'nuclide-fuzzy-filename-provider:toggle-provider';
  },

  getPromptText: function getPromptText() {
    return 'Fuzzy File Name Search';
  },

  getTabTitle: function getTabTitle() {
    return 'Filenames';
  },

  isEligibleForDirectory: function isEligibleForDirectory(directory) {
    return directory.exists();
  },

  executeQuery: _asyncToGenerator(function* (query, directory) {
    if (query.length === 0) {
      return [];
    }

    if (directory == null) {
      throw new Error('FuzzyFileNameProvider is a directory-specific provider but its executeQuery method was' + ' called without a directory argument.');
    }

    var service = yield (0, (_utils2 || _utils()).getFuzzyFileSearchService)(directory);
    if (service == null) {
      return [];
    }

    var directoryPath = directory.getPath();
    var result = yield service.queryFuzzyFile(directoryPath, query, (0, (_utils2 || _utils()).getIgnoredNames)());
    // Take the `nuclide://<host>` prefix into account for matchIndexes of remote files.
    if ((_nuclideRemoteConnection2 || _nuclideRemoteConnection()).RemoteDirectory.isRemoteDirectory(directory)) {
      (function () {
        var remoteDir = directory;
        var indexOffset = directoryPath.length - remoteDir.getLocalPath().length;
        result.forEach(function (res) {
          res.matchIndexes = res.matchIndexes.map(function (index) {
            return index + indexOffset;
          });
        });
      })();
    }
    return result;
  })
};

module.exports = FuzzyFileNameProvider;