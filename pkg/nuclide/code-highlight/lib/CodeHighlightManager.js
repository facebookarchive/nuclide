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

var _commons = require('../../commons');

var HIGHLIGHT_DELAY_MS = 250;

var CodeHighlightManager = (function () {
  function CodeHighlightManager() {
    _classCallCheck(this, CodeHighlightManager);

    this._providers = [];
    this._markers = [];
    var subscriptions = this._subscriptions = new _atom.CompositeDisposable();
    var debouncedCallback = (0, _commons.debounce)(this._highlightInEditor.bind(this), HIGHLIGHT_DELAY_MS, false);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNvZGVIaWdobGlnaHRNYW5hZ2VyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O29CQVlrQyxNQUFNOzt1QkFDakIsZUFBZTs7QUFFdEMsSUFBTSxrQkFBa0IsR0FBRyxHQUFHLENBQUM7O0lBRVYsb0JBQW9CO0FBSzVCLFdBTFEsb0JBQW9CLEdBS3pCOzBCQUxLLG9CQUFvQjs7QUFNckMsUUFBSSxDQUFDLFVBQVUsR0FBRyxFQUFFLENBQUM7QUFDckIsUUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7QUFDbkIsUUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLGNBQWMsR0FBRywrQkFBeUIsQ0FBQztBQUN0RSxRQUFNLGlCQUFpQixHQUFHLHVCQUN4QixJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUNsQyxrQkFBa0IsRUFDbEIsS0FBSyxDQUNOLENBQUM7QUFDRixRQUFJLENBQUMsU0FBUyxDQUFDLGtCQUFrQixDQUFDLFVBQUEsTUFBTSxFQUFJO0FBQzFDLG1CQUFhLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyx5QkFBeUIsQ0FBQyxVQUFBLEtBQUssRUFBSTtBQUMxRCx5QkFBaUIsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUM7T0FDcEQsQ0FBQyxDQUFDLENBQUM7S0FDTCxDQUFDLENBQUM7R0FDSjs7ZUFuQmtCLG9CQUFvQjs7NkJBcUJmLFdBQUMsTUFBdUIsRUFBRSxRQUFvQixFQUFpQjtBQUNyRixVQUFJLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxRQUFRLENBQUMsRUFBRTtBQUNqRCxlQUFPO09BQ1I7OytCQUVtQixNQUFNLENBQUMsVUFBVSxFQUFFOztVQUFoQyxTQUFTLHNCQUFULFNBQVM7OytDQUNHLElBQUksQ0FBQyxpQ0FBaUMsQ0FBQyxTQUFTLENBQUM7Ozs7VUFBN0QsUUFBUTs7QUFDZixVQUFJLENBQUMsUUFBUSxFQUFFO0FBQ2IsZUFBTztPQUNSOzs7QUFHRCxVQUFNLGlCQUFpQixHQUFHLE1BQU0sUUFBUSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUM7OztBQUdyRSxVQUFJLElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxFQUFFO0FBQzFDLGVBQU87T0FDUjs7O0FBR0QsVUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO0FBQ3ZCLFVBQUksQ0FBQyxRQUFRLEdBQUcsaUJBQWlCLENBQUMsR0FBRyxDQUNuQyxVQUFBLEtBQUs7ZUFBSSxNQUFNLENBQUMsZUFBZSxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUM7T0FBQSxDQUMzQyxDQUFDO0FBQ0YsVUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsVUFBQSxNQUFNLEVBQUk7QUFDOUIsY0FBTSxDQUFDLGNBQWMsQ0FDbkIsTUFBTSxFQUNOLEVBQUMsSUFBSSxFQUFFLFdBQVcsRUFBRSxTQUFPLCtCQUErQixFQUFDLENBQzVELENBQUM7T0FDSCxDQUFDLENBQUM7S0FDSjs7O1dBRWMseUJBQUMsTUFBdUIsRUFBRSxRQUFvQixFQUFXO0FBQ3RFLGFBQU8sQ0FBQyxNQUFNLENBQUMsdUJBQXVCLEVBQUUsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7S0FDNUQ7OztXQUU2Qix3Q0FBQyxRQUFvQixFQUFXO0FBQzVELGFBQU8sSUFBSSxDQUFDLFFBQVEsQ0FDakIsR0FBRyxDQUFDLFVBQUEsTUFBTTtlQUFJLE1BQU0sQ0FBQyxjQUFjLEVBQUU7T0FBQSxDQUFDLENBQ3RDLElBQUksQ0FBQyxVQUFBLEtBQUs7ZUFBSSxLQUFLLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQztPQUFBLENBQUMsQ0FBQztLQUNqRDs7O1dBRWdDLDJDQUFDLFNBQWlCLEVBQWdDO0FBQ2pGLFVBQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsVUFBQSxRQUFRLEVBQUk7QUFDM0QsWUFBTSxnQkFBZ0IsR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUN4RCxlQUFPLFFBQVEsQ0FBQyxpQkFBaUIsR0FBRyxDQUFDLElBQUksZ0JBQWdCLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO09BQ3JGLENBQUMsQ0FBQztBQUNILGFBQU8saUJBQWlCLENBQUMsSUFBSSxDQUFDLFVBQUMsU0FBUyxFQUFFLFNBQVMsRUFBSztBQUN0RCxlQUFPLFNBQVMsQ0FBQyxpQkFBaUIsR0FBRyxTQUFTLENBQUMsaUJBQWlCLENBQUM7T0FDbEUsQ0FBQyxDQUFDO0tBQ0o7OztXQUVjLDJCQUFTO0FBQ3RCLFVBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFBLE1BQU07ZUFBSSxNQUFNLENBQUMsT0FBTyxFQUFFO09BQUEsQ0FBQyxDQUFDO0tBQzdEOzs7V0FFVSxxQkFBQyxRQUErQixFQUFFO0FBQzNDLFVBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0tBQ2hDOzs7V0FFTSxtQkFBRztBQUNSLFVBQUksSUFBSSxDQUFDLGNBQWMsRUFBRTtBQUN2QixZQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQzlCLFlBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDO09BQzVCO0FBQ0QsVUFBSSxDQUFDLFVBQVUsR0FBRyxFQUFFLENBQUM7QUFDckIsVUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7S0FDcEI7OztTQXhGa0Isb0JBQW9COzs7cUJBQXBCLG9CQUFvQiIsImZpbGUiOiJDb2RlSGlnaGxpZ2h0TWFuYWdlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtDb2RlSGlnaGxpZ2h0UHJvdmlkZXJ9IGZyb20gJy4vdHlwZXMnO1xuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCB7ZGVib3VuY2V9IGZyb20gJy4uLy4uL2NvbW1vbnMnO1xuXG5jb25zdCBISUdITElHSFRfREVMQVlfTVMgPSAyNTA7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvZGVIaWdobGlnaHRNYW5hZ2VyIHtcbiAgX3N1YnNjcmlwdGlvbnM6ID9Db21wb3NpdGVEaXNwb3NhYmxlO1xuICBfcHJvdmlkZXJzOiBBcnJheTxDb2RlSGlnaGxpZ2h0UHJvdmlkZXI+O1xuICBfbWFya2VyczogQXJyYXk8YXRvbSRNYXJrZXI+O1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX3Byb3ZpZGVycyA9IFtdO1xuICAgIHRoaXMuX21hcmtlcnMgPSBbXTtcbiAgICBjb25zdCBzdWJzY3JpcHRpb25zID0gdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgY29uc3QgZGVib3VuY2VkQ2FsbGJhY2sgPSBkZWJvdW5jZShcbiAgICAgIHRoaXMuX2hpZ2hsaWdodEluRWRpdG9yLmJpbmQodGhpcyksXG4gICAgICBISUdITElHSFRfREVMQVlfTVMsXG4gICAgICBmYWxzZSxcbiAgICApO1xuICAgIGF0b20ud29ya3NwYWNlLm9ic2VydmVUZXh0RWRpdG9ycyhlZGl0b3IgPT4ge1xuICAgICAgc3Vic2NyaXB0aW9ucy5hZGQoZWRpdG9yLm9uRGlkQ2hhbmdlQ3Vyc29yUG9zaXRpb24oZXZlbnQgPT4ge1xuICAgICAgICBkZWJvdW5jZWRDYWxsYmFjayhlZGl0b3IsIGV2ZW50Lm5ld0J1ZmZlclBvc2l0aW9uKTtcbiAgICAgIH0pKTtcbiAgICB9KTtcbiAgfVxuXG4gIGFzeW5jIF9oaWdobGlnaHRJbkVkaXRvcihlZGl0b3I6IGF0b20kVGV4dEVkaXRvciwgcG9zaXRpb246IGF0b20kUG9pbnQpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAodGhpcy5faXNQb3NpdGlvbkluSGlnaGxpZ2h0ZWRSYW5nZXMocG9zaXRpb24pKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qge3Njb3BlTmFtZX0gPSBlZGl0b3IuZ2V0R3JhbW1hcigpO1xuICAgIGNvbnN0IFtwcm92aWRlcl0gPSB0aGlzLl9nZXRNYXRjaGluZ1Byb3ZpZGVyc0ZvclNjb3BlTmFtZShzY29wZU5hbWUpO1xuICAgIGlmICghcHJvdmlkZXIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBDYWxsIG91dCB0byBoYWNrIHRvIGdldCBoaWdobGlnaHRpbmcgcmFuZ2VzLiAgVGhpcyBjYW4gdGFrZSBzb21lIHRpbWVcbiAgICBjb25zdCBoaWdobGlnaHRlZFJhbmdlcyA9IGF3YWl0IHByb3ZpZGVyLmhpZ2hsaWdodChlZGl0b3IsIHBvc2l0aW9uKTtcblxuICAgIC8vIElmIHRoZSBjdXJzb3IgaGFzIG1vdmVkIHRoZSBoaWdobGlnaHRlZCByYW5nZXMgd2UganVzdCBjb21wdXRlZCBhcmUgdXNlbGVzcywgc28gYWJvcnRcbiAgICBpZiAodGhpcy5faGFzQ3Vyc29yTW92ZWQoZWRpdG9yLCBwb3NpdGlvbikpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBEZXN0cm95IG9sZCBoaWdobGlnaHRlZCBzZWN0aW9ucyBhbmQgaGlnaGxpZ2h0IG5ldyBvbmVzXG4gICAgdGhpcy5fZGVzdHJveU1hcmtlcnMoKTtcbiAgICB0aGlzLl9tYXJrZXJzID0gaGlnaGxpZ2h0ZWRSYW5nZXMubWFwKFxuICAgICAgcmFuZ2UgPT4gZWRpdG9yLm1hcmtCdWZmZXJSYW5nZShyYW5nZSwge30pXG4gICAgKTtcbiAgICB0aGlzLl9tYXJrZXJzLmZvckVhY2gobWFya2VyID0+IHtcbiAgICAgIGVkaXRvci5kZWNvcmF0ZU1hcmtlcihcbiAgICAgICAgbWFya2VyLFxuICAgICAgICB7dHlwZTogJ2hpZ2hsaWdodCcsIGNsYXNzOiAnbnVjbGlkZS1jb2RlLWhpZ2hsaWdodC1tYXJrZXInfSxcbiAgICAgICk7XG4gICAgfSk7XG4gIH1cblxuICBfaGFzQ3Vyc29yTW92ZWQoZWRpdG9yOiBhdG9tJFRleHRFZGl0b3IsIHBvc2l0aW9uOiBhdG9tJFBvaW50KTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICFlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKS5pc0VxdWFsKHBvc2l0aW9uKTtcbiAgfVxuXG4gIF9pc1Bvc2l0aW9uSW5IaWdobGlnaHRlZFJhbmdlcyhwb3NpdGlvbjogYXRvbSRQb2ludCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9tYXJrZXJzXG4gICAgICAubWFwKG1hcmtlciA9PiBtYXJrZXIuZ2V0QnVmZmVyUmFuZ2UoKSlcbiAgICAgIC5zb21lKHJhbmdlID0+IHJhbmdlLmNvbnRhaW5zUG9pbnQocG9zaXRpb24pKTtcbiAgfVxuXG4gIF9nZXRNYXRjaGluZ1Byb3ZpZGVyc0ZvclNjb3BlTmFtZShzY29wZU5hbWU6IHN0cmluZyk6IEFycmF5PENvZGVIaWdobGlnaHRQcm92aWRlcj4ge1xuICAgIGNvbnN0IG1hdGNoaW5nUHJvdmlkZXJzID0gdGhpcy5fcHJvdmlkZXJzLmZpbHRlcihwcm92aWRlciA9PiB7XG4gICAgICBjb25zdCBwcm92aWRlckdyYW1tYXJzID0gcHJvdmlkZXIuc2VsZWN0b3Iuc3BsaXQoLywgPy8pO1xuICAgICAgcmV0dXJuIHByb3ZpZGVyLmluY2x1c2lvblByaW9yaXR5ID4gMCAmJiBwcm92aWRlckdyYW1tYXJzLmluZGV4T2Yoc2NvcGVOYW1lKSAhPT0gLTE7XG4gICAgfSk7XG4gICAgcmV0dXJuIG1hdGNoaW5nUHJvdmlkZXJzLnNvcnQoKHByb3ZpZGVyQSwgcHJvdmlkZXJCKSA9PiB7XG4gICAgICByZXR1cm4gcHJvdmlkZXJCLmluY2x1c2lvblByaW9yaXR5IC0gcHJvdmlkZXJBLmluY2x1c2lvblByaW9yaXR5O1xuICAgIH0pO1xuICB9XG5cbiAgX2Rlc3Ryb3lNYXJrZXJzKCk6IHZvaWQge1xuICAgIHRoaXMuX21hcmtlcnMuc3BsaWNlKDApLmZvckVhY2gobWFya2VyID0+IG1hcmtlci5kZXN0cm95KCkpO1xuICB9XG5cbiAgYWRkUHJvdmlkZXIocHJvdmlkZXI6IENvZGVIaWdobGlnaHRQcm92aWRlcikge1xuICAgIHRoaXMuX3Byb3ZpZGVycy5wdXNoKHByb3ZpZGVyKTtcbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gICAgaWYgKHRoaXMuX3N1YnNjcmlwdGlvbnMpIHtcbiAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICAgICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG51bGw7XG4gICAgfVxuICAgIHRoaXMuX3Byb3ZpZGVycyA9IFtdO1xuICAgIHRoaXMuX21hcmtlcnMgPSBbXTtcbiAgfVxufVxuIl19