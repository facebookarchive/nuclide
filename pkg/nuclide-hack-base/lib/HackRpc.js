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
//# sourceMappingURL=data:application/json;base64,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VSxDQUE3QixPQUFPO1VBQUUsTUFBTSxHQUFJLFVBQVUsQ0FBcEIsTUFBTTs7QUFDdEIsVUFBSSxDQUFDLFdBQVcsVUFBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQzVCLFVBQUksTUFBTSxJQUFJLElBQUksRUFBRTtBQUNsQixjQUFNLENBQUMsS0FBSyxnQkFBYyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyx1QkFBa0IsRUFBRSxDQUFHLENBQUM7QUFDeEUsZUFBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ2hCLGVBQU87T0FDUixNQUFNO0FBQ0wsaUNBQVUsS0FBSyxJQUFJLElBQUksQ0FBQyxDQUFDO0FBQ3pCLGNBQU0sQ0FBQyxLQUFLLFlBQVUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsdUJBQWtCLEVBQUUsQ0FBRyxDQUFDO0FBQ25FLGNBQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztPQUNmO0tBQ0Y7OztTQWpFVSxPQUFPIiwiZmlsZSI6IkhhY2tScGMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7T2JzZXJ2YWJsZX0gZnJvbSAncngnO1xuaW1wb3J0IHtvYnNlcnZlU3RyZWFtLCBzcGxpdFN0cmVhbX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1jb21tb25zJztcbmNvbnN0IGxvZ2dlciA9IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtbG9nZ2luZycpLmdldExvZ2dlcigpO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuXG5jb25zdCBDQUxMX01FU1NBR0VfVFlQRSA9ICdjYWxsJztcbmNvbnN0IFJFU1BPTlNFX01FU1NBR0VfVFlQRSA9ICdyZXNwb25zZSc7XG5cbnR5cGUgQ2FsbE1lc3NhZ2UgPSB7XG4gIHR5cGU6ICdjYWxsJztcbiAgaWQ6IG51bWJlcjtcbiAgYXJnczogYW55OyAvLyBUeXBpY2FsbHkgQXJyYXk8c3RyaW5nIHwgT2JqZWN0PlxufVxuXG50eXBlIFJlc3BvbnNlRXJyb3IgPSB7XG4gIGNvZGU/OiBudW1iZXI7XG4gIG1lc3NhZ2U6IHN0cmluZztcbn07XG5cbnR5cGUgUmVzcG9uc2VNZXNzYWdlID0ge1xuICB0eXBlOiAncmVzcG9uc2UnO1xuICBpZDogbnVtYmVyO1xuICByZXN1bHQ/OiBhbnk7XG4gIGVycm9yPzogUmVzcG9uc2VFcnJvcjtcbn07XG5cbnR5cGUgQ2FsbFJlc29sdmVyID0ge1xuICByZXNvbHZlOiAocmVzdWx0OiBzdHJpbmcgfCBPYmplY3QpID0+IHZvaWQ7XG4gIHJlamVjdDogKG1lc3NhZ2U6IGFueSkgPT4gdm9pZDtcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVDYWxsTWVzc2FnZShpZDogbnVtYmVyLCBhcmdzOiBhbnkpOiBDYWxsTWVzc2FnZSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogQ0FMTF9NRVNTQUdFX1RZUEUsXG4gICAgaWQsXG4gICAgYXJncyxcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVN1Y2Nlc3NSZXNwb25zZU1lc3NhZ2UoaWQ6IG51bWJlciwgcmVzdWx0OiBhbnkpOiBSZXNwb25zZU1lc3NhZ2Uge1xuICByZXR1cm4ge1xuICAgIHR5cGU6IFJFU1BPTlNFX01FU1NBR0VfVFlQRSxcbiAgICBpZCxcbiAgICByZXN1bHQsXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVFcnJvclJlcG9uc2VNZXNzYWdlKGlkOiBudW1iZXIsIGVycm9yOiBSZXNwb25zZUVycm9yKTogUmVzcG9uc2VNZXNzYWdlIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBSRVNQT05TRV9NRVNTQUdFX1RZUEUsXG4gICAgaWQsXG4gICAgZXJyb3IsXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1ZhbGlkUmVzcG9uc2VNZXNzYWdlKG9iajogYW55KTogYm9vbGVhbiB7XG4gIHJldHVybiBvYmoudHlwZSA9PT0gUkVTUE9OU0VfTUVTU0FHRV9UWVBFXG4gICAgJiYgdHlwZW9mIG9iai5pZCA9PT0gJ251bWJlcidcbiAgICAmJiAoKG9iai5yZXN1bHQgPT0gbnVsbCkgIT09IChvYmouZXJyb3IgPT0gbnVsbCkpO1xufVxuXG5pbnRlcmZhY2UgVHJhbnNwb3J0IHtcbiAgc2VuZE1lc3NhZ2UobWVzc2FnZTogc3RyaW5nKTogdm9pZDtcbiAgb25NZXNzYWdlKCk6IE9ic2VydmFibGU8c3RyaW5nPjtcbn1cblxuZXhwb3J0IGNsYXNzIFN0cmVhbVRyYW5zcG9ydCB7XG4gIF9vdXRwdXQ6IHN0cmVhbSRXcml0YWJsZTtcbiAgX21lc3NhZ2VzOiBPYnNlcnZhYmxlPHN0cmluZz47XG5cbiAgY29uc3RydWN0b3Iob3V0cHV0OiBzdHJlYW0kV3JpdGFibGUsIGlucHV0OiBzdHJlYW0kUmVhZGFibGUpIHtcbiAgICB0aGlzLl9vdXRwdXQgPSBvdXRwdXQ7XG4gICAgdGhpcy5fbWVzc2FnZXMgPSBzcGxpdFN0cmVhbShvYnNlcnZlU3RyZWFtKGlucHV0KSk7XG4gIH1cbiAgc2VuZE1lc3NhZ2UobWVzc2FnZTogc3RyaW5nKTogdm9pZCB7XG4gICAgaW52YXJpYW50KG1lc3NhZ2UuaW5kZXhPZignXFxuJykgPT09IC0xKTtcbiAgICB0aGlzLl9vdXRwdXQud3JpdGUobWVzc2FnZSArICdcXG4nKTtcbiAgfVxuICBvbk1lc3NhZ2UoKTogT2JzZXJ2YWJsZTxzdHJpbmc+IHtcbiAgICByZXR1cm4gdGhpcy5fbWVzc2FnZXM7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEhhY2tScGMge1xuICBfaW5kZXg6IG51bWJlcjtcbiAgX2luUHJvZ3Jlc3M6IE1hcDxudW1iZXIsIENhbGxSZXNvbHZlcj47XG4gIF90cmFuc3BvcnQ6IFRyYW5zcG9ydDtcbiAgX3N1YnNjcmlwdGlvbjogSURpc3Bvc2FibGU7XG5cbiAgY29uc3RydWN0b3IodHJhbnNwb3J0OiBUcmFuc3BvcnQpIHtcbiAgICB0aGlzLl9pbmRleCA9IDA7XG4gICAgdGhpcy5faW5Qcm9ncmVzcyA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLl90cmFuc3BvcnQgPSB0cmFuc3BvcnQ7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9uID0gdHJhbnNwb3J0Lm9uTWVzc2FnZSgpLmRvT25OZXh0KG1lc3NhZ2UgPT4ge1xuICAgICAgdGhpcy5faGFuZGxlTWVzc2FnZShtZXNzYWdlKTtcbiAgICB9KS5zdWJzY3JpYmUoKTtcbiAgfVxuXG4gIGNhbGwoYXJnczogQXJyYXk8c3RyaW5nPik6IFByb21pc2U8c3RyaW5nIHwgT2JqZWN0PiB7XG4gICAgdGhpcy5faW5kZXgrKztcbiAgICBjb25zdCBtZXNzYWdlID0gY3JlYXRlQ2FsbE1lc3NhZ2UodGhpcy5faW5kZXgsIGFyZ3MpO1xuICAgIGNvbnN0IG1lc3NhZ2VTdHJpbmcgPSBKU09OLnN0cmluZ2lmeShtZXNzYWdlKTtcbiAgICBsb2dnZXIuZGVidWcoYFNlbmRpbmcgSGFjayBScGM6ICR7bWVzc2FnZVN0cmluZ31gKTtcbiAgICB0aGlzLl90cmFuc3BvcnQuc2VuZE1lc3NhZ2UobWVzc2FnZVN0cmluZyk7XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdGhpcy5faW5Qcm9ncmVzcy5zZXQodGhpcy5faW5kZXgsIHtyZXNvbHZlLCByZWplY3R9KTtcbiAgICB9KTtcbiAgfVxuXG4gIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIF9oYW5kbGVNZXNzYWdlKG1lc3NhZ2VTdHJpbmc6IHN0cmluZyk6IHZvaWQge1xuICAgIGxvZ2dlci5kZWJ1ZyhgUmVjZWl2ZWQgSGFjayBScGMgcmVzcG9uc2U6ICR7bWVzc2FnZVN0cmluZ31gKTtcbiAgICBsZXQgbWVzc2FnZU9iamVjdDtcbiAgICB0cnkge1xuICAgICAgbWVzc2FnZU9iamVjdCA9IEpTT04ucGFyc2UobWVzc2FnZVN0cmluZyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgbG9nZ2VyLmRlYnVnKGBFcnJvcjogUGFyc2luZyBoYWNrIFJwYyBtZXNzYWdlLmApO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICghaXNWYWxpZFJlc3BvbnNlTWVzc2FnZShtZXNzYWdlT2JqZWN0KSkge1xuICAgICAgbG9nZ2VyLmRlYnVnKGBFcnJvcjogUmVjZWl2ZWQgaW52YWxpZCBIYWNrIFJwYyByZXNwb25zZS5gKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgcmVzcG9uc2U6IFJlc3BvbnNlTWVzc2FnZSA9IG1lc3NhZ2VPYmplY3Q7XG4gICAgY29uc3Qge2lkLCByZXN1bHQsIGVycm9yfSA9IHJlc3BvbnNlO1xuXG4gICAgY29uc3QgaW5Qcm9ncmVzcyA9IHRoaXMuX2luUHJvZ3Jlc3MuZ2V0KGlkKTtcbiAgICBpZiAoaW5Qcm9ncmVzcyA9PSBudWxsKSB7XG4gICAgICBsb2dnZXIuZGVidWcoYEVycm9yOiBSZWNlaXZlZCBIYWNrIFJwYyByZXNwb25zZSB3aXRoIGludmFsaWQgaW5kZXguYCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qge3Jlc29sdmUsIHJlamVjdH0gPSBpblByb2dyZXNzO1xuICAgIHRoaXMuX2luUHJvZ3Jlc3MuZGVsZXRlKGlkKTtcbiAgICBpZiAocmVzdWx0ICE9IG51bGwpIHtcbiAgICAgIGxvZ2dlci5kZWJ1ZyhgUmV0dXJuaW5nICR7SlNPTi5zdHJpbmdpZnkocmVzdWx0KX0gZnJvbSBIYWNrIFJQQyAke2lkfWApO1xuICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgcmV0dXJuO1xuICAgIH0gZWxzZSB7XG4gICAgICBpbnZhcmlhbnQoZXJyb3IgIT0gbnVsbCk7XG4gICAgICBsb2dnZXIuZGVidWcoYEVycm9yICR7SlNPTi5zdHJpbmdpZnkoZXJyb3IpfSBmcm9tIEhhY2sgUlBDICR7aWR9YCk7XG4gICAgICByZWplY3QoZXJyb3IpO1xuICAgIH1cbiAgfVxufVxuIl19