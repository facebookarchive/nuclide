'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));var _vscodeDebugprotocol;











function _load_vscodeDebugprotocol() {return _vscodeDebugprotocol = _interopRequireWildcard(require('vscode-debugprotocol'));}var _Breakpoints;

function _load_Breakpoints() {return _Breakpoints = _interopRequireDefault(require('./Breakpoints'));}var _Breakpoints2;function _load_Breakpoints2() {return _Breakpoints2 = require('./Breakpoints');}var _MIDebugSession;

function _load_MIDebugSession() {return _MIDebugSession = require('./MIDebugSession');}var _MIProxy;
function _load_MIProxy() {return _MIProxy = _interopRequireDefault(require('./MIProxy'));}var _MIRecord;
function _load_MIRecord() {return _MIRecord = require('./MIRecord');}var _MITypes;
function _load_MITypes() {return _MITypes = require('./MITypes');}function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

class FunctionBreakpoint extends (_Breakpoints2 || _load_Breakpoints2()).Breakpoint {


  constructor(
  id,
  source,
  line,
  functionName,
  verified)
  {
    super(id, source, line, null, verified);
    this._functionName = functionName;
  }

  get functionName() {
    return this._functionName;
  }} /**
      * Copyright (c) 2017-present, Facebook, Inc.
      * All rights reserved.
      *
      * This source code is licensed under the BSD-style license found in the
      * LICENSE file in the root directory of this source tree. An additional grant
      * of patent rights can be found in the PATENTS file in the same directory.
      *
      * 
      * @format
      */class FunctionBreakpoints {


  constructor(client, breakpoints) {
    this._client = client;
    this._breakpoints = breakpoints;
    this._breakpointsByFunction = new Map();
  }

  // Returns a an array of breakpoints in the same order as the source
  setFunctionBreakpoints(
  functions)
  {var _this = this;return (0, _asyncToGenerator.default)(function* () {
      const addRemove = _this._computeAddRemoveSets(functions);

      if (!_this._client.isConnected()) {
        _this._cacheBreakpointsInConfiguration(addRemove);
      } else {
        yield _this._addRemoveBreakpointsViaProxy(addRemove);
      }

      return [..._this._breakpointsByFunction.values()].map(function (_) {return (
          _this._breakpointToProtocolBreakpoint(_));});})();

  }

  setCachedBreakpoints() {var _this2 = this;return (0, _asyncToGenerator.default)(function* () {
      const cachedBreakpoints = _this2._breakpoints.breakpointsWithNoDebuggerId();



      const results = yield Promise.all(
      cachedBreakpoints.map(function (_) {
        return _this2._setBreakpoint(_.functionName);
      }));


      results.forEach(function (response, index) {
        if (response.done) {
          const result = (0, (_MITypes || _load_MITypes()).breakInsertResult)(response);
          const bkpt = result.bkpt[0];
          (0, (_MIDebugSession || _load_MIDebugSession()).logVerbose)(`breakpoint ${JSON.stringify(bkpt)}`);
          cachedBreakpoints[index].setId(parseInt(bkpt.number, 10));
          if (bkpt.pending == null) {
            (0, (_MIDebugSession || _load_MIDebugSession()).logVerbose)(`breakpoint ${index} is now verified`);
            cachedBreakpoints[index].setVerified();
          }
        }
      });

      return cachedBreakpoints.
      filter(function (_) {return _.verified;}).
      map(function (_) {return _this2._breakpointToProtocolBreakpoint(_);});})();
  }

  getBreakpointByHandle(handle) {
    return this._breakpoints.breakpointByHandle(handle);
  }

  // We are given the set of functions which should be set, not
  // a delta from the current set. We must compute the delta manually
  // to update the MI debugger.
  //
  _computeAddRemoveSets(functions) {
    const existingBreakpoints = [
    ...this._breakpointsByFunction.values()];

    const existingFunctions = existingBreakpoints.map(_ => _.functionName);

    const removeBreakpoints = existingBreakpoints.filter(
    _ => !functions.includes(_.functionName));


    const addFunctions = functions.filter(
    _ => !existingFunctions.includes(_));


    return { addFunctions, removeBreakpoints };
  }

  // If we're called before the proxy is set up, we need to cache the breakpoints
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

  _addRemoveBreakpointsViaProxy(addRemove) {var _this3 = this;return (0, _asyncToGenerator.default)(function* () {
      const promises = [];

      if (addRemove.removeBreakpoints.length !== 0) {
        const removeCommand = `break-delete ${addRemove.removeBreakpoints.
        map(function (_) {return _.id;}).
        join(' ')}`;
        promises.push(_this3._client.sendCommand(removeCommand));
      }

      for (const name of addRemove.addFunctions) {
        promises.push(_this3._setBreakpoint(name));
      }

      const results = yield Promise.all(promises);

      if (addRemove.removeBreakpoints.length !== 0) {
        const removeResult = results.shift();if (!(
        removeResult != null)) {throw new Error('Invariant violation: "removeResult != null"');}
        if (removeResult.result.error) {
          // this means our internal state is out of sync with the debugger
          throw new Error(
          `Failed to remove breakpoints which should have existed (${
          (0, (_MITypes || _load_MITypes()).toCommandError)(removeResult).msg
          })`);

        }
      }

      for (const bpt of addRemove.removeBreakpoints) {
        _this3._breakpoints.removeBreakpoint(bpt);
        _this3._breakpointsByFunction.delete(bpt.functionName);
      }

      const failure = results.find(function (_) {return !_.done;});
      if (failure != null) {
        throw new Error(
        `Failed to add function breakpokints (${(0, (_MITypes || _load_MITypes()).toCommandError)(failure).msg})`);

      }

      results.forEach(function (_) {
        (0, (_MIDebugSession || _load_MIDebugSession()).logVerbose)(JSON.stringify(_));
        const result = (0, (_MITypes || _load_MITypes()).breakInsertResult)(_);

        // We may get back a list of multiple sub breakpoints, each with a source/line,
        // but the protocol only supports one location right now.
        const bkpt = result.bkpt[0];if (!(
        bkpt != null)) {throw new Error('Invariant violation: "bkpt != null"');}
        const location = bkpt['original-location'];if (!(
        location != null)) {throw new Error('Invariant violation: "location != null"');}

        // MI returns the location back as '-function functioname'
        const funcMatch = location.match(/^-function (.*)$/);if (!(
        funcMatch != null)) {throw new Error('Invariant violation: "funcMatch != null"');}
        const functionName = funcMatch[1];if (!(
        functionName != null)) {throw new Error('Invariant violation: "functionName != null"');}

        const verified = bkpt.pending == null;

        const breakpoint = new FunctionBreakpoint(
        parseInt(bkpt.number, 10),
        bkpt.file,
        parseInt(bkpt.line, 10),
        functionName,
        verified);


        _this3._breakpoints.addBreakpoint(breakpoint);
        _this3._breakpointsByFunction.set(breakpoint.functionName, breakpoint);
      });})();
  }

  _setBreakpoint(functionName) {var _this4 = this;return (0, _asyncToGenerator.default)(function* () {
      // -f means insert unverified breakpoint rather than error if fn not found
      const cmd = `break-insert -f --function ${functionName}`;
      return _this4._client.sendCommand(cmd);})();
  }

  _breakpointToProtocolBreakpoint(
  breakpoint)
  {
    const handle = this._breakpoints.handleForBreakpoint(breakpoint);if (!(
    handle != null)) {throw new Error('Invariant violation: "handle != null"');}
    let bkpt = {
      id: handle,
      verified: breakpoint.verified,
      source: { source: breakpoint.source, sourceReference: 0 } };

    if (breakpoint.line != null) {
      bkpt = Object.assign({}, bkpt, { line: breakpoint.line });
    }
    return bkpt;
  }}exports.default = FunctionBreakpoints;