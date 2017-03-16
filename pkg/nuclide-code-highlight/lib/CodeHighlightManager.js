'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _atom = require('atom');

var _textEditor;

function _load_textEditor() {
  return _textEditor = require('../../commons-atom/text-editor');
}

var _debounce;

function _load_debounce() {
  return _debounce = _interopRequireDefault(require('../../commons-node/debounce'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

const HIGHLIGHT_DELAY_MS = 250;

class CodeHighlightManager {

  constructor() {
    this._providers = [];
    this._markers = [];
    const subscriptions = this._subscriptions = new _atom.CompositeDisposable();
    const debouncedCallback = (0, (_debounce || _load_debounce()).default)(this._onCursorMove.bind(this), HIGHLIGHT_DELAY_MS, false);
    subscriptions.add((0, (_textEditor || _load_textEditor()).observeTextEditors)(editor => {
      const editorSubscriptions = new _atom.CompositeDisposable();
      editorSubscriptions.add(editor.onDidChangeCursorPosition(event => {
        debouncedCallback(editor, event.newBufferPosition);
      }));
      editorSubscriptions.add(editor.onDidChange(event => {
        this._destroyMarkers();
        debouncedCallback(editor, editor.getCursorBufferPosition());
      }));
      editorSubscriptions.add(editor.onDidDestroy(() => {
        editorSubscriptions.dispose();
        subscriptions.remove(editorSubscriptions);
      }));
      subscriptions.add(editorSubscriptions);
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
        editor.decorateMarker(marker, { type: 'highlight', class: 'nuclide-code-highlight-marker' });
      });
    })();
  }

  _getHighlightedRanges(editor, position) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const { scopeName } = editor.getGrammar();
      const [provider] = _this2._getMatchingProvidersForScopeName(scopeName);
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

  _getMatchingProvidersForScopeName(scopeName) {
    const matchingProviders = this._providers.filter(provider => {
      const providerGrammars = provider.selector.split(/, ?/);
      return provider.inclusionPriority > 0 && providerGrammars.indexOf(scopeName) !== -1;
    });
    return matchingProviders.sort((providerA, providerB) => {
      return providerB.inclusionPriority - providerA.inclusionPriority;
    });
  }

  _destroyMarkers() {
    this._markers.splice(0).forEach(marker => marker.destroy());
  }

  addProvider(provider) {
    this._providers.push(provider);
  }

  dispose() {
    if (this._subscriptions) {
      this._subscriptions.dispose();
      this._subscriptions = null;
    }
    this._providers = [];
    this._markers = [];
  }
}
exports.default = CodeHighlightManager;