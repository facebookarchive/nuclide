'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Utils;

function _load_Utils() {
  return _Utils = require('./Utils');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

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

const UNCONFIRMED_BREAKPOINT_ID = 'Unassigned';

/**
 * Bridge between Nuclide IPC and RPC breakpoint protocols.
 */
class BreakpointManager {

  constructor(debuggerDispatcher) {
    this._initBreakpoints = [];
    this._breakpointList = [];
    this._breakpointEvent$ = new _rxjsBundlesRxMinJs.Subject();
    this._debuggerDispatcher = debuggerDispatcher;
  }

  getEventObservable() {
    return this._breakpointEvent$.asObservable();
  }

  setInitialBreakpoints(breakpoints) {
    this._initBreakpoints = breakpoints;
  }

  syncInitialBreakpointsToEngine() {
    for (const breakpoint of this._initBreakpoints) {
      this.setFilelineBreakpoint(breakpoint);
    }
    this._initBreakpoints = [];
  }

  setFilelineBreakpoint(request) {
    function callback(error, response) {
      if (error != null) {
        (0, (_Utils || _load_Utils()).reportError)(`setFilelineBreakpoint failed with ${JSON.stringify(error)}`);
        return;
      }
      const { breakpointId, locations, resolved } = response;
      this._assignBreakpointId(request, breakpointId);

      // true or undefined. This is because any legacy engine may
      // not implement "resolved" flag in resolved resposne.
      if (resolved !== false) {
        for (const location of locations) {
          this._sendBreakpointResolved(breakpointId, location);
        }
      }
    }
    this._breakpointList.push({ id: UNCONFIRMED_BREAKPOINT_ID, request });
    if (request.enabled) {
      this._debuggerDispatcher.setBreakpointByUrl(request, callback.bind(this));
    }
  }

  _assignBreakpointId(request, breakpointId) {
    const breakpoint = this._findBreakpointOnFileLine(request.sourceURL, request.lineNumber);
    if (breakpoint == null) {
      (0, (_Utils || _load_Utils()).reportError)('Why are we assigning id to a non-exist breakpoint?');
      return;
    }
    breakpoint.id = breakpointId;
  }

  updateBreakpoint(request) {
    const breakpoint = this._findBreakpointOnFileLine(request.sourceURL, request.lineNumber);
    if (breakpoint != null) {
      this._updateEngineForChanges(breakpoint.request, request);
      breakpoint.request = request;
    } else {
      // In current design, there is a UI race between user sets breakpoint
      // while engine haven't created it yet so this may be expected.
      // Issue an warning instead of error.
      (0, (_Utils || _load_Utils()).reportWarning)('Do you try to update a breakpoint not exist?');
    }
  }

  _updateEngineForChanges(oldRequest, newRequest) {
    const disposition = this._getRequestChangeDisposition(oldRequest, newRequest);
    switch (disposition) {
      case 'AddBreakpoint':
        this.setFilelineBreakpoint(newRequest);
        break;
      case 'RemoveBreakpoint':
        this.removeBreakpoint(newRequest);
        break;
      case 'ReplaceBreakpoint':
        this.removeBreakpoint(newRequest);
        this.setFilelineBreakpoint(newRequest);
        break;
      default:
        if (!(disposition === 'NoAction')) {
          throw new Error('Invariant violation: "disposition === \'NoAction\'"');
        }

        break;
    }
  }

  _getRequestChangeDisposition(oldRequest, newRequest) {
    if (!oldRequest.enabled && newRequest.enabled) {
      return 'AddBreakpoint';
    } else if (oldRequest.enabled && !newRequest.enabled) {
      return 'RemoveBreakpoint';
    } else if (newRequest.enabled && newRequest.condition !== oldRequest.condition) {
      return 'ReplaceBreakpoint';
    } else {
      return 'NoAction';
    }
  }

  removeBreakpoint(request) {
    const breakpoint = this._findBreakpointOnFileLine(request.sourceURL, request.lineNumber);
    if (breakpoint != null) {
      // Remove from engine.
      if (this._isConfirmedBreakpoint(breakpoint)) {
        this._debuggerDispatcher.removeBreakpoint(breakpoint.id);
      }
      // Remove from our record list.
      this._removeBreakpointFromList(request);
    } else {
      // In current design, there is a UI race between user remove breakpoint
      // while engine haven't created it yet so this may be expected.
      // Issue an warning instead of error.
      (0, (_Utils || _load_Utils()).reportWarning)('Do you try to remove a breakpoint not exist?');
    }
  }

  _removeBreakpointFromList(request) {
    const index = this._findBreakpointIndexOnFileLine(request.sourceURL, request.lineNumber);

    if (!(index !== -1)) {
      throw new Error('Invariant violation: "index !== -1"');
    }

    this._breakpointList.splice(index, 1);
  }

  _isConfirmedBreakpoint(breakpoint) {
    return breakpoint.id !== UNCONFIRMED_BREAKPOINT_ID;
  }

  _findBreakpointOnFileLine(sourceUrl, line) {
    const index = this._findBreakpointIndexOnFileLine(sourceUrl, line);
    if (index !== -1) {
      return this._breakpointList[index];
    }
    return null;
  }

  _findBreakpointIndexOnFileLine(sourceUrl, line) {
    for (const [index, breakpoint] of this._breakpointList.entries()) {
      if (breakpoint.request.sourceURL === sourceUrl && breakpoint.request.lineNumber === line) {
        return index;
      }
    }
    return -1;
  }

  _sendBreakpointResolved(breakpointId, location) {
    const breakpoint = this._getBreakpointFromId(breakpointId);
    if (breakpoint != null) {
      this._breakpointEvent$.next(['BreakpointRemoved', breakpoint.request]);
      this._breakpointEvent$.next(['BreakpointAdded', this._createIPCBreakpointFromLocation(breakpoint.request, location)]);
    } else {
      (0, (_Utils || _load_Utils()).reportError)(`Got breakpoint resolved for non-existing breakpoint: ${breakpointId}, ${JSON.stringify(location)};`);
    }
  }

  _getBreakpointFromId(breakpointId) {
    return this._breakpointList.find(bp => bp.id === breakpointId);
  }

  _createIPCBreakpointFromLocation(originalRequest, bpLocation) {
    const newCopy = Object.assign({}, originalRequest);
    // TODO: also get the new source URL from ScriptId in Location.
    newCopy.lineNumber = bpLocation.lineNumber;
    newCopy.resolved = true;
    return newCopy;
  }

  handleBreakpointResolved(params) {
    const { breakpointId, location } = params;
    if (this._getBreakpointFromId(breakpointId) !== null) {
      this._sendBreakpointResolved(breakpointId, location);
    } else {
      // User has removed this breakpoint before engine resolves it.
      // This is an expected scenario, just ignore it.
    }
  }
}
exports.default = BreakpointManager;