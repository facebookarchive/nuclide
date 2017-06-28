'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _debounce;

function _load_debounce() {
  return _debounce = _interopRequireDefault(require('nuclide-commons/debounce'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _ProviderRegistry;

function _load_ProviderRegistry() {
  return _ProviderRegistry = _interopRequireDefault(require('nuclide-commons-atom/ProviderRegistry'));
}

var _textEditor;

function _load_textEditor() {
  return _textEditor = require('nuclide-commons-atom/text-editor');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const HIGHLIGHT_DELAY_MS = 250; /**
                                 * Copyright (c) 2017-present, Facebook, Inc.
                                 * All rights reserved.
                                 *
                                 * This source code is licensed under the BSD-style license found in the
                                 * LICENSE file in the root directory of this source tree. An additional grant
                                 * of patent rights can be found in the PATENTS file in the same directory.
                                 *
                                 * 
                                 * @format
                                 */

class CodeHighlightManager {

  constructor() {
    this._providers = new (_ProviderRegistry || _load_ProviderRegistry()).default();
    this._markers = [];
    this._subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    const debouncedCallback = (0, (_debounce || _load_debounce()).default)(this._onCursorMove.bind(this), HIGHLIGHT_DELAY_MS, false);
    this._subscriptions.add((0, (_textEditor || _load_textEditor()).observeTextEditors)(editor => {
      const editorSubscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default();
      editorSubscriptions.add(editor.onDidChangeCursorPosition(event => {
        debouncedCallback(editor, event.newBufferPosition);
      }));
      editorSubscriptions.add(editor.onDidChange(event => {
        this._destroyMarkers();
        debouncedCallback(editor, editor.getCursorBufferPosition());
      }));
      editorSubscriptions.add(editor.onDidDestroy(() => {
        editorSubscriptions.dispose();
        this._subscriptions.remove(editorSubscriptions);
      }));
      this._subscriptions.add(editorSubscriptions);
    }));
  }

  _onCursorMove(editor, position) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (editor.isDestroyed() || _this._isPositionInHighlightedRanges(position)) {
        return;
      }

      // The cursor is outside the old markers, so they are now stale
      _this._destroyMarkers();

      const originalChangeCount = editor.getBuffer().changeCount;
      const highlightedRanges = yield _this._getHighlightedRanges(editor, position);
      if (highlightedRanges == null) {
        return;
      }

      // If the cursor has moved, or the file was edited
      // the highlighted ranges we just computed are useless, so abort
      if (_this._hasEditorChanged(editor, position, originalChangeCount)) {
        return;
      }

      _this._markers = highlightedRanges.map(function (range) {
        return editor.markBufferRange(range, {});
      });
      _this._markers.forEach(function (marker) {
        editor.decorateMarker(marker, {
          type: 'highlight',
          class: 'atom-ide-code-highlight-marker'
        });
      });
    })();
  }

  _getHighlightedRanges(editor, position) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const provider = _this2._providers.getProviderForEditor(editor);
      if (!provider) {
        return null;
      }

      return provider.highlight(editor, position);
    })();
  }

  _hasEditorChanged(editor, position, originalChangeCount) {
    return !editor.getCursorBufferPosition().isEqual(position) || editor.getBuffer().changeCount !== originalChangeCount;
  }

  _isPositionInHighlightedRanges(position) {
    return this._markers.map(marker => marker.getBufferRange()).some(range => range.containsPoint(position));
  }

  _destroyMarkers() {
    this._markers.splice(0).forEach(marker => marker.destroy());
  }

  addProvider(provider) {
    return this._providers.addProvider(provider);
  }

  dispose() {
    this._subscriptions.dispose();
    this._markers = [];
  }
}
exports.default = CodeHighlightManager;