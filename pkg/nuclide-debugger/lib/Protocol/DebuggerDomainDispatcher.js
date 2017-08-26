'use strict';

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Responsible for sending and receiving debugger domain protocols from
 * debug engine.
 */
class DebuggerDomainDispatcher {

  constructor(agent) {
    this._agent = agent;
    this._parsedFiles = new Map();
    this._debugEvent$ = new _rxjsBundlesRxMinJs.Subject();
    this._pauseCount = 0;
  } // debugger agent from chrome protocol.


  setDebuggerSettings(settings) {
    this._agent.setDebuggerSettings(settings.singleThreadStepping);
  }

  getSourceUriFromUri(fileUri) {
    for (const uri of this._parsedFiles.values()) {
      // Strip file:// from the uri.
      const strippedUri = (_nuclideUri || _load_nuclideUri()).default.uriToNuclideUri(uri) || uri;
      if (strippedUri === fileUri) {
        return uri;
      }
    }
    return null;
  }

  getScriptIdFromUri(fileUri) {
    for (const [scriptId, uri] of this._parsedFiles) {
      // Strip file:// from the uri.
      const strippedUri = (_nuclideUri || _load_nuclideUri()).default.uriToNuclideUri(uri) || uri;
      if (strippedUri === fileUri) {
        return scriptId;
      }
    }
    return null;
  }

  enable() {
    this._agent.enable();
  }

  resume() {
    this._agent.resume();
  }

  pause() {
    this._agent.pause();
  }

  stepOver() {
    this._agent.stepOver();
  }

  stepInto() {
    this._agent.stepInto();
  }

  stepOut() {
    this._agent.stepOut();
  }

  continueToLocation(location) {
    this._agent.continueToLocation(location);
  }

  setPauseOnExceptions(request) {
    this._agent.setPauseOnExceptions(request.state);
  }

  setBreakpointByUrl(breakpoint, callback) {
    this._agent.setBreakpointByUrl(breakpoint.lineNumber, breakpoint.sourceURL, undefined, // urlRegex. Not used.
    0, // column. Not used yet.
    breakpoint.condition, callback);
  }

  removeBreakpoint(breakpointId) {
    this._agent.removeBreakpoint(breakpointId);
  }

  evaluateOnCallFrame(callFrameId, expression, objectGroup, callback) {
    this._agent.evaluateOnCallFrame(callFrameId, expression, objectGroup, undefined, // includeCommandLineAPI
    undefined, // silent
    undefined, // returnByValue
    undefined, // generatePreview
    callback);
  }

  selectThread(threadId) {
    this._agent.selectThread(threadId);
  }

  getThreadStack(threadId, callback) {
    this._agent.getThreadStack(threadId, callback);
  }

  getEventObservable() {
    return this._debugEvent$.asObservable();
  }

  paused(params) {
    ++this._pauseCount;
    // Convert the first Debugger.paused to Debugger.loaderBreakpoint.
    if (this._pauseCount === 1) {
      this._raiseProtocolEvent({
        method: 'Debugger.loaderBreakpoint',
        params
      });
    } else {
      this._raiseProtocolEvent({
        method: 'Debugger.paused',
        params
      });
    }
  }

  resumed() {
    this._raiseProtocolEvent({
      method: 'Debugger.resumed'
    });
  }

  threadsUpdated(params) {
    this._raiseProtocolEvent({
      method: 'Debugger.threadsUpdated',
      params
    });
  }

  threadUpdated(params) {
    this._raiseProtocolEvent({
      method: 'Debugger.threadUpdated',
      params
    });
  }

  breakpointResolved(params) {
    this._raiseProtocolEvent({
      method: 'Debugger.breakpointResolved',
      params
    });
  }

  breakpointHitCountChanged(params) {
    this._raiseProtocolEvent({
      method: 'Debugger.breakpointHitCountChanged',
      params
    });
  }

  scriptParsed(params) {
    this._parsedFiles.set(params.scriptId, params.url);
  }

  getFileUriFromScriptId(scriptId) {
    // Fallback to treat scriptId as url. Some engines(like MobileJS) uses
    // scriptId as file url.
    return this._parsedFiles.get(scriptId) || scriptId;
  }

  _raiseProtocolEvent(event) {
    this._debugEvent$.next(event);
  }
}

// Use old school export to allow legacy code to import it.
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

module.exports = DebuggerDomainDispatcher; // eslint-disable-line nuclide-internal/no-commonjs