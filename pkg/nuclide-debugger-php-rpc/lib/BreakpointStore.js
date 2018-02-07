'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BreakpointStore = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _utils;

function _load_utils() {
  return _utils = _interopRequireDefault(require('./utils'));
}

var _DbgpSocket;

function _load_DbgpSocket() {
  return _DbgpSocket = require('./DbgpSocket');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _event;

function _load_event() {
  return _event = require('nuclide-commons/event');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

const PAUSE_ALL_EXCEPTION_NAME = '*';
const EXCEPTION_PAUSE_STATE_ALL = 'all';

function isConnectionClosed(status) {
  switch (status) {
    case (_DbgpSocket || _load_DbgpSocket()).ConnectionStatus.Stopping:
    case (_DbgpSocket || _load_DbgpSocket()).ConnectionStatus.Stopped:
    case (_DbgpSocket || _load_DbgpSocket()).ConnectionStatus.Error:
    case (_DbgpSocket || _load_DbgpSocket()).ConnectionStatus.End:
      return true;
    default:
      return false;
  }
}

function doWhileConnectionOpen(connection, ayncFn) {
  return _rxjsBundlesRxMinJs.Observable.fromPromise(ayncFn())
  // Avoid waiting indefintely if the connection went away while applying an operaton.
  .takeUntil((0, (_event || _load_event()).observableFromSubscribeFunction)(connection.onStatus.bind(connection)).filter(isConnectionClosed)).catch((error, stream) => {
    const isClosed = isConnectionClosed(connection.getStatus());
    (_utils || _load_utils()).default.error('connection operation error:', error, isClosed);
    if (isClosed) {
      return _rxjsBundlesRxMinJs.Observable.of(null);
    } else {
      return stream;
    }
  }).toPromise();
}

// Stores breakpoints and connections.
//
// Added breakpoints are given a unique id and are added to all available connections.
//
// Breakpoints may be added before any connections.
//
// Care is taken to ensure that operations are atomic in the face of async turns.
// Specifically, removing a breakpoint removes it from all connection's maps
// before returning.
class BreakpointStore {
  // Client visible breakpoint map from
  // chrome breakpoint id to Breakpoint object.
  constructor() {
    this._breakpointCount = 0;
    this._connections = new Map();
    this._breakpoints = new Map();
    this._pauseAllExceptionBreakpointId = null;
  }
  // For each connection a map from the chrome's breakpoint id to
  // the Connection's xdebug breakpoint id.


  setFileLineBreakpoint(chromeId, filename, lineNumber, conditionExpression) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const breakpointInfo = { filename, lineNumber, conditionExpression };
      _this._breakpoints.set(chromeId, {
        chromeId,
        breakpointInfo,
        resolved: false,
        hitCount: 0
      });
      let updatedBreakpointInfo = false;
      const connectionEntries = Array.from(_this._connections.entries());
      const breakpointPromises = connectionEntries.map(function ([connection, map]) {
        return doWhileConnectionOpen(connection, (0, _asyncToGenerator.default)(function* () {
          const xdebugBreakpointId = yield connection.setFileLineBreakpoint(breakpointInfo);
          map.set(chromeId, xdebugBreakpointId);
          if (updatedBreakpointInfo || isConnectionClosed(connection.getStatus())) {
            return;
          }
          const xdebugBreakpoint = yield connection.getBreakpoint(xdebugBreakpointId);
          if (!updatedBreakpointInfo) {
            _this.updateBreakpoint(chromeId, xdebugBreakpoint);
            updatedBreakpointInfo = true;
          }
        }));
      });
      yield Promise.all(breakpointPromises);

      return chromeId;
    })();
  }

  setFileLineBreakpointForConnection(connection, chromeId, filename, lineNumber, conditionExpression) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const breakpointInfo = { filename, lineNumber, conditionExpression };
      _this2._breakpoints.set(chromeId, {
        connectionId: connection.getId(),
        chromeId,
        breakpointInfo,
        resolved: false,
        hitCount: 0
      });
      const breakpoints = _this2._connections.get(connection);

      if (!(breakpoints != null)) {
        throw new Error('Invariant violation: "breakpoints != null"');
      }

      yield doWhileConnectionOpen(connection, (0, _asyncToGenerator.default)(function* () {
        const xdebugBreakpointId = yield connection.setFileLineBreakpoint(breakpointInfo);
        breakpoints.set(chromeId, xdebugBreakpointId);
        if (isConnectionClosed(connection.getStatus())) {
          return;
        }
        const xdebugBreakpoint = yield connection.getBreakpoint(xdebugBreakpointId);
        _this2.updateBreakpoint(chromeId, xdebugBreakpoint);
      }));
      return chromeId;
    })();
  }

  getBreakpoint(breakpointId) {
    return this._breakpoints.get(breakpointId);
  }

  getBreakpointIdFromConnection(connection, xdebugBreakpoint) {
    const map = this._connections.get(connection);
    if (map == null) {
      return null;
    }

    for (const [key, value] of map) {
      if (value === xdebugBreakpoint.id) {
        return key;
      }
    }
    return null;
  }

  updateBreakpoint(chromeId, xdebugBreakpoint) {
    const breakpoint = this._breakpoints.get(chromeId);

    if (!(breakpoint != null)) {
      throw new Error('Invariant violation: "breakpoint != null"');
    }

    const { breakpointInfo } = breakpoint;
    breakpointInfo.lineNumber = Number(
    // flowlint-next-line sketchy-null-number:off
    xdebugBreakpoint.lineno || breakpointInfo.lineNumber);
    breakpointInfo.filename =
    // flowlint-next-line sketchy-null-string:off
    xdebugBreakpoint.filename || breakpointInfo.filename;
    if (xdebugBreakpoint.resolved != null) {
      breakpoint.resolved = xdebugBreakpoint.resolved === 'resolved';
    } else {
      breakpoint.resolved = true;
    }
  }

  removeBreakpoint(breakpointId) {
    this._breakpoints.delete(breakpointId);
    return this._removeBreakpointFromConnections(breakpointId);
  }

  /**
   * TODO[jeffreytan]: look into unhandled exception support.
   * Dbgp protocol does not seem to support uncaught exception handling
   * so we only support 'all' and treat all other states as 'none'.
   */
  setPauseOnExceptions(chromeId, state) {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (state !== EXCEPTION_PAUSE_STATE_ALL) {
        // Try to remove any existing exception breakpoint.
        return _this3._removePauseAllExceptionBreakpointIfNeeded();
      }
      _this3._pauseAllExceptionBreakpointId = chromeId;

      const breakpointPromises = Array.from(_this3._connections.entries()).map(function ([connection, map]) {
        return doWhileConnectionOpen(connection, (0, _asyncToGenerator.default)(function* () {
          const xdebugBreakpointId = yield connection.setExceptionBreakpoint(PAUSE_ALL_EXCEPTION_NAME);
          map.set(chromeId, xdebugBreakpointId);
        }));
      });
      yield Promise.all(breakpointPromises);
    })();
  }

  getPauseOnExceptions() {
    return this._pauseAllExceptionBreakpointId != null;
  }

  _removePauseAllExceptionBreakpointIfNeeded() {
    var _this4 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const breakpointId = _this4._pauseAllExceptionBreakpointId;
      // flowlint-next-line sketchy-null-string:off
      if (breakpointId) {
        _this4._pauseAllExceptionBreakpointId = null;
        return _this4._removeBreakpointFromConnections(breakpointId);
      } else {
        // This can happen if users switch between 'none' and 'uncaught' states.
        (_utils || _load_utils()).default.debug('No exception breakpoint to remove.');
        return Promise.resolve();
      }
    })();
  }

  _removeBreakpointFromConnections(breakpointId) {
    var _this5 = this;

    return (0, _asyncToGenerator.default)(function* () {
      yield Promise.all(Array.from(_this5._connections.entries()).map(function ([connection, map]) {
        return doWhileConnectionOpen(connection, (0, _asyncToGenerator.default)(function* () {
          const xdebugBreakpointId = map.get(breakpointId);
          if (xdebugBreakpointId == null) {
            return;
          }
          map.delete(breakpointId);
          yield connection.removeBreakpoint(xdebugBreakpointId);
        }));
      }));
    })();
  }

  findBreakpoint(filename, lineNumber) {
    // Check all known breakpoints to see if one matches the current file + line.
    for (const key of this._breakpoints.keys()) {
      const bp = this._breakpoints.get(key);
      if (bp == null) {
        continue;
      }

      const locationInfo = bp.breakpointInfo;
      if (locationInfo.filename === filename && locationInfo.lineNumber === lineNumber) {
        // Found a matching bp.
        return bp;
      }
    }

    // Not found.
    return null;
  }

  breakpointExists(filename, lineNumber) {
    if (filename == null || isNaN(lineNumber) || lineNumber < 0) {
      // Invalid bp info. Assume the breakpoint exists otherwise we might erroneously resume
      // the target. This is expected if the target hits a stop condition that doesn't provide
      // file location info. At the very least, this happens for exceptions, async-breaks, and
      // breaks in evaluated code, but there may be additional cases where HHVM doesn't provide
      // this data in the xdebug status message.
      return true;
    }

    return this.findBreakpoint(filename, lineNumber) != null;
  }

  addConnection(connection) {
    var _this6 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const map = new Map();
      const breakpointPromises = Array.from(_this6._breakpoints.values()).map((() => {
        var _ref5 = (0, _asyncToGenerator.default)(function* (breakpoint) {
          const { chromeId, breakpointInfo, connectionId } = breakpoint;
          if (connectionId != null) {
            // That breakpoint is set for a sepecific connection (doesn't apply to all connections).
            return;
          }
          const xdebugBreakpointId = yield connection.setFileLineBreakpoint(breakpointInfo);
          map.set(chromeId, xdebugBreakpointId);
        });

        return function (_x) {
          return _ref5.apply(this, arguments);
        };
      })());
      _this6._connections.set(connection, map);
      yield Promise.all(breakpointPromises);
      // flowlint-next-line sketchy-null-string:off
      if (_this6._pauseAllExceptionBreakpointId) {
        const breakpoitnId = yield connection.setExceptionBreakpoint(PAUSE_ALL_EXCEPTION_NAME);

        if (!(_this6._pauseAllExceptionBreakpointId != null)) {
          throw new Error('Invariant violation: "this._pauseAllExceptionBreakpointId != null"');
        }

        map.set(_this6._pauseAllExceptionBreakpointId, breakpoitnId);
      }
      connection.onStatus(function (status) {
        if (isConnectionClosed(status)) {
          _this6._removeConnection(connection);
        }
      });
    })();
  }

  _removeConnection(connection) {
    if (this._connections.has(connection)) {
      this._connections.delete(connection);
    }
  }
}
exports.BreakpointStore = BreakpointStore;