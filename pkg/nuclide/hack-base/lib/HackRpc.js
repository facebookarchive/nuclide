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

var _commons = require('../../commons');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var logger = require('../../logging').getLogger();

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
    this._messages = (0, _commons.splitStream)((0, _commons.observeStream)(input));
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
      logger.debug('Received Hack Rpc response: ' + messageString);
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
        reject(error);
      }
    }
  }]);

  return HackRpc;
})();

exports.HackRpc = HackRpc;
//# sourceMappingURL=data:application/json;base64,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QTdCLE9BQU87VUFBRSxNQUFNLEdBQUksVUFBVSxDQUFwQixNQUFNOztBQUN0QixVQUFJLENBQUMsV0FBVyxVQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDNUIsVUFBSSxNQUFNLElBQUksSUFBSSxFQUFFO0FBQ2xCLGNBQU0sQ0FBQyxLQUFLLGdCQUFjLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLHVCQUFrQixFQUFFLENBQUcsQ0FBQztBQUN4RSxlQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDaEIsZUFBTztPQUNSLE1BQU07QUFDTCxpQ0FBVSxLQUFLLElBQUksSUFBSSxDQUFDLENBQUM7QUFDekIsY0FBTSxDQUFDLEtBQUssWUFBVSxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyx1QkFBa0IsRUFBRSxDQUFHLENBQUM7QUFDbkUsY0FBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO09BQ2Y7S0FDRjs7O1NBakVVLE9BQU8iLCJmaWxlIjoiSGFja1JwYy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtPYnNlcnZhYmxlfSBmcm9tICdyeCc7XG5pbXBvcnQge29ic2VydmVTdHJlYW0sIHNwbGl0U3RyZWFtfSBmcm9tICcuLi8uLi9jb21tb25zJztcbmNvbnN0IGxvZ2dlciA9IHJlcXVpcmUoJy4uLy4uL2xvZ2dpbmcnKS5nZXRMb2dnZXIoKTtcbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcblxuY29uc3QgQ0FMTF9NRVNTQUdFX1RZUEUgPSAnY2FsbCc7XG5jb25zdCBSRVNQT05TRV9NRVNTQUdFX1RZUEUgPSAncmVzcG9uc2UnO1xuXG50eXBlIENhbGxNZXNzYWdlID0ge1xuICB0eXBlOiAnY2FsbCc7XG4gIGlkOiBudW1iZXI7XG4gIGFyZ3M6IGFueTsgLy8gVHlwaWNhbGx5IEFycmF5PHN0cmluZyB8IE9iamVjdD5cbn1cblxudHlwZSBSZXNwb25zZUVycm9yID0ge1xuICBjb2RlPzogbnVtYmVyO1xuICBtZXNzYWdlOiBzdHJpbmc7XG59O1xuXG50eXBlIFJlc3BvbnNlTWVzc2FnZSA9IHtcbiAgdHlwZTogJ3Jlc3BvbnNlJztcbiAgaWQ6IG51bWJlcjtcbiAgcmVzdWx0PzogYW55O1xuICBlcnJvcj86IFJlc3BvbnNlRXJyb3I7XG59O1xuXG50eXBlIENhbGxSZXNvbHZlciA9IHtcbiAgcmVzb2x2ZTogKHJlc3VsdDogc3RyaW5nIHwgT2JqZWN0KSA9PiB2b2lkO1xuICByZWplY3Q6IChtZXNzYWdlOiBhbnkpID0+IHZvaWQ7XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQ2FsbE1lc3NhZ2UoaWQ6IG51bWJlciwgYXJnczogYW55KTogQ2FsbE1lc3NhZ2Uge1xuICByZXR1cm4ge1xuICAgIHR5cGU6IENBTExfTUVTU0FHRV9UWVBFLFxuICAgIGlkLFxuICAgIGFyZ3MsXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTdWNjZXNzUmVzcG9uc2VNZXNzYWdlKGlkOiBudW1iZXIsIHJlc3VsdDogYW55KTogUmVzcG9uc2VNZXNzYWdlIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBSRVNQT05TRV9NRVNTQUdFX1RZUEUsXG4gICAgaWQsXG4gICAgcmVzdWx0LFxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRXJyb3JSZXBvbnNlTWVzc2FnZShpZDogbnVtYmVyLCBlcnJvcjogUmVzcG9uc2VFcnJvcik6IFJlc3BvbnNlTWVzc2FnZSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogUkVTUE9OU0VfTUVTU0FHRV9UWVBFLFxuICAgIGlkLFxuICAgIGVycm9yLFxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNWYWxpZFJlc3BvbnNlTWVzc2FnZShvYmo6IGFueSk6IGJvb2xlYW4ge1xuICByZXR1cm4gb2JqLnR5cGUgPT09IFJFU1BPTlNFX01FU1NBR0VfVFlQRVxuICAgICYmIHR5cGVvZiBvYmouaWQgPT09ICdudW1iZXInXG4gICAgJiYgKChvYmoucmVzdWx0ID09IG51bGwpICE9PSAob2JqLmVycm9yID09IG51bGwpKTtcbn1cblxuaW50ZXJmYWNlIFRyYW5zcG9ydCB7XG4gIHNlbmRNZXNzYWdlKG1lc3NhZ2U6IHN0cmluZyk6IHZvaWQ7XG4gIG9uTWVzc2FnZSgpOiBPYnNlcnZhYmxlPHN0cmluZz47XG59XG5cbmV4cG9ydCBjbGFzcyBTdHJlYW1UcmFuc3BvcnQge1xuICBfb3V0cHV0OiBzdHJlYW0kV3JpdGFibGU7XG4gIF9tZXNzYWdlczogT2JzZXJ2YWJsZTxzdHJpbmc+O1xuXG4gIGNvbnN0cnVjdG9yKG91dHB1dDogc3RyZWFtJFdyaXRhYmxlLCBpbnB1dDogc3RyZWFtJFJlYWRhYmxlKSB7XG4gICAgdGhpcy5fb3V0cHV0ID0gb3V0cHV0O1xuICAgIHRoaXMuX21lc3NhZ2VzID0gc3BsaXRTdHJlYW0ob2JzZXJ2ZVN0cmVhbShpbnB1dCkpO1xuICB9XG4gIHNlbmRNZXNzYWdlKG1lc3NhZ2U6IHN0cmluZyk6IHZvaWQge1xuICAgIGludmFyaWFudChtZXNzYWdlLmluZGV4T2YoJ1xcbicpID09PSAtMSk7XG4gICAgdGhpcy5fb3V0cHV0LndyaXRlKG1lc3NhZ2UgKyAnXFxuJyk7XG4gIH1cbiAgb25NZXNzYWdlKCk6IE9ic2VydmFibGU8c3RyaW5nPiB7XG4gICAgcmV0dXJuIHRoaXMuX21lc3NhZ2VzO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBIYWNrUnBjIHtcbiAgX2luZGV4OiBudW1iZXI7XG4gIF9pblByb2dyZXNzOiBNYXA8bnVtYmVyLCBDYWxsUmVzb2x2ZXI+O1xuICBfdHJhbnNwb3J0OiBUcmFuc3BvcnQ7XG4gIF9zdWJzY3JpcHRpb246IElEaXNwb3NhYmxlO1xuXG4gIGNvbnN0cnVjdG9yKHRyYW5zcG9ydDogVHJhbnNwb3J0KSB7XG4gICAgdGhpcy5faW5kZXggPSAwO1xuICAgIHRoaXMuX2luUHJvZ3Jlc3MgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5fdHJhbnNwb3J0ID0gdHJhbnNwb3J0O1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbiA9IHRyYW5zcG9ydC5vbk1lc3NhZ2UoKS5kb09uTmV4dChtZXNzYWdlID0+IHtcbiAgICAgIHRoaXMuX2hhbmRsZU1lc3NhZ2UobWVzc2FnZSk7XG4gICAgfSkuc3Vic2NyaWJlKCk7XG4gIH1cblxuICBjYWxsKGFyZ3M6IEFycmF5PHN0cmluZz4pOiBQcm9taXNlPHN0cmluZyB8IE9iamVjdD4ge1xuICAgIHRoaXMuX2luZGV4Kys7XG4gICAgY29uc3QgbWVzc2FnZSA9IGNyZWF0ZUNhbGxNZXNzYWdlKHRoaXMuX2luZGV4LCBhcmdzKTtcbiAgICBjb25zdCBtZXNzYWdlU3RyaW5nID0gSlNPTi5zdHJpbmdpZnkobWVzc2FnZSk7XG4gICAgbG9nZ2VyLmRlYnVnKGBTZW5kaW5nIEhhY2sgUnBjOiAke21lc3NhZ2VTdHJpbmd9YCk7XG4gICAgdGhpcy5fdHJhbnNwb3J0LnNlbmRNZXNzYWdlKG1lc3NhZ2VTdHJpbmcpO1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHRoaXMuX2luUHJvZ3Jlc3Muc2V0KHRoaXMuX2luZGV4LCB7cmVzb2x2ZSwgcmVqZWN0fSk7XG4gICAgfSk7XG4gIH1cblxuICBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gIH1cblxuICBfaGFuZGxlTWVzc2FnZShtZXNzYWdlU3RyaW5nOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBsb2dnZXIuZGVidWcoYFJlY2VpdmVkIEhhY2sgUnBjIHJlc3BvbnNlOiAke21lc3NhZ2VTdHJpbmd9YCk7XG4gICAgbGV0IG1lc3NhZ2VPYmplY3Q7XG4gICAgdHJ5IHtcbiAgICAgIG1lc3NhZ2VPYmplY3QgPSBKU09OLnBhcnNlKG1lc3NhZ2VTdHJpbmcpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGxvZ2dlci5kZWJ1ZyhgRXJyb3I6IFBhcnNpbmcgaGFjayBScGMgbWVzc2FnZS5gKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoIWlzVmFsaWRSZXNwb25zZU1lc3NhZ2UobWVzc2FnZU9iamVjdCkpIHtcbiAgICAgIGxvZ2dlci5kZWJ1ZyhgRXJyb3I6IFJlY2VpdmVkIGludmFsaWQgSGFjayBScGMgcmVzcG9uc2UuYCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHJlc3BvbnNlOiBSZXNwb25zZU1lc3NhZ2UgPSBtZXNzYWdlT2JqZWN0O1xuICAgIGNvbnN0IHtpZCwgcmVzdWx0LCBlcnJvcn0gPSByZXNwb25zZTtcblxuICAgIGNvbnN0IGluUHJvZ3Jlc3MgPSB0aGlzLl9pblByb2dyZXNzLmdldChpZCk7XG4gICAgaWYgKGluUHJvZ3Jlc3MgPT0gbnVsbCkge1xuICAgICAgbG9nZ2VyLmRlYnVnKGBFcnJvcjogUmVjZWl2ZWQgSGFjayBScGMgcmVzcG9uc2Ugd2l0aCBpbnZhbGlkIGluZGV4LmApO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHtyZXNvbHZlLCByZWplY3R9ID0gaW5Qcm9ncmVzcztcbiAgICB0aGlzLl9pblByb2dyZXNzLmRlbGV0ZShpZCk7XG4gICAgaWYgKHJlc3VsdCAhPSBudWxsKSB7XG4gICAgICBsb2dnZXIuZGVidWcoYFJldHVybmluZyAke0pTT04uc3RyaW5naWZ5KHJlc3VsdCl9IGZyb20gSGFjayBSUEMgJHtpZH1gKTtcbiAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICAgIHJldHVybjtcbiAgICB9IGVsc2Uge1xuICAgICAgaW52YXJpYW50KGVycm9yICE9IG51bGwpO1xuICAgICAgbG9nZ2VyLmRlYnVnKGBFcnJvciAke0pTT04uc3RyaW5naWZ5KGVycm9yKX0gZnJvbSBIYWNrIFJQQyAke2lkfWApO1xuICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==