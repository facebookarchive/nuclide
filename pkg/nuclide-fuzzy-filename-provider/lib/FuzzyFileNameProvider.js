'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _utils;

function _load_utils() {
  return _utils = require('./utils');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  // Give preference to filename results in OmniSearch.
  getPriority: () => 1,

  getName: function () {
    return 'FuzzyFileNameProvider';
  },
  getProviderType: function () {
    return 'DIRECTORY';
  },
  isRenderable: function () {
    return true;
  },
  getDebounceDelay: function () {
    return 0;
  },
  getAction: function () {
    return 'nuclide-fuzzy-filename-provider:toggle-provider';
  },
  getPromptText: function () {
    return 'Fuzzy File Name Search';
  },
  getTabTitle: function () {
    return 'Filenames';
  },
  isEligibleForDirectory: function (directory) {
    return directory.exists();
  },
  executeQuery: (() => {
    var _ref = (0, _asyncToGenerator.default)(function* (query, directory) {
      if (query.length === 0) {
        return [];
      }

      if (directory == null) {
        throw new Error('FuzzyFileNameProvider is a directory-specific provider but its executeQuery method was' + ' called without a directory argument.');
      }

      const directoryPath = directory.getPath();
      const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getFuzzyFileSearchServiceByNuclideUri)(directoryPath);
      const results = yield service.queryFuzzyFile(directoryPath, query, (0, (_utils || _load_utils()).getIgnoredNames)());

      // Take the `nuclide://<host>` prefix into account for matchIndexes of remote files.
      if ((_nuclideRemoteConnection || _load_nuclideRemoteConnection()).RemoteDirectory.isRemoteDirectory(directory)) {
        const remoteDir = directory;
        const indexOffset = directoryPath.length - remoteDir.getLocalPath().length;
        for (let i = 0; i < results.length; i++) {
          for (let j = 0; j < results[i].matchIndexes.length; j++) {
            results[i].matchIndexes[j] += indexOffset;
          }
        }
      }

      return results;
    });

    return function executeQuery(_x, _x2) {
      return _ref.apply(this, arguments);
    };
  })()
};
module.exports = exports['default'];