'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BreakpointManager = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _logger;

function _load_logger() {
  return _logger = require('./logger');
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
 */

const { log } = (_logger || _load_logger()).logger;
const BREAKPOINT_ID_PREFIX = 'NUCLIDE';

class BreakpointManager {

  constructor(sendMessageToClient) {
    this._breakpoints = new Map();
    this._connections = new Set();
    this._sendMessageToClient = sendMessageToClient;
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(() => this._connections.clear());
    this._setPauseOnExceptionsState = 'none';
  }

  addConnection(connection) {
    this._connections.add(connection);
    return Promise.all([
    // Send file/line breakpoints.
    this._sendLineBreakpointsToTarget(connection),
    // Send exception breakpoints.
    this._sendSetPauseOnExceptionToTarget(connection)]);
  }

  removeConnection(connection) {
    this._connections.delete(connection);
  }

  _sendLineBreakpointsToTarget(connection) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const responsePromises = [];
      for (const breakpoint of _this._breakpoints.values()) {
        const responsePromise = connection.sendCommand({
          method: 'Debugger.setBreakpointByUrl',
          params: breakpoint.params
        });
        if (breakpoint.resolved) {
          responsePromises.push(responsePromise);
        } else {
          responsePromises.push(responsePromise.then(function (response) {
            // We are assuming that breakpoints will only be unresolved if they are sent when there
            // are no connections present.
            breakpoint.resolved = true;
            _this._sendMessageToClient({
              method: 'Debugger.breakpointResolved',
              params: {
                breakpointId: breakpoint.nuclideId,
                location: response.result.location
              }
            });
          }));
        }
      }
      // Wait for `setBreakpointByUrl` messages to go out and come back.
      yield Promise.all(responsePromises);
    })();
  }

  _sendSetPauseOnExceptionToTarget(connection) {
    const resolve = this._resolvePendingExceptionBreakpointMessage;
    if (resolve != null) {
      resolve();
      return Promise.resolve();
    }
    return connection.sendCommand({
      method: 'Debugger.setPauseOnExceptions',
      params: {
        state: this._setPauseOnExceptionsState
      }
    });
  }

  setPauseOnExceptions(message) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      _this2._setPauseOnExceptionsState = message.params.state;
      if (_this2._connections.size === 0) {
        // Wait for a connection to come in.
        yield new Promise(function (resolve) {
          _this2._resolvePendingExceptionBreakpointMessage = resolve;
        });
        _this2._resolvePendingExceptionBreakpointMessage = null;
      }
      return _this2._setPauseOnExceptions(message);
    })();
  }

  _setPauseOnExceptions(message) {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const responses = yield _this3._sendMessageToAllTargets(message);
      log(`setPauseOnExceptions yielded: ${JSON.stringify(responses)}`);
      for (const response of responses) {
        // We can receive multiple responses, so just send the first non-error one.
        if (response.result != null && response.error == null) {
          return response;
        }
      }
      return responses[0];
    })();
  }

  /**
   * setBreakpointByUrl must send this breakpoint to each connection managed by the multiplexer.
   */
  setBreakpointByUrl(message) {
    if (this._connections.size === 0) {
      return Promise.resolve(this._setUnresolvedBreakpointByUrl(message));
    }
    return this._setBreakpointByUrl(message);
  }

  _setUnresolvedBreakpointByUrl(message) {
    const { params } = message;
    const nuclideId = createNuclideId(params);
    const breakpoint = {
      nuclideId,
      params,
      jscId: null,
      resolved: false
    };
    this._breakpoints.set(nuclideId, breakpoint);
    return {
      id: message.id,
      result: {
        breakpointId: nuclideId,
        // Chrome devtools used to rely on `locations` being set, but Nuclide tracks the unresolved
        // location independently from this response.
        locations: [],
        resolved: false
      }
    };
  }

  _setBreakpointByUrl(message) {
    var _this4 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const { params } = message;
      const nuclideId = createNuclideId(params);
      const breakpoint = {
        nuclideId,
        params,
        jscId: null,
        resolved: true
      };
      _this4._breakpoints.set(nuclideId, breakpoint);
      const responses = yield _this4._sendMessageToAllTargets(message);
      log(`setBreakpointByUrl yielded: ${JSON.stringify(responses)}`);
      for (const response of responses) {
        // We will receive multiple responses, so just send the first non-error one.
        if (response.result != null && response.error == null && response.result.breakpointId != null) {
          breakpoint.jscId = response.result.breakpointId;
          response.result.breakpointId = nuclideId;
          return response;
        }
      }
      return responses[0];
    })();
  }

  /**
   * removeBreakpoint must send this message to each connection managed by the multiplexer.
   */
  removeBreakpoint(message) {
    var _this5 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const { id } = message;
      const { breakpointId } = message.params;
      const breakpoint = _this5._breakpoints.get(breakpointId);
      if (breakpoint == null) {
        return { id };
      }
      const targetMessage = Object.assign({}, message, {
        params: {
          breakpointId: breakpoint.jscId
        }
      });
      const responses = yield _this5._sendMessageToAllTargets(targetMessage);
      log(`removeBreakpoint yielded: ${JSON.stringify(responses)}`);
      _this5._breakpoints.delete(breakpoint.nuclideId);
      return { id };
    })();
  }

  _sendMessageToAllTargets(message) {
    const responsePromises = [];
    for (const connection of this._connections) {
      responsePromises.push(connection.sendCommand(message));
    }
    return Promise.all(responsePromises);
  }

  dispose() {
    this._disposables.dispose();
  }
}

exports.BreakpointManager = BreakpointManager;
function createNuclideId(params) {
  return `${BREAKPOINT_ID_PREFIX}_${params.url}:${params.lineNumber}`;
}