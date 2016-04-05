Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _DbgpSocket = require('./DbgpSocket');

var _DataCache = require('./DataCache');

var connectionCount = 1;

var Connection = (function () {
  function Connection(socket) {
    _classCallCheck(this, Connection);

    var dbgpSocket = new _DbgpSocket.DbgpSocket(socket);
    this._socket = dbgpSocket;
    this._dataCache = new _DataCache.DataCache(dbgpSocket);
    this._id = connectionCount++;
  }

  _createClass(Connection, [{
    key: 'getId',
    value: function getId() {
      return this._id;
    }
  }, {
    key: 'onStatus',
    value: function onStatus(callback) {
      return this._socket.onStatus(callback);
    }
  }, {
    key: 'evaluateOnCallFrame',
    value: function evaluateOnCallFrame(frameIndex, expression) {
      return this._dataCache.evaluateOnCallFrame(frameIndex, expression);
    }
  }, {
    key: 'runtimeEvaluate',
    value: function runtimeEvaluate(frameIndex, expression) {
      return this._dataCache.runtimeEvaluate(frameIndex, expression);
    }
  }, {
    key: 'setExceptionBreakpoint',
    value: function setExceptionBreakpoint(exceptionName) {
      return this._socket.setExceptionBreakpoint(exceptionName);
    }
  }, {
    key: 'setBreakpoint',
    value: function setBreakpoint(filename, lineNumber) {
      return this._socket.setBreakpoint(filename, lineNumber);
    }
  }, {
    key: 'removeBreakpoint',
    value: function removeBreakpoint(breakpointId) {
      return this._socket.removeBreakpoint(breakpointId);
    }
  }, {
    key: 'getStackFrames',
    value: function getStackFrames() {
      return this._socket.getStackFrames();
    }
  }, {
    key: 'getScopesForFrame',
    value: function getScopesForFrame(frameIndex) {
      return this._dataCache.getScopesForFrame(frameIndex);
    }
  }, {
    key: 'getStatus',
    value: function getStatus() {
      return this._socket.getStatus();
    }
  }, {
    key: 'sendContinuationCommand',
    value: function sendContinuationCommand(command) {
      return this._socket.sendContinuationCommand(command);
    }
  }, {
    key: 'sendStdoutRequest',
    value: function sendStdoutRequest() {
      return this._socket.sendStdoutRequest();
    }
  }, {
    key: 'sendStderrRequest',
    value: function sendStderrRequest() {
      return this._socket.sendStderrRequest();
    }
  }, {
    key: 'sendBreakCommand',
    value: function sendBreakCommand() {
      return this._socket.sendBreakCommand();
    }
  }, {
    key: 'setFeature',
    value: function setFeature(name, value) {
      return this._socket.setFeature(name, value);
    }
  }, {
    key: 'getProperties',
    value: function getProperties(remoteId) {
      return this._dataCache.getProperties(remoteId);
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._socket.dispose();
    }
  }]);

  return Connection;
})();

exports.Connection = Connection;
//# sourceMappingURL=data:application/json;base64,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ZSI6IkNvbm5lY3Rpb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge0RiZ3BTb2NrZXR9IGZyb20gJy4vRGJncFNvY2tldCc7XG5pbXBvcnQge0RhdGFDYWNoZX0gZnJvbSAnLi9EYXRhQ2FjaGUnO1xuXG5pbXBvcnQgdHlwZSB7U29ja2V0fSBmcm9tICduZXQnO1xuXG5sZXQgY29ubmVjdGlvbkNvdW50ID0gMTtcblxuZXhwb3J0IGNsYXNzIENvbm5lY3Rpb24ge1xuICBfc29ja2V0OiBEYmdwU29ja2V0O1xuICBfZGF0YUNhY2hlOiBEYXRhQ2FjaGU7XG4gIF9pZDogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKHNvY2tldDogU29ja2V0KSB7XG4gICAgY29uc3QgZGJncFNvY2tldCA9IG5ldyBEYmdwU29ja2V0KHNvY2tldCk7XG4gICAgdGhpcy5fc29ja2V0ID0gZGJncFNvY2tldDtcbiAgICB0aGlzLl9kYXRhQ2FjaGUgPSBuZXcgRGF0YUNhY2hlKGRiZ3BTb2NrZXQpO1xuICAgIHRoaXMuX2lkID0gY29ubmVjdGlvbkNvdW50Kys7XG4gIH1cblxuICBnZXRJZCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9pZDtcbiAgfVxuXG4gIG9uU3RhdHVzKGNhbGxiYWNrOiAoc3RhdHVzOiBzdHJpbmcsIC4uLmFyZ3M6IEFycmF5PHN0cmluZz4pID0+IG1peGVkKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9zb2NrZXQub25TdGF0dXMoY2FsbGJhY2spO1xuICB9XG5cbiAgZXZhbHVhdGVPbkNhbGxGcmFtZShmcmFtZUluZGV4OiBudW1iZXIsIGV4cHJlc3Npb246IHN0cmluZyk6IFByb21pc2U8T2JqZWN0PiB7XG4gICAgcmV0dXJuIHRoaXMuX2RhdGFDYWNoZS5ldmFsdWF0ZU9uQ2FsbEZyYW1lKGZyYW1lSW5kZXgsIGV4cHJlc3Npb24pO1xuICB9XG5cbiAgcnVudGltZUV2YWx1YXRlKGZyYW1lSW5kZXg6IG51bWJlciwgZXhwcmVzc2lvbjogc3RyaW5nKTogUHJvbWlzZTxPYmplY3Q+IHtcbiAgICByZXR1cm4gdGhpcy5fZGF0YUNhY2hlLnJ1bnRpbWVFdmFsdWF0ZShmcmFtZUluZGV4LCBleHByZXNzaW9uKTtcbiAgfVxuXG4gIHNldEV4Y2VwdGlvbkJyZWFrcG9pbnQoZXhjZXB0aW9uTmFtZTogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICByZXR1cm4gdGhpcy5fc29ja2V0LnNldEV4Y2VwdGlvbkJyZWFrcG9pbnQoZXhjZXB0aW9uTmFtZSk7XG4gIH1cblxuICBzZXRCcmVha3BvaW50KGZpbGVuYW1lOiBzdHJpbmcsIGxpbmVOdW1iZXI6IG51bWJlcik6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgcmV0dXJuIHRoaXMuX3NvY2tldC5zZXRCcmVha3BvaW50KGZpbGVuYW1lLCBsaW5lTnVtYmVyKTtcbiAgfVxuXG4gIHJlbW92ZUJyZWFrcG9pbnQoYnJlYWtwb2ludElkOiBzdHJpbmcpOiBQcm9taXNlIHtcbiAgICByZXR1cm4gdGhpcy5fc29ja2V0LnJlbW92ZUJyZWFrcG9pbnQoYnJlYWtwb2ludElkKTtcbiAgfVxuXG4gIGdldFN0YWNrRnJhbWVzKCk6IFByb21pc2U8T2JqZWN0PiB7XG4gICAgcmV0dXJuIHRoaXMuX3NvY2tldC5nZXRTdGFja0ZyYW1lcygpO1xuICB9XG5cbiAgZ2V0U2NvcGVzRm9yRnJhbWUoZnJhbWVJbmRleDogbnVtYmVyKTogUHJvbWlzZTxBcnJheTxEZWJ1Z2dlciRTY29wZT4+IHtcbiAgICByZXR1cm4gdGhpcy5fZGF0YUNhY2hlLmdldFNjb3Blc0ZvckZyYW1lKGZyYW1lSW5kZXgpO1xuICB9XG5cbiAgZ2V0U3RhdHVzKCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgcmV0dXJuIHRoaXMuX3NvY2tldC5nZXRTdGF0dXMoKTtcbiAgfVxuXG4gIHNlbmRDb250aW51YXRpb25Db21tYW5kKGNvbW1hbmQ6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgcmV0dXJuIHRoaXMuX3NvY2tldC5zZW5kQ29udGludWF0aW9uQ29tbWFuZChjb21tYW5kKTtcbiAgfVxuXG4gIHNlbmRTdGRvdXRSZXF1ZXN0KCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiB0aGlzLl9zb2NrZXQuc2VuZFN0ZG91dFJlcXVlc3QoKTtcbiAgfVxuXG4gIHNlbmRTdGRlcnJSZXF1ZXN0KCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiB0aGlzLl9zb2NrZXQuc2VuZFN0ZGVyclJlcXVlc3QoKTtcbiAgfVxuXG4gIHNlbmRCcmVha0NvbW1hbmQoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIHRoaXMuX3NvY2tldC5zZW5kQnJlYWtDb21tYW5kKCk7XG4gIH1cblxuICBzZXRGZWF0dXJlKG5hbWU6IHN0cmluZywgdmFsdWU6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiB0aGlzLl9zb2NrZXQuc2V0RmVhdHVyZShuYW1lLCB2YWx1ZSk7XG4gIH1cblxuICBnZXRQcm9wZXJ0aWVzKHJlbW90ZUlkOiBSdW50aW1lJFJlbW90ZU9iamVjdElkKTogUHJvbWlzZTxBcnJheTxSdW50aW1lJFByb3BlcnR5RGVzY3JpcHRvcj4+IHtcbiAgICByZXR1cm4gdGhpcy5fZGF0YUNhY2hlLmdldFByb3BlcnRpZXMocmVtb3RlSWQpO1xuICB9XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9zb2NrZXQuZGlzcG9zZSgpO1xuICB9XG59XG4iXX0=