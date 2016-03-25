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
    value: {
      ACTIVE_PROVIDER_CHANGED: 'ACTIVE_PROVIDER_CHANGED',
      QUERY: 'QUERY'
    },
    enumerable: true
  }]);

  return QuickSelectionDispatcher;
})();

module.exports = QuickSelectionDispatcher;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlF1aWNrU2VsZWN0aW9uRGlzcGF0Y2hlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7ZUFXcUIsT0FBTyxDQUFDLE1BQU0sQ0FBQzs7SUFBN0IsVUFBVSxZQUFWLFVBQVU7O0FBRWpCLElBQUksbUJBQW1CLEdBQUcsSUFBSSxDQUFDOztJQUN6Qix3QkFBd0I7V0FBeEIsd0JBQXdCOzBCQUF4Qix3QkFBd0I7OztlQUF4Qix3QkFBd0I7O1dBTVYsdUJBQWU7QUFDL0IsVUFBSSxDQUFDLG1CQUFtQixFQUFFO0FBQ3hCLDJCQUFtQixHQUFHLElBQUksVUFBVSxFQUFFLENBQUM7T0FDeEM7QUFDRCxhQUFPLG1CQUFtQixDQUFDO0tBQzVCOzs7V0FWbUI7QUFDbEIsNkJBQXVCLEVBQUUseUJBQXlCO0FBQ2xELFdBQUssRUFBRSxPQUFPO0tBQ2Y7Ozs7U0FKRyx3QkFBd0I7OztBQWM5QixNQUFNLENBQUMsT0FBTyxHQUFHLHdCQUF3QixDQUFDIiwiZmlsZSI6IlF1aWNrU2VsZWN0aW9uRGlzcGF0Y2hlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IHtEaXNwYXRjaGVyfSA9IHJlcXVpcmUoJ2ZsdXgnKTtcblxubGV0IHF1aWNrb3BlbkRpc3BhdGNoZXIgPSBudWxsO1xuY2xhc3MgUXVpY2tTZWxlY3Rpb25EaXNwYXRjaGVyIHtcbiAgc3RhdGljIEFjdGlvblR5cGUgPSB7XG4gICAgQUNUSVZFX1BST1ZJREVSX0NIQU5HRUQ6ICdBQ1RJVkVfUFJPVklERVJfQ0hBTkdFRCcsXG4gICAgUVVFUlk6ICdRVUVSWScsXG4gIH07XG5cbiAgc3RhdGljIGdldEluc3RhbmNlKCk6IERpc3BhdGNoZXIge1xuICAgIGlmICghcXVpY2tvcGVuRGlzcGF0Y2hlcikge1xuICAgICAgcXVpY2tvcGVuRGlzcGF0Y2hlciA9IG5ldyBEaXNwYXRjaGVyKCk7XG4gICAgfVxuICAgIHJldHVybiBxdWlja29wZW5EaXNwYXRjaGVyO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUXVpY2tTZWxlY3Rpb25EaXNwYXRjaGVyO1xuIl19