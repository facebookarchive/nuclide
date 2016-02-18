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

var _reactForAtom = require('react-for-atom');

var _relativeDate = require('relative-date');

var _relativeDate2 = _interopRequireDefault(_relativeDate);

var _commons = require('../../commons');

var safeRegExpFromString = _commons.regexp.safeRegExpFromString;

// Imported from nuclide-files-service, which is an apm package, preventing a direct import.

var _recentFilesService = null;

function getRecentFilesMatching(query) {
  if (_recentFilesService == null) {
    return [];
  }
  var queryRegExp = safeRegExpFromString(query);
  var projectPaths = atom.project.getPaths();
  var openFiles = _commons.array.compact(atom.workspace.getTextEditors().map(function (editor) {
    return editor.getPath();
  }));
  return _recentFilesService.getRecentFiles().filter(function (result) {
    return (!query.length || queryRegExp.test(result.path)) && projectPaths.some(function (projectPath) {
      return result.path.indexOf(projectPath) !== -1;
    }) && openFiles.every(function (file) {
      return result.path.indexOf(file) === -1;
    });
  }).map(function (result) {
    return {
      path: result.path,
      timestamp: result.timestamp
    };
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
    var filename = (0, _path.basename)(item.path);
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
//# sourceMappingURL=data:application/json;base64,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QUFRO1NBQVE7T0FDL0Q7TUFDTjs7VUFBSyxTQUFTLEVBQUMsMENBQTBDO1FBQ3ZEOztZQUFNLFNBQVMsRUFBQyxzQ0FBc0M7VUFDbkQsSUFBSSxLQUFLLElBQUksR0FBRyxlQUFlLEdBQUcsK0JBQWEsSUFBSSxDQUFDO1NBQ2hEO09BQ0g7S0FDRixDQUNOO0dBQ0g7O0NBRUYsQ0FBQyIsImZpbGUiOiJSZWNlbnRGaWxlc1Byb3ZpZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHtiYXNlbmFtZX0gZnJvbSAncGF0aCc7XG5pbXBvcnQge1JlYWN0fSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQgcmVsYXRpdmVEYXRlIGZyb20gJ3JlbGF0aXZlLWRhdGUnO1xuXG5pbXBvcnQgdHlwZSB7XG4gIEZpbGVSZXN1bHQsXG4gIFByb3ZpZGVyLFxuICBQcm92aWRlclR5cGUsXG59IGZyb20gJy4uLy4uL3F1aWNrLW9wZW4taW50ZXJmYWNlcyc7XG5cbmltcG9ydCB7YXJyYXksIHJlZ2V4cH0gZnJvbSAnLi4vLi4vY29tbW9ucyc7XG5jb25zdCB7c2FmZVJlZ0V4cEZyb21TdHJpbmd9ID0gcmVnZXhwO1xuXG4vLyBJbXBvcnRlZCBmcm9tIG51Y2xpZGUtZmlsZXMtc2VydmljZSwgd2hpY2ggaXMgYW4gYXBtIHBhY2thZ2UsIHByZXZlbnRpbmcgYSBkaXJlY3QgaW1wb3J0LlxudHlwZSBGaWxlUGF0aCA9IHN0cmluZztcbnR5cGUgVGltZVN0YW1wID0gbnVtYmVyO1xudHlwZSBGaWxlTGlzdCA9IEFycmF5PHtwYXRoOiBGaWxlUGF0aCwgdGltZXN0YW1wOiBUaW1lU3RhbXB9PjtcbnR5cGUgUmVjZW50RmlsZXNTZXJ2aWNlID0ge1xuICBnZXRSZWNlbnRGaWxlcygpOiBGaWxlTGlzdCxcbiAgdG91Y2hGaWxlKHBhdGg6IHN0cmluZyk6IHZvaWQsXG59O1xuXG5sZXQgX3JlY2VudEZpbGVzU2VydmljZTogP1JlY2VudEZpbGVzU2VydmljZSA9IG51bGw7XG5cbmZ1bmN0aW9uIGdldFJlY2VudEZpbGVzTWF0Y2hpbmcocXVlcnk6IHN0cmluZyk6IEFycmF5PEZpbGVSZXN1bHQ+IHtcbiAgaWYgKF9yZWNlbnRGaWxlc1NlcnZpY2UgPT0gbnVsbCkge1xuICAgIHJldHVybiBbXTtcbiAgfVxuICBjb25zdCBxdWVyeVJlZ0V4cCA9IHNhZmVSZWdFeHBGcm9tU3RyaW5nKHF1ZXJ5KTtcbiAgY29uc3QgcHJvamVjdFBhdGhzID0gYXRvbS5wcm9qZWN0LmdldFBhdGhzKCk7XG4gIGNvbnN0IG9wZW5GaWxlcyA9IGFycmF5LmNvbXBhY3QoXG4gICAgYXRvbS53b3Jrc3BhY2UuZ2V0VGV4dEVkaXRvcnMoKS5tYXAoZWRpdG9yID0+IGVkaXRvci5nZXRQYXRoKCkpXG4gICk7XG4gIHJldHVybiBfcmVjZW50RmlsZXNTZXJ2aWNlLmdldFJlY2VudEZpbGVzKClcbiAgICAuZmlsdGVyKHJlc3VsdCA9PlxuICAgICAgKCFxdWVyeS5sZW5ndGggfHwgcXVlcnlSZWdFeHAudGVzdChyZXN1bHQucGF0aCkpICYmXG4gICAgICBwcm9qZWN0UGF0aHMuc29tZShwcm9qZWN0UGF0aCA9PiByZXN1bHQucGF0aC5pbmRleE9mKHByb2plY3RQYXRoKSAhPT0gLTEpICYmXG4gICAgICBvcGVuRmlsZXMuZXZlcnkoZmlsZSA9PiByZXN1bHQucGF0aC5pbmRleE9mKGZpbGUpID09PSAtMSlcbiAgICApXG4gICAgLm1hcChyZXN1bHQgPT4gKHtcbiAgICAgIHBhdGg6IHJlc3VsdC5wYXRoLFxuICAgICAgdGltZXN0YW1wOiByZXN1bHQudGltZXN0YW1wLFxuICAgIH0pKTtcbn1cblxuY29uc3QgTVNfUEVSX0hPVVIgPSA2MCAqIDYwICogMTAwMDtcbmNvbnN0IE1TX1BFUl9EQVkgPSAyNCAqIE1TX1BFUl9IT1VSO1xuY29uc3QgTUlOX09QQUNJVFkgPSAwLjY7XG5jb25zdCBTSEVMRiA9IDggKiBNU19QRVJfSE9VUjsgLy8gOCBob3VyczogaGV1cmlzdGljIGZvciBcImN1cnJlbnQgd29yayBkYXlcIi5cbmNvbnN0IEZBTExPRkYgPSAxLjE7XG4vKipcbiAqIENhbGN1bGF0ZSBvcGFjaXR5IHdpdGggbG9nYXJpdGhtaWMgZmFsbG9mZiBiYXNlZCBvbiByZWNlbmN5IG9mIHRoZSB0aW1lc3RhbXAuXG4gKlxuICogIE9wYWNpdHkgICAgICAgICAgICAgICAgICAgICBub3dcbiAqICBeICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogIHwgICAgICAgICAgICAgICAgICA8IFNIRUxGID5cbiAqICB8ICAgICAgICAgICAgICAgICAgIyMjIyMjIyMjXG4gKiAgfCAgICAgICAgICAgICAgICAgICMjIyMjIyMjI1xuICogIHwgICA8IEZBTExPRkYgPiAgIyMjIyMjIyMjIyNcbiAqICB8ICAgICAgICAgICAgICAgIyMjIyMjIyMjIyMjXG4gKiAgfCAgICAgICAgICAgICMjIyMjIyMjIyMjIyMjI1xuICogIHwgICAgICAgICMjIyMjIyMjIyMjIyMjIyMjIyNcbiAqICB8ICMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjICBdIE1JTl9PUEFDSVRZXG4gKiAgfCAjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyAgXVxuICogICstLS0tLS0tLS0tVGltZS0tLS0tLS0tLS0tLS0tPlxuICovXG5mdW5jdGlvbiBvcGFjaXR5Rm9yVGltZXN0YW1wKHRpbWVzdGFtcDogbnVtYmVyKTogbnVtYmVyIHtcbiAgY29uc3QgYWdlSW5NUyA9IERhdGUubm93KCkgLSB0aW1lc3RhbXA7XG4gIHJldHVybiBNYXRoLm1pbihcbiAgICAxLFxuICAgIE1hdGgubWF4KFxuICAgICAgMSAtIChGQUxMT0ZGICogTWF0aC5sb2cxMCgoKGFnZUluTVMgLSBTSEVMRikgLyBNU19QRVJfREFZKSArIDEpKSxcbiAgICAgIE1JTl9PUEFDSVRZXG4gICAgKVxuICApO1xufVxuXG5leHBvcnQgY29uc3QgUmVjZW50RmlsZXNQcm92aWRlcjogUHJvdmlkZXIgPSB7XG5cbiAgZ2V0TmFtZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiAnUmVjZW50RmlsZXNQcm92aWRlcic7XG4gIH0sXG5cbiAgZ2V0UHJvdmlkZXJUeXBlKCk6IFByb3ZpZGVyVHlwZSB7XG4gICAgcmV0dXJuICdHTE9CQUwnO1xuICB9LFxuXG4gIGdldERlYm91bmNlRGVsYXkoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gMDtcbiAgfSxcblxuICBpc1JlbmRlcmFibGUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0sXG5cbiAgZ2V0QWN0aW9uKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuICdudWNsaWRlLXJlY2VudC1maWxlcy1wcm92aWRlcjp0b2dnbGUtcHJvdmlkZXInO1xuICB9LFxuXG4gIGdldFByb21wdFRleHQoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gJ1NlYXJjaCByZWNlbnRseSBvcGVuZWQgZmlsZXMnO1xuICB9LFxuXG4gIGdldFRhYlRpdGxlKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuICdSZWNlbnQgRmlsZXMnO1xuICB9LFxuXG4gIGV4ZWN1dGVRdWVyeShxdWVyeTogc3RyaW5nKTogUHJvbWlzZTxBcnJheTxGaWxlUmVzdWx0Pj4ge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoZ2V0UmVjZW50RmlsZXNNYXRjaGluZyhxdWVyeSkpO1xuICB9LFxuXG4gIHNldFJlY2VudEZpbGVzU2VydmljZShzZXJ2aWNlOiBSZWNlbnRGaWxlc1NlcnZpY2UpOiB2b2lkIHtcbiAgICBfcmVjZW50RmlsZXNTZXJ2aWNlID0gc2VydmljZTtcbiAgfSxcblxuICBnZXRDb21wb25lbnRGb3JJdGVtKGl0ZW06IEZpbGVSZXN1bHQpOiBSZWFjdEVsZW1lbnQge1xuICAgIGNvbnN0IGZpbGVuYW1lID0gYmFzZW5hbWUoaXRlbS5wYXRoKTtcbiAgICBjb25zdCBmaWxlUGF0aCA9IGl0ZW0ucGF0aC5zdWJzdHJpbmcoMCwgaXRlbS5wYXRoLmxhc3RJbmRleE9mKGZpbGVuYW1lKSk7XG4gICAgY29uc3QgZGF0ZSA9IGl0ZW0udGltZXN0YW1wID09IG51bGwgPyBudWxsIDogbmV3IERhdGUoaXRlbS50aW1lc3RhbXApO1xuICAgIGNvbnN0IGRhdGV0aW1lID0gZGF0ZSA9PT0gbnVsbCA/ICcnIDogZGF0ZS50b0xvY2FsZVN0cmluZygpO1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2XG4gICAgICAgIGNsYXNzTmFtZT1cInJlY2VudC1maWxlcy1wcm92aWRlci1yZXN1bHRcIlxuICAgICAgICBzdHlsZT17e29wYWNpdHk6IG9wYWNpdHlGb3JUaW1lc3RhbXAoaXRlbS50aW1lc3RhbXAgfHwgRGF0ZS5ub3coKSl9fVxuICAgICAgICB0aXRsZT17ZGF0ZXRpbWV9PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInJlY2VudC1maWxlcy1wcm92aWRlci1maWxlcGF0aC1jb250YWluZXJcIj5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJyZWNlbnQtZmlsZXMtcHJvdmlkZXItZmlsZS1wYXRoXCI+e2ZpbGVQYXRofTwvc3Bhbj5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJyZWNlbnQtZmlsZXMtcHJvdmlkZXItZmlsZS1uYW1lXCI+e2ZpbGVuYW1lfTwvc3Bhbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicmVjZW50LWZpbGVzLXByb3ZpZGVyLWRhdGV0aW1lLWNvbnRhaW5lclwiPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInJlY2VudC1maWxlcy1wcm92aWRlci1kYXRldGltZS1sYWJlbFwiPlxuICAgICAgICAgICAge2RhdGUgPT09IG51bGwgPyAnQXQgc29tZSBwb2ludCcgOiByZWxhdGl2ZURhdGUoZGF0ZSl9XG4gICAgICAgICAgPC9zcGFuPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH0sXG5cbn07XG4iXX0=