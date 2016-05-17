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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _nuclideCommons2;

function _nuclideCommons() {
  return _nuclideCommons2 = require('../../nuclide-commons');
}

var logger = require('../../nuclide-logging').getLogger();

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

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
    this._messages = (0, (_nuclideCommons2 || _nuclideCommons()).splitStream)((0, (_nuclideCommons2 || _nuclideCommons()).observeStream)(input));
  }

  _createClass(StreamTransport, [{
    key: 'sendMessage',
    value: function sendMessage(message) {
      (0, (_assert2 || _assert()).default)(message.indexOf('\n') === -1);
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
    this._subscription = transport.onMessage().do(function (message) {
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
      this._subscription.unsubscribe();
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

      this._inProgress.delete(id);
      if (result != null) {
        logger.debug('Returning ' + JSON.stringify(result) + ' from Hack RPC ' + id);
        resolve(result);
        return;
      } else {
        (0, (_assert2 || _assert()).default)(error != null);
        logger.debug('Error ' + JSON.stringify(error) + ' from Hack RPC ' + id);
        reject(new Error(JSON.stringify(error)));
      }
    }
  }]);

  return HackRpc;
})();

exports.HackRpc = HackRpc;