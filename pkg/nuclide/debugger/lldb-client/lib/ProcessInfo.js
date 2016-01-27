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
    key: 'pid',
    get: function get() {
      return this._targetInfo.pid;
    }
  }]);

  return ProcessInfo;
})(_utils.DebuggerProcessInfo);

exports.ProcessInfo = ProcessInfo;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlByb2Nlc3NJbmZvLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7cUJBbUJrQyxhQUFhOztzQkFDekIsUUFBUTs7OzsrQkFDQSxtQkFBbUI7O0lBRXBDLFdBQVc7WUFBWCxXQUFXOztBQUlYLFdBSkEsV0FBVyxDQUlWLFNBQXFCLEVBQUUsVUFBNEIsRUFBRTswQkFKdEQsV0FBVzs7QUFLcEIsK0JBTFMsV0FBVyw2Q0FLZCxNQUFNLEVBQUU7QUFDZCxRQUFJLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQztBQUM1QixRQUFJLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQztHQUMvQjs7ZUFSVSxXQUFXOztXQVVoQixrQkFBc0M7QUFDMUMsVUFBTSxPQUFPLEdBQUcscUNBQW9CLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQ3ZFLGFBQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUNqQixhQUFPLE9BQU8sQ0FBQztLQUNoQjs7O1dBTWEsd0JBQUMsS0FBMkMsRUFBVTtBQUNsRSwrQkFBVSxLQUFLLFlBQVksV0FBVyxDQUFDLENBQUM7QUFDeEMsYUFBTyxJQUFJLENBQUMsYUFBYSxFQUFFLEtBQUssS0FBSyxDQUFDLGFBQWEsRUFBRSxHQUNoRCxJQUFJLENBQUMsR0FBRyxHQUFHLEtBQUssQ0FBQyxHQUFHLEdBQ3JCLEFBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxHQUFHLEtBQUssQ0FBQyxhQUFhLEVBQUUsR0FBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDN0Q7OztXQUVZLHlCQUFXO0FBQ3RCLGFBQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztLQUNqRTs7O1NBYk0sZUFBVztBQUNoQixhQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDO0tBQzdCOzs7U0FsQlUsV0FBVyIsImZpbGUiOiJQcm9jZXNzSW5mby5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBle1xuICBudWNsaWRlX2RlYnVnZ2VyJERlYnVnZ2VySW5zdGFuY2UsXG4gIG51Y2xpZGVfZGVidWdnZXIkRGVidWdnZXJQcm9jZXNzSW5mbyxcbn0gZnJvbSAnLi4vLi4vaW50ZXJmYWNlcy9zZXJ2aWNlJztcbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi8uLi9yZW1vdGUtdXJpJztcbmltcG9ydCB0eXBlIHtBdHRhY2hUYXJnZXRJbmZvLH1cbiAgICBmcm9tICcuLi8uLi9sbGRiLXNlcnZlci9saWIvRGVidWdnZXJScGNTZXJ2aWNlSW50ZXJmYWNlJztcblxuaW1wb3J0IHtEZWJ1Z2dlclByb2Nlc3NJbmZvfSBmcm9tICcuLi8uLi91dGlscyc7XG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQge0RlYnVnZ2VyUHJvY2Vzc30gZnJvbSAnLi9EZWJ1Z2dlclByb2Nlc3MnO1xuXG5leHBvcnQgY2xhc3MgUHJvY2Vzc0luZm8gZXh0ZW5kcyBEZWJ1Z2dlclByb2Nlc3NJbmZvIHtcbiAgX3RhcmdldFVyaTogTnVjbGlkZVVyaTtcbiAgX3RhcmdldEluZm86IEF0dGFjaFRhcmdldEluZm87XG5cbiAgY29uc3RydWN0b3IodGFyZ2V0VXJpOiBOdWNsaWRlVXJpLCB0YXJnZXRJbmZvOiBBdHRhY2hUYXJnZXRJbmZvKSB7XG4gICAgc3VwZXIoJ2xsZGInKTtcbiAgICB0aGlzLl90YXJnZXRVcmkgPSB0YXJnZXRVcmk7XG4gICAgdGhpcy5fdGFyZ2V0SW5mbyA9IHRhcmdldEluZm87XG4gIH1cblxuICBhdHRhY2goKTogbnVjbGlkZV9kZWJ1Z2dlciREZWJ1Z2dlckluc3RhbmNlIHtcbiAgICBjb25zdCBwcm9jZXNzID0gbmV3IERlYnVnZ2VyUHJvY2Vzcyh0aGlzLl90YXJnZXRVcmksIHRoaXMuX3RhcmdldEluZm8pO1xuICAgIHByb2Nlc3MuYXR0YWNoKCk7XG4gICAgcmV0dXJuIHByb2Nlc3M7XG4gIH1cblxuICBnZXQgcGlkKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX3RhcmdldEluZm8ucGlkO1xuICB9XG5cbiAgY29tcGFyZURldGFpbHMob3RoZXI6IG51Y2xpZGVfZGVidWdnZXIkRGVidWdnZXJQcm9jZXNzSW5mbyk6IG51bWJlciB7XG4gICAgaW52YXJpYW50KG90aGVyIGluc3RhbmNlb2YgUHJvY2Vzc0luZm8pO1xuICAgIHJldHVybiB0aGlzLmRpc3BsYXlTdHJpbmcoKSA9PT0gb3RoZXIuZGlzcGxheVN0cmluZygpXG4gICAgICA/ICh0aGlzLnBpZCAtIG90aGVyLnBpZClcbiAgICAgIDogKHRoaXMuZGlzcGxheVN0cmluZygpIDwgb3RoZXIuZGlzcGxheVN0cmluZygpKSA/IC0xIDogMTtcbiAgfVxuXG4gIGRpc3BsYXlTdHJpbmcoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fdGFyZ2V0SW5mby5uYW1lICsgJygnICsgdGhpcy5fdGFyZ2V0SW5mby5waWQgKyAnKSc7XG4gIH1cbn1cbiJdfQ==