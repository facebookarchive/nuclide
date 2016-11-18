'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import UniversalDisposable from '../../commons-node/UniversalDisposable';
import {logger} from './logger';
import {DebuggerConnection} from './DebuggerConnection';
import {PRELUDE_MESSAGES} from './prelude';
import {FileCache} from './FileCache';
import invariant from 'assert';
import {RUNNING, PAUSED} from './constants';

import type {
  RuntimeStatus,
  IosDeviceInfo,
  BreakpointId,
  BreakpointParams,
  PauseOnExceptionState,
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
  _fileCache: FileCache;
  _breakpoints: Map<BreakpointId, BreakpointParams>;
  _setPauseOnExceptionsState: PauseOnExceptionState;
  _freshConnectionId: number;

  constructor(sendMessageToClient: (message: Object) => void) {
    this._disposables = new UniversalDisposable();
    this._connections = new Set();
    this._sendMessageToClient = message => sendMessageToClient(message);
    this._fileCache = new FileCache();
    this._breakpoints = new Map();
    this._setPauseOnExceptionsState = 'none';
    this._freshConnectionId = 0;
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
        const response = await this._setBreakpointByUrl(message);
        this._sendMessageToClient(response);
        break;
      }
      case 'removeBreakpoint': {
        const response = await this._removeBreakpoint(message);
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
        const response = await this._setPauseOnExceptions(message);
        this._sendMessageToClient(response);
        break;
      }

      // Events.  Typically we will just forward these to the client.
      case 'scriptParsed': {
        const clientMessage = await this._fileCache.scriptParsed(message);
        this._sendMessageToClient(clientMessage);
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

  async _setPauseOnExceptions(message: Object): Promise<Object> {
    if (this._connections.size === 0) {
      return {id: message.id, error: {message: 'setPauseOnExceptions sent with no connections.'}};
    }
    this._setPauseOnExceptionsState = message.params.state;
    const responsePromises = [];
    for (const connection of this._connections) {
      responsePromises.push(connection.sendCommand(message));
    }
    const responses = await Promise.all(responsePromises);
    log(`setPauseOnExceptions yielded: ${JSON.stringify(responses)}`);
    for (const response of responses) {
      // We can receive multiple responses, so just send the first non-error one.
      if (response.result != null && response.error == null) {
        return response;
      }
    }
    return responses[0];
  }

  /**
   * setBreakpointByUrl must send this breakpoint to each connection managed by the multiplexer.
   */
  async _setBreakpointByUrl(message: Object): Promise<Object> {
    if (this._connections.size === 0) {
      return {id: message.id, error: {message: 'setBreakpointByUrl sent with no connections.'}};
    }
    const {params} = message;
    const targetMessage = {
      ...message,
      params: {
        ...message.params,
        url: this._fileCache.getUrlFromFilePath(message.params.url),
      },
    };
    const responsePromises = Array.from(this._connections.values())
      .map(connection => connection.sendCommand(targetMessage));
    const responses = await Promise.all(responsePromises);
    log(`setBreakpointByUrl yielded: ${JSON.stringify(responses)}`);
    for (const response of responses) {
      // We will receive multiple responses, so just send the first non-error one.
      if (response.result != null && response.error == null) {
        this._breakpoints.set(response.result.breakpointId, params);
        return response;
      }
    }
    return responses[0];
  }

  /**
   * removeBreakpoint must send this message to each connection managed by the multiplexer.
   */
  async _removeBreakpoint(message: Object): Promise<Object> {
    if (this._connections.size === 0) {
      return {id: message.id, error: {message: 'removeBreakpoint sent with no connections.'}};
    }
    const responsePromises = Array.from(this._connections.values())
      .map(connection => connection.sendCommand(message));
    const responses = await Promise.all(responsePromises);
    log(`removeBreakpoint yielded: ${JSON.stringify(responses)}`);
    for (const response of responses) {
      // We will receive multiple responses, so just send the first non-error one.
      if (response.result != null && response.error == null) {
        this._breakpoints.delete(response.result.breakpointId);
        return response;
      }
    }
    return responses[0];
  }

  async add(deviceInfo: IosDeviceInfo): Promise<void> {
    // Adding a new JS Context involves a few steps:
    // 1. Set up the connection to the device.
    const connection = this._connectToContext(deviceInfo);
    // 2. Exchange prelude messages, enabling the relevant domains, etc.
    await this._sendPreludeToTarget(connection);
    await Promise.all([
      // 3. Once this is done, set all of the breakpoints we currently have.
      this._sendBreakpointsToTarget(connection),
      // 4. Set the pause on exception state.
      this._sendSetPauseOnExceptionToTarget(connection),
    ]);
  }

  _connectToContext(deviceInfo: IosDeviceInfo): DebuggerConnection {
    const connection = new DebuggerConnection(this._freshConnectionId++, deviceInfo);
    this._disposables.add(
      connection
        .getStatusChanges()
        .subscribe(status => this._handleStatusChange(status, connection)),
      connection.subscribeToEvents(this.sendCommand.bind(this)),
    );
    this._connections.add(connection);
    return connection;
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

  async _sendBreakpointsToTarget(connection: DebuggerConnection): Promise<void> {
    const responsePromises = [];
    for (const breakpointParams of this._breakpoints.values()) {
      responsePromises.push(
        connection.sendCommand({
          method: 'Debugger.setBreakpointByUrl',
          params: {
            ...breakpointParams,
            url: this._fileCache.getUrlFromFilePath(breakpointParams.url),
          },
        }),
      );
    }
    // Drop the responses on the floor, since setting initial bp's is handled by CM.
    await Promise.all(responsePromises);
  }

  async _sendSetPauseOnExceptionToTarget(connection: DebuggerConnection): Promise<void> {
    // Drop the responses on the floor, since setting initial pauseOnException is handled by CM.
    await connection.sendCommand({
      method: 'Debugger.setPauseOnExceptions',
      params: this._setPauseOnExceptionsState,
    });
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
