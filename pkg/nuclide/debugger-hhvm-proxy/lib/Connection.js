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
var {DbgpSocket} = require('./DbgpSocket');
var {DataCache} = require('./DataCache');

import type {Socket} from 'net';
import type Scope from './DataCache';
import type PropertyDescriptor from './DataCache';
import type RemoteObjectId from './DataCache';
import type {Disposable} from 'nuclide-commons';

var connectionCount = 1;

export class Connection {
  _socket: DbgpSocket;
  _dataCache: DataCache;
  _id: number;

  constructor(socket: Socket) {
    var dbgpSocket = new DbgpSocket(socket);
    this._socket = dbgpSocket;
    this._dataCache = new DataCache(dbgpSocket);
    this._id = connectionCount++;
  }

  getId(): number {
    return this._id;
  }

  onStatus(callback: (status: string) => mixed): Disposable {
    return this._socket.onStatus(callback);
  }

  evaluateOnCallFrame(frameIndex: number, expression: string): Promise<Object> {
    return this._dataCache.evaluateOnCallFrame(frameIndex, expression);
  }

  setExceptionBreakpoint(exceptionName: string): Promise<string> {
    return this._socket.setExceptionBreakpoint(exceptionName);
  }

  setBreakpoint(filename: string, lineNumber: number): Promise<string> {
    return this._socket.setBreakpoint(filename, lineNumber);
  }

  removeBreakpoint(breakpointId: string): Promise {
    return this._socket.removeBreakpoint(breakpointId);
  }

  getStackFrames(): Promise<Array<Object>> {
    return this._socket.getStackFrames();
  }

  getScopesForFrame(frameIndex: number): Promise<Scope> {
    return this._dataCache.getScopesForFrame(frameIndex);
  }

  getStatus(): Promise<string> {
    return this._socket.getStatus();
  }

  sendContinuationCommand(command: string): Promise<string> {
    return this._socket.sendContinuationCommand(command);
  }

  sendBreakCommand(): Promise<boolean> {
    return this._socket.sendBreakCommand();
  }

  getProperties(remoteId: RemoteObjectId): Promise<Array<PropertyDescriptor>> {
    return this._dataCache.getProperties(remoteId);
  }

  dispose(): void {
    this._socket.dispose();
  }
}
