Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _commonsNodeDebounce2;

function _commonsNodeDebounce() {
  return _commonsNodeDebounce2 = _interopRequireDefault(require('../../commons-node/debounce'));
}

var HIGHLIGHT_DELAY_MS = 250;

var CodeHighlightManager = (function () {
  function CodeHighlightManager() {
    _classCallCheck(this, CodeHighlightManager);

    this._providers = [];
    this._markers = [];
    var subscriptions = this._subscriptions = new (_atom2 || _atom()).CompositeDisposable();
    var debouncedCallback = (0, (_commonsNodeDebounce2 || _commonsNodeDebounce()).default)(this._highlightInEditor.bind(this), HIGHLIGHT_DELAY_MS, false);
    atom.workspace.observeTextEditors(function (editor) {
      subscriptions.add(editor.onDidChangeCursorPosition(function (event) {
        debouncedCallback(editor, event.newBufferPosition);
      }));
    });
  }

  _createClass(CodeHighlightManager, [{
    key: '_highlightInEditor',
    value: _asyncToGenerator(function* (editor, position) {
      if (this._isPositionInHighlightedRanges(position)) {
        return;
      }

      var _editor$getGrammar = editor.getGrammar();

      var scopeName = _editor$getGrammar.scopeName;

      var _getMatchingProvidersForScopeName2 = this._getMatchingProvidersForScopeName(scopeName);

      var _getMatchingProvidersForScopeName22 = _slicedToArray(_getMatchingProvidersForScopeName2, 1);

      var provider = _getMatchingProvidersForScopeName22[0];

      if (!provider) {
        return;
      }

      // Call out to hack to get highlighting ranges.  This can take some time
      var highlightedRanges = yield provider.highlight(editor, position);

      // If the cursor has moved the highlighted ranges we just computed are useless, so abort
      if (this._hasCursorMoved(editor, position)) {
        return;
      }

      // Destroy old highlighted sections and highlight new ones
      this._destroyMarkers();
      this._markers = highlightedRanges.map(function (range) {
        return editor.markBufferRange(range, {});
      });
      this._markers.forEach(function (marker) {
        editor.decorateMarker(marker, { type: 'highlight', 'class': 'nuclide-code-highlight-marker' });
      });
    })
  }, {
    key: '_hasCursorMoved',
    value: function _hasCursorMoved(editor, position) {
      return !editor.getCursorBufferPosition().isEqual(position);
    }
  }, {
    key: '_isPositionInHighlightedRanges',
    value: function _isPositionInHighlightedRanges(position) {
      return this._markers.map(function (marker) {
        return marker.getBufferRange();
      }).some(function (range) {
        return range.containsPoint(position);
      });
    }
  }, {
    key: '_getMatchingProvidersForScopeName',
    value: function _getMatchingProvidersForScopeName(scopeName) {
      var matchingProviders = this._providers.filter(function (provider) {
        var providerGrammars = provider.selector.split(/, ?/);
        return provider.inclusionPriority > 0 && providerGrammars.indexOf(scopeName) !== -1;
      });
      return matchingProviders.sort(function (providerA, providerB) {
        return providerB.inclusionPriority - providerA.inclusionPriority;
      });
    }
  }, {
    key: '_destroyMarkers',
    value: function _destroyMarkers() {
      this._markers.splice(0).forEach(function (marker) {
        return marker.destroy();
      });
    }
  }, {
    key: 'addProvider',
    value: function addProvider(provider) {
      this._providers.push(provider);
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      if (this._subscriptions) {
        this._subscriptions.dispose();
        this._subscriptions = null;
      }
      this._providers = [];
      this._markers = [];
    }
  }]);

  return CodeHighlightManager;
})();

exports.default = CodeHighlightManager;
module.exports = exports.default;