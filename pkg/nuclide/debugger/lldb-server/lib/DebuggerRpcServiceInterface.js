Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var getAttachTargetInfoList = _asyncToGenerator(function* () {
  throw new Error('Not implemented');
});

exports.getAttachTargetInfoList = getAttachTargetInfoList;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _rx = require('rx');

var DebuggerConnection = (function () {
  function DebuggerConnection() {
    _classCallCheck(this, DebuggerConnection);
  }

  _createClass(DebuggerConnection, [{
    key: 'getServerMessageObservable',
    value: function getServerMessageObservable() {
      throw new Error('Not implemented');
    }
  }, {
    key: 'sendCommand',
    value: _asyncToGenerator(function* (message) {
      throw new Error('Not implemented');
    })

    // $FlowFixMe
  }, {
    key: 'dispose',
    value: _asyncToGenerator(function* () {
      throw new Error('Not implemented');
    })
  }]);

  return DebuggerConnection;
})();

exports.DebuggerConnection = DebuggerConnection;

var DebuggerRpcService = (function () {
  function DebuggerRpcService() {
    _classCallCheck(this, DebuggerRpcService);
  }

  _createClass(DebuggerRpcService, [{
    key: 'attach',
    value: _asyncToGenerator(function* (pid) {
      throw new Error('Not implemented');
    })
  }, {
    key: 'launch',
    value: _asyncToGenerator(function* (launchInfo) {
      throw new Error('Not implemented');
    })
  }, {
    key: 'dispose',
    value: _asyncToGenerator(function* () {
      throw new Error('Not implemented');
    })
  }]);

  return DebuggerRpcService;
})();

exports.DebuggerRpcService = DebuggerRpcService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRlYnVnZ2VyUnBjU2VydmljZUludGVyZmFjZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7SUF5QnNCLHVCQUF1QixxQkFBdEMsYUFBMkU7QUFDaEYsUUFBTSxJQUFJLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0NBQ3BDOzs7Ozs7Ozs7Ozs7Ozs7O2tCQWhCd0IsSUFBSTs7SUFrQmhCLGtCQUFrQjtXQUFsQixrQkFBa0I7MEJBQWxCLGtCQUFrQjs7O2VBQWxCLGtCQUFrQjs7V0FDSCxzQ0FBdUI7QUFDL0MsWUFBTSxJQUFJLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0tBQ3BDOzs7NkJBQ2dCLFdBQUMsT0FBZSxFQUFpQjtBQUNoRCxZQUFNLElBQUksS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUM7S0FDcEM7Ozs7OzZCQUVZLGFBQWtCO0FBQzdCLFlBQU0sSUFBSSxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQztLQUNwQzs7O1NBVlUsa0JBQWtCOzs7OztJQWFsQixrQkFBa0I7V0FBbEIsa0JBQWtCOzBCQUFsQixrQkFBa0I7OztlQUFsQixrQkFBa0I7OzZCQUNqQixXQUFDLEdBQVcsRUFBK0I7QUFDckQsWUFBTSxJQUFJLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0tBQ3BDOzs7NkJBQ1csV0FBQyxVQUE0QixFQUErQjtBQUN0RSxZQUFNLElBQUksS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUM7S0FDcEM7Ozs2QkFDWSxhQUFrQjtBQUM3QixZQUFNLElBQUksS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUM7S0FDcEM7OztTQVRVLGtCQUFrQiIsImZpbGUiOiJEZWJ1Z2dlclJwY1NlcnZpY2VJbnRlcmZhY2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge09ic2VydmFibGV9IGZyb20gJ3J4JztcblxuZXhwb3J0IHR5cGUgQXR0YWNoVGFyZ2V0SW5mbyA9IHtcbiAgcGlkOiBudW1iZXIsXG4gIG5hbWU6IHN0cmluZ1xufTtcblxuZXhwb3J0IHR5cGUgTGF1bmNoVGFyZ2V0SW5mbyA9IHtcbiAgZXhlY3V0YWJsZVBhdGg6IHN0cmluZyxcbiAgYXJndW1lbnRzOiBBcnJheTxzdHJpbmc+LFxuICBlbnZpcm9ubWVudFZhcmlhYmxlczogP0FycmF5PHN0cmluZz4sXG4gIHdvcmtpbmdEaXJlY3Rvcnk6IHN0cmluZyxcbn07XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRBdHRhY2hUYXJnZXRJbmZvTGlzdCgpOiBQcm9taXNlPEFycmF5PEF0dGFjaFRhcmdldEluZm8+PiB7XG4gIHRocm93IG5ldyBFcnJvcignTm90IGltcGxlbWVudGVkJyk7XG59XG5cbmV4cG9ydCBjbGFzcyBEZWJ1Z2dlckNvbm5lY3Rpb24ge1xuICBnZXRTZXJ2ZXJNZXNzYWdlT2JzZXJ2YWJsZSgpOiBPYnNlcnZhYmxlPHN0cmluZz4ge1xuICAgIHRocm93IG5ldyBFcnJvcignTm90IGltcGxlbWVudGVkJyk7XG4gIH1cbiAgYXN5bmMgc2VuZENvbW1hbmQobWVzc2FnZTogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQnKTtcbiAgfVxuICAvLyAkRmxvd0ZpeE1lXG4gIGFzeW5jIGRpc3Bvc2UoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQnKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgRGVidWdnZXJScGNTZXJ2aWNlIHtcbiAgYXN5bmMgYXR0YWNoKHBpZDogbnVtYmVyKTogUHJvbWlzZTxEZWJ1Z2dlckNvbm5lY3Rpb24+IHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCcpO1xuICB9XG4gIGFzeW5jIGxhdW5jaChsYXVuY2hJbmZvOiBMYXVuY2hUYXJnZXRJbmZvKTogUHJvbWlzZTxEZWJ1Z2dlckNvbm5lY3Rpb24+IHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCcpO1xuICB9XG4gIGFzeW5jIGRpc3Bvc2UoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQnKTtcbiAgfVxufVxuIl19