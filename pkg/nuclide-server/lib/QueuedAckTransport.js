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
import {protocolLogger} from './utils';

export const ACK_BUFFER_TIME = 100;
export const PENDING_MESSAGE_TIMEOUT = 30 * 1000;
export const CONTENT = 'CONTENT';
export const ACK = 'ACK';

type ParsedMessage =
  | {
      type: 'CONTENT',
      id: number,
      message: string,
    }
  | {
      type: 'ACK',
      id: number,
    };

type PendingSend = {
  id: number,
  wireMessage: string,
};

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
  _pendingSends: Deque<PendingSend>;
  _pendingReceives: Map<number, string>;
  _emitter: Emitter;
  _messageProcessor: Subject<string>;
  _lastSendId: number = 0;
  _lastProcessedId: number = 0;
  _pendingMessageTimer: ?number;
  _ackTimer: ?number;

  constructor(clientId: string, transport: ?UnreliableTransport) {
    this.id = clientId;
    this._isClosed = false;
    this._transport = null;
    this._pendingSends = new Deque();
    this._pendingReceives = new Map();
    this._messageProcessor = new Subject();
    this._emitter = new Emitter();

    if (transport != null) {
      this._connect(transport);
    }
  }

  getState(): 'open' | 'disconnected' | 'closed' {
    this._checkLeaks();
    return this._isClosed
      ? 'closed'
      : this._transport == null ? 'disconnected' : 'open';
  }

  onDisconnect(
    callback: (transport: UnreliableTransport) => mixed,
  ): IDisposable {
    return this._emitter.on('disconnect', callback);
  }

  onMessage(): Observable<string> {
    return this._messageProcessor;
  }

  _connect(transport: UnreliableTransport): void {
    logInfo(`${this.id} connect`);
    invariant(!transport.isClosed(), 'connect with closed transport');
    invariant(this._transport == null, 'connect with existing this._transport');

    this._transport = transport;

    transport.onMessage().subscribe(this._handleMessage.bind(this));
    transport.onClose(() => this._handleTransportClose(transport));
  }

  _handleTransportClose(transport: UnreliableTransport): void {
    invariant(transport.isClosed(), 'handleTransportClose transport is closed');

    if (this._isClosed) {
      // This happens when close() is called and we have an open transport.
      logInfo(`${this.id} handleTransportClose (but already closed)`);
    } else if (transport !== this._transport) {
      // This should not happen, but we don't care enough to track.
      logError(`${this.id} handleTransportClose (but unexpected transport)`);
    } else {
      logInfo(`${this.id} handleTransportClose`);
      this._transport = null;
      this._cancelPendingMessageTimer();
      this._cancelAckTimer();
      this._emitter.emit('disconnect', transport);
    }
    this._checkLeaks();
  }

  reconnect(transport: UnreliableTransport): void {
    if (this._isClosed) {
      logInfo(`${this.id} reconnect (but already closed)`);
      this._checkLeaks();
      return;
    }
    invariant(!transport.isClosed(), 'reconnect with closed transport');
    logInfo(
      `${this.id} reconnect (${this._pendingSends.length} sends, ${this
        ._pendingReceives.size} receives)`,
    );

    if (this._transport != null) {
      this._transport.close();
    }
    this._connect(transport);
    this._resendQueue();
    this._checkLeaks();
  }

  disconnect(caller: string = 'external'): void {
    protocolLogger.trace(
      `${this.id} disconnect (caller=${caller}, state=${this.getState()}))`,
    );
    const transport = this._transport;
    if (transport != null) {
      invariant(!this._isClosed);
      transport.close();
    }
    invariant(this._transport == null);
    this._checkLeaks();
  }

  send(message: string): void {
    if (this._isClosed) {
      protocolLogger.trace(`${this.id} send (but already closed) '${message}'`);
      this._checkLeaks();
      return;
    }

    const id = ++this._lastSendId;
    const wireMessage = frameContent(id, message);
    this._pendingSends.enqueue({id, wireMessage});
    this._transportSend(wireMessage);
    this._maybeStartPendingMessageTimer();
    this._checkLeaks();
  }

  _resendQueue(): void {
    logInfo(`${this.id} resendQueue`);
    this._sendAck();
    this._pendingSends
      .toArray()
      .forEach(x => this._transportSend(x.wireMessage), this);
    this._maybeStartPendingMessageTimer();
  }

  _handleMessage(wireMessage: string): void {
    if (this._isClosed) {
      protocolLogger.trace(
        `${this.id} receive (but already closed) '${wireMessage}'`,
      );
      this._checkLeaks();
      return;
    }

    const parsed = parseMessage(wireMessage);
    let progress = 0;

    switch (parsed.type) {
      case CONTENT: {
        protocolLogger.trace(`${this.id} received ${_forLogging(wireMessage)}`);
        const pending = this._pendingReceives;
        // If this is a repeat of an old message, don't add it, since we
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
          protocolLogger.trace(`${this.id} processed ${progress} messages`);
        }
        this._ensureAckTimer();
        break;
      }

      case ACK: {
        const pending = this._pendingSends;
        const id = parsed.id;
        invariant(id <= this._lastSendId);
        while (true) {
          const front = pending.peekFront();
          if (front == null || front.id > id) {
            break;
          }
          pending.dequeue();
          progress++;
        }
        protocolLogger.trace(
          `${this
            .id} received ack ${wireMessage} (cleared ${progress} messages, last sent ${this
            ._lastSendId})`,
        );
        break;
      }
    }

    // Note that this only restarts the timer if (a) we still have something
    // pending, and (b) we made progress here and canceled the existing timer.
    // If wireMessage did not actually move us forward, we did not cancel the
    // existing timer so _maybeStartPendingMessageTimer will be a no-op.
    if (progress > 0) {
      this._cancelPendingMessageTimer();
    }
    this._maybeStartPendingMessageTimer();
    this._checkLeaks();
  }

  close(): void {
    if (!this._isClosed) {
      protocolLogger.trace(`${this.id} close`);
      this.disconnect('close');
      this._pendingSends.clear();
      this._pendingReceives.clear();
      this._isClosed = true;
    } else {
      protocolLogger.trace(`${this.id} close (but already closed)`);
    }
    this._checkLeaks();
  }

  isClosed(): boolean {
    this._checkLeaks();
    return this._isClosed;
  }

  _ensureAckTimer(): void {
    if (!this._isClosed && this._transport != null && this._ackTimer == null) {
      this._ackTimer = setTimeout(this._sendAck.bind(this), ACK_BUFFER_TIME);
    }
  }

  _cancelAckTimer(): void {
    if (this._ackTimer != null) {
      clearTimeout(this._ackTimer);
      this._ackTimer = null;
    }
  }

  _sendAck(): void {
    this._cancelAckTimer();
    if (this._lastProcessedId > 0) {
      this._transportSend(frameAck(this._lastProcessedId));
    }
  }

  // If we have a pending send or receive and wait a while without
  // an ack or processing a message, disconnect.  This should trigger
  // NuclideSocket on the client to attempt to reconnect.
  _maybeStartPendingMessageTimer(): void {
    if (this._pendingMessageTimer == null && this._wantsPendingMessageTimer()) {
      this._pendingMessageTimer = setTimeout(
        this._handlePendingMessageTimeout.bind(this),
        PENDING_MESSAGE_TIMEOUT,
      );
    }
  }

  _cancelPendingMessageTimer(): void {
    if (this._pendingMessageTimer != null) {
      clearTimeout(this._pendingMessageTimer);
      this._pendingMessageTimer = null;
    }
  }

  _handlePendingMessageTimeout(): void {
    invariant(!this._isClosed, 'isClosed');
    invariant(this._transport != null, 'transport');
    invariant(this._hasPendingMessage(), 'hasPendingMessage');
    this.disconnect('timeout');
  }

  _wantsPendingMessageTimer(): boolean {
    return (
      !this._isClosed && this._transport != null && this._hasPendingMessage()
    );
  }

  _hasPendingMessage(): boolean {
    return !this._pendingSends.isEmpty() || this._pendingReceives.size > 0;
  }

  _transportSend(wireMessage: string): void {
    const transport = this._transport;
    const summary = _forLogging(wireMessage);
    if (transport != null) {
      protocolLogger.trace(`${this.id} transport send ${summary}`);
      transport.send(wireMessage);
    } else {
      protocolLogger.trace(
        `${this.id} transport send (but disconnected) ${summary}`,
      );
    }
  }

  _checkLeaks(): void {
    if (this._isClosed) {
      invariant(this._pendingSends.isEmpty(), 'pendingSends');
      invariant(this._pendingReceives.size === 0, 'pendingReceives');
      invariant(this._transport == null, 'transport');
    }
    if (this._transport == null) {
      invariant(this._ackTimer == null, 'ackTimer');
      invariant(this._pendingMessageTimer == null, 'pendingMessageTimer');
    }
  }
}

// exported for testing
export function frameContent(id: number, message: string): string {
  return `>${id}:${message}`;
}

// exported for testing
export function frameAck(id: number): string {
  return `<${id}:`;
}

// exported for testing
export function parseMessage(wireMessage: string): ParsedMessage {
  const iColon = wireMessage.indexOf(':');
  invariant(iColon !== -1);
  const mode = wireMessage[0];
  const id = Number(wireMessage.substring(1, iColon));
  const message = wireMessage.substring(iColon + 1);
  if (mode === '>') {
    return {type: CONTENT, id, message};
  } else if (mode === '<') {
    return {type: ACK, id};
  } else {
    invariant(false, `Unrecognized mode in wire message '${wireMessage}'`);
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

function logInfo(format: string, ...args: Array<any>): void {
  logger.info(format, ...args);
  protocolLogger.info(format, ...args);
}
