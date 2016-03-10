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

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _debuggerAtom = require('../../../debugger/atom');

var _debuggerNodeLibService = require('../../../debugger/node/lib/Service');

var ReactNativeProcessInfo = (function (_DebuggerProcessInfo) {
  _inherits(ReactNativeProcessInfo, _DebuggerProcessInfo);

  function ReactNativeProcessInfo(options) {
    var _this = this;

    _classCallCheck(this, ReactNativeProcessInfo);

    _get(Object.getPrototypeOf(ReactNativeProcessInfo.prototype), 'constructor', this).call(this, 'react-native', options.targetUri);
    this._sessionCount = 0;
    this._onAllSessionsEnded = options.onAllSessionsEnded;
    this._pidPromise = new Promise(function (resolve) {
      _this.setPid = function (pid) {
        _this._pid = pid;
        resolve(pid);
      };
    });
    if (options.pid != null) {
      this.setPid(options.pid);
    }
  }

  _createClass(ReactNativeProcessInfo, [{
    key: 'debug',
    value: _asyncToGenerator(function* () {
      this._sessionCount += 1;
      var pid = yield this._pidPromise;

      // Enable debugging in the process.
      // See <https://nodejs.org/api/debugger.html#debugger_advanced_usage>
      process.kill(pid, 'SIGUSR1');

      // This is the port that the V8 debugger usually listens on.
      // TODO(matthewwithanm): Provide a way to override this in the UI.
      var session = new _debuggerNodeLibService.NodeDebuggerInstance(this, 5858);
      session.onSessionEnd(this._handleSessionEnd.bind(this));
      return session;
    })
  }, {
    key: 'compareDetails',
    value: function compareDetails(other) {
      return 1;
    }
  }, {
    key: 'displayString',
    value: function displayString() {
      return 'React Native';
    }
  }, {
    key: 'getPid',
    value: function getPid() {
      return this._pid;
    }
  }, {
    key: '_handleSessionEnd',
    value: function _handleSessionEnd() {
      this._sessionCount -= 1;
      if (this._sessionCount === 0) {
        this._onAllSessionsEnded.call(null);
      }
    }
  }]);

  return ReactNativeProcessInfo;
})(_debuggerAtom.DebuggerProcessInfo);

exports.ReactNativeProcessInfo = ReactNativeProcessInfo;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlJlYWN0TmF0aXZlUHJvY2Vzc0luZm8uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs0QkFha0Msd0JBQXdCOztzQ0FDdkIsb0NBQW9DOztJQVExRCxzQkFBc0I7WUFBdEIsc0JBQXNCOztBQVF0QixXQVJBLHNCQUFzQixDQVFyQixPQUFnQixFQUFFOzs7MEJBUm5CLHNCQUFzQjs7QUFTL0IsK0JBVFMsc0JBQXNCLDZDQVN6QixjQUFjLEVBQUUsT0FBTyxDQUFDLFNBQVMsRUFBRTtBQUN6QyxRQUFJLENBQUMsYUFBYSxHQUFHLENBQUMsQ0FBQztBQUN2QixRQUFJLENBQUMsbUJBQW1CLEdBQUcsT0FBTyxDQUFDLGtCQUFrQixDQUFDO0FBQ3RELFFBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxPQUFPLENBQUMsVUFBQSxPQUFPLEVBQUk7QUFDeEMsWUFBSyxNQUFNLEdBQUcsVUFBQSxHQUFHLEVBQUk7QUFDbkIsY0FBSyxJQUFJLEdBQUcsR0FBRyxDQUFDO0FBQ2hCLGVBQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztPQUNkLENBQUM7S0FDSCxDQUFDLENBQUM7QUFDSCxRQUFJLE9BQU8sQ0FBQyxHQUFHLElBQUksSUFBSSxFQUFFO0FBQ3ZCLFVBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQzFCO0dBQ0Y7O2VBckJVLHNCQUFzQjs7NkJBdUJ0QixhQUFrQztBQUMzQyxVQUFJLENBQUMsYUFBYSxJQUFJLENBQUMsQ0FBQztBQUN4QixVQUFNLEdBQUcsR0FBRyxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUM7Ozs7QUFJbkMsYUFBTyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsU0FBUyxDQUFDLENBQUM7Ozs7QUFJN0IsVUFBTSxPQUFPLEdBQUcsaURBQXlCLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNyRCxhQUFPLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUN4RCxhQUFPLE9BQU8sQ0FBQztLQUNoQjs7O1dBRWEsd0JBQUMsS0FBMEIsRUFBVTtBQUNqRCxhQUFPLENBQUMsQ0FBQztLQUNWOzs7V0FFWSx5QkFBVztBQUN0QixhQUFPLGNBQWMsQ0FBQztLQUN2Qjs7O1dBRUssa0JBQVk7QUFDaEIsYUFBTyxJQUFJLENBQUMsSUFBSSxDQUFDO0tBQ2xCOzs7V0FFZ0IsNkJBQVM7QUFDeEIsVUFBSSxDQUFDLGFBQWEsSUFBSSxDQUFDLENBQUM7QUFDeEIsVUFBSSxJQUFJLENBQUMsYUFBYSxLQUFLLENBQUMsRUFBRTtBQUM1QixZQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO09BQ3JDO0tBQ0Y7OztTQXZEVSxzQkFBc0IiLCJmaWxlIjoiUmVhY3ROYXRpdmVQcm9jZXNzSW5mby5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi8uLi9yZW1vdGUtdXJpJztcblxuaW1wb3J0IHtEZWJ1Z2dlclByb2Nlc3NJbmZvfSBmcm9tICcuLi8uLi8uLi9kZWJ1Z2dlci9hdG9tJztcbmltcG9ydCB7Tm9kZURlYnVnZ2VySW5zdGFuY2V9IGZyb20gJy4uLy4uLy4uL2RlYnVnZ2VyL25vZGUvbGliL1NlcnZpY2UnO1xuXG50eXBlIE9wdGlvbnMgPSB7XG4gIHRhcmdldFVyaTogTnVjbGlkZVVyaTtcbiAgcGlkOiA/bnVtYmVyO1xuICBvbkFsbFNlc3Npb25zRW5kZWQ6ICgpID0+IHZvaWQ7XG59O1xuXG5leHBvcnQgY2xhc3MgUmVhY3ROYXRpdmVQcm9jZXNzSW5mbyBleHRlbmRzIERlYnVnZ2VyUHJvY2Vzc0luZm8ge1xuXG4gIF9vbkFsbFNlc3Npb25zRW5kZWQ6ICgpID0+IHZvaWQ7XG4gIF9waWQ6ID9udW1iZXI7XG4gIF9waWRQcm9taXNlOiBQcm9taXNlPG51bWJlcj47XG4gIF9zZXNzaW9uQ291bnQ6IG51bWJlcjtcbiAgc2V0UGlkOiAocGlkOiBudW1iZXIpID0+IHZvaWQ7XG5cbiAgY29uc3RydWN0b3Iob3B0aW9uczogT3B0aW9ucykge1xuICAgIHN1cGVyKCdyZWFjdC1uYXRpdmUnLCBvcHRpb25zLnRhcmdldFVyaSk7XG4gICAgdGhpcy5fc2Vzc2lvbkNvdW50ID0gMDtcbiAgICB0aGlzLl9vbkFsbFNlc3Npb25zRW5kZWQgPSBvcHRpb25zLm9uQWxsU2Vzc2lvbnNFbmRlZDtcbiAgICB0aGlzLl9waWRQcm9taXNlID0gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICB0aGlzLnNldFBpZCA9IHBpZCA9PiB7XG4gICAgICAgIHRoaXMuX3BpZCA9IHBpZDtcbiAgICAgICAgcmVzb2x2ZShwaWQpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgICBpZiAob3B0aW9ucy5waWQgIT0gbnVsbCkge1xuICAgICAgdGhpcy5zZXRQaWQob3B0aW9ucy5waWQpO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGRlYnVnKCk6IFByb21pc2U8Tm9kZURlYnVnZ2VySW5zdGFuY2U+IHtcbiAgICB0aGlzLl9zZXNzaW9uQ291bnQgKz0gMTtcbiAgICBjb25zdCBwaWQgPSBhd2FpdCB0aGlzLl9waWRQcm9taXNlO1xuXG4gICAgLy8gRW5hYmxlIGRlYnVnZ2luZyBpbiB0aGUgcHJvY2Vzcy5cbiAgICAvLyBTZWUgPGh0dHBzOi8vbm9kZWpzLm9yZy9hcGkvZGVidWdnZXIuaHRtbCNkZWJ1Z2dlcl9hZHZhbmNlZF91c2FnZT5cbiAgICBwcm9jZXNzLmtpbGwocGlkLCAnU0lHVVNSMScpO1xuXG4gICAgLy8gVGhpcyBpcyB0aGUgcG9ydCB0aGF0IHRoZSBWOCBkZWJ1Z2dlciB1c3VhbGx5IGxpc3RlbnMgb24uXG4gICAgLy8gVE9ETyhtYXR0aGV3d2l0aGFubSk6IFByb3ZpZGUgYSB3YXkgdG8gb3ZlcnJpZGUgdGhpcyBpbiB0aGUgVUkuXG4gICAgY29uc3Qgc2Vzc2lvbiA9IG5ldyBOb2RlRGVidWdnZXJJbnN0YW5jZSh0aGlzLCA1ODU4KTtcbiAgICBzZXNzaW9uLm9uU2Vzc2lvbkVuZCh0aGlzLl9oYW5kbGVTZXNzaW9uRW5kLmJpbmQodGhpcykpO1xuICAgIHJldHVybiBzZXNzaW9uO1xuICB9XG5cbiAgY29tcGFyZURldGFpbHMob3RoZXI6IERlYnVnZ2VyUHJvY2Vzc0luZm8pOiBudW1iZXIge1xuICAgIHJldHVybiAxO1xuICB9XG5cbiAgZGlzcGxheVN0cmluZygpOiBzdHJpbmcge1xuICAgIHJldHVybiAnUmVhY3QgTmF0aXZlJztcbiAgfVxuXG4gIGdldFBpZCgpOiA/bnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fcGlkO1xuICB9XG5cbiAgX2hhbmRsZVNlc3Npb25FbmQoKTogdm9pZCB7XG4gICAgdGhpcy5fc2Vzc2lvbkNvdW50IC09IDE7XG4gICAgaWYgKHRoaXMuX3Nlc3Npb25Db3VudCA9PT0gMCkge1xuICAgICAgdGhpcy5fb25BbGxTZXNzaW9uc0VuZGVkLmNhbGwobnVsbCk7XG4gICAgfVxuICB9XG5cbn1cbiJdfQ==