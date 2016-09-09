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

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _rxjsBundlesRxUmdMinJs2;

function _rxjsBundlesRxUmdMinJs() {
  return _rxjsBundlesRxUmdMinJs2 = require('rxjs/bundles/Rx.umd.min.js');
}

var _nuclideLogging2;

function _nuclideLogging() {
  return _nuclideLogging2 = require('../../nuclide-logging');
}

var logger = (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)();

var _eventKit2;

function _eventKit() {
  return _eventKit2 = require('event-kit');
}

// An unreliable transport for sending JSON formatted messages
//
// onClose handlers are guaranteed to be called exactly once.
// onMessage handlers are guaranteed to not be called after onClose has been called.
// send(data) yields false if the message failed to send, true on success.
// onClose handlers will be called before close() returns.
// May not call send() after transport has closed..

// Adapter to make an UnreliableTransport a reliable Transport
// by queuing messages.
//
// Conforms to the RPC Framework's Transport type.
//
// Must be constructed with an open(not closed) transport.
// Can be in one of 3 states: open, disconnected, or closed.
// The transport starts in open state. When the current transport closes,
// goes to disconnected state.
// While disconnected, reconnect can be called to return to the open state.
// close() closes the underlying transport and transitions to closed state.
// Once closed, reconnect may not be called and no other events will be emitted.

var QueuedTransport = (function () {
  function QueuedTransport(clientId, transport) {
    _classCallCheck(this, QueuedTransport);

    this.id = clientId;
    this._isClosed = false;
    this._transport = null;
    this._messageQueue = [];
    this._messages = new (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Subject();
    this._emitter = new (_eventKit2 || _eventKit()).Emitter();

    if (transport != null) {
      this._connect(transport);
    }
  }

  _createClass(QueuedTransport, [{
    key: 'getState',
    value: function getState() {
      return this._isClosed ? 'closed' : this._transport == null ? 'disconnected' : 'open';
    }
  }, {
    key: '_connect',
    value: function _connect(transport) {
      var _this = this;

      (0, (_assert2 || _assert()).default)(!transport.isClosed());
      logger.info('Client #%s connecting with a new socket!', this.id);
      (0, (_assert2 || _assert()).default)(this._transport == null);
      this._transport = transport;
      transport.onMessage().subscribe(function (message) {
        return _this._messages.next(message);
      });
      transport.onClose(function () {
        return _this._onClose(transport);
      });
    }
  }, {
    key: '_onMessage',
    value: function _onMessage(transport, message) {
      if (this._isClosed) {
        logger.error('Received socket message after connection closed', new Error());
        return;
      }
      if (this._transport !== transport) {
        // This shouldn't happen, but ...
        logger.error('Received message after transport closed', new Error());
      }

      this._emitter.emit('message', message);
    }
  }, {
    key: '_onClose',
    value: function _onClose(transport) {
      (0, (_assert2 || _assert()).default)(transport.isClosed());

      if (this._isClosed) {
        // This happens when close() is called and we have an open transport.
        return;
      }
      if (transport !== this._transport) {
        // This should not happen...
        logger.error('Orphaned transport closed', new Error());
        return;
      }

      this._transport = null;
      this._emitter.emit('disconnect', transport);
    }

    // Reconnecting, when in an open state will cause a disconnect event.
  }, {
    key: 'reconnect',
    value: function reconnect(transport) {
      var _this2 = this;

      (0, (_assert2 || _assert()).default)(!transport.isClosed());
      (0, (_assert2 || _assert()).default)(!this._isClosed);

      if (this._transport != null) {
        // This will cause a disconnect event...
        this._transport.close();
      }
      (0, (_assert2 || _assert()).default)(this._transport == null);

      this._connect(transport);

      // Attempt to resend queued messages
      var queuedMessages = this._messageQueue;
      this._messageQueue = [];
      queuedMessages.forEach(function (message) {
        return _this2.send(message);
      });
    }
  }, {
    key: 'disconnect',
    value: function disconnect() {
      (0, (_assert2 || _assert()).default)(!this._isClosed);
      this._disconnect();
    }
  }, {
    key: '_disconnect',
    value: function _disconnect() {
      var transport = this._transport;
      if (transport != null) {
        transport.close();
      }
    }
  }, {
    key: 'onMessage',
    value: function onMessage() {
      return this._messages;
    }
  }, {
    key: 'onDisconnect',
    value: function onDisconnect(callback) {
      return this._emitter.on('disconnect', callback);
    }
  }, {
    key: 'send',
    value: function send(message) {
      this._send(message);
    }
  }, {
    key: '_send',
    value: _asyncToGenerator(function* (message) {
      (0, (_assert2 || _assert()).default)(!this._isClosed, 'Attempt to send socket message after connection closed');

      this._messageQueue.push(message);
      if (this._transport == null) {
        return;
      }

      var sent = yield this._transport.send(message);
      if (!sent) {
        logger.warn('Failed sending socket message to client:', this.id, JSON.parse(message));
      } else {
        // This may remove a different (but equivalent) message from the Q,
        // but that's ok because we don't guarantee message ordering.
        var messageIndex = this._messageQueue.indexOf(message);
        if (messageIndex !== -1) {
          this._messageQueue.splice(messageIndex, 1);
        }
      }
    })
  }, {
    key: 'close',
    value: function close() {
      this._disconnect();
      if (!this._isClosed) {
        this._isClosed = true;
      }
    }
  }]);

  return QueuedTransport;
})();

exports.QueuedTransport = QueuedTransport;