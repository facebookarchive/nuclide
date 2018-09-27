"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _MIProxy() {
  const data = _interopRequireDefault(require("./MIProxy"));

  _MIProxy = function () {
    return data;
  };

  return data;
}

function _MITypes() {
  const data = require("./MITypes");

  _MITypes = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 */
class ExceptionBreakpoints {
  constructor(client) {
    this._throwHelper = '__cxa_throw';
    this._client = client;
    this._stopOnSignals = false;
  }

  shouldIgnoreBreakpoint(result) {
    if (this._isSignal(result) && !this._stopOnSignals) {
      return true;
    } // it's impossible to get a thrown exception stop if they are disabled,
    // so we don't need to check.


    return false;
  }

  stopEventReason(result) {
    if (this._isSignal(result)) {
      return {
        reason: 'exception',
        description: 'Uncaught exception'
      };
    }

    if (this._isOurBreakpoint(result)) {
      return {
        reason: 'exception',
        description: 'Thrown exception'
      };
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

  async setExceptionBreakpointFilters(filters) {
    this._stopOnSignals = filters.includes('uncaught');
    const enableThrown = filters.includes('thrown');

    if (enableThrown && this._throwBreakpoint == null) {
      return this._setBreakpoint();
    } else if (!enableThrown && this._throwBreakpoint != null) {
      return this._clearBreakpoint();
    }
  }

  async _setBreakpoint() {
    const result = await this._client.sendCommand(`break-insert -f ${this._throwHelper}`);

    if (result.error) {
      throw new Error(`Error setting thrown exception breakpoint ${(0, _MITypes().toCommandError)(result).msg}`);
    }

    const bt = (0, _MITypes().breakInsertResult)(result);
    this._throwBreakpoint = parseInt(bt.bkpt[0].number, 10);
  }

  async _clearBreakpoint() {
    const breakpointId = this._throwBreakpoint;

    if (!(breakpointId != null)) {
      throw new Error("Invariant violation: \"breakpointId != null\"");
    }

    const result = await this._client.sendCommand(`break-delete ${breakpointId}`);

    if (result.error) {
      throw new Error(`Error clearing thrown exception breakpoint ${(0, _MITypes().toCommandError)(result).msg}`);
    }
  }

}

exports.default = ExceptionBreakpoints;