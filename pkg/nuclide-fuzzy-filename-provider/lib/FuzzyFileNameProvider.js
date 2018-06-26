'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('../../../modules/nuclide-commons-atom/feature-config'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _passesGK;

function _load_passesGK() {
  return _passesGK = require('../../commons-node/passesGK');
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _utils;

function _load_utils() {
  return _utils = require('./utils');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

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

  async executeQuery(query, directory) {
    const { fileName, line, column } = (0, (_utils || _load_utils()).parseFileNameQuery)(query);
    if (fileName.length === 0) {
      return [];
    }

    const directoryPath = directory.getPath();
    const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getFuzzyFileSearchServiceByNuclideUri)(directoryPath);
    const results = await service.queryFuzzyFile({
      rootDirectory: directoryPath,
      queryRoot: getQueryRoot(directoryPath),
      queryString: fileName,
      ignoredNames: (0, (_utils || _load_utils()).getIgnoredNames)(),
      smartCase: Boolean((_featureConfig || _load_featureConfig()).default.get('nuclide-fuzzy-filename-provider.smartCase')),
      preferCustomSearch: Boolean((0, (_passesGK || _load_passesGK()).isGkEnabled)('nuclide_prefer_myles_search'))
    });

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

    return results.map(result => ({
      resultType: 'FILE',
      path: result.path,
      score: result.score,
      matchIndexes: result.matchIndexes,
      line,
      column
    }));
  }
};

// Returns the directory of the active text editor which will be used to unbreak
// ties when sorting the suggestions.
// TODO(T26559382) Extract to util function

function getQueryRoot(directoryPath) {
  if (!(0, (_passesGK || _load_passesGK()).isGkEnabled)('nuclide_fuzzy_file_search_with_root_path')) {
    return undefined;
  }
  const editor = atom.workspace.getActiveTextEditor();
  const uri = editor ? editor.getURI() : null;

  return uri != null && (_nuclideUri || _load_nuclideUri()).default.contains(directoryPath, uri) ? (_nuclideUri || _load_nuclideUri()).default.dirname(uri) : undefined;
}