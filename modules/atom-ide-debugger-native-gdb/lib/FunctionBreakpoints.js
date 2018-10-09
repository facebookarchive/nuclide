"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function DebugProtocol() {
  const data = _interopRequireWildcard(require("vscode-debugprotocol"));

  DebugProtocol = function () {
    return data;
  };

  return data;
}

function _Breakpoints() {
  const data = _interopRequireWildcard(require("./Breakpoints"));

  _Breakpoints = function () {
    return data;
  };

  return data;
}

function _Logger() {
  const data = require("./Logger");

  _Logger = function () {
    return data;
  };

  return data;
}

function _MIProxy() {
  const data = _interopRequireDefault(require("./MIProxy"));

  _MIProxy = function () {
    return data;
  };

  return data;
}

function _MIRecord() {
  const data = require("./MIRecord");

  _MIRecord = function () {
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

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */
class FunctionBreakpoint extends _Breakpoints().Breakpoint {
  constructor(id, source, line, functionName, verified) {
    super(id, source, line, null, verified);
    this._functionName = functionName;
  }

  get functionName() {
    return this._functionName;
  }

}

class FunctionBreakpoints {
  constructor(client, breakpoints) {
    this._client = client;
    this._breakpoints = breakpoints;
    this._breakpointsByFunction = new Map();
  } // Returns a an array of breakpoints in the same order as the source


  async setFunctionBreakpoints(functions) {
    const addRemove = this._computeAddRemoveSets(functions);

    if (!this._client.isConnected()) {
      this._cacheBreakpointsInConfiguration(addRemove);
    } else {
      await this._addRemoveBreakpointsViaProxy(addRemove);
    }

    return [...this._breakpointsByFunction.values()].map(_ => this._breakpointToProtocolBreakpoint(_));
  }

  async setCachedBreakpoints() {
    const cachedBreakpoints = this._breakpoints.breakpointsWithNoDebuggerId();

    const results = await Promise.all(cachedBreakpoints.map(_ => {
      return this._setBreakpoint(_.functionName);
    }));
    results.forEach((response, index) => {
      if (response.done) {
        const result = (0, _MITypes().breakInsertResult)(response);
        const bkpt = result.bkpt[0];
        (0, _Logger().logVerbose)(`breakpoint ${JSON.stringify(bkpt)}`);
        cachedBreakpoints[index].setId(parseInt(bkpt.number, 10));

        if (bkpt.pending == null) {
          (0, _Logger().logVerbose)(`breakpoint ${index} is now verified`);
          cachedBreakpoints[index].setVerified();
        }
      }
    });
    return cachedBreakpoints.filter(_ => _.verified).map(_ => this._breakpointToProtocolBreakpoint(_));
  }

  getBreakpointByHandle(handle) {
    return this._breakpoints.breakpointByHandle(handle);
  } // We are given the set of functions which should be set, not
  // a delta from the current set. We must compute the delta manually
  // to update the MI debugger.
  //


  _computeAddRemoveSets(functions) {
    const existingBreakpoints = [...this._breakpointsByFunction.values()];
    const existingFunctions = existingBreakpoints.map(_ => _.functionName);
    const removeBreakpoints = existingBreakpoints.filter(_ => !functions.includes(_.functionName));
    const addFunctions = functions.filter(_ => !existingFunctions.includes(_));
    return {
      addFunctions,
      removeBreakpoints
    };
  } // If we're called before the proxy is set up, we need to cache the breakpoints
  // until gdb is launched


  _cacheBreakpointsInConfiguration(addRemove) {
    for (const bpt of addRemove.removeBreakpoints) {
      this._breakpoints.removeBreakpoint(bpt);

      this._breakpointsByFunction.delete(bpt.functionName);
    }

    addRemove.addFunctions.forEach(_ => {
      const breakpoint = new FunctionBreakpoint(null, null, null, _, false);

      this._breakpoints.addBreakpoint(breakpoint);

      this._breakpointsByFunction.set(breakpoint.functionName, breakpoint);
    });
  }

  async _addRemoveBreakpointsViaProxy(addRemove) {
    const promises = [];

    if (addRemove.removeBreakpoints.length !== 0) {
      const removeCommand = `break-delete ${addRemove.removeBreakpoints.map(_ => _.id).join(' ')}`;
      promises.push(this._client.sendCommand(removeCommand));
    }

    for (const name of addRemove.addFunctions) {
      promises.push(this._setBreakpoint(name));
    }

    const results = await Promise.all(promises);

    if (addRemove.removeBreakpoints.length !== 0) {
      const removeResult = results.shift();

      if (!(removeResult != null)) {
        throw new Error("Invariant violation: \"removeResult != null\"");
      }

      if (removeResult.result.error) {
        // this means our internal state is out of sync with the debugger
        throw new Error(`Failed to remove breakpoints which should have existed (${(0, _MITypes().toCommandError)(removeResult).msg})`);
      }
    }

    for (const bpt of addRemove.removeBreakpoints) {
      this._breakpoints.removeBreakpoint(bpt);

      this._breakpointsByFunction.delete(bpt.functionName);
    }

    const failure = results.find(_ => !_.done);

    if (failure != null) {
      throw new Error(`Failed to add function breakpokints (${(0, _MITypes().toCommandError)(failure).msg})`);
    }

    results.forEach(_ => {
      (0, _Logger().logVerbose)(JSON.stringify(_));
      const result = (0, _MITypes().breakInsertResult)(_); // We may get back a list of multiple sub breakpoints, each with a source/line,
      // but the protocol only supports one location right now.

      const bkpt = result.bkpt[0];

      if (!(bkpt != null)) {
        throw new Error("Invariant violation: \"bkpt != null\"");
      }

      const location = bkpt['original-location'];

      if (!(location != null)) {
        throw new Error("Invariant violation: \"location != null\"");
      } // MI returns the location back as '-function functioname'


      const funcMatch = location.match(/^-function (.*)$/);

      if (!(funcMatch != null)) {
        throw new Error("Invariant violation: \"funcMatch != null\"");
      }

      const functionName = funcMatch[1];

      if (!(functionName != null)) {
        throw new Error("Invariant violation: \"functionName != null\"");
      }

      const verified = bkpt.pending == null;
      const breakpoint = new FunctionBreakpoint(parseInt(bkpt.number, 10), bkpt.file, parseInt(bkpt.line, 10), functionName, verified);

      this._breakpoints.addBreakpoint(breakpoint);

      this._breakpointsByFunction.set(breakpoint.functionName, breakpoint);
    });
  }

  async _setBreakpoint(functionName) {
    // -f means insert unverified breakpoint rather than error if fn not found
    const cmd = `break-insert -f --function ${functionName}`;
    return this._client.sendCommand(cmd);
  }

  _breakpointToProtocolBreakpoint(breakpoint) {
    const handle = this._breakpoints.handleForBreakpoint(breakpoint);

    if (!(handle != null)) {
      throw new Error("Invariant violation: \"handle != null\"");
    }

    let bkpt = {
      id: handle,
      verified: breakpoint.verified,
      source: {
        sourceReference: 0
      }
    };

    if (breakpoint.source != null) {
      bkpt.source = Object.assign({}, bkpt.source, {
        path: breakpoint.source
      });
    }

    if (breakpoint.line != null) {
      bkpt = Object.assign({}, bkpt, {
        line: breakpoint.line
      });
    }

    return bkpt;
  }

}

exports.default = FunctionBreakpoints;