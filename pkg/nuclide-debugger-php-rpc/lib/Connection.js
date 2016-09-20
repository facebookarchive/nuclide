Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _DbgpSocket2;

function _DbgpSocket() {
  return _DbgpSocket2 = require('./DbgpSocket');
}

var _DataCache2;

function _DataCache() {
  return _DataCache2 = require('./DataCache');
}

var _DbgpSocket4;

function _DbgpSocket3() {
  return _DbgpSocket4 = require('./DbgpSocket');
}

var _eventKit2;

function _eventKit() {
  return _eventKit2 = require('event-kit');
}

var connectionCount = 1;

var ASYNC_BREAK = 'async_break';
exports.ASYNC_BREAK = ASYNC_BREAK;
var BREAKPOINT = 'breakpoint';

exports.BREAKPOINT = BREAKPOINT;

var Connection = (function () {
  function Connection(socket, onStatusCallback, onNotificationCallback, isDummyConnection) {
    var _this = this;

    _classCallCheck(this, Connection);

    var dbgpSocket = new (_DbgpSocket2 || _DbgpSocket()).DbgpSocket(socket);
    this._socket = dbgpSocket;
    this._dataCache = new (_DataCache2 || _DataCache()).DataCache(dbgpSocket);
    this._id = connectionCount++;
    this._status = (_DbgpSocket4 || _DbgpSocket3()).CONNECTION_STATUS.STARTING;
    this._isDummyConnection = isDummyConnection;
    this._isDummyViewable = false;
    this._disposables = new (_eventKit2 || _eventKit()).CompositeDisposable();
    if (onStatusCallback != null) {
      this._disposables.add(this.onStatus(function (status) {
        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }

        return onStatusCallback.apply(undefined, [_this, status].concat(args));
      }));
    }
    if (onNotificationCallback != null) {
      this._disposables.add(this.onNotification(function (notifyName, notify) {
        return onNotificationCallback(_this, notifyName, notify);
      }));
    }
    this._stopReason = null;
  }

  _createClass(Connection, [{
    key: 'isDummyConnection',
    value: function isDummyConnection() {
      return this._isDummyConnection;
    }
  }, {
    key: 'getId',
    value: function getId() {
      return this._id;
    }
  }, {
    key: 'onStatus',
    value: function onStatus(callback) {
      return this._socket.onStatus(this._handleStatus.bind(this, callback));
    }
  }, {
    key: '_handleStatus',
    value: function _handleStatus(callback, newStatus) {
      var prevStatus = this._status;
      switch (newStatus) {
        case (_DbgpSocket4 || _DbgpSocket3()).CONNECTION_STATUS.RUNNING:
          this._stopReason = null;
          break;
        case (_DbgpSocket4 || _DbgpSocket3()).CONNECTION_STATUS.BREAK:
          if (prevStatus === (_DbgpSocket4 || _DbgpSocket3()).CONNECTION_STATUS.BREAK_MESSAGE_RECEIVED) {
            this._stopReason = ASYNC_BREAK;
          } else if (prevStatus !== (_DbgpSocket4 || _DbgpSocket3()).CONNECTION_STATUS.BREAK) {
            // TODO(dbonafilia): investigate why we sometimes receive two BREAK_MESSAGES
            this._stopReason = BREAKPOINT;
          }
          break;
        case (_DbgpSocket4 || _DbgpSocket3()).CONNECTION_STATUS.DUMMY_IS_VIEWABLE:
          this._isDummyViewable = true;
          return;
        case (_DbgpSocket4 || _DbgpSocket3()).CONNECTION_STATUS.DUMMY_IS_HIDDEN:
          this._isDummyViewable = false;
          return;
      }
      if (newStatus === (_DbgpSocket4 || _DbgpSocket3()).CONNECTION_STATUS.BREAK_MESSAGE_RECEIVED && prevStatus !== (_DbgpSocket4 || _DbgpSocket3()).CONNECTION_STATUS.BREAK_MESSAGE_SENT) {
        return;
      }
      this._status = newStatus;
      if (!this._isInternalStatus(newStatus)) {
        for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
          args[_key2 - 2] = arguments[_key2];
        }

        // Don't bubble up irrelevant statuses to the multiplexer
        // TODO(dbonafilia): Add Enums to make status association clearer
        return callback.apply(undefined, [newStatus].concat(args));
      }
    }
  }, {
    key: '_isInternalStatus',
    value: function _isInternalStatus(status) {
      return [(_DbgpSocket4 || _DbgpSocket3()).CONNECTION_STATUS.BREAK_MESSAGE_RECEIVED, (_DbgpSocket4 || _DbgpSocket3()).CONNECTION_STATUS.BREAK_MESSAGE_SENT, (_DbgpSocket4 || _DbgpSocket3()).CONNECTION_STATUS.DUMMY_IS_HIDDEN, (_DbgpSocket4 || _DbgpSocket3()).CONNECTION_STATUS.DUMMY_IS_VIEWABLE].some(function (internalStatus) {
        return internalStatus === status;
      });
    }

    /**
     * We only want to show the dummy connection's IP to the user when it is outside the entry-point
     * specified by the user in the Debugger config.
     */
  }, {
    key: 'isViewable',
    value: function isViewable() {
      if (this._isDummyConnection) {
        return this._status === (_DbgpSocket4 || _DbgpSocket3()).CONNECTION_STATUS.BREAK && this._isDummyViewable;
      } else {
        return this._status === (_DbgpSocket4 || _DbgpSocket3()).CONNECTION_STATUS.BREAK;
      }
    }
  }, {
    key: 'onNotification',
    value: function onNotification(callback) {
      return this._socket.onNotification(callback);
    }
  }, {
    key: 'evaluateOnCallFrame',
    value: function evaluateOnCallFrame(frameIndex, expression) {
      return this._dataCache.evaluateOnCallFrame(frameIndex, expression);
    }
  }, {
    key: 'runtimeEvaluate',
    value: function runtimeEvaluate(frameIndex, expression) {
      return this._dataCache.runtimeEvaluate(frameIndex, expression);
    }
  }, {
    key: 'setExceptionBreakpoint',
    value: function setExceptionBreakpoint(exceptionName) {
      return this._socket.setExceptionBreakpoint(exceptionName);
    }
  }, {
    key: 'setFileLineBreakpoint',
    value: function setFileLineBreakpoint(breakpointInfo) {
      return this._socket.setFileLineBreakpoint(breakpointInfo);
    }
  }, {
    key: 'getBreakpoint',
    value: function getBreakpoint(breakpointId) {
      return this._socket.getBreakpoint(breakpointId);
    }
  }, {
    key: 'removeBreakpoint',
    value: function removeBreakpoint(breakpointId) {
      return this._socket.removeBreakpoint(breakpointId);
    }
  }, {
    key: 'getStackFrames',
    value: function getStackFrames() {
      return this._socket.getStackFrames();
    }
  }, {
    key: 'getScopesForFrame',
    value: function getScopesForFrame(frameIndex) {
      return this._dataCache.getScopesForFrame(frameIndex);
    }
  }, {
    key: 'getStatus',
    value: function getStatus() {
      return this._status;
    }
  }, {
    key: 'sendContinuationCommand',
    value: function sendContinuationCommand(command) {
      return this._socket.sendContinuationCommand(command);
    }
  }, {
    key: 'sendStdoutRequest',
    value: function sendStdoutRequest() {
      return this._socket.sendStdoutRequest();
    }
  }, {
    key: 'sendStderrRequest',
    value: function sendStderrRequest() {
      return this._socket.sendStderrRequest();
    }
  }, {
    key: 'sendBreakCommand',
    value: function sendBreakCommand() {
      this._status = (_DbgpSocket4 || _DbgpSocket3()).CONNECTION_STATUS.BREAK_MESSAGE_SENT;
      return this._socket.sendBreakCommand();
    }
  }, {
    key: 'setFeature',
    value: function setFeature(name, value) {
      return this._socket.setFeature(name, value);
    }
  }, {
    key: 'getProperties',
    value: function getProperties(remoteId) {
      return this._dataCache.getProperties(remoteId);
    }
  }, {
    key: 'getStopReason',
    value: function getStopReason() {
      return this._stopReason;
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
      this._socket.dispose();
    }
  }]);

  return Connection;
})();

exports.Connection = Connection;