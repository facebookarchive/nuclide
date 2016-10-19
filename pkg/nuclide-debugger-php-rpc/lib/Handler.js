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

var _utils;

function _load_utils() {
  return _utils = _interopRequireDefault(require('./utils'));
}

var _ClientCallback;

function _load_ClientCallback() {
  return _ClientCallback = require('./ClientCallback');
}

var Handler = (function () {
  function Handler(domain, clientCallback) {
    _classCallCheck(this, Handler);

    this._domain = domain;
    this._clientCallback = clientCallback;
  }

  _createClass(Handler, [{
    key: 'getDomain',
    value: function getDomain() {
      return this._domain;
    }
  }, {
    key: 'handleMethod',
    value: function handleMethod(id, method, params) {
      throw new Error('absrtact');
    }
  }, {
    key: 'unknownMethod',
    value: function unknownMethod(id, method, params) {
      var message = 'Unknown chrome dev tools method: ' + this.getDomain() + '.' + method;
      (_utils || _load_utils()).default.log(message);
      this.replyWithError(id, message);
    }
  }, {
    key: 'replyWithError',
    value: function replyWithError(id, error) {
      this._clientCallback.replyWithError(id, error);
    }
  }, {
    key: 'replyToCommand',
    value: function replyToCommand(id, result, error) {
      this._clientCallback.replyToCommand(id, result, error);
    }
  }, {
    key: 'sendMethod',
    value: function sendMethod(method, params) {
      this._clientCallback.sendMethod(this._clientCallback.getServerMessageObservable(), method, params);
    }
  }, {
    key: 'sendUserMessage',
    value: function sendUserMessage(type, message) {
      this._clientCallback.sendUserMessage(type, message);
    }
  }]);

  return Handler;
})();

module.exports = Handler;