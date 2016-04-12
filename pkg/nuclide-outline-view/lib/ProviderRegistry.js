Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var ProviderRegistry = (function () {
  function ProviderRegistry() {
    _classCallCheck(this, ProviderRegistry);

    this._providers = new Set();
  }

  _createClass(ProviderRegistry, [{
    key: 'addProvider',
    value: function addProvider(provider) {
      this._providers.add(provider);
    }
  }, {
    key: 'removeProvider',
    value: function removeProvider(provider) {
      this._providers['delete'](provider);
    }
  }, {
    key: 'findProvider',
    value: function findProvider(grammar) {
      var bestProvider = null;
      var bestPriority = Number.NEGATIVE_INFINITY;
      for (var provider of this._providers) {
        if (provider.grammarScopes.indexOf(grammar) !== -1) {
          if (provider.priority > bestPriority) {
            bestProvider = provider;
            bestPriority = provider.priority;
          }
        }
      }
      return bestProvider;
    }
  }]);

  return ProviderRegistry;
})();

exports.ProviderRegistry = ProviderRegistry;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlByb3ZpZGVyUmVnaXN0cnkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztJQWdCYSxnQkFBZ0I7QUFHaEIsV0FIQSxnQkFBZ0IsR0FHYjswQkFISCxnQkFBZ0I7O0FBSXpCLFFBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztHQUM3Qjs7ZUFMVSxnQkFBZ0I7O1dBT2hCLHFCQUFDLFFBQVcsRUFBUTtBQUM3QixVQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUMvQjs7O1dBRWEsd0JBQUMsUUFBVyxFQUFRO0FBQ2hDLFVBQUksQ0FBQyxVQUFVLFVBQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUNsQzs7O1dBRVcsc0JBQUMsT0FBZSxFQUFNO0FBQ2hDLFVBQUksWUFBWSxHQUFHLElBQUksQ0FBQztBQUN4QixVQUFJLFlBQVksR0FBRyxNQUFNLENBQUMsaUJBQWlCLENBQUM7QUFDNUMsV0FBSyxJQUFNLFFBQVEsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFO0FBQ3RDLFlBQUksUUFBUSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7QUFDbEQsY0FBSSxRQUFRLENBQUMsUUFBUSxHQUFHLFlBQVksRUFBRTtBQUNwQyx3QkFBWSxHQUFHLFFBQVEsQ0FBQztBQUN4Qix3QkFBWSxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUM7V0FDbEM7U0FDRjtPQUNGO0FBQ0QsYUFBTyxZQUFZLENBQUM7S0FDckI7OztTQTNCVSxnQkFBZ0IiLCJmaWxlIjoiUHJvdmlkZXJSZWdpc3RyeS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbnR5cGUgUHJvdmlkZXIgPSB7XG4gIHByaW9yaXR5OiBudW1iZXI7XG4gIGdyYW1tYXJTY29wZXM6IEFycmF5PHN0cmluZz47XG59O1xuXG5leHBvcnQgY2xhc3MgUHJvdmlkZXJSZWdpc3RyeTxUOiBQcm92aWRlcj4ge1xuICBfcHJvdmlkZXJzOiBTZXQ8VD47XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fcHJvdmlkZXJzID0gbmV3IFNldCgpO1xuICB9XG5cbiAgYWRkUHJvdmlkZXIocHJvdmlkZXI6IFQpOiB2b2lkIHtcbiAgICB0aGlzLl9wcm92aWRlcnMuYWRkKHByb3ZpZGVyKTtcbiAgfVxuXG4gIHJlbW92ZVByb3ZpZGVyKHByb3ZpZGVyOiBUKTogdm9pZCB7XG4gICAgdGhpcy5fcHJvdmlkZXJzLmRlbGV0ZShwcm92aWRlcik7XG4gIH1cblxuICBmaW5kUHJvdmlkZXIoZ3JhbW1hcjogc3RyaW5nKTogP1Qge1xuICAgIGxldCBiZXN0UHJvdmlkZXIgPSBudWxsO1xuICAgIGxldCBiZXN0UHJpb3JpdHkgPSBOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFk7XG4gICAgZm9yIChjb25zdCBwcm92aWRlciBvZiB0aGlzLl9wcm92aWRlcnMpIHtcbiAgICAgIGlmIChwcm92aWRlci5ncmFtbWFyU2NvcGVzLmluZGV4T2YoZ3JhbW1hcikgIT09IC0xKSB7XG4gICAgICAgIGlmIChwcm92aWRlci5wcmlvcml0eSA+IGJlc3RQcmlvcml0eSkge1xuICAgICAgICAgIGJlc3RQcm92aWRlciA9IHByb3ZpZGVyO1xuICAgICAgICAgIGJlc3RQcmlvcml0eSA9IHByb3ZpZGVyLnByaW9yaXR5O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBiZXN0UHJvdmlkZXI7XG4gIH1cbn1cbiJdfQ==