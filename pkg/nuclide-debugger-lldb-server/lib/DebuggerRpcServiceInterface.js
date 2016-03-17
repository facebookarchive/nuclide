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
    key: 'getOutputWindowObservable',
    value: function getOutputWindowObservable() {
      throw new Error('Not implemented');
    }
  }, {
    key: 'attach',
    value: _asyncToGenerator(function* (attachInfo) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRlYnVnZ2VyUnBjU2VydmljZUludGVyZmFjZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7SUEyQnNCLHVCQUF1QixxQkFBdEMsYUFBMkU7QUFDaEYsUUFBTSxJQUFJLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0NBQ3BDOzs7Ozs7Ozs7Ozs7Ozs7O2tCQWxCd0IsSUFBSTs7SUFvQmhCLGtCQUFrQjtXQUFsQixrQkFBa0I7MEJBQWxCLGtCQUFrQjs7O2VBQWxCLGtCQUFrQjs7V0FDSCxzQ0FBdUI7QUFDL0MsWUFBTSxJQUFJLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0tBQ3BDOzs7NkJBQ2dCLFdBQUMsT0FBZSxFQUFpQjtBQUNoRCxZQUFNLElBQUksS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUM7S0FDcEM7Ozs7OzZCQUVZLGFBQWtCO0FBQzdCLFlBQU0sSUFBSSxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQztLQUNwQzs7O1NBVlUsa0JBQWtCOzs7OztJQWFsQixrQkFBa0I7V0FBbEIsa0JBQWtCOzBCQUFsQixrQkFBa0I7OztlQUFsQixrQkFBa0I7O1dBQ0oscUNBQXVCO0FBQzlDLFlBQU0sSUFBSSxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQztLQUNwQzs7OzZCQUNXLFdBQUMsVUFBNEIsRUFBK0I7QUFDdEUsWUFBTSxJQUFJLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0tBQ3BDOzs7NkJBQ1csV0FBQyxVQUE0QixFQUErQjtBQUN0RSxZQUFNLElBQUksS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUM7S0FDcEM7Ozs2QkFDWSxhQUFrQjtBQUM3QixZQUFNLElBQUksS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUM7S0FDcEM7OztTQVpVLGtCQUFrQiIsImZpbGUiOiJEZWJ1Z2dlclJwY1NlcnZpY2VJbnRlcmZhY2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge09ic2VydmFibGV9IGZyb20gJ3J4JztcblxuZXhwb3J0IHR5cGUgQXR0YWNoVGFyZ2V0SW5mbyA9IHtcbiAgcGlkOiBudW1iZXI7XG4gIG5hbWU6IHN0cmluZztcbiAgYmFzZXBhdGg/OiBzdHJpbmc7XG59O1xuXG5leHBvcnQgdHlwZSBMYXVuY2hUYXJnZXRJbmZvID0ge1xuICBleGVjdXRhYmxlUGF0aDogc3RyaW5nO1xuICBhcmd1bWVudHM6IHN0cmluZztcbiAgZW52aXJvbm1lbnRWYXJpYWJsZXM6ID9BcnJheTxzdHJpbmc+O1xuICB3b3JraW5nRGlyZWN0b3J5OiBzdHJpbmc7XG4gIGJhc2VwYXRoPzogc3RyaW5nXG59O1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0QXR0YWNoVGFyZ2V0SW5mb0xpc3QoKTogUHJvbWlzZTxBcnJheTxBdHRhY2hUYXJnZXRJbmZvPj4ge1xuICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCcpO1xufVxuXG5leHBvcnQgY2xhc3MgRGVidWdnZXJDb25uZWN0aW9uIHtcbiAgZ2V0U2VydmVyTWVzc2FnZU9ic2VydmFibGUoKTogT2JzZXJ2YWJsZTxzdHJpbmc+IHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCcpO1xuICB9XG4gIGFzeW5jIHNlbmRDb21tYW5kKG1lc3NhZ2U6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIHRocm93IG5ldyBFcnJvcignTm90IGltcGxlbWVudGVkJyk7XG4gIH1cbiAgLy8gJEZsb3dGaXhNZVxuICBhc3luYyBkaXNwb3NlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHRocm93IG5ldyBFcnJvcignTm90IGltcGxlbWVudGVkJyk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIERlYnVnZ2VyUnBjU2VydmljZSB7XG4gIGdldE91dHB1dFdpbmRvd09ic2VydmFibGUoKTogT2JzZXJ2YWJsZTxzdHJpbmc+IHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCcpO1xuICB9XG4gIGFzeW5jIGF0dGFjaChhdHRhY2hJbmZvOiBBdHRhY2hUYXJnZXRJbmZvKTogUHJvbWlzZTxEZWJ1Z2dlckNvbm5lY3Rpb24+IHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCcpO1xuICB9XG4gIGFzeW5jIGxhdW5jaChsYXVuY2hJbmZvOiBMYXVuY2hUYXJnZXRJbmZvKTogUHJvbWlzZTxEZWJ1Z2dlckNvbm5lY3Rpb24+IHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCcpO1xuICB9XG4gIGFzeW5jIGRpc3Bvc2UoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQnKTtcbiAgfVxufVxuIl19