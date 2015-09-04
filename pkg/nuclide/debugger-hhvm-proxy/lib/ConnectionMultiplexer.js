'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {log, logErrorAndThrow, uriToPath} = require('./utils');
var {Connection} = require('./Connection');

import type {Socket} from 'net';
import type Scope from './DataCache';
import type PropertyDescriptor from './DataCache';
import type RemoteObjectId from './DataCache';
import type {Disposable} from 'nuclide-commons';
var {BreakpointStore} = require('./BreakpointStore');
var {DbgpConnector} = require('./connect');
import type {ConnectionConfig} from './connect';
var {
  STATUS_STARTING,
  STATUS_STOPPING,
  STATUS_STOPPED,
  STATUS_RUNNING,
  STATUS_BREAK,
  STATUS_ERROR,
  STATUS_END,
  COMMAND_RUN,
  COMMAND_STEP_INTO,
} = require('./DbgpSocket');
var {EventEmitter} = require('events');

var CONNECTION_MUX_STATUS_EVENT = 'connection-mux-status';

export class ConnectionMultiplexer {
  _config: ConnectionConfig;
  _breakpointStore: BreakpointStore;
  _emitter: EventEmitter;
  _status: string;
  _connection: ?Connection;
  _connectionOnStatusDisposable: ?Disposable;

  constructor(config: ConnectionConfig) {
    this._config = config;
    this._status = STATUS_STARTING;
    this._emitter = new EventEmitter();
    this._connection = null;
    this._connectionOnStatusDisposable = null;

    this._breakpointStore = new BreakpointStore();
  }

  async enable(): Promise {
    var connector = new DbgpConnector(this._config);
    try {
      var connection = new Connection(await connector.attach());
      this._connection = connection;
      this._breakpointStore.addConnection(connection);

      this._connectionOnStatusDisposable = connection.onStatus(
        this._connectionOnStatus.bind(this));
      this._connectionOnStatus(await connection.getStatus());
    } finally {
      connector.dispose();
    }
  }

  _connectionOnStatus(status: string): void {
    switch (status) {
    case STATUS_STARTING:
      // Starting status has no stack.
      // step before reporting initial status to get to the first instruction.
      // TODO: Use loader breakpoint configuration to choose between step/run.
      this.sendContinuationCommand(COMMAND_STEP_INTO);
      break;
    case STATUS_STOPPING:
      // TODO: May want to enable post-mortem features?
      this.sendContinuationCommand(COMMAND_RUN);
      break;
    default:
      if (status !== this._status) {
        this._status = status;
        this._emitter.emit(CONNECTION_MUX_STATUS_EVENT, status);
      }
    }
  }

  onStatus(callback: (status: string) => mixed): Disposable {
    return require('nuclide-commons').event.attachEvent(this._emitter,
      CONNECTION_MUX_STATUS_EVENT, callback);
  }

  evaluateOnCallFrame(frameIndex: number, expression: string): Promise<Object> {
    if (this._connection) {
      return this._connection.evaluateOnCallFrame(frameIndex, expression);
    } else {
      throw this._noConnectionError();
    }
  }

  setBreakpoint(filename: string, lineNumber: number): Promise<string> {
    return this._breakpointStore.setBreakpoint(filename, lineNumber);
  }

  removeBreakpoint(breakpointId: string): Promise {
    return this._breakpointStore.removeBreakpoint(breakpointId);
  }

  getStackFrames(): Promise<Array<Object>> {
    if (this._connection) {
      return this._connection.getStackFrames();
    } else {
      throw this._noConnectionError();
    }
  }

  getScopesForFrame(frameIndex: number): Promise<Scope> {
    if (this._connection) {
      return this._connection.getScopesForFrame(frameIndex);
    } else {
      throw this._noConnectionError();
    }
  }

  getStatus(): string {
    return this._status;
  }

  sendContinuationCommand(command: string): void {
    if (this._connection) {
      this._connection.sendContinuationCommand(command);
    } else {
      throw this._noConnectionError();
    }
  }

  sendBreakCommand(): Promise<boolean> {
    if (this._connection) {
      return this._connection.sendBreakCommand();
    } else {
      return Promise.resolve(false);
    }
  }

  getProperties(remoteId: RemoteObjectId): Promise<Array<PropertyDescriptor>> {
    if (this._connection) {
      return this._connection.getProperties(remoteId);
    } else {
      throw this._noConnectionError();
    }
  }

  dispose(): void {
    if (this._connectionOnStatusDisposable) {
      this._connectionOnStatusDisposable.dispose();
      this._connectionOnStatusDisposable = null;
    }
    if (this._connection) {
      this._connection.dispose();
      this._connection = null;
    }
    this._status = STATUS_END;
  }

  _noConnectionError(): Error {
    // This is an indication of a bug in the state machine.
    // .. we are seeing a request in a state that should not generate
    // that request.
    return new Error('No connection');
  }
}
