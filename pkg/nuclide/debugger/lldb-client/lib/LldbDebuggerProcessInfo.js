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

var _atom = require('../../atom');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _LldbDebuggerInstance = require('./LldbDebuggerInstance');

var LldbDebuggerProcessInfo = (function (_DebuggerProcessInfo) {
  _inherits(LldbDebuggerProcessInfo, _DebuggerProcessInfo);

  function LldbDebuggerProcessInfo(targetUri, targetInfo) {
    _classCallCheck(this, LldbDebuggerProcessInfo);

    _get(Object.getPrototypeOf(LldbDebuggerProcessInfo.prototype), 'constructor', this).call(this, 'lldb', targetUri);
    this._targetInfo = targetInfo;
  }

  _createClass(LldbDebuggerProcessInfo, [{
    key: 'attach',
    value: function attach() {
      var process = new _LldbDebuggerInstance.LldbDebuggerInstance(this, this._targetInfo);
      process.attach();
      return process;
    }
  }, {
    key: 'compareDetails',
    value: function compareDetails(other) {
      (0, _assert2['default'])(other instanceof LldbDebuggerProcessInfo);
      return this.displayString() === other.displayString() ? this.pid - other.pid : this.displayString() < other.displayString() ? -1 : 1;
    }
  }, {
    key: 'displayString',
    value: function displayString() {
      return this._targetInfo.name + '(' + this._targetInfo.pid + ')';
    }
  }, {
    key: 'pid',
    get: function get() {
      return this._targetInfo.pid;
    }
  }]);

  return LldbDebuggerProcessInfo;
})(_atom.DebuggerProcessInfo);

exports.LldbDebuggerProcessInfo = LldbDebuggerProcessInfo;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkxsZGJEZWJ1Z2dlclByb2Nlc3NJbmZvLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7b0JBZWtDLFlBQVk7O3NCQUN4QixRQUFROzs7O29DQUNLLHdCQUF3Qjs7SUFFOUMsdUJBQXVCO1lBQXZCLHVCQUF1Qjs7QUFHdkIsV0FIQSx1QkFBdUIsQ0FHdEIsU0FBcUIsRUFBRSxVQUE0QixFQUFFOzBCQUh0RCx1QkFBdUI7O0FBSWhDLCtCQUpTLHVCQUF1Qiw2Q0FJMUIsTUFBTSxFQUFFLFNBQVMsRUFBRTtBQUN6QixRQUFJLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQztHQUMvQjs7ZUFOVSx1QkFBdUI7O1dBUTVCLGtCQUFxQjtBQUN6QixVQUFNLE9BQU8sR0FBRywrQ0FBeUIsSUFBSSxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUNqRSxhQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDakIsYUFBTyxPQUFPLENBQUM7S0FDaEI7OztXQU1hLHdCQUFDLEtBQTBCLEVBQVU7QUFDakQsK0JBQVUsS0FBSyxZQUFZLHVCQUF1QixDQUFDLENBQUM7QUFDcEQsYUFBTyxJQUFJLENBQUMsYUFBYSxFQUFFLEtBQUssS0FBSyxDQUFDLGFBQWEsRUFBRSxHQUNoRCxJQUFJLENBQUMsR0FBRyxHQUFHLEtBQUssQ0FBQyxHQUFHLEdBQ3JCLEFBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxHQUFHLEtBQUssQ0FBQyxhQUFhLEVBQUUsR0FBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDN0Q7OztXQUVZLHlCQUFXO0FBQ3RCLGFBQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztLQUNqRTs7O1NBYk0sZUFBVztBQUNoQixhQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDO0tBQzdCOzs7U0FoQlUsdUJBQXVCIiwiZmlsZSI6IkxsZGJEZWJ1Z2dlclByb2Nlc3NJbmZvLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0RlYnVnZ2VySW5zdGFuY2V9IGZyb20gJy4uLy4uL2F0b20nO1xuaW1wb3J0IHR5cGUge051Y2xpZGVVcml9IGZyb20gJy4uLy4uLy4uL3JlbW90ZS11cmknO1xuaW1wb3J0IHR5cGUge0F0dGFjaFRhcmdldEluZm99IGZyb20gJy4uLy4uL2xsZGItc2VydmVyL2xpYi9EZWJ1Z2dlclJwY1NlcnZpY2VJbnRlcmZhY2UnO1xuXG5pbXBvcnQge0RlYnVnZ2VyUHJvY2Vzc0luZm99IGZyb20gJy4uLy4uL2F0b20nO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHtMbGRiRGVidWdnZXJJbnN0YW5jZX0gZnJvbSAnLi9MbGRiRGVidWdnZXJJbnN0YW5jZSc7XG5cbmV4cG9ydCBjbGFzcyBMbGRiRGVidWdnZXJQcm9jZXNzSW5mbyBleHRlbmRzIERlYnVnZ2VyUHJvY2Vzc0luZm8ge1xuICBfdGFyZ2V0SW5mbzogQXR0YWNoVGFyZ2V0SW5mbztcblxuICBjb25zdHJ1Y3Rvcih0YXJnZXRVcmk6IE51Y2xpZGVVcmksIHRhcmdldEluZm86IEF0dGFjaFRhcmdldEluZm8pIHtcbiAgICBzdXBlcignbGxkYicsIHRhcmdldFVyaSk7XG4gICAgdGhpcy5fdGFyZ2V0SW5mbyA9IHRhcmdldEluZm87XG4gIH1cblxuICBhdHRhY2goKTogRGVidWdnZXJJbnN0YW5jZSB7XG4gICAgY29uc3QgcHJvY2VzcyA9IG5ldyBMbGRiRGVidWdnZXJJbnN0YW5jZSh0aGlzLCB0aGlzLl90YXJnZXRJbmZvKTtcbiAgICBwcm9jZXNzLmF0dGFjaCgpO1xuICAgIHJldHVybiBwcm9jZXNzO1xuICB9XG5cbiAgZ2V0IHBpZCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl90YXJnZXRJbmZvLnBpZDtcbiAgfVxuXG4gIGNvbXBhcmVEZXRhaWxzKG90aGVyOiBEZWJ1Z2dlclByb2Nlc3NJbmZvKTogbnVtYmVyIHtcbiAgICBpbnZhcmlhbnQob3RoZXIgaW5zdGFuY2VvZiBMbGRiRGVidWdnZXJQcm9jZXNzSW5mbyk7XG4gICAgcmV0dXJuIHRoaXMuZGlzcGxheVN0cmluZygpID09PSBvdGhlci5kaXNwbGF5U3RyaW5nKClcbiAgICAgID8gKHRoaXMucGlkIC0gb3RoZXIucGlkKVxuICAgICAgOiAodGhpcy5kaXNwbGF5U3RyaW5nKCkgPCBvdGhlci5kaXNwbGF5U3RyaW5nKCkpID8gLTEgOiAxO1xuICB9XG5cbiAgZGlzcGxheVN0cmluZygpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl90YXJnZXRJbmZvLm5hbWUgKyAnKCcgKyB0aGlzLl90YXJnZXRJbmZvLnBpZCArICcpJztcbiAgfVxufVxuIl19