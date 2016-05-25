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
exports.isValidResponseMessage = isValidResponseMessage;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _stream2;

function _stream() {
  return _stream2 = require('./stream');
}

var _nuclideLogging2;

function _nuclideLogging() {
  return _nuclideLogging2 = require('../nuclide-logging');
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var logger = (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)();

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

function isValidResponseMessage(obj) {
  return obj.type === RESPONSE_MESSAGE_TYPE && typeof obj.id === 'number' && obj.result == null !== (obj.error == null);
}

var StreamTransport = (function () {
  function StreamTransport(output, input) {
    _classCallCheck(this, StreamTransport);

    this._output = output;
    this._messages = (0, (_stream2 || _stream()).splitStream)((0, (_stream2 || _stream()).observeStream)(input));
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

var Rpc = (function () {
  function Rpc(name, transport) {
    var _this = this;

    _classCallCheck(this, Rpc);

    this._name = name;
    this._disposed = false;
    this._index = 0;
    this._inProgress = new Map();
    this._transport = transport;
    this._subscription = transport.onMessage().do(function (message) {
      _this._handleMessage(message);
    }).subscribe();
  }

  _createClass(Rpc, [{
    key: 'getName',
    value: function getName() {
      return this._name;
    }
  }, {
    key: 'call',
    value: function call(args) {
      var _this2 = this;

      (0, (_assert2 || _assert()).default)(!this._disposed, this._name + ' - called after dispose: ' + args);
      this._index++;
      var message = createCallMessage(this._index, args);
      var messageString = JSON.stringify(message);
      logger.debug(this._name + ' - Sending RPC: ' + messageString);
      this._transport.sendMessage(messageString);

      return new Promise(function (resolve, reject) {
        _this2._inProgress.set(_this2._index, { resolve: resolve, reject: reject });
      });
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._disposed = true;
      this._subscription.unsubscribe();
      this._clearInProgress();
    }
  }, {
    key: '_handleMessage',
    value: function _handleMessage(messageString) {
      (0, (_assert2 || _assert()).default)(!this._disposed, this._name + ' - received after dispose: ' + messageString);
      var messageObject = undefined;
      try {
        messageObject = JSON.parse(messageString);
      } catch (e) {
        logger.debug(this._name + ' - error: parsing RPC message.');
        return;
      }

      if (!isValidResponseMessage(messageObject)) {
        logger.debug(this._name + ' - error: received invalid RPC response.');
        return;
      }
      var response = messageObject;
      var id = response.id;
      var result = response.result;
      var error = response.error;

      var inProgress = this._inProgress.get(id);
      if (inProgress == null) {
        logger.debug(this._name + ' - error: received RPC response with invalid index.');
        return;
      }

      var resolve = inProgress.resolve;
      var reject = inProgress.reject;

      this._inProgress.delete(id);
      if (error != null) {
        // Stringify the error only if it's not already a string, to avoid extra
        // double quotes around strings.
        var errStr = typeof error === 'string' ? error : JSON.stringify(error);
        logger.debug(this._name + ' - error from RPC ' + id + ': ' + errStr);
        reject(new Error(errStr));
      } else {
        logger.debug(this._name + ' - returning ' + JSON.stringify(result) + ' from RPC ' + id);
        (0, (_assert2 || _assert()).default)(result, this._name + ' - neither result or error received in response');
        resolve(result);
      }
    }
  }, {
    key: '_clearInProgress',
    value: function _clearInProgress() {
      this._inProgress.forEach(function (_ref) {
        var resolve = _ref.resolve;
        var reject = _ref.reject;

        var err = new Error('Server exited.');
        reject(err);
      });
      this._inProgress.clear();
    }
  }]);

  return Rpc;
})();

exports.Rpc = Rpc;