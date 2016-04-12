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

exports.createCallMessage = createCallMessage;
exports.createSuccessResponseMessage = createSuccessResponseMessage;
exports.createErrorReponseMessage = createErrorReponseMessage;
exports.isValidResponseMessage = isValidResponseMessage;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _nuclideCommons = require('../../nuclide-commons');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var logger = require('../../nuclide-logging').getLogger();

var CALL_MESSAGE_TYPE = 'call';
var RESPONSE_MESSAGE_TYPE = 'response';

// Typically Array<string | Object>

function createCallMessage(id, args) {
  return {
    type: CALL_MESSAGE_TYPE,
    id: id,
    args: args
  };
}

function createSuccessResponseMessage(id, result) {
  return {
    type: RESPONSE_MESSAGE_TYPE,
    id: id,
    result: result
  };
}

function createErrorReponseMessage(id, error) {
  return {
    type: RESPONSE_MESSAGE_TYPE,
    id: id,
    error: error
  };
}

function isValidResponseMessage(obj) {
  return obj.type === RESPONSE_MESSAGE_TYPE && typeof obj.id === 'number' && obj.result == null !== (obj.error == null);
}

var StreamTransport = (function () {
  function StreamTransport(output, input) {
    _classCallCheck(this, StreamTransport);

    this._output = output;
    this._messages = (0, _nuclideCommons.splitStream)((0, _nuclideCommons.observeStream)(input));
  }

  _createClass(StreamTransport, [{
    key: 'sendMessage',
    value: function sendMessage(message) {
      (0, _assert2['default'])(message.indexOf('\n') === -1);
      this._output.write(message + '\n');
    }
  }, {
    key: 'onMessage',
    value: function onMessage() {
      return this._messages;
    }
  }]);

  return StreamTransport;
})();

exports.StreamTransport = StreamTransport;

var HackRpc = (function () {
  function HackRpc(transport) {
    var _this = this;

    _classCallCheck(this, HackRpc);

    this._index = 0;
    this._inProgress = new Map();
    this._transport = transport;
    this._subscription = transport.onMessage().doOnNext(function (message) {
      _this._handleMessage(message);
    }).subscribe();
  }

  _createClass(HackRpc, [{
    key: 'call',
    value: function call(args) {
      var _this2 = this;

      this._index++;
      var message = createCallMessage(this._index, args);
      var messageString = JSON.stringify(message);
      logger.debug('Sending Hack Rpc: ' + messageString);
      this._transport.sendMessage(messageString);

      return new Promise(function (resolve, reject) {
        _this2._inProgress.set(_this2._index, { resolve: resolve, reject: reject });
      });
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._subscription.dispose();
    }
  }, {
    key: '_handleMessage',
    value: function _handleMessage(messageString) {
      // logger.debug(`Received Hack Rpc response: ${messageString}`);
      var messageObject = undefined;
      try {
        messageObject = JSON.parse(messageString);
      } catch (e) {
        logger.debug('Error: Parsing hack Rpc message.');
        return;
      }

      if (!isValidResponseMessage(messageObject)) {
        logger.debug('Error: Received invalid Hack Rpc response.');
        return;
      }
      var response = messageObject;
      var id = response.id;
      var result = response.result;
      var error = response.error;

      var inProgress = this._inProgress.get(id);
      if (inProgress == null) {
        logger.debug('Error: Received Hack Rpc response with invalid index.');
        return;
      }

      var resolve = inProgress.resolve;
      var reject = inProgress.reject;

      this._inProgress['delete'](id);
      if (result != null) {
        logger.debug('Returning ' + JSON.stringify(result) + ' from Hack RPC ' + id);
        resolve(result);
        return;
      } else {
        (0, _assert2['default'])(error != null);
        logger.debug('Error ' + JSON.stringify(error) + ' from Hack RPC ' + id);
        reject(new Error(JSON.stringify(error)));
      }
    }
  }]);

  return HackRpc;
})();

exports.HackRpc = HackRpc;
//# sourceMappingURL=data:application/json;base64,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TTs7QUFDdEIsVUFBSSxDQUFDLFdBQVcsVUFBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQzVCLFVBQUksTUFBTSxJQUFJLElBQUksRUFBRTtBQUNsQixjQUFNLENBQUMsS0FBSyxnQkFBYyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyx1QkFBa0IsRUFBRSxDQUFHLENBQUM7QUFDeEUsZUFBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ2hCLGVBQU87T0FDUixNQUFNO0FBQ0wsaUNBQVUsS0FBSyxJQUFJLElBQUksQ0FBQyxDQUFDO0FBQ3pCLGNBQU0sQ0FBQyxLQUFLLFlBQVUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsdUJBQWtCLEVBQUUsQ0FBRyxDQUFDO0FBQ25FLGNBQU0sQ0FBQyxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztPQUMxQztLQUNGOzs7U0FqRVUsT0FBTyIsImZpbGUiOiJIYWNrUnBjLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge09ic2VydmFibGV9IGZyb20gJ3J4JztcbmltcG9ydCB7b2JzZXJ2ZVN0cmVhbSwgc3BsaXRTdHJlYW19IGZyb20gJy4uLy4uL251Y2xpZGUtY29tbW9ucyc7XG5jb25zdCBsb2dnZXIgPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLWxvZ2dpbmcnKS5nZXRMb2dnZXIoKTtcbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcblxuY29uc3QgQ0FMTF9NRVNTQUdFX1RZUEUgPSAnY2FsbCc7XG5jb25zdCBSRVNQT05TRV9NRVNTQUdFX1RZUEUgPSAncmVzcG9uc2UnO1xuXG50eXBlIENhbGxNZXNzYWdlID0ge1xuICB0eXBlOiAnY2FsbCc7XG4gIGlkOiBudW1iZXI7XG4gIGFyZ3M6IGFueTsgLy8gVHlwaWNhbGx5IEFycmF5PHN0cmluZyB8IE9iamVjdD5cbn07XG5cbnR5cGUgUmVzcG9uc2VFcnJvciA9IHtcbiAgY29kZT86IG51bWJlcjtcbiAgbWVzc2FnZTogc3RyaW5nO1xufTtcblxudHlwZSBSZXNwb25zZU1lc3NhZ2UgPSB7XG4gIHR5cGU6ICdyZXNwb25zZSc7XG4gIGlkOiBudW1iZXI7XG4gIHJlc3VsdD86IGFueTtcbiAgZXJyb3I/OiBSZXNwb25zZUVycm9yO1xufTtcblxudHlwZSBDYWxsUmVzb2x2ZXIgPSB7XG4gIHJlc29sdmU6IChyZXN1bHQ6IHN0cmluZyB8IE9iamVjdCkgPT4gdm9pZDtcbiAgcmVqZWN0OiAobWVzc2FnZTogYW55KSA9PiB2b2lkO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUNhbGxNZXNzYWdlKGlkOiBudW1iZXIsIGFyZ3M6IGFueSk6IENhbGxNZXNzYWdlIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBDQUxMX01FU1NBR0VfVFlQRSxcbiAgICBpZCxcbiAgICBhcmdzLFxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU3VjY2Vzc1Jlc3BvbnNlTWVzc2FnZShpZDogbnVtYmVyLCByZXN1bHQ6IGFueSk6IFJlc3BvbnNlTWVzc2FnZSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogUkVTUE9OU0VfTUVTU0FHRV9UWVBFLFxuICAgIGlkLFxuICAgIHJlc3VsdCxcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUVycm9yUmVwb25zZU1lc3NhZ2UoaWQ6IG51bWJlciwgZXJyb3I6IFJlc3BvbnNlRXJyb3IpOiBSZXNwb25zZU1lc3NhZ2Uge1xuICByZXR1cm4ge1xuICAgIHR5cGU6IFJFU1BPTlNFX01FU1NBR0VfVFlQRSxcbiAgICBpZCxcbiAgICBlcnJvcixcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzVmFsaWRSZXNwb25zZU1lc3NhZ2Uob2JqOiBhbnkpOiBib29sZWFuIHtcbiAgcmV0dXJuIG9iai50eXBlID09PSBSRVNQT05TRV9NRVNTQUdFX1RZUEVcbiAgICAmJiB0eXBlb2Ygb2JqLmlkID09PSAnbnVtYmVyJ1xuICAgICYmICgob2JqLnJlc3VsdCA9PSBudWxsKSAhPT0gKG9iai5lcnJvciA9PSBudWxsKSk7XG59XG5cbmludGVyZmFjZSBUcmFuc3BvcnQge1xuICBzZW5kTWVzc2FnZShtZXNzYWdlOiBzdHJpbmcpOiB2b2lkO1xuICBvbk1lc3NhZ2UoKTogT2JzZXJ2YWJsZTxzdHJpbmc+O1xufVxuXG5leHBvcnQgY2xhc3MgU3RyZWFtVHJhbnNwb3J0IHtcbiAgX291dHB1dDogc3RyZWFtJFdyaXRhYmxlO1xuICBfbWVzc2FnZXM6IE9ic2VydmFibGU8c3RyaW5nPjtcblxuICBjb25zdHJ1Y3RvcihvdXRwdXQ6IHN0cmVhbSRXcml0YWJsZSwgaW5wdXQ6IHN0cmVhbSRSZWFkYWJsZSkge1xuICAgIHRoaXMuX291dHB1dCA9IG91dHB1dDtcbiAgICB0aGlzLl9tZXNzYWdlcyA9IHNwbGl0U3RyZWFtKG9ic2VydmVTdHJlYW0oaW5wdXQpKTtcbiAgfVxuICBzZW5kTWVzc2FnZShtZXNzYWdlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBpbnZhcmlhbnQobWVzc2FnZS5pbmRleE9mKCdcXG4nKSA9PT0gLTEpO1xuICAgIHRoaXMuX291dHB1dC53cml0ZShtZXNzYWdlICsgJ1xcbicpO1xuICB9XG4gIG9uTWVzc2FnZSgpOiBPYnNlcnZhYmxlPHN0cmluZz4ge1xuICAgIHJldHVybiB0aGlzLl9tZXNzYWdlcztcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgSGFja1JwYyB7XG4gIF9pbmRleDogbnVtYmVyO1xuICBfaW5Qcm9ncmVzczogTWFwPG51bWJlciwgQ2FsbFJlc29sdmVyPjtcbiAgX3RyYW5zcG9ydDogVHJhbnNwb3J0O1xuICBfc3Vic2NyaXB0aW9uOiBJRGlzcG9zYWJsZTtcblxuICBjb25zdHJ1Y3Rvcih0cmFuc3BvcnQ6IFRyYW5zcG9ydCkge1xuICAgIHRoaXMuX2luZGV4ID0gMDtcbiAgICB0aGlzLl9pblByb2dyZXNzID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuX3RyYW5zcG9ydCA9IHRyYW5zcG9ydDtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb24gPSB0cmFuc3BvcnQub25NZXNzYWdlKCkuZG9Pbk5leHQobWVzc2FnZSA9PiB7XG4gICAgICB0aGlzLl9oYW5kbGVNZXNzYWdlKG1lc3NhZ2UpO1xuICAgIH0pLnN1YnNjcmliZSgpO1xuICB9XG5cbiAgY2FsbChhcmdzOiBBcnJheTxhbnk+KTogUHJvbWlzZTxzdHJpbmcgfCBPYmplY3Q+IHtcbiAgICB0aGlzLl9pbmRleCsrO1xuICAgIGNvbnN0IG1lc3NhZ2UgPSBjcmVhdGVDYWxsTWVzc2FnZSh0aGlzLl9pbmRleCwgYXJncyk7XG4gICAgY29uc3QgbWVzc2FnZVN0cmluZyA9IEpTT04uc3RyaW5naWZ5KG1lc3NhZ2UpO1xuICAgIGxvZ2dlci5kZWJ1ZyhgU2VuZGluZyBIYWNrIFJwYzogJHttZXNzYWdlU3RyaW5nfWApO1xuICAgIHRoaXMuX3RyYW5zcG9ydC5zZW5kTWVzc2FnZShtZXNzYWdlU3RyaW5nKTtcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICB0aGlzLl9pblByb2dyZXNzLnNldCh0aGlzLl9pbmRleCwge3Jlc29sdmUsIHJlamVjdH0pO1xuICAgIH0pO1xuICB9XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICB9XG5cbiAgX2hhbmRsZU1lc3NhZ2UobWVzc2FnZVN0cmluZzogc3RyaW5nKTogdm9pZCB7XG4gICAgLy8gbG9nZ2VyLmRlYnVnKGBSZWNlaXZlZCBIYWNrIFJwYyByZXNwb25zZTogJHttZXNzYWdlU3RyaW5nfWApO1xuICAgIGxldCBtZXNzYWdlT2JqZWN0O1xuICAgIHRyeSB7XG4gICAgICBtZXNzYWdlT2JqZWN0ID0gSlNPTi5wYXJzZShtZXNzYWdlU3RyaW5nKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBsb2dnZXIuZGVidWcoYEVycm9yOiBQYXJzaW5nIGhhY2sgUnBjIG1lc3NhZ2UuYCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCFpc1ZhbGlkUmVzcG9uc2VNZXNzYWdlKG1lc3NhZ2VPYmplY3QpKSB7XG4gICAgICBsb2dnZXIuZGVidWcoYEVycm9yOiBSZWNlaXZlZCBpbnZhbGlkIEhhY2sgUnBjIHJlc3BvbnNlLmApO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCByZXNwb25zZTogUmVzcG9uc2VNZXNzYWdlID0gbWVzc2FnZU9iamVjdDtcbiAgICBjb25zdCB7aWQsIHJlc3VsdCwgZXJyb3J9ID0gcmVzcG9uc2U7XG5cbiAgICBjb25zdCBpblByb2dyZXNzID0gdGhpcy5faW5Qcm9ncmVzcy5nZXQoaWQpO1xuICAgIGlmIChpblByb2dyZXNzID09IG51bGwpIHtcbiAgICAgIGxvZ2dlci5kZWJ1ZyhgRXJyb3I6IFJlY2VpdmVkIEhhY2sgUnBjIHJlc3BvbnNlIHdpdGggaW52YWxpZCBpbmRleC5gKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCB7cmVzb2x2ZSwgcmVqZWN0fSA9IGluUHJvZ3Jlc3M7XG4gICAgdGhpcy5faW5Qcm9ncmVzcy5kZWxldGUoaWQpO1xuICAgIGlmIChyZXN1bHQgIT0gbnVsbCkge1xuICAgICAgbG9nZ2VyLmRlYnVnKGBSZXR1cm5pbmcgJHtKU09OLnN0cmluZ2lmeShyZXN1bHQpfSBmcm9tIEhhY2sgUlBDICR7aWR9YCk7XG4gICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgICByZXR1cm47XG4gICAgfSBlbHNlIHtcbiAgICAgIGludmFyaWFudChlcnJvciAhPSBudWxsKTtcbiAgICAgIGxvZ2dlci5kZWJ1ZyhgRXJyb3IgJHtKU09OLnN0cmluZ2lmeShlcnJvcil9IGZyb20gSGFjayBSUEMgJHtpZH1gKTtcbiAgICAgIHJlamVjdChuZXcgRXJyb3IoSlNPTi5zdHJpbmdpZnkoZXJyb3IpKSk7XG4gICAgfVxuICB9XG59XG4iXX0=