Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.getConfig = getConfig;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _nuclideFeatureConfig = require('../../nuclide-feature-config');

var _nuclideFeatureConfig2 = _interopRequireDefault(_nuclideFeatureConfig);

var DEBUGGER_LOGGER_CATEGORY = 'nuclide-lldb-client-debugger';
exports['default'] = require('../../nuclide-logging').getCategoryLogger(DEBUGGER_LOGGER_CATEGORY);

function getConfig() {
  return _nuclideFeatureConfig2['default'].get('nuclide-debugger-lldb-client');
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInV0aWxzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztvQ0FXMEIsOEJBQThCOzs7O0FBRXhELElBQU0sd0JBQXdCLEdBQUcsOEJBQThCLENBQUM7cUJBQ2pELE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLHdCQUF3QixDQUFDOztBQUVwRixTQUFTLFNBQVMsR0FBUTtBQUMvQixTQUFRLGtDQUFjLEdBQUcsQ0FBQyw4QkFBOEIsQ0FBQyxDQUFPO0NBQ2pFIiwiZmlsZSI6InV0aWxzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IGZlYXR1cmVDb25maWcgZnJvbSAnLi4vLi4vbnVjbGlkZS1mZWF0dXJlLWNvbmZpZyc7XG5cbmNvbnN0IERFQlVHR0VSX0xPR0dFUl9DQVRFR09SWSA9ICdudWNsaWRlLWxsZGItY2xpZW50LWRlYnVnZ2VyJztcbmV4cG9ydCBkZWZhdWx0IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtbG9nZ2luZycpLmdldENhdGVnb3J5TG9nZ2VyKERFQlVHR0VSX0xPR0dFUl9DQVRFR09SWSk7XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRDb25maWcoKTogYW55IHtcbiAgcmV0dXJuIChmZWF0dXJlQ29uZmlnLmdldCgnbnVjbGlkZS1kZWJ1Z2dlci1sbGRiLWNsaWVudCcpOiBhbnkpO1xufVxuIl19