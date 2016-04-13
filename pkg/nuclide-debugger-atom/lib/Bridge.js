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

type ExpressionResult = {
  expression: string;
  result: ?EvaluationResult;
  error: ?Object;
};

export type EvaluationResult = {
  _type: string;
  // Either:
  value?: string;
  // Or:
  _description? : string;
};

import Rx from '@reactivex/rxjs';
import invariant from 'assert';
const {CompositeDisposable, Disposable} = require('atom');

import {getLogger} from '../../nuclide-logging';
const remoteUri = require('../../nuclide-remote-uri');
import {DebuggerMode} from './DebuggerStore';

const INJECTED_CSS = [
  /* Force the inspector to scroll vertically on Atom ≥ 1.4.0 */
  'body > .root-view {overflow-y: scroll;}',
  /* Force the contents of the mini console (on the bottom) to scroll vertically */
  '.insertion-point-sidebar#drawer-contents {overflow-y: auto;}',
].join('');

async function promiseForBehaviorSubject<T>(subject: Rx.BehaviorSubject<T>): Promise<?T> {
  try {
    await subject.toPromise();
  } catch (e) {
    getLogger().warn('promiseForBehaviorSubject: Subject observed error.', e);
    return null;
  }
  return subject.getValue();
}

class Bridge {
  _debuggerModel: DebuggerModel;
  _disposables: CompositeDisposable;
  // Contains disposable items should be disposed by
  // cleanup() method.
  _cleanupDisposables: CompositeDisposable;
  _selectedCallFrameMarker: ?atom$Marker;
  _webview: ?WebviewElement;
  _suppressBreakpointSync: boolean;
  // Tracks requests for expression evaluation, keyed by the expression body.
  _expressionsInFlight: Map<string, Rx.BehaviorSubject<?EvaluationResult>>;

  constructor(debuggerModel: DebuggerModel) {
    this._debuggerModel = debuggerModel;
    this._cleanupDisposables = new CompositeDisposable();
    this._selectedCallFrameMarker = null;
    this._webview = null;
    this._suppressBreakpointSync = false;
    this._disposables = new CompositeDisposable(
      debuggerModel.getBreakpointStore().onChange(this._handleBreakpointStoreChange.bind(this)),
    );
    this._expressionsInFlight = new Map();
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
    this._clearSelectedCallFrameMarker();
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

  async evaluateOnSelectedCallFrame(expression: string): Promise<?EvaluationResult> {
    if (this._webview == null) {
      return null;
    }
    let subject;
    if (this._expressionsInFlight.has(expression)) {
      subject = this._expressionsInFlight.get(expression);
    } else {
      subject = new Rx.BehaviorSubject();
      this._expressionsInFlight.set(expression, subject);
      invariant(this._webview != null);
      this._webview.send('command', 'evaluateOnSelectedCallFrame', expression);
    }
    invariant(subject != null);
    const result: EvaluationResult = (await promiseForBehaviorSubject(subject): any);
    this._expressionsInFlight.delete(expression);
    return result;
  }

  _handleExpressionEvaluationResponse(additionalData: ExpressionResult): void {
    const {
      expression,
      result,
      error,
    } = additionalData;
    const subject = this._expressionsInFlight.get(expression);
    if (subject == null) {
      // Nobody is listening for the result of this expression.
      return;
    }
    if (error != null) {
      subject.error(error);
    } else {
      subject.next(result);
      subject.complete();
    }
  }

  _handleIpcMessage(stdEvent: Event): void {
    // addEventListener expects its callback to take an Event. I'm not sure how to reconcile it with
    // the type that is expected here.
    // $FlowFixMe(jeffreytan)
    const event: {channel: string; args: any[]} = stdEvent;
    switch (event.channel) {
      case 'notification':
        switch (event.args[0]) {
          case 'ready':
            this._sendAllBreakpoints();
            this._injectCSS();
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
            this._addBreakpoint(event.args[1]);
            break;
          case 'BreakpointRemoved':
            this._removeBreakpoint(event.args[1]);
            break;
          case 'DebuggerPaused':
            this._handleDebuggerPaused(event.args[1]);
            break;
          case 'ExpressionEvaluationResponse':
            this._handleExpressionEvaluationResponse(event.args[1]);
            break;
        }
        break;
    }
  }

  _handleDebuggerPaused(additionalData: {sourceUrl?: string}): void {
    this._debuggerModel.getStore().setDebuggerMode(DebuggerMode.PAUSED);
    // TODO go through dispatcher
    this._debuggerModel.getWatchExpressionStore().triggerReevaluation();
  }

  _handleClearInterface(): void {
    this._setSelectedCallFrameLine(null);
  }

  _handleDebuggerResumed(): void {
    this._debuggerModel.getStore().setDebuggerMode(DebuggerMode.RUNNING);
  }

  _handleLoaderBreakpointResumed(): void {
    this._debuggerModel.getStore().loaderBreakpointResumed();
  }

  _setSelectedCallFrameLine(nullableOptions: ?{sourceURL: string; lineNumber: number}) {
    if (nullableOptions) {
      const options = nullableOptions; // For use in capture without re-checking null
      const path = remoteUri.uriToNuclideUri(options.sourceURL);
      if (path != null && atom.workspace != null) { // only handle real files for now
        atom.workspace.open(path, {searchAllPanes: true}).then(editor => {
          this._clearSelectedCallFrameMarker();
          this._highlightCallFrameLine(editor, options.lineNumber);
        });
      }
    } else {
      this._clearSelectedCallFrameMarker();
    }
  }

  _openSourceLocation(nullableOptions: ?{sourceURL: string; lineNumber: number}) {
    if (nullableOptions) {
      const options = nullableOptions; // For use in capture without re-checking null
      const path = remoteUri.uriToNuclideUri(options.sourceURL);
      if (path != null && atom.workspace != null) { // only handle real files for now.
        atom.workspace.open(path, {searchAllPanes: true}).then(editor => {
          editor.scrollToBufferPosition([options.lineNumber, 0]);
          editor.setCursorBufferPosition([options.lineNumber, 0]);
        });
      }
    }
  }

  _highlightCallFrameLine(editor: atom$TextEditor, line: number) {
    const marker = editor.markBufferRange(
      [[line, 0], [line, Infinity]],
      {persistent: false, invalidate: 'never'});
    editor.decorateMarker(marker, {
      type: 'line',
      class: 'nuclide-current-line-highlight',
    });
    this._selectedCallFrameMarker = marker;
  }

  _addBreakpoint(location: {sourceURL: string; lineNumber: number}) {
    const path = remoteUri.uriToNuclideUri(location.sourceURL);
    // only handle real files for now.
    if (path) {
      try {
        this._suppressBreakpointSync = true;
        this._debuggerModel.getBreakpointStore().addBreakpoint(path, location.lineNumber);
      } finally {
        this._suppressBreakpointSync = false;
      }
    }
  }

  _removeBreakpoint(location: {sourceURL: string; lineNumber: number}) {
    const path = remoteUri.uriToNuclideUri(location.sourceURL);
    // only handle real files for now.
    if (path) {
      try {
        this._suppressBreakpointSync = true;
        this._debuggerModel.getBreakpointStore().deleteBreakpoint(path, location.lineNumber);
      } finally {
        this._suppressBreakpointSync = false;
      }
    }
  }

  _clearSelectedCallFrameMarker() {
    if (this._selectedCallFrameMarker) {
      this._selectedCallFrameMarker.destroy();
      this._selectedCallFrameMarker = null;
    }
  }

  _handleBreakpointStoreChange(path: string) {
    this._sendAllBreakpoints();
  }

  _sendAllBreakpoints() {
    // Send an array of file/line objects.
    const webview = this._webview;
    if (webview && !this._suppressBreakpointSync) {
      const results = [];
      this._debuggerModel.getBreakpointStore().getAllBreakpoints().forEach((line, key) => {
        results.push({
          sourceURL: remoteUri.nuclideUriToUri(key),
          lineNumber: line,
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
