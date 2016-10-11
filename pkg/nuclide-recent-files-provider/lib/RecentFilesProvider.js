Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _commonsNodeNuclideUri;

function _load_commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _reactForAtom;

function _load_reactForAtom() {
  return _reactForAtom = require('react-for-atom');
}

var _commonsNodeCollection;

function _load_commonsNodeCollection() {
  return _commonsNodeCollection = require('../../commons-node/collection');
}

var _commonsNodeString;

function _load_commonsNodeString() {
  return _commonsNodeString = require('../../commons-node/string');
}

var _nuclideFuzzyNative;

function _load_nuclideFuzzyNative() {
  return _nuclideFuzzyNative = require('../../nuclide-fuzzy-native');
}

// Imported from nuclide-files-service, which is an apm package, preventing a direct import.

var _recentFilesService = null;

function getRecentFilesMatching(query) {
  if (_recentFilesService == null) {
    return [];
  }
  var projectPaths = atom.project.getPaths();
  var openFiles = new Set((0, (_commonsNodeCollection || _load_commonsNodeCollection()).arrayCompact)(atom.workspace.getTextEditors().map(function (editor) {
    return editor.getPath();
  })));
  var validRecentFiles = _recentFilesService.getRecentFiles().filter(function (result) {
    return !openFiles.has(result.path) && projectPaths.some(function (projectPath) {
      return result.path.indexOf(projectPath) !== -1;
    });
  });
  var timestamps = new Map();
  var matcher = new (_nuclideFuzzyNative || _load_nuclideFuzzyNative()).Matcher(validRecentFiles.map(function (recentFile) {
    timestamps.set(recentFile.path, recentFile.timestamp);
    return recentFile.path;
  }));
  return matcher.match(query, { recordMatchIndexes: true }).map(function (result) {
    return {
      path: result.value,
      score: result.score,
      matchIndexes: result.matchIndexes,
      timestamp: timestamps.get(result.value) || 0
    };
  })
  // $FlowIssue Flow seems to type the arguments to `sort` as `FileResult` without `timestamp`.
  .sort(function (a, b) {
    return b.timestamp - a.timestamp;
  });
}

var MS_PER_HOUR = 60 * 60 * 1000;
var MS_PER_DAY = 24 * MS_PER_HOUR;
var MIN_OPACITY = 0.6;
var SHELF = 8 * MS_PER_HOUR; // 8 hours: heuristic for "current work day".
var FALLOFF = 1.1;
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
  var ageInMS = Date.now() - timestamp;
  return Math.min(1, Math.max(1 - FALLOFF * Math.log10((ageInMS - SHELF) / MS_PER_DAY + 1), MIN_OPACITY));
}

var RecentFilesProvider = {

  getName: function getName() {
    return 'RecentFilesProvider';
  },

  getProviderType: function getProviderType() {
    return 'GLOBAL';
  },

  getDebounceDelay: function getDebounceDelay() {
    return 0;
  },

  isRenderable: function isRenderable() {
    return true;
  },

  getAction: function getAction() {
    return 'nuclide-recent-files-provider:toggle-provider';
  },

  getPromptText: function getPromptText() {
    return 'Search recently opened files';
  },

  getTabTitle: function getTabTitle() {
    return 'Recent Files';
  },

  executeQuery: function executeQuery(query) {
    return Promise.resolve(getRecentFilesMatching(query));
  },

  setRecentFilesService: function setRecentFilesService(service) {
    _recentFilesService = service;
  },

  getComponentForItem: function getComponentForItem(item) {
    var filename = (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.basename(item.path);
    var filePath = item.path.substring(0, item.path.lastIndexOf(filename));
    var date = item.timestamp == null ? null : new Date(item.timestamp);
    var datetime = date === null ? '' : date.toLocaleString();
    return (_reactForAtom || _load_reactForAtom()).React.createElement(
      'div',
      {
        className: 'recent-files-provider-result',
        style: { opacity: opacityForTimestamp(item.timestamp || Date.now()) },
        title: datetime },
      (_reactForAtom || _load_reactForAtom()).React.createElement(
        'div',
        { className: 'recent-files-provider-filepath-container' },
        (_reactForAtom || _load_reactForAtom()).React.createElement(
          'span',
          { className: 'recent-files-provider-file-path' },
          filePath
        ),
        (_reactForAtom || _load_reactForAtom()).React.createElement(
          'span',
          { className: 'recent-files-provider-file-name' },
          filename
        )
      ),
      (_reactForAtom || _load_reactForAtom()).React.createElement(
        'div',
        { className: 'recent-files-provider-datetime-container' },
        (_reactForAtom || _load_reactForAtom()).React.createElement(
          'span',
          { className: 'recent-files-provider-datetime-label' },
          date === null ? 'At some point' : (0, (_commonsNodeString || _load_commonsNodeString()).relativeDate)(date)
        )
      )
    );
  }

};
exports.RecentFilesProvider = RecentFilesProvider;