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

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _utils = require('../../utils');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _DebuggerProcess = require('./DebuggerProcess');

var ProcessInfo = (function (_DebuggerProcessInfo) {
  _inherits(ProcessInfo, _DebuggerProcessInfo);

  function ProcessInfo(targetUri, targetInfo) {
    _classCallCheck(this, ProcessInfo);

    _get(Object.getPrototypeOf(ProcessInfo.prototype), 'constructor', this).call(this, 'lldb');
    this._targetUri = targetUri;
    this._targetInfo = targetInfo;
  }

  _createClass(ProcessInfo, [{
    key: 'attach',
    value: function attach() {
      var process = new _DebuggerProcess.DebuggerProcess(this._targetUri, this._targetInfo);
      process.attach();
      return process;
    }
  }, {
    key: 'compareDetails',
    value: function compareDetails(other) {
      (0, _assert2['default'])(other instanceof ProcessInfo);
      return this.displayString() === other.displayString() ? this.pid - other.pid : this.displayString() < other.displayString() ? -1 : 1;
    }
  }, {
    key: 'displayString',
    value: function displayString() {
      return this._targetInfo.name + '(' + this._targetInfo.pid + ')';
    }
  }, {
    key: 'toString',
    value: function toString() {
      return this.displayString();
    }
  }, {
    key: 'pid',
    get: function get() {
      return this._targetInfo.pid;
    }
  }]);

  return ProcessInfo;
})(_utils.DebuggerProcessInfo);

exports.ProcessInfo = ProcessInfo;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlByb2Nlc3NJbmZvLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7cUJBbUJrQyxhQUFhOztzQkFDekIsUUFBUTs7OzsrQkFDQSxtQkFBbUI7O0lBRXBDLFdBQVc7WUFBWCxXQUFXOztBQUlYLFdBSkEsV0FBVyxDQUlWLFNBQXFCLEVBQUUsVUFBNEIsRUFBRTswQkFKdEQsV0FBVzs7QUFLcEIsK0JBTFMsV0FBVyw2Q0FLZCxNQUFNLEVBQUU7QUFDZCxRQUFJLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQztBQUM1QixRQUFJLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQztHQUMvQjs7ZUFSVSxXQUFXOztXQVVoQixrQkFBc0M7QUFDMUMsVUFBTSxPQUFPLEdBQUcscUNBQW9CLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQ3ZFLGFBQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUNqQixhQUFPLE9BQU8sQ0FBQztLQUNoQjs7O1dBTWEsd0JBQUMsS0FBMkMsRUFBVTtBQUNsRSwrQkFBVSxLQUFLLFlBQVksV0FBVyxDQUFDLENBQUM7QUFDeEMsYUFBTyxJQUFJLENBQUMsYUFBYSxFQUFFLEtBQUssS0FBSyxDQUFDLGFBQWEsRUFBRSxHQUNoRCxJQUFJLENBQUMsR0FBRyxHQUFHLEtBQUssQ0FBQyxHQUFHLEdBQ3JCLEFBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxHQUFHLEtBQUssQ0FBQyxhQUFhLEVBQUUsR0FBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDN0Q7OztXQUVZLHlCQUFXO0FBQ3RCLGFBQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztLQUNqRTs7O1dBRU8sb0JBQVc7QUFDakIsYUFBTyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7S0FDN0I7OztTQWpCTSxlQUFXO0FBQ2hCLGFBQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUM7S0FDN0I7OztTQWxCVSxXQUFXIiwiZmlsZSI6IlByb2Nlc3NJbmZvLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGV7XG4gIG51Y2xpZGVfZGVidWdnZXIkRGVidWdnZXJJbnN0YW5jZSxcbiAgbnVjbGlkZV9kZWJ1Z2dlciREZWJ1Z2dlclByb2Nlc3NJbmZvLFxufSBmcm9tICcuLi8uLi9pbnRlcmZhY2VzL3NlcnZpY2UnO1xuaW1wb3J0IHR5cGUge051Y2xpZGVVcml9IGZyb20gJy4uLy4uLy4uL3JlbW90ZS11cmknO1xuaW1wb3J0IHR5cGUge0F0dGFjaFRhcmdldEluZm8sfVxuICAgIGZyb20gJy4uLy4uL2xsZGItc2VydmVyL2xpYi9EZWJ1Z2dlclJwY1NlcnZpY2VJbnRlcmZhY2UnO1xuXG5pbXBvcnQge0RlYnVnZ2VyUHJvY2Vzc0luZm99IGZyb20gJy4uLy4uL3V0aWxzJztcbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCB7RGVidWdnZXJQcm9jZXNzfSBmcm9tICcuL0RlYnVnZ2VyUHJvY2Vzcyc7XG5cbmV4cG9ydCBjbGFzcyBQcm9jZXNzSW5mbyBleHRlbmRzIERlYnVnZ2VyUHJvY2Vzc0luZm8ge1xuICBfdGFyZ2V0VXJpOiBOdWNsaWRlVXJpO1xuICBfdGFyZ2V0SW5mbzogQXR0YWNoVGFyZ2V0SW5mbztcblxuICBjb25zdHJ1Y3Rvcih0YXJnZXRVcmk6IE51Y2xpZGVVcmksIHRhcmdldEluZm86IEF0dGFjaFRhcmdldEluZm8pIHtcbiAgICBzdXBlcignbGxkYicpO1xuICAgIHRoaXMuX3RhcmdldFVyaSA9IHRhcmdldFVyaTtcbiAgICB0aGlzLl90YXJnZXRJbmZvID0gdGFyZ2V0SW5mbztcbiAgfVxuXG4gIGF0dGFjaCgpOiBudWNsaWRlX2RlYnVnZ2VyJERlYnVnZ2VySW5zdGFuY2Uge1xuICAgIGNvbnN0IHByb2Nlc3MgPSBuZXcgRGVidWdnZXJQcm9jZXNzKHRoaXMuX3RhcmdldFVyaSwgdGhpcy5fdGFyZ2V0SW5mbyk7XG4gICAgcHJvY2Vzcy5hdHRhY2goKTtcbiAgICByZXR1cm4gcHJvY2VzcztcbiAgfVxuXG4gIGdldCBwaWQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fdGFyZ2V0SW5mby5waWQ7XG4gIH1cblxuICBjb21wYXJlRGV0YWlscyhvdGhlcjogbnVjbGlkZV9kZWJ1Z2dlciREZWJ1Z2dlclByb2Nlc3NJbmZvKTogbnVtYmVyIHtcbiAgICBpbnZhcmlhbnQob3RoZXIgaW5zdGFuY2VvZiBQcm9jZXNzSW5mbyk7XG4gICAgcmV0dXJuIHRoaXMuZGlzcGxheVN0cmluZygpID09PSBvdGhlci5kaXNwbGF5U3RyaW5nKClcbiAgICAgID8gKHRoaXMucGlkIC0gb3RoZXIucGlkKVxuICAgICAgOiAodGhpcy5kaXNwbGF5U3RyaW5nKCkgPCBvdGhlci5kaXNwbGF5U3RyaW5nKCkpID8gLTEgOiAxO1xuICB9XG5cbiAgZGlzcGxheVN0cmluZygpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl90YXJnZXRJbmZvLm5hbWUgKyAnKCcgKyB0aGlzLl90YXJnZXRJbmZvLnBpZCArICcpJztcbiAgfVxuXG4gIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuZGlzcGxheVN0cmluZygpO1xuICB9XG59XG4iXX0=