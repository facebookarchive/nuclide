'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type DebuggerModel from './DebuggerModel';
import type {
  Callstack,
  EvaluationResult,
  ExpansionResult,
  ObjectGroup,
  NuclideThreadData,
  BreakpointUserChangeArgType,
} from './types';

type ExpressionResult = ChromeProtocolResponse & {
  expression: string,
};

type GetPropertiesResult = ChromeProtocolResponse & {
  objectId: string,
};

type ChromeProtocolResponse = {
  result: ?EvaluationResult | ?GetPropertiesResult,
  error: ?Object,
};

import invariant from 'assert';
import {CompositeDisposable, Disposable} from 'atom';
import {getLogger} from '../../nuclide-logging';
import nuclideUri from '../../commons-node/nuclideUri';
import {Deferred} from '../../commons-node/promise';
import {DebuggerMode} from './DebuggerStore';
import {normalizeRemoteObjectValue} from './normalizeRemoteObjectValue';

const INJECTED_CSS = [
  /* Force the inspector to scroll vertically on Atom ≥ 1.4.0 */
  'body > .root-view {overflow-y: scroll;}',
  /* Force the contents of the mini console (on the bottom) to scroll vertically */
  '.insertion-point-sidebar#drawer-contents {overflow-y: auto;}',
  /* imitate chrome table styles for threads window */
  `
  .nuclide-chrome-debugger-data-grid table {
    border-spacing: 0;
  }

  .nuclide-chrome-debugger-data-grid thead {
    background-color: #eee;
  }

  .nuclide-chrome-debugger-data-grid thead td {
    border-bottom: 1px solid #aaa;
  }

  .nuclide-chrome-debugger-data-grid tbody tr:nth-child(2n+1) {
    background: aliceblue;
  }

  .nuclide-chrome-debugger-data-grid td {
    border-left: 1px solid #aaa;
    padding: 2px 4px;
  }

  .nuclide-chrome-debugger-data-grid td:first-child {
    border-left: none;
  }
  `,
].join('');

class Bridge {
  _debuggerModel: DebuggerModel;
  _disposables: CompositeDisposable;
  // Contains disposable items should be disposed by
  // cleanup() method.
  _cleanupDisposables: CompositeDisposable;
  _webview: ?WebviewElement;
  _suppressBreakpointSync: boolean;
  // Tracks requests for expression evaluation, keyed by the expression body.
  _expressionsInFlight: Map<string, Deferred<?EvaluationResult>>;
  _getPropertiesRequestsInFlight: Map<string, Deferred<?ExpansionResult>>;

  constructor(debuggerModel: DebuggerModel) {
    this._debuggerModel = debuggerModel;
    this._cleanupDisposables = new CompositeDisposable();
    this._webview = null;
    this._suppressBreakpointSync = false;
    this._disposables = new CompositeDisposable(
      debuggerModel.getBreakpointStore().onUserChange(this._handleUserBreakpointChange.bind(this)),
    );
    this._expressionsInFlight = new Map();
    this._getPropertiesRequestsInFlight = new Map();
  }

  setWebviewElement(webview: WebviewElement) {
    this._webview = webview;
    const boundHandler = this._handleIpcMessage.bind(this);
    webview.addEventListener('ipc-message', boundHandler);
    this._cleanupDisposables.add(new Disposable(() =>
      webview.removeEventListener('ipc-message', boundHandler)));
  }

  dispose() {
    this.cleanup();
    this._disposables.dispose();
  }

  // Clean up any state changed after constructor.
  cleanup() {
    this._cleanupDisposables.dispose();
    this._webview = null;
    // Poor man's `waitFor` to prevent nested dispatch. Actual `waitsFor` requires passing around
    // dispatch tokens between unrelated stores, which is quite cumbersome.
    // TODO @jxg move to redux to eliminate this problem altogether.
    setTimeout(() => {
      this._debuggerModel.getActions().clearInterface();
    });
  }

  continue() {
    if (this._webview) {
      this._webview.send('command', 'Continue');
    }
  }

  stepOver() {
    if (this._webview) {
      this._webview.send('command', 'StepOver');
    }
  }

  stepInto() {
    if (this._webview) {
      this._webview.send('command', 'StepInto');
    }
  }

  stepOut() {
    if (this._webview) {
      this._webview.send('command', 'StepOut');
    }
  }

  getProperties(objectId: string): Promise<?ExpansionResult> {
    return this._cachedSendCommand(this._getPropertiesRequestsInFlight, 'getProperties', objectId);
  }

  evaluateWatchExpression(expression: string): Promise<?EvaluationResult> {
    return this._evaluateOnSelectedCallFrame(expression, 'watch-group');
  }

  evaluateConsoleExpression(expression: string): Promise<?EvaluationResult> {
    if (this._debuggerModel.getStore().getDebuggerMode() === 'paused') {
      return this._evaluateOnSelectedCallFrame(expression, 'console');
    } else {
      return this._runtimeEvaluate(expression);
    }
  }

  triggerAction(actionId: string): void {
    if (this._webview) {
      this._webview.send(
        'command',
        'triggerDebuggerAction',
        actionId,
      );
    }
  }

  setPauseOnException(pauseOnExceptionEnabled: boolean): void {
    if (this._webview) {
      this._webview.send(
        'command',
        'setPauseOnException',
        pauseOnExceptionEnabled,
      );
    }
  }

  setPauseOnCaughtException(pauseOnCaughtExceptionEnabled: boolean): void {
    if (this._webview) {
      this._webview.send(
        'command',
        'setPauseOnCaughtException',
        pauseOnCaughtExceptionEnabled,
      );
    }
  }

  setSingleThreadStepping(singleThreadStepping: boolean): void {
    if (this._webview) {
      this._webview.send(
        'command',
        'setSingleThreadStepping',
        singleThreadStepping,
      );
    }
  }

  selectThread(threadId: string): void {
    if (this._webview) {
      this._webview.send(
        'command',
        'selectThread',
        threadId,
      );
    }
  }

  async _evaluateOnSelectedCallFrame(
    expression: string,
    objectGroup: ObjectGroup,
  ): Promise<?EvaluationResult> {
    const result = await this._cachedSendCommand(
      this._expressionsInFlight,
      'evaluateOnSelectedCallFrame',
      expression,
      objectGroup,
    );
    if (result == null) {
      // TODO: It would be nice to expose a better error from the backend here.
      return {
        type: 'text',
        value: `Failed to evaluate: ${expression}`,
      };
    } else {
      return result;
    }
  }

  async _runtimeEvaluate(expression: string): Promise<?EvaluationResult> {
    const result = await this._cachedSendCommand(
      this._expressionsInFlight,
      'runtimeEvaluate',
      expression,
    );
    if (result == null) {
      // TODO: It would be nice to expose a better error from the backend here.
      return {
        type: 'text',
        value: `Failed to evaluate: ${expression}`,
      };
    } else {
      return result;
    }
  }

  async _cachedSendCommand<T>(
    cache: Map<string, Deferred<?T>>,
    command: string,
    ...args: Array<mixed>
  ): Promise<?T> {
    const webview = this._webview;
    if (webview == null) {
      return null;
    }
    const value = args[0];
    invariant(typeof value === 'string');
    let deferred;
    if (cache.has(value)) {
      deferred = cache.get(value);
    } else {
      deferred = new Deferred();
      cache.set(value, deferred);
      webview.send('command', command, ...args);
    }
    invariant(deferred != null);
    let result;
    try {
      result = await deferred.promise;
    } catch (e) {
      getLogger().warn(`${command}: Error getting result.`, e);
      result = null;
    }
    cache.delete(value);
    return result;
  }

  _handleExpressionEvaluationResponse(response: ExpressionResult): void {
    response.result = normalizeRemoteObjectValue(response.result);
    this._handleResponseForPendingRequest(this._expressionsInFlight, response, response.expression);
  }

  _handleGetPropertiesResponse(response: GetPropertiesResult): void {
    this._handleResponseForPendingRequest(
      this._getPropertiesRequestsInFlight,
      response,
      response.objectId,
    );
  }

  _handleCallstackUpdate(callstack: Callstack): void {
    this._debuggerModel.getActions().updateCallstack(callstack);
  }

  _handleLocalsUpdate(locals: ExpansionResult): void {
    this._debuggerModel.getActions().updateLocals(locals);
  }

  _handleResponseForPendingRequest<T>(
    pending: Map<string, Deferred<?T>>,
    response: ChromeProtocolResponse,
    key: string,
  ): void {
    const {
      result,
      error,
    } = response;
    const deferred = pending.get(key);
    if (deferred == null) {
      // Nobody is listening for the result of this expression.
      return;
    }
    if (error != null) {
      deferred.reject(error);
    } else {
      deferred.resolve(((result : any) : T));
    }
  }

  _handleIpcMessage(stdEvent: Event): void {
    // addEventListener expects its callback to take an Event. I'm not sure how to reconcile it with
    // the type that is expected here.
    // $FlowFixMe(jeffreytan)
    const event: {channel: string, args: any[]} = stdEvent;
    switch (event.channel) {
      case 'notification':
        switch (event.args[0]) {
          case 'ready':
            this._updateDebuggerSettings();
            this._sendAllBreakpoints();
            this._injectCSS();
            this._syncDebuggerState();
            break;
          case 'CallFrameSelected':
            this._setSelectedCallFrameLine(event.args[1]);
            break;
          case 'OpenSourceLocation':
            this._openSourceLocation(event.args[1]);
            break;
          case 'ClearInterface':
            this._handleClearInterface();
            break;
          case 'DebuggerResumed':
            this._handleDebuggerResumed();
            break;
          case 'LoaderBreakpointResumed':
            this._handleLoaderBreakpointResumed();
            break;
          case 'BreakpointAdded':
            // BreakpointAdded from chrome side is actually
            // binding the breakpoint.
            this._bindBreakpoint(event.args[1]);
            break;
          case 'BreakpointRemoved':
            this._removeBreakpoint(event.args[1]);
            break;
          case 'NonLoaderDebuggerPaused':
            this._handleDebuggerPaused();
            break;
          case 'ExpressionEvaluationResponse':
            this._handleExpressionEvaluationResponse(event.args[1]);
            break;
          case 'GetPropertiesResponse':
            this._handleGetPropertiesResponse(event.args[1]);
            break;
          case 'CallstackUpdate':
            this._handleCallstackUpdate(event.args[1]);
            break;
          case 'LocalsUpdate':
            this._handleLocalsUpdate(event.args[1]);
            break;
          case 'ThreadsUpdate':
            this._handleThreadsUpdate(event.args[1]);
            break;
          case 'StopThreadSwitch':
            this._handleStopThreadSwitch(event.args[1]);
            break;
        }
        break;
    }
  }

  _updateDebuggerSettings(): void {
    const webview = this._webview;
    if (webview != null) {
      webview.send(
        'command',
        'UpdateSettings',
        this._debuggerModel.getStore().getSettings().getSerializedData(),
      );
    }
  }

  _syncDebuggerState(): void {
    const store = this._debuggerModel.getStore();
    this.setPauseOnException(store.getTogglePauseOnException());
    this.setPauseOnCaughtException(store.getTogglePauseOnCaughtException());
    this.setSingleThreadStepping(store.getEnableSingleThreadStepping());
  }

  _handleDebuggerPaused(): void {
    this._expressionsInFlight.clear();
    this._debuggerModel.getActions().setDebuggerMode(DebuggerMode.PAUSED);
  }

  _handleDebuggerResumed(): void {
    this._debuggerModel.getActions().setDebuggerMode(DebuggerMode.RUNNING);
  }

  _handleLoaderBreakpointResumed(): void {
    this._debuggerModel.getStore().loaderBreakpointResumed();
  }

  _handleClearInterface(): void {
    this._debuggerModel.getActions().clearInterface();
  }

  _setSelectedCallFrameLine(options: ?{sourceURL: string, lineNumber: number}): void {
    this._debuggerModel.getActions().setSelectedCallFrameline(options);
  }

  _openSourceLocation(options: ?{sourceURL: string, lineNumber: number}): void {
    if (options == null) {
      return;
    }
    this._debuggerModel.getActions().openSourceLocation(
      options.sourceURL,
      options.lineNumber,
    );
  }

  _handleStopThreadSwitch(options: ?{sourceURL: string, lineNumber: number, message: string}) {
    if (options == null) {
      return;
    }
    this._debuggerModel.getActions().notifyThreadSwitch(
      options.sourceURL,
      options.lineNumber,
      options.message,
    );
  }

  _bindBreakpoint(location: {sourceURL: string, lineNumber: number}) {
    const path = nuclideUri.uriToNuclideUri(location.sourceURL);
    // only handle real files for now.
    if (path) {
      try {
        this._suppressBreakpointSync = true;
        this._debuggerModel.getActions().bindBreakpointIPC(path, location.lineNumber);
      } finally {
        this._suppressBreakpointSync = false;
      }
    }
  }

  _removeBreakpoint(location: {sourceURL: string, lineNumber: number}) {
    const path = nuclideUri.uriToNuclideUri(location.sourceURL);
    // only handle real files for now.
    if (path) {
      try {
        this._suppressBreakpointSync = true;
        this._debuggerModel.getActions().deleteBreakpointIPC(path, location.lineNumber);
      } finally {
        this._suppressBreakpointSync = false;
      }
    }
  }

  _handleUserBreakpointChange(params: BreakpointUserChangeArgType) {
    const webview = this._webview;
    if (webview != null) {
      const {action, breakpoint} = params;
      webview.send('command', action, {
        sourceURL: nuclideUri.nuclideUriToUri(breakpoint.path),
        lineNumber: breakpoint.line,
      });
    }
  }

  _handleThreadsUpdate(threadData: NuclideThreadData): void {
    this._debuggerModel.getActions().updateThreads(threadData);
  }

  _sendAllBreakpoints() {
    // Send an array of file/line objects.
    const webview = this._webview;
    if (webview && !this._suppressBreakpointSync) {
      const results = [];
      this._debuggerModel.getBreakpointStore().getAllBreakpoints().forEach(breakpoint => {
        results.push({
          sourceURL: nuclideUri.nuclideUriToUri(breakpoint.path),
          lineNumber: breakpoint.line,
        });
      });
      webview.send('command', 'SyncBreakpoints', results);
    }
  }

  _injectCSS() {
    if (this._webview != null) {
      this._webview.insertCSS(INJECTED_CSS);
    }
  }

}

module.exports = Bridge;
