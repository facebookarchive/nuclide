"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setRecentFilesService = setRecentFilesService;
exports.RecentFilesProvider = void 0;

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

function _collection() {
  const data = require("../../../modules/nuclide-commons/collection");

  _collection = function () {
    return data;
  };

  return data;
}

function _string() {
  const data = require("../../../modules/nuclide-commons/string");

  _string = function () {
    return data;
  };

  return data;
}

function _nuclideFuzzyNative() {
  const data = require("../../../modules/nuclide-fuzzy-native");

  _nuclideFuzzyNative = function () {
    return data;
  };

  return data;
}

function _PathWithFileIcon() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-ui/PathWithFileIcon"));

  _PathWithFileIcon = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
let _recentFilesService = null;

async function getRecentFilesMatching(query) {
  if (_recentFilesService == null) {
    return [];
  }

  const projectPaths = atom.project.getPaths();
  const openFiles = new Set((0, _collection().arrayCompact)(atom.workspace.getTextEditors().map(editor => editor.getPath())));
  const validRecentFiles = (await _recentFilesService.getRecentFiles()).filter(result => !openFiles.has(result.path) && projectPaths.some(projectPath => result.path.indexOf(projectPath) !== -1));
  const timestamps = new Map();
  const matcher = new (_nuclideFuzzyNative().Matcher)(validRecentFiles.map(recentFile => {
    timestamps.set(recentFile.path, recentFile.timestamp);
    return recentFile.path;
  }));
  return matcher.match(query, {
    recordMatchIndexes: true
  }).map(result => ({
    resultType: 'FILE',
    path: result.value,
    score: result.score,
    matchIndexes: result.matchIndexes,
    timestamp: timestamps.get(result.value) || 0
  })) // $FlowIssue Flow seems to type the arguments to `sort` as `FileResult` without `timestamp`.
  .sort((a, b) => b.timestamp - a.timestamp);
}

const MS_PER_HOUR = 60 * 60 * 1000;
const MS_PER_DAY = 24 * MS_PER_HOUR;
const MIN_OPACITY = 0.6;
const SHELF = 8 * MS_PER_HOUR; // 8 hours: heuristic for "current work day".

const FALLOFF = 1.1;
/**
 * Calculate opacity with logarithmic falloff based on recency of the timestamp.
 *
 *  Opacity                     now
 *  ^                           |
 *  |                  < SHELF >
 *  |                  #########
 *  |                  #########
 *  |   < FALLOFF >  ###########
 *  |               ############
 *  |            ###############
 *  |        ###################
 *  | ##########################  ] MIN_OPACITY
 *  | ##########################  ]
 *  +----------Time-------------->
 */

function opacityForTimestamp(timestamp) {
  const ageInMS = Date.now() - timestamp;
  return Math.min(1, Math.max(1 - FALLOFF * Math.log10((ageInMS - SHELF) / MS_PER_DAY + 1), MIN_OPACITY));
}

const RecentFilesProvider = {
  providerType: 'GLOBAL',
  name: 'RecentFilesProvider',
  debounceDelay: 0,
  display: {
    title: 'Recent Files',
    prompt: 'Search recently opened filenames...',
    action: 'nuclide-recent-files-provider:toggle-provider'
  },

  async isEligibleForDirectories(directories) {
    return true;
  },

  executeQuery(query, directories) {
    return Promise.resolve(getRecentFilesMatching(query));
  },

  getComponentForItem(item) {
    const filename = _nuclideUri().default.basename(item.path);

    const filePath = item.path.substring(0, item.path.lastIndexOf(filename));
    const date = item.timestamp == null ? null : new Date(item.timestamp); // eslint-disable-next-line eqeqeq

    const datetime = date === null ? '' : date.toLocaleString();
    return React.createElement("div", {
      className: "recent-files-provider-result" // flowlint-next-line sketchy-null-number:off
      ,
      style: {
        opacity: opacityForTimestamp(item.timestamp || Date.now())
      },
      title: datetime
    }, React.createElement("div", {
      className: "recent-files-provider-filepath-container"
    }, React.createElement(_PathWithFileIcon().default, {
      className: "recent-files-provider-file-path",
      path: filename
    }, filePath), React.createElement("span", {
      className: "recent-files-provider-file-name"
    }, filename)), React.createElement("div", {
      className: "recent-files-provider-datetime-container"
    }, React.createElement("span", {
      className: "recent-files-provider-datetime-label"
    }, date == null ? 'At some point' : (0, _string().relativeDate)(date))));
  }

};
exports.RecentFilesProvider = RecentFilesProvider;

function setRecentFilesService(service) {
  _recentFilesService = service;
}