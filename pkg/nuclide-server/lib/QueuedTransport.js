'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.QueuedTransport = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _eventKit;

function _load_eventKit() {
  return _eventKit = require('event-kit');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

const logger = (0, (_log4js || _load_log4js()).getLogger)('nuclide-server');


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


// An unreliable transport for sending JSON formatted messages
//
// onClose handlers are guaranteed to be called exactly once.
// onMessage handlers are guaranteed to not be called after onClose has been called.
// send(data) yields false if the message failed to send, true on success.
// onClose handlers will be called before close() returns.
// May not call send() after transport has closed..
class QueuedTransport {

  constructor(clientId, transport) {
    this.id = clientId;
    this._isClosed = false;
    this._transport = null;
    this._messageQueue = [];
    this._messages = new _rxjsBundlesRxMinJs.Subject();
    this._emitter = new (_eventKit || _load_eventKit()).Emitter();
    this._lastStateChangeTime = Date.now();

    if (transport != null) {
      this._connect(transport);
    }
  }

  getState() {
    return this._isClosed ? 'closed' : this._transport == null ? 'disconnected' : 'open';
  }

  getLastStateChangeTime() {
    return this._lastStateChangeTime;
  }

  _connect(transport) {
    if (!!transport.isClosed()) {
      throw new Error('Invariant violation: "!transport.isClosed()"');
    }

    logger.info('Client #%s connecting with a new socket!', this.id);

    if (!(this._transport == null)) {
      throw new Error('Invariant violation: "this._transport == null"');
    }

    this._transport = transport;
    this._lastStateChangeTime = Date.now();
    transport.onMessage().subscribe(message => this._messages.next(message));
    transport.onClose(() => this._onClose(transport));
  }

  _onClose(transport) {
    if (!transport.isClosed()) {
      throw new Error('Invariant violation: "transport.isClosed()"');
    }

    if (this._isClosed) {
      // This happens when close() is called and we have an open transport.
      return;
    }
    if (transport !== this._transport) {
      // This should not happen...
      logger.error('Orphaned transport closed');
      return;
    }

    this._transport = null;
    this._lastStateChangeTime = Date.now();
    this._emitter.emit('disconnect', transport);
  }

  // Reconnecting, when in an open state will cause a disconnect event.
  reconnect(transport) {
    if (!!transport.isClosed()) {
      throw new Error('Invariant violation: "!transport.isClosed()"');
    }

    if (!!this._isClosed) {
      throw new Error('Invariant violation: "!this._isClosed"');
    }

    if (this._transport != null) {
      // This will cause a disconnect event...
      this._transport.close();
    }

    if (!(this._transport == null)) {
      throw new Error('Invariant violation: "this._transport == null"');
    }

    this._connect(transport);

    // Attempt to resend queued messages
    const queuedMessages = this._messageQueue;
    this._messageQueue = [];
    queuedMessages.forEach(message => this.send(message));
  }

  disconnect() {
    if (!!this._isClosed) {
      throw new Error('Invariant violation: "!this._isClosed"');
    }

    this._disconnect();
  }

  _disconnect() {
    const transport = this._transport;
    if (transport != null) {
      transport.close();
    }
  }

  onMessage() {
    return this._messages;
  }

  onDisconnect(callback) {
    return this._emitter.on('disconnect', callback);
  }

  send(message) {
    this._send(message);
  }

  _send(message) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (!!_this._isClosed) {
        throw new Error(`Attempt to send socket message after connection closed: ${message}`);
      }

      _this._messageQueue.push(message);
      if (_this._transport == null) {
        return;
      }

      const sent = yield _this._transport.send(message);
      if (!sent) {
        logger.warn('Failed sending socket message to client:', _this.id, JSON.parse(message));
      } else {
        // This may remove a different (but equivalent) message from the Q,
        // but that's ok because we don't guarantee message ordering.
        const messageIndex = _this._messageQueue.indexOf(message);
        if (messageIndex !== -1) {
          _this._messageQueue.splice(messageIndex, 1);
        }
      }
    })();
  }

  close() {
    this._disconnect();
    if (!this._isClosed) {
      this._isClosed = true;
      this._lastStateChangeTime = Date.now();
    }
  }

  isClosed() {
    return this._isClosed;
  }
}
exports.QueuedTransport = QueuedTransport;