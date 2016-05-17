Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _ws2;

function _ws() {
  return _ws2 = _interopRequireDefault(require('ws'));
}

var EXECUTOR_PORT = 8081;
var WS_URL = 'ws://localhost:' + EXECUTOR_PORT + '/message?role=interface&name=Nuclide';

var ShellMessageManager = (function () {
  function ShellMessageManager() {
    _classCallCheck(this, ShellMessageManager);

    this._url = WS_URL;
  }

  _createClass(ShellMessageManager, [{
    key: 'send',
    value: function send(message) {
      var _this = this;

      if (this._ws == null) {
        (function () {
          // Currently, use cases only require a simple fire-and-forget interaction
          var ws = new (_ws2 || _ws()).default(_this._url);
          _this._ws = ws;
          ws.onopen = function () {
            ws.send(JSON.stringify(message));
            ws.close();
          };
          ws.onerror = function () {
            atom.notifications.addWarning('Error connecting to React Native shell.');
          };
          ws.onclose = function () {
            _this._ws = null;
          };
        })();
      }
    }
  }]);

  return ShellMessageManager;
})();

exports.ShellMessageManager = ShellMessageManager;