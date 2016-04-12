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

var _nuclideFeatureConfig = require('../../nuclide-feature-config');

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIldvcmtpbmdTZXRzQ29uZmlnLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OztvQ0FXMEIsOEJBQThCOzs7O0FBSXhELElBQU0sVUFBVSxHQUFHLGtDQUFrQyxDQUFDOztJQUt6QyxpQkFBaUI7V0FBakIsaUJBQWlCOzBCQUFqQixpQkFBaUI7OztlQUFqQixpQkFBaUI7O1dBQ1YsNEJBQUMsUUFBNkIsRUFBZTtBQUM3RCxVQUFNLE9BQU8sR0FBRyxTQUFWLE9BQU8sQ0FBRyxXQUFXLEVBQUk7O0FBRTdCLFlBQU0saUJBQWlCLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQyxVQUFBLEdBQUcsRUFBSTtBQUMvQyxpQkFBTztBQUNMLGdCQUFJLEVBQUUsR0FBRyxDQUFDLElBQUk7QUFDZCxrQkFBTSxFQUFFLEdBQUcsQ0FBQyxNQUFNO0FBQ2xCLGdCQUFJLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUU7V0FDdkIsQ0FBQztTQUNILENBQUMsQ0FBQzs7QUFFSCxnQkFBUSxDQUFDLGlCQUFpQixDQUFDLENBQUM7T0FDN0IsQ0FBQzs7QUFFRixhQUFPLGtDQUFjLE9BQU8sQ0FDMUIsVUFBVSxFQUNWLE9BQU8sQ0FDUixDQUFDO0tBQ0g7OztXQUVhLDBCQUFnQztBQUM1QyxhQUFRLGtDQUFjLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBTztLQUM3Qzs7O1dBRWEsd0JBQUMsV0FBd0MsRUFBUTtBQUM3RCx3Q0FBYyxHQUFHLENBQUMsVUFBVSxFQUFFLFdBQVcsQ0FBQyxDQUFDO0tBQzVDOzs7U0EzQlUsaUJBQWlCIiwiZmlsZSI6IldvcmtpbmdTZXRzQ29uZmlnLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IGZlYXR1cmVDb25maWcgZnJvbSAnLi4vLi4vbnVjbGlkZS1mZWF0dXJlLWNvbmZpZyc7XG5cbmltcG9ydCB0eXBlIHtXb3JraW5nU2V0RGVmaW5pdGlvbn0gZnJvbSAnLi4nO1xuXG5jb25zdCBDT05GSUdfS0VZID0gJ251Y2xpZGUtd29ya2luZy1zZXRzLndvcmtpbmdTZXRzJztcblxuZXhwb3J0IHR5cGUgRGVmaW5pdGlvbnNPYnNlcnZlciA9IChkZWZpbml0aW9uczogQXJyYXk8V29ya2luZ1NldERlZmluaXRpb24+KSA9PiB2b2lkO1xuXG5cbmV4cG9ydCBjbGFzcyBXb3JraW5nU2V0c0NvbmZpZyB7XG4gIG9ic2VydmVEZWZpbml0aW9ucyhjYWxsYmFjazogRGVmaW5pdGlvbnNPYnNlcnZlcik6IElEaXNwb3NhYmxlIHtcbiAgICBjb25zdCB3cmFwcGVkID0gZGVmaW5pdGlvbnMgPT4ge1xuICAgICAgLy8gR290IHRvIGNyZWF0ZSBhIGRlZXAgY29weSwgb3RoZXJ3aXNlIGF0b20uY29uZmlnIGludmFyaWFudHMgbWlnaHQgYnJlYWtcbiAgICAgIGNvbnN0IGNvcGllZERlZmluaXRpb25zID0gZGVmaW5pdGlvbnMubWFwKGRlZiA9PiB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgbmFtZTogZGVmLm5hbWUsXG4gICAgICAgICAgYWN0aXZlOiBkZWYuYWN0aXZlLFxuICAgICAgICAgIHVyaXM6IGRlZi51cmlzLnNsaWNlKCksXG4gICAgICAgIH07XG4gICAgICB9KTtcblxuICAgICAgY2FsbGJhY2soY29waWVkRGVmaW5pdGlvbnMpO1xuICAgIH07XG5cbiAgICByZXR1cm4gZmVhdHVyZUNvbmZpZy5vYnNlcnZlKFxuICAgICAgQ09ORklHX0tFWSxcbiAgICAgIHdyYXBwZWQsXG4gICAgKTtcbiAgfVxuXG4gIGdldERlZmluaXRpb25zKCk6IEFycmF5PFdvcmtpbmdTZXREZWZpbml0aW9uPiB7XG4gICAgcmV0dXJuIChmZWF0dXJlQ29uZmlnLmdldChDT05GSUdfS0VZKTogYW55KTtcbiAgfVxuXG4gIHNldERlZmluaXRpb25zKGRlZmluaXRpb25zOiBBcnJheTxXb3JraW5nU2V0RGVmaW5pdGlvbj4pOiB2b2lkIHtcbiAgICBmZWF0dXJlQ29uZmlnLnNldChDT05GSUdfS0VZLCBkZWZpbml0aW9ucyk7XG4gIH1cbn1cbiJdfQ==