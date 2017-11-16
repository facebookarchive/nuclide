/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {Observable} from 'rxjs';
import type {UnreliableTransport} from '../../nuclide-rpc';
import {default as Deque} from 'double-ended-queue';

import invariant from 'assert';
import {Subject} from 'rxjs';
import {getLogger} from 'log4js';
const logger = getLogger('nuclide-server');
import {Emitter} from 'event-kit';
import {track} from '../../nuclide-analytics';
import {protocolLogger} from './utils';

type QueueItem = {id: number, message: string};

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
export class QueuedAckTransport {
  id: string;
  _isClosed: boolean;
  _transport: ?UnreliableTransport;
  _messageQueue: Deque<QueueItem>;
  _emitter: Emitter;
  _messages: Subject<string>;
  _lastStateChangeTime: number;
  _id: number = 1;
  _lastIdHandled: number = 0;
  _retryTimerId: ?number;

  constructor(clientId: string, transport: ?UnreliableTransport) {
    this.id = clientId;
    this._isClosed = false;
    this._transport = null;
    this._messageQueue = new Deque();
    this._messages = new Subject();
    this._emitter = new Emitter();
    this._lastStateChangeTime = Date.now();

    if (transport != null) {
      this._connect(transport);
    }
  }

  getState(): 'open' | 'disconnected' | 'closed' {
    return this._isClosed
      ? 'closed'
      : this._transport == null ? 'disconnected' : 'open';
  }

  getLastStateChangeTime(): number {
    return this._lastStateChangeTime;
  }

  _connect(transport: UnreliableTransport): void {
    invariant(!transport.isClosed());
    logInfo(`${this.id} connecting with a new socket`);
    invariant(this._transport == null);
    this._transport = transport;
    this._lastStateChangeTime = Date.now();
    transport.onMessage().subscribe(this._handleMessage.bind(this));
    transport.onClose(() => this._onClose(transport));
  }

  _onClose(transport: UnreliableTransport): void {
    invariant(transport.isClosed());

    if (this._isClosed) {
      // This happens when close() is called and we have an open transport.
      logInfo(`${this.id} onClose but already closed`);
      return;
    }
    if (transport !== this._transport) {
      // This should not happen...
      logError(`${this.id} Orphaned transport closed`);
      return;
    }

    logInfo(`${this.id} onClose`);
    this._transport = null;
    this._lastStateChangeTime = Date.now();
    this._emitter.emit('disconnect', transport);
  }

  // Reconnecting, when in an open state will cause a disconnect event.
  reconnect(transport: UnreliableTransport): void {
    invariant(!transport.isClosed());
    invariant(!this._isClosed);
    logInfo(`${this.id} reconnect`);

    if (this._transport != null) {
      // This will cause a disconnect event...
      this._transport.close();
    }
    invariant(this._transport == null);

    this._connect(transport);

    this._sendFirstQueueMessageIfAny();
  }

  disconnect(): void {
    invariant(!this._isClosed);
    this._disconnect();
  }

  _disconnect(): void {
    const transport = this._transport;
    if (transport != null) {
      protocolLogger.trace(`${this.id} disconnect`);
      transport.close();
    } else {
      protocolLogger.trace(`${this.id} disconnect but no transport`);
    }
  }

  onMessage(): Observable<string> {
    return this._messages;
  }

  onDisconnect(
    callback: (transport: UnreliableTransport) => mixed,
  ): IDisposable {
    return this._emitter.on('disconnect', callback);
  }

  send(message: string): void {
    invariant(
      !this._isClosed,
      `Attempt to send socket message after connection closed: ${message}`,
    );
    const id = this._id++;
    protocolLogger.trace(`${this.id} send ${id}: ${_forLogging(message)}`);
    const newItem: QueueItem = {id, message};
    this._messageQueue.push(newItem);
    this._sendFirstQueueMessageIfAny();
  }

  _retrySendFirstQueueMessageIfAny(): void {
    logWarn(`${this.id} retrying sendFirst`);
    this._sendFirstQueueMessageIfAny();
  }

  _sendFirstQueueMessageIfAny(): void {
    if (this._retryTimerId != null) {
      clearTimeout(this._retryTimerId);
      this._retryTimerId = null;
    }

    const transport = this._transport;
    if (transport == null) {
      protocolLogger.trace(`${this.id} sendFirst (but disconnected)`);
      return;
    }

    const front = this._messageQueue.peekFront();
    if (front == null) {
      protocolLogger.trace(`${this.id} sendFirst done sending`);
      return;
    }
    const {id, message} = front;
    const rawMessage = `>${id}:${message}`;
    protocolLogger.trace(`${this.id} sendFirst ${_forLogging(rawMessage)}`);

    transport.send(rawMessage);
    this._retryTimerId = setTimeout(
      this._retrySendFirstQueueMessageIfAny.bind(this),
      150,
    );
    // We've scheduled an automatic retry of sending the message.
    // We won't remove the message from the queue until we get an ack.
  }

  _handleMessage(rawMessage: string): void {
    const iColon = rawMessage.indexOf(':');
    invariant(iColon !== -1);
    const mode = rawMessage[0];
    invariant(mode === '>' || mode === '<');
    const id = Number(rawMessage.substring(1, iColon));
    const message = rawMessage.substring(iColon + 1);
    const messageForLogging = _forLogging(rawMessage);

    if (mode === '>') {
      // '>id:msg' means the other party has sent us this message
      // We only *handle* a message id the first time we receive it
      const expected = this._lastIdHandled + 1;
      if (id === expected) {
        protocolLogger.trace(`${this.id} processing ${messageForLogging}`);
        this._lastIdHandled = expected;
        this._messages.next(message);
      } else if (id > expected) {
        logError(
          `${this
            .id} PROTOCOL ERROR: expected ${expected}, got ${id} in ${messageForLogging}`,
        );
        track('transport.message-id-mismatch', {
          receivedMessageId: id,
          lastHandledMessageId: this._lastIdHandled,
          rawMessage,
        });
      } else {
        protocolLogger.trace(
          `${this.id} expected ${expected}, dropping ${messageForLogging}`,
        );
      }
      // We always send a receipt for the last message handled
      // (which needn't be reliably delivered).
      const transport = this._transport;
      if (transport != null) {
        const ackMessage: string = `<${this._lastIdHandled}:`;
        protocolLogger.trace(`${this.id} acking ${ackMessage}`);
        transport.send(ackMessage);
      }
    } else {
      // '<id:msg' means the other party has acknowledged receipt
      // It's fine to receive old acknowledgements from now-gone messages
      const first = this._messageQueue.peekFront();
      if (first != null) {
        const qId = first.id;
        if (id === qId) {
          protocolLogger.trace(`${this.id} got expected ack ${id}`);
          this._messageQueue.shift();
          this._sendFirstQueueMessageIfAny();
        } else if (id > qId) {
          logError(
            `${this
              .id} PROTOCOL ERROR: expected ack ${qId}, got ${id} in ${messageForLogging}`,
          );
          track('transport.ack-id-mismatch', {
            receivedAckId: id,
            lastSentMessageId: qId,
            rawMessage,
          });
        } else {
          protocolLogger.trace(
            `${this.id} ignoring ${messageForLogging}, expecting ack ${qId}`,
          );
        }
      } else {
        protocolLogger.trace(
          `${this.id} no queued messages, ignoring ${messageForLogging}`,
        );
      }
    }
  }

  close(): void {
    this._disconnect();
    if (!this._isClosed) {
      protocolLogger.trace(`${this.id} closing`);
      this._isClosed = true;
      this._lastStateChangeTime = Date.now();
    } else {
      protocolLogger.trace(`${this.id} closing but already closed`);
    }
  }

  isClosed(): boolean {
    return this._isClosed;
  }
}

const MAX_RAW_LOG = 256;
const PROTOCOL_COMMON = '"protocol":"service_framework3_rpc"';
function _forLogging(message: string): string {
  const truncated = message.substr(0, MAX_RAW_LOG);
  const noUserInput = removeUserInput(truncated);
  const noProtocol = noUserInput.replace(PROTOCOL_COMMON, '..');
  const ellipsed =
    message.length > MAX_RAW_LOG && !noProtocol.endsWith('..')
      ? noProtocol + '..'
      : noProtocol;
  return JSON.stringify(ellipsed);
}

const WRITE_INPUT = '"method":"writeInput"';
const WRITE_INPUT_DATA_PREFIX = '"args":{"data":';
function removeUserInput(message: string): string {
  const methodIndex = message.indexOf(WRITE_INPUT);
  if (methodIndex < 0) {
    return message;
  }

  const argsIndex = message.indexOf(WRITE_INPUT_DATA_PREFIX, methodIndex);
  if (argsIndex < 0) {
    return message;
  }

  return (
    message.substring(0, argsIndex + WRITE_INPUT_DATA_PREFIX.length) +
    '<omitted user input>..'
  );
}

// Helper functions to log sufficiently interesting logs to both
// logger (disk) and protocolLogger (circular in-memory).
function logError(format: string, ...args: Array<any>): void {
  logger.error(format, ...args);
  protocolLogger.error(format, ...args);
}

function logWarn(format: string, ...args: Array<any>): void {
  logger.warn(format, ...args);
  protocolLogger.warn(format, ...args);
}

function logInfo(format: string, ...args: Array<any>): void {
  logger.info(format, ...args);
  protocolLogger.info(format, ...args);
}
