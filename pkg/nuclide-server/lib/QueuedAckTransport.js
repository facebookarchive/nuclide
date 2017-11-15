'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.QueuedAckTransport = undefined;

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _dequeue;

function _load_dequeue() {
  return _dequeue = _interopRequireDefault(require('dequeue'));
}

var _eventKit;

function _load_eventKit() {
  return _eventKit = require('event-kit');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
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
// by queuing messages and removing from the queue only after
// receiving an ack that the recipient has received it.
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
class QueuedAckTransport {
  // elements are of type QueueItem
  constructor(clientId, transport) {
    this._id = 1;
    this._lastIdHandled = -1;

    this.id = clientId;
    this._isClosed = false;
    this._transport = null;
    this._messageQueue = new (_dequeue || _load_dequeue()).default();
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
    transport.onMessage().subscribe(this._handleMessage.bind(this));
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

    this._sendFirstQueueMessageIfAny();
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
    if (!!this._isClosed) {
      throw new Error(`Attempt to send socket message after connection closed: ${message}`);
    }

    const id = this._id++;
    const newItem = { id, message };
    this._messageQueue.push(newItem);
    this._sendFirstQueueMessageIfAny();
  }

  _sendFirstQueueMessageIfAny() {
    if (this._retryTimerId != null) {
      clearTimeout(this._retryTimerId);
      this._retryTimerId = null;
    }
    const transport = this._transport;
    if (this._messageQueue.length === 0 || transport == null) {
      return;
    }

    const { id, message } = this._messageQueue.first();
    const rawMessage = `>${id}:${message}`;

    transport.send(rawMessage);
    this._retryTimerId = setTimeout(this._sendFirstQueueMessageIfAny.bind(this), 150);
    // We've scheduled an automatic retry of sending the message.
    // We won't remove the message from the queue until we get an ack.
  }

  _dump() {
    const d = new (_dequeue || _load_dequeue()).default();
    while (this._messageQueue.length > 0) {
      const { id, message } = this._messageQueue.shift();
      d.push({ id, message });
      logger.error(` * ${id}:${message}`);
    }
  }

  _handleMessage(rawMessage) {
    const iColon = rawMessage.indexOf(':');

    if (!(iColon !== -1)) {
      throw new Error('Invariant violation: "iColon !== -1"');
    }

    const mode = rawMessage[0];

    if (!(mode === '>' || mode === '<')) {
      throw new Error('Invariant violation: "mode === \'>\' || mode === \'<\'"');
    }

    const id = Number(rawMessage.substring(1, iColon));
    const message = rawMessage.substring(iColon + 1);

    if (mode === '>') {
      // '>id:msg' means the other party has sent us this message
      // We only *handle* a message id the first time we receive it
      if (id > this._lastIdHandled) {
        this._messages.next(message);
      }
      if (id > this._lastIdHandled + 1 && this._lastIdHandled !== -1) {
        logger.error(`QueuedAckTransport message id mismatch - received ${id}, last handled ${this._lastIdHandled}`);
        (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('transport.message-id-mismatch', {
          receivedMessageId: id,
          lastHandledMessageId: this._lastIdHandled,
          rawMessage
        });
      }
      this._lastIdHandled = id;
      // But we always send a receipt (which needn't be reliably delivered).
      const ackMessage = `<${id}:${message}`;
      if (this._transport != null) {
        this._transport.send(ackMessage);
      }
    } else {
      // '<id:msg' means the other party has acknowledged receipt
      // It's fine to receive old acknowledgements from now-gone messages
      if (this._messageQueue.length > 0) {
        const qId = this._messageQueue.first().id;
        if (id > qId) {
          logger.error(`QueuedAckTransport ack id mismatch - received ack ${id}, last sent ${qId}`);
          (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('transport.ack-id-mismatch', {
            receivedAckId: id,
            lastSentMessageId: qId,
            rawMessage
          });
        }
        if (id === qId) {
          this._messageQueue.shift();
          this._sendFirstQueueMessageIfAny();
        }
      }
    }
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
exports.QueuedAckTransport = QueuedAckTransport;