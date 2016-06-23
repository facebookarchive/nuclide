'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Dispatcher} from 'flux';

import {
  Disposable,
  CompositeDisposable,
} from 'atom';
import {EventEmitter} from 'events';
import remoteUri from '../../nuclide-remote-uri';
import Constants from './Constants';

type CallstackItem = {
  name: string;
  location: {
    path: string;
    line: number;
    column?: number;
  };
};
export type Callstack = Array<CallstackItem>;

export default class CallstackStore {
  _disposables: IDisposable;
  _eventEmitter: EventEmitter;
  _callstack: ?Callstack;
  _selectedCallFrameMarker: ?atom$Marker;

  constructor(dispatcher: Dispatcher) {
    const dispatcherToken = dispatcher.register(this._handlePayload.bind(this));
    this._disposables = new CompositeDisposable(
      new Disposable(() => {
        dispatcher.unregister(dispatcherToken);
      })
    );
    this._callstack = null;
    this._selectedCallFrameMarker = null;
    this._eventEmitter = new EventEmitter();
  }

  _handlePayload(payload: Object) {
    switch (payload.actionType) {
      case Constants.Actions.CLEAR_INTERFACE:
        this._handleClearInterface();
        break;
      case Constants.Actions.SET_SELECTED_CALLFRAME_LINE:
        this._setSelectedCallFrameLine(payload.data.options);
        break;
      case Constants.Actions.OPEN_SOURCE_LOCATION:
        this._openSourceLocation(payload.data.sourceURL, payload.data.lineNumber);
        break;
      case Constants.Actions.UPDATE_CALLSTACK:
        this._updateCallstack(payload.data.callstack);
        break;
      default:
        return;
    }
  }

  _updateCallstack(callstack: Callstack): void {
    this._callstack = callstack;
    this._eventEmitter.emit('change');
  }

  _openSourceLocation(sourceURL: string, lineNumber: number): void {
    const path = remoteUri.uriToNuclideUri(sourceURL);
    if (path != null && atom.workspace != null) { // only handle real files for now.
      atom.workspace.open(path, {searchAllPanes: true}).then(editor => {
        editor.scrollToBufferPosition([lineNumber, 0]);
        editor.setCursorBufferPosition([lineNumber, 0]);
      });
    }
  }

  _handleClearInterface(): void {
    this._setSelectedCallFrameLine(null);
  }

  _setSelectedCallFrameLine(options: ?{sourceURL: string; lineNumber: number}) {
    if (options) {
      const path = remoteUri.uriToNuclideUri(options.sourceURL);
      const {lineNumber} = options;
      if (path != null && atom.workspace != null) { // only handle real files for now
        atom.workspace.open(path, {searchAllPanes: true}).then(editor => {
          this._clearSelectedCallFrameMarker();
          this._highlightCallFrameLine(editor, lineNumber);
        });
      }
    } else {
      this._clearSelectedCallFrameMarker();
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

  _clearSelectedCallFrameMarker() {
    if (this._selectedCallFrameMarker) {
      this._selectedCallFrameMarker.destroy();
      this._selectedCallFrameMarker = null;
    }
  }

  onChange(callback: () => void): Disposable {
    const emitter = this._eventEmitter;
    this._eventEmitter.on('change', callback);
    return new Disposable(() => emitter.removeListener('change', callback));
  }

  getCallstack(): ?Callstack {
    return this._callstack;
  }

  dispose(): void {
    this._clearSelectedCallFrameMarker();
    this._disposables.dispose();
  }
}
