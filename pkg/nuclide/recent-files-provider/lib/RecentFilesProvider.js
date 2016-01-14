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

var _reactForAtom2 = _interopRequireDefault(_reactForAtom);

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
    return _reactForAtom2['default'].createElement(
      'div',
      {
        className: 'recent-files-provider-result',
        style: { opacity: opacityForTimestamp(item.timestamp || Date.now()) },
        title: datetime },
      _reactForAtom2['default'].createElement(
        'div',
        { className: 'recent-files-provider-filepath-container' },
        _reactForAtom2['default'].createElement(
          'span',
          { className: 'recent-files-provider-file-path' },
          filePath
        ),
        _reactForAtom2['default'].createElement(
          'span',
          { className: 'recent-files-provider-file-name' },
          filename
        )
      ),
      _reactForAtom2['default'].createElement(
        'div',
        { className: 'recent-files-provider-datetime-container' },
        _reactForAtom2['default'].createElement(
          'span',
          { className: 'recent-files-provider-datetime-label' },
          date === null ? 'At some point' : (0, _relativeDate2['default'])(date)
        )
      )
    );
  }

};
exports.RecentFilesProvider = RecentFilesProvider;
//# sourceMappingURL=data:application/json;base64,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LFFBQVE7U0FBUTtPQUMvRDtNQUNOOztVQUFLLFNBQVMsRUFBQywwQ0FBMEM7UUFDdkQ7O1lBQU0sU0FBUyxFQUFDLHNDQUFzQztVQUNuRCxJQUFJLEtBQUssSUFBSSxHQUFHLGVBQWUsR0FBRywrQkFBYSxJQUFJLENBQUM7U0FDaEQ7T0FDSDtLQUNGLENBQ047R0FDSDs7Q0FFRixDQUFDIiwiZmlsZSI6IlJlY2VudEZpbGVzUHJvdmlkZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge2Jhc2VuYW1lfSBmcm9tICdwYXRoJztcbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQgcmVsYXRpdmVEYXRlIGZyb20gJ3JlbGF0aXZlLWRhdGUnO1xuXG5pbXBvcnQgdHlwZSB7XG4gIEZpbGVSZXN1bHQsXG4gIFByb3ZpZGVyLFxuICBQcm92aWRlclR5cGUsXG59IGZyb20gJy4uLy4uL3F1aWNrLW9wZW4taW50ZXJmYWNlcyc7XG5cbmltcG9ydCB7YXJyYXksIHJlZ2V4cH0gZnJvbSAnLi4vLi4vY29tbW9ucyc7XG5jb25zdCB7c2FmZVJlZ0V4cEZyb21TdHJpbmd9ID0gcmVnZXhwO1xuXG4vLyBJbXBvcnRlZCBmcm9tIG51Y2xpZGUtZmlsZXMtc2VydmljZSwgd2hpY2ggaXMgYW4gYXBtIHBhY2thZ2UsIHByZXZlbnRpbmcgYSBkaXJlY3QgaW1wb3J0LlxudHlwZSBGaWxlUGF0aCA9IHN0cmluZztcbnR5cGUgVGltZVN0YW1wID0gbnVtYmVyO1xudHlwZSBGaWxlTGlzdCA9IEFycmF5PHtwYXRoOiBGaWxlUGF0aCwgdGltZXN0YW1wOiBUaW1lU3RhbXB9PjtcbnR5cGUgUmVjZW50RmlsZXNTZXJ2aWNlID0ge1xuICBnZXRSZWNlbnRGaWxlcygpOiBGaWxlTGlzdCxcbiAgdG91Y2hGaWxlKHBhdGg6IHN0cmluZyk6IHZvaWQsXG59O1xuXG5sZXQgX3JlY2VudEZpbGVzU2VydmljZTogP1JlY2VudEZpbGVzU2VydmljZSA9IG51bGw7XG5cbmZ1bmN0aW9uIGdldFJlY2VudEZpbGVzTWF0Y2hpbmcocXVlcnk6IHN0cmluZyk6IEFycmF5PEZpbGVSZXN1bHQ+IHtcbiAgaWYgKF9yZWNlbnRGaWxlc1NlcnZpY2UgPT0gbnVsbCkge1xuICAgIHJldHVybiBbXTtcbiAgfVxuICBjb25zdCBxdWVyeVJlZ0V4cCA9IHNhZmVSZWdFeHBGcm9tU3RyaW5nKHF1ZXJ5KTtcbiAgY29uc3QgcHJvamVjdFBhdGhzID0gYXRvbS5wcm9qZWN0LmdldFBhdGhzKCk7XG4gIGNvbnN0IG9wZW5GaWxlcyA9IGFycmF5LmNvbXBhY3QoXG4gICAgYXRvbS53b3Jrc3BhY2UuZ2V0VGV4dEVkaXRvcnMoKS5tYXAoZWRpdG9yID0+IGVkaXRvci5nZXRQYXRoKCkpXG4gICk7XG4gIHJldHVybiBfcmVjZW50RmlsZXNTZXJ2aWNlLmdldFJlY2VudEZpbGVzKClcbiAgICAuZmlsdGVyKHJlc3VsdCA9PlxuICAgICAgKCFxdWVyeS5sZW5ndGggfHwgcXVlcnlSZWdFeHAudGVzdChyZXN1bHQucGF0aCkpICYmXG4gICAgICBwcm9qZWN0UGF0aHMuc29tZShwcm9qZWN0UGF0aCA9PiByZXN1bHQucGF0aC5pbmRleE9mKHByb2plY3RQYXRoKSAhPT0gLTEpICYmXG4gICAgICBvcGVuRmlsZXMuZXZlcnkoZmlsZSA9PiByZXN1bHQucGF0aC5pbmRleE9mKGZpbGUpID09PSAtMSlcbiAgICApXG4gICAgLm1hcChyZXN1bHQgPT4gKHtcbiAgICAgIHBhdGg6IHJlc3VsdC5wYXRoLFxuICAgICAgdGltZXN0YW1wOiByZXN1bHQudGltZXN0YW1wLFxuICAgIH0pKTtcbn1cblxuY29uc3QgTVNfUEVSX0hPVVIgPSA2MCAqIDYwICogMTAwMDtcbmNvbnN0IE1TX1BFUl9EQVkgPSAyNCAqIE1TX1BFUl9IT1VSO1xuY29uc3QgTUlOX09QQUNJVFkgPSAwLjY7XG5jb25zdCBTSEVMRiA9IDggKiBNU19QRVJfSE9VUjsgLy8gOCBob3VyczogaGV1cmlzdGljIGZvciBcImN1cnJlbnQgd29yayBkYXlcIi5cbmNvbnN0IEZBTExPRkYgPSAxLjE7XG4vKipcbiAqIENhbGN1bGF0ZSBvcGFjaXR5IHdpdGggbG9nYXJpdGhtaWMgZmFsbG9mZiBiYXNlZCBvbiByZWNlbmN5IG9mIHRoZSB0aW1lc3RhbXAuXG4gKlxuICogIE9wYWNpdHkgICAgICAgICAgICAgICAgICAgICBub3dcbiAqICBeICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogIHwgICAgICAgICAgICAgICAgICA8IFNIRUxGID5cbiAqICB8ICAgICAgICAgICAgICAgICAgIyMjIyMjIyMjXG4gKiAgfCAgICAgICAgICAgICAgICAgICMjIyMjIyMjI1xuICogIHwgICA8IEZBTExPRkYgPiAgIyMjIyMjIyMjIyNcbiAqICB8ICAgICAgICAgICAgICAgIyMjIyMjIyMjIyMjXG4gKiAgfCAgICAgICAgICAgICMjIyMjIyMjIyMjIyMjI1xuICogIHwgICAgICAgICMjIyMjIyMjIyMjIyMjIyMjIyNcbiAqICB8ICMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjICBdIE1JTl9PUEFDSVRZXG4gKiAgfCAjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyAgXVxuICogICstLS0tLS0tLS0tVGltZS0tLS0tLS0tLS0tLS0tPlxuICovXG5mdW5jdGlvbiBvcGFjaXR5Rm9yVGltZXN0YW1wKHRpbWVzdGFtcDogbnVtYmVyKTogbnVtYmVyIHtcbiAgY29uc3QgYWdlSW5NUyA9IERhdGUubm93KCkgLSB0aW1lc3RhbXA7XG4gIHJldHVybiBNYXRoLm1pbihcbiAgICAxLFxuICAgIE1hdGgubWF4KFxuICAgICAgMSAtIChGQUxMT0ZGICogTWF0aC5sb2cxMCgoKGFnZUluTVMgLSBTSEVMRikgLyBNU19QRVJfREFZKSArIDEpKSxcbiAgICAgIE1JTl9PUEFDSVRZXG4gICAgKVxuICApO1xufVxuXG5leHBvcnQgY29uc3QgUmVjZW50RmlsZXNQcm92aWRlcjogUHJvdmlkZXIgPSB7XG5cbiAgZ2V0TmFtZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiAnUmVjZW50RmlsZXNQcm92aWRlcic7XG4gIH0sXG5cbiAgZ2V0UHJvdmlkZXJUeXBlKCk6IFByb3ZpZGVyVHlwZSB7XG4gICAgcmV0dXJuICdHTE9CQUwnO1xuICB9LFxuXG4gIGdldERlYm91bmNlRGVsYXkoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gMDtcbiAgfSxcblxuICBpc1JlbmRlcmFibGUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0sXG5cbiAgZ2V0QWN0aW9uKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuICdudWNsaWRlLXJlY2VudC1maWxlcy1wcm92aWRlcjp0b2dnbGUtcHJvdmlkZXInO1xuICB9LFxuXG4gIGdldFByb21wdFRleHQoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gJ1NlYXJjaCByZWNlbnRseSBvcGVuZWQgZmlsZXMnO1xuICB9LFxuXG4gIGdldFRhYlRpdGxlKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuICdSZWNlbnQgRmlsZXMnO1xuICB9LFxuXG4gIGV4ZWN1dGVRdWVyeShxdWVyeTogc3RyaW5nKTogUHJvbWlzZTxBcnJheTxGaWxlUmVzdWx0Pj4ge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoZ2V0UmVjZW50RmlsZXNNYXRjaGluZyhxdWVyeSkpO1xuICB9LFxuXG4gIHNldFJlY2VudEZpbGVzU2VydmljZShzZXJ2aWNlOiBSZWNlbnRGaWxlc1NlcnZpY2UpOiB2b2lkIHtcbiAgICBfcmVjZW50RmlsZXNTZXJ2aWNlID0gc2VydmljZTtcbiAgfSxcblxuICBnZXRDb21wb25lbnRGb3JJdGVtKGl0ZW06IEZpbGVSZXN1bHQpOiBSZWFjdEVsZW1lbnQge1xuICAgIGNvbnN0IGZpbGVuYW1lID0gYmFzZW5hbWUoaXRlbS5wYXRoKTtcbiAgICBjb25zdCBmaWxlUGF0aCA9IGl0ZW0ucGF0aC5zdWJzdHJpbmcoMCwgaXRlbS5wYXRoLmxhc3RJbmRleE9mKGZpbGVuYW1lKSk7XG4gICAgY29uc3QgZGF0ZSA9IGl0ZW0udGltZXN0YW1wID09IG51bGwgPyBudWxsIDogbmV3IERhdGUoaXRlbS50aW1lc3RhbXApO1xuICAgIGNvbnN0IGRhdGV0aW1lID0gZGF0ZSA9PT0gbnVsbCA/ICcnIDogZGF0ZS50b0xvY2FsZVN0cmluZygpO1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2XG4gICAgICAgIGNsYXNzTmFtZT1cInJlY2VudC1maWxlcy1wcm92aWRlci1yZXN1bHRcIlxuICAgICAgICBzdHlsZT17e29wYWNpdHk6IG9wYWNpdHlGb3JUaW1lc3RhbXAoaXRlbS50aW1lc3RhbXAgfHwgRGF0ZS5ub3coKSl9fVxuICAgICAgICB0aXRsZT17ZGF0ZXRpbWV9PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInJlY2VudC1maWxlcy1wcm92aWRlci1maWxlcGF0aC1jb250YWluZXJcIj5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJyZWNlbnQtZmlsZXMtcHJvdmlkZXItZmlsZS1wYXRoXCI+e2ZpbGVQYXRofTwvc3Bhbj5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJyZWNlbnQtZmlsZXMtcHJvdmlkZXItZmlsZS1uYW1lXCI+e2ZpbGVuYW1lfTwvc3Bhbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicmVjZW50LWZpbGVzLXByb3ZpZGVyLWRhdGV0aW1lLWNvbnRhaW5lclwiPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInJlY2VudC1maWxlcy1wcm92aWRlci1kYXRldGltZS1sYWJlbFwiPlxuICAgICAgICAgICAge2RhdGUgPT09IG51bGwgPyAnQXQgc29tZSBwb2ludCcgOiByZWxhdGl2ZURhdGUoZGF0ZSl9XG4gICAgICAgICAgPC9zcGFuPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH0sXG5cbn07XG4iXX0=