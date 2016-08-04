'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {DbgpSocket} from './DbgpSocket';
import {DataCache} from './DataCache';

import type {Socket} from 'net';
import type {
  DbgpBreakpoint,
  FileLineBreakpointInfo,
} from './DbgpSocket';

let connectionCount = 1;

export class Connection {
  _socket: DbgpSocket;
  _dataCache: DataCache;
  _id: number;

  constructor(socket: Socket) {
    const dbgpSocket = new DbgpSocket(socket);
    this._socket = dbgpSocket;
    this._dataCache = new DataCache(dbgpSocket);
    this._id = connectionCount++;
  }

  getId(): number {
    return this._id;
  }

  onStatus(callback: (status: string, ...args: Array<string>) => mixed): IDisposable {
    return this._socket.onStatus(callback);
  }

  onNotification(callback: (notifyName: string, notify: Object) => mixed): IDisposable {
    return this._socket.onNotification(callback);
  }

  evaluateOnCallFrame(frameIndex: number, expression: string): Promise<Object> {
    return this._dataCache.evaluateOnCallFrame(frameIndex, expression);
  }

  runtimeEvaluate(frameIndex: number, expression: string): Promise<Object> {
    return this._dataCache.runtimeEvaluate(frameIndex, expression);
  }

  setExceptionBreakpoint(exceptionName: string): Promise<string> {
    return this._socket.setExceptionBreakpoint(exceptionName);
  }

  setFileLineBreakpoint(breakpointInfo: FileLineBreakpointInfo): Promise<string> {
    return this._socket.setFileLineBreakpoint(breakpointInfo);
  }

  getBreakpoint(breakpointId: string): Promise<DbgpBreakpoint> {
    return this._socket.getBreakpoint(breakpointId);
  }

  removeBreakpoint(breakpointId: string): Promise<any> {
    return this._socket.removeBreakpoint(breakpointId);
  }

  getStackFrames(): Promise<Object> {
    return this._socket.getStackFrames();
  }

  getScopesForFrame(frameIndex: number): Promise<Array<Debugger$Scope>> {
    return this._dataCache.getScopesForFrame(frameIndex);
  }

  getStatus(): Promise<string> {
    return this._socket.getStatus();
  }

  sendContinuationCommand(command: string): Promise<string> {
    return this._socket.sendContinuationCommand(command);
  }

  sendStdoutRequest(): Promise<boolean> {
    return this._socket.sendStdoutRequest();
  }

  sendStderrRequest(): Promise<boolean> {
    return this._socket.sendStderrRequest();
  }

  sendBreakCommand(): Promise<boolean> {
    return this._socket.sendBreakCommand();
  }

  setFeature(name: string, value: string): Promise<boolean> {
    return this._socket.setFeature(name, value);
  }

  getProperties(remoteId: Runtime$RemoteObjectId): Promise<Array<Runtime$PropertyDescriptor>> {
    return this._dataCache.getProperties(remoteId);
  }

  dispose(): void {
    this._socket.dispose();
  }
}
