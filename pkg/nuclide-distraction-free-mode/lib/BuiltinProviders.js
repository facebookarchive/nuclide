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

exports.getBuiltinProviders = getBuiltinProviders;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _nuclideFeatureConfig = require('../../nuclide-feature-config');

var _nuclideFeatureConfig2 = _interopRequireDefault(_nuclideFeatureConfig);

function getBuiltinProviders() {
  var providers = [];
  if (_nuclideFeatureConfig2['default'].get('nuclide-distraction-free-mode.hideToolBar')) {
    providers.push(toolBarProvider);
  }
  if (_nuclideFeatureConfig2['default'].get('nuclide-distraction-free-mode.hideStatusBar')) {
    providers.push(new StatusBarProvider());
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

var StatusBarProvider = (function () {
  function StatusBarProvider() {
    _classCallCheck(this, StatusBarProvider);

    this.name = 'status-bar';
    this._oldDisplay = null;
  }

  _createClass(StatusBarProvider, [{
    key: 'isVisible',
    value: function isVisible() {
      return this._getStatusBarElement() != null && this._oldDisplay == null;
    }
  }, {
    key: 'toggle',
    value: function toggle() {
      var element = this._getStatusBarElement();
      if (element == null) {
        return;
      }
      if (this.isVisible()) {
        this._oldDisplay = element.style.display;
        element.style.display = 'none';
      } else {
        // isVisible is false, so oldDisplay is non-null
        (0, _assert2['default'])(this._oldDisplay != null);
        element.style.display = this._oldDisplay;
        this._oldDisplay = null;
      }
    }
  }, {
    key: '_getStatusBarElement',
    value: function _getStatusBarElement() {
      return document.querySelector('status-bar');
    }
  }]);

  return StatusBarProvider;
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkJ1aWx0aW5Qcm92aWRlcnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7c0JBYXNCLFFBQVE7Ozs7b0NBRUosOEJBQThCOzs7O0FBRWpELFNBQVMsbUJBQW1CLEdBQXVDO0FBQ3hFLE1BQU0sU0FBUyxHQUFHLEVBQUUsQ0FBQztBQUNyQixNQUFJLGtDQUFjLEdBQUcsQ0FBQywyQ0FBMkMsQ0FBQyxFQUFFO0FBQ2xFLGFBQVMsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7R0FDakM7QUFDRCxNQUFJLGtDQUFjLEdBQUcsQ0FBQyw2Q0FBNkMsQ0FBQyxFQUFFO0FBQ3BFLGFBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxpQkFBaUIsRUFBRSxDQUFDLENBQUM7R0FDekM7QUFDRCxTQUFPLFNBQVMsQ0FBQztDQUNsQjs7QUFFRCxJQUFNLGVBQWUsR0FBRztBQUN0QixNQUFJLEVBQUUsVUFBVTtBQUNoQixXQUFTLEVBQUEscUJBQVk7QUFDbkIsV0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO0dBQ3JEO0FBQ0QsUUFBTSxFQUFBLGtCQUFTO0FBQ2IsUUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQztHQUN4RDtDQUNGLENBQUM7O0lBRUksaUJBQWlCO0FBR1YsV0FIUCxpQkFBaUIsR0FHUDswQkFIVixpQkFBaUI7O0FBSW5CLFFBQUksQ0FBQyxJQUFJLEdBQUcsWUFBWSxDQUFDO0FBQ3pCLFFBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO0dBQ3pCOztlQU5HLGlCQUFpQjs7V0FPWixxQkFBWTtBQUNuQixhQUFPLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsV0FBVyxJQUFJLElBQUksQ0FBQztLQUN4RTs7O1dBQ0ssa0JBQVM7QUFDYixVQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztBQUM1QyxVQUFJLE9BQU8sSUFBSSxJQUFJLEVBQUU7QUFDbkIsZUFBTztPQUNSO0FBQ0QsVUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFLEVBQUU7QUFDcEIsWUFBSSxDQUFDLFdBQVcsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQztBQUN6QyxlQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7T0FDaEMsTUFBTTs7QUFFTCxpQ0FBVSxJQUFJLENBQUMsV0FBVyxJQUFJLElBQUksQ0FBQyxDQUFDO0FBQ3BDLGVBQU8sQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7QUFDekMsWUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7T0FDekI7S0FDRjs7O1dBQ21CLGdDQUFpQjtBQUNuQyxhQUFPLFFBQVEsQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLENBQUM7S0FDN0M7OztTQTNCRyxpQkFBaUIiLCJmaWxlIjoiQnVpbHRpblByb3ZpZGVycy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtEaXN0cmFjdGlvbkZyZWVNb2RlUHJvdmlkZXJ9IGZyb20gJy4uJztcblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuXG5pbXBvcnQgZmVhdHVyZUNvbmZpZyBmcm9tICcuLi8uLi9udWNsaWRlLWZlYXR1cmUtY29uZmlnJztcblxuZXhwb3J0IGZ1bmN0aW9uIGdldEJ1aWx0aW5Qcm92aWRlcnMoKTogQXJyYXk8RGlzdHJhY3Rpb25GcmVlTW9kZVByb3ZpZGVyPiB7XG4gIGNvbnN0IHByb3ZpZGVycyA9IFtdO1xuICBpZiAoZmVhdHVyZUNvbmZpZy5nZXQoJ251Y2xpZGUtZGlzdHJhY3Rpb24tZnJlZS1tb2RlLmhpZGVUb29sQmFyJykpIHtcbiAgICBwcm92aWRlcnMucHVzaCh0b29sQmFyUHJvdmlkZXIpO1xuICB9XG4gIGlmIChmZWF0dXJlQ29uZmlnLmdldCgnbnVjbGlkZS1kaXN0cmFjdGlvbi1mcmVlLW1vZGUuaGlkZVN0YXR1c0JhcicpKSB7XG4gICAgcHJvdmlkZXJzLnB1c2gobmV3IFN0YXR1c0JhclByb3ZpZGVyKCkpO1xuICB9XG4gIHJldHVybiBwcm92aWRlcnM7XG59XG5cbmNvbnN0IHRvb2xCYXJQcm92aWRlciA9IHtcbiAgbmFtZTogJ3Rvb2wtYmFyJyxcbiAgaXNWaXNpYmxlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBCb29sZWFuKGF0b20uY29uZmlnLmdldCgndG9vbC1iYXIudmlzaWJsZScpKTtcbiAgfSxcbiAgdG9nZ2xlKCk6IHZvaWQge1xuICAgIGF0b20uY29uZmlnLnNldCgndG9vbC1iYXIudmlzaWJsZScsICF0aGlzLmlzVmlzaWJsZSgpKTtcbiAgfSxcbn07XG5cbmNsYXNzIFN0YXR1c0JhclByb3ZpZGVyIHtcbiAgbmFtZTogc3RyaW5nO1xuICBfb2xkRGlzcGxheTogP3N0cmluZztcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5uYW1lID0gJ3N0YXR1cy1iYXInO1xuICAgIHRoaXMuX29sZERpc3BsYXkgPSBudWxsO1xuICB9XG4gIGlzVmlzaWJsZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0U3RhdHVzQmFyRWxlbWVudCgpICE9IG51bGwgJiYgdGhpcy5fb2xkRGlzcGxheSA9PSBudWxsO1xuICB9XG4gIHRvZ2dsZSgpOiB2b2lkIHtcbiAgICBjb25zdCBlbGVtZW50ID0gdGhpcy5fZ2V0U3RhdHVzQmFyRWxlbWVudCgpO1xuICAgIGlmIChlbGVtZW50ID09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNWaXNpYmxlKCkpIHtcbiAgICAgIHRoaXMuX29sZERpc3BsYXkgPSBlbGVtZW50LnN0eWxlLmRpc3BsYXk7XG4gICAgICBlbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGlzVmlzaWJsZSBpcyBmYWxzZSwgc28gb2xkRGlzcGxheSBpcyBub24tbnVsbFxuICAgICAgaW52YXJpYW50KHRoaXMuX29sZERpc3BsYXkgIT0gbnVsbCk7XG4gICAgICBlbGVtZW50LnN0eWxlLmRpc3BsYXkgPSB0aGlzLl9vbGREaXNwbGF5O1xuICAgICAgdGhpcy5fb2xkRGlzcGxheSA9IG51bGw7XG4gICAgfVxuICB9XG4gIF9nZXRTdGF0dXNCYXJFbGVtZW50KCk6ID9IVE1MRWxlbWVudCB7XG4gICAgcmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ3N0YXR1cy1iYXInKTtcbiAgfVxufVxuIl19