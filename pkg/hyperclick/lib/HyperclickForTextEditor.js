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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkh5cGVyY2xpY2tGb3JUZXh0RWRpdG9yLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O29CQWdCcUQsTUFBTTs7Z0NBQ2xCLHlCQUF5Qjs7OEJBQzFDLHVCQUF1Qjs7b0NBQ2YsMkJBQTJCOzs7O3NCQUNyQyxRQUFROzs7O0FBRTlCLElBQU0sTUFBTSxHQUFHLGdDQUFXLENBQUM7Ozs7Ozs7SUFNTix1QkFBdUI7QUFrQi9CLFdBbEJRLHVCQUF1QixDQWtCOUIsVUFBMkIsRUFBRSxVQUFzQixFQUFFOzs7MEJBbEI5Qyx1QkFBdUI7O0FBbUJ4QyxRQUFJLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQztBQUM5QixRQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDOztBQUV0RCxRQUFJLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQzs7QUFFOUIsUUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUM7QUFDNUIsUUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7OztBQUcxQixRQUFJLENBQUMsNkJBQTZCLEdBQUcsSUFBSSxDQUFDOztBQUUxQyxRQUFJLENBQUMsc0JBQXNCLEdBQUcsSUFBSSxDQUFDO0FBQ25DLFFBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUM7O0FBRS9CLFFBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDO0FBQzNCLFFBQUksQ0FBQyxjQUFjLEdBQUcsK0JBQXlCLENBQUM7O0FBRWhELFFBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDakQsUUFBSSxDQUFDLGVBQWUsQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ3RFLFFBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMs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QUFDLElBQUksRUFBRSxXQUFXLEVBQUUsU0FBTyxZQUFZLEVBQUMsQ0FDekMsQ0FBQztBQUNGLGVBQU8sTUFBTSxDQUFDO09BQ2YsQ0FBQyxDQUFDO0tBQ0o7Ozs7Ozs7V0FLaUIsNEJBQUMsS0FBMEMsRUFBVzs7QUFFdEUsYUFBTyxPQUFPLENBQUMsUUFBUSxLQUFLLFFBQVEsR0FBRyxLQUFLLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUM7S0FDdEU7OztXQUVTLHNCQUFZO0FBQ3BCLGFBQU8sSUFBSSxDQUFDLGVBQWUsSUFBSSxJQUFJLENBQUM7S0FDckM7OztXQUVXLHdCQUFTO0FBQ25CLFVBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDO0FBQzVCLFVBQUksQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0tBQzdEOzs7V0FFTSxtQkFBRztBQUNSLFVBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO0FBQ3pCLFVBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDOztBQUV4QixVQUFJLENBQUMsZUFBZSxDQUFDLG1CQUFtQixDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7O0FBRXpFLFVBQUksQ0FBQyxlQUFlLENBQUMsbUJBQW1CLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQzs7QUFFckUsVUFBSSxDQUFDLGVBQWUsQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ2pFLFVBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDL0I7OztTQWxVa0IsdUJBQXVCOzs7cUJBQXZCLHVCQUF1QiIsImZpbGUiOiJIeXBlcmNsaWNrRm9yVGV4dEVkaXRvci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtIeXBlcmNsaWNrU3VnZ2VzdGlvbn0gZnJvbSAnLi90eXBlcyc7XG5cbmltcG9ydCB0eXBlIEh5cGVyY2xpY2sgZnJvbSAnLi9IeXBlcmNsaWNrJztcbmltcG9ydCB0eXBlIHtUaW1pbmdUcmFja2VyfSBmcm9tICcuLi8uLi9udWNsaWRlLWFuYWx5dGljcyc7XG5cbmltcG9ydCB7RGlzcG9zYWJsZSwgQ29tcG9zaXRlRGlzcG9zYWJsZSwgUG9pbnR9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHt0cmFja1RpbWluZywgc3RhcnRUcmFja2luZ30gZnJvbSAnLi4vLi4vbnVjbGlkZS1hbmFseXRpY3MnO1xuaW1wb3J0IHtnZXRMb2dnZXJ9IGZyb20gJy4uLy4uL251Y2xpZGUtbG9nZ2luZyc7XG5pbXBvcnQgZ2V0V29yZFRleHRBbmRSYW5nZSBmcm9tICcuL2dldC13b3JkLXRleHQtYW5kLXJhbmdlJztcbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcblxuY29uc3QgbG9nZ2VyID0gZ2V0TG9nZ2VyKCk7XG5cbi8qKlxuICogQ29uc3RydWN0IHRoaXMgb2JqZWN0IHRvIGVuYWJsZSBIeXBlcmNsaWNrIGluIGEgdGV4dCBlZGl0b3IuXG4gKiBDYWxsIGBkaXNwb3NlYCB0byBkaXNhYmxlIHRoZSBmZWF0dXJlLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBIeXBlcmNsaWNrRm9yVGV4dEVkaXRvciB7XG4gIF90ZXh0RWRpdG9yOiBhdG9tJFRleHRFZGl0b3I7XG4gIF90ZXh0RWRpdG9yVmlldzogYXRvbSRUZXh0RWRpdG9yRWxlbWVudDtcbiAgX2h5cGVyY2xpY2s6IEh5cGVyY2xpY2s7XG4gIF9sYXN0TW91c2VFdmVudDogP01vdXNlRXZlbnQ7XG4gIF9sYXN0UG9zaXRpb246ID9hdG9tJFBvaW50O1xuICBfbGFzdFN1Z2dlc3Rpb25BdE1vdXNlUHJvbWlzZTogP1Byb21pc2U8SHlwZXJjbGlja1N1Z2dlc3Rpb24+O1xuICBfbGFzdFN1Z2dlc3Rpb25BdE1vdXNlOiA/SHlwZXJjbGlja1N1Z2dlc3Rpb247XG4gIF9uYXZpZ2F0aW9uTWFya2VyczogP0FycmF5PGF0b20kTWFya2VyPjtcbiAgX2xhc3RXb3JkUmFuZ2U6ID9hdG9tJFJhbmdlO1xuICBfb25Nb3VzZU1vdmU6IChldmVudDogTW91c2VFdmVudCkgPT4gdm9pZDtcbiAgX29uTW91c2VEb3duOiAoZXZlbnQ6IE1vdXNlRXZlbnQpID0+IHZvaWQ7XG4gIF9vbktleURvd246IChldmVudDogU3ludGhldGljS2V5Ym9hcmRFdmVudCkgPT4gdm9pZDtcbiAgX29uS2V5VXA6IChldmVudDogU3ludGhldGljS2V5Ym9hcmRFdmVudCkgPT4gdm9pZDtcbiAgX3N1YnNjcmlwdGlvbnM6IGF0b20kQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX2lzRGVzdHJveWVkOiBib29sZWFuO1xuICBfbG9hZGluZ1RyYWNrZXI6ID9UaW1pbmdUcmFja2VyO1xuXG4gIGNvbnN0cnVjdG9yKHRleHRFZGl0b3I6IGF0b20kVGV4dEVkaXRvciwgaHlwZXJjbGljazogSHlwZXJjbGljaykge1xuICAgIHRoaXMuX3RleHRFZGl0b3IgPSB0ZXh0RWRpdG9yO1xuICAgIHRoaXMuX3RleHRFZGl0b3JWaWV3ID0gYXRvbS52aWV3cy5nZXRWaWV3KHRleHRFZGl0b3IpO1xuXG4gICAgdGhpcy5faHlwZXJjbGljayA9IGh5cGVyY2xpY2s7XG5cbiAgICB0aGlzLl9sYXN0TW91c2VFdmVudCA9IG51bGw7XG4gICAgdGhpcy5fbGFzdFBvc2l0aW9uID0gbnVsbDtcbiAgICAvLyBXZSBzdG9yZSB0aGUgb3JpZ2luYWwgcHJvbWlzZSB0aGF0IHdlIHVzZSB0byByZXRyaWV2ZSB0aGUgbGFzdCBzdWdnZXN0aW9uXG4gICAgLy8gc28gY2FsbGVycyBjYW4gYWxzbyBhd2FpdCBpdCB0byBrbm93IHdoZW4gaXQncyBhdmFpbGFibGUuXG4gICAgdGhpcy5fbGFzdFN1Z2dlc3Rpb25BdE1vdXNlUHJvbWlzZSA9IG51bGw7XG4gICAgLy8gV2Ugc3RvcmUgdGhlIGxhc3Qgc3VnZ2VzdGlvbiBzaW5jZSB3ZSBtdXN0IGF3YWl0IGl0IGltbWVkaWF0ZWx5IGFueXdheS5cbiAgICB0aGlzLl9sYXN0U3VnZ2VzdGlvbkF0TW91c2UgPSBudWxsO1xuICAgIHRoaXMuX25hdmlnYXRpb25NYXJrZXJzID0gbnVsbDtcblxuICAgIHRoaXMuX2xhc3RXb3JkUmFuZ2UgPSBudWxsO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuXG4gICAgdGhpcy5fb25Nb3VzZU1vdmUgPSB0aGlzLl9vbk1vdXNlTW92ZS5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX3RleHRFZGl0b3JWaWV3LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMuX29uTW91c2VNb3ZlKTtcbiAgICB0aGlzLl9vbk1vdXNlRG93biA9IHRoaXMuX29uTW91c2VEb3duLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fc2V0dXBNb3VzZURvd25MaXN0ZW5lcigpO1xuXG4gICAgdGhpcy5fb25LZXlEb3duID0gdGhpcy5fb25LZXlEb3duLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fdGV4dEVkaXRvclZpZXcuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuX29uS2V5RG93bik7XG4gICAgdGhpcy5fb25LZXlVcCA9IHRoaXMuX29uS2V5VXAuYmluZCh0aGlzKTtcbiAgICB0aGlzLl90ZXh0RWRpdG9yVmlldy5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIHRoaXMuX29uS2V5VXApO1xuXG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb21tYW5kcy5hZGQodGhpcy5fdGV4dEVkaXRvclZpZXcsIHtcbiAgICAgICdoeXBlcmNsaWNrOmNvbmZpcm0tY3Vyc29yJzogKCkgPT4gdGhpcy5fY29uZmlybVN1Z2dlc3Rpb25BdEN1cnNvcigpLFxuICAgIH0pKTtcblxuICAgIHRoaXMuX2lzRGVzdHJveWVkID0gZmFsc2U7XG4gICAgdGhpcy5fbG9hZGluZ1RyYWNrZXIgPSBudWxsO1xuICB9XG5cbiAgX3NldHVwTW91c2VEb3duTGlzdGVuZXIoKTogdm9pZCB7XG4gICAgY29uc3QgZ2V0TGluZXNEb21Ob2RlID0gKCk6IEhUTUxFbGVtZW50ID0+IHtcbiAgICAgIGNvbnN0IHtjb21wb25lbnR9ID0gdGhpcy5fdGV4dEVkaXRvclZpZXc7XG4gICAgICBpbnZhcmlhbnQoY29tcG9uZW50KTtcbiAgICAgIHJldHVybiBjb21wb25lbnQubGluZXNDb21wb25lbnQuZ2V0RG9tTm9kZSgpO1xuICAgIH07XG4gICAgY29uc3QgcmVtb3ZlTW91c2VEb3duTGlzdGVuZXIgPSAoKSA9PiB7XG4gICAgICBpZiAodGhpcy5fdGV4dEVkaXRvclZpZXcuY29tcG9uZW50ID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgLy8gJEZsb3dGaXhNZSAobW9zdClcbiAgICAgIGdldExpbmVzRG9tTm9kZSgpLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMuX29uTW91c2VEb3duKTtcbiAgICB9O1xuICAgIGNvbnN0IGFkZE1vdXNlRG93bkxpc3RlbmVyID0gKCkgPT4ge1xuICAgICAgZ2V0TGluZXNEb21Ob2RlKCkuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcy5fb25Nb3VzZURvd24pO1xuICAgIH07XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQobmV3IERpc3Bvc2FibGUocmVtb3ZlTW91c2VEb3duTGlzdGVuZXIpKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZCh0aGlzLl90ZXh0RWRpdG9yVmlldy5vbkRpZERldGFjaChyZW1vdmVNb3VzZURvd25MaXN0ZW5lcikpO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKHRoaXMuX3RleHRFZGl0b3JWaWV3Lm9uRGlkQXR0YWNoKGFkZE1vdXNlRG93bkxpc3RlbmVyKSk7XG4gICAgYWRkTW91c2VEb3duTGlzdGVuZXIoKTtcbiAgfVxuXG4gIF9jb25maXJtU3VnZ2VzdGlvbihzdWdnZXN0aW9uOiBIeXBlcmNsaWNrU3VnZ2VzdGlvbik6IHZvaWQge1xuICAgIGlmIChBcnJheS5pc0FycmF5KHN1Z2dlc3Rpb24uY2FsbGJhY2spICYmIHN1Z2dlc3Rpb24uY2FsbGJhY2subGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5faHlwZXJjbGljay5zaG93U3VnZ2VzdGlvbkxpc3QodGhpcy5fdGV4dEVkaXRvciwgc3VnZ2VzdGlvbik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGludmFyaWFudCh0eXBlb2Ygc3VnZ2VzdGlvbi5jYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJyk7XG4gICAgICBzdWdnZXN0aW9uLmNhbGxiYWNrKCk7XG4gICAgfVxuICB9XG5cbiAgX29uTW91c2VNb3ZlKGV2ZW50OiBNb3VzZUV2ZW50KTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2lzTG9hZGluZygpKSB7XG4gICAgICAvLyBTaG93IHRoZSBsb2FkaW5nIGN1cnNvci5cbiAgICAgIHRoaXMuX3RleHRFZGl0b3JWaWV3LmNsYXNzTGlzdC5hZGQoJ2h5cGVyY2xpY2stbG9hZGluZycpO1xuICAgIH1cblxuICAgIC8vIFdlIHNhdmUgdGhlIGxhc3QgYE1vdXNlRXZlbnRgIHNvIHRoZSB1c2VyIGNhbiB0cmlnZ2VyIEh5cGVyY2xpY2sgYnlcbiAgICAvLyBwcmVzc2luZyB0aGUga2V5IHdpdGhvdXQgbW92aW5nIHRoZSBtb3VzZSBhZ2Fpbi4gV2Ugb25seSBzYXZlIHRoZVxuICAgIC8vIHJlbGV2YW50IHByb3BlcnRpZXMgdG8gcHJldmVudCByZXRhaW5pbmcgYSByZWZlcmVuY2UgdG8gdGhlIGV2ZW50LlxuICAgIHRoaXMuX2xhc3RNb3VzZUV2ZW50ID0gKHtcbiAgICAgIGNsaWVudFg6IGV2ZW50LmNsaWVudFgsXG4gICAgICBjbGllbnRZOiBldmVudC5jbGllbnRZLFxuICAgIH06IGFueSk7XG5cblxuICAgIC8vIERvbid0IGZldGNoIHN1Z2dlc3Rpb25zIGlmIHRoZSBtb3VzZSBpcyBzdGlsbCBpbiB0aGUgc2FtZSAnd29yZCcsIHdoZXJlXG4gICAgLy8gJ3dvcmQnIGlzIGEgd2hpdGVzcGFjZS1kZWxpbWl0ZWQgZ3JvdXAgb2YgY2hhcmFjdGVycy5cbiAgICAvL1xuICAgIC8vIElmIHRoZSBsYXN0IHN1Z2dlc3Rpb24gaGFkIG11bHRpcGxlIHJhbmdlcywgd2UgaGF2ZSBubyBjaG9pY2UgYnV0IHRvXG4gICAgLy8gZmV0Y2ggc3VnZ2VzdGlvbnMgYmVjYXVzZSB0aGUgbmV3IHdvcmQgbWlnaHQgYmUgYmV0d2VlbiB0aG9zZSByYW5nZXMuXG4gICAgLy8gVGhpcyBzaG91bGQgYmUgb2sgYmVjYXVzZSBpdCB3aWxsIHJldXNlIHRoYXQgbGFzdCBzdWdnZXN0aW9uIHVudGlsIHRoZVxuICAgIC8vIG1vdXNlIG1vdmVzIG9mZiBvZiBpdC5cbiAgICBjb25zdCBsYXN0U3VnZ2VzdGlvbklzTm90TXVsdGlSYW5nZSA9ICF0aGlzLl9sYXN0U3VnZ2VzdGlvbkF0TW91c2UgfHxcbiAgICAgICAgIUFycmF5LmlzQXJyYXkodGhpcy5fbGFzdFN1Z2dlc3Rpb25BdE1vdXNlLnJhbmdlKTtcbiAgICBpZiAodGhpcy5faXNNb3VzZUF0TGFzdFdvcmRSYW5nZSgpICYmIGxhc3RTdWdnZXN0aW9uSXNOb3RNdWx0aVJhbmdlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHtyYW5nZX0gPSBnZXRXb3JkVGV4dEFuZFJhbmdlKHRoaXMuX3RleHRFZGl0b3IsIHRoaXMuX2dldE1vdXNlUG9zaXRpb25Bc0J1ZmZlclBvc2l0aW9uKCkpO1xuICAgIHRoaXMuX2xhc3RXb3JkUmFuZ2UgPSByYW5nZTtcblxuICAgIGlmICh0aGlzLl9pc0h5cGVyY2xpY2tFdmVudChldmVudCkpIHtcbiAgICAgIC8vIENsZWFyIHRoZSBzdWdnZXN0aW9uIGlmIHRoZSBtb3VzZSBtb3ZlZCBvdXQgb2YgdGhlIHJhbmdlLlxuICAgICAgaWYgKCF0aGlzLl9pc01vdXNlQXRMYXN0U3VnZ2VzdGlvbigpKSB7XG4gICAgICAgIHRoaXMuX2NsZWFyU3VnZ2VzdGlvbigpO1xuICAgICAgfVxuICAgICAgdGhpcy5fc2V0U3VnZ2VzdGlvbkZvckxhc3RNb3VzZUV2ZW50KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2NsZWFyU3VnZ2VzdGlvbigpO1xuICAgIH1cbiAgfVxuXG4gIF9vbk1vdXNlRG93bihldmVudDogTW91c2VFdmVudCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5faXNIeXBlcmNsaWNrRXZlbnQoZXZlbnQpIHx8ICF0aGlzLl9pc01vdXNlQXRMYXN0U3VnZ2VzdGlvbigpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2xhc3RTdWdnZXN0aW9uQXRNb3VzZSkge1xuICAgICAgdGhpcy5fY29uZmlybVN1Z2dlc3Rpb24odGhpcy5fbGFzdFN1Z2dlc3Rpb25BdE1vdXNlKTtcbiAgICAgIC8vIFByZXZlbnQgdGhlIDxtZXRhLWNsaWNrPiBldmVudCBmcm9tIGFkZGluZyBhbm90aGVyIGN1cnNvci5cbiAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIH1cblxuICAgIHRoaXMuX2NsZWFyU3VnZ2VzdGlvbigpO1xuICB9XG5cbiAgX29uS2V5RG93bihldmVudDogU3ludGhldGljS2V5Ym9hcmRFdmVudCk6IHZvaWQge1xuICAgIC8vIFNob3cgdGhlIHN1Z2dlc3Rpb24gYXQgdGhlIGxhc3Qga25vd24gbW91c2UgcG9zaXRpb24uXG4gICAgaWYgKHRoaXMuX2lzSHlwZXJjbGlja0V2ZW50KGV2ZW50KSkge1xuICAgICAgdGhpcy5fc2V0U3VnZ2VzdGlvbkZvckxhc3RNb3VzZUV2ZW50KCk7XG4gICAgfVxuICB9XG5cbiAgX29uS2V5VXAoZXZlbnQ6IFN5bnRoZXRpY0tleWJvYXJkRXZlbnQpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuX2lzSHlwZXJjbGlja0V2ZW50KGV2ZW50KSkge1xuICAgICAgdGhpcy5fY2xlYXJTdWdnZXN0aW9uKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBgUHJvbWlzZWAgdGhhdCdzIHJlc29sdmVkIHdoZW4gdGhlIGxhdGVzdCBzdWdnZXN0aW9uJ3MgYXZhaWxhYmxlLlxuICAgKi9cbiAgZ2V0U3VnZ2VzdGlvbkF0TW91c2UoKTogUHJvbWlzZTw/SHlwZXJjbGlja1N1Z2dlc3Rpb24+IHtcbiAgICByZXR1cm4gdGhpcy5fbGFzdFN1Z2dlc3Rpb25BdE1vdXNlUHJvbWlzZSB8fCBQcm9taXNlLnJlc29sdmUobnVsbCk7XG4gIH1cblxuICBhc3luYyBfc2V0U3VnZ2VzdGlvbkZvckxhc3RNb3VzZUV2ZW50KCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICghdGhpcy5fbGFzdE1vdXNlRXZlbnQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBwb3NpdGlvbiA9IHRoaXMuX2dldE1vdXNlUG9zaXRpb25Bc0J1ZmZlclBvc2l0aW9uKCk7XG5cbiAgICBpZiAodGhpcy5fbGFzdFN1Z2dlc3Rpb25BdE1vdXNlICE9IG51bGwpIHtcbiAgICAgIGNvbnN0IHtyYW5nZX0gPSB0aGlzLl9sYXN0U3VnZ2VzdGlvbkF0TW91c2U7XG4gICAgICBpbnZhcmlhbnQocmFuZ2UsICdIeXBlcmNsaWNrIHJlc3VsdCBtdXN0IGhhdmUgYSB2YWxpZCBSYW5nZScpO1xuICAgICAgaWYgKHRoaXMuX2lzUG9zaXRpb25JblJhbmdlKHBvc2l0aW9uLCByYW5nZSkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cbiAgICAvLyB0aGlzLl9sYXN0U3VnZ2VzdGlvbkF0TW91c2Ugd2lsbCBvbmx5IGJlIHNldCBpZiBoeXBlcmNsaWNrIHJldHVybmVkIGEgcHJvbWlzZSB0aGF0XG4gICAgLy8gcmVzb2x2ZWQgdG8gYSBub24tbnVsbCB2YWx1ZS4gU28sIGluIG9yZGVyIHRvIG5vdCBhc2sgaHlwZXJjbGljayBmb3IgdGhlIHNhbWUgdGhpbmdcbiAgICAvLyBhZ2FpbiBhbmQgYWdhaW4gd2hpY2ggd2lsbCBiZSBhbnl3YXkgbnVsbCwgd2UgY2hlY2sgaWYgdGhlIG1vdXNlIHBvc2l0aW9uIGhhcyBjaGFuZ2VkLlxuICAgIGlmICh0aGlzLl9sYXN0UG9zaXRpb24gJiYgcG9zaXRpb24uY29tcGFyZSh0aGlzLl9sYXN0UG9zaXRpb24pID09PSAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5fbG9hZGluZ1RyYWNrZXIgPSBzdGFydFRyYWNraW5nKCdoeXBlcmNsaWNrLWxvYWRpbmcnKTtcblxuICAgIHRyeSB7XG4gICAgICB0aGlzLl9sYXN0UG9zaXRpb24gPSBwb3NpdGlvbjtcbiAgICAgIHRoaXMuX2xhc3RTdWdnZXN0aW9uQXRNb3VzZVByb21pc2UgPVxuICAgICAgICAgIHRoaXMuX2h5cGVyY2xpY2suZ2V0U3VnZ2VzdGlvbih0aGlzLl90ZXh0RWRpdG9yLCBwb3NpdGlvbik7XG4gICAgICB0aGlzLl9sYXN0U3VnZ2VzdGlvbkF0TW91c2UgPSBhd2FpdCB0aGlzLl9sYXN0U3VnZ2VzdGlvbkF0TW91c2VQcm9taXNlO1xuICAgICAgaWYgKHRoaXMuX2lzRGVzdHJveWVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLl9sYXN0U3VnZ2VzdGlvbkF0TW91c2UgJiYgdGhpcy5faXNNb3VzZUF0TGFzdFN1Z2dlc3Rpb24oKSkge1xuICAgICAgICAvLyBBZGQgdGhlIGh5cGVyY2xpY2sgbWFya2VycyBpZiB0aGVyZSdzIGEgbmV3IHN1Z2dlc3Rpb24gYW5kIGl0J3MgdW5kZXIgdGhlIG1vdXNlLlxuICAgICAgICB0aGlzLl91cGRhdGVOYXZpZ2F0aW9uTWFya2Vycyh0aGlzLl9sYXN0U3VnZ2VzdGlvbkF0TW91c2UucmFuZ2UpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gUmVtb3ZlIGFsbCB0aGUgbWFya2VycyBpZiB3ZSd2ZSBmaW5pc2hlZCBsb2FkaW5nIGFuZCB0aGVyZSdzIG5vIHN1Z2dlc3Rpb24uXG4gICAgICAgIHRoaXMuX3VwZGF0ZU5hdmlnYXRpb25NYXJrZXJzKG51bGwpO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuX2xvYWRpbmdUcmFja2VyICE9IG51bGwpIHtcbiAgICAgICAgdGhpcy5fbG9hZGluZ1RyYWNrZXIub25TdWNjZXNzKCk7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgaWYgKHRoaXMuX2xvYWRpbmdUcmFja2VyICE9IG51bGwpIHtcbiAgICAgICAgdGhpcy5fbG9hZGluZ1RyYWNrZXIub25FcnJvcihlKTtcbiAgICAgIH1cbiAgICAgIGxvZ2dlci5lcnJvcignRXJyb3IgZ2V0dGluZyBIeXBlcmNsaWNrIHN1Z2dlc3Rpb246JywgZSk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRoaXMuX2RvbmVMb2FkaW5nKCk7XG4gICAgfVxuICB9XG5cbiAgX2dldE1vdXNlUG9zaXRpb25Bc0J1ZmZlclBvc2l0aW9uKCk6IGF0b20kUG9pbnQge1xuICAgIGNvbnN0IHtjb21wb25lbnR9ID0gdGhpcy5fdGV4dEVkaXRvclZpZXc7XG4gICAgaW52YXJpYW50KGNvbXBvbmVudCk7XG4gICAgaW52YXJpYW50KHRoaXMuX2xhc3RNb3VzZUV2ZW50KTtcbiAgICBjb25zdCBzY3JlZW5Qb3NpdGlvbiA9IGNvbXBvbmVudC5zY3JlZW5Qb3NpdGlvbkZvck1vdXNlRXZlbnQodGhpcy5fbGFzdE1vdXNlRXZlbnQpO1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gdGhpcy5fdGV4dEVkaXRvci5idWZmZXJQb3NpdGlvbkZvclNjcmVlblBvc2l0aW9uKHNjcmVlblBvc2l0aW9uKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgLy8gRml4IGh0dHBzOi8vZ2l0aHViLmNvbS9mYWNlYm9vay9udWNsaWRlL2lzc3Vlcy8yOTJcbiAgICAgIC8vIFdoZW4gbmF2aWdhdGluZyBBdG9tIHdvcmtzcGFjZSB3aXRoIGBDTUQvQ1RSTGAgZG93bixcbiAgICAgIC8vIGl0IHRyaWdnZXJzIFRleHRFZGl0b3JFbGVtZW50J3MgYG1vdXNlbW92ZWAgd2l0aCBpbnZhbGlkIHNjcmVlbiBwb3NpdGlvbi5cbiAgICAgIC8vIFRoaXMgZmFsbHMgYmFjayB0byByZXR1cm5pbmcgdGhlIHN0YXJ0IG9mIHRoZSBlZGl0b3IuXG4gICAgICBsb2dnZXIuZXJyb3IoJ0h5cGVyY2xpY2s6IEVycm9yIGdldHRpbmcgYnVmZmVyIHBvc2l0aW9uIGZvciBzY3JlZW4gcG9zaXRpb246JywgZXJyb3IpO1xuICAgICAgcmV0dXJuIG5ldyBQb2ludCgwLCAwKTtcbiAgICB9XG4gIH1cblxuICBfaXNNb3VzZUF0TGFzdFN1Z2dlc3Rpb24oKTogYm9vbGVhbiB7XG4gICAgaWYgKCF0aGlzLl9sYXN0U3VnZ2VzdGlvbkF0TW91c2UpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgY29uc3Qge3JhbmdlfSA9IHRoaXMuX2xhc3RTdWdnZXN0aW9uQXRNb3VzZTtcbiAgICBpbnZhcmlhbnQocmFuZ2UsICdIeXBlcmNsaWNrIHJlc3VsdCBtdXN0IGhhdmUgYSB2YWxpZCBSYW5nZScpO1xuICAgIHJldHVybiB0aGlzLl9pc1Bvc2l0aW9uSW5SYW5nZSh0aGlzLl9nZXRNb3VzZVBvc2l0aW9uQXNCdWZmZXJQb3NpdGlvbigpLCByYW5nZSk7XG4gIH1cblxuICBfaXNNb3VzZUF0TGFzdFdvcmRSYW5nZSgpOiBib29sZWFuIHtcbiAgICBjb25zdCBsYXN0V29yZFJhbmdlID0gdGhpcy5fbGFzdFdvcmRSYW5nZTtcbiAgICBpZiAobGFzdFdvcmRSYW5nZSA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9pc1Bvc2l0aW9uSW5SYW5nZSh0aGlzLl9nZXRNb3VzZVBvc2l0aW9uQXNCdWZmZXJQb3NpdGlvbigpLCBsYXN0V29yZFJhbmdlKTtcbiAgfVxuXG4gIF9pc1Bvc2l0aW9uSW5SYW5nZShwb3NpdGlvbjogYXRvbSRQb2ludCwgcmFuZ2U6IGF0b20kUmFuZ2UgfCBBcnJheTxhdG9tJFJhbmdlPik6IGJvb2xlYW4ge1xuICAgIHJldHVybiAoQXJyYXkuaXNBcnJheShyYW5nZSlcbiAgICAgICAgPyByYW5nZS5zb21lKHIgPT4gci5jb250YWluc1BvaW50KHBvc2l0aW9uKSlcbiAgICAgICAgOiByYW5nZS5jb250YWluc1BvaW50KHBvc2l0aW9uKSk7XG4gIH1cblxuICBfY2xlYXJTdWdnZXN0aW9uKCk6IHZvaWQge1xuICAgIHRoaXMuX2RvbmVMb2FkaW5nKCk7XG4gICAgdGhpcy5fbGFzdFN1Z2dlc3Rpb25BdE1vdXNlUHJvbWlzZSA9IG51bGw7XG4gICAgdGhpcy5fbGFzdFN1Z2dlc3Rpb25BdE1vdXNlID0gbnVsbDtcbiAgICB0aGlzLl91cGRhdGVOYXZpZ2F0aW9uTWFya2VycyhudWxsKTtcbiAgfVxuXG4gIEB0cmFja1RpbWluZygnaHlwZXJjbGljazpjb25maXJtLWN1cnNvcicpXG4gIGFzeW5jIF9jb25maXJtU3VnZ2VzdGlvbkF0Q3Vyc29yKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHN1Z2dlc3Rpb24gPSBhd2FpdCB0aGlzLl9oeXBlcmNsaWNrLmdldFN1Z2dlc3Rpb24oXG4gICAgICAgIHRoaXMuX3RleHRFZGl0b3IsXG4gICAgICAgIHRoaXMuX3RleHRFZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSk7XG4gICAgaWYgKHN1Z2dlc3Rpb24pIHtcbiAgICAgIHRoaXMuX2NvbmZpcm1TdWdnZXN0aW9uKHN1Z2dlc3Rpb24pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgbWFya2VycyBmb3IgdGhlIGdpdmVuIHJhbmdlKHMpLCBvciBjbGVhcnMgdGhlbSBpZiBgcmFuZ2VzYCBpcyBudWxsLlxuICAgKi9cbiAgX3VwZGF0ZU5hdmlnYXRpb25NYXJrZXJzKHJhbmdlOiA/IChhdG9tJFJhbmdlIHwgQXJyYXk8YXRvbSRSYW5nZT4pKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX25hdmlnYXRpb25NYXJrZXJzKSB7XG4gICAgICB0aGlzLl9uYXZpZ2F0aW9uTWFya2Vycy5mb3JFYWNoKG1hcmtlciA9PiBtYXJrZXIuZGVzdHJveSgpKTtcbiAgICAgIHRoaXMuX25hdmlnYXRpb25NYXJrZXJzID0gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBPbmx5IGNoYW5nZSB0aGUgY3Vyc29yIHRvIGEgcG9pbnRlciBpZiB0aGVyZSBpcyBhIHN1Z2dlc3Rpb24gcmVhZHkuXG4gICAgaWYgKHJhbmdlID09IG51bGwpIHtcbiAgICAgIHRoaXMuX3RleHRFZGl0b3JWaWV3LmNsYXNzTGlzdC5yZW1vdmUoJ2h5cGVyY2xpY2snKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl90ZXh0RWRpdG9yVmlldy5jbGFzc0xpc3QuYWRkKCdoeXBlcmNsaWNrJyk7XG4gICAgY29uc3QgcmFuZ2VzID0gQXJyYXkuaXNBcnJheShyYW5nZSkgPyByYW5nZSA6IFtyYW5nZV07XG4gICAgdGhpcy5fbmF2aWdhdGlvbk1hcmtlcnMgPSByYW5nZXMubWFwKG1hcmtlclJhbmdlID0+IHtcbiAgICAgIGNvbnN0IG1hcmtlciA9IHRoaXMuX3RleHRFZGl0b3IubWFya0J1ZmZlclJhbmdlKG1hcmtlclJhbmdlLCB7aW52YWxpZGF0ZTogJ25ldmVyJ30pO1xuICAgICAgdGhpcy5fdGV4dEVkaXRvci5kZWNvcmF0ZU1hcmtlcihcbiAgICAgICAgbWFya2VyLFxuICAgICAgICB7dHlwZTogJ2hpZ2hsaWdodCcsIGNsYXNzOiAnaHlwZXJjbGljayd9LFxuICAgICAgKTtcbiAgICAgIHJldHVybiBtYXJrZXI7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB3aGV0aGVyIGFuIGV2ZW50IHNob3VsZCBiZSBoYW5kbGVkIGJ5IGh5cGVyY2xpY2sgb3Igbm90LlxuICAgKi9cbiAgX2lzSHlwZXJjbGlja0V2ZW50KGV2ZW50OiBTeW50aGV0aWNLZXlib2FyZEV2ZW50IHwgTW91c2VFdmVudCk6IGJvb2xlYW4ge1xuICAgIC8vIElmIHRoZSB1c2VyIGlzIHByZXNzaW5nIGVpdGhlciB0aGUgbWV0YS9jdHJsIGtleSBvciB0aGUgYWx0IGtleS5cbiAgICByZXR1cm4gcHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ2RhcndpbicgPyBldmVudC5tZXRhS2V5IDogZXZlbnQuY3RybEtleTtcbiAgfVxuXG4gIF9pc0xvYWRpbmcoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2xvYWRpbmdUcmFja2VyICE9IG51bGw7XG4gIH1cblxuICBfZG9uZUxvYWRpbmcoKTogdm9pZCB7XG4gICAgdGhpcy5fbG9hZGluZ1RyYWNrZXIgPSBudWxsO1xuICAgIHRoaXMuX3RleHRFZGl0b3JWaWV3LmNsYXNzTGlzdC5yZW1vdmUoJ2h5cGVyY2xpY2stbG9hZGluZycpO1xuICB9XG5cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLl9pc0Rlc3Ryb3llZCA9IHRydWU7XG4gICAgdGhpcy5fY2xlYXJTdWdnZXN0aW9uKCk7XG4gICAgLy8gJEZsb3dGaXhNZSAobW9zdClcbiAgICB0aGlzLl90ZXh0RWRpdG9yVmlldy5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLl9vbk1vdXNlTW92ZSk7XG4gICAgLy8gJEZsb3dGaXhNZSAobW9zdClcbiAgICB0aGlzLl90ZXh0RWRpdG9yVmlldy5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5fb25LZXlEb3duKTtcbiAgICAvLyAkRmxvd0ZpeE1lIChtb3N0KVxuICAgIHRoaXMuX3RleHRFZGl0b3JWaWV3LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleXVwJywgdGhpcy5fb25LZXlVcCk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gIH1cbn1cbiJdfQ==