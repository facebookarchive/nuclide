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
 *  strict-local
 * @format
 */
class SourceBreakpoints {
  // by source and line
  constructor(client, breakpoints) {
    this._client = client;
    this._breakpoints = breakpoints;
    this._reverseMap = new Map();
  } // Returns a map from the requested lines to the breakpoint handles


  async setSourceBreakpoints(path, breakpoints) {
    const addRemove = this._computeAddRemoveSets(path, breakpoints);

    if (!this._client.isConnected()) {
      this._cacheBreakpointsInConfiguration(path, addRemove);
    } else {
      await this._addRemoveBreakpointsViaProxy(path, addRemove);
    }

    return this._allBreakpointsForPath(path).map(bkpt => this._breakpointToProtocolBreakpoint(bkpt));
  } // Set pre-configuration breakpoints


  async setCachedBreakpoints() {
    const cachedBreakpoints = this._breakpoints.breakpointsWithNoDebuggerId();

    const results = await Promise.all(cachedBreakpoints.map(_ => {
      const source = _.source;
      const line = _.line;

      if (!(source != null)) {
        throw new Error("Invariant violation: \"source != null\"");
      }

      if (!(line != null)) {
        throw new Error("Invariant violation: \"line != null\"");
      }

      return this._setBreakpoint(source, line, _.condition);
    }));
    results.forEach((response, index) => {
      if (response.done) {
        const result = (0, _MITypes().breakInsertResult)(response);
        const bkpt = result.bkpt[0];
        cachedBreakpoints[index].setId(parseInt(bkpt.number, 10));

        if (bkpt.pending == null) {
          cachedBreakpoints[index].setVerified();
        }
      }
    });
    return cachedBreakpoints.filter(_ => _.verified).map(_ => this._breakpointToProtocolBreakpoint(_));
  } // We are given the set of lines which should be set for a file, not
  // a delta from the current set. We must compute the delta manually
  // to update the MI debugger.
  //


  _computeAddRemoveSets(path, breakpoints) {
    const existingBreakpoints = this._allBreakpointsForPath(path);

    const existingLines = existingBreakpoints.map(_ => {
      const line = _.line;

      if (!(line != null)) {
        throw new Error("Invariant violation: \"line != null\"");
      }

      return line;
    });
    const lines = breakpoints.map(_ => _.line);
    const removeBreakpoints = existingBreakpoints.filter(_ => !lines.includes(_.line));
    const addBreakpoints = breakpoints.filter(_ => !existingLines.includes(_.line));
    return {
      addBreakpoints,
      removeBreakpoints
    };
  } // If we're called before the proxy is set up, we need to cache the breakpoints
  // until gdb is launched


  _cacheBreakpointsInConfiguration(path, addRemove) {
    let forSource = this._reverseMap.get(path);

    if (forSource == null) {
      forSource = new Map();

      this._reverseMap.set(path, forSource);
    }

    for (const bpt of addRemove.removeBreakpoints) {
      if (bpt.line != null) {
        forSource.delete(bpt.line);

        this._breakpoints.removeBreakpoint(bpt);
      }
    }

    addRemove.addBreakpoints.forEach((breakpoint, index) => {
      const line = breakpoint.line;
      const newBreakpoint = new (_Breakpoints().Breakpoint)(null, path, line, breakpoint.condition, false);

      if (!(forSource != null)) {
        throw new Error("Invariant violation: \"forSource != null\"");
      }

      forSource.set(line, newBreakpoint);

      this._breakpoints.addBreakpoint(newBreakpoint);
    });
  }

  async _addRemoveBreakpointsViaProxy(path, addRemove) {
    const promises = [];

    if (addRemove.removeBreakpoints.length !== 0) {
      const removeCommand = `break-delete ${addRemove.removeBreakpoints.map(_ => _.id).join(' ')}`;
      promises.push(this._client.sendCommand(removeCommand));
    }

    for (const bkpt of addRemove.addBreakpoints) {
      promises.push(this._setBreakpoint(path, bkpt.line, bkpt.condition));
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

    let forSource = this._reverseMap.get(path);

    if (forSource == null) {
      forSource = new Map();

      this._reverseMap.set(path, forSource);
    }

    for (const bpt of addRemove.removeBreakpoints) {
      if (bpt.line != null) {
        forSource.delete(bpt.line);

        this._breakpoints.removeBreakpoint(bpt);
      }
    }

    const failure = results.find(_ => !_.done);

    if (failure != null) {
      throw new Error(`Failed adding new source breakpoints ${(0, _MITypes().toCommandError)(failure).msg}`);
    }

    results.forEach((response, index) => {
      const result = (0, _MITypes().breakInsertResult)(response);
      const bkpt = result.bkpt[0];

      if (!(bkpt != null)) {
        throw new Error("Invariant violation: \"bkpt != null\"");
      } // NB gdb will not return the line number of a pending breakpoint, so
      // use the one we were given


      const line = addRemove.addBreakpoints[index].line;
      const breakpoint = new (_Breakpoints().Breakpoint)(parseInt(bkpt.number, 10), path, line, addRemove.addBreakpoints[index].condition, bkpt.pending == null);

      if (!(forSource != null)) {
        throw new Error("Invariant violation: \"forSource != null\"");
      }

      forSource.set(line, breakpoint);

      this._breakpoints.addBreakpoint(breakpoint);
    });
  }

  async _setBreakpoint(source, line, condition) {
    const conditionFlag = condition == null || condition.trim() === '' ? '' : `-c "${condition.replace('"', '\\"')}"`;
    const cmd = `break-insert -f --source ${source} --line ${line} ${conditionFlag}`;
    return this._client.sendCommand(cmd);
  }

  _allBreakpointsForPath(path) {
    let forSource = this._reverseMap.get(path);

    forSource = forSource != null ? [...forSource] : [];
    return forSource.map(_ => _[1]);
  }

  _breakpointToProtocolBreakpoint(bkpt) {
    const handle = this._breakpoints.handleForBreakpoint(bkpt);

    if (!(handle != null)) {
      throw new Error('Could not find source breakpoint handle');
    }

    if (!(bkpt.line != null)) {
      throw new Error("Invariant violation: \"bkpt.line != null\"");
    }

    const bptRet = {
      id: handle,
      verified: bkpt.verified,
      source: {
        sourceReference: 0
      },
      line: bkpt.line
    };

    if (bkpt.source != null) {
      bptRet.source = Object.assign({}, bptRet.source, {
        path: bkpt.source
      });
    }

    return bptRet;
  }

}

exports.default = SourceBreakpoints;