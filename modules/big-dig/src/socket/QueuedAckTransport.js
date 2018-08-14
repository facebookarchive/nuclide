"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.frameContent = frameContent;
exports.frameAck = frameAck;
exports.parseMessage = parseMessage;
exports.QueuedAckTransport = exports.ACK = exports.CONTENT = exports.PENDING_MESSAGE_TIMEOUT = exports.ACK_BUFFER_TIME = void 0;

function _doubleEndedQueue() {
  const data = _interopRequireDefault(require("double-ended-queue"));

  _doubleEndedQueue = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _eventKit() {
  const data = require("event-kit");

  _eventKit = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */
const logger = (0, _log4js().getLogger)('reliable-socket');
const ACK_BUFFER_TIME = 100;
exports.ACK_BUFFER_TIME = ACK_BUFFER_TIME;
const PENDING_MESSAGE_TIMEOUT = 30 * 1000;
exports.PENDING_MESSAGE_TIMEOUT = PENDING_MESSAGE_TIMEOUT;
const CONTENT = 'CONTENT';
exports.CONTENT = CONTENT;
const ACK = 'ACK';
exports.ACK = ACK;

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
  constructor(clientId, transport, protocolLogger) {
    this._lastSendId = 0;
    this._lastProcessedId = 0;
    this.id = clientId;
    this._isClosed = false;
    this._transport = null;
    this._pendingSends = new (_doubleEndedQueue().default)();
    this._pendingReceives = new Map();
    this._messageProcessor = new _RxMin.Subject();
    this._emitter = new (_eventKit().Emitter)();
    this._protocolLogger = protocolLogger;

    if (transport != null) {
      this._connect(transport);
    }
  }

  getState() {
    this._checkLeaks();

    return this._isClosed ? 'closed' : this._transport == null ? 'disconnected' : 'open';
  }

  onDisconnect(callback) {
    return this._emitter.on('disconnect', callback);
  }

  onMessage() {
    return this._messageProcessor;
  }

  _connect(transport) {
    this._logInfo(`${this.id} connect`);

    if (!!transport.isClosed()) {
      throw new Error('connect with closed transport');
    }

    if (!(this._transport == null)) {
      throw new Error('connect with existing this._transport');
    }

    this._transport = transport;
    transport.onMessage().subscribe(this._handleMessage.bind(this));
    transport.onClose(() => this._handleTransportClose(transport));
  }

  _handleTransportClose(transport) {
    if (!transport.isClosed()) {
      throw new Error('handleTransportClose transport is closed');
    }

    if (this._isClosed) {
      // This happens when close() is called and we have an open transport.
      this._logInfo(`${this.id} handleTransportClose (but already closed)`);
    } else if (transport !== this._transport) {
      // This should not happen, but we don't care enough to track.
      this._logError(`${this.id} handleTransportClose (but unexpected transport)`);
    } else {
      this._logInfo(`${this.id} handleTransportClose`);

      this._transport = null;

      this._cancelPendingMessageTimer();

      this._cancelAckTimer();

      this._emitter.emit('disconnect', transport);
    }

    this._checkLeaks();
  }

  reconnect(transport) {
    if (this._isClosed) {
      this._logInfo(`${this.id} reconnect (but already closed)`);

      this._checkLeaks();

      return;
    }

    if (!!transport.isClosed()) {
      throw new Error('reconnect with closed transport');
    }

    this._logInfo(`${this.id} reconnect (${this._pendingSends.length} sends, ${this._pendingReceives.size} receives)`);

    if (this._transport != null) {
      this._transport.close();
    }

    this._connect(transport);

    this._resendQueue();

    this._checkLeaks();
  }

  disconnect(caller = 'external') {
    this._logTrace(`${this.id} disconnect (caller=${caller}, state=${this.getState()}))`);

    const transport = this._transport;

    if (transport != null) {
      if (!!this._isClosed) {
        throw new Error("Invariant violation: \"!this._isClosed\"");
      }

      transport.close();
    }

    if (!(this._transport == null)) {
      throw new Error("Invariant violation: \"this._transport == null\"");
    }

    this._checkLeaks();
  }

  send(message) {
    if (this._isClosed) {
      this._logTrace(`${this.id} send (but already closed) '${message}'`);

      this._checkLeaks();

      return;
    }

    const id = ++this._lastSendId;
    const wireMessage = frameContent(id, message);

    this._pendingSends.enqueue({
      id,
      wireMessage
    });

    this._transportSend(wireMessage);

    this._maybeStartPendingMessageTimer();

    this._checkLeaks();
  }

  _resendQueue() {
    this._logInfo(`${this.id} resendQueue`);

    this._sendAck();

    this._pendingSends.toArray().forEach(x => this._transportSend(x.wireMessage), this);

    this._maybeStartPendingMessageTimer();
  }

  _handleMessage(wireMessage) {
    if (this._isClosed) {
      this._logTrace(`${this.id} receive (but already closed) '${wireMessage}'`);

      this._checkLeaks();

      return;
    }

    const parsed = parseMessage(wireMessage);
    let progress = 0;

    switch (parsed.type) {
      case CONTENT:
        {
          this._logTrace(`${this.id} received ${_forLogging(wireMessage)}`);

          const pending = this._pendingReceives; // If this is a repeat of an old message, don't add it, since we
          // only remove messages when we process them.

          if (parsed.id > this._lastProcessedId) {
            pending.set(parsed.id, parsed.message);
          }

          while (true) {
            const id = this._lastProcessedId + 1;
            const message = pending.get(id);

            if (message == null) {
              break;
            }

            this._messageProcessor.next(message);

            pending.delete(id);
            this._lastProcessedId = id;
            progress++;
          }

          if (progress !== 1) {
            this._logTrace(`${this.id} processed ${progress} messages`);
          }

          this._ensureAckTimer();

          break;
        }

      case ACK:
        {
          const pending = this._pendingSends;
          const id = parsed.id;

          if (id > this._lastSendId) {
            // The id needs to be smaller than or equal to the _lastSendId unless
            // the client is reconnecting after a close (which can happen in a
            // specific client-side race condition). The invariant here makes
            // sure this is the case.
            if (!(this._lastSendId === 0 && this._lastProcessedId === 0)) {
              throw new Error("Invariant violation: \"this._lastSendId === 0 && this._lastProcessedId === 0\"");
            }

            this.close();
            break;
          } else {
            while (true) {
              const front = pending.peekFront();

              if (front == null || front.id > id) {
                break;
              }

              pending.dequeue();
              progress++;
            }

            this._logTrace(`${this.id} received ack ${wireMessage} (cleared ${progress} messages, last sent ${this._lastSendId})`);
          }

          break;
        }
    } // Note that this only restarts the timer if (a) we still have something
    // pending, and (b) we made progress here and canceled the existing timer.
    // If wireMessage did not actually move us forward, we did not cancel the
    // existing timer so _maybeStartPendingMessageTimer will be a no-op.


    if (progress > 0) {
      this._cancelPendingMessageTimer();
    }

    this._maybeStartPendingMessageTimer();

    this._checkLeaks();
  }

  close() {
    if (!this._isClosed) {
      this._logTrace(`${this.id} close`);

      this.disconnect('close');

      this._pendingSends.clear();

      this._pendingReceives.clear();

      this._isClosed = true;
    } else {
      this._logTrace(`${this.id} close (but already closed)`);
    }

    this._checkLeaks();
  }

  isClosed() {
    this._checkLeaks();

    return this._isClosed;
  }

  _ensureAckTimer() {
    if (!this._isClosed && this._transport != null && this._ackTimer == null) {
      this._ackTimer = setTimeout(this._sendAck.bind(this), ACK_BUFFER_TIME);
    }
  }

  _cancelAckTimer() {
    if (this._ackTimer != null) {
      clearTimeout(this._ackTimer);
      this._ackTimer = null;
    }
  }

  _sendAck() {
    this._cancelAckTimer();

    if (this._lastProcessedId > 0) {
      this._transportSend(frameAck(this._lastProcessedId)); // It seems that a bug in Electron's Node integration can cause ACKs
      // to become stuck in the Node event loop indefinitely
      // (as they are scheduled using Chromium's setTimeout).
      // See T27348369 for more details.


      if (process.platform === 'win32' && // $FlowFixMe(>=0.68.0) Flow suppress (T27187857)
      typeof process.activateUvLoop === 'function') {
        process.activateUvLoop();
      }
    }
  } // If we have a pending send or receive and wait a while without
  // an ack or processing a message, disconnect.  This should trigger
  // ReliableSocket on the client to attempt to reconnect.


  _maybeStartPendingMessageTimer() {
    if (this._pendingMessageTimer == null && this._wantsPendingMessageTimer()) {
      this._pendingMessageTimer = setTimeout(this._handlePendingMessageTimeout.bind(this), PENDING_MESSAGE_TIMEOUT);
    }
  }

  _cancelPendingMessageTimer() {
    if (this._pendingMessageTimer != null) {
      clearTimeout(this._pendingMessageTimer);
      this._pendingMessageTimer = null;
    }
  }

  _handlePendingMessageTimeout() {
    if (!!this._isClosed) {
      throw new Error('isClosed');
    }

    if (!(this._transport != null)) {
      throw new Error('transport');
    }

    if (!this._hasPendingMessage()) {
      throw new Error('hasPendingMessage');
    }

    this.disconnect('timeout');
  }

  _wantsPendingMessageTimer() {
    return !this._isClosed && this._transport != null && this._hasPendingMessage();
  }

  _hasPendingMessage() {
    return !this._pendingSends.isEmpty() || this._pendingReceives.size > 0;
  }

  _transportSend(wireMessage) {
    const transport = this._transport;

    const summary = _forLogging(wireMessage);

    if (transport != null) {
      this._logTrace(`${this.id} transport send ${summary}`);

      transport.send(wireMessage);
    } else {
      this._logTrace(`${this.id} transport send (but disconnected) ${summary}`);
    }
  }

  _checkLeaks() {
    if (this._isClosed) {
      if (!this._pendingSends.isEmpty()) {
        throw new Error('pendingSends');
      }

      if (!(this._pendingReceives.size === 0)) {
        throw new Error('pendingReceives');
      }

      if (!(this._transport == null)) {
        throw new Error('transport');
      }
    }

    if (this._transport == null) {
      if (!(this._ackTimer == null)) {
        throw new Error('ackTimer');
      }

      if (!(this._pendingMessageTimer == null)) {
        throw new Error('pendingMessageTimer');
      }
    }
  } // Helper functions to log sufficiently interesting logs to both
  // logger (disk) and protocolLogger (circular in-memory).


  _logError(format, ...args) {
    logger.error(format, ...args);

    if (this._protocolLogger != null) {
      this._protocolLogger.error(format, ...args);
    }
  }

  _logInfo(format, ...args) {
    logger.info(format, ...args);

    if (this._protocolLogger != null) {
      this._protocolLogger.info(format, ...args);
    }
  }

  _logTrace(format, ...args) {
    if (this._protocolLogger != null) {
      this._protocolLogger.trace(format, ...args);
    }
  }

} // exported for testing


exports.QueuedAckTransport = QueuedAckTransport;

function frameContent(id, message) {
  return `>${id}:${message}`;
} // exported for testing


function frameAck(id) {
  return `<${id}:`;
} // exported for testing


function parseMessage(wireMessage) {
  const iColon = wireMessage.indexOf(':');

  if (!(iColon !== -1)) {
    throw new Error("Invariant violation: \"iColon !== -1\"");
  }

  const mode = wireMessage[0];
  const id = Number(wireMessage.substring(1, iColon));
  const message = wireMessage.substring(iColon + 1);

  if (mode === '>') {
    return {
      type: CONTENT,
      id,
      message
    };
  } else if (mode === '<') {
    return {
      type: ACK,
      id
    };
  } else {
    if (!false) {
      throw new Error(`Unrecognized mode in wire message '${wireMessage}'`);
    }
  }
}

const MAX_RAW_LOG = 256;
const PROTOCOL_COMMON = '"protocol":"service_framework3_rpc"';

function _forLogging(message) {
  const truncated = message.substr(0, MAX_RAW_LOG);
  const noUserInput = removeUserInput(truncated);
  const noProtocol = noUserInput.replace(PROTOCOL_COMMON, '..');
  const ellipsed = message.length > MAX_RAW_LOG && !noProtocol.endsWith('..') ? noProtocol + '..' : noProtocol;
  return JSON.stringify(ellipsed);
}

const WRITE_INPUT = '"method":"writeInput"';
const WRITE_INPUT_DATA_PREFIX = '"args":{"data":';

function removeUserInput(message) {
  const methodIndex = message.indexOf(WRITE_INPUT);

  if (methodIndex < 0) {
    return message;
  }

  const argsIndex = message.indexOf(WRITE_INPUT_DATA_PREFIX, methodIndex);

  if (argsIndex < 0) {
    return message;
  }

  return message.substring(0, argsIndex + WRITE_INPUT_DATA_PREFIX.length) + '<omitted user input>..';
}