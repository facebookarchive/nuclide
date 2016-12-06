'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _atom = require('atom');

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _DebuggerDispatcher;

function _load_DebuggerDispatcher() {
  return _DebuggerDispatcher = require('./DebuggerDispatcher');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class CallstackStore {

  constructor(dispatcher) {
    const dispatcherToken = dispatcher.register(this._handlePayload.bind(this));
    this._disposables = new _atom.CompositeDisposable(new _atom.Disposable(() => {
      dispatcher.unregister(dispatcherToken);
    }));
    this._callstack = null;
    this._selectedCallFrameIndex = 0;
    this._selectedCallFrameMarker = null;
    this._emitter = new _atom.Emitter();
  }

  _handlePayload(payload) {
    switch (payload.actionType) {
      case (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.CLEAR_INTERFACE:
        this._handleClearInterface();
        break;
      case (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.SET_SELECTED_CALLFRAME_LINE:
        // TODO: update _selectedCallFrameIndex.
        this._setSelectedCallFrameLine(payload.data.options);
        break;
      case (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.OPEN_SOURCE_LOCATION:
        this._openSourceLocation(payload.data.sourceURL, payload.data.lineNumber);
        break;
      case (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.UPDATE_CALLSTACK:
        this._updateCallstack(payload.data.callstack);
        break;
      case (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.SET_SELECTED_CALLFRAME_INDEX:
        this._updateSelectedCallFrameIndex(payload.data.index);
        break;
      default:
        return;
    }
  }

  _updateCallstack(callstack) {
    this._selectedCallFrameIndex = 0;
    this._callstack = callstack;
    this._emitter.emit('change');
  }

  _updateSelectedCallFrameIndex(index) {
    this._selectedCallFrameIndex = index;
    this._emitter.emit('change');
  }

  _openSourceLocation(sourceURL, lineNumber) {
    const path = (_nuclideUri || _load_nuclideUri()).default.uriToNuclideUri(sourceURL);
    if (path != null && atom.workspace != null) {
      // only handle real files for now.
      atom.workspace.open(path, { searchAllPanes: true }).then(editor => {
        this._nagivateToLocation(editor, lineNumber);
      });
    }
  }

  _nagivateToLocation(editor, line) {
    editor.scrollToBufferPosition([line, 0]);
    editor.setCursorBufferPosition([line, 0]);
  }

  _handleClearInterface() {
    this._selectedCallFrameIndex = 0;
    this._setSelectedCallFrameLine(null);
    this._updateCallstack([]);
  }

  _setSelectedCallFrameLine(options) {
    if (options) {
      const path = (_nuclideUri || _load_nuclideUri()).default.uriToNuclideUri(options.sourceURL);
      const { lineNumber } = options;
      if (path != null && atom.workspace != null) {
        // only handle real files for now
        atom.workspace.open(path, { searchAllPanes: true }).then(editor => {
          this._clearSelectedCallFrameMarker();
          this._highlightCallFrameLine(editor, lineNumber);
          this._nagivateToLocation(editor, lineNumber);
        });
      }
    } else {
      this._clearSelectedCallFrameMarker();
    }
  }

  _highlightCallFrameLine(editor, line) {
    const marker = editor.markBufferRange([[line, 0], [line, Infinity]], { invalidate: 'never' });
    editor.decorateMarker(marker, {
      type: 'line',
      class: 'nuclide-current-line-highlight'
    });
    this._selectedCallFrameMarker = marker;
  }

  _clearSelectedCallFrameMarker() {
    if (this._selectedCallFrameMarker) {
      this._selectedCallFrameMarker.destroy();
      this._selectedCallFrameMarker = null;
    }
  }

  onChange(callback) {
    return this._emitter.on('change', callback);
  }

  getCallstack() {
    return this._callstack;
  }

  getSelectedCallFrameIndex() {
    return this._selectedCallFrameIndex;
  }

  dispose() {
    this._clearSelectedCallFrameMarker();
    this._disposables.dispose();
  }
}
exports.default = CallstackStore;
module.exports = exports['default'];