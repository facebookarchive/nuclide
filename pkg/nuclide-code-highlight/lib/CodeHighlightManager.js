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

var _atom = require('atom');

var _nuclideCommons = require('../../nuclide-commons');

var HIGHLIGHT_DELAY_MS = 250;

var CodeHighlightManager = (function () {
  function CodeHighlightManager() {
    _classCallCheck(this, CodeHighlightManager);

    this._providers = [];
    this._markers = [];
    var subscriptions = this._subscriptions = new _atom.CompositeDisposable();
    var debouncedCallback = (0, _nuclideCommons.debounce)(this._highlightInEditor.bind(this), HIGHLIGHT_DELAY_MS, false);
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

exports['default'] = CodeHighlightManager;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,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QUFRLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3hELGVBQU8sUUFBUSxDQUFDLGlCQUFpQixHQUFHLENBQUMsSUFBSSxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7T0FDckYsQ0FBQyxDQUFDO0FBQ0gsYUFBTyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsVUFBQyxTQUFTLEVBQUUsU0FBUyxFQUFLO0FBQ3RELGVBQU8sU0FBUyxDQUFDLGlCQUFpQixHQUFHLFNBQVMsQ0FBQyxpQkFBaUIsQ0FBQztPQUNsRSxDQUFDLENBQUM7S0FDSjs7O1dBRWMsMkJBQVM7QUFDdEIsVUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQUEsTUFBTTtlQUFJLE1BQU0sQ0FBQyxPQUFPLEVBQUU7T0FBQSxDQUFDLENBQUM7S0FDN0Q7OztXQUVVLHFCQUFDLFFBQStCLEVBQUU7QUFDM0MsVUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7S0FDaEM7OztXQUVNLG1CQUFHO0FBQ1IsVUFBSSxJQUFJLENBQUMsY0FBYyxFQUFFO0FBQ3ZCLFlBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDOUIsWUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUM7T0FDNUI7QUFDRCxVQUFJLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQztBQUNyQixVQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQztLQUNwQjs7O1NBeEZrQixvQkFBb0I7OztxQkFBcEIsb0JBQW9CIiwiZmlsZSI6IkNvZGVIaWdobGlnaHRNYW5hZ2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0NvZGVIaWdobGlnaHRQcm92aWRlcn0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHtkZWJvdW5jZX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1jb21tb25zJztcblxuY29uc3QgSElHSExJR0hUX0RFTEFZX01TID0gMjUwO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb2RlSGlnaGxpZ2h0TWFuYWdlciB7XG4gIF9zdWJzY3JpcHRpb25zOiA/Q29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX3Byb3ZpZGVyczogQXJyYXk8Q29kZUhpZ2hsaWdodFByb3ZpZGVyPjtcbiAgX21hcmtlcnM6IEFycmF5PGF0b20kTWFya2VyPjtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl9wcm92aWRlcnMgPSBbXTtcbiAgICB0aGlzLl9tYXJrZXJzID0gW107XG4gICAgY29uc3Qgc3Vic2NyaXB0aW9ucyA9IHRoaXMuX3N1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIGNvbnN0IGRlYm91bmNlZENhbGxiYWNrID0gZGVib3VuY2UoXG4gICAgICB0aGlzLl9oaWdobGlnaHRJbkVkaXRvci5iaW5kKHRoaXMpLFxuICAgICAgSElHSExJR0hUX0RFTEFZX01TLFxuICAgICAgZmFsc2UsXG4gICAgKTtcbiAgICBhdG9tLndvcmtzcGFjZS5vYnNlcnZlVGV4dEVkaXRvcnMoZWRpdG9yID0+IHtcbiAgICAgIHN1YnNjcmlwdGlvbnMuYWRkKGVkaXRvci5vbkRpZENoYW5nZUN1cnNvclBvc2l0aW9uKGV2ZW50ID0+IHtcbiAgICAgICAgZGVib3VuY2VkQ2FsbGJhY2soZWRpdG9yLCBldmVudC5uZXdCdWZmZXJQb3NpdGlvbik7XG4gICAgICB9KSk7XG4gICAgfSk7XG4gIH1cblxuICBhc3luYyBfaGlnaGxpZ2h0SW5FZGl0b3IoZWRpdG9yOiBhdG9tJFRleHRFZGl0b3IsIHBvc2l0aW9uOiBhdG9tJFBvaW50KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKHRoaXMuX2lzUG9zaXRpb25JbkhpZ2hsaWdodGVkUmFuZ2VzKHBvc2l0aW9uKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHtzY29wZU5hbWV9ID0gZWRpdG9yLmdldEdyYW1tYXIoKTtcbiAgICBjb25zdCBbcHJvdmlkZXJdID0gdGhpcy5fZ2V0TWF0Y2hpbmdQcm92aWRlcnNGb3JTY29wZU5hbWUoc2NvcGVOYW1lKTtcbiAgICBpZiAoIXByb3ZpZGVyKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gQ2FsbCBvdXQgdG8gaGFjayB0byBnZXQgaGlnaGxpZ2h0aW5nIHJhbmdlcy4gIFRoaXMgY2FuIHRha2Ugc29tZSB0aW1lXG4gICAgY29uc3QgaGlnaGxpZ2h0ZWRSYW5nZXMgPSBhd2FpdCBwcm92aWRlci5oaWdobGlnaHQoZWRpdG9yLCBwb3NpdGlvbik7XG5cbiAgICAvLyBJZiB0aGUgY3Vyc29yIGhhcyBtb3ZlZCB0aGUgaGlnaGxpZ2h0ZWQgcmFuZ2VzIHdlIGp1c3QgY29tcHV0ZWQgYXJlIHVzZWxlc3MsIHNvIGFib3J0XG4gICAgaWYgKHRoaXMuX2hhc0N1cnNvck1vdmVkKGVkaXRvciwgcG9zaXRpb24pKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gRGVzdHJveSBvbGQgaGlnaGxpZ2h0ZWQgc2VjdGlvbnMgYW5kIGhpZ2hsaWdodCBuZXcgb25lc1xuICAgIHRoaXMuX2Rlc3Ryb3lNYXJrZXJzKCk7XG4gICAgdGhpcy5fbWFya2VycyA9IGhpZ2hsaWdodGVkUmFuZ2VzLm1hcChcbiAgICAgIHJhbmdlID0+IGVkaXRvci5tYXJrQnVmZmVyUmFuZ2UocmFuZ2UsIHt9KVxuICAgICk7XG4gICAgdGhpcy5fbWFya2Vycy5mb3JFYWNoKG1hcmtlciA9PiB7XG4gICAgICBlZGl0b3IuZGVjb3JhdGVNYXJrZXIoXG4gICAgICAgIG1hcmtlcixcbiAgICAgICAge3R5cGU6ICdoaWdobGlnaHQnLCBjbGFzczogJ251Y2xpZGUtY29kZS1oaWdobGlnaHQtbWFya2VyJ30sXG4gICAgICApO1xuICAgIH0pO1xuICB9XG5cbiAgX2hhc0N1cnNvck1vdmVkKGVkaXRvcjogYXRvbSRUZXh0RWRpdG9yLCBwb3NpdGlvbjogYXRvbSRQb2ludCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAhZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkuaXNFcXVhbChwb3NpdGlvbik7XG4gIH1cblxuICBfaXNQb3NpdGlvbkluSGlnaGxpZ2h0ZWRSYW5nZXMocG9zaXRpb246IGF0b20kUG9pbnQpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fbWFya2Vyc1xuICAgICAgLm1hcChtYXJrZXIgPT4gbWFya2VyLmdldEJ1ZmZlclJhbmdlKCkpXG4gICAgICAuc29tZShyYW5nZSA9PiByYW5nZS5jb250YWluc1BvaW50KHBvc2l0aW9uKSk7XG4gIH1cblxuICBfZ2V0TWF0Y2hpbmdQcm92aWRlcnNGb3JTY29wZU5hbWUoc2NvcGVOYW1lOiBzdHJpbmcpOiBBcnJheTxDb2RlSGlnaGxpZ2h0UHJvdmlkZXI+IHtcbiAgICBjb25zdCBtYXRjaGluZ1Byb3ZpZGVycyA9IHRoaXMuX3Byb3ZpZGVycy5maWx0ZXIocHJvdmlkZXIgPT4ge1xuICAgICAgY29uc3QgcHJvdmlkZXJHcmFtbWFycyA9IHByb3ZpZGVyLnNlbGVjdG9yLnNwbGl0KC8sID8vKTtcbiAgICAgIHJldHVybiBwcm92aWRlci5pbmNsdXNpb25Qcmlvcml0eSA+IDAgJiYgcHJvdmlkZXJHcmFtbWFycy5pbmRleE9mKHNjb3BlTmFtZSkgIT09IC0xO1xuICAgIH0pO1xuICAgIHJldHVybiBtYXRjaGluZ1Byb3ZpZGVycy5zb3J0KChwcm92aWRlckEsIHByb3ZpZGVyQikgPT4ge1xuICAgICAgcmV0dXJuIHByb3ZpZGVyQi5pbmNsdXNpb25Qcmlvcml0eSAtIHByb3ZpZGVyQS5pbmNsdXNpb25Qcmlvcml0eTtcbiAgICB9KTtcbiAgfVxuXG4gIF9kZXN0cm95TWFya2VycygpOiB2b2lkIHtcbiAgICB0aGlzLl9tYXJrZXJzLnNwbGljZSgwKS5mb3JFYWNoKG1hcmtlciA9PiBtYXJrZXIuZGVzdHJveSgpKTtcbiAgfVxuXG4gIGFkZFByb3ZpZGVyKHByb3ZpZGVyOiBDb2RlSGlnaGxpZ2h0UHJvdmlkZXIpIHtcbiAgICB0aGlzLl9wcm92aWRlcnMucHVzaChwcm92aWRlcik7XG4gIH1cblxuICBkaXNwb3NlKCkge1xuICAgIGlmICh0aGlzLl9zdWJzY3JpcHRpb25zKSB7XG4gICAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMgPSBudWxsO1xuICAgIH1cbiAgICB0aGlzLl9wcm92aWRlcnMgPSBbXTtcbiAgICB0aGlzLl9tYXJrZXJzID0gW107XG4gIH1cbn1cbiJdfQ==