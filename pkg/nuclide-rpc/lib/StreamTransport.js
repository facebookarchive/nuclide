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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _commonsNodeObservable;

function _load_commonsNodeObservable() {
  return _commonsNodeObservable = require('../../commons-node/observable');
}

var _commonsNodeStream;

function _load_commonsNodeStream() {
  return _commonsNodeStream = require('../../commons-node/stream');
}

var _assert;

function _load_assert() {
  return _assert = _interopRequireDefault(require('assert'));
}

var StreamTransport = (function () {
  function StreamTransport(output, input) {
    var _this = this;

    var messageLogger = arguments.length <= 2 || arguments[2] === undefined ? function (direction, message) {
      return;
    } : arguments[2];

    _classCallCheck(this, StreamTransport);

    this._isClosed = false;
    this._messageLogger = messageLogger;
    this._output = output;
    this._messages = (0, (_commonsNodeObservable || _load_commonsNodeObservable()).splitStream)((0, (_commonsNodeStream || _load_commonsNodeStream()).observeStream)(input)).do(function (message) {
      _this._messageLogger('receive', message);
    });
  }

  _createClass(StreamTransport, [{
    key: 'send',
    value: function send(message) {
      this._messageLogger('send', message);
      (0, (_assert || _load_assert()).default)(message.indexOf('\n') === -1, 'StreamTransport.send - unexpected newline in JSON message');
      this._output.write(message + '\n');
    }
  }, {
    key: 'onMessage',
    value: function onMessage() {
      return this._messages;
    }
  }, {
    key: 'close',
    value: function close() {
      this._isClosed = true;
    }
  }, {
    key: 'isClosed',
    value: function isClosed() {
      return this._isClosed;
    }
  }]);

  return StreamTransport;
})();

exports.StreamTransport = StreamTransport;