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
  }]);

  return QuickSelectionDispatcher;
})();

QuickSelectionDispatcher.ActionType = {
  ACTIVE_PROVIDER_CHANGED: 'ACTIVE_PROVIDER_CHANGED',
  QUERY: 'QUERY'
};

module.exports = QuickSelectionDispatcher;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlF1aWNrU2VsZWN0aW9uRGlzcGF0Y2hlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7ZUFXcUIsT0FBTyxDQUFDLE1BQU0sQ0FBQzs7SUFBN0IsVUFBVSxZQUFWLFVBQVU7O0FBRWpCLElBQUksbUJBQW1CLEdBQUcsSUFBSSxDQUFDOztJQUN6Qix3QkFBd0I7V0FBeEIsd0JBQXdCOzBCQUF4Qix3QkFBd0I7OztlQUF4Qix3QkFBd0I7O1dBR1YsdUJBQWU7QUFDL0IsVUFBSSxDQUFDLG1CQUFtQixFQUFFO0FBQ3hCLDJCQUFtQixHQUFHLElBQUksVUFBVSxFQUFFLENBQUM7T0FDeEM7QUFDRCxhQUFPLG1CQUFtQixDQUFDO0tBQzVCOzs7U0FSRyx3QkFBd0I7OztBQVc5Qix3QkFBd0IsQ0FBQyxVQUFVLEdBQUc7QUFDcEMseUJBQXVCLEVBQUUseUJBQXlCO0FBQ2xELE9BQUssRUFBRSxPQUFPO0NBQ2YsQ0FBQzs7QUFFRixNQUFNLENBQUMsT0FBTyxHQUFHLHdCQUF3QixDQUFDIiwiZmlsZSI6IlF1aWNrU2VsZWN0aW9uRGlzcGF0Y2hlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IHtEaXNwYXRjaGVyfSA9IHJlcXVpcmUoJ2ZsdXgnKTtcblxubGV0IHF1aWNrb3BlbkRpc3BhdGNoZXIgPSBudWxsO1xuY2xhc3MgUXVpY2tTZWxlY3Rpb25EaXNwYXRjaGVyIHtcbiAgc3RhdGljIEFjdGlvblR5cGU6IHtba2V5OnN0cmluZ106IHN0cmluZ307XG5cbiAgc3RhdGljIGdldEluc3RhbmNlKCk6IERpc3BhdGNoZXIge1xuICAgIGlmICghcXVpY2tvcGVuRGlzcGF0Y2hlcikge1xuICAgICAgcXVpY2tvcGVuRGlzcGF0Y2hlciA9IG5ldyBEaXNwYXRjaGVyKCk7XG4gICAgfVxuICAgIHJldHVybiBxdWlja29wZW5EaXNwYXRjaGVyO1xuICB9XG59XG5cblF1aWNrU2VsZWN0aW9uRGlzcGF0Y2hlci5BY3Rpb25UeXBlID0ge1xuICBBQ1RJVkVfUFJPVklERVJfQ0hBTkdFRDogJ0FDVElWRV9QUk9WSURFUl9DSEFOR0VEJyxcbiAgUVVFUlk6ICdRVUVSWScsXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFF1aWNrU2VsZWN0aW9uRGlzcGF0Y2hlcjtcbiJdfQ==