'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var remoteUri = require('nuclide-remote-uri');
var {CompositeDisposable, Disposable} = require('atom');

import type * as BreakpointStore from './BreakpointStore';

class Bridge {
  _breakpointStore: BreakpointStore;
  _disposables: CompositeDisposable;
  // Contains disposable items should be disposed by
  // cleanup() method.
  _cleanupDisposables: CompositeDisposable;
  _selectedCallFrameMarker: ?atom$Marker;
  _webview: ?WebviewElement;

  constructor(breakpointStore: BreakpointStore) {
    this._breakpointStore = breakpointStore;
    this._disposables = new CompositeDisposable();
    this._cleanupDisposables = new CompositeDisposable();
    this._selectedCallFrameMarker = null;
    this._disposables.add(
      breakpointStore.onChange(this._handleBreakpointStoreChange.bind(this)));
  }

  setWebviewElement(webview: WebviewElement) {
    this._webview = webview;
    var boundHandler = this._handleIpcMessage.bind(this);
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

  _handleIpcMessage(event: Event & {channel: string; args: any[]}) {
    switch (event.channel) {
      case 'notification':
        switch (event.args[0]) {
          case 'ready':
            this._sendAllBreakpoints();
            break;
          case 'CallFrameSelected':
            this._setSelectedCallFrameLine(event.args[1]);
            break;
          case 'OpenSourceLocation':
            this._openSourceLocation(event.args[1]);
            break;
          case 'DebuggerResumed':
            this._setSelectedCallFrameLine(null);
            break;
        }
        break;
    }
  }

  _setSelectedCallFrameLine(nullableOptions: ?{sourceURL: string; lineNumber: number}) {
    if (nullableOptions) {
      var options = nullableOptions; // For use in capture without re-checking null
      var path = remoteUri.uriToNuclideUri(options.sourceURL);
      if (path) { // only handle real files for now
        atom.workspace.open(path).then(editor => {
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
      var options = nullableOptions; // For use in capture without re-checking null
      var path = remoteUri.uriToNuclideUri(options.sourceURL);
      if (path) { // only handle real files for now.
        atom.workspace.open(path)
          .then((editor) => {
            editor.scrollToBufferPosition([options.lineNumber, 0]);
            editor.setCursorBufferPosition([options.lineNumber, 0]);
          });
      }
    }
  }

  _highlightCallFrameLine(editor: atom$TextEditor, line: number) {
    var marker = editor.markBufferRange(
      [[line, 0], [line, Infinity]],
      {persistent: false, invalidate: 'never'});
    editor.decorateMarker(marker, {
      type: 'line',
      class: 'nuclide-current-line-highlight',
    });
    this._selectedCallFrameMarker = marker;
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
    var results = [];
    this._breakpointStore.getAllBreakpoints().forEach((line, key) => {
      results.push({
        sourceURL: remoteUri.nuclideUriToUri(key),
        lineNumber: line,
      });
    });

    if (this._webview) {
      this._webview.send('command', 'SyncBreakpoints', results);
    }
  }
}

module.exports = Bridge;
