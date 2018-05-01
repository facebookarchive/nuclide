'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));var _MIProxy;















function _load_MIProxy() {return _MIProxy = _interopRequireDefault(require('./MIProxy'));}var _MITypes;
function _load_MITypes() {return _MITypes = require('./MITypes');}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };} /**
                                                                                                                                                                 * Copyright (c) 2017-present, Facebook, Inc.
                                                                                                                                                                 * All rights reserved.
                                                                                                                                                                 *
                                                                                                                                                                 * This source code is licensed under the BSD-style license found in the
                                                                                                                                                                 * LICENSE file in the root directory of this source tree. An additional grant
                                                                                                                                                                 * of patent rights can be found in the PATENTS file in the same directory.
                                                                                                                                                                 *
                                                                                                                                                                 * 
                                                                                                                                                                 * @format
                                                                                                                                                                 */class ExceptionBreakpoints {constructor(client) {this._throwHelper = '__cxa_throw';this._client = client;this._stopOnSignals = false;
  }

  shouldIgnoreBreakpoint(result) {
    if (this._isSignal(result) && !this._stopOnSignals) {
      return true;
    }

    // it's impossible to get a thrown exception stop if they are disabled,
    // so we don't need to check.

    return false;
  }

  stopEventReason(result) {
    if (this._isSignal(result)) {
      return {
        reason: 'exception',
        description: 'Uncaught exception' };

    }

    if (this._isOurBreakpoint(result)) {
      return {
        reason: 'exception',
        description: 'Thrown exception' };

    }

    return null;
  }

  _isSignal(result) {
    return result.reason === 'signal-received';
  }

  _isOurBreakpoint(result) {
    if (result.reason !== 'breakpoint-hit') {
      return false;
    }

    const bpt = result.bkptno;
    if (bpt == null) {
      return false;
    }

    return parseInt(bpt, 10) === this._throwBreakpoint;
  }

  setExceptionBreakpointFilters(filters) {var _this = this;return (0, _asyncToGenerator.default)(function* () {
      _this._stopOnSignals = filters.includes('uncaught');
      const enableThrown = filters.includes('thrown');

      if (enableThrown && _this._throwBreakpoint == null) {
        return _this._setBreakpoint();
      } else if (!enableThrown && _this._throwBreakpoint != null) {
        return _this._clearBreakpoint();
      }})();
  }

  _setBreakpoint() {var _this2 = this;return (0, _asyncToGenerator.default)(function* () {
      const result = yield _this2._client.sendCommand(
      `break-insert -f ${_this2._throwHelper}`);

      if (result.error) {
        throw new Error(
        `Error setting thrown exception breakpoint ${
        (0, (_MITypes || _load_MITypes()).toCommandError)(result).msg
        }`);

      }

      const bt = (0, (_MITypes || _load_MITypes()).breakInsertResult)(result);
      _this2._throwBreakpoint = parseInt(bt.bkpt[0].number, 10);})();
  }

  _clearBreakpoint() {var _this3 = this;return (0, _asyncToGenerator.default)(function* () {
      const breakpointId = _this3._throwBreakpoint;if (!(
      breakpointId != null)) {throw new Error('Invariant violation: "breakpointId != null"');}

      const result = yield _this3._client.sendCommand(
      `break-delete ${breakpointId}`);


      if (result.error) {
        throw new Error(
        `Error clearing thrown exception breakpoint ${
        (0, (_MITypes || _load_MITypes()).toCommandError)(result).msg
        }`);

      }})();
  }}exports.default = ExceptionBreakpoints;