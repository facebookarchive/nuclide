/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import UniversalDisposable from '../../commons-node/UniversalDisposable';
import {logger} from './logger';
import {DebuggerConnection} from './DebuggerConnection';
import {PRELUDE_MESSAGES} from './prelude';
import invariant from 'assert';
import {RUNNING, PAUSED, ENDED} from './constants';
import {BreakpointManager} from './BreakpointManager';
import {Subject} from 'rxjs';

import type {
  DeviceInfo,
  RuntimeStatus,
} from './types';

const {log, logError} = logger;

/**
 * The ConnectionMultiplexer (CM) abstracts the many DebuggerConnections for each JSContext as one
 * single connection.  The frontend Nuclide client only has to be aware of this single connection.
 * There are three important APIs for this class:
 *
 * 1. When the CM is constructed, it must be passed a callback which will be called whenever the
 * target has a message to send to the frontend client.
 * 2. The `sendCommand` method can be called when the frontend client has a message to send to the
 * target.
 * 3. The `add` method can be called to add an additonal connection to be managed by the CM.
 */
export class ConnectionMultiplexer {
  _disposables: UniversalDisposable;
  _connections: Set<DebuggerConnection>;
  // Invariant: this._enabledConnection != null, if and only if that connection is paused.
  _enabledConnection: ?DebuggerConnection;
  _sendMessageToClient: (message: Object) => void;
  _newConnections: Subject<DebuggerConnection>;
  _breakpointManager: BreakpointManager;
  _freshConnectionId: number;

  constructor(sendMessageToClient: (message: Object) => void) {
    this._connections = new Set();
    this._sendMessageToClient = message => sendMessageToClient(message);
    this._freshConnectionId = 0;
    this._newConnections = new Subject();
    this._breakpointManager = new BreakpointManager(this._sendMessageToClient.bind(this));
    this._disposables = new UniversalDisposable(
      this._newConnections.subscribe(this._handleNewConnection.bind(this)),
      this._breakpointManager,
    );
  }

  sendCommand(message: Object): void {
    const [domain, method] = message.method.split('.');
    switch (domain) {
      case 'Debugger': {
        this._handleDebuggerMethod(method, message);
        break;
      }
      case 'Runtime': {
        this._handleRuntimeMethod(method, message);
        break;
      }
      case 'Console': {
        this._handleConsoleMethod(method, message);
        break;
      }
      default: {
        this._replyWithError(message.id, `Unhandled message: ${JSON.stringify(message)}`);
      }
    }
  }

  async _handleDebuggerMethod(method: string, message: Object): Promise<void> {
    switch (method) {
      // Methods.
      case 'enable': {
        this._replyWithDefaultSuccess(message.id);
        // Nuclide's debugger will auto-resume the first pause event, so we send a dummy pause
        // when the debugger initially attaches.
        this._sendFakeLoaderBreakpointPause();
        break;
      }
      case 'setBreakpointByUrl': {
        const response = await this._breakpointManager.setBreakpointByUrl(message);
        response.id = message.id;
        this._sendMessageToClient(response);
        break;
      }
      case 'removeBreakpoint': {
        const response = await this._breakpointManager.removeBreakpoint(message);
        response.id = message.id;
        this._sendMessageToClient(response);
        break;
      }
      case 'resume': {
        this._continuationCommand(message.id, method);
        break;
      }
      case 'stepOver': {
        this._continuationCommand(message.id, method);
        break;
      }
      case 'stepInto': {
        this._continuationCommand(message.id, method);
        break;
      }
      case 'stepOut': {
        this._continuationCommand(message.id, method);
        break;
      }
      case 'evaluateOnCallFrame': {
        this._evaluateOnCallFrame(message);
        break;
      }
      case 'setPauseOnExceptions': {
        const response = await this._breakpointManager.setPauseOnExceptions(message);
        response.id = message.id;
        this._sendMessageToClient(response);
        break;
      }

      // Events.  Typically we will just forward these to the client.
      case 'scriptParsed': {
        this._sendMessageToClient(message);
        break;
      }
      case 'paused': {
        // TODO: We may want to send Debugger.resumed here before the Debugger.paused event.
        // This is because we may already be paused, and wish to update the UI when we switch the
        // enabled connection.
        this._sendMessageToClient(message);
        this._updateThreads();
        break;
      }
      case 'resumed': {
        this._sendMessageToClient(message);
        break;
      }

      default: {
        this._replyWithError(message.id, `Unhandled message: ${JSON.stringify(message)}`);
      }
    }
  }

  _handleRuntimeMethod(method: string, message: Object): void {
    switch (method) {
      case 'enable': {
        this._replyWithDefaultSuccess(message.id);
        break;
      }
      case 'getProperties': {
        this._getProperties(message);
        break;
      }
      default: {
        this._replyWithError(message.id, `Unhandled message: ${JSON.stringify(message)}`);
      }
    }
  }

  _handleConsoleMethod(method: string, message: Object): void {
    switch (method) {
      case 'enable': {
        this._replyWithDefaultSuccess(message.id);
        break;
      }
      default: {
        this._replyWithError(message.id, `Unhandled message: ${JSON.stringify(message)}`);
      }
    }
  }

  _replyWithDefaultSuccess(id: number): void {
    this._sendMessageToClient({id, result: {}});
  }

  _replyWithError(id: number, message: string): void {
    this._sendMessageToClient({id, error: {message}});
  }

  _sendFakeLoaderBreakpointPause(): void {
    const debuggerPausedMessage = {
      method: 'Debugger.paused',
      params: {
        callFrames: [],
        reason: 'breakpoint',
        data: {},
      },
    };
    this._sendMessageToClient(debuggerPausedMessage);
  }

  async _getProperties(message: Object): Promise<void> {
    if (this._enabledConnection != null) {
      const response = await this._enabledConnection.sendCommand(message);
      this._sendMessageToClient(response);
    } else if (this._connections.size > 0) {
      const connection = this._connections.values().next().value;
      invariant(connection != null);
      const response = await connection.sendCommand(message);
      this._sendMessageToClient(response);
    } else {
      this._replyWithError(message.id, 'Runtime.getProperties sent but we have no connections');
    }
  }

  async _evaluateOnCallFrame(message: Object): Promise<void> {
    if (this._enabledConnection != null) {
      const response = await this._enabledConnection.sendCommand(message);
      response.id = message.id;
      this._sendMessageToClient(response);
    } else {
      this._replyWithError(message.id, `${message.method} sent to running connection`);
    }
  }

  async _continuationCommand(id: number, method: string): Promise<void> {
    if (this._enabledConnection != null) {
      const response = await this._enabledConnection.sendCommand({
        id,
        method: `Debugger.${method}`,
      });
      this._sendMessageToClient(response);
    } else {
      this._replyWithError(id, `Debugger.${method} sent to running connection`);
    }
    return Promise.resolve();
  }

  async add(deviceInfo: DeviceInfo): Promise<void> {
    const connection = this._connectToContext(deviceInfo);
    this._newConnections.next(connection);
  }

  _connectToContext(deviceInfo: DeviceInfo): DebuggerConnection {
    const connection = new DebuggerConnection(this._freshConnectionId++, deviceInfo);
    // While it is the CM's responsibility to create these subscriptions, their lifetimes are the
    // same as the connection, so their disposal will be handled by the connection.
    connection.onDispose(
      connection
        .getStatusChanges()
        .subscribe(status => this._handleStatusChange(status, connection)),
      connection.subscribeToEvents(this.sendCommand.bind(this)),
    );
    this._disposables.add(connection);
    this._connections.add(connection);
    return connection;
  }

  async _handleNewConnection(connection: DebuggerConnection): Promise<void> {
    // When a connection comes in, we need to do a few things:
    // 1. Exchange prelude messages, enabling the relevant domains, etc.
    await this._sendPreludeToTarget(connection);
    // 2. Add this connection to the breakpoint manager so that will handle breakpoints.
    await this._breakpointManager.addConnection(connection);
  }

  async _sendPreludeToTarget(connection: DebuggerConnection): Promise<void> {
    const responsePromises: Array<Promise<Object>> = [];
    for (const message of PRELUDE_MESSAGES) {
      responsePromises.push(connection.sendCommand(message));
    }
    const responses = await Promise.all(responsePromises);
    if (!responses.every(response => response.result != null && response.error == null)) {
      const err = `A prelude message response was an error: ${JSON.stringify(responses)}`;
      logError(err);
      throw new Error(err);
    }
  }

  _handleStatusChange(status: RuntimeStatus, connection: DebuggerConnection): void {
    switch (status) {
      case RUNNING: {
        this._handleRunningMode(connection);
        break;
      }
      case PAUSED: {
        this._handlePausedMode(connection);
        break;
      }
      case ENDED: {
        this._handleEndedMode(connection);
        break;
      }
      default: {
        invariant(false, `Unknown status: ${status}`);
      }
    }
    log(`Switching status to: ${status}`);
  }

  _handleRunningMode(connection: DebuggerConnection): void {
    // We will enable another paused connection if one exists.
    for (const candidate of this._connections) {
      if (candidate.isPaused()) {
        this._enabledConnection = candidate;
        return;
      }
    }
    this._enabledConnection = null;
  }

  _handlePausedMode(connection: DebuggerConnection): void {
    if (this._enabledConnection == null) {
      this._enabledConnection = connection;
    }
  }

  _handleEndedMode(connection: DebuggerConnection): void {
    this._breakpointManager.removeConnection(connection);
    const wasFound = this._connections.delete(connection);
    if (wasFound) {
      this._disposables.remove(connection);
      connection.dispose();
    }
  }

  _updateThreads(): void {
    for (const connection of this._connections.values()) {
      this._sendMessageToClient({
        method: 'Debugger.threadUpdated',
        params: {
          thread: {
            id: String(connection.getId()),
            name: connection.getName(),
            address: connection.getName(),
            location: {},
            stopReason: connection.getStatus(),
            description: connection.getName(),
          },
        },
      });
    }
  }

  dispose(): void {
    this._disposables.dispose();
  }
}
