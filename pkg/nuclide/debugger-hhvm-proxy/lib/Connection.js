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
    key: 'sendBreakCommand',
    value: function sendBreakCommand() {
      return this._socket.sendBreakCommand();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNvbm5lY3Rpb24uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OzswQkFXeUIsY0FBYzs7eUJBQ2YsYUFBYTs7QUFPckMsSUFBSSxlQUFlLEdBQUcsQ0FBQyxDQUFDOztJQUVYLFVBQVU7QUFLVixXQUxBLFVBQVUsQ0FLVCxNQUFjLEVBQUU7MEJBTGpCLFVBQVU7O0FBTW5CLFFBQU0sVUFBVSxHQUFHLDJCQUFlLE1BQU0sQ0FBQyxDQUFDO0FBQzFDLFFBQUksQ0FBQyxPQUFPLEdBQUcsVUFBVSxDQUFDO0FBQzFCLFFBQUksQ0FBQyxVQUFVLEdBQUcseUJBQWMsVUFBVSxDQUFDLENBQUM7QUFDNUMsUUFBSSxDQUFDLEdBQUcsR0FBRyxlQUFlLEVBQUUsQ0FBQztHQUM5Qjs7ZUFWVSxVQUFVOztXQVloQixpQkFBVztBQUNkLGFBQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQztLQUNqQjs7O1dBRU8sa0JBQUMsUUFBbUMsRUFBZTtBQUN6RCxhQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0tBQ3hDOzs7V0FFa0IsNkJBQUMsVUFBa0IsRUFBRSxVQUFrQixFQUFtQjtBQUMzRSxhQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsbUJBQW1CLENBQUMsVUFBVSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0tBQ3BFOzs7V0FFcUIsZ0NBQUMsYUFBcUIsRUFBbUI7QUFDN0QsYUFBTyxJQUFJLENBQUMsT0FBTyxDQUFDLHNCQUFzQixDQUFDLGFBQWEsQ0FBQyxDQUFDO0tBQzNEOzs7V0FFWSx1QkFBQyxRQUFnQixFQUFFLFVBQWtCLEVBQW1CO0FBQ25FLGFBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsUUFBUSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0tBQ3pEOzs7V0FFZSwwQkFBQyxZQUFvQixFQUFXO0FBQzlDLGFBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLENBQUMsQ0FBQztLQUNwRDs7O1dBRWEsMEJBQW9CO0FBQ2hDLGFBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUUsQ0FBQztLQUN0Qzs7O1dBRWdCLDJCQUFDLFVBQWtCLEVBQXlCO0FBQzNELGFBQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxVQUFVLENBQUMsQ0FBQztLQUN0RDs7O1dBRVEscUJBQW9CO0FBQzNCLGFBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsQ0FBQztLQUNqQzs7O1dBRXNCLGlDQUFDLE9BQWUsRUFBbUI7QUFDeEQsYUFBTyxJQUFJLENBQUMsT0FBTyxDQUFDLHVCQUF1QixDQUFDLE9BQU8sQ0FBQyxDQUFDO0tBQ3REOzs7V0FFZSw0QkFBcUI7QUFDbkMsYUFBTyxJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQixFQUFFLENBQUM7S0FDeEM7OztXQUVZLHVCQUFDLFFBQXdCLEVBQXNDO0FBQzFFLGFBQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7S0FDaEQ7OztXQUVNLG1CQUFTO0FBQ2QsVUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUN4Qjs7O1NBOURVLFVBQVUiLCJmaWxlIjoiQ29ubmVjdGlvbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB7RGJncFNvY2tldH0gZnJvbSAnLi9EYmdwU29ja2V0JztcbmltcG9ydCB7RGF0YUNhY2hlfSBmcm9tICcuL0RhdGFDYWNoZSc7XG5cbmltcG9ydCB0eXBlIHtTb2NrZXR9IGZyb20gJ25ldCc7XG5pbXBvcnQgdHlwZSB7U2NvcGV9IGZyb20gJy4vRGF0YUNhY2hlJztcbmltcG9ydCB0eXBlIHtQcm9wZXJ0eURlc2NyaXB0b3J9IGZyb20gJy4vRGF0YUNhY2hlJztcbmltcG9ydCB0eXBlIHtSZW1vdGVPYmplY3RJZH0gZnJvbSAnLi9EYXRhQ2FjaGUnO1xuXG5sZXQgY29ubmVjdGlvbkNvdW50ID0gMTtcblxuZXhwb3J0IGNsYXNzIENvbm5lY3Rpb24ge1xuICBfc29ja2V0OiBEYmdwU29ja2V0O1xuICBfZGF0YUNhY2hlOiBEYXRhQ2FjaGU7XG4gIF9pZDogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKHNvY2tldDogU29ja2V0KSB7XG4gICAgY29uc3QgZGJncFNvY2tldCA9IG5ldyBEYmdwU29ja2V0KHNvY2tldCk7XG4gICAgdGhpcy5fc29ja2V0ID0gZGJncFNvY2tldDtcbiAgICB0aGlzLl9kYXRhQ2FjaGUgPSBuZXcgRGF0YUNhY2hlKGRiZ3BTb2NrZXQpO1xuICAgIHRoaXMuX2lkID0gY29ubmVjdGlvbkNvdW50Kys7XG4gIH1cblxuICBnZXRJZCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9pZDtcbiAgfVxuXG4gIG9uU3RhdHVzKGNhbGxiYWNrOiAoc3RhdHVzOiBzdHJpbmcpID0+IG1peGVkKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9zb2NrZXQub25TdGF0dXMoY2FsbGJhY2spO1xuICB9XG5cbiAgZXZhbHVhdGVPbkNhbGxGcmFtZShmcmFtZUluZGV4OiBudW1iZXIsIGV4cHJlc3Npb246IHN0cmluZyk6IFByb21pc2U8T2JqZWN0PiB7XG4gICAgcmV0dXJuIHRoaXMuX2RhdGFDYWNoZS5ldmFsdWF0ZU9uQ2FsbEZyYW1lKGZyYW1lSW5kZXgsIGV4cHJlc3Npb24pO1xuICB9XG5cbiAgc2V0RXhjZXB0aW9uQnJlYWtwb2ludChleGNlcHRpb25OYW1lOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIHJldHVybiB0aGlzLl9zb2NrZXQuc2V0RXhjZXB0aW9uQnJlYWtwb2ludChleGNlcHRpb25OYW1lKTtcbiAgfVxuXG4gIHNldEJyZWFrcG9pbnQoZmlsZW5hbWU6IHN0cmluZywgbGluZU51bWJlcjogbnVtYmVyKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICByZXR1cm4gdGhpcy5fc29ja2V0LnNldEJyZWFrcG9pbnQoZmlsZW5hbWUsIGxpbmVOdW1iZXIpO1xuICB9XG5cbiAgcmVtb3ZlQnJlYWtwb2ludChicmVha3BvaW50SWQ6IHN0cmluZyk6IFByb21pc2Uge1xuICAgIHJldHVybiB0aGlzLl9zb2NrZXQucmVtb3ZlQnJlYWtwb2ludChicmVha3BvaW50SWQpO1xuICB9XG5cbiAgZ2V0U3RhY2tGcmFtZXMoKTogUHJvbWlzZTxPYmplY3Q+IHtcbiAgICByZXR1cm4gdGhpcy5fc29ja2V0LmdldFN0YWNrRnJhbWVzKCk7XG4gIH1cblxuICBnZXRTY29wZXNGb3JGcmFtZShmcmFtZUluZGV4OiBudW1iZXIpOiBQcm9taXNlPEFycmF5PFNjb3BlPj4ge1xuICAgIHJldHVybiB0aGlzLl9kYXRhQ2FjaGUuZ2V0U2NvcGVzRm9yRnJhbWUoZnJhbWVJbmRleCk7XG4gIH1cblxuICBnZXRTdGF0dXMoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICByZXR1cm4gdGhpcy5fc29ja2V0LmdldFN0YXR1cygpO1xuICB9XG5cbiAgc2VuZENvbnRpbnVhdGlvbkNvbW1hbmQoY29tbWFuZDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICByZXR1cm4gdGhpcy5fc29ja2V0LnNlbmRDb250aW51YXRpb25Db21tYW5kKGNvbW1hbmQpO1xuICB9XG5cbiAgc2VuZEJyZWFrQ29tbWFuZCgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gdGhpcy5fc29ja2V0LnNlbmRCcmVha0NvbW1hbmQoKTtcbiAgfVxuXG4gIGdldFByb3BlcnRpZXMocmVtb3RlSWQ6IFJlbW90ZU9iamVjdElkKTogUHJvbWlzZTxBcnJheTxQcm9wZXJ0eURlc2NyaXB0b3I+PiB7XG4gICAgcmV0dXJuIHRoaXMuX2RhdGFDYWNoZS5nZXRQcm9wZXJ0aWVzKHJlbW90ZUlkKTtcbiAgfVxuXG4gIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5fc29ja2V0LmRpc3Bvc2UoKTtcbiAgfVxufVxuIl19