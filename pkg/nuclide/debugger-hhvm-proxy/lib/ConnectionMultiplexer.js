'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {log, logError} from './utils';
import {Connection} from './Connection';
import {
  isCorrectConnection,
  failConnection,
} from './ConnectionUtils';

import type {Socket} from 'net';
import type Scope from './DataCache';
import type PropertyDescriptor from './DataCache';
import type RemoteObjectId from './DataCache';
import type {Disposable} from 'nuclide-commons';
import type {ExceptionState} from './BreakpointStore';
var {BreakpointStore} = require('./BreakpointStore');
var {DbgpConnector} = require('./DbgpConnector');
import type {ConnectionConfig} from './DbgpConnector';
import {
  STATUS_STARTING,
  STATUS_STOPPING,
  STATUS_STOPPED,
  STATUS_RUNNING,
  STATUS_BREAK,
  STATUS_ERROR,
  STATUS_END,
  COMMAND_RUN,
} from './DbgpSocket';
import {EventEmitter} from 'events';

const CONNECTION_MUX_STATUS_EVENT = 'connection-mux-status';
const CONNECTION_ERROR_EVENT = 'connection-error';

type ConnectionInfo = {
  connection: Connection;
  onStatusDisposable: Disposable;
  status: string;
};

// The ConnectionMultiplexer makes multiple debugger connections appear to be
// a single connection to the debugger UI.
//
// The initialization sequence occurs as follows:
//  - the constructor is called
//  - onStatus is called to hook up event handlers
//  - initial breakpoints may be added here.
//  - listen() is called indicating that all initial Breakpoints have been set
//    and debugging may commence.
//
// Once initialized, the ConnectionMultiplexer can be in one of 3 main states:
// running, break-disabled, and break-enabled.
//
// Running state means that all connections are in the running state.
// Note that running includes the state where there are no connections.
//
// Break-disabled state has at least one connection in break state.
// And none of the connections is enabled. Once in break-disabled state,
// the connection mux will immediately enable one of the broken connections
// and move to break-enabled state.
//
// Break-enabled state has a single connection which is in break-enabled
// state. There may be connections in break-disabled state and running state
// as well. The enabled connection will be shown in the debugger UI and all
// commands will go to the enabled connection.
//
// The ConnectionMultiplexer will close only if there are no connections
// and if the DbgpConnector is closed. The DbgpConnector will likely only
// close if HHVM crashes or is stopped.
export class ConnectionMultiplexer {
  _config: ConnectionConfig;
  _breakpointStore: BreakpointStore;
  _emitter: EventEmitter;
  _status: string;
  _enabledConnection: ?Connection;
  _connections: Map<Connection, ConnectionInfo>;
  _connector: ?DbgpConnector;

  constructor(config: ConnectionConfig) {
    this._config = config;
    this._status = STATUS_STARTING;
    this._emitter = new EventEmitter();
    this._enabledConnection = null;
    this._connections = new Map();

    this._breakpointStore = new BreakpointStore();
  }

  onStatus(callback: (status: string) => mixed): Disposable {
    return require('nuclide-commons').event.attachEvent(this._emitter,
      CONNECTION_MUX_STATUS_EVENT, callback);
  }

  onConnectionError(callback: (status: string) => mixed): Disposable {
    return require('nuclide-commons').event.attachEvent(this._emitter,
      CONNECTION_ERROR_EVENT, callback);
  }

  listen(): void {
    const connector = new DbgpConnector(this._config);
    connector.onAttach(this._onAttach.bind(this));
    connector.onClose(this._disposeConnector.bind(this));
    connector.onError(this._emitConnectionError.bind(this));
    this._connector = connector;
    this._status = STATUS_RUNNING;

    connector.listen();
  }

  async _onAttach(params: {socket: Socket, message: Object}): Promise {
    const {socket, message} = params;
    if (!isCorrectConnection(this._config, message)) {
      failConnection(socket, 'Discarding connection ' + JSON.stringify(message));
      return;
    }

    const connection = new Connection(socket);
    this._breakpointStore.addConnection(connection);

    const info = {
      connection,
      onStatusDisposable: connection.onStatus(status => {
        this._connectionOnStatus(connection, status);
      }),
      status: STATUS_STARTING,
    };
    this._connections.set(connection, info);

    let status;
    try {
      status = await connection.getStatus();
    } catch (e) {
      logError('Error getting initial connection status: ' + e.message);
      status = STATUS_ERROR;
    }
    this._connectionOnStatus(connection, status);
  }

  _connectionOnStatus(connection: Connection, status: string): void {
    log(`Mux got status: ${status} on connection ${connection.getId()}`);
    this._connections.get(connection).status = status;

    switch (status) {
      case STATUS_STARTING:
        // Starting status has no stack.
        // step before reporting initial status to get to the first instruction.
        // TODO: Use loader breakpoint configuration to choose between step/run.
        connection.sendContinuationCommand(COMMAND_RUN);
        return;
      case STATUS_STOPPING:
        // TODO: May want to enable post-mortem features?
        connection.sendContinuationCommand(COMMAND_RUN);
        return;
      case STATUS_RUNNING:
        if (connection === this._enabledConnection) {
          this._disableConnection();
        }
        break;
      case STATUS_BREAK:
        if (connection === this._enabledConnection) {
          // This can happen when we step.
          log('Mux break on enabled connection');
          this._emitStatus(STATUS_BREAK);
          return;
        }
        break;
      case STATUS_STOPPED:
      case STATUS_ERROR:
      case STATUS_END:
        this._removeConnection(connection);
        break;
    }

    this._updateStatus();
  }

  _updateStatus(): void {
    if (this._status === STATUS_END) {
      return;
    }

    if (this._status === STATUS_BREAK) {
      log('Mux already in break status');
      return;
    }

    // now check if we can move from running to break...
    for (const connectionInfo of this._connections.values()) {
      if (connectionInfo.status === STATUS_BREAK) {
        this._enableConnection(connectionInfo.connection);
        break;
      }
    }
  }

  _enableConnection(connection: Connection): void {
    log('Mux enabling connection');
    this._enabledConnection = connection;
    this._setStatus(STATUS_BREAK);
  }

  _setStatus(status: string): void {
    if (status !== this._status) {
      this._status = status;
      this._emitStatus(status);
    }
  }

  _emitConnectionError(error: string): void {
    this._emitter.emit(CONNECTION_ERROR_EVENT, error);
  }

  _emitStatus(status: string): void {
    this._emitter.emit(CONNECTION_MUX_STATUS_EVENT, status);
  }

  evaluateOnCallFrame(frameIndex: number, expression: string): Promise<Object> {
    if (this._enabledConnection) {
      return this._enabledConnection.evaluateOnCallFrame(frameIndex, expression);
    } else {
      throw this._noConnectionError();
    }
  }

  setPauseOnExceptions(state: ExceptionState): Promise {
    return this._breakpointStore.setPauseOnExceptions(state);
  }

  setBreakpoint(filename: string, lineNumber: number): string {
    return this._breakpointStore.setBreakpoint(filename, lineNumber);
  }

  removeBreakpoint(breakpointId: string): Promise {
    return this._breakpointStore.removeBreakpoint(breakpointId);
  }

  getStackFrames(): Promise<{stack: Array<Object>}> {
    if (this._enabledConnection) {
      return this._enabledConnection.getStackFrames();
    } else {
      // This occurs on startup with the loader breakpoint.
      return Promise.resolve({stack: []});
    }
  }

  getScopesForFrame(frameIndex: number): Promise<Scope> {
    if (this._enabledConnection) {
      return this._enabledConnection.getScopesForFrame(frameIndex);
    } else {
      throw this._noConnectionError();
    }
  }

  getStatus(): string {
    return this._status;
  }

  sendContinuationCommand(command: string): void {
    if (this._enabledConnection) {
      this._enabledConnection.sendContinuationCommand(command);
    } else {
      throw this._noConnectionError();
    }
  }

  sendBreakCommand(): Promise<boolean> {
    if (this._enabledConnection) {
      return this._enabledConnection.sendBreakCommand();
    } else {
      return Promise.resolve(false);
    }
  }

  getProperties(remoteId: RemoteObjectId): Promise<Array<PropertyDescriptor>> {
    if (this._enabledConnection) {
      return this._enabledConnection.getProperties(remoteId);
    } else {
      throw this._noConnectionError();
    }
  }

  dispose(): void {
    for (const connection of this._connections.keys()) {
      this._removeConnection(connection);
    }
    this._disposeConnector();
  }

  _removeConnection(connection: Connection): void {
    const info = this._connections.get(connection);
    info.onStatusDisposable.dispose();
    connection.dispose();
    this._connections.delete(connection);

    if (connection === this._enabledConnection) {
      this._disableConnection();
    }
    this._checkForEnd();
  }

  _disableConnection(): void {
    log('Mux disabling connection');
    this._enabledConnection = null;
    this._setStatus(STATUS_RUNNING);
  }

  _disposeConnector(): void {
    // Avoid recursion with connector's onClose event.
    const connector = this._connector;
    if (connector) {
      this._connector = null;
      connector.dispose();
    }
    this._checkForEnd();
  }

  _checkForEnd(): void {
    if (this._connections.size === 0 &&
       (!this._connector || this._config.endDebugWhenNoRequests)) {
      this._setStatus(STATUS_END);
    }
  }

  _noConnectionError(): Error {
    // This is an indication of a bug in the state machine.
    // .. we are seeing a request in a state that should not generate
    // that request.
    return new Error('No connection');
  }
}
