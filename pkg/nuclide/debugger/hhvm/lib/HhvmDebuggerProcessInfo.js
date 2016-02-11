Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _atom = require('../../atom');

var _HhvmDebuggerInstance = require('./HhvmDebuggerInstance');

var HhvmDebuggerProcessInfo = (function (_DebuggerProcessInfo) {
  _inherits(HhvmDebuggerProcessInfo, _DebuggerProcessInfo);

  function HhvmDebuggerProcessInfo(targetUri) {
    _classCallCheck(this, HhvmDebuggerProcessInfo);

    _get(Object.getPrototypeOf(HhvmDebuggerProcessInfo.prototype), 'constructor', this).call(this, 'hhvm', targetUri);
  }

  _createClass(HhvmDebuggerProcessInfo, [{
    key: 'attach',
    value: function attach() {
      return new _HhvmDebuggerInstance.HhvmDebuggerInstance(this);
    }
  }, {
    key: 'launch',
    value: function launch(launchTarget) {
      return new _HhvmDebuggerInstance.HhvmDebuggerInstance(this, launchTarget);
    }
  }, {
    key: 'compareDetails',
    value: function compareDetails(other) {
      (0, _assert2['default'])(other instanceof HhvmDebuggerProcessInfo);
      return compareString(this._targetUri, other._targetUri);
    }
  }, {
    key: 'displayString',
    value: function displayString() {
      var remoteUri = require('../../../remote-uri');
      return remoteUri.getHostname(this._targetUri);
    }
  }]);

  return HhvmDebuggerProcessInfo;
})(_atom.DebuggerProcessInfo);

exports.HhvmDebuggerProcessInfo = HhvmDebuggerProcessInfo;

function compareString(value1, value2) {
  return value1 === value2 ? 0 : value1 < value2 ? -1 : 1;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkhodm1EZWJ1Z2dlclByb2Nlc3NJbmZvLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7c0JBV3NCLFFBQVE7Ozs7b0JBQ0ksWUFBWTs7b0NBQ1gsd0JBQXdCOztJQUk5Qyx1QkFBdUI7WUFBdkIsdUJBQXVCOztBQUN2QixXQURBLHVCQUF1QixDQUN0QixTQUFxQixFQUFFOzBCQUR4Qix1QkFBdUI7O0FBRWhDLCtCQUZTLHVCQUF1Qiw2Q0FFMUIsTUFBTSxFQUFFLFNBQVMsRUFBRTtHQUMxQjs7ZUFIVSx1QkFBdUI7O1dBSzVCLGtCQUF5QjtBQUM3QixhQUFPLCtDQUF5QixJQUFJLENBQUMsQ0FBQztLQUN2Qzs7O1dBRUssZ0JBQUMsWUFBb0IsRUFBd0I7QUFDakQsYUFBTywrQ0FBeUIsSUFBSSxFQUFFLFlBQVksQ0FBQyxDQUFDO0tBQ3JEOzs7V0FFYSx3QkFBQyxLQUEwQixFQUFVO0FBQ2pELCtCQUFVLEtBQUssWUFBWSx1QkFBdUIsQ0FBQyxDQUFDO0FBQ3BELGFBQU8sYUFBYSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0tBQ3pEOzs7V0FFWSx5QkFBVztBQUN0QixVQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMscUJBQXFCLENBQUMsQ0FBQztBQUNqRCxhQUFPLFNBQVMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0tBQy9DOzs7U0FyQlUsdUJBQXVCOzs7OztBQXdCcEMsU0FBUyxhQUFhLENBQUMsTUFBYyxFQUFFLE1BQWMsRUFBVTtBQUM3RCxTQUFPLE1BQU0sS0FBSyxNQUFNLEdBQUcsQ0FBQyxHQUFJLE1BQU0sR0FBRyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxBQUFDLENBQUM7Q0FDM0QiLCJmaWxlIjoiSGh2bURlYnVnZ2VyUHJvY2Vzc0luZm8uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQge0RlYnVnZ2VyUHJvY2Vzc0luZm99IGZyb20gJy4uLy4uL2F0b20nO1xuaW1wb3J0IHtIaHZtRGVidWdnZXJJbnN0YW5jZX0gZnJvbSAnLi9IaHZtRGVidWdnZXJJbnN0YW5jZSc7XG5cbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi8uLi9yZW1vdGUtdXJpJztcblxuZXhwb3J0IGNsYXNzIEhodm1EZWJ1Z2dlclByb2Nlc3NJbmZvIGV4dGVuZHMgRGVidWdnZXJQcm9jZXNzSW5mbyB7XG4gIGNvbnN0cnVjdG9yKHRhcmdldFVyaTogTnVjbGlkZVVyaSkge1xuICAgIHN1cGVyKCdoaHZtJywgdGFyZ2V0VXJpKTtcbiAgfVxuXG4gIGF0dGFjaCgpOiBIaHZtRGVidWdnZXJJbnN0YW5jZSB7XG4gICAgcmV0dXJuIG5ldyBIaHZtRGVidWdnZXJJbnN0YW5jZSh0aGlzKTtcbiAgfVxuXG4gIGxhdW5jaChsYXVuY2hUYXJnZXQ6IHN0cmluZyk6IEhodm1EZWJ1Z2dlckluc3RhbmNlIHtcbiAgICByZXR1cm4gbmV3IEhodm1EZWJ1Z2dlckluc3RhbmNlKHRoaXMsIGxhdW5jaFRhcmdldCk7XG4gIH1cblxuICBjb21wYXJlRGV0YWlscyhvdGhlcjogRGVidWdnZXJQcm9jZXNzSW5mbyk6IG51bWJlciB7XG4gICAgaW52YXJpYW50KG90aGVyIGluc3RhbmNlb2YgSGh2bURlYnVnZ2VyUHJvY2Vzc0luZm8pO1xuICAgIHJldHVybiBjb21wYXJlU3RyaW5nKHRoaXMuX3RhcmdldFVyaSwgb3RoZXIuX3RhcmdldFVyaSk7XG4gIH1cblxuICBkaXNwbGF5U3RyaW5nKCk6IHN0cmluZyB7XG4gICAgY29uc3QgcmVtb3RlVXJpID0gcmVxdWlyZSgnLi4vLi4vLi4vcmVtb3RlLXVyaScpO1xuICAgIHJldHVybiByZW1vdGVVcmkuZ2V0SG9zdG5hbWUodGhpcy5fdGFyZ2V0VXJpKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjb21wYXJlU3RyaW5nKHZhbHVlMTogc3RyaW5nLCB2YWx1ZTI6IHN0cmluZyk6IG51bWJlciB7XG4gIHJldHVybiB2YWx1ZTEgPT09IHZhbHVlMiA/IDAgOiAodmFsdWUxIDwgdmFsdWUyID8gLTEgOiAxKTtcbn1cbiJdfQ==