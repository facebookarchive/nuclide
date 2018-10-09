"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _featureConfig() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/feature-config"));

  _featureConfig = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _passesGK() {
  const data = require("../../commons-node/passesGK");

  _passesGK = function () {
    return data;
  };

  return data;
}

function _nuclideRemoteConnection() {
  const data = require("../../nuclide-remote-connection");

  _nuclideRemoteConnection = function () {
    return data;
  };

  return data;
}

function _ClientQueryContext() {
  const data = require("../../commons-atom/ClientQueryContext");

  _ClientQueryContext = function () {
    return data;
  };

  return data;
}

function _goToLocation() {
  const data = require("../../../modules/nuclide-commons-atom/go-to-location");

  _goToLocation = function () {
    return data;
  };

  return data;
}

function _utils() {
  const data = require("./utils");

  _utils = function () {
    return data;
  };

  return data;
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
const {
  logCustomFileSearchFeedback
} = function () {
  try {
    // $FlowFB
    return require("../../commons-atom/fb-custom-file-search-graphql");
  } catch (err) {
    return {};
  }
}();

var _default = {
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
    const {
      fileName,
      line,
      column
    } = (0, _utils().parseFileNameQuery)(query);

    if (fileName.length === 0) {
      return [];
    }

    const directoryPath = directory.getPath();
    const service = (0, _nuclideRemoteConnection().getFuzzyFileSearchServiceByNuclideUri)(directoryPath);
    const preferCustomSearch = Boolean((0, _passesGK().isGkEnabled)('nuclide_prefer_myles_search'));
    const context = preferCustomSearch ? await (0, _ClientQueryContext().getNuclideContext)(directoryPath) : null;
    const results = await service.queryFuzzyFile({
      rootDirectory: directoryPath,
      queryRoot: getQueryRoot(directoryPath),
      queryString: fileName,
      ignoredNames: (0, _utils().getIgnoredNames)(),
      smartCase: Boolean(_featureConfig().default.get('nuclide-fuzzy-filename-provider.smartCase')),
      preferCustomSearch,
      context
    }); // Take the `nuclide://<host>` prefix into account for matchIndexes of remote files.

    if (_nuclideRemoteConnection().RemoteDirectory.isRemoteDirectory(directory)) {
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
      column,

      callback() {
        if (preferCustomSearch && logCustomFileSearchFeedback && context != null) {
          logCustomFileSearchFeedback(result, results, query, directoryPath, context.session_id);
        } // Custom callbacks need to run goToLocation


        (0, _goToLocation().goToLocation)(result.path, {
          line,
          column
        });
      }

    }));
  }

}; // Returns the directory of the active text editor which will be used to unbreak
// ties when sorting the suggestions.
// TODO(T26559382) Extract to util function

exports.default = _default;

function getQueryRoot(directoryPath) {
  if (!(0, _passesGK().isGkEnabled)('nuclide_fuzzy_file_search_with_root_path')) {
    return undefined;
  }

  const editor = atom.workspace.getActiveTextEditor();
  const uri = editor ? editor.getURI() : null;
  return uri != null && _nuclideUri().default.contains(directoryPath, uri) ? _nuclideUri().default.dirname(uri) : undefined;
}