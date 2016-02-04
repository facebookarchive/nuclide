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
    key: 'dispose',
    value: _asyncToGenerator(function* () {
      throw new Error('Not implemented');
    })
  }]);

  return DebuggerRpcService;
})();

exports.DebuggerRpcService = DebuggerRpcService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRlYnVnZ2VyUnBjU2VydmljZUludGVyZmFjZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7SUFrQnNCLHVCQUF1QixxQkFBdEMsYUFBMkU7QUFDaEYsUUFBTSxJQUFJLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0NBQ3BDOzs7Ozs7Ozs7Ozs7Ozs7O2tCQVR3QixJQUFJOztJQVdoQixrQkFBa0I7V0FBbEIsa0JBQWtCOzBCQUFsQixrQkFBa0I7OztlQUFsQixrQkFBa0I7O1dBQ0gsc0NBQXVCO0FBQy9DLFlBQU0sSUFBSSxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQztLQUNwQzs7OzZCQUNnQixXQUFDLE9BQWUsRUFBaUI7QUFDaEQsWUFBTSxJQUFJLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0tBQ3BDOzs7Ozs2QkFFWSxhQUFrQjtBQUM3QixZQUFNLElBQUksS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUM7S0FDcEM7OztTQVZVLGtCQUFrQjs7Ozs7SUFhbEIsa0JBQWtCO1dBQWxCLGtCQUFrQjswQkFBbEIsa0JBQWtCOzs7ZUFBbEIsa0JBQWtCOzs2QkFDakIsV0FBQyxHQUFXLEVBQStCO0FBQ3JELFlBQU0sSUFBSSxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQztLQUNwQzs7OzZCQUNZLGFBQWtCO0FBQzdCLFlBQU0sSUFBSSxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQztLQUNwQzs7O1NBTlUsa0JBQWtCIiwiZmlsZSI6IkRlYnVnZ2VyUnBjU2VydmljZUludGVyZmFjZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB7T2JzZXJ2YWJsZX0gZnJvbSAncngnO1xuXG5leHBvcnQgdHlwZSBBdHRhY2hUYXJnZXRJbmZvID0ge1xuICBwaWQ6IG51bWJlcixcbiAgbmFtZTogc3RyaW5nXG59O1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0QXR0YWNoVGFyZ2V0SW5mb0xpc3QoKTogUHJvbWlzZTxBcnJheTxBdHRhY2hUYXJnZXRJbmZvPj4ge1xuICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCcpO1xufVxuXG5leHBvcnQgY2xhc3MgRGVidWdnZXJDb25uZWN0aW9uIHtcbiAgZ2V0U2VydmVyTWVzc2FnZU9ic2VydmFibGUoKTogT2JzZXJ2YWJsZTxzdHJpbmc+IHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCcpO1xuICB9XG4gIGFzeW5jIHNlbmRDb21tYW5kKG1lc3NhZ2U6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIHRocm93IG5ldyBFcnJvcignTm90IGltcGxlbWVudGVkJyk7XG4gIH1cbiAgLy8gJEZsb3dGaXhNZVxuICBhc3luYyBkaXNwb3NlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHRocm93IG5ldyBFcnJvcignTm90IGltcGxlbWVudGVkJyk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIERlYnVnZ2VyUnBjU2VydmljZSB7XG4gIGFzeW5jIGF0dGFjaChwaWQ6IG51bWJlcik6IFByb21pc2U8RGVidWdnZXJDb25uZWN0aW9uPiB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQnKTtcbiAgfVxuICBhc3luYyBkaXNwb3NlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHRocm93IG5ldyBFcnJvcignTm90IGltcGxlbWVudGVkJyk7XG4gIH1cbn1cbiJdfQ==