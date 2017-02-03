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

import type {
  BreakpointId,
  BreakpointParams,
  Breakpoint,
  PauseOnExceptionState,
} from './types';
import type {DebuggerConnection} from './DebuggerConnection';
import type {FileCache} from './FileCache';

const {log} = logger;
const BREAKPOINT_ID_PREFIX = 'NUCLIDE';

export class BreakpointManager {
  _disposables: UniversalDisposable;
  _breakpoints: Map<BreakpointId, Breakpoint>;
  _fileCache: FileCache;
  _connections: Set<DebuggerConnection>;
  _sendMessageToClient: (message: Object) => void;
  _setPauseOnExceptionsState: PauseOnExceptionState;
  _resolvePendingExceptionBreakpointMessage: ?() => mixed;

  constructor(fileCache: FileCache, sendMessageToClient: (message: Object) => void) {
    this._breakpoints = new Map();
    this._fileCache = fileCache;
    this._connections = new Set();
    this._sendMessageToClient = sendMessageToClient;
    this._disposables = new UniversalDisposable(() => this._connections.clear());
    this._setPauseOnExceptionsState = 'none';
  }

  addConnection(connection: DebuggerConnection): Promise<mixed> {
    this._connections.add(connection);
    return Promise.all([
      // Send file/line breakpoints.
      this._sendLineBreakpointsToTarget(connection),
      // Send exception breakpoints.
      this._sendSetPauseOnExceptionToTarget(connection),
    ]);
  }

  removeConnection(connection: DebuggerConnection): void {
    this._connections.delete(connection);
  }

  async _sendLineBreakpointsToTarget(connection: DebuggerConnection): Promise<void> {
    const responsePromises = [];
    for (const breakpoint of this._breakpoints.values()) {
      const {params} = breakpoint;
      const responsePromise = connection.sendCommand({
        method: 'Debugger.setBreakpointByUrl',
        params: {
          ...params,
          url: this._fileCache.getUrlFromFilePath(params.url),
        },
      });
      if (breakpoint.resolved) {
        responsePromises.push(responsePromise);
      } else {
        responsePromises.push(
          responsePromise.then(response => {
            // We are assuming that breakpoints will only be unresolved if they are sent when there
            // are no connections present.
            breakpoint.resolved = true;
            this._sendMessageToClient({
              method: 'Debugger.breakpointResolved',
              params: {
                breakpointId: breakpoint.nuclideId,
                location: response.result.location,
              },
            });
          }),
        );
      }
    }
    // Wait for `setBreakpointByUrl` messages to go out and come back.
    await Promise.all(responsePromises);
  }

  _sendSetPauseOnExceptionToTarget(connection: DebuggerConnection): Promise<mixed> {
    const resolve = this._resolvePendingExceptionBreakpointMessage;
    if (resolve != null) {
      resolve();
      return Promise.resolve();
    }
    return connection.sendCommand({
      method: 'Debugger.setPauseOnExceptions',
      params: this._setPauseOnExceptionsState,
    });
  }

  async setPauseOnExceptions(message: Object): Promise<Object> {
    this._setPauseOnExceptionsState = message.params.state;
    if (this._connections.size === 0) {
      // Wait for a connection to come in.
      await new Promise(resolve => {
        this._resolvePendingExceptionBreakpointMessage = resolve;
      });
      this._resolvePendingExceptionBreakpointMessage = null;
    }
    return this._setPauseOnExceptions(message);
  }

  async _setPauseOnExceptions(message: Object): Promise<Object> {
    const responses = await this._sendMessageToAllTargets(message);
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
  setBreakpointByUrl(message: Object): Promise<Object> {
    if (this._connections.size === 0) {
      return Promise.resolve(this._setUnresolvedBreakpointByUrl(message));
    }
    return this._setBreakpointByUrl(message);
  }

  _setUnresolvedBreakpointByUrl(message: Object): Object {
    const {params} = message;
    const nuclideId = createNuclideId(params);
    const breakpoint: Breakpoint = {
      nuclideId,
      params,
      jscId: null,
      resolved: false,
    };
    this._breakpoints.set(nuclideId, breakpoint);
    return {
      id: message.id,
      result: {
        breakpointId: nuclideId,
        // Chrome devtools used to rely on `locations` being set, but Nuclide tracks the unresolved
        // location independently from this response.
        locations: [],
        resolved: false,
      },
    };
  }

  async _setBreakpointByUrl(message: Object): Promise<Object> {
    const {params} = message;
    const nuclideId = createNuclideId(params);
    const breakpoint: Breakpoint = {
      nuclideId,
      params,
      jscId: null,
      resolved: true,
    };
    this._breakpoints.set(nuclideId, breakpoint);
    const targetMessage = {
      ...message,
      params: {
        ...message.params,
        url: this._fileCache.getUrlFromFilePath(message.params.url),
      },
    };
    const responses = await this._sendMessageToAllTargets(targetMessage);
    log(`setBreakpointByUrl yielded: ${JSON.stringify(responses)}`);
    for (const response of responses) {
      // We will receive multiple responses, so just send the first non-error one.
      if (
        response.result != null
        && response.error == null
        && response.result.breakpointId != null
      ) {
        breakpoint.jscId = response.result.breakpointId;
        response.result.breakpointId = nuclideId;
        return response;
      }
    }
    return responses[0];
  }

  /**
   * removeBreakpoint must send this message to each connection managed by the multiplexer.
   */
  async removeBreakpoint(message: Object): Promise<Object> {
    const {id} = message;
    const {breakpointId} = message.params;
    const breakpoint = this._breakpoints.get(breakpointId);
    if (breakpoint == null) {
      return {id};
    }
    const targetMessage = {
      ...message,
      params: {
        breakpointId: breakpoint.jscId,
      },
    };
    const responses = await this._sendMessageToAllTargets(targetMessage);
    log(`removeBreakpoint yielded: ${JSON.stringify(responses)}`);
    this._breakpoints.delete(breakpoint.nuclideId);
    return {id};
  }

  _sendMessageToAllTargets(message: Object): Promise<Array<Object>> {
    const responsePromises = [];
    for (const connection of this._connections) {
      responsePromises.push(connection.sendCommand(message));
    }
    return Promise.all(responsePromises);
  }

  dispose(): void {
    this._disposables.dispose();
  }
}

function createNuclideId(params: BreakpointParams): BreakpointId {
  return `${BREAKPOINT_ID_PREFIX}_${params.url}:${params.lineNumber}`;
}
