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

var _rxjsBundlesRxUmdMinJs2;

function _rxjsBundlesRxUmdMinJs() {
  return _rxjsBundlesRxUmdMinJs2 = require('rxjs/bundles/Rx.umd.min.js');
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var MessageStore = (function () {
  function MessageStore() {
    _classCallCheck(this, MessageStore);

    this._currentMessages = new Map();
    this._messageStream = new (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).BehaviorSubject([]);
  }

  _createClass(MessageStore, [{
    key: 'consumeProvider',
    value: function consumeProvider(provider) {
      var _this = this;

      var subscription = provider.messages.subscribe(function (message) {
        return _this._processUpdate(provider, message);
      });
      return new (_atom2 || _atom()).Disposable(function () {
        subscription.unsubscribe();
        _this._currentMessages.delete(provider);
        _this._publishMessages();
      });
    }
  }, {
    key: 'getMessageStream',
    value: function getMessageStream() {
      return this._messageStream;
    }
  }, {
    key: '_processUpdate',
    value: function _processUpdate(provider, message) {
      var idMap = this._currentMessages.get(provider);
      if (idMap == null) {
        idMap = new Map();
        this._currentMessages.set(provider, idMap);
      }
      if (message.status === 'busy') {
        idMap.set(message.id, message);
      } else {
        (0, (_assert2 || _assert()).default)(message.status === 'done');
        idMap.delete(message.id);
      }
      this._publishMessages();
    }
  }, {
    key: '_publishMessages',
    value: function _publishMessages() {
      var messages = [];
      for (var idMap of this._currentMessages.values()) {
        for (var message of idMap.values()) {
          messages.push(message);
        }
      }
      this._messageStream.next(messages);
    }
  }]);

  return MessageStore;
})();

exports.MessageStore = MessageStore;

// provider to id to messages.