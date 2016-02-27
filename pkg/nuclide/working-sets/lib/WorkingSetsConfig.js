Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _nuclideFeatureConfig = require('../../../nuclide/feature-config');

var _nuclideFeatureConfig2 = _interopRequireDefault(_nuclideFeatureConfig);

var CONFIG_KEY = 'nuclide-working-sets.workingSets';

var WorkingSetsConfig = (function () {
  function WorkingSetsConfig() {
    _classCallCheck(this, WorkingSetsConfig);
  }

  _createClass(WorkingSetsConfig, [{
    key: 'observeDefinitions',
    value: function observeDefinitions(callback) {
      var wrapped = function wrapped(definitions) {
        // Got to create a deep copy, otherwise atom.config invariants might break
        var copiedDefinitions = definitions.map(function (def) {
          return {
            name: def.name,
            active: def.active,
            uris: def.uris.slice()
          };
        });

        callback(copiedDefinitions);
      };

      return _nuclideFeatureConfig2['default'].observe(CONFIG_KEY, wrapped);
    }
  }, {
    key: 'getDefinitions',
    value: function getDefinitions() {
      return _nuclideFeatureConfig2['default'].get(CONFIG_KEY);
    }
  }, {
    key: 'setDefinitions',
    value: function setDefinitions(definitions) {
      _nuclideFeatureConfig2['default'].set(CONFIG_KEY, definitions);
    }
  }]);

  return WorkingSetsConfig;
})();

exports.WorkingSetsConfig = WorkingSetsConfig;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIldvcmtpbmdTZXRzQ29uZmlnLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OztvQ0FXMEIsaUNBQWlDOzs7O0FBSTNELElBQU0sVUFBVSxHQUFHLGtDQUFrQyxDQUFDOztJQUt6QyxpQkFBaUI7V0FBakIsaUJBQWlCOzBCQUFqQixpQkFBaUI7OztlQUFqQixpQkFBaUI7O1dBQ1YsNEJBQUMsUUFBNkIsRUFBZTtBQUM3RCxVQUFNLE9BQU8sR0FBRyxTQUFWLE9BQU8sQ0FBRyxXQUFXLEVBQUk7O0FBRTdCLFlBQU0saUJBQWlCLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQyxVQUFBLEdBQUcsRUFBSTtBQUMvQyxpQkFBTztBQUNMLGdCQUFJLEVBQUUsR0FBRyxDQUFDLElBQUk7QUFDZCxrQkFBTSxFQUFFLEdBQUcsQ0FBQyxNQUFNO0FBQ2xCLGdCQUFJLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUU7V0FDdkIsQ0FBQztTQUNILENBQUMsQ0FBQzs7QUFFSCxnQkFBUSxDQUFDLGlCQUFpQixDQUFDLENBQUM7T0FDN0IsQ0FBQzs7QUFFRixhQUFPLGtDQUFjLE9BQU8sQ0FDMUIsVUFBVSxFQUNWLE9BQU8sQ0FDUixDQUFDO0tBQ0g7OztXQUVhLDBCQUFnQztBQUM1QyxhQUFRLGtDQUFjLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBTztLQUM3Qzs7O1dBRWEsd0JBQUMsV0FBd0MsRUFBUTtBQUM3RCx3Q0FBYyxHQUFHLENBQUMsVUFBVSxFQUFFLFdBQVcsQ0FBQyxDQUFDO0tBQzVDOzs7U0EzQlUsaUJBQWlCIiwiZmlsZSI6IldvcmtpbmdTZXRzQ29uZmlnLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IGZlYXR1cmVDb25maWcgZnJvbSAnLi4vLi4vLi4vbnVjbGlkZS9mZWF0dXJlLWNvbmZpZyc7XG5cbmltcG9ydCB0eXBlIHtXb3JraW5nU2V0RGVmaW5pdGlvbn0gZnJvbSAnLi9tYWluJztcblxuY29uc3QgQ09ORklHX0tFWSA9ICdudWNsaWRlLXdvcmtpbmctc2V0cy53b3JraW5nU2V0cyc7XG5cbmV4cG9ydCB0eXBlIERlZmluaXRpb25zT2JzZXJ2ZXIgPSAoZGVmaW5pdGlvbnM6IEFycmF5PFdvcmtpbmdTZXREZWZpbml0aW9uPikgPT4gdm9pZDtcblxuXG5leHBvcnQgY2xhc3MgV29ya2luZ1NldHNDb25maWcge1xuICBvYnNlcnZlRGVmaW5pdGlvbnMoY2FsbGJhY2s6IERlZmluaXRpb25zT2JzZXJ2ZXIpOiBJRGlzcG9zYWJsZSB7XG4gICAgY29uc3Qgd3JhcHBlZCA9IGRlZmluaXRpb25zID0+IHtcbiAgICAgIC8vIEdvdCB0byBjcmVhdGUgYSBkZWVwIGNvcHksIG90aGVyd2lzZSBhdG9tLmNvbmZpZyBpbnZhcmlhbnRzIG1pZ2h0IGJyZWFrXG4gICAgICBjb25zdCBjb3BpZWREZWZpbml0aW9ucyA9IGRlZmluaXRpb25zLm1hcChkZWYgPT4ge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIG5hbWU6IGRlZi5uYW1lLFxuICAgICAgICAgIGFjdGl2ZTogZGVmLmFjdGl2ZSxcbiAgICAgICAgICB1cmlzOiBkZWYudXJpcy5zbGljZSgpLFxuICAgICAgICB9O1xuICAgICAgfSk7XG5cbiAgICAgIGNhbGxiYWNrKGNvcGllZERlZmluaXRpb25zKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIGZlYXR1cmVDb25maWcub2JzZXJ2ZShcbiAgICAgIENPTkZJR19LRVksXG4gICAgICB3cmFwcGVkLFxuICAgICk7XG4gIH1cblxuICBnZXREZWZpbml0aW9ucygpOiBBcnJheTxXb3JraW5nU2V0RGVmaW5pdGlvbj4ge1xuICAgIHJldHVybiAoZmVhdHVyZUNvbmZpZy5nZXQoQ09ORklHX0tFWSk6IGFueSk7XG4gIH1cblxuICBzZXREZWZpbml0aW9ucyhkZWZpbml0aW9uczogQXJyYXk8V29ya2luZ1NldERlZmluaXRpb24+KTogdm9pZCB7XG4gICAgZmVhdHVyZUNvbmZpZy5zZXQoQ09ORklHX0tFWSwgZGVmaW5pdGlvbnMpO1xuICB9XG59XG4iXX0=