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

exports.getBuiltinProviders = getBuiltinProviders;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _nuclideFeatureConfig = require('../../nuclide-feature-config');

var _nuclideFeatureConfig2 = _interopRequireDefault(_nuclideFeatureConfig);

function getBuiltinProviders() {
  var providers = [];
  if (_nuclideFeatureConfig2['default'].get('nuclide-distraction-free-mode.hideToolBar')) {
    providers.push(toolBarProvider);
  }
  return providers;
}

var toolBarProvider = {
  name: 'tool-bar',
  isVisible: function isVisible() {
    return Boolean(atom.config.get('tool-bar.visible'));
  },
  toggle: function toggle() {
    atom.config.set('tool-bar.visible', !this.isVisible());
  }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkJ1aWx0aW5Qcm92aWRlcnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztvQ0FhMEIsOEJBQThCOzs7O0FBRWpELFNBQVMsbUJBQW1CLEdBQXVDO0FBQ3hFLE1BQU0sU0FBUyxHQUFHLEVBQUUsQ0FBQztBQUNyQixNQUFJLGtDQUFjLEdBQUcsQ0FBQywyQ0FBMkMsQ0FBQyxFQUFFO0FBQ2xFLGFBQVMsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7R0FDakM7QUFDRCxTQUFPLFNBQVMsQ0FBQztDQUNsQjs7QUFFRCxJQUFNLGVBQWUsR0FBRztBQUN0QixNQUFJLEVBQUUsVUFBVTtBQUNoQixXQUFTLEVBQUEscUJBQVk7QUFDbkIsV0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO0dBQ3JEO0FBQ0QsUUFBTSxFQUFBLGtCQUFTO0FBQ2IsUUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQztHQUN4RDtDQUNGLENBQUMiLCJmaWxlIjoiQnVpbHRpblByb3ZpZGVycy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtEaXN0cmFjdGlvbkZyZWVNb2RlUHJvdmlkZXJ9IGZyb20gJy4uJztcblxuaW1wb3J0IGZlYXR1cmVDb25maWcgZnJvbSAnLi4vLi4vbnVjbGlkZS1mZWF0dXJlLWNvbmZpZyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRCdWlsdGluUHJvdmlkZXJzKCk6IEFycmF5PERpc3RyYWN0aW9uRnJlZU1vZGVQcm92aWRlcj4ge1xuICBjb25zdCBwcm92aWRlcnMgPSBbXTtcbiAgaWYgKGZlYXR1cmVDb25maWcuZ2V0KCdudWNsaWRlLWRpc3RyYWN0aW9uLWZyZWUtbW9kZS5oaWRlVG9vbEJhcicpKSB7XG4gICAgcHJvdmlkZXJzLnB1c2godG9vbEJhclByb3ZpZGVyKTtcbiAgfVxuICByZXR1cm4gcHJvdmlkZXJzO1xufVxuXG5jb25zdCB0b29sQmFyUHJvdmlkZXIgPSB7XG4gIG5hbWU6ICd0b29sLWJhcicsXG4gIGlzVmlzaWJsZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gQm9vbGVhbihhdG9tLmNvbmZpZy5nZXQoJ3Rvb2wtYmFyLnZpc2libGUnKSk7XG4gIH0sXG4gIHRvZ2dsZSgpOiB2b2lkIHtcbiAgICBhdG9tLmNvbmZpZy5zZXQoJ3Rvb2wtYmFyLnZpc2libGUnLCAhdGhpcy5pc1Zpc2libGUoKSk7XG4gIH0sXG59O1xuIl19