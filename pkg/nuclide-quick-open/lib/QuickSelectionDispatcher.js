var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _require = require('flux');

var Dispatcher = _require.Dispatcher;

var quickopenDispatcher = null;

var QuickSelectionDispatcher = (function () {
  function QuickSelectionDispatcher() {
    _classCallCheck(this, QuickSelectionDispatcher);
  }

  _createClass(QuickSelectionDispatcher, null, [{
    key: 'getInstance',
    value: function getInstance() {
      if (!quickopenDispatcher) {
        quickopenDispatcher = new Dispatcher();
      }
      return quickopenDispatcher;
    }
  }, {
    key: 'ActionType',
    value: Object.freeze({
      ACTIVE_PROVIDER_CHANGED: 'ACTIVE_PROVIDER_CHANGED',
      QUERY: 'QUERY'
    }),
    enumerable: true
  }]);

  return QuickSelectionDispatcher;
})();

module.exports = QuickSelectionDispatcher;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlF1aWNrU2VsZWN0aW9uRGlzcGF0Y2hlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7ZUFXcUIsT0FBTyxDQUFDLE1BQU0sQ0FBQzs7SUFBN0IsVUFBVSxZQUFWLFVBQVU7O0FBRWpCLElBQUksbUJBQW1CLEdBQUcsSUFBSSxDQUFDOztJQUN6Qix3QkFBd0I7V0FBeEIsd0JBQXdCOzBCQUF4Qix3QkFBd0I7OztlQUF4Qix3QkFBd0I7O1dBTVYsdUJBQWU7QUFDL0IsVUFBSSxDQUFDLG1CQUFtQixFQUFFO0FBQ3hCLDJCQUFtQixHQUFHLElBQUksVUFBVSxFQUFFLENBQUM7T0FDeEM7QUFDRCxhQUFPLG1CQUFtQixDQUFDO0tBQzVCOzs7V0FWbUIsTUFBTSxDQUFDLE1BQU0sQ0FBQztBQUNoQyw2QkFBdUIsRUFBRSx5QkFBeUI7QUFDbEQsV0FBSyxFQUFFLE9BQU87S0FDZixDQUFDOzs7O1NBSkUsd0JBQXdCOzs7QUFjOUIsTUFBTSxDQUFDLE9BQU8sR0FBRyx3QkFBd0IsQ0FBQyIsImZpbGUiOiJRdWlja1NlbGVjdGlvbkRpc3BhdGNoZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5jb25zdCB7RGlzcGF0Y2hlcn0gPSByZXF1aXJlKCdmbHV4Jyk7XG5cbmxldCBxdWlja29wZW5EaXNwYXRjaGVyID0gbnVsbDtcbmNsYXNzIFF1aWNrU2VsZWN0aW9uRGlzcGF0Y2hlciB7XG4gIHN0YXRpYyBBY3Rpb25UeXBlID0gT2JqZWN0LmZyZWV6ZSh7XG4gICAgQUNUSVZFX1BST1ZJREVSX0NIQU5HRUQ6ICdBQ1RJVkVfUFJPVklERVJfQ0hBTkdFRCcsXG4gICAgUVVFUlk6ICdRVUVSWScsXG4gIH0pO1xuXG4gIHN0YXRpYyBnZXRJbnN0YW5jZSgpOiBEaXNwYXRjaGVyIHtcbiAgICBpZiAoIXF1aWNrb3BlbkRpc3BhdGNoZXIpIHtcbiAgICAgIHF1aWNrb3BlbkRpc3BhdGNoZXIgPSBuZXcgRGlzcGF0Y2hlcigpO1xuICAgIH1cbiAgICByZXR1cm4gcXVpY2tvcGVuRGlzcGF0Y2hlcjtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFF1aWNrU2VsZWN0aW9uRGlzcGF0Y2hlcjtcbiJdfQ==