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

exports.activate = activate;
exports.deactivate = deactivate;

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

function activate(state) {
  if (!activation) {
    activation = new Activation();
  }
}

function deactivate() {
  if (activation) {
    activation.dispose();
    activation = null;
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O29DQWMwQiw4QkFBOEI7Ozs7SUFFbEQsVUFBVTtBQUtILFdBTFAsVUFBVSxHQUtBOzs7MEJBTFYsVUFBVTs7QUFNWixRQUFNLDBCQUEwQixHQUFHLE9BQU8sQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO0FBQ3hFLFFBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSwwQkFBMEIsRUFBRSxDQUFDO0FBQ3ZELFFBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLENBQUM7O0FBRTdCLFFBQU0sNEJBQTRCLEdBQUcsT0FBTyxDQUFDLDZCQUE2QixDQUFDLENBQUM7QUFDNUUsUUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLDRCQUE0QixFQUFFLENBQUM7QUFDMUQsUUFBSSxDQUFDLG1CQUFtQixHQUFHLGtDQUFjLE9BQU8sQ0FDNUMsb0RBQW9ELEVBQ3BELFVBQUEsT0FBTzthQUFJLE9BQU8sR0FBRyxNQUFLLGVBQWUsQ0FBQyxNQUFNLEVBQUUsR0FBRyxNQUFLLGVBQWUsQ0FBQyxPQUFPLEVBQUU7S0FBQSxDQUFDLENBQUM7R0FDMUY7O2VBZkcsVUFBVTs7V0FpQlAsbUJBQUc7QUFDUixVQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDbkMsVUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUMvQixVQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQy9COzs7U0FyQkcsVUFBVTs7O0FBd0JoQixJQUFJLFVBQXVCLFlBQUEsQ0FBQzs7QUFFckIsU0FBUyxRQUFRLENBQUMsS0FBYSxFQUFRO0FBQzVDLE1BQUksQ0FBQyxVQUFVLEVBQUU7QUFDZixjQUFVLEdBQUcsSUFBSSxVQUFVLEVBQUUsQ0FBQztHQUMvQjtDQUNGOztBQUVNLFNBQVMsVUFBVSxHQUFTO0FBQ2pDLE1BQUksVUFBVSxFQUFFO0FBQ2QsY0FBVSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3JCLGNBQVUsR0FBRyxJQUFJLENBQUM7R0FDbkI7Q0FDRiIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUgT2JqZWN0aXZlQ0NvbG9uSW5kZW50ZXIgZnJvbSAnLi9PYmplY3RpdmVDQ29sb25JbmRlbnRlcic7XG5pbXBvcnQgdHlwZSBPYmplY3RpdmVDQnJhY2tldEJhbGFuY2VyIGZyb20gJy4vT2JqZWN0aXZlQ0JyYWNrZXRCYWxhbmNlcic7XG5cbmltcG9ydCBmZWF0dXJlQ29uZmlnIGZyb20gJy4uLy4uL251Y2xpZGUtZmVhdHVyZS1jb25maWcnO1xuXG5jbGFzcyBBY3RpdmF0aW9uIHtcbiAgX2luZGVudEZlYXR1cmU6IE9iamVjdGl2ZUNDb2xvbkluZGVudGVyO1xuICBfYnJhY2tldEZlYXR1cmU6IE9iamVjdGl2ZUNCcmFja2V0QmFsYW5jZXI7XG4gIF9jb25maWdTdWJzY3JpcHRpb246IElEaXNwb3NhYmxlO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIGNvbnN0IE9iamVjdGl2ZUNDb2xvbkluZGVudGVyQ3RyID0gcmVxdWlyZSgnLi9PYmplY3RpdmVDQ29sb25JbmRlbnRlcicpO1xuICAgIHRoaXMuX2luZGVudEZlYXR1cmUgPSBuZXcgT2JqZWN0aXZlQ0NvbG9uSW5kZW50ZXJDdHIoKTtcbiAgICB0aGlzLl9pbmRlbnRGZWF0dXJlLmVuYWJsZSgpO1xuXG4gICAgY29uc3QgT2JqZWN0aXZlQ0JyYWNrZXRCYWxhbmNlckN0ciA9IHJlcXVpcmUoJy4vT2JqZWN0aXZlQ0JyYWNrZXRCYWxhbmNlcicpO1xuICAgIHRoaXMuX2JyYWNrZXRGZWF0dXJlID0gbmV3IE9iamVjdGl2ZUNCcmFja2V0QmFsYW5jZXJDdHIoKTtcbiAgICB0aGlzLl9jb25maWdTdWJzY3JpcHRpb24gPSBmZWF0dXJlQ29uZmlnLm9ic2VydmUoXG4gICAgICAgICdudWNsaWRlLW9iamMuZW5hYmxlQXV0b21hdGljU3F1YXJlQnJhY2tldEluc2VydGlvbicsXG4gICAgICAgIGVuYWJsZWQgPT4gZW5hYmxlZCA/IHRoaXMuX2JyYWNrZXRGZWF0dXJlLmVuYWJsZSgpIDogdGhpcy5fYnJhY2tldEZlYXR1cmUuZGlzYWJsZSgpKTtcbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5fY29uZmlnU3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgICB0aGlzLl9icmFja2V0RmVhdHVyZS5kaXNhYmxlKCk7XG4gICAgdGhpcy5faW5kZW50RmVhdHVyZS5kaXNhYmxlKCk7XG4gIH1cbn1cblxubGV0IGFjdGl2YXRpb246ID9BY3RpdmF0aW9uO1xuXG5leHBvcnQgZnVuY3Rpb24gYWN0aXZhdGUoc3RhdGU6ID9taXhlZCk6IHZvaWQge1xuICBpZiAoIWFjdGl2YXRpb24pIHtcbiAgICBhY3RpdmF0aW9uID0gbmV3IEFjdGl2YXRpb24oKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVhY3RpdmF0ZSgpOiB2b2lkIHtcbiAgaWYgKGFjdGl2YXRpb24pIHtcbiAgICBhY3RpdmF0aW9uLmRpc3Bvc2UoKTtcbiAgICBhY3RpdmF0aW9uID0gbnVsbDtcbiAgfVxufVxuIl19