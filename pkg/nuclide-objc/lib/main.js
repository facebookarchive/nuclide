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

var _nuclideFeatureConfig = require('../../nuclide-feature-config');

var _nuclideFeatureConfig2 = _interopRequireDefault(_nuclideFeatureConfig);

var Activation = (function () {
  function Activation() {
    var _this = this;

    _classCallCheck(this, Activation);

    var ObjectiveCColonIndenterCtr = require('./ObjectiveCColonIndenter');
    this._indentFeature = new ObjectiveCColonIndenterCtr();
    this._indentFeature.enable();

    var ObjectiveCBracketBalancerCtr = require('./ObjectiveCBracketBalancer');
    this._bracketFeature = new ObjectiveCBracketBalancerCtr();
    this._configSubscription = _nuclideFeatureConfig2['default'].observe('nuclide-objc.enableAutomaticSquareBracketInsertion', function (enabled) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7b0NBYzBCLDhCQUE4Qjs7OztJQUVsRCxVQUFVO0FBS0gsV0FMUCxVQUFVLEdBS0E7OzswQkFMVixVQUFVOztBQU1aLFFBQU0sMEJBQTBCLEdBQUcsT0FBTyxDQUFDLDJCQUEyQixDQUFDLENBQUM7QUFDeEUsUUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLDBCQUEwQixFQUFFLENBQUM7QUFDdkQsUUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsQ0FBQzs7QUFFN0IsUUFBTSw0QkFBNEIsR0FBRyxPQUFPLENBQUMsNkJBQTZCLENBQUMsQ0FBQztBQUM1RSxRQUFJLENBQUMsZUFBZSxHQUFHLElBQUksNEJBQTRCLEVBQUUsQ0FBQztBQUMxRCxRQUFJLENBQUMsbUJBQW1CLEdBQUcsa0NBQWMsT0FBTyxDQUM1QyxvREFBb0QsRUFDcEQsVUFBQSxPQUFPO2FBQUksT0FBTyxHQUFHLE1BQUssZUFBZSxDQUFDLE1BQU0sRUFBRSxHQUFHLE1BQUssZUFBZSxDQUFDLE9BQU8sRUFBRTtLQUFBLENBQUMsQ0FBQztHQUMxRjs7ZUFmRyxVQUFVOztXQWlCUCxtQkFBRztBQUNSLFVBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNuQyxVQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQy9CLFVBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDL0I7OztTQXJCRyxVQUFVOzs7QUF3QmhCLElBQUksVUFBdUIsWUFBQSxDQUFDOztBQUU1QixNQUFNLENBQUMsT0FBTyxHQUFHO0FBQ2YsVUFBUSxFQUFBLGtCQUFDLEtBQWEsRUFBUTtBQUM1QixRQUFJLENBQUMsVUFBVSxFQUFFO0FBQ2YsZ0JBQVUsR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFDO0tBQy9CO0dBQ0Y7O0FBRUQsWUFBVSxFQUFBLHNCQUFTO0FBQ2pCLFFBQUksVUFBVSxFQUFFO0FBQ2QsZ0JBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNyQixnQkFBVSxHQUFHLElBQUksQ0FBQztLQUNuQjtHQUNGO0NBQ0YsQ0FBQyIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUgT2JqZWN0aXZlQ0NvbG9uSW5kZW50ZXIgZnJvbSAnLi9PYmplY3RpdmVDQ29sb25JbmRlbnRlcic7XG5pbXBvcnQgdHlwZSBPYmplY3RpdmVDQnJhY2tldEJhbGFuY2VyIGZyb20gJy4vT2JqZWN0aXZlQ0JyYWNrZXRCYWxhbmNlcic7XG5cbmltcG9ydCBmZWF0dXJlQ29uZmlnIGZyb20gJy4uLy4uL251Y2xpZGUtZmVhdHVyZS1jb25maWcnO1xuXG5jbGFzcyBBY3RpdmF0aW9uIHtcbiAgX2luZGVudEZlYXR1cmU6IE9iamVjdGl2ZUNDb2xvbkluZGVudGVyO1xuICBfYnJhY2tldEZlYXR1cmU6IE9iamVjdGl2ZUNCcmFja2V0QmFsYW5jZXI7XG4gIF9jb25maWdTdWJzY3JpcHRpb246IElEaXNwb3NhYmxlO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIGNvbnN0IE9iamVjdGl2ZUNDb2xvbkluZGVudGVyQ3RyID0gcmVxdWlyZSgnLi9PYmplY3RpdmVDQ29sb25JbmRlbnRlcicpO1xuICAgIHRoaXMuX2luZGVudEZlYXR1cmUgPSBuZXcgT2JqZWN0aXZlQ0NvbG9uSW5kZW50ZXJDdHIoKTtcbiAgICB0aGlzLl9pbmRlbnRGZWF0dXJlLmVuYWJsZSgpO1xuXG4gICAgY29uc3QgT2JqZWN0aXZlQ0JyYWNrZXRCYWxhbmNlckN0ciA9IHJlcXVpcmUoJy4vT2JqZWN0aXZlQ0JyYWNrZXRCYWxhbmNlcicpO1xuICAgIHRoaXMuX2JyYWNrZXRGZWF0dXJlID0gbmV3IE9iamVjdGl2ZUNCcmFja2V0QmFsYW5jZXJDdHIoKTtcbiAgICB0aGlzLl9jb25maWdTdWJzY3JpcHRpb24gPSBmZWF0dXJlQ29uZmlnLm9ic2VydmUoXG4gICAgICAgICdudWNsaWRlLW9iamMuZW5hYmxlQXV0b21hdGljU3F1YXJlQnJhY2tldEluc2VydGlvbicsXG4gICAgICAgIGVuYWJsZWQgPT4gZW5hYmxlZCA/IHRoaXMuX2JyYWNrZXRGZWF0dXJlLmVuYWJsZSgpIDogdGhpcy5fYnJhY2tldEZlYXR1cmUuZGlzYWJsZSgpKTtcbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5fY29uZmlnU3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgICB0aGlzLl9icmFja2V0RmVhdHVyZS5kaXNhYmxlKCk7XG4gICAgdGhpcy5faW5kZW50RmVhdHVyZS5kaXNhYmxlKCk7XG4gIH1cbn1cblxubGV0IGFjdGl2YXRpb246ID9BY3RpdmF0aW9uO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgYWN0aXZhdGUoc3RhdGU6ID9taXhlZCk6IHZvaWQge1xuICAgIGlmICghYWN0aXZhdGlvbikge1xuICAgICAgYWN0aXZhdGlvbiA9IG5ldyBBY3RpdmF0aW9uKCk7XG4gICAgfVxuICB9LFxuXG4gIGRlYWN0aXZhdGUoKTogdm9pZCB7XG4gICAgaWYgKGFjdGl2YXRpb24pIHtcbiAgICAgIGFjdGl2YXRpb24uZGlzcG9zZSgpO1xuICAgICAgYWN0aXZhdGlvbiA9IG51bGw7XG4gICAgfVxuICB9LFxufTtcbiJdfQ==