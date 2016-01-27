var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _require = require('../../utils');

var DebuggerProcessInfo = _require.DebuggerProcessInfo;

var ProcessInfo = (function (_DebuggerProcessInfo) {
  _inherits(ProcessInfo, _DebuggerProcessInfo);

  function ProcessInfo(remoteDirectoryPath) {
    _classCallCheck(this, ProcessInfo);

    _get(Object.getPrototypeOf(ProcessInfo.prototype), 'constructor', this).call(this, 'hhvm');

    this._remoteDirectoryPath = remoteDirectoryPath;
  }

  _createClass(ProcessInfo, [{
    key: 'attach',
    value: function attach() {
      var DebuggerProcess = require('./DebuggerProcess');
      return new DebuggerProcess(this._remoteDirectoryPath);
    }
  }, {
    key: 'launch',
    value: function launch(launchTarget) {
      var DebuggerProcess = require('./DebuggerProcess');
      return new DebuggerProcess(this._remoteDirectoryPath, launchTarget);
    }
  }, {
    key: 'compareDetails',
    value: function compareDetails(other) {
      (0, _assert2['default'])(other instanceof ProcessInfo);
      return compareString(this._remoteDirectoryPath, other._remoteDirectoryPath);
    }
  }, {
    key: 'displayString',
    value: function displayString() {
      var remoteUri = require('../../../remote-uri');
      return remoteUri.getHostname(this._remoteDirectoryPath);
    }
  }]);

  return ProcessInfo;
})(DebuggerProcessInfo);

function compareString(value1, value2) {
  return value1 === value2 ? 0 : value1 < value2 ? -1 : 1;
}

module.exports = ProcessInfo;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlByb2Nlc3NJbmZvLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OztzQkFnQnNCLFFBQVE7Ozs7ZUFFQSxPQUFPLENBQUMsYUFBYSxDQUFDOztJQUE3QyxtQkFBbUIsWUFBbkIsbUJBQW1COztJQUNwQixXQUFXO1lBQVgsV0FBVzs7QUFJSixXQUpQLFdBQVcsQ0FJSCxtQkFBMkIsRUFBRTswQkFKckMsV0FBVzs7QUFLYiwrQkFMRSxXQUFXLDZDQUtQLE1BQU0sRUFBRTs7QUFFZCxRQUFJLENBQUMsb0JBQW9CLEdBQUcsbUJBQW1CLENBQUM7R0FDakQ7O2VBUkcsV0FBVzs7V0FVVCxrQkFBc0M7QUFDMUMsVUFBTSxlQUFlLEdBQUcsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUM7QUFDckQsYUFBTyxJQUFJLGVBQWUsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQztLQUN2RDs7O1dBRUssZ0JBQUMsWUFBb0IsRUFBRTtBQUMzQixVQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQztBQUNyRCxhQUFPLElBQUksZUFBZSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxZQUFZLENBQUMsQ0FBQztLQUNyRTs7O1dBRWEsd0JBQUMsS0FBMkMsRUFBVTtBQUNsRSwrQkFBVSxLQUFLLFlBQVksV0FBVyxDQUFDLENBQUM7QUFDeEMsYUFBTyxhQUFhLENBQUMsSUFBSSxDQUFDLG9CQUFvQixFQUFFLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0tBQzdFOzs7V0FFWSx5QkFBVztBQUN0QixVQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMscUJBQXFCLENBQUMsQ0FBQztBQUNqRCxhQUFPLFNBQVMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUM7S0FDekQ7OztTQTVCRyxXQUFXO0dBQVMsbUJBQW1COztBQStCN0MsU0FBUyxhQUFhLENBQUMsTUFBYyxFQUFFLE1BQWMsRUFBVTtBQUM3RCxTQUFPLE1BQU0sS0FBSyxNQUFNLEdBQUcsQ0FBQyxHQUFJLE1BQU0sR0FBRyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxBQUFDLENBQUM7Q0FDM0Q7O0FBRUQsTUFBTSxDQUFDLE9BQU8sR0FBRyxXQUFXLENBQUMiLCJmaWxlIjoiUHJvY2Vzc0luZm8uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZXtcbiAgbnVjbGlkZV9kZWJ1Z2dlciREZWJ1Z2dlckluc3RhbmNlLFxuICBudWNsaWRlX2RlYnVnZ2VyJERlYnVnZ2VyUHJvY2Vzc0luZm8sXG59IGZyb20gJy4uLy4uL2ludGVyZmFjZXMvc2VydmljZSc7XG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcblxuY29uc3Qge0RlYnVnZ2VyUHJvY2Vzc0luZm99ID0gcmVxdWlyZSgnLi4vLi4vdXRpbHMnKTtcbmNsYXNzIFByb2Nlc3NJbmZvIGV4dGVuZHMgRGVidWdnZXJQcm9jZXNzSW5mb1xue1xuICBfcmVtb3RlRGlyZWN0b3J5UGF0aDogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKHJlbW90ZURpcmVjdG9yeVBhdGg6IHN0cmluZykge1xuICAgIHN1cGVyKCdoaHZtJyk7XG5cbiAgICB0aGlzLl9yZW1vdGVEaXJlY3RvcnlQYXRoID0gcmVtb3RlRGlyZWN0b3J5UGF0aDtcbiAgfVxuXG4gIGF0dGFjaCgpOiBudWNsaWRlX2RlYnVnZ2VyJERlYnVnZ2VySW5zdGFuY2Uge1xuICAgIGNvbnN0IERlYnVnZ2VyUHJvY2VzcyA9IHJlcXVpcmUoJy4vRGVidWdnZXJQcm9jZXNzJyk7XG4gICAgcmV0dXJuIG5ldyBEZWJ1Z2dlclByb2Nlc3ModGhpcy5fcmVtb3RlRGlyZWN0b3J5UGF0aCk7XG4gIH1cblxuICBsYXVuY2gobGF1bmNoVGFyZ2V0OiBzdHJpbmcpIHtcbiAgICBjb25zdCBEZWJ1Z2dlclByb2Nlc3MgPSByZXF1aXJlKCcuL0RlYnVnZ2VyUHJvY2VzcycpO1xuICAgIHJldHVybiBuZXcgRGVidWdnZXJQcm9jZXNzKHRoaXMuX3JlbW90ZURpcmVjdG9yeVBhdGgsIGxhdW5jaFRhcmdldCk7XG4gIH1cblxuICBjb21wYXJlRGV0YWlscyhvdGhlcjogbnVjbGlkZV9kZWJ1Z2dlciREZWJ1Z2dlclByb2Nlc3NJbmZvKTogbnVtYmVyIHtcbiAgICBpbnZhcmlhbnQob3RoZXIgaW5zdGFuY2VvZiBQcm9jZXNzSW5mbyk7XG4gICAgcmV0dXJuIGNvbXBhcmVTdHJpbmcodGhpcy5fcmVtb3RlRGlyZWN0b3J5UGF0aCwgb3RoZXIuX3JlbW90ZURpcmVjdG9yeVBhdGgpO1xuICB9XG5cbiAgZGlzcGxheVN0cmluZygpOiBzdHJpbmcge1xuICAgIGNvbnN0IHJlbW90ZVVyaSA9IHJlcXVpcmUoJy4uLy4uLy4uL3JlbW90ZS11cmknKTtcbiAgICByZXR1cm4gcmVtb3RlVXJpLmdldEhvc3RuYW1lKHRoaXMuX3JlbW90ZURpcmVjdG9yeVBhdGgpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNvbXBhcmVTdHJpbmcodmFsdWUxOiBzdHJpbmcsIHZhbHVlMjogc3RyaW5nKTogbnVtYmVyIHtcbiAgcmV0dXJuIHZhbHVlMSA9PT0gdmFsdWUyID8gMCA6ICh2YWx1ZTEgPCB2YWx1ZTIgPyAtMSA6IDEpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFByb2Nlc3NJbmZvO1xuIl19