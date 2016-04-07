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
          date === null ? 'At some point' : (0, _nuclideCommons.relativeDate)(date)
        )
      )
    );
  }

};
exports.RecentFilesProvider = RecentFilesProvider;
//# sourceMappingURL=data:application/json;base64,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QUFHLElBQUksS0FBSyxJQUFJLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztBQUM1RCxXQUNFOzs7QUFDRSxpQkFBUyxFQUFDLDhCQUE4QjtBQUN4QyxhQUFLLEVBQUUsRUFBQyxPQUFPLEVBQUUsbUJBQW1CLENBQUMsSUFBSSxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBQyxBQUFDO0FBQ3BFLGFBQUssRUFBRSxRQUFRLEFBQUM7TUFDaEI7O1VBQUssU0FBUyxFQUFDLDBDQUEwQztRQUN2RDs7WUFBTSxTQUFTLEVBQUMsaUNBQWlDO1VBQUUsUUFBUTtTQUFRO1FBQ25FOztZQUFNLFNBQVMsRUFBQyxpQ0FBaUM7VUFBRSxRQUFRO1NBQVE7T0FDL0Q7TUFDTjs7VUFBSyxTQUFTLEVBQUMsMENBQTBDO1FBQ3ZEOztZQUFNLFNBQVMsRUFBQyxzQ0FBc0M7VUFDbkQsSUFBSSxLQUFLLElBQUksR0FBRyxlQUFlLEdBQUcsa0NBQWEsSUFBSSxDQUFDO1NBQ2hEO09BQ0g7S0FDRixDQUNOO0dBQ0g7O0NBRUYsQ0FBQyIsImZpbGUiOiJSZWNlbnRGaWxlc1Byb3ZpZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQge1JlYWN0fSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5cbmltcG9ydCB0eXBlIHtcbiAgRmlsZVJlc3VsdCxcbiAgUHJvdmlkZXIsXG4gIFByb3ZpZGVyVHlwZSxcbn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1xdWljay1vcGVuLWludGVyZmFjZXMnO1xuXG5pbXBvcnQge2FycmF5LCByZWxhdGl2ZURhdGV9IGZyb20gJy4uLy4uL251Y2xpZGUtY29tbW9ucyc7XG5pbXBvcnQge01hdGNoZXJ9IGZyb20gJy4uLy4uL251Y2xpZGUtZnV6enktbmF0aXZlJztcblxuLy8gSW1wb3J0ZWQgZnJvbSBudWNsaWRlLWZpbGVzLXNlcnZpY2UsIHdoaWNoIGlzIGFuIGFwbSBwYWNrYWdlLCBwcmV2ZW50aW5nIGEgZGlyZWN0IGltcG9ydC5cbnR5cGUgRmlsZVBhdGggPSBzdHJpbmc7XG50eXBlIFRpbWVTdGFtcCA9IG51bWJlcjtcbnR5cGUgRmlsZUxpc3QgPSBBcnJheTx7cGF0aDogRmlsZVBhdGg7IHRpbWVzdGFtcDogVGltZVN0YW1wfT47XG50eXBlIFJlY2VudEZpbGVzU2VydmljZSA9IHtcbiAgZ2V0UmVjZW50RmlsZXMoKTogRmlsZUxpc3Q7XG4gIHRvdWNoRmlsZShwYXRoOiBzdHJpbmcpOiB2b2lkO1xufTtcblxubGV0IF9yZWNlbnRGaWxlc1NlcnZpY2U6ID9SZWNlbnRGaWxlc1NlcnZpY2UgPSBudWxsO1xuXG5mdW5jdGlvbiBnZXRSZWNlbnRGaWxlc01hdGNoaW5nKHF1ZXJ5OiBzdHJpbmcpOiBBcnJheTxGaWxlUmVzdWx0PiB7XG4gIGlmIChfcmVjZW50RmlsZXNTZXJ2aWNlID09IG51bGwpIHtcbiAgICByZXR1cm4gW107XG4gIH1cbiAgY29uc3QgcHJvamVjdFBhdGhzID0gYXRvbS5wcm9qZWN0LmdldFBhdGhzKCk7XG4gIGNvbnN0IG9wZW5GaWxlcyA9IG5ldyBTZXQoYXJyYXkuY29tcGFjdChcbiAgICBhdG9tLndvcmtzcGFjZS5nZXRUZXh0RWRpdG9ycygpLm1hcChlZGl0b3IgPT4gZWRpdG9yLmdldFBhdGgoKSlcbiAgKSk7XG4gIGNvbnN0IHZhbGlkUmVjZW50RmlsZXMgPSBfcmVjZW50RmlsZXNTZXJ2aWNlLmdldFJlY2VudEZpbGVzKClcbiAgICAuZmlsdGVyKHJlc3VsdCA9PlxuICAgICAgIW9wZW5GaWxlcy5oYXMocmVzdWx0LnBhdGgpICYmXG4gICAgICBwcm9qZWN0UGF0aHMuc29tZShwcm9qZWN0UGF0aCA9PiByZXN1bHQucGF0aC5pbmRleE9mKHByb2plY3RQYXRoKSAhPT0gLTEpXG4gICAgKTtcbiAgY29uc3QgdGltZXN0YW1wczogTWFwPEZpbGVQYXRoLCBUaW1lU3RhbXA+ID0gbmV3IE1hcCgpO1xuICBjb25zdCBtYXRjaGVyID0gbmV3IE1hdGNoZXIodmFsaWRSZWNlbnRGaWxlcy5tYXAocmVjZW50RmlsZSA9PiB7XG4gICAgdGltZXN0YW1wcy5zZXQocmVjZW50RmlsZS5wYXRoLCByZWNlbnRGaWxlLnRpbWVzdGFtcCk7XG4gICAgcmV0dXJuIHJlY2VudEZpbGUucGF0aDtcbiAgfSkpO1xuICByZXR1cm4gbWF0Y2hlci5tYXRjaChxdWVyeSwge3JlY29yZE1hdGNoSW5kZXhlczogdHJ1ZX0pXG4gICAgLm1hcChyZXN1bHQgPT4gKHtcbiAgICAgIHBhdGg6IHJlc3VsdC52YWx1ZSxcbiAgICAgIHNjb3JlOiByZXN1bHQuc2NvcmUsXG4gICAgICBtYXRjaEluZGV4ZXM6IHJlc3VsdC5tYXRjaEluZGV4ZXMsXG4gICAgICB0aW1lc3RhbXA6IHRpbWVzdGFtcHMuZ2V0KHJlc3VsdC52YWx1ZSkgfHwgMCxcbiAgICB9KSlcbiAgICAvLyAkRmxvd0lzc3VlIEZsb3cgc2VlbXMgdG8gdHlwZSB0aGUgYXJndW1lbnRzIHRvIGBzb3J0YCBhcyBgRmlsZVJlc3VsdGAgd2l0aG91dCBgdGltZXN0YW1wYC5cbiAgICAuc29ydCgoYSwgYikgPT4gYi50aW1lc3RhbXAgLSBhLnRpbWVzdGFtcCk7XG59XG5cbmNvbnN0IE1TX1BFUl9IT1VSID0gNjAgKiA2MCAqIDEwMDA7XG5jb25zdCBNU19QRVJfREFZID0gMjQgKiBNU19QRVJfSE9VUjtcbmNvbnN0IE1JTl9PUEFDSVRZID0gMC42O1xuY29uc3QgU0hFTEYgPSA4ICogTVNfUEVSX0hPVVI7IC8vIDggaG91cnM6IGhldXJpc3RpYyBmb3IgXCJjdXJyZW50IHdvcmsgZGF5XCIuXG5jb25zdCBGQUxMT0ZGID0gMS4xO1xuLyoqXG4gKiBDYWxjdWxhdGUgb3BhY2l0eSB3aXRoIGxvZ2FyaXRobWljIGZhbGxvZmYgYmFzZWQgb24gcmVjZW5jeSBvZiB0aGUgdGltZXN0YW1wLlxuICpcbiAqICBPcGFjaXR5ICAgICAgICAgICAgICAgICAgICAgbm93XG4gKiAgXiAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8ICAgICAgICAgICAgICAgICAgPCBTSEVMRiA+XG4gKiAgfCAgICAgICAgICAgICAgICAgICMjIyMjIyMjI1xuICogIHwgICAgICAgICAgICAgICAgICAjIyMjIyMjIyNcbiAqICB8ICAgPCBGQUxMT0ZGID4gICMjIyMjIyMjIyMjXG4gKiAgfCAgICAgICAgICAgICAgICMjIyMjIyMjIyMjI1xuICogIHwgICAgICAgICAgICAjIyMjIyMjIyMjIyMjIyNcbiAqICB8ICAgICAgICAjIyMjIyMjIyMjIyMjIyMjIyMjXG4gKiAgfCAjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyAgXSBNSU5fT1BBQ0lUWVxuICogIHwgIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMgIF1cbiAqICArLS0tLS0tLS0tLVRpbWUtLS0tLS0tLS0tLS0tLT5cbiAqL1xuZnVuY3Rpb24gb3BhY2l0eUZvclRpbWVzdGFtcCh0aW1lc3RhbXA6IG51bWJlcik6IG51bWJlciB7XG4gIGNvbnN0IGFnZUluTVMgPSBEYXRlLm5vdygpIC0gdGltZXN0YW1wO1xuICByZXR1cm4gTWF0aC5taW4oXG4gICAgMSxcbiAgICBNYXRoLm1heChcbiAgICAgIDEgLSAoRkFMTE9GRiAqIE1hdGgubG9nMTAoKChhZ2VJbk1TIC0gU0hFTEYpIC8gTVNfUEVSX0RBWSkgKyAxKSksXG4gICAgICBNSU5fT1BBQ0lUWVxuICAgIClcbiAgKTtcbn1cblxuZXhwb3J0IGNvbnN0IFJlY2VudEZpbGVzUHJvdmlkZXI6IFByb3ZpZGVyID0ge1xuXG4gIGdldE5hbWUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gJ1JlY2VudEZpbGVzUHJvdmlkZXInO1xuICB9LFxuXG4gIGdldFByb3ZpZGVyVHlwZSgpOiBQcm92aWRlclR5cGUge1xuICAgIHJldHVybiAnR0xPQkFMJztcbiAgfSxcblxuICBnZXREZWJvdW5jZURlbGF5KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIDA7XG4gIH0sXG5cbiAgaXNSZW5kZXJhYmxlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0cnVlO1xuICB9LFxuXG4gIGdldEFjdGlvbigpOiBzdHJpbmcge1xuICAgIHJldHVybiAnbnVjbGlkZS1yZWNlbnQtZmlsZXMtcHJvdmlkZXI6dG9nZ2xlLXByb3ZpZGVyJztcbiAgfSxcblxuICBnZXRQcm9tcHRUZXh0KCk6IHN0cmluZyB7XG4gICAgcmV0dXJuICdTZWFyY2ggcmVjZW50bHkgb3BlbmVkIGZpbGVzJztcbiAgfSxcblxuICBnZXRUYWJUaXRsZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiAnUmVjZW50IEZpbGVzJztcbiAgfSxcblxuICBleGVjdXRlUXVlcnkocXVlcnk6IHN0cmluZyk6IFByb21pc2U8QXJyYXk8RmlsZVJlc3VsdD4+IHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGdldFJlY2VudEZpbGVzTWF0Y2hpbmcocXVlcnkpKTtcbiAgfSxcblxuICBzZXRSZWNlbnRGaWxlc1NlcnZpY2Uoc2VydmljZTogUmVjZW50RmlsZXNTZXJ2aWNlKTogdm9pZCB7XG4gICAgX3JlY2VudEZpbGVzU2VydmljZSA9IHNlcnZpY2U7XG4gIH0sXG5cbiAgZ2V0Q29tcG9uZW50Rm9ySXRlbShpdGVtOiBGaWxlUmVzdWx0KTogUmVhY3RFbGVtZW50IHtcbiAgICBjb25zdCBmaWxlbmFtZSA9IHBhdGguYmFzZW5hbWUoaXRlbS5wYXRoKTtcbiAgICBjb25zdCBmaWxlUGF0aCA9IGl0ZW0ucGF0aC5zdWJzdHJpbmcoMCwgaXRlbS5wYXRoLmxhc3RJbmRleE9mKGZpbGVuYW1lKSk7XG4gICAgY29uc3QgZGF0ZSA9IGl0ZW0udGltZXN0YW1wID09IG51bGwgPyBudWxsIDogbmV3IERhdGUoaXRlbS50aW1lc3RhbXApO1xuICAgIGNvbnN0IGRhdGV0aW1lID0gZGF0ZSA9PT0gbnVsbCA/ICcnIDogZGF0ZS50b0xvY2FsZVN0cmluZygpO1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2XG4gICAgICAgIGNsYXNzTmFtZT1cInJlY2VudC1maWxlcy1wcm92aWRlci1yZXN1bHRcIlxuICAgICAgICBzdHlsZT17e29wYWNpdHk6IG9wYWNpdHlGb3JUaW1lc3RhbXAoaXRlbS50aW1lc3RhbXAgfHwgRGF0ZS5ub3coKSl9fVxuICAgICAgICB0aXRsZT17ZGF0ZXRpbWV9PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInJlY2VudC1maWxlcy1wcm92aWRlci1maWxlcGF0aC1jb250YWluZXJcIj5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJyZWNlbnQtZmlsZXMtcHJvdmlkZXItZmlsZS1wYXRoXCI+e2ZpbGVQYXRofTwvc3Bhbj5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJyZWNlbnQtZmlsZXMtcHJvdmlkZXItZmlsZS1uYW1lXCI+e2ZpbGVuYW1lfTwvc3Bhbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicmVjZW50LWZpbGVzLXByb3ZpZGVyLWRhdGV0aW1lLWNvbnRhaW5lclwiPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInJlY2VudC1maWxlcy1wcm92aWRlci1kYXRldGltZS1sYWJlbFwiPlxuICAgICAgICAgICAge2RhdGUgPT09IG51bGwgPyAnQXQgc29tZSBwb2ludCcgOiByZWxhdGl2ZURhdGUoZGF0ZSl9XG4gICAgICAgICAgPC9zcGFuPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH0sXG5cbn07XG4iXX0=