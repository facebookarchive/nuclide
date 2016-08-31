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
import {
  STATUS_BREAK,
  STATUS_STARTING,
  STATUS_RUNNING,
  STATUS_BREAK_MESSAGE_RECEIVED,
} from './DbgpSocket';

import {CompositeDisposable} from 'event-kit';

import type {Socket} from 'net';
import type {
  DbgpBreakpoint,
  FileLineBreakpointInfo,
} from './DbgpSocket';

let connectionCount = 1;

type StatusCallback = (
  connection: Connection,
  status: string,
  ...args: Array<string>
) => void;

type NotificationCallback = (
  connection: Connection,
  notifyName: string,
  notify: Object
) => void;

export const ASYNC_BREAK = 'async_break';
export const BREAKPOINT = 'breakpoint';
export const STATUS_BREAK_MESSAGE_SENT = 'status_break_message_sent';

export class Connection {
  _socket: DbgpSocket;
  _dataCache: DataCache;
  _id: number;
  _disposables: CompositeDisposable;
  _status: string;
  _stopReason: ?string;

  constructor(
    socket: Socket,
    onStatusCallback?: StatusCallback,
    onNotificationCallback?: NotificationCallback,
  ) {
    const dbgpSocket = new DbgpSocket(socket);
    this._socket = dbgpSocket;
    this._dataCache = new DataCache(dbgpSocket);
    this._id = connectionCount++;
    this._status = STATUS_STARTING;
    this._disposables = new CompositeDisposable();
    if (onStatusCallback != null) {
      this._disposables.add(this.onStatus((status, ...args) =>
        onStatusCallback(this, status, ...args)));
    }
    if (onNotificationCallback != null) {
      this._disposables.add(this.onNotification((notifyName, notify) =>
        onNotificationCallback(this, notifyName, notify)));
    }
    this._stopReason = null;
  }

  getId(): number {
    return this._id;
  }

  onStatus(callback: (status: string, ...args: Array<string>) => mixed): IDisposable {
    return this._socket.onStatus(this._handleStatus.bind(this, callback));
  }

  _handleStatus(
    callback: (newStatus: string, ...args: Array<string>) => mixed,
    newStatus: string,
    ...args: Array<string>
  ): mixed {
    const prevStatus = this._status;
    switch (newStatus) {
      case STATUS_RUNNING:
        this._stopReason = null;
        break;
      case STATUS_BREAK:
        if (prevStatus === STATUS_BREAK_MESSAGE_RECEIVED) {
          this._stopReason = ASYNC_BREAK;
        } else if (prevStatus !== STATUS_BREAK) {
          // TODO(dbonafilia): investigate why we sometimes receive two STATUS_BREAK_MESSAGES
          this._stopReason = BREAKPOINT;
        }
        break;
    }
    if (newStatus === STATUS_BREAK_MESSAGE_RECEIVED && prevStatus !== STATUS_BREAK_MESSAGE_SENT) {
      return;
    }
    this._status = newStatus;
    if (!this._isInternalStatus(newStatus)) {
      // Don't bubble up irrelevant statuses to the multiplexer
      // TODO(dbonafilia): Add Enums to make status association clearer
      return callback(newStatus, ...args);
    }
  }

  _isInternalStatus(status: string) {
    return status === STATUS_BREAK_MESSAGE_RECEIVED || status === STATUS_BREAK_MESSAGE_SENT;
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

  getStatus(): string {
    return this._status;
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
    this._status = STATUS_BREAK_MESSAGE_SENT;
    return this._socket.sendBreakCommand();
  }

  setFeature(name: string, value: string): Promise<boolean> {
    return this._socket.setFeature(name, value);
  }

  getProperties(remoteId: Runtime$RemoteObjectId): Promise<Array<Runtime$PropertyDescriptor>> {
    return this._dataCache.getProperties(remoteId);
  }

  getStopReason(): ?string {
    return this._stopReason;
  }

  dispose(): void {
    this._disposables.dispose();
    this._socket.dispose();
  }
}
