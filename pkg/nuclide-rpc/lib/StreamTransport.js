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

var _commonsNodeObservable2;

function _commonsNodeObservable() {
  return _commonsNodeObservable2 = require('../../commons-node/observable');
}

var _commonsNodeStream2;

function _commonsNodeStream() {
  return _commonsNodeStream2 = require('../../commons-node/stream');
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var StreamTransport = (function () {
  function StreamTransport(output, input) {
    var _this = this;

    var messageLogger = arguments.length <= 2 || arguments[2] === undefined ? function (direction, message) {
      return;
    } : arguments[2];

    _classCallCheck(this, StreamTransport);

    this._messageLogger = messageLogger;
    this._output = output;
    this._messages = (0, (_commonsNodeObservable2 || _commonsNodeObservable()).splitStream)((0, (_commonsNodeStream2 || _commonsNodeStream()).observeStream)(input)).do(function (message) {
      _this._messageLogger('receive', message);
    });
  }

  _createClass(StreamTransport, [{
    key: 'send',
    value: function send(message) {
      this._messageLogger('send', message);
      (0, (_assert2 || _assert()).default)(message.indexOf('\n') === -1, 'StreamTransport.send - unexpected newline in JSON message');
      this._output.write(message + '\n');
    }
  }, {
    key: 'onMessage',
    value: function onMessage() {
      return this._messages;
    }
  }, {
    key: 'close',
    value: function close() {}
  }]);

  return StreamTransport;
})();

exports.StreamTransport = StreamTransport;