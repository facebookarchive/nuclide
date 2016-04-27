Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _utils = require('./utils');

var _utils2 = _interopRequireDefault(_utils);

var _rxjs = require('rxjs');

function createMessage(method, params) {
  var result = { method: method };
  if (params) {
    result.params = params;
  }
  return result;
}

/**
 * This class provides a central callback channel to communicate with debugger client.
 * Currently it provides four callback channels:
 * 1. Chrome server messages.
 * 2. Atom UI notification.
 * 3. Chrome console user messages.
 * 4. Output window messages.
 */

var ClientCallback = (function () {
  // For output window messages.

  function ClientCallback() {
    _classCallCheck(this, ClientCallback);

    this._serverMessageObservable = new _rxjs.Subject();
    this._notificationObservable = new _rxjs.Subject();
    this._outputWindowObservable = new _rxjs.Subject();
  }

  _createClass(ClientCallback, [{
    key: 'getNotificationObservable',
    value: function getNotificationObservable() {
      return this._notificationObservable;
    }
  }, {
    key: 'getServerMessageObservable',
    value: function getServerMessageObservable() {
      return this._serverMessageObservable;
    }
  }, {
    key: 'getOutputWindowObservable',
    value: function getOutputWindowObservable() {
      return this._outputWindowObservable;
    }
  }, {
    key: 'sendUserMessage',
    value: function sendUserMessage(type, message) {
      _utils2['default'].log('sendUserMessage(' + type + '): ' + JSON.stringify(message));
      switch (type) {
        case 'notification':
          this._notificationObservable.next({
            type: message.type,
            message: message.message
          });
          break;
        case 'console':
          this.sendMethod(this._serverMessageObservable, 'Console.messageAdded', {
            message: message
          });
          break;
        case 'outputWindow':
          this.sendMethod(this._outputWindowObservable, 'Console.messageAdded', {
            message: message
          });
          break;
        default:
          _utils2['default'].logError('Unknown UserMessageType: ' + type);
      }
    }
  }, {
    key: 'unknownMethod',
    value: function unknownMethod(id, domain, method, params) {
      var message = 'Unknown chrome dev tools method: ' + domain + '.' + method;
      _utils2['default'].log(message);
      this.replyWithError(id, message);
    }
  }, {
    key: 'replyWithError',
    value: function replyWithError(id, error) {
      this.replyToCommand(id, {}, error);
    }
  }, {
    key: 'replyToCommand',
    value: function replyToCommand(id, result, error) {
      var value = { id: id, result: result };
      if (error) {
        value.error = error;
      }
      this._sendJsonObject(this._serverMessageObservable, value);
    }
  }, {
    key: 'sendMethod',
    value: function sendMethod(observable, method, params) {
      this._sendJsonObject(observable, createMessage(method, params));
    }
  }, {
    key: '_sendJsonObject',
    value: function _sendJsonObject(observable, value) {
      var message = JSON.stringify(value);
      _utils2['default'].log('Sending JSON: ' + message);
      observable.next(message);
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      _utils2['default'].log('Called ClientCallback dispose method.');
      this._notificationObservable.complete();
      this._serverMessageObservable.complete();
      this._outputWindowObservable.complete();
    }
  }]);

  return ClientCallback;
})();

exports.ClientCallback = ClientCallback;
// For server messages.
// For atom UI notifications.