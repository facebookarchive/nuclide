'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Connection = exports.EXCEPTION = exports.BREAKPOINT = exports.ASYNC_BREAK = undefined;

var _DbgpSocket;

function _load_DbgpSocket() {
  return _DbgpSocket = require('./DbgpSocket');
}

var _DataCache;

function _load_DataCache() {
  return _DataCache = require('./DataCache');
}

var _eventKit;

function _load_eventKit() {
  return _eventKit = require('event-kit');
}

let connectionCount = 1; /**
                          * Copyright (c) 2015-present, Facebook, Inc.
                          * All rights reserved.
                          *
                          * This source code is licensed under the license found in the LICENSE file in
                          * the root directory of this source tree.
                          *
                          * 
                          * @format
                          */

const ASYNC_BREAK = exports.ASYNC_BREAK = 'async_break';
const BREAKPOINT = exports.BREAKPOINT = 'breakpoint';
const EXCEPTION = exports.EXCEPTION = 'exception';

class Connection {

  constructor(socket, onStatusCallback, onNotificationCallback, isDummyConnection) {
    const dbgpSocket = new (_DbgpSocket || _load_DbgpSocket()).DbgpSocket(socket);
    this._socket = dbgpSocket;
    this._dataCache = new (_DataCache || _load_DataCache()).DataCache(dbgpSocket);
    this._id = connectionCount++;
    this._status = (_DbgpSocket || _load_DbgpSocket()).ConnectionStatus.Starting;
    this._isDummyConnection = isDummyConnection;
    this._isDummyViewable = false;
    this._disposables = new (_eventKit || _load_eventKit()).CompositeDisposable();
    this._breakCount = 0;

    if (onStatusCallback != null) {
      this._disposables.add(this.onStatus((status, ...args) => onStatusCallback(this, status, ...args)));
    }
    if (onNotificationCallback != null) {
      this._disposables.add(this.onNotification((notifyName, notify) => onNotificationCallback(this, notifyName, notify)));
    }
    this._stopReason = null;
    this._stopBreakpointLocation = null;
  }

  isDummyConnection() {
    return this._isDummyConnection;
  }

  getId() {
    return this._id;
  }

  onStatus(callback) {
    return this._socket.onStatus(this._handleStatus.bind(this, callback));
  }

  _handleStatus(callback, newStatus, ...args) {
    const prevStatus = this._status;
    switch (newStatus) {
      case (_DbgpSocket || _load_DbgpSocket()).ConnectionStatus.Running:
        this._stopReason = null;
        this._stopBreakpointLocation = null;
        break;
      case (_DbgpSocket || _load_DbgpSocket()).ConnectionStatus.Break:
        if (prevStatus === (_DbgpSocket || _load_DbgpSocket()).ConnectionStatus.BreakMessageReceived) {
          this._stopReason = ASYNC_BREAK;
          this._stopBreakpointLocation = null;
        } else if (prevStatus !== (_DbgpSocket || _load_DbgpSocket()).ConnectionStatus.Break) {
          // TODO(dbonafilia): investigate why we sometimes receive two BREAK_MESSAGES
          const [file, line, exception] = args;
          this._stopReason = exception == null ? BREAKPOINT : EXCEPTION;
          if (file != null && line != null) {
            this._stopBreakpointLocation = {
              filename: file,
              lineNumber: Number(line),
              conditionExpression: null
            };
          } else {
            // Unknown stop location.
            this._stopBreakpointLocation = null;
          }
        }
        this._breakCount++;
        break;
      case (_DbgpSocket || _load_DbgpSocket()).ConnectionStatus.DummyIsViewable:
        this._isDummyViewable = true;
        return;
      case (_DbgpSocket || _load_DbgpSocket()).ConnectionStatus.DummyIsHidden:
        this._isDummyViewable = false;
        return;
    }
    if (newStatus === (_DbgpSocket || _load_DbgpSocket()).ConnectionStatus.BreakMessageReceived && prevStatus !== (_DbgpSocket || _load_DbgpSocket()).ConnectionStatus.BreakMessageSent) {
      return;
    }
    this._status = newStatus;
    if (!this._isInternalStatus(newStatus)) {
      // Don't bubble up irrelevant statuses to the multiplexer
      // TODO(dbonafilia): Add Enums to make status association clearer
      return callback(newStatus, ...args);
    }
  }

  _isInternalStatus(status) {
    return [(_DbgpSocket || _load_DbgpSocket()).ConnectionStatus.BreakMessageReceived, (_DbgpSocket || _load_DbgpSocket()).ConnectionStatus.BreakMessageSent, (_DbgpSocket || _load_DbgpSocket()).ConnectionStatus.DummyIsHidden, (_DbgpSocket || _load_DbgpSocket()).ConnectionStatus.DummyIsViewable].some(internalStatus => internalStatus === status);
  }

  /**
   * We only want to show the dummy connection's IP to the user when it is outside the entry-point
   * specified by the user in the Debugger config.
   */
  isViewable() {
    if (this._isDummyConnection) {
      return this._status === (_DbgpSocket || _load_DbgpSocket()).ConnectionStatus.Break && this._isDummyViewable;
    } else {
      return this._status === (_DbgpSocket || _load_DbgpSocket()).ConnectionStatus.Break;
    }
  }

  getBreakCount() {
    return this._breakCount;
  }

  onNotification(callback) {
    return this._socket.onNotification(callback);
  }

  evaluateOnCallFrame(frameIndex, expression) {
    return this._dataCache.evaluateOnCallFrame(frameIndex, expression);
  }

  runtimeEvaluate(frameIndex, expression) {
    return this._dataCache.runtimeEvaluate(frameIndex, expression);
  }

  setExceptionBreakpoint(exceptionName) {
    return this._socket.setExceptionBreakpoint(exceptionName);
  }

  setFileLineBreakpoint(breakpointInfo) {
    return this._socket.setFileLineBreakpoint(breakpointInfo);
  }

  getBreakpoint(breakpointId) {
    return this._socket.getBreakpoint(breakpointId);
  }

  removeBreakpoint(breakpointId) {
    return this._socket.removeBreakpoint(breakpointId);
  }

  getStackFrames() {
    return this._socket.getStackFrames();
  }

  getScopesForFrame(frameIndex) {
    return this._dataCache.getScopesForFrame(frameIndex);
  }

  getStatus() {
    return this._status;
  }

  sendContinuationCommand(command) {
    return this._socket.sendContinuationCommand(command);
  }

  sendStdoutRequest() {
    return this._socket.sendStdoutRequest();
  }

  sendStderrRequest() {
    return this._socket.sendStderrRequest();
  }

  sendBreakCommand() {
    this._status = (_DbgpSocket || _load_DbgpSocket()).ConnectionStatus.BreakMessageSent;
    return this._socket.sendBreakCommand();
  }

  setFeature(name, value) {
    return this._socket.setFeature(name, value);
  }

  getProperties(remoteId) {
    return this._dataCache.getProperties(remoteId);
  }

  getStopReason() {
    return this._stopReason;
  }

  // Returns the location this connection is stopped at if it is stopped at a file+line breakpoint.
  // Otherwise, returns null.
  getStopBreakpointLocation() {
    return this._stopBreakpointLocation;
  }

  dispose() {
    this._disposables.dispose();
    this._socket.dispose();
  }
}
exports.Connection = Connection;