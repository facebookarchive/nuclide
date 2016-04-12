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

var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === 'function') { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError('The decorator for method ' + descriptor.key + ' is of the invalid type ' + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _nuclideAnalytics = require('../../nuclide-analytics');

var _nuclideLogging = require('../../nuclide-logging');

var _getWordTextAndRange2 = require('./get-word-text-and-range');

var _getWordTextAndRange3 = _interopRequireDefault(_getWordTextAndRange2);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var logger = (0, _nuclideLogging.getLogger)();

/**
 * Construct this object to enable Hyperclick in a text editor.
 * Call `dispose` to disable the feature.
 */

var HyperclickForTextEditor = (function () {
  function HyperclickForTextEditor(textEditor, hyperclick) {
    var _this = this;

    _classCallCheck(this, HyperclickForTextEditor);

    this._textEditor = textEditor;
    this._textEditorView = atom.views.getView(textEditor);

    this._hyperclick = hyperclick;

    this._lastMouseEvent = null;
    this._lastPosition = null;
    // We store the original promise that we use to retrieve the last suggestion
    // so callers can also await it to know when it's available.
    this._lastSuggestionAtMousePromise = null;
    // We store the last suggestion since we must await it immediately anyway.
    this._lastSuggestionAtMouse = null;
    this._navigationMarkers = null;

    this._lastWordRange = null;
    this._subscriptions = new _atom.CompositeDisposable();

    this._onMouseMove = this._onMouseMove.bind(this);
    this._textEditorView.addEventListener('mousemove', this._onMouseMove);
    this._onMouseDown = this._onMouseDown.bind(this);
    this._setupMouseDownListener();

    this._onKeyDown = this._onKeyDown.bind(this);
    this._textEditorView.addEventListener('keydown', this._onKeyDown);
    this._onKeyUp = this._onKeyUp.bind(this);
    this._textEditorView.addEventListener('keyup', this._onKeyUp);

    this._subscriptions.add(atom.commands.add(this._textEditorView, {
      'hyperclick:confirm-cursor': function hyperclickConfirmCursor() {
        return _this._confirmSuggestionAtCursor();
      }
    }));

    this._isDestroyed = false;
    this._loadingTracker = null;
  }

  _createDecoratedClass(HyperclickForTextEditor, [{
    key: '_setupMouseDownListener',
    value: function _setupMouseDownListener() {
      var _this2 = this;

      var getLinesDomNode = function getLinesDomNode() {
        var component = _this2._textEditorView.component;

        (0, _assert2['default'])(component);
        return component.linesComponent.getDomNode();
      };
      var removeMouseDownListener = function removeMouseDownListener() {
        if (_this2._textEditorView.component == null) {
          return;
        }
        // $FlowFixMe (most)
        getLinesDomNode().removeEventListener('mousedown', _this2._onMouseDown);
      };
      var addMouseDownListener = function addMouseDownListener() {
        getLinesDomNode().addEventListener('mousedown', _this2._onMouseDown);
      };
      this._subscriptions.add(new _atom.Disposable(removeMouseDownListener));
      this._subscriptions.add(this._textEditorView.onDidDetach(removeMouseDownListener));
      this._subscriptions.add(this._textEditorView.onDidAttach(addMouseDownListener));
      addMouseDownListener();
    }
  }, {
    key: '_confirmSuggestion',
    value: function _confirmSuggestion(suggestion) {
      if (Array.isArray(suggestion.callback) && suggestion.callback.length > 0) {
        this._hyperclick.showSuggestionList(this._textEditor, suggestion);
      } else {
        (0, _assert2['default'])(typeof suggestion.callback === 'function');
        suggestion.callback();
      }
    }
  }, {
    key: '_onMouseMove',
    value: function _onMouseMove(event) {
      if (this._isLoading()) {
        // Show the loading cursor.
        this._textEditorView.classList.add('hyperclick-loading');
      }

      // We save the last `MouseEvent` so the user can trigger Hyperclick by
      // pressing the key without moving the mouse again. We only save the
      // relevant properties to prevent retaining a reference to the event.
      this._lastMouseEvent = {
        clientX: event.clientX,
        clientY: event.clientY
      };

      // Don't fetch suggestions if the mouse is still in the same 'word', where
      // 'word' is a whitespace-delimited group of characters.
      //
      // If the last suggestion had multiple ranges, we have no choice but to
      // fetch suggestions because the new word might be between those ranges.
      // This should be ok because it will reuse that last suggestion until the
      // mouse moves off of it.
      var lastSuggestionIsNotMultiRange = !this._lastSuggestionAtMouse || !Array.isArray(this._lastSuggestionAtMouse.range);
      if (this._isMouseAtLastWordRange() && lastSuggestionIsNotMultiRange) {
        return;
      }

      var _getWordTextAndRange = (0, _getWordTextAndRange3['default'])(this._textEditor, this._getMousePositionAsBufferPosition());

      var range = _getWordTextAndRange.range;

      this._lastWordRange = range;

      if (this._isHyperclickEvent(event)) {
        // Clear the suggestion if the mouse moved out of the range.
        if (!this._isMouseAtLastSuggestion()) {
          this._clearSuggestion();
        }
        this._setSuggestionForLastMouseEvent();
      } else {
        this._clearSuggestion();
      }
    }
  }, {
    key: '_onMouseDown',
    value: function _onMouseDown(event) {
      if (!this._isHyperclickEvent(event) || !this._isMouseAtLastSuggestion()) {
        return;
      }

      if (this._lastSuggestionAtMouse) {
        this._confirmSuggestion(this._lastSuggestionAtMouse);
        // Prevent the <meta-click> event from adding another cursor.
        event.stopPropagation();
      }

      this._clearSuggestion();
    }
  }, {
    key: '_onKeyDown',
    value: function _onKeyDown(event) {
      // Show the suggestion at the last known mouse position.
      if (this._isHyperclickEvent(event)) {
        this._setSuggestionForLastMouseEvent();
      }
    }
  }, {
    key: '_onKeyUp',
    value: function _onKeyUp(event) {
      if (!this._isHyperclickEvent(event)) {
        this._clearSuggestion();
      }
    }

    /**
     * Returns a `Promise` that's resolved when the latest suggestion's available.
     */
  }, {
    key: 'getSuggestionAtMouse',
    value: function getSuggestionAtMouse() {
      return this._lastSuggestionAtMousePromise || Promise.resolve(null);
    }
  }, {
    key: '_setSuggestionForLastMouseEvent',
    value: _asyncToGenerator(function* () {
      if (!this._lastMouseEvent) {
        return;
      }

      var position = this._getMousePositionAsBufferPosition();

      if (this._lastSuggestionAtMouse != null) {
        var range = this._lastSuggestionAtMouse.range;

        (0, _assert2['default'])(range, 'Hyperclick result must have a valid Range');
        if (this._isPositionInRange(position, range)) {
          return;
        }
      }
      // this._lastSuggestionAtMouse will only be set if hyperclick returned a promise that
      // resolved to a non-null value. So, in order to not ask hyperclick for the same thing
      // again and again which will be anyway null, we check if the mouse position has changed.
      if (this._lastPosition && position.compare(this._lastPosition) === 0) {
        return;
      }

      this._loadingTracker = (0, _nuclideAnalytics.startTracking)('hyperclick-loading');

      try {
        this._lastPosition = position;
        this._lastSuggestionAtMousePromise = this._hyperclick.getSuggestion(this._textEditor, position);
        this._lastSuggestionAtMouse = yield this._lastSuggestionAtMousePromise;
        if (this._isDestroyed) {
          return;
        }
        if (this._lastSuggestionAtMouse && this._isMouseAtLastSuggestion()) {
          // Add the hyperclick markers if there's a new suggestion and it's under the mouse.
          this._updateNavigationMarkers(this._lastSuggestionAtMouse.range);
        } else {
          // Remove all the markers if we've finished loading and there's no suggestion.
          this._updateNavigationMarkers(null);
        }
        if (this._loadingTracker != null) {
          this._loadingTracker.onSuccess();
        }
      } catch (e) {
        if (this._loadingTracker != null) {
          this._loadingTracker.onError(e);
        }
        logger.error('Error getting Hyperclick suggestion:', e);
      } finally {
        this._doneLoading();
      }
    })
  }, {
    key: '_getMousePositionAsBufferPosition',
    value: function _getMousePositionAsBufferPosition() {
      var component = this._textEditorView.component;

      (0, _assert2['default'])(component);
      (0, _assert2['default'])(this._lastMouseEvent);
      var screenPosition = component.screenPositionForMouseEvent(this._lastMouseEvent);
      try {
        return this._textEditor.bufferPositionForScreenPosition(screenPosition);
      } catch (error) {
        // Fix https://github.com/facebook/nuclide/issues/292
        // When navigating Atom workspace with `CMD/CTRL` down,
        // it triggers TextEditorElement's `mousemove` with invalid screen position.
        // This falls back to returning the start of the editor.
        logger.error('Hyperclick: Error getting buffer position for screen position:', error);
        return new _atom.Point(0, 0);
      }
    }
  }, {
    key: '_isMouseAtLastSuggestion',
    value: function _isMouseAtLastSuggestion() {
      if (!this._lastSuggestionAtMouse) {
        return false;
      }
      var range = this._lastSuggestionAtMouse.range;

      (0, _assert2['default'])(range, 'Hyperclick result must have a valid Range');
      return this._isPositionInRange(this._getMousePositionAsBufferPosition(), range);
    }
  }, {
    key: '_isMouseAtLastWordRange',
    value: function _isMouseAtLastWordRange() {
      var lastWordRange = this._lastWordRange;
      if (lastWordRange == null) {
        return false;
      }
      return this._isPositionInRange(this._getMousePositionAsBufferPosition(), lastWordRange);
    }
  }, {
    key: '_isPositionInRange',
    value: function _isPositionInRange(position, range) {
      return Array.isArray(range) ? range.some(function (r) {
        return r.containsPoint(position);
      }) : range.containsPoint(position);
    }
  }, {
    key: '_clearSuggestion',
    value: function _clearSuggestion() {
      this._doneLoading();
      this._lastSuggestionAtMousePromise = null;
      this._lastSuggestionAtMouse = null;
      this._updateNavigationMarkers(null);
    }
  }, {
    key: '_confirmSuggestionAtCursor',
    decorators: [(0, _nuclideAnalytics.trackTiming)('hyperclick:confirm-cursor')],
    value: _asyncToGenerator(function* () {
      var suggestion = yield this._hyperclick.getSuggestion(this._textEditor, this._textEditor.getCursorBufferPosition());
      if (suggestion) {
        this._confirmSuggestion(suggestion);
      }
    })

    /**
     * Add markers for the given range(s), or clears them if `ranges` is null.
     */
  }, {
    key: '_updateNavigationMarkers',
    value: function _updateNavigationMarkers(range) {
      var _this3 = this;

      if (this._navigationMarkers) {
        this._navigationMarkers.forEach(function (marker) {
          return marker.destroy();
        });
        this._navigationMarkers = null;
      }

      // Only change the cursor to a pointer if there is a suggestion ready.
      if (range == null) {
        this._textEditorView.classList.remove('hyperclick');
        return;
      }

      this._textEditorView.classList.add('hyperclick');
      var ranges = Array.isArray(range) ? range : [range];
      this._navigationMarkers = ranges.map(function (markerRange) {
        var marker = _this3._textEditor.markBufferRange(markerRange, { invalidate: 'never' });
        _this3._textEditor.decorateMarker(marker, { type: 'highlight', 'class': 'hyperclick' });
        return marker;
      });
    }

    /**
     * Returns whether an event should be handled by hyperclick or not.
     */
  }, {
    key: '_isHyperclickEvent',
    value: function _isHyperclickEvent(event) {
      // If the user is pressing either the meta/ctrl key or the alt key.
      return process.platform === 'darwin' ? event.metaKey : event.ctrlKey;
    }
  }, {
    key: '_isLoading',
    value: function _isLoading() {
      return this._loadingTracker != null;
    }
  }, {
    key: '_doneLoading',
    value: function _doneLoading() {
      this._loadingTracker = null;
      this._textEditorView.classList.remove('hyperclick-loading');
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._isDestroyed = true;
      this._clearSuggestion();
      // $FlowFixMe (most)
      this._textEditorView.removeEventListener('mousemove', this._onMouseMove);
      // $FlowFixMe (most)
      this._textEditorView.removeEventListener('keydown', this._onKeyDown);
      // $FlowFixMe (most)
      this._textEditorView.removeEventListener('keyup', this._onKeyUp);
      this._subscriptions.dispose();
    }
  }]);

  return HyperclickForTextEditor;
})();

exports['default'] = HyperclickForTextEditor;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkh5cGVyY2xpY2tGb3JUZXh0RWRpdG9yLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O29CQWdCcUQsTUFBTTs7Z0NBQ2xCLHlCQUF5Qjs7OEJBQzFDLHVCQUF1Qjs7b0NBQ2YsMkJBQTJCOzs7O3NCQUNyQyxRQUFROzs7O0FBRTlCLElBQU0sTUFBTSxHQUFHLGdDQUFXLENBQUM7Ozs7Ozs7SUFNTix1QkFBdUI7QUFrQi9CLFdBbEJRLHVCQUF1QixDQWtCOUIsVUFBMkIsRUFBRSxVQUFzQixFQUFFOzs7MEJBbEI5Qyx1QkFBdUI7O0FBbUJ4QyxRQUFJLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQztBQUM5QixRQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDOztBQUV0RCxRQUFJLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQzs7QUFFOUIsUUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUM7QUFDNUIsUUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7OztBQUcxQixRQUFJLENBQUMsNkJBQTZCLEdBQUcsSUFBSSxDQUFDOztBQUUxQyxRQUFJLENBQUMsc0JBQXNCLEdBQUcsSUFBSSxDQUFDO0FBQ25DLFFBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUM7O0FBRS9CLFFBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDO0FBQzNCLFFBQUksQ0FBQyxjQUFjLEdBQUcsK0JBQXlCLENBQUM7O0FBRWhELFFBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDakQsUUFBSSxDQUFDLGVBQWUsQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ3RFLFFBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMs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QUFDLElBQUksRUFBRSxXQUFXLEVBQUUsU0FBTyxZQUFZLEVBQUMsQ0FDekMsQ0FBQztBQUNGLGVBQU8sTUFBTSxDQUFDO09BQ2YsQ0FBQyxDQUFDO0tBQ0o7Ozs7Ozs7V0FLaUIsNEJBQUMsS0FBMEMsRUFBVzs7QUFFdEUsYUFBTyxPQUFPLENBQUMsUUFBUSxLQUFLLFFBQVEsR0FBRyxLQUFLLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUM7S0FDdEU7OztXQUVTLHNCQUFZO0FBQ3BCLGFBQU8sSUFBSSxDQUFDLGVBQWUsSUFBSSxJQUFJLENBQUM7S0FDckM7OztXQUVXLHdCQUFTO0FBQ25CLFVBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDO0FBQzVCLFVBQUksQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0tBQzdEOzs7V0FFTSxtQkFBRztBQUNSLFVBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO0FBQ3pCLFVBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDOztBQUV4QixVQUFJLENBQUMsZUFBZSxDQUFDLG1CQUFtQixDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7O0FBRXpFLFVBQUksQ0FBQyxlQUFlLENBQUMsbUJBQW1CLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQzs7QUFFckUsVUFBSSxDQUFDLGVBQWUsQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ2pFLFVBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDL0I7OztTQWxVa0IsdUJBQXVCOzs7cUJBQXZCLHVCQUF1QiIsImZpbGUiOiJIeXBlcmNsaWNrRm9yVGV4dEVkaXRvci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtIeXBlcmNsaWNrU3VnZ2VzdGlvbn0gZnJvbSAnLi4vLi4vaHlwZXJjbGljay1pbnRlcmZhY2VzJztcblxuaW1wb3J0IHR5cGUgSHlwZXJjbGljayBmcm9tICcuL0h5cGVyY2xpY2snO1xuaW1wb3J0IHR5cGUge1RpbWluZ1RyYWNrZXJ9IGZyb20gJy4uLy4uL251Y2xpZGUtYW5hbHl0aWNzJztcblxuaW1wb3J0IHtEaXNwb3NhYmxlLCBDb21wb3NpdGVEaXNwb3NhYmxlLCBQb2ludH0gZnJvbSAnYXRvbSc7XG5pbXBvcnQge3RyYWNrVGltaW5nLCBzdGFydFRyYWNraW5nfSBmcm9tICcuLi8uLi9udWNsaWRlLWFuYWx5dGljcyc7XG5pbXBvcnQge2dldExvZ2dlcn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1sb2dnaW5nJztcbmltcG9ydCBnZXRXb3JkVGV4dEFuZFJhbmdlIGZyb20gJy4vZ2V0LXdvcmQtdGV4dC1hbmQtcmFuZ2UnO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuXG5jb25zdCBsb2dnZXIgPSBnZXRMb2dnZXIoKTtcblxuLyoqXG4gKiBDb25zdHJ1Y3QgdGhpcyBvYmplY3QgdG8gZW5hYmxlIEh5cGVyY2xpY2sgaW4gYSB0ZXh0IGVkaXRvci5cbiAqIENhbGwgYGRpc3Bvc2VgIHRvIGRpc2FibGUgdGhlIGZlYXR1cmUuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEh5cGVyY2xpY2tGb3JUZXh0RWRpdG9yIHtcbiAgX3RleHRFZGl0b3I6IGF0b20kVGV4dEVkaXRvcjtcbiAgX3RleHRFZGl0b3JWaWV3OiBhdG9tJFRleHRFZGl0b3JFbGVtZW50O1xuICBfaHlwZXJjbGljazogSHlwZXJjbGljaztcbiAgX2xhc3RNb3VzZUV2ZW50OiA/TW91c2VFdmVudDtcbiAgX2xhc3RQb3NpdGlvbjogP2F0b20kUG9pbnQ7XG4gIF9sYXN0U3VnZ2VzdGlvbkF0TW91c2VQcm9taXNlOiA/UHJvbWlzZTxIeXBlcmNsaWNrU3VnZ2VzdGlvbj47XG4gIF9sYXN0U3VnZ2VzdGlvbkF0TW91c2U6ID9IeXBlcmNsaWNrU3VnZ2VzdGlvbjtcbiAgX25hdmlnYXRpb25NYXJrZXJzOiA/QXJyYXk8YXRvbSRNYXJrZXI+O1xuICBfbGFzdFdvcmRSYW5nZTogP2F0b20kUmFuZ2U7XG4gIF9vbk1vdXNlTW92ZTogKGV2ZW50OiBNb3VzZUV2ZW50KSA9PiB2b2lkO1xuICBfb25Nb3VzZURvd246IChldmVudDogTW91c2VFdmVudCkgPT4gdm9pZDtcbiAgX29uS2V5RG93bjogKGV2ZW50OiBTeW50aGV0aWNLZXlib2FyZEV2ZW50KSA9PiB2b2lkO1xuICBfb25LZXlVcDogKGV2ZW50OiBTeW50aGV0aWNLZXlib2FyZEV2ZW50KSA9PiB2b2lkO1xuICBfc3Vic2NyaXB0aW9uczogYXRvbSRDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBfaXNEZXN0cm95ZWQ6IGJvb2xlYW47XG4gIF9sb2FkaW5nVHJhY2tlcjogP1RpbWluZ1RyYWNrZXI7XG5cbiAgY29uc3RydWN0b3IodGV4dEVkaXRvcjogYXRvbSRUZXh0RWRpdG9yLCBoeXBlcmNsaWNrOiBIeXBlcmNsaWNrKSB7XG4gICAgdGhpcy5fdGV4dEVkaXRvciA9IHRleHRFZGl0b3I7XG4gICAgdGhpcy5fdGV4dEVkaXRvclZpZXcgPSBhdG9tLnZpZXdzLmdldFZpZXcodGV4dEVkaXRvcik7XG5cbiAgICB0aGlzLl9oeXBlcmNsaWNrID0gaHlwZXJjbGljaztcblxuICAgIHRoaXMuX2xhc3RNb3VzZUV2ZW50ID0gbnVsbDtcbiAgICB0aGlzLl9sYXN0UG9zaXRpb24gPSBudWxsO1xuICAgIC8vIFdlIHN0b3JlIHRoZSBvcmlnaW5hbCBwcm9taXNlIHRoYXQgd2UgdXNlIHRvIHJldHJpZXZlIHRoZSBsYXN0IHN1Z2dlc3Rpb25cbiAgICAvLyBzbyBjYWxsZXJzIGNhbiBhbHNvIGF3YWl0IGl0IHRvIGtub3cgd2hlbiBpdCdzIGF2YWlsYWJsZS5cbiAgICB0aGlzLl9sYXN0U3VnZ2VzdGlvbkF0TW91c2VQcm9taXNlID0gbnVsbDtcbiAgICAvLyBXZSBzdG9yZSB0aGUgbGFzdCBzdWdnZXN0aW9uIHNpbmNlIHdlIG11c3QgYXdhaXQgaXQgaW1tZWRpYXRlbHkgYW55d2F5LlxuICAgIHRoaXMuX2xhc3RTdWdnZXN0aW9uQXRNb3VzZSA9IG51bGw7XG4gICAgdGhpcy5fbmF2aWdhdGlvbk1hcmtlcnMgPSBudWxsO1xuXG4gICAgdGhpcy5fbGFzdFdvcmRSYW5nZSA9IG51bGw7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG5cbiAgICB0aGlzLl9vbk1vdXNlTW92ZSA9IHRoaXMuX29uTW91c2VNb3ZlLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fdGV4dEVkaXRvclZpZXcuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgdGhpcy5fb25Nb3VzZU1vdmUpO1xuICAgIHRoaXMuX29uTW91c2VEb3duID0gdGhpcy5fb25Nb3VzZURvd24uYmluZCh0aGlzKTtcbiAgICB0aGlzLl9zZXR1cE1vdXNlRG93bkxpc3RlbmVyKCk7XG5cbiAgICB0aGlzLl9vbktleURvd24gPSB0aGlzLl9vbktleURvd24uYmluZCh0aGlzKTtcbiAgICB0aGlzLl90ZXh0RWRpdG9yVmlldy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5fb25LZXlEb3duKTtcbiAgICB0aGlzLl9vbktleVVwID0gdGhpcy5fb25LZXlVcC5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX3RleHRFZGl0b3JWaWV3LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgdGhpcy5fb25LZXlVcCk7XG5cbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbW1hbmRzLmFkZCh0aGlzLl90ZXh0RWRpdG9yVmlldywge1xuICAgICAgJ2h5cGVyY2xpY2s6Y29uZmlybS1jdXJzb3InOiAoKSA9PiB0aGlzLl9jb25maXJtU3VnZ2VzdGlvbkF0Q3Vyc29yKCksXG4gICAgfSkpO1xuXG4gICAgdGhpcy5faXNEZXN0cm95ZWQgPSBmYWxzZTtcbiAgICB0aGlzLl9sb2FkaW5nVHJhY2tlciA9IG51bGw7XG4gIH1cblxuICBfc2V0dXBNb3VzZURvd25MaXN0ZW5lcigpOiB2b2lkIHtcbiAgICBjb25zdCBnZXRMaW5lc0RvbU5vZGUgPSAoKTogSFRNTEVsZW1lbnQgPT4ge1xuICAgICAgY29uc3Qge2NvbXBvbmVudH0gPSB0aGlzLl90ZXh0RWRpdG9yVmlldztcbiAgICAgIGludmFyaWFudChjb21wb25lbnQpO1xuICAgICAgcmV0dXJuIGNvbXBvbmVudC5saW5lc0NvbXBvbmVudC5nZXREb21Ob2RlKCk7XG4gICAgfTtcbiAgICBjb25zdCByZW1vdmVNb3VzZURvd25MaXN0ZW5lciA9ICgpID0+IHtcbiAgICAgIGlmICh0aGlzLl90ZXh0RWRpdG9yVmlldy5jb21wb25lbnQgPT0gbnVsbCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICAvLyAkRmxvd0ZpeE1lIChtb3N0KVxuICAgICAgZ2V0TGluZXNEb21Ob2RlKCkucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcy5fb25Nb3VzZURvd24pO1xuICAgIH07XG4gICAgY29uc3QgYWRkTW91c2VEb3duTGlzdGVuZXIgPSAoKSA9PiB7XG4gICAgICBnZXRMaW5lc0RvbU5vZGUoKS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLl9vbk1vdXNlRG93bik7XG4gICAgfTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChuZXcgRGlzcG9zYWJsZShyZW1vdmVNb3VzZURvd25MaXN0ZW5lcikpO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKHRoaXMuX3RleHRFZGl0b3JWaWV3Lm9uRGlkRGV0YWNoKHJlbW92ZU1vdXNlRG93bkxpc3RlbmVyKSk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5fdGV4dEVkaXRvclZpZXcub25EaWRBdHRhY2goYWRkTW91c2VEb3duTGlzdGVuZXIpKTtcbiAgICBhZGRNb3VzZURvd25MaXN0ZW5lcigpO1xuICB9XG5cbiAgX2NvbmZpcm1TdWdnZXN0aW9uKHN1Z2dlc3Rpb246IEh5cGVyY2xpY2tTdWdnZXN0aW9uKTogdm9pZCB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoc3VnZ2VzdGlvbi5jYWxsYmFjaykgJiYgc3VnZ2VzdGlvbi5jYWxsYmFjay5sZW5ndGggPiAwKSB7XG4gICAgICB0aGlzLl9oeXBlcmNsaWNrLnNob3dTdWdnZXN0aW9uTGlzdCh0aGlzLl90ZXh0RWRpdG9yLCBzdWdnZXN0aW9uKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaW52YXJpYW50KHR5cGVvZiBzdWdnZXN0aW9uLmNhbGxiYWNrID09PSAnZnVuY3Rpb24nKTtcbiAgICAgIHN1Z2dlc3Rpb24uY2FsbGJhY2soKTtcbiAgICB9XG4gIH1cblxuICBfb25Nb3VzZU1vdmUoZXZlbnQ6IE1vdXNlRXZlbnQpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5faXNMb2FkaW5nKCkpIHtcbiAgICAgIC8vIFNob3cgdGhlIGxvYWRpbmcgY3Vyc29yLlxuICAgICAgdGhpcy5fdGV4dEVkaXRvclZpZXcuY2xhc3NMaXN0LmFkZCgnaHlwZXJjbGljay1sb2FkaW5nJyk7XG4gICAgfVxuXG4gICAgLy8gV2Ugc2F2ZSB0aGUgbGFzdCBgTW91c2VFdmVudGAgc28gdGhlIHVzZXIgY2FuIHRyaWdnZXIgSHlwZXJjbGljayBieVxuICAgIC8vIHByZXNzaW5nIHRoZSBrZXkgd2l0aG91dCBtb3ZpbmcgdGhlIG1vdXNlIGFnYWluLiBXZSBvbmx5IHNhdmUgdGhlXG4gICAgLy8gcmVsZXZhbnQgcHJvcGVydGllcyB0byBwcmV2ZW50IHJldGFpbmluZyBhIHJlZmVyZW5jZSB0byB0aGUgZXZlbnQuXG4gICAgdGhpcy5fbGFzdE1vdXNlRXZlbnQgPSAoe1xuICAgICAgY2xpZW50WDogZXZlbnQuY2xpZW50WCxcbiAgICAgIGNsaWVudFk6IGV2ZW50LmNsaWVudFksXG4gICAgfTogYW55KTtcblxuXG4gICAgLy8gRG9uJ3QgZmV0Y2ggc3VnZ2VzdGlvbnMgaWYgdGhlIG1vdXNlIGlzIHN0aWxsIGluIHRoZSBzYW1lICd3b3JkJywgd2hlcmVcbiAgICAvLyAnd29yZCcgaXMgYSB3aGl0ZXNwYWNlLWRlbGltaXRlZCBncm91cCBvZiBjaGFyYWN0ZXJzLlxuICAgIC8vXG4gICAgLy8gSWYgdGhlIGxhc3Qgc3VnZ2VzdGlvbiBoYWQgbXVsdGlwbGUgcmFuZ2VzLCB3ZSBoYXZlIG5vIGNob2ljZSBidXQgdG9cbiAgICAvLyBmZXRjaCBzdWdnZXN0aW9ucyBiZWNhdXNlIHRoZSBuZXcgd29yZCBtaWdodCBiZSBiZXR3ZWVuIHRob3NlIHJhbmdlcy5cbiAgICAvLyBUaGlzIHNob3VsZCBiZSBvayBiZWNhdXNlIGl0IHdpbGwgcmV1c2UgdGhhdCBsYXN0IHN1Z2dlc3Rpb24gdW50aWwgdGhlXG4gICAgLy8gbW91c2UgbW92ZXMgb2ZmIG9mIGl0LlxuICAgIGNvbnN0IGxhc3RTdWdnZXN0aW9uSXNOb3RNdWx0aVJhbmdlID0gIXRoaXMuX2xhc3RTdWdnZXN0aW9uQXRNb3VzZSB8fFxuICAgICAgICAhQXJyYXkuaXNBcnJheSh0aGlzLl9sYXN0U3VnZ2VzdGlvbkF0TW91c2UucmFuZ2UpO1xuICAgIGlmICh0aGlzLl9pc01vdXNlQXRMYXN0V29yZFJhbmdlKCkgJiYgbGFzdFN1Z2dlc3Rpb25Jc05vdE11bHRpUmFuZ2UpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3Qge3JhbmdlfSA9IGdldFdvcmRUZXh0QW5kUmFuZ2UodGhpcy5fdGV4dEVkaXRvciwgdGhpcy5fZ2V0TW91c2VQb3NpdGlvbkFzQnVmZmVyUG9zaXRpb24oKSk7XG4gICAgdGhpcy5fbGFzdFdvcmRSYW5nZSA9IHJhbmdlO1xuXG4gICAgaWYgKHRoaXMuX2lzSHlwZXJjbGlja0V2ZW50KGV2ZW50KSkge1xuICAgICAgLy8gQ2xlYXIgdGhlIHN1Z2dlc3Rpb24gaWYgdGhlIG1vdXNlIG1vdmVkIG91dCBvZiB0aGUgcmFuZ2UuXG4gICAgICBpZiAoIXRoaXMuX2lzTW91c2VBdExhc3RTdWdnZXN0aW9uKCkpIHtcbiAgICAgICAgdGhpcy5fY2xlYXJTdWdnZXN0aW9uKCk7XG4gICAgICB9XG4gICAgICB0aGlzLl9zZXRTdWdnZXN0aW9uRm9yTGFzdE1vdXNlRXZlbnQoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fY2xlYXJTdWdnZXN0aW9uKCk7XG4gICAgfVxuICB9XG5cbiAgX29uTW91c2VEb3duKGV2ZW50OiBNb3VzZUV2ZW50KTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLl9pc0h5cGVyY2xpY2tFdmVudChldmVudCkgfHwgIXRoaXMuX2lzTW91c2VBdExhc3RTdWdnZXN0aW9uKCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fbGFzdFN1Z2dlc3Rpb25BdE1vdXNlKSB7XG4gICAgICB0aGlzLl9jb25maXJtU3VnZ2VzdGlvbih0aGlzLl9sYXN0U3VnZ2VzdGlvbkF0TW91c2UpO1xuICAgICAgLy8gUHJldmVudCB0aGUgPG1ldGEtY2xpY2s+IGV2ZW50IGZyb20gYWRkaW5nIGFub3RoZXIgY3Vyc29yLlxuICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgfVxuXG4gICAgdGhpcy5fY2xlYXJTdWdnZXN0aW9uKCk7XG4gIH1cblxuICBfb25LZXlEb3duKGV2ZW50OiBTeW50aGV0aWNLZXlib2FyZEV2ZW50KTogdm9pZCB7XG4gICAgLy8gU2hvdyB0aGUgc3VnZ2VzdGlvbiBhdCB0aGUgbGFzdCBrbm93biBtb3VzZSBwb3NpdGlvbi5cbiAgICBpZiAodGhpcy5faXNIeXBlcmNsaWNrRXZlbnQoZXZlbnQpKSB7XG4gICAgICB0aGlzLl9zZXRTdWdnZXN0aW9uRm9yTGFzdE1vdXNlRXZlbnQoKTtcbiAgICB9XG4gIH1cblxuICBfb25LZXlVcChldmVudDogU3ludGhldGljS2V5Ym9hcmRFdmVudCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5faXNIeXBlcmNsaWNrRXZlbnQoZXZlbnQpKSB7XG4gICAgICB0aGlzLl9jbGVhclN1Z2dlc3Rpb24oKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIGBQcm9taXNlYCB0aGF0J3MgcmVzb2x2ZWQgd2hlbiB0aGUgbGF0ZXN0IHN1Z2dlc3Rpb24ncyBhdmFpbGFibGUuXG4gICAqL1xuICBnZXRTdWdnZXN0aW9uQXRNb3VzZSgpOiBQcm9taXNlPD9IeXBlcmNsaWNrU3VnZ2VzdGlvbj4ge1xuICAgIHJldHVybiB0aGlzLl9sYXN0U3VnZ2VzdGlvbkF0TW91c2VQcm9taXNlIHx8IFByb21pc2UucmVzb2x2ZShudWxsKTtcbiAgfVxuXG4gIGFzeW5jIF9zZXRTdWdnZXN0aW9uRm9yTGFzdE1vdXNlRXZlbnQoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKCF0aGlzLl9sYXN0TW91c2VFdmVudCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHBvc2l0aW9uID0gdGhpcy5fZ2V0TW91c2VQb3NpdGlvbkFzQnVmZmVyUG9zaXRpb24oKTtcblxuICAgIGlmICh0aGlzLl9sYXN0U3VnZ2VzdGlvbkF0TW91c2UgIT0gbnVsbCkge1xuICAgICAgY29uc3Qge3JhbmdlfSA9IHRoaXMuX2xhc3RTdWdnZXN0aW9uQXRNb3VzZTtcbiAgICAgIGludmFyaWFudChyYW5nZSwgJ0h5cGVyY2xpY2sgcmVzdWx0IG11c3QgaGF2ZSBhIHZhbGlkIFJhbmdlJyk7XG4gICAgICBpZiAodGhpcy5faXNQb3NpdGlvbkluUmFuZ2UocG9zaXRpb24sIHJhbmdlKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuICAgIC8vIHRoaXMuX2xhc3RTdWdnZXN0aW9uQXRNb3VzZSB3aWxsIG9ubHkgYmUgc2V0IGlmIGh5cGVyY2xpY2sgcmV0dXJuZWQgYSBwcm9taXNlIHRoYXRcbiAgICAvLyByZXNvbHZlZCB0byBhIG5vbi1udWxsIHZhbHVlLiBTbywgaW4gb3JkZXIgdG8gbm90IGFzayBoeXBlcmNsaWNrIGZvciB0aGUgc2FtZSB0aGluZ1xuICAgIC8vIGFnYWluIGFuZCBhZ2FpbiB3aGljaCB3aWxsIGJlIGFueXdheSBudWxsLCB3ZSBjaGVjayBpZiB0aGUgbW91c2UgcG9zaXRpb24gaGFzIGNoYW5nZWQuXG4gICAgaWYgKHRoaXMuX2xhc3RQb3NpdGlvbiAmJiBwb3NpdGlvbi5jb21wYXJlKHRoaXMuX2xhc3RQb3NpdGlvbikgPT09IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl9sb2FkaW5nVHJhY2tlciA9IHN0YXJ0VHJhY2tpbmcoJ2h5cGVyY2xpY2stbG9hZGluZycpO1xuXG4gICAgdHJ5IHtcbiAgICAgIHRoaXMuX2xhc3RQb3NpdGlvbiA9IHBvc2l0aW9uO1xuICAgICAgdGhpcy5fbGFzdFN1Z2dlc3Rpb25BdE1vdXNlUHJvbWlzZSA9XG4gICAgICAgICAgdGhpcy5faHlwZXJjbGljay5nZXRTdWdnZXN0aW9uKHRoaXMuX3RleHRFZGl0b3IsIHBvc2l0aW9uKTtcbiAgICAgIHRoaXMuX2xhc3RTdWdnZXN0aW9uQXRNb3VzZSA9IGF3YWl0IHRoaXMuX2xhc3RTdWdnZXN0aW9uQXRNb3VzZVByb21pc2U7XG4gICAgICBpZiAodGhpcy5faXNEZXN0cm95ZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuX2xhc3RTdWdnZXN0aW9uQXRNb3VzZSAmJiB0aGlzLl9pc01vdXNlQXRMYXN0U3VnZ2VzdGlvbigpKSB7XG4gICAgICAgIC8vIEFkZCB0aGUgaHlwZXJjbGljayBtYXJrZXJzIGlmIHRoZXJlJ3MgYSBuZXcgc3VnZ2VzdGlvbiBhbmQgaXQncyB1bmRlciB0aGUgbW91c2UuXG4gICAgICAgIHRoaXMuX3VwZGF0ZU5hdmlnYXRpb25NYXJrZXJzKHRoaXMuX2xhc3RTdWdnZXN0aW9uQXRNb3VzZS5yYW5nZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBSZW1vdmUgYWxsIHRoZSBtYXJrZXJzIGlmIHdlJ3ZlIGZpbmlzaGVkIGxvYWRpbmcgYW5kIHRoZXJlJ3Mgbm8gc3VnZ2VzdGlvbi5cbiAgICAgICAgdGhpcy5fdXBkYXRlTmF2aWdhdGlvbk1hcmtlcnMobnVsbCk7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5fbG9hZGluZ1RyYWNrZXIgIT0gbnVsbCkge1xuICAgICAgICB0aGlzLl9sb2FkaW5nVHJhY2tlci5vblN1Y2Nlc3MoKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBpZiAodGhpcy5fbG9hZGluZ1RyYWNrZXIgIT0gbnVsbCkge1xuICAgICAgICB0aGlzLl9sb2FkaW5nVHJhY2tlci5vbkVycm9yKGUpO1xuICAgICAgfVxuICAgICAgbG9nZ2VyLmVycm9yKCdFcnJvciBnZXR0aW5nIEh5cGVyY2xpY2sgc3VnZ2VzdGlvbjonLCBlKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgdGhpcy5fZG9uZUxvYWRpbmcoKTtcbiAgICB9XG4gIH1cblxuICBfZ2V0TW91c2VQb3NpdGlvbkFzQnVmZmVyUG9zaXRpb24oKTogYXRvbSRQb2ludCB7XG4gICAgY29uc3Qge2NvbXBvbmVudH0gPSB0aGlzLl90ZXh0RWRpdG9yVmlldztcbiAgICBpbnZhcmlhbnQoY29tcG9uZW50KTtcbiAgICBpbnZhcmlhbnQodGhpcy5fbGFzdE1vdXNlRXZlbnQpO1xuICAgIGNvbnN0IHNjcmVlblBvc2l0aW9uID0gY29tcG9uZW50LnNjcmVlblBvc2l0aW9uRm9yTW91c2VFdmVudCh0aGlzLl9sYXN0TW91c2VFdmVudCk7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiB0aGlzLl90ZXh0RWRpdG9yLmJ1ZmZlclBvc2l0aW9uRm9yU2NyZWVuUG9zaXRpb24oc2NyZWVuUG9zaXRpb24pO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAvLyBGaXggaHR0cHM6Ly9naXRodWIuY29tL2ZhY2Vib29rL251Y2xpZGUvaXNzdWVzLzI5MlxuICAgICAgLy8gV2hlbiBuYXZpZ2F0aW5nIEF0b20gd29ya3NwYWNlIHdpdGggYENNRC9DVFJMYCBkb3duLFxuICAgICAgLy8gaXQgdHJpZ2dlcnMgVGV4dEVkaXRvckVsZW1lbnQncyBgbW91c2Vtb3ZlYCB3aXRoIGludmFsaWQgc2NyZWVuIHBvc2l0aW9uLlxuICAgICAgLy8gVGhpcyBmYWxscyBiYWNrIHRvIHJldHVybmluZyB0aGUgc3RhcnQgb2YgdGhlIGVkaXRvci5cbiAgICAgIGxvZ2dlci5lcnJvcignSHlwZXJjbGljazogRXJyb3IgZ2V0dGluZyBidWZmZXIgcG9zaXRpb24gZm9yIHNjcmVlbiBwb3NpdGlvbjonLCBlcnJvcik7XG4gICAgICByZXR1cm4gbmV3IFBvaW50KDAsIDApO1xuICAgIH1cbiAgfVxuXG4gIF9pc01vdXNlQXRMYXN0U3VnZ2VzdGlvbigpOiBib29sZWFuIHtcbiAgICBpZiAoIXRoaXMuX2xhc3RTdWdnZXN0aW9uQXRNb3VzZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBjb25zdCB7cmFuZ2V9ID0gdGhpcy5fbGFzdFN1Z2dlc3Rpb25BdE1vdXNlO1xuICAgIGludmFyaWFudChyYW5nZSwgJ0h5cGVyY2xpY2sgcmVzdWx0IG11c3QgaGF2ZSBhIHZhbGlkIFJhbmdlJyk7XG4gICAgcmV0dXJuIHRoaXMuX2lzUG9zaXRpb25JblJhbmdlKHRoaXMuX2dldE1vdXNlUG9zaXRpb25Bc0J1ZmZlclBvc2l0aW9uKCksIHJhbmdlKTtcbiAgfVxuXG4gIF9pc01vdXNlQXRMYXN0V29yZFJhbmdlKCk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IGxhc3RXb3JkUmFuZ2UgPSB0aGlzLl9sYXN0V29yZFJhbmdlO1xuICAgIGlmIChsYXN0V29yZFJhbmdlID09IG51bGwpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2lzUG9zaXRpb25JblJhbmdlKHRoaXMuX2dldE1vdXNlUG9zaXRpb25Bc0J1ZmZlclBvc2l0aW9uKCksIGxhc3RXb3JkUmFuZ2UpO1xuICB9XG5cbiAgX2lzUG9zaXRpb25JblJhbmdlKHBvc2l0aW9uOiBhdG9tJFBvaW50LCByYW5nZTogYXRvbSRSYW5nZSB8IEFycmF5PGF0b20kUmFuZ2U+KTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIChBcnJheS5pc0FycmF5KHJhbmdlKVxuICAgICAgICA/IHJhbmdlLnNvbWUociA9PiByLmNvbnRhaW5zUG9pbnQocG9zaXRpb24pKVxuICAgICAgICA6IHJhbmdlLmNvbnRhaW5zUG9pbnQocG9zaXRpb24pKTtcbiAgfVxuXG4gIF9jbGVhclN1Z2dlc3Rpb24oKTogdm9pZCB7XG4gICAgdGhpcy5fZG9uZUxvYWRpbmcoKTtcbiAgICB0aGlzLl9sYXN0U3VnZ2VzdGlvbkF0TW91c2VQcm9taXNlID0gbnVsbDtcbiAgICB0aGlzLl9sYXN0U3VnZ2VzdGlvbkF0TW91c2UgPSBudWxsO1xuICAgIHRoaXMuX3VwZGF0ZU5hdmlnYXRpb25NYXJrZXJzKG51bGwpO1xuICB9XG5cbiAgQHRyYWNrVGltaW5nKCdoeXBlcmNsaWNrOmNvbmZpcm0tY3Vyc29yJylcbiAgYXN5bmMgX2NvbmZpcm1TdWdnZXN0aW9uQXRDdXJzb3IoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3Qgc3VnZ2VzdGlvbiA9IGF3YWl0IHRoaXMuX2h5cGVyY2xpY2suZ2V0U3VnZ2VzdGlvbihcbiAgICAgICAgdGhpcy5fdGV4dEVkaXRvcixcbiAgICAgICAgdGhpcy5fdGV4dEVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpKTtcbiAgICBpZiAoc3VnZ2VzdGlvbikge1xuICAgICAgdGhpcy5fY29uZmlybVN1Z2dlc3Rpb24oc3VnZ2VzdGlvbik7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBtYXJrZXJzIGZvciB0aGUgZ2l2ZW4gcmFuZ2UocyksIG9yIGNsZWFycyB0aGVtIGlmIGByYW5nZXNgIGlzIG51bGwuXG4gICAqL1xuICBfdXBkYXRlTmF2aWdhdGlvbk1hcmtlcnMocmFuZ2U6ID8gKGF0b20kUmFuZ2UgfCBBcnJheTxhdG9tJFJhbmdlPikpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fbmF2aWdhdGlvbk1hcmtlcnMpIHtcbiAgICAgIHRoaXMuX25hdmlnYXRpb25NYXJrZXJzLmZvckVhY2gobWFya2VyID0+IG1hcmtlci5kZXN0cm95KCkpO1xuICAgICAgdGhpcy5fbmF2aWdhdGlvbk1hcmtlcnMgPSBudWxsO1xuICAgIH1cblxuICAgIC8vIE9ubHkgY2hhbmdlIHRoZSBjdXJzb3IgdG8gYSBwb2ludGVyIGlmIHRoZXJlIGlzIGEgc3VnZ2VzdGlvbiByZWFkeS5cbiAgICBpZiAocmFuZ2UgPT0gbnVsbCkge1xuICAgICAgdGhpcy5fdGV4dEVkaXRvclZpZXcuY2xhc3NMaXN0LnJlbW92ZSgnaHlwZXJjbGljaycpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX3RleHRFZGl0b3JWaWV3LmNsYXNzTGlzdC5hZGQoJ2h5cGVyY2xpY2snKTtcbiAgICBjb25zdCByYW5nZXMgPSBBcnJheS5pc0FycmF5KHJhbmdlKSA/IHJhbmdlIDogW3JhbmdlXTtcbiAgICB0aGlzLl9uYXZpZ2F0aW9uTWFya2VycyA9IHJhbmdlcy5tYXAobWFya2VyUmFuZ2UgPT4ge1xuICAgICAgY29uc3QgbWFya2VyID0gdGhpcy5fdGV4dEVkaXRvci5tYXJrQnVmZmVyUmFuZ2UobWFya2VyUmFuZ2UsIHtpbnZhbGlkYXRlOiAnbmV2ZXInfSk7XG4gICAgICB0aGlzLl90ZXh0RWRpdG9yLmRlY29yYXRlTWFya2VyKFxuICAgICAgICBtYXJrZXIsXG4gICAgICAgIHt0eXBlOiAnaGlnaGxpZ2h0JywgY2xhc3M6ICdoeXBlcmNsaWNrJ30sXG4gICAgICApO1xuICAgICAgcmV0dXJuIG1hcmtlcjtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHdoZXRoZXIgYW4gZXZlbnQgc2hvdWxkIGJlIGhhbmRsZWQgYnkgaHlwZXJjbGljayBvciBub3QuXG4gICAqL1xuICBfaXNIeXBlcmNsaWNrRXZlbnQoZXZlbnQ6IFN5bnRoZXRpY0tleWJvYXJkRXZlbnQgfCBNb3VzZUV2ZW50KTogYm9vbGVhbiB7XG4gICAgLy8gSWYgdGhlIHVzZXIgaXMgcHJlc3NpbmcgZWl0aGVyIHRoZSBtZXRhL2N0cmwga2V5IG9yIHRoZSBhbHQga2V5LlxuICAgIHJldHVybiBwcm9jZXNzLnBsYXRmb3JtID09PSAnZGFyd2luJyA/IGV2ZW50Lm1ldGFLZXkgOiBldmVudC5jdHJsS2V5O1xuICB9XG5cbiAgX2lzTG9hZGluZygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fbG9hZGluZ1RyYWNrZXIgIT0gbnVsbDtcbiAgfVxuXG4gIF9kb25lTG9hZGluZygpOiB2b2lkIHtcbiAgICB0aGlzLl9sb2FkaW5nVHJhY2tlciA9IG51bGw7XG4gICAgdGhpcy5fdGV4dEVkaXRvclZpZXcuY2xhc3NMaXN0LnJlbW92ZSgnaHlwZXJjbGljay1sb2FkaW5nJyk7XG4gIH1cblxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuX2lzRGVzdHJveWVkID0gdHJ1ZTtcbiAgICB0aGlzLl9jbGVhclN1Z2dlc3Rpb24oKTtcbiAgICAvLyAkRmxvd0ZpeE1lIChtb3N0KVxuICAgIHRoaXMuX3RleHRFZGl0b3JWaWV3LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMuX29uTW91c2VNb3ZlKTtcbiAgICAvLyAkRmxvd0ZpeE1lIChtb3N0KVxuICAgIHRoaXMuX3RleHRFZGl0b3JWaWV3LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLl9vbktleURvd24pO1xuICAgIC8vICRGbG93Rml4TWUgKG1vc3QpXG4gICAgdGhpcy5fdGV4dEVkaXRvclZpZXcucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5dXAnLCB0aGlzLl9vbktleVVwKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgfVxufVxuIl19