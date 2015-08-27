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

export class ConnectionMultiplexer {
  _connection: Connection;

  constructor(connection: Connection) {
    this._connection = connection;
  }

  onStatus(callback: (status: string) => mixed): Disposable {
    return this._connection.onStatus(callback);
  }

  evaluateOnCallFrame(frameIndex: number, expression: string): Promise<Object> {
    return this._connection.evaluateOnCallFrame(frameIndex, expression);
  }

  setBreakpoint(filename: string, lineNumber: number): Promise<string> {
    return this._connection.setBreakpoint(filename, lineNumber);
  }

  removeBreakpoint(breakpointId: string): Promise {
    return this._connection.removeBreakpoint(breakpointId);
  }

  getStackFrames(): Promise<Array<Object>> {
    return this._connection.getStackFrames();
  }

  getScopesForFrame(frameIndex: number): Promise<Scope> {
    return this._connection.getScopesForFrame(frameIndex);
  }

  getStatus(): Promise<string> {
    return this._connection.getStatus();
  }

  sendContinuationCommand(command: string): Promise<string> {
    return this._connection.sendContinuationCommand(command);
  }

  sendBreakCommand(): Promise<boolean> {
    return this._connection.sendBreakCommand();
  }

  getProperties(remoteId: RemoteObjectId): Promise<Array<PropertyDescriptor>> {
    return this._connection.getProperties(remoteId);
  }

  dispose(): void {
    this._connection.dispose();
  }
}
