var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _featureConfig = require('../../feature-config');

var _featureConfig2 = _interopRequireDefault(_featureConfig);

var Activation = (function () {
  function Activation() {
    var _this = this;

    _classCallCheck(this, Activation);

    var ObjectiveCColonIndenterCtr = require('./ObjectiveCColonIndenter');
    this._indentFeature = new ObjectiveCColonIndenterCtr();
    this._indentFeature.enable();

    var ObjectiveCBracketBalancerCtr = require('./ObjectiveCBracketBalancer');
    this._bracketFeature = new ObjectiveCBracketBalancerCtr();
    this._configSubscription = _featureConfig2['default'].observe('nuclide-objc.enableAutomaticSquareBracketInsertion', function (enabled) {
      return enabled ? _this._bracketFeature.enable() : _this._bracketFeature.disable();
    });
  }

  _createClass(Activation, [{
    key: 'dispose',
    value: function dispose() {
      this._configSubscription.dispose();
      this._bracketFeature.disable();
      this._indentFeature.disable();
    }
  }]);

  return Activation;
})();

var activation = undefined;

module.exports = {
  activate: function activate(state) {
    if (!activation) {
      activation = new Activation();
    }
  },

  deactivate: function deactivate() {
    if (activation) {
      activation.dispose();
      activation = null;
    }
  }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7NkJBYzBCLHNCQUFzQjs7OztJQUUxQyxVQUFVO0FBS0gsV0FMUCxVQUFVLEdBS0E7OzswQkFMVixVQUFVOztBQU1aLFFBQU0sMEJBQTBCLEdBQUcsT0FBTyxDQUFDLDJCQUEyQixDQUFDLENBQUM7QUFDeEUsUUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLDBCQUEwQixFQUFFLENBQUM7QUFDdkQsUUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsQ0FBQzs7QUFFN0IsUUFBTSw0QkFBNEIsR0FBRyxPQUFPLENBQUMsNkJBQTZCLENBQUMsQ0FBQztBQUM1RSxRQUFJLENBQUMsZUFBZSxHQUFHLElBQUksNEJBQTRCLEVBQUUsQ0FBQztBQUMxRCxRQUFJLENBQUMsbUJBQW1CLEdBQUcsMkJBQWMsT0FBTyxDQUM1QyxvREFBb0QsRUFDcEQsVUFBQSxPQUFPO2FBQUksT0FBTyxHQUFHLE1BQUssZUFBZSxDQUFDLE1BQU0sRUFBRSxHQUFHLE1BQUssZUFBZSxDQUFDLE9BQU8sRUFBRTtLQUFBLENBQUMsQ0FBQztHQUMxRjs7ZUFmRyxVQUFVOztXQWlCUCxtQkFBRztBQUNSLFVBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNuQyxVQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQy9CLFVBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDL0I7OztTQXJCRyxVQUFVOzs7QUF3QmhCLElBQUksVUFBdUIsWUFBQSxDQUFDOztBQUU1QixNQUFNLENBQUMsT0FBTyxHQUFHO0FBQ2YsVUFBUSxFQUFBLGtCQUFDLEtBQWEsRUFBUTtBQUM1QixRQUFJLENBQUMsVUFBVSxFQUFFO0FBQ2YsZ0JBQVUsR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFDO0tBQy9CO0dBQ0Y7O0FBRUQsWUFBVSxFQUFBLHNCQUFTO0FBQ2pCLFFBQUksVUFBVSxFQUFFO0FBQ2QsZ0JBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNyQixnQkFBVSxHQUFHLElBQUksQ0FBQztLQUNuQjtHQUNGO0NBQ0YsQ0FBQyIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUgT2JqZWN0aXZlQ0NvbG9uSW5kZW50ZXIgZnJvbSAnLi9PYmplY3RpdmVDQ29sb25JbmRlbnRlcic7XG5pbXBvcnQgdHlwZSBPYmplY3RpdmVDQnJhY2tldEJhbGFuY2VyIGZyb20gJy4vT2JqZWN0aXZlQ0JyYWNrZXRCYWxhbmNlcic7XG5cbmltcG9ydCBmZWF0dXJlQ29uZmlnIGZyb20gJy4uLy4uL2ZlYXR1cmUtY29uZmlnJztcblxuY2xhc3MgQWN0aXZhdGlvbiB7XG4gIF9pbmRlbnRGZWF0dXJlOiBPYmplY3RpdmVDQ29sb25JbmRlbnRlcjtcbiAgX2JyYWNrZXRGZWF0dXJlOiBPYmplY3RpdmVDQnJhY2tldEJhbGFuY2VyO1xuICBfY29uZmlnU3Vic2NyaXB0aW9uOiBhdG9tJERpc3Bvc2FibGU7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgY29uc3QgT2JqZWN0aXZlQ0NvbG9uSW5kZW50ZXJDdHIgPSByZXF1aXJlKCcuL09iamVjdGl2ZUNDb2xvbkluZGVudGVyJyk7XG4gICAgdGhpcy5faW5kZW50RmVhdHVyZSA9IG5ldyBPYmplY3RpdmVDQ29sb25JbmRlbnRlckN0cigpO1xuICAgIHRoaXMuX2luZGVudEZlYXR1cmUuZW5hYmxlKCk7XG5cbiAgICBjb25zdCBPYmplY3RpdmVDQnJhY2tldEJhbGFuY2VyQ3RyID0gcmVxdWlyZSgnLi9PYmplY3RpdmVDQnJhY2tldEJhbGFuY2VyJyk7XG4gICAgdGhpcy5fYnJhY2tldEZlYXR1cmUgPSBuZXcgT2JqZWN0aXZlQ0JyYWNrZXRCYWxhbmNlckN0cigpO1xuICAgIHRoaXMuX2NvbmZpZ1N1YnNjcmlwdGlvbiA9IGZlYXR1cmVDb25maWcub2JzZXJ2ZShcbiAgICAgICAgJ251Y2xpZGUtb2JqYy5lbmFibGVBdXRvbWF0aWNTcXVhcmVCcmFja2V0SW5zZXJ0aW9uJyxcbiAgICAgICAgZW5hYmxlZCA9PiBlbmFibGVkID8gdGhpcy5fYnJhY2tldEZlYXR1cmUuZW5hYmxlKCkgOiB0aGlzLl9icmFja2V0RmVhdHVyZS5kaXNhYmxlKCkpO1xuICB9XG5cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLl9jb25maWdTdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICAgIHRoaXMuX2JyYWNrZXRGZWF0dXJlLmRpc2FibGUoKTtcbiAgICB0aGlzLl9pbmRlbnRGZWF0dXJlLmRpc2FibGUoKTtcbiAgfVxufVxuXG5sZXQgYWN0aXZhdGlvbjogP0FjdGl2YXRpb247XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBhY3RpdmF0ZShzdGF0ZTogP21peGVkKTogdm9pZCB7XG4gICAgaWYgKCFhY3RpdmF0aW9uKSB7XG4gICAgICBhY3RpdmF0aW9uID0gbmV3IEFjdGl2YXRpb24oKTtcbiAgICB9XG4gIH0sXG5cbiAgZGVhY3RpdmF0ZSgpOiB2b2lkIHtcbiAgICBpZiAoYWN0aXZhdGlvbikge1xuICAgICAgYWN0aXZhdGlvbi5kaXNwb3NlKCk7XG4gICAgICBhY3RpdmF0aW9uID0gbnVsbDtcbiAgICB9XG4gIH0sXG59O1xuIl19