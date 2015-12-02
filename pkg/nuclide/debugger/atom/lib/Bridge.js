'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const remoteUri = require('nuclide-remote-uri');
const {CompositeDisposable, Disposable} = require('atom');

import type * as BreakpointStoreType from './BreakpointStore';

class Bridge {
  _breakpointStore: BreakpointStoreType;
  _disposables: CompositeDisposable;
  // Contains disposable items should be disposed by
  // cleanup() method.
  _cleanupDisposables: CompositeDisposable;
  _selectedCallFrameMarker: ?atom$Marker;
  _webview: ?WebviewElement;
  _suppressBreakpointSync: boolean;

  constructor(breakpointStore: BreakpointStoreType) {
    this._breakpointStore = breakpointStore;
    this._disposables = new CompositeDisposable();
    this._cleanupDisposables = new CompositeDisposable();
    this._selectedCallFrameMarker = null;
    this._webview = null;
    this._suppressBreakpointSync = false;
    this._disposables.add(
      breakpointStore.onChange(this._handleBreakpointStoreChange.bind(this)));
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

  _handleIpcMessage(event: {channel: string; args: any[]}) {
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
          case 'BreakpointAdded':
            this._addBreakpoint(event.args[1]);
            break;
          case 'BreakpointRemoved':
            this._removeBreakpoint(event.args[1]);
            break;
        }
        break;
    }
  }

  _setSelectedCallFrameLine(nullableOptions: ?{sourceURL: string; lineNumber: number}) {
    if (nullableOptions) {
      const options = nullableOptions; // For use in capture without re-checking null
      const path = remoteUri.uriToNuclideUri(options.sourceURL);
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
      const options = nullableOptions; // For use in capture without re-checking null
      const path = remoteUri.uriToNuclideUri(options.sourceURL);
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
        this._breakpointStore.addBreakpoint(path, location.lineNumber);
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
        this._breakpointStore.deleteBreakpoint(path, location.lineNumber);
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
      this._breakpointStore.getAllBreakpoints().forEach((line, key) => {
        results.push({
          sourceURL: remoteUri.nuclideUriToUri(key),
          lineNumber: line,
        });
      });
      webview.send('command', 'SyncBreakpoints', results);
    }
  }
}

module.exports = Bridge;
