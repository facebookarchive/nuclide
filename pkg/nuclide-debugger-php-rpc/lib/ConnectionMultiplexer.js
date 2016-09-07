'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import logger from './utils';
import {launchPhpScriptWithXDebugEnabled} from './helpers';
import {Connection} from './Connection';
import {getConfig} from './config';
import {getSettings} from './settings';

import {
  isDummyConnection,
  sendDummyRequest,
  isCorrectConnection,
  failConnection,
} from './ConnectionUtils';
import {BreakpointStore} from './BreakpointStore';
import {DbgpConnector} from './DbgpConnector';
import {
  CONNECTION_STATUS,
  BREAKPOINT_RESOLVED_NOTIFICATION,
  COMMAND_RUN,
} from './DbgpSocket';
import {
  ASYNC_BREAK,
} from './Connection';
import EventEmitter from 'events';
import invariant from 'assert';
import {ClientCallback} from './ClientCallback';
import {attachEvent} from '../../commons-node/event';

import type {Socket} from 'net';
import type {DbgpBreakpoint} from './DbgpSocket';

const CONNECTION_MUX_STATUS_EVENT = 'connection-mux-status';
const CONNECTION_MUX_NOTIFICATION_EVENT = 'connection-mux-notification';


export const MULTIPLEXER_STATUS = {
  STARTING: 'multiplexer_starting',
  RUNNING: 'multiplexer_running',
  BREAK: 'multiplexer_break',
  END: 'multiplexer_end',
  ALL_CONNECTIONS_BREAK: 'all_connections_break',
  USER_ASYNC_BREAK_SENT: 'async_break_sent',
};

export const CONNECTION_MUX_NOTIFICATION = {
  REQUEST_UPDATE: 'notification_request_update',
};


type DbgpError = {
  $: {
    code: number,
  },
  message: Array<string>,
};

type EvaluationFailureResult = {
  error: DbgpError,
  wasThrown: boolean,
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
// and if either the attach or launch DbgpConnectors are closed. The DbgpConnectors will likely only
// close if HHVM crashes or is stopped.
export class ConnectionMultiplexer {
  _clientCallback: ClientCallback;
  _breakpointStore: BreakpointStore;
  _connectionStatusEmitter: EventEmitter;
  _status: string;
  _previousConnection: ?Connection;
  _enabledConnection: ?Connection;
  _dummyConnection: ?Connection;
  _connections: Map<number, Connection>;
  _attachConnector: ?DbgpConnector;
  _launchConnector: ?DbgpConnector;
  _dummyRequestProcess: ?child_process$ChildProcess;
  _launchedScriptProcess: ?child_process$ChildProcess;
  _launchedScriptProcessPromise: ?Promise<void>;
  _requestSwitchMessage: ?string;
  _lastEnabledConnection: ?Connection;

  constructor(clientCallback: ClientCallback) {
    this._clientCallback = clientCallback;
    this._status = MULTIPLEXER_STATUS.STARTING;
    this._connectionStatusEmitter = new EventEmitter();
    this._previousConnection = null;
    this._enabledConnection = null;
    this._dummyConnection = null;
    this._connections = new Map();
    this._attachConnector = null;
    this._launchConnector = null;
    this._dummyRequestProcess = null;
    this._breakpointStore = new BreakpointStore();
    this._launchedScriptProcess = null;
    this._launchedScriptProcessPromise = null;
    this._requestSwitchMessage = null;
    this._lastEnabledConnection = null;
  }

  onStatus(callback: (status: string) => mixed): IDisposable {
    return attachEvent(this._connectionStatusEmitter,
      CONNECTION_MUX_STATUS_EVENT, callback);
  }

  onNotification(callback: (status: string, params: ?Object) => mixed): IDisposable {
    return attachEvent(this._connectionStatusEmitter,
      CONNECTION_MUX_NOTIFICATION_EVENT, callback);
  }

  listen(): void {
    const {xdebugAttachPort, xdebugLaunchingPort, launchScriptPath} = getConfig();
    if (launchScriptPath == null) {
      // When in attach mode we are guaranteed that the two ports are not equal.
      invariant(xdebugAttachPort !== xdebugLaunchingPort, 'xdebug ports are equal in attach mode');
      // In this case we need to listen for incoming connections to attach to, as well as on the
      // port that the dummy connection will use.
      this._attachConnector = this._setupConnector(
        xdebugAttachPort,
        this._disposeAttachConnector.bind(this),
      );
    }

    // If we are only doing script debugging, then the dummy connection listener's port can also be
    // used to listen for the script's xdebug requests.
    this._launchConnector = this._setupConnector(
      xdebugLaunchingPort,
      this._disposeLaunchConnector.bind(this),
    );

    this._status = MULTIPLEXER_STATUS.RUNNING;

    const pleaseWaitMessage = {
      level: 'warning',
      text: 'Pre-loading, please wait...',
    };
    this._clientCallback.sendUserMessage('console', pleaseWaitMessage);
    this._clientCallback.sendUserMessage('outputWindow', pleaseWaitMessage);
    this._dummyRequestProcess = sendDummyRequest();

    if (launchScriptPath != null) {
      this._launchedScriptProcessPromise = new Promise(resolve => {
        this._launchedScriptProcess = launchPhpScriptWithXDebugEnabled(launchScriptPath, text => {
          this._clientCallback.sendUserMessage('outputWindow', {level: 'info', text});
          resolve();
        });
      });
    }
  }

  _setupConnector(port: number, disposeConnector: () => void): DbgpConnector {
    const connector = new DbgpConnector(port);
    connector.onAttach(this._onAttach.bind(this));
    connector.onClose(disposeConnector);
    connector.onError(this._handleAttachError.bind(this));
    connector.listen();
    return connector;
  }

  async _handleDummyConnection(socket: Socket): Promise<void> {
    logger.log('ConnectionMultiplexer successfully got dummy connection.');
    const dummyConnection = new Connection(
      socket,
      (status, message) => {
        switch (status) {
          case CONNECTION_STATUS.STDOUT:
            this._sendOutput(message, 'log');
            break;
          case CONNECTION_STATUS.STDERR:
            this._sendOutput(message, 'info');
            break;
        }
      },
    );
    await this._handleSetupForConnection(dummyConnection);

    // Continue from loader breakpoint to hit xdebug_break()
    // which will load whole www repo for evaluation if possible.
    await dummyConnection.sendContinuationCommand(COMMAND_RUN);
    this._dummyConnection = dummyConnection;

    const text = 'Pre-loading is done! You can use console window now.';
    this._clientCallback.sendUserMessage('console', {text, level: 'warning'});
    this._clientCallback.sendUserMessage('outputWindow', {text, level: 'success'});
  }

  // For testing purpose.
  getDummyConnection(): ?Connection {
    return this._dummyConnection;
  }

  async _onAttach(params: {socket: Socket, message: Object}): Promise<any> {
    const {socket, message} = params;
    if (!isCorrectConnection(message)) {
      failConnection(socket, 'Discarding connection ' + JSON.stringify(message));
      return;
    }
    if (isDummyConnection(message)) {
      await this._handleDummyConnection(socket);
    } else {
      await this._handleNewConnection(socket);
    }
  }

  async _handleNewConnection(socket: Socket): Promise<void> {
    const connection = new Connection(
      socket,
      this._connectionOnStatus.bind(this),
      this._handleNotification.bind(this),
    );
    this._connections.set(connection.getId(), connection);
    await this._handleSetupForConnection(connection);
    await this._breakpointStore.addConnection(connection);
    this._connectionOnStatus(connection, connection.getStatus());
  }

  _handleNotification(
    connection: Connection,
    notifyName: string,
    notify: Object,
  ): void {
    switch (notifyName) {
      case BREAKPOINT_RESOLVED_NOTIFICATION:
        const xdebugBreakpoint: DbgpBreakpoint = notify;
        const breakpointId = this._breakpointStore.getBreakpointIdFromConnection(
          connection,
          xdebugBreakpoint,
        );
        if (breakpointId == null) {
          throw Error(
            `Cannot find xdebug breakpoint ${JSON.stringify(xdebugBreakpoint)} in connection.`,
          );
        }
        this._breakpointStore.updateBreakpoint(breakpointId, xdebugBreakpoint);
        const breakpoint = this._breakpointStore.getBreakpoint(breakpointId);
        this._emitNotification(BREAKPOINT_RESOLVED_NOTIFICATION, breakpoint);
        break;
      default:
        logger.logError(`Unknown notify: ${notifyName}`);
        break;
    }
  }

  _shouldPauseAllConnections(): boolean {
    return this._status === MULTIPLEXER_STATUS.USER_ASYNC_BREAK_SENT ||
      this._status === MULTIPLEXER_STATUS.ALL_CONNECTIONS_BREAK;
  }

  _connectionOnStatus(connection: Connection, status: string, ...args: Array<string>): void {
    logger.log(`Mux got status: ${status} on connection ${connection.getId()}`);

    switch (status) {
      case CONNECTION_STATUS.STARTING:
        // Starting status has no stack.
        // step before reporting initial status to get to the first instruction.
        // TODO: Use loader breakpoint configuration to choose between step/run.
        if (!this._shouldPauseAllConnections()) {
          connection.sendContinuationCommand(COMMAND_RUN);
        } else {
          this._emitRequestUpdate(connection);
        }
        return;
      case CONNECTION_STATUS.STOPPING:
        // TODO: May want to enable post-mortem features?
        if (this._isPaused()) {
          this._emitRequestUpdate(connection);
        }
        connection.sendContinuationCommand(COMMAND_RUN);
        return;
      case CONNECTION_STATUS.RUNNING:
        if (connection === this._enabledConnection) {
          this._disableConnection();
        } else if (this._isPaused()) {
          this._emitRequestUpdate(connection);
        }
        break;
      case CONNECTION_STATUS.BREAK:
        if (this._isPaused()) {
          // We don't want to send the first threads updated message until the debugger is
          // paused.
          this._emitRequestUpdate(connection);
        }
        break;
      case CONNECTION_STATUS.ERROR:
        let message = 'The debugger encountered a problem and the connection had to be shut down.';
        if (args[0] != null) {
          message = `${message}  Error message: ${args[0]}`;
        }
        this._clientCallback.sendUserMessage('notification', {
          type: 'error',
          message,
        });
        if (this._isPaused()) {
          this._emitRequestUpdate(connection);
        }
        this._removeConnection(connection);
        break;
      case CONNECTION_STATUS.STOPPED:
      case CONNECTION_STATUS.END:
        if (this._isPaused()) {
          this._emitRequestUpdate(connection);
        }
        this._removeConnection(connection);
        break;
      case CONNECTION_STATUS.STDOUT:
        this._sendOutput(args[0], 'log');
        break;
      case CONNECTION_STATUS.STDERR:
        this._sendOutput(args[0], 'info');
        break;
    }

    this._updateStatus();
  }

  _sendOutput(message: string, level: string): void {
    this._clientCallback.sendUserMessage('outputWindow', {
      level,
      text: message,
    });
  }

  _updateStatus(): void {
    if (this._status === MULTIPLEXER_STATUS.END) {
      return;
    }

    if (this._status === MULTIPLEXER_STATUS.BREAK ||
      this._status === MULTIPLEXER_STATUS.ALL_CONNECTIONS_BREAK) {
      logger.log('Mux already in break status');
      return;
    }

    // now check if we can move from running to break...
    for (const connection of this._connections.values()) {
      if (this._shouldEnableConnection(connection)) {
        this._enableConnection(connection);
        break;
      }
    }
  }

  _shouldEnableConnection(connection: Connection): boolean {
    return connection.getStatus() === CONNECTION_STATUS.BREAK &&
      // Only enable connection paused by async_break if user has explicityly issued an async_break.
      (connection.getStopReason() !== ASYNC_BREAK ||
      this._status === MULTIPLEXER_STATUS.USER_ASYNC_BREAK_SENT) &&
      // Don't switch threads unnecessarily in single thread stepping mode
      (!(getSettings().singleThreadStepping) || this._lastEnabledConnection === null ||
      connection === this._lastEnabledConnection);
  }

  _enableConnection(connection: Connection): void {
    logger.log('Mux enabling connection');
    this._enabledConnection = connection;
    this._handlePotentialRequestSwitch(connection);
    this._lastEnabledConnection = connection;
    this._setBreakStatus();
    this._sendRequestInfo(connection);
    this._pauseConnectionsIfNeeded();
  }

  _pauseConnectionsIfNeeded(): void {
    if (getConfig().stopOneStopAll && this._status !== MULTIPLEXER_STATUS.USER_ASYNC_BREAK_SENT) {
      this._asyncBreak();
    }
  }

  _setBreakStatus(): void {
    this._setStatus(
      (this._status === MULTIPLEXER_STATUS.USER_ASYNC_BREAK_SENT || getConfig().stopOneStopAll) ?
        MULTIPLEXER_STATUS.ALL_CONNECTIONS_BREAK : MULTIPLEXER_STATUS.BREAK);
  }

  _sendRequestInfo(connection: Connection): void {
    for (const backgroundConnection of this._connections.values()) {
      this._emitRequestUpdate(backgroundConnection);
    }
  }

  _emitRequestUpdate(connection: Connection): void {
    this._emitNotification(CONNECTION_MUX_NOTIFICATION.REQUEST_UPDATE,
      {
        id: connection.getId(),
        status: connection.getStatus(),
        stopReason: connection.getStopReason() || connection.getStatus(),
      },
    );
  }

  _setStatus(status: string): void {
    if (status !== this._status) {
      this._status = status;
      this._emitStatus(status);
    }
  }

  _handlePotentialRequestSwitch(connection: Connection): void {
    if (this._previousConnection != null && connection !== this._previousConnection) {
      // The enabled connection is different than it was last time the debugger paused
      // so we know that the active request has switched so we should alert the user.
      this._requestSwitchMessage = 'Active request switched';
    }
    this._previousConnection = connection;
  }

  _handleAttachError(error: string): void {
    this._clientCallback.sendUserMessage('notification', {
      type: 'error',
      message: error,
    });
  }

  _emitStatus(status: string): void {
    this._connectionStatusEmitter.emit(CONNECTION_MUX_STATUS_EVENT, status);
  }

  _emitNotification(status: string, params: ?Object): void {
    this._connectionStatusEmitter.emit(CONNECTION_MUX_NOTIFICATION_EVENT, status, params);
  }

  async runtimeEvaluate(expression: string): Promise<Object> {
    logger.log(`runtimeEvaluate() on dummy connection for: ${expression}`);
    if (this._dummyConnection != null) {
      // Global runtime evaluation on dummy connection does not care about
      // which frame it is being evaluated on so choose top frame here.
      const result = await this._dummyConnection.runtimeEvaluate(0, expression);
      this._reportEvaluationFailureIfNeeded(expression, result);
      return result;
    } else {
      throw this._noConnectionError();
    }
  }

  async evaluateOnCallFrame(frameIndex: number, expression: string): Promise<Object> {
    if (this._enabledConnection) {
      const result = await this._enabledConnection.evaluateOnCallFrame(frameIndex, expression);
      this._reportEvaluationFailureIfNeeded(expression, result);
      return result;
    } else {
      throw this._noConnectionError();
    }
  }

  _reportEvaluationFailureIfNeeded(expression: string, result: EvaluationFailureResult): void {
    if (result.wasThrown) {
      const message = {
        text: 'Failed to evaluate '
          + `"${expression}": (${result.error.$.code}) ${result.error.message[0]}`,
        level: 'error',
      };
      this._clientCallback.sendUserMessage('console', message);
      this._clientCallback.sendUserMessage('outputWindow', message);
    }
  }

  getBreakpointStore(): BreakpointStore {
    return this._breakpointStore;
  }

  removeBreakpoint(breakpointId: string): Promise<any> {
    return this._breakpointStore.removeBreakpoint(breakpointId);
  }

  getStackFrames(): Promise<{stack: Object}> {
    if (this._enabledConnection) {
      return this._enabledConnection.getStackFrames();
    } else {
      // This occurs on startup with the loader breakpoint.
      return Promise.resolve({stack: {}});
    }
  }

  getConnectionStackFrames(id: number): Promise<{stack: Object}> {
    const connection = this._connections.get(id);
    if (connection != null && connection.getStatus() === CONNECTION_STATUS.BREAK) {
      return connection.getStackFrames();
    } else {
      // This occurs on startup with the loader breakpoint.
      return Promise.resolve({stack: {}});
    }
  }


  getScopesForFrame(frameIndex: number): Promise<Array<Debugger$Scope>> {
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
    this._resumeBackgroundConnections();
    if (this._enabledConnection) {
      this._enabledConnection.sendContinuationCommand(command);
    } else {
      throw this._noConnectionError();
    }
  }

  _resumeBackgroundConnections(): void {
    for (const connection of this._connections.values()) {
      if (
        connection !== this._enabledConnection &&
        (connection.getStopReason() === ASYNC_BREAK ||
        connection.getStatus() === CONNECTION_STATUS.STARTING)
      ) {
        connection.sendContinuationCommand(COMMAND_RUN);
      }
    }
  }

  _asyncBreak(): void {
    for (const connection of this._connections.values()) {
      if (connection.getStatus() === CONNECTION_STATUS.RUNNING) {
        connection.sendBreakCommand();
      }
    }
  }

  pause(): void {
    this._status = MULTIPLEXER_STATUS.USER_ASYNC_BREAK_SENT;
    // allow a connection that hasnt hit a breakpoint to be enabled, then break all connections.
    this._asyncBreak();
  }

  resume(): void {
    // For now we will have only single thread stepping, not single thread running.
    this._lastEnabledConnection = null;
    this.sendContinuationCommand(COMMAND_RUN);
  }

  getProperties(remoteId: Runtime$RemoteObjectId): Promise<Array<Runtime$PropertyDescriptor>> {
    if (this._enabledConnection) {
      return this._enabledConnection.getProperties(remoteId);
    } else if (this._dummyConnection) {
      return this._dummyConnection.getProperties(remoteId);
    } else {
      throw this._noConnectionError();
    }
  }

  _removeConnection(connection: Connection): void {
    connection.dispose();
    this._connections.delete(connection.getId());

    if (connection === this._enabledConnection) {
      this._disableConnection();
      this._lastEnabledConnection = null;
    }
    this._checkForEnd();
  }

  _disableConnection(): void {
    logger.log('Mux disabling connection');
    this._enabledConnection = null;
    this._setStatus(MULTIPLEXER_STATUS.RUNNING);
  }

  _disposeAttachConnector(): void {
    // Avoid recursion with connector's onClose event.
    const connector = this._attachConnector;
    if (connector != null) {
      this._attachConnector = null;
      connector.dispose();
    }
    this._checkForEnd();
  }

  _disposeLaunchConnector(): void {
    // Avoid recursion with connector's onClose event.
    const connector = this._launchConnector;
    if (connector != null) {
      this._launchConnector = null;
      connector.dispose();
    }
    this._checkForEnd();
  }

  async _checkForEnd(): Promise<void> {
    if (this._connections.size === 0 &&
      (this._attachConnector == null ||
        this._launchConnector == null ||
        getConfig().endDebugWhenNoRequests)) {

      if (this._launchedScriptProcessPromise != null) {
        await this._launchedScriptProcessPromise;
        this._launchedScriptProcessPromise = null;
      }

      this._setStatus(MULTIPLEXER_STATUS.END);
    }
  }

  _noConnectionError(): Error {
    // This is an indication of a bug in the state machine.
    // .. we are seeing a request in a state that should not generate
    // that request.
    return new Error('No connection');
  }

  async _handleSetupForConnection(connection: Connection): Promise<void> {
    await this._setupStdStreams(connection);
    await this._setupFeatures(connection);
  }

  async _setupStdStreams(connection: Connection): Promise<void> {
    const stdoutRequestSucceeded = await connection.sendStdoutRequest();
    if (!stdoutRequestSucceeded) {
      logger.logError('HHVM returned failure for a stdout request');
      this._clientCallback.sendUserMessage('outputWindow', {
        level: 'error',
        text: 'HHVM failed to redirect stdout, so no output will be sent to the output window.',
      });
    }
    // TODO: Stderr redirection is not implemented in HHVM so we won't check this return value.
    await connection.sendStderrRequest();
  }

  async _setupFeatures(connection: Connection): Promise<void> {
    // max_depth sets the depth that the debugger engine respects when
    // returning hierarchical data.
    let setFeatureSucceeded = await connection.setFeature('max_depth', '5');
    if (!setFeatureSucceeded) {
      logger.logError('HHVM returned failure for setting feature max_depth');
    }
    // show_hidden allows the client to request data from private class members.
    setFeatureSucceeded = await connection.setFeature('show_hidden', '1');
    if (!setFeatureSucceeded) {
      logger.logError('HHVM returned failure for setting feature show_hidden');
    }
    // Turn on notifications.
    setFeatureSucceeded = await connection.setFeature('notify_ok', '1');
    if (!setFeatureSucceeded) {
      logger.logError('HHVM returned failure for setting feature notify_ok');
    }
  }

  _isPaused(): boolean {
    return this._status === MULTIPLEXER_STATUS.BREAK ||
           this._status === MULTIPLEXER_STATUS.ALL_CONNECTIONS_BREAK;
  }

  getRequestSwitchMessage(): ?string {
    return this._requestSwitchMessage;
  }

  resetRequestSwitchMessage(): void {
    this._requestSwitchMessage = null;
  }

  getEnabledConnectionId(): ?number {
    if (this._enabledConnection != null) {
      return this._enabledConnection.getId();
    } else {
      return null;
    }
  }

  selectThread(id: number): void {
    const connection = this._connections.get(id);
    if (connection != null && connection.getStatus() === CONNECTION_STATUS.BREAK) {
      this._enabledConnection = connection;
    }
  }

  dispose(): void {
    if (this._launchedScriptProcess != null) {
      this._launchedScriptProcessPromise = null;
      this._launchedScriptProcess.kill('SIGKILL');
      this._launchedScriptProcess = null;
    }
    for (const connection of this._connections.values()) {
      this._removeConnection(connection);
    }
    if (this._dummyRequestProcess) {
      this._dummyRequestProcess.kill('SIGKILL');
    }
    this._disposeLaunchConnector();
    this._disposeAttachConnector();
  }
}
