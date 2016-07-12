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
    _classCallCheck(this, StreamTransport);

    this._output = output;
    this._messages = (0, (_commonsNodeStream2 || _commonsNodeStream()).splitStream)((0, (_commonsNodeStream2 || _commonsNodeStream()).observeStream)(input));
  }

  _createClass(StreamTransport, [{
    key: 'send',
    value: function send(message) {
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