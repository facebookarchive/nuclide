'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const remoteUri = require('../../../remote-uri');
const {CompositeDisposable, Disposable} = require('atom');

import type BreakpointStoreType from './BreakpointStore';

const INJECTED_CSS = [
  /* Force the inspector to scroll vertically on Atom ≥ 1.4.0 */
  'body > .root-view {overflow-y: scroll;}',
  /* Force the contents of the mini console (on the bottom) to scroll vertically */
  '.insertion-point-sidebar#drawer-contents {overflow-y: auto;}',
].join('');

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
    this._cleanupDisposables = new CompositeDisposable();
    this._selectedCallFrameMarker = null;
    this._webview = null;
    this._suppressBreakpointSync = false;
    this._disposables = new CompositeDisposable(
      breakpointStore.onChange(this._handleBreakpointStoreChange.bind(this)),
    );
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
      if (path != null) { // only handle real files for now
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
      if (path != null) { // only handle real files for now.
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

  _injectCSS() {
    if (this._webview != null) {
      this._webview.insertCSS(INJECTED_CSS);
    }
  }
}

module.exports = Bridge;
