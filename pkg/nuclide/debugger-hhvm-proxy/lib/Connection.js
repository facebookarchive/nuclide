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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNvbm5lY3Rpb24uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OzswQkFXeUIsY0FBYzs7eUJBQ2YsYUFBYTs7QUFPckMsSUFBSSxlQUFlLEdBQUcsQ0FBQyxDQUFDOztJQUVYLFVBQVU7QUFLVixXQUxBLFVBQVUsQ0FLVCxNQUFjLEVBQUU7MEJBTGpCLFVBQVU7O0FBTW5CLFFBQU0sVUFBVSxHQUFHLDJCQUFlLE1BQU0sQ0FBQyxDQUFDO0FBQzFDLFFBQUksQ0FBQyxPQUFPLEdBQUcsVUFBVSxDQUFDO0FBQzFCLFFBQUksQ0FBQyxVQUFVLEdBQUcseUJBQWMsVUFBVSxDQUFDLENBQUM7QUFDNUMsUUFBSSxDQUFDLEdBQUcsR0FBRyxlQUFlLEVBQUUsQ0FBQztHQUM5Qjs7ZUFWVSxVQUFVOztXQVloQixpQkFBVztBQUNkLGFBQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQztLQUNqQjs7O1dBRU8sa0JBQUMsUUFBbUMsRUFBbUI7QUFDN0QsYUFBTyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUN4Qzs7O1dBRWtCLDZCQUFDLFVBQWtCLEVBQUUsVUFBa0IsRUFBbUI7QUFDM0UsYUFBTyxJQUFJLENBQUMsVUFBVSxDQUFDLG1CQUFtQixDQUFDLFVBQVUsRUFBRSxVQUFVLENBQUMsQ0FBQztLQUNwRTs7O1dBRXFCLGdDQUFDLGFBQXFCLEVBQW1CO0FBQzdELGFBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQyxhQUFhLENBQUMsQ0FBQztLQUMzRDs7O1dBRVksdUJBQUMsUUFBZ0IsRUFBRSxVQUFrQixFQUFtQjtBQUNuRSxhQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsQ0FBQztLQUN6RDs7O1dBRWUsMEJBQUMsWUFBb0IsRUFBVztBQUM5QyxhQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxDQUFDLENBQUM7S0FDcEQ7OztXQUVhLDBCQUFvQjtBQUNoQyxhQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYyxFQUFFLENBQUM7S0FDdEM7OztXQUVnQiwyQkFBQyxVQUFrQixFQUF5QjtBQUMzRCxhQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsaUJBQWlCLENBQUMsVUFBVSxDQUFDLENBQUM7S0FDdEQ7OztXQUVRLHFCQUFvQjtBQUMzQixhQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLENBQUM7S0FDakM7OztXQUVzQixpQ0FBQyxPQUFlLEVBQW1CO0FBQ3hELGFBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztLQUN0RDs7O1dBRWUsNEJBQXFCO0FBQ25DLGFBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0tBQ3hDOzs7V0FFWSx1QkFBQyxRQUF3QixFQUFzQztBQUMxRSxhQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0tBQ2hEOzs7V0FFTSxtQkFBUztBQUNkLFVBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDeEI7OztTQTlEVSxVQUFVIiwiZmlsZSI6IkNvbm5lY3Rpb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge0RiZ3BTb2NrZXR9IGZyb20gJy4vRGJncFNvY2tldCc7XG5pbXBvcnQge0RhdGFDYWNoZX0gZnJvbSAnLi9EYXRhQ2FjaGUnO1xuXG5pbXBvcnQgdHlwZSB7U29ja2V0fSBmcm9tICduZXQnO1xuaW1wb3J0IHR5cGUge1Njb3BlfSBmcm9tICcuL0RhdGFDYWNoZSc7XG5pbXBvcnQgdHlwZSB7UHJvcGVydHlEZXNjcmlwdG9yfSBmcm9tICcuL0RhdGFDYWNoZSc7XG5pbXBvcnQgdHlwZSB7UmVtb3RlT2JqZWN0SWR9IGZyb20gJy4vRGF0YUNhY2hlJztcblxubGV0IGNvbm5lY3Rpb25Db3VudCA9IDE7XG5cbmV4cG9ydCBjbGFzcyBDb25uZWN0aW9uIHtcbiAgX3NvY2tldDogRGJncFNvY2tldDtcbiAgX2RhdGFDYWNoZTogRGF0YUNhY2hlO1xuICBfaWQ6IG51bWJlcjtcblxuICBjb25zdHJ1Y3Rvcihzb2NrZXQ6IFNvY2tldCkge1xuICAgIGNvbnN0IGRiZ3BTb2NrZXQgPSBuZXcgRGJncFNvY2tldChzb2NrZXQpO1xuICAgIHRoaXMuX3NvY2tldCA9IGRiZ3BTb2NrZXQ7XG4gICAgdGhpcy5fZGF0YUNhY2hlID0gbmV3IERhdGFDYWNoZShkYmdwU29ja2V0KTtcbiAgICB0aGlzLl9pZCA9IGNvbm5lY3Rpb25Db3VudCsrO1xuICB9XG5cbiAgZ2V0SWQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5faWQ7XG4gIH1cblxuICBvblN0YXR1cyhjYWxsYmFjazogKHN0YXR1czogc3RyaW5nKSA9PiBtaXhlZCk6IGF0b20kRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX3NvY2tldC5vblN0YXR1cyhjYWxsYmFjayk7XG4gIH1cblxuICBldmFsdWF0ZU9uQ2FsbEZyYW1lKGZyYW1lSW5kZXg6IG51bWJlciwgZXhwcmVzc2lvbjogc3RyaW5nKTogUHJvbWlzZTxPYmplY3Q+IHtcbiAgICByZXR1cm4gdGhpcy5fZGF0YUNhY2hlLmV2YWx1YXRlT25DYWxsRnJhbWUoZnJhbWVJbmRleCwgZXhwcmVzc2lvbik7XG4gIH1cblxuICBzZXRFeGNlcHRpb25CcmVha3BvaW50KGV4Y2VwdGlvbk5hbWU6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgcmV0dXJuIHRoaXMuX3NvY2tldC5zZXRFeGNlcHRpb25CcmVha3BvaW50KGV4Y2VwdGlvbk5hbWUpO1xuICB9XG5cbiAgc2V0QnJlYWtwb2ludChmaWxlbmFtZTogc3RyaW5nLCBsaW5lTnVtYmVyOiBudW1iZXIpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIHJldHVybiB0aGlzLl9zb2NrZXQuc2V0QnJlYWtwb2ludChmaWxlbmFtZSwgbGluZU51bWJlcik7XG4gIH1cblxuICByZW1vdmVCcmVha3BvaW50KGJyZWFrcG9pbnRJZDogc3RyaW5nKTogUHJvbWlzZSB7XG4gICAgcmV0dXJuIHRoaXMuX3NvY2tldC5yZW1vdmVCcmVha3BvaW50KGJyZWFrcG9pbnRJZCk7XG4gIH1cblxuICBnZXRTdGFja0ZyYW1lcygpOiBQcm9taXNlPE9iamVjdD4ge1xuICAgIHJldHVybiB0aGlzLl9zb2NrZXQuZ2V0U3RhY2tGcmFtZXMoKTtcbiAgfVxuXG4gIGdldFNjb3Blc0ZvckZyYW1lKGZyYW1lSW5kZXg6IG51bWJlcik6IFByb21pc2U8QXJyYXk8U2NvcGU+PiB7XG4gICAgcmV0dXJuIHRoaXMuX2RhdGFDYWNoZS5nZXRTY29wZXNGb3JGcmFtZShmcmFtZUluZGV4KTtcbiAgfVxuXG4gIGdldFN0YXR1cygpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIHJldHVybiB0aGlzLl9zb2NrZXQuZ2V0U3RhdHVzKCk7XG4gIH1cblxuICBzZW5kQ29udGludWF0aW9uQ29tbWFuZChjb21tYW5kOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIHJldHVybiB0aGlzLl9zb2NrZXQuc2VuZENvbnRpbnVhdGlvbkNvbW1hbmQoY29tbWFuZCk7XG4gIH1cblxuICBzZW5kQnJlYWtDb21tYW5kKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiB0aGlzLl9zb2NrZXQuc2VuZEJyZWFrQ29tbWFuZCgpO1xuICB9XG5cbiAgZ2V0UHJvcGVydGllcyhyZW1vdGVJZDogUmVtb3RlT2JqZWN0SWQpOiBQcm9taXNlPEFycmF5PFByb3BlcnR5RGVzY3JpcHRvcj4+IHtcbiAgICByZXR1cm4gdGhpcy5fZGF0YUNhY2hlLmdldFByb3BlcnRpZXMocmVtb3RlSWQpO1xuICB9XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9zb2NrZXQuZGlzcG9zZSgpO1xuICB9XG59XG4iXX0=