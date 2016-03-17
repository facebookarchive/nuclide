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

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _reactForAtom = require('react-for-atom');

var _relativeDate = require('relative-date');

var _relativeDate2 = _interopRequireDefault(_relativeDate);

var _nuclideCommons = require('../../nuclide-commons');

var _nuclideFuzzyNative = require('../../nuclide-fuzzy-native');

// Imported from nuclide-files-service, which is an apm package, preventing a direct import.

var _recentFilesService = null;

function getRecentFilesMatching(query) {
  if (_recentFilesService == null) {
    return [];
  }
  var projectPaths = atom.project.getPaths();
  var openFiles = new Set(_nuclideCommons.array.compact(atom.workspace.getTextEditors().map(function (editor) {
    return editor.getPath();
  })));
  var validRecentFiles = _recentFilesService.getRecentFiles().filter(function (result) {
    return !openFiles.has(result.path) && projectPaths.some(function (projectPath) {
      return result.path.indexOf(projectPath) !== -1;
    });
  });
  var timestamps = new Map();
  var matcher = new _nuclideFuzzyNative.Matcher(validRecentFiles.map(function (recentFile) {
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
    var filename = _path2['default'].basename(item.path);
    var filePath = item.path.substring(0, item.path.lastIndexOf(filename));
    var date = item.timestamp == null ? null : new Date(item.timestamp);
    var datetime = date === null ? '' : date.toLocaleString();
    return _reactForAtom.React.createElement(
      'div',
      {
        className: 'recent-files-provider-result',
        style: { opacity: opacityForTimestamp(item.timestamp || Date.now()) },
        title: datetime },
      _reactForAtom.React.createElement(
        'div',
        { className: 'recent-files-provider-filepath-container' },
        _reactForAtom.React.createElement(
          'span',
          { className: 'recent-files-provider-file-path' },
          filePath
        ),
        _reactForAtom.React.createElement(
          'span',
          { className: 'recent-files-provider-file-name' },
          filename
        )
      ),
      _reactForAtom.React.createElement(
        'div',
        { className: 'recent-files-provider-datetime-container' },
        _reactForAtom.React.createElement(
          'span',
          { className: 'recent-files-provider-datetime-label' },
          date === null ? 'At some point' : (0, _relativeDate2['default'])(date)
        )
      )
    );
  }

};
exports.RecentFilesProvider = RecentFilesProvider;
//# sourceMappingURL=data:application/json;base64,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Q3RFLFFBQU0sUUFBUSxHQUFHLElBQUksS0FBSyxJQUFJLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztBQUM1RCxXQUNFOzs7QUFDRSxpQkFBUyxFQUFDLDhCQUE4QjtBQUN4QyxhQUFLLEVBQUUsRUFBQyxPQUFPLEVBQUUsbUJBQW1CLENBQUMsSUFBSSxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBQyxBQUFDO0FBQ3BFLGFBQUssRUFBRSxRQUFRLEFBQUM7TUFDaEI7O1VBQUssU0FBUyxFQUFDLDBDQUEwQztRQUN2RDs7WUFBTSxTQUFTLEVBQUMsaUNBQWlDO1VBQUUsUUFBUTtTQUFRO1FBQ25FOztZQUFNLFNBQVMsRUFBQyxpQ0FBaUM7VUFBRSxRQUFRO1NBQVE7T0FDL0Q7TUFDTjs7VUFBSyxTQUFTLEVBQUMsMENBQTBDO1FBQ3ZEOztZQUFNLFNBQVMsRUFBQyxzQ0FBc0M7VUFDbkQsSUFBSSxLQUFLLElBQUksR0FBRyxlQUFlLEdBQUcsK0JBQWEsSUFBSSxDQUFDO1NBQ2hEO09BQ0g7S0FDRixDQUNOO0dBQ0g7O0NBRUYsQ0FBQyIsImZpbGUiOiJSZWNlbnRGaWxlc1Byb3ZpZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQge1JlYWN0fSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQgcmVsYXRpdmVEYXRlIGZyb20gJ3JlbGF0aXZlLWRhdGUnO1xuXG5pbXBvcnQgdHlwZSB7XG4gIEZpbGVSZXN1bHQsXG4gIFByb3ZpZGVyLFxuICBQcm92aWRlclR5cGUsXG59IGZyb20gJy4uLy4uL251Y2xpZGUtcXVpY2stb3Blbi1pbnRlcmZhY2VzJztcblxuaW1wb3J0IHthcnJheX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1jb21tb25zJztcbmltcG9ydCB7TWF0Y2hlcn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1mdXp6eS1uYXRpdmUnO1xuXG4vLyBJbXBvcnRlZCBmcm9tIG51Y2xpZGUtZmlsZXMtc2VydmljZSwgd2hpY2ggaXMgYW4gYXBtIHBhY2thZ2UsIHByZXZlbnRpbmcgYSBkaXJlY3QgaW1wb3J0LlxudHlwZSBGaWxlUGF0aCA9IHN0cmluZztcbnR5cGUgVGltZVN0YW1wID0gbnVtYmVyO1xudHlwZSBGaWxlTGlzdCA9IEFycmF5PHtwYXRoOiBGaWxlUGF0aDsgdGltZXN0YW1wOiBUaW1lU3RhbXB9PjtcbnR5cGUgUmVjZW50RmlsZXNTZXJ2aWNlID0ge1xuICBnZXRSZWNlbnRGaWxlcygpOiBGaWxlTGlzdDtcbiAgdG91Y2hGaWxlKHBhdGg6IHN0cmluZyk6IHZvaWQ7XG59O1xuXG5sZXQgX3JlY2VudEZpbGVzU2VydmljZTogP1JlY2VudEZpbGVzU2VydmljZSA9IG51bGw7XG5cbmZ1bmN0aW9uIGdldFJlY2VudEZpbGVzTWF0Y2hpbmcocXVlcnk6IHN0cmluZyk6IEFycmF5PEZpbGVSZXN1bHQ+IHtcbiAgaWYgKF9yZWNlbnRGaWxlc1NlcnZpY2UgPT0gbnVsbCkge1xuICAgIHJldHVybiBbXTtcbiAgfVxuICBjb25zdCBwcm9qZWN0UGF0aHMgPSBhdG9tLnByb2plY3QuZ2V0UGF0aHMoKTtcbiAgY29uc3Qgb3BlbkZpbGVzID0gbmV3IFNldChhcnJheS5jb21wYWN0KFxuICAgIGF0b20ud29ya3NwYWNlLmdldFRleHRFZGl0b3JzKCkubWFwKGVkaXRvciA9PiBlZGl0b3IuZ2V0UGF0aCgpKVxuICApKTtcbiAgY29uc3QgdmFsaWRSZWNlbnRGaWxlcyA9IF9yZWNlbnRGaWxlc1NlcnZpY2UuZ2V0UmVjZW50RmlsZXMoKVxuICAgIC5maWx0ZXIocmVzdWx0ID0+XG4gICAgICAhb3BlbkZpbGVzLmhhcyhyZXN1bHQucGF0aCkgJiZcbiAgICAgIHByb2plY3RQYXRocy5zb21lKHByb2plY3RQYXRoID0+IHJlc3VsdC5wYXRoLmluZGV4T2YocHJvamVjdFBhdGgpICE9PSAtMSlcbiAgICApO1xuICBjb25zdCB0aW1lc3RhbXBzOiBNYXA8RmlsZVBhdGgsIFRpbWVTdGFtcD4gPSBuZXcgTWFwKCk7XG4gIGNvbnN0IG1hdGNoZXIgPSBuZXcgTWF0Y2hlcih2YWxpZFJlY2VudEZpbGVzLm1hcChyZWNlbnRGaWxlID0+IHtcbiAgICB0aW1lc3RhbXBzLnNldChyZWNlbnRGaWxlLnBhdGgsIHJlY2VudEZpbGUudGltZXN0YW1wKTtcbiAgICByZXR1cm4gcmVjZW50RmlsZS5wYXRoO1xuICB9KSk7XG4gIHJldHVybiBtYXRjaGVyLm1hdGNoKHF1ZXJ5LCB7cmVjb3JkTWF0Y2hJbmRleGVzOiB0cnVlfSlcbiAgICAubWFwKHJlc3VsdCA9PiAoe1xuICAgICAgcGF0aDogcmVzdWx0LnZhbHVlLFxuICAgICAgc2NvcmU6IHJlc3VsdC5zY29yZSxcbiAgICAgIG1hdGNoSW5kZXhlczogcmVzdWx0Lm1hdGNoSW5kZXhlcyxcbiAgICAgIHRpbWVzdGFtcDogdGltZXN0YW1wcy5nZXQocmVzdWx0LnZhbHVlKSB8fCAwLFxuICAgIH0pKVxuICAgIC8vICRGbG93SXNzdWUgRmxvdyBzZWVtcyB0byB0eXBlIHRoZSBhcmd1bWVudHMgdG8gYHNvcnRgIGFzIGBGaWxlUmVzdWx0YCB3aXRob3V0IGB0aW1lc3RhbXBgLlxuICAgIC5zb3J0KChhLCBiKSA9PiBiLnRpbWVzdGFtcCAtIGEudGltZXN0YW1wKTtcbn1cblxuY29uc3QgTVNfUEVSX0hPVVIgPSA2MCAqIDYwICogMTAwMDtcbmNvbnN0IE1TX1BFUl9EQVkgPSAyNCAqIE1TX1BFUl9IT1VSO1xuY29uc3QgTUlOX09QQUNJVFkgPSAwLjY7XG5jb25zdCBTSEVMRiA9IDggKiBNU19QRVJfSE9VUjsgLy8gOCBob3VyczogaGV1cmlzdGljIGZvciBcImN1cnJlbnQgd29yayBkYXlcIi5cbmNvbnN0IEZBTExPRkYgPSAxLjE7XG4vKipcbiAqIENhbGN1bGF0ZSBvcGFjaXR5IHdpdGggbG9nYXJpdGhtaWMgZmFsbG9mZiBiYXNlZCBvbiByZWNlbmN5IG9mIHRoZSB0aW1lc3RhbXAuXG4gKlxuICogIE9wYWNpdHkgICAgICAgICAgICAgICAgICAgICBub3dcbiAqICBeICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogIHwgICAgICAgICAgICAgICAgICA8IFNIRUxGID5cbiAqICB8ICAgICAgICAgICAgICAgICAgIyMjIyMjIyMjXG4gKiAgfCAgICAgICAgICAgICAgICAgICMjIyMjIyMjI1xuICogIHwgICA8IEZBTExPRkYgPiAgIyMjIyMjIyMjIyNcbiAqICB8ICAgICAgICAgICAgICAgIyMjIyMjIyMjIyMjXG4gKiAgfCAgICAgICAgICAgICMjIyMjIyMjIyMjIyMjI1xuICogIHwgICAgICAgICMjIyMjIyMjIyMjIyMjIyMjIyNcbiAqICB8ICMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjICBdIE1JTl9PUEFDSVRZXG4gKiAgfCAjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyAgXVxuICogICstLS0tLS0tLS0tVGltZS0tLS0tLS0tLS0tLS0tPlxuICovXG5mdW5jdGlvbiBvcGFjaXR5Rm9yVGltZXN0YW1wKHRpbWVzdGFtcDogbnVtYmVyKTogbnVtYmVyIHtcbiAgY29uc3QgYWdlSW5NUyA9IERhdGUubm93KCkgLSB0aW1lc3RhbXA7XG4gIHJldHVybiBNYXRoLm1pbihcbiAgICAxLFxuICAgIE1hdGgubWF4KFxuICAgICAgMSAtIChGQUxMT0ZGICogTWF0aC5sb2cxMCgoKGFnZUluTVMgLSBTSEVMRikgLyBNU19QRVJfREFZKSArIDEpKSxcbiAgICAgIE1JTl9PUEFDSVRZXG4gICAgKVxuICApO1xufVxuXG5leHBvcnQgY29uc3QgUmVjZW50RmlsZXNQcm92aWRlcjogUHJvdmlkZXIgPSB7XG5cbiAgZ2V0TmFtZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiAnUmVjZW50RmlsZXNQcm92aWRlcic7XG4gIH0sXG5cbiAgZ2V0UHJvdmlkZXJUeXBlKCk6IFByb3ZpZGVyVHlwZSB7XG4gICAgcmV0dXJuICdHTE9CQUwnO1xuICB9LFxuXG4gIGdldERlYm91bmNlRGVsYXkoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gMDtcbiAgfSxcblxuICBpc1JlbmRlcmFibGUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0sXG5cbiAgZ2V0QWN0aW9uKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuICdudWNsaWRlLXJlY2VudC1maWxlcy1wcm92aWRlcjp0b2dnbGUtcHJvdmlkZXInO1xuICB9LFxuXG4gIGdldFByb21wdFRleHQoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gJ1NlYXJjaCByZWNlbnRseSBvcGVuZWQgZmlsZXMnO1xuICB9LFxuXG4gIGdldFRhYlRpdGxlKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuICdSZWNlbnQgRmlsZXMnO1xuICB9LFxuXG4gIGV4ZWN1dGVRdWVyeShxdWVyeTogc3RyaW5nKTogUHJvbWlzZTxBcnJheTxGaWxlUmVzdWx0Pj4ge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoZ2V0UmVjZW50RmlsZXNNYXRjaGluZyhxdWVyeSkpO1xuICB9LFxuXG4gIHNldFJlY2VudEZpbGVzU2VydmljZShzZXJ2aWNlOiBSZWNlbnRGaWxlc1NlcnZpY2UpOiB2b2lkIHtcbiAgICBfcmVjZW50RmlsZXNTZXJ2aWNlID0gc2VydmljZTtcbiAgfSxcblxuICBnZXRDb21wb25lbnRGb3JJdGVtKGl0ZW06IEZpbGVSZXN1bHQpOiBSZWFjdEVsZW1lbnQge1xuICAgIGNvbnN0IGZpbGVuYW1lID0gcGF0aC5iYXNlbmFtZShpdGVtLnBhdGgpO1xuICAgIGNvbnN0IGZpbGVQYXRoID0gaXRlbS5wYXRoLnN1YnN0cmluZygwLCBpdGVtLnBhdGgubGFzdEluZGV4T2YoZmlsZW5hbWUpKTtcbiAgICBjb25zdCBkYXRlID0gaXRlbS50aW1lc3RhbXAgPT0gbnVsbCA/IG51bGwgOiBuZXcgRGF0ZShpdGVtLnRpbWVzdGFtcCk7XG4gICAgY29uc3QgZGF0ZXRpbWUgPSBkYXRlID09PSBudWxsID8gJycgOiBkYXRlLnRvTG9jYWxlU3RyaW5nKCk7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXZcbiAgICAgICAgY2xhc3NOYW1lPVwicmVjZW50LWZpbGVzLXByb3ZpZGVyLXJlc3VsdFwiXG4gICAgICAgIHN0eWxlPXt7b3BhY2l0eTogb3BhY2l0eUZvclRpbWVzdGFtcChpdGVtLnRpbWVzdGFtcCB8fCBEYXRlLm5vdygpKX19XG4gICAgICAgIHRpdGxlPXtkYXRldGltZX0+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicmVjZW50LWZpbGVzLXByb3ZpZGVyLWZpbGVwYXRoLWNvbnRhaW5lclwiPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInJlY2VudC1maWxlcy1wcm92aWRlci1maWxlLXBhdGhcIj57ZmlsZVBhdGh9PC9zcGFuPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInJlY2VudC1maWxlcy1wcm92aWRlci1maWxlLW5hbWVcIj57ZmlsZW5hbWV9PC9zcGFuPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJyZWNlbnQtZmlsZXMtcHJvdmlkZXItZGF0ZXRpbWUtY29udGFpbmVyXCI+XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwicmVjZW50LWZpbGVzLXByb3ZpZGVyLWRhdGV0aW1lLWxhYmVsXCI+XG4gICAgICAgICAgICB7ZGF0ZSA9PT0gbnVsbCA/ICdBdCBzb21lIHBvaW50JyA6IHJlbGF0aXZlRGF0ZShkYXRlKX1cbiAgICAgICAgICA8L3NwYW4+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfSxcblxufTtcbiJdfQ==