'use strict';

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
  providerType: 'DIRECTORY',
  name: 'FuzzyFileNameProvider',
  debounceDelay: 0,
  display: {
    title: 'Filenames',
    prompt: 'Fuzzy filename search...',
    action: 'nuclide-fuzzy-filename-provider:toggle-provider'
  },
  // Give preference to filename results in OmniSearch.
  priority: 1,

  isEligibleForDirectory(directory) {
    return directory.exists();
  },

  executeQuery(query, directory) {
    return (0, _asyncToGenerator.default)(function* () {
      const { fileName, line, column } = (0, (_utils || _load_utils()).parseFileNameQuery)(query);
      if (fileName.length === 0) {
        return [];
      }

      const directoryPath = directory.getPath();
      const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getFuzzyFileSearchServiceByNuclideUri)(directoryPath);
      const results = yield service.queryFuzzyFile(directoryPath, fileName, (0, (_utils || _load_utils()).getIgnoredNames)());

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

      return results.map(function (result) {
        return {
          path: result.path,
          score: result.score,
          matchIndexes: result.matchIndexes,
          line,
          column
        };
      });
    })();
  }
}; /**
    * Copyright (c) 2015-present, Facebook, Inc.
    * All rights reserved.
    *
    * This source code is licensed under the license found in the LICENSE file in
    * the root directory of this source tree.
    *
    * 
    * @format
    */