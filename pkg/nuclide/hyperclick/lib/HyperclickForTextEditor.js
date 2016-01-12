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

var _analytics = require('../../analytics');

var _logging = require('../../logging');

var _getWordTextAndRange2 = require('./get-word-text-and-range');

var _getWordTextAndRange3 = _interopRequireDefault(_getWordTextAndRange2);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var logger = (0, _logging.getLogger)();

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

      this._loadingTracker = (0, _analytics.startTracking)('hyperclick-loading');

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
      return this._textEditor.bufferPositionForScreenPosition(screenPosition);
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
    decorators: [(0, _analytics.trackTiming)('hyperclick:confirm-cursor')],
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkh5cGVyY2xpY2tGb3JUZXh0RWRpdG9yLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O29CQWdCOEMsTUFBTTs7eUJBQ1gsaUJBQWlCOzt1QkFDbEMsZUFBZTs7b0NBQ1AsMkJBQTJCOzs7O3NCQUNyQyxRQUFROzs7O0FBRTlCLElBQU0sTUFBTSxHQUFHLHlCQUFXLENBQUM7Ozs7Ozs7SUFNTix1QkFBdUI7QUFrQi9CLFdBbEJRLHVCQUF1QixDQWtCOUIsVUFBMkIsRUFBRSxVQUFzQixFQUFFOzs7MEJBbEI5Qyx1QkFBdUI7O0FBbUJ4QyxRQUFJLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQztBQUM5QixRQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDOztBQUV0RCxRQUFJLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQzs7QUFFOUIsUUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUM7QUFDNUIsUUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7OztBQUcxQixRQUFJLENBQUMsNkJBQTZCLEdBQUcsSUFBSSxDQUFDOztBQUUxQyxRQUFJLENBQUMsc0JBQXNCLEdBQUcsSUFBSSxDQUFDO0FBQ25DLFFBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUM7O0FBRS9CLFFBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDO0FBQzNCLFFBQUksQ0FBQyxjQUFjLEdBQUcsK0JBQXlCLENBQUM7O0FBRWhELFFBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDakQsUUFBSSxDQUFDLGVBQWUsQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ3RFLFFBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFB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QUFRLEtBQUssUUFBUSxHQUFHLEtBQUssQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQztLQUN0RTs7O1dBRVMsc0JBQVk7QUFDcEIsYUFBTyxJQUFJLENBQUMsZUFBZSxJQUFJLElBQUksQ0FBQztLQUNyQzs7O1dBRVcsd0JBQVM7QUFDbkIsVUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUM7QUFDNUIsVUFBSSxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLG9CQUFvQixDQUFDLENBQUM7S0FDN0Q7OztXQUVNLG1CQUFHO0FBQ1IsVUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7QUFDekIsVUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7O0FBRXhCLFVBQUksQ0FBQyxlQUFlLENBQUMsbUJBQW1CLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQzs7QUFFekUsVUFBSSxDQUFDLGVBQWUsQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDOztBQUVyRSxVQUFJLENBQUMsZUFBZSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDakUsVUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUMvQjs7O1NBelRrQix1QkFBdUI7OztxQkFBdkIsdUJBQXVCIiwiZmlsZSI6Ikh5cGVyY2xpY2tGb3JUZXh0RWRpdG9yLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0h5cGVyY2xpY2tTdWdnZXN0aW9ufSBmcm9tICcuLi8uLi9oeXBlcmNsaWNrLWludGVyZmFjZXMnO1xuXG5pbXBvcnQgdHlwZSBIeXBlcmNsaWNrIGZyb20gJy4vSHlwZXJjbGljayc7XG5pbXBvcnQgdHlwZSB7VGltaW5nVHJhY2tlcn0gZnJvbSAnLi4vLi4vYW5hbHl0aWNzJztcblxuaW1wb3J0IHtEaXNwb3NhYmxlLCBDb21wb3NpdGVEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCB7dHJhY2tUaW1pbmcsIHN0YXJ0VHJhY2tpbmd9IGZyb20gJy4uLy4uL2FuYWx5dGljcyc7XG5pbXBvcnQge2dldExvZ2dlcn0gZnJvbSAnLi4vLi4vbG9nZ2luZyc7XG5pbXBvcnQgZ2V0V29yZFRleHRBbmRSYW5nZSBmcm9tICcuL2dldC13b3JkLXRleHQtYW5kLXJhbmdlJztcbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcblxuY29uc3QgbG9nZ2VyID0gZ2V0TG9nZ2VyKCk7XG5cbi8qKlxuICogQ29uc3RydWN0IHRoaXMgb2JqZWN0IHRvIGVuYWJsZSBIeXBlcmNsaWNrIGluIGEgdGV4dCBlZGl0b3IuXG4gKiBDYWxsIGBkaXNwb3NlYCB0byBkaXNhYmxlIHRoZSBmZWF0dXJlLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBIeXBlcmNsaWNrRm9yVGV4dEVkaXRvciB7XG4gIF90ZXh0RWRpdG9yOiBhdG9tJFRleHRFZGl0b3I7XG4gIF90ZXh0RWRpdG9yVmlldzogYXRvbSRUZXh0RWRpdG9yRWxlbWVudDtcbiAgX2h5cGVyY2xpY2s6IEh5cGVyY2xpY2s7XG4gIF9sYXN0TW91c2VFdmVudDogP01vdXNlRXZlbnQ7XG4gIF9sYXN0UG9zaXRpb246ID9hdG9tJFBvaW50O1xuICBfbGFzdFN1Z2dlc3Rpb25BdE1vdXNlUHJvbWlzZTogP1Byb21pc2U8SHlwZXJjbGlja1N1Z2dlc3Rpb24+O1xuICBfbGFzdFN1Z2dlc3Rpb25BdE1vdXNlOiA/SHlwZXJjbGlja1N1Z2dlc3Rpb247XG4gIF9uYXZpZ2F0aW9uTWFya2VyczogP0FycmF5PGF0b20kTWFya2VyPjtcbiAgX2xhc3RXb3JkUmFuZ2U6ID9hdG9tJFJhbmdlO1xuICBfb25Nb3VzZU1vdmU6IChldmVudDogTW91c2VFdmVudCkgPT4gdm9pZDtcbiAgX29uTW91c2VEb3duOiAoZXZlbnQ6IE1vdXNlRXZlbnQpID0+IHZvaWQ7XG4gIF9vbktleURvd246IChldmVudDogU3ludGhldGljS2V5Ym9hcmRFdmVudCkgPT4gdm9pZDtcbiAgX29uS2V5VXA6IChldmVudDogU3ludGhldGljS2V5Ym9hcmRFdmVudCkgPT4gdm9pZDtcbiAgX3N1YnNjcmlwdGlvbnM6IGF0b20kQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX2lzRGVzdHJveWVkOiBib29sZWFuO1xuICBfbG9hZGluZ1RyYWNrZXI6ID9UaW1pbmdUcmFja2VyO1xuXG4gIGNvbnN0cnVjdG9yKHRleHRFZGl0b3I6IGF0b20kVGV4dEVkaXRvciwgaHlwZXJjbGljazogSHlwZXJjbGljaykge1xuICAgIHRoaXMuX3RleHRFZGl0b3IgPSB0ZXh0RWRpdG9yO1xuICAgIHRoaXMuX3RleHRFZGl0b3JWaWV3ID0gYXRvbS52aWV3cy5nZXRWaWV3KHRleHRFZGl0b3IpO1xuXG4gICAgdGhpcy5faHlwZXJjbGljayA9IGh5cGVyY2xpY2s7XG5cbiAgICB0aGlzLl9sYXN0TW91c2VFdmVudCA9IG51bGw7XG4gICAgdGhpcy5fbGFzdFBvc2l0aW9uID0gbnVsbDtcbiAgICAvLyBXZSBzdG9yZSB0aGUgb3JpZ2luYWwgcHJvbWlzZSB0aGF0IHdlIHVzZSB0byByZXRyaWV2ZSB0aGUgbGFzdCBzdWdnZXN0aW9uXG4gICAgLy8gc28gY2FsbGVycyBjYW4gYWxzbyBhd2FpdCBpdCB0byBrbm93IHdoZW4gaXQncyBhdmFpbGFibGUuXG4gICAgdGhpcy5fbGFzdFN1Z2dlc3Rpb25BdE1vdXNlUHJvbWlzZSA9IG51bGw7XG4gICAgLy8gV2Ugc3RvcmUgdGhlIGxhc3Qgc3VnZ2VzdGlvbiBzaW5jZSB3ZSBtdXN0IGF3YWl0IGl0IGltbWVkaWF0ZWx5IGFueXdheS5cbiAgICB0aGlzLl9sYXN0U3VnZ2VzdGlvbkF0TW91c2UgPSBudWxsO1xuICAgIHRoaXMuX25hdmlnYXRpb25NYXJrZXJzID0gbnVsbDtcblxuICAgIHRoaXMuX2xhc3RXb3JkUmFuZ2UgPSBudWxsO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuXG4gICAgdGhpcy5fb25Nb3VzZU1vdmUgPSB0aGlzLl9vbk1vdXNlTW92ZS5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX3RleHRFZGl0b3JWaWV3LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMuX29uTW91c2VNb3ZlKTtcbiAgICB0aGlzLl9vbk1vdXNlRG93biA9IHRoaXMuX29uTW91c2VEb3duLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fc2V0dXBNb3VzZURvd25MaXN0ZW5lcigpO1xuXG4gICAgdGhpcy5fb25LZXlEb3duID0gdGhpcy5fb25LZXlEb3duLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fdGV4dEVkaXRvclZpZXcuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuX29uS2V5RG93bik7XG4gICAgdGhpcy5fb25LZXlVcCA9IHRoaXMuX29uS2V5VXAuYmluZCh0aGlzKTtcbiAgICB0aGlzLl90ZXh0RWRpdG9yVmlldy5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIHRoaXMuX29uS2V5VXApO1xuXG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb21tYW5kcy5hZGQodGhpcy5fdGV4dEVkaXRvclZpZXcsIHtcbiAgICAgICdoeXBlcmNsaWNrOmNvbmZpcm0tY3Vyc29yJzogKCkgPT4gdGhpcy5fY29uZmlybVN1Z2dlc3Rpb25BdEN1cnNvcigpLFxuICAgIH0pKTtcblxuICAgIHRoaXMuX2lzRGVzdHJveWVkID0gZmFsc2U7XG4gICAgdGhpcy5fbG9hZGluZ1RyYWNrZXIgPSBudWxsO1xuICB9XG5cbiAgX3NldHVwTW91c2VEb3duTGlzdGVuZXIoKTogdm9pZCB7XG4gICAgY29uc3QgZ2V0TGluZXNEb21Ob2RlID0gKCk6IEhUTUxFbGVtZW50ID0+IHtcbiAgICAgIGNvbnN0IHtjb21wb25lbnR9ID0gdGhpcy5fdGV4dEVkaXRvclZpZXc7XG4gICAgICBpbnZhcmlhbnQoY29tcG9uZW50KTtcbiAgICAgIHJldHVybiBjb21wb25lbnQubGluZXNDb21wb25lbnQuZ2V0RG9tTm9kZSgpO1xuICAgIH07XG4gICAgY29uc3QgcmVtb3ZlTW91c2VEb3duTGlzdGVuZXIgPSAoKSA9PiB7XG4gICAgICBpZiAodGhpcy5fdGV4dEVkaXRvclZpZXcuY29tcG9uZW50ID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgLy8gJEZsb3dGaXhNZSAobW9zdClcbiAgICAgIGdldExpbmVzRG9tTm9kZSgpLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMuX29uTW91c2VEb3duKTtcbiAgICB9O1xuICAgIGNvbnN0IGFkZE1vdXNlRG93bkxpc3RlbmVyID0gKCkgPT4ge1xuICAgICAgZ2V0TGluZXNEb21Ob2RlKCkuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcy5fb25Nb3VzZURvd24pO1xuICAgIH07XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQobmV3IERpc3Bvc2FibGUocmVtb3ZlTW91c2VEb3duTGlzdGVuZXIpKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZCh0aGlzLl90ZXh0RWRpdG9yVmlldy5vbkRpZERldGFjaChyZW1vdmVNb3VzZURvd25MaXN0ZW5lcikpO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKHRoaXMuX3RleHRFZGl0b3JWaWV3Lm9uRGlkQXR0YWNoKGFkZE1vdXNlRG93bkxpc3RlbmVyKSk7XG4gICAgYWRkTW91c2VEb3duTGlzdGVuZXIoKTtcbiAgfVxuXG4gIF9jb25maXJtU3VnZ2VzdGlvbihzdWdnZXN0aW9uOiBIeXBlcmNsaWNrU3VnZ2VzdGlvbik6IHZvaWQge1xuICAgIGlmIChBcnJheS5pc0FycmF5KHN1Z2dlc3Rpb24uY2FsbGJhY2spICYmIHN1Z2dlc3Rpb24uY2FsbGJhY2subGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5faHlwZXJjbGljay5zaG93U3VnZ2VzdGlvbkxpc3QodGhpcy5fdGV4dEVkaXRvciwgc3VnZ2VzdGlvbik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGludmFyaWFudCh0eXBlb2Ygc3VnZ2VzdGlvbi5jYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJyk7XG4gICAgICBzdWdnZXN0aW9uLmNhbGxiYWNrKCk7XG4gICAgfVxuICB9XG5cbiAgX29uTW91c2VNb3ZlKGV2ZW50OiBNb3VzZUV2ZW50KTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2lzTG9hZGluZygpKSB7XG4gICAgICAvLyBTaG93IHRoZSBsb2FkaW5nIGN1cnNvci5cbiAgICAgIHRoaXMuX3RleHRFZGl0b3JWaWV3LmNsYXNzTGlzdC5hZGQoJ2h5cGVyY2xpY2stbG9hZGluZycpO1xuICAgIH1cblxuICAgIC8vIFdlIHNhdmUgdGhlIGxhc3QgYE1vdXNlRXZlbnRgIHNvIHRoZSB1c2VyIGNhbiB0cmlnZ2VyIEh5cGVyY2xpY2sgYnlcbiAgICAvLyBwcmVzc2luZyB0aGUga2V5IHdpdGhvdXQgbW92aW5nIHRoZSBtb3VzZSBhZ2Fpbi4gV2Ugb25seSBzYXZlIHRoZVxuICAgIC8vIHJlbGV2YW50IHByb3BlcnRpZXMgdG8gcHJldmVudCByZXRhaW5pbmcgYSByZWZlcmVuY2UgdG8gdGhlIGV2ZW50LlxuICAgIHRoaXMuX2xhc3RNb3VzZUV2ZW50ID0gKHtcbiAgICAgIGNsaWVudFg6IGV2ZW50LmNsaWVudFgsXG4gICAgICBjbGllbnRZOiBldmVudC5jbGllbnRZLFxuICAgIH06IGFueSk7XG5cblxuICAgIC8vIERvbid0IGZldGNoIHN1Z2dlc3Rpb25zIGlmIHRoZSBtb3VzZSBpcyBzdGlsbCBpbiB0aGUgc2FtZSAnd29yZCcsIHdoZXJlXG4gICAgLy8gJ3dvcmQnIGlzIGEgd2hpdGVzcGFjZS1kZWxpbWl0ZWQgZ3JvdXAgb2YgY2hhcmFjdGVycy5cbiAgICAvL1xuICAgIC8vIElmIHRoZSBsYXN0IHN1Z2dlc3Rpb24gaGFkIG11bHRpcGxlIHJhbmdlcywgd2UgaGF2ZSBubyBjaG9pY2UgYnV0IHRvXG4gICAgLy8gZmV0Y2ggc3VnZ2VzdGlvbnMgYmVjYXVzZSB0aGUgbmV3IHdvcmQgbWlnaHQgYmUgYmV0d2VlbiB0aG9zZSByYW5nZXMuXG4gICAgLy8gVGhpcyBzaG91bGQgYmUgb2sgYmVjYXVzZSBpdCB3aWxsIHJldXNlIHRoYXQgbGFzdCBzdWdnZXN0aW9uIHVudGlsIHRoZVxuICAgIC8vIG1vdXNlIG1vdmVzIG9mZiBvZiBpdC5cbiAgICBjb25zdCBsYXN0U3VnZ2VzdGlvbklzTm90TXVsdGlSYW5nZSA9ICF0aGlzLl9sYXN0U3VnZ2VzdGlvbkF0TW91c2UgfHxcbiAgICAgICAgIUFycmF5LmlzQXJyYXkodGhpcy5fbGFzdFN1Z2dlc3Rpb25BdE1vdXNlLnJhbmdlKTtcbiAgICBpZiAodGhpcy5faXNNb3VzZUF0TGFzdFdvcmRSYW5nZSgpICYmIGxhc3RTdWdnZXN0aW9uSXNOb3RNdWx0aVJhbmdlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHtyYW5nZX0gPSBnZXRXb3JkVGV4dEFuZFJhbmdlKHRoaXMuX3RleHRFZGl0b3IsIHRoaXMuX2dldE1vdXNlUG9zaXRpb25Bc0J1ZmZlclBvc2l0aW9uKCkpO1xuICAgIHRoaXMuX2xhc3RXb3JkUmFuZ2UgPSByYW5nZTtcblxuICAgIGlmICh0aGlzLl9pc0h5cGVyY2xpY2tFdmVudChldmVudCkpIHtcbiAgICAgIC8vIENsZWFyIHRoZSBzdWdnZXN0aW9uIGlmIHRoZSBtb3VzZSBtb3ZlZCBvdXQgb2YgdGhlIHJhbmdlLlxuICAgICAgaWYgKCF0aGlzLl9pc01vdXNlQXRMYXN0U3VnZ2VzdGlvbigpKSB7XG4gICAgICAgIHRoaXMuX2NsZWFyU3VnZ2VzdGlvbigpO1xuICAgICAgfVxuICAgICAgdGhpcy5fc2V0U3VnZ2VzdGlvbkZvckxhc3RNb3VzZUV2ZW50KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2NsZWFyU3VnZ2VzdGlvbigpO1xuICAgIH1cbiAgfVxuXG4gIF9vbk1vdXNlRG93bihldmVudDogTW91c2VFdmVudCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5faXNIeXBlcmNsaWNrRXZlbnQoZXZlbnQpIHx8ICF0aGlzLl9pc01vdXNlQXRMYXN0U3VnZ2VzdGlvbigpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2xhc3RTdWdnZXN0aW9uQXRNb3VzZSkge1xuICAgICAgdGhpcy5fY29uZmlybVN1Z2dlc3Rpb24odGhpcy5fbGFzdFN1Z2dlc3Rpb25BdE1vdXNlKTtcbiAgICAgIC8vIFByZXZlbnQgdGhlIDxtZXRhLWNsaWNrPiBldmVudCBmcm9tIGFkZGluZyBhbm90aGVyIGN1cnNvci5cbiAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIH1cblxuICAgIHRoaXMuX2NsZWFyU3VnZ2VzdGlvbigpO1xuICB9XG5cbiAgX29uS2V5RG93bihldmVudDogU3ludGhldGljS2V5Ym9hcmRFdmVudCk6IHZvaWQge1xuICAgIC8vIFNob3cgdGhlIHN1Z2dlc3Rpb24gYXQgdGhlIGxhc3Qga25vd24gbW91c2UgcG9zaXRpb24uXG4gICAgaWYgKHRoaXMuX2lzSHlwZXJjbGlja0V2ZW50KGV2ZW50KSkge1xuICAgICAgdGhpcy5fc2V0U3VnZ2VzdGlvbkZvckxhc3RNb3VzZUV2ZW50KCk7XG4gICAgfVxuICB9XG5cbiAgX29uS2V5VXAoZXZlbnQ6IFN5bnRoZXRpY0tleWJvYXJkRXZlbnQpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuX2lzSHlwZXJjbGlja0V2ZW50KGV2ZW50KSkge1xuICAgICAgdGhpcy5fY2xlYXJTdWdnZXN0aW9uKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBgUHJvbWlzZWAgdGhhdCdzIHJlc29sdmVkIHdoZW4gdGhlIGxhdGVzdCBzdWdnZXN0aW9uJ3MgYXZhaWxhYmxlLlxuICAgKi9cbiAgZ2V0U3VnZ2VzdGlvbkF0TW91c2UoKTogUHJvbWlzZTw/SHlwZXJjbGlja1N1Z2dlc3Rpb24+IHtcbiAgICByZXR1cm4gdGhpcy5fbGFzdFN1Z2dlc3Rpb25BdE1vdXNlUHJvbWlzZSB8fCBQcm9taXNlLnJlc29sdmUobnVsbCk7XG4gIH1cblxuICBhc3luYyBfc2V0U3VnZ2VzdGlvbkZvckxhc3RNb3VzZUV2ZW50KCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICghdGhpcy5fbGFzdE1vdXNlRXZlbnQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBwb3NpdGlvbiA9IHRoaXMuX2dldE1vdXNlUG9zaXRpb25Bc0J1ZmZlclBvc2l0aW9uKCk7XG5cbiAgICBpZiAodGhpcy5fbGFzdFN1Z2dlc3Rpb25BdE1vdXNlICE9IG51bGwpIHtcbiAgICAgIGNvbnN0IHtyYW5nZX0gPSB0aGlzLl9sYXN0U3VnZ2VzdGlvbkF0TW91c2U7XG4gICAgICBpbnZhcmlhbnQocmFuZ2UsICdIeXBlcmNsaWNrIHJlc3VsdCBtdXN0IGhhdmUgYSB2YWxpZCBSYW5nZScpO1xuICAgICAgaWYgKHRoaXMuX2lzUG9zaXRpb25JblJhbmdlKHBvc2l0aW9uLCByYW5nZSkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cbiAgICAvLyB0aGlzLl9sYXN0U3VnZ2VzdGlvbkF0TW91c2Ugd2lsbCBvbmx5IGJlIHNldCBpZiBoeXBlcmNsaWNrIHJldHVybmVkIGEgcHJvbWlzZSB0aGF0XG4gICAgLy8gcmVzb2x2ZWQgdG8gYSBub24tbnVsbCB2YWx1ZS4gU28sIGluIG9yZGVyIHRvIG5vdCBhc2sgaHlwZXJjbGljayBmb3IgdGhlIHNhbWUgdGhpbmdcbiAgICAvLyBhZ2FpbiBhbmQgYWdhaW4gd2hpY2ggd2lsbCBiZSBhbnl3YXkgbnVsbCwgd2UgY2hlY2sgaWYgdGhlIG1vdXNlIHBvc2l0aW9uIGhhcyBjaGFuZ2VkLlxuICAgIGlmICh0aGlzLl9sYXN0UG9zaXRpb24gJiYgcG9zaXRpb24uY29tcGFyZSh0aGlzLl9sYXN0UG9zaXRpb24pID09PSAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5fbG9hZGluZ1RyYWNrZXIgPSBzdGFydFRyYWNraW5nKCdoeXBlcmNsaWNrLWxvYWRpbmcnKTtcblxuICAgIHRyeSB7XG4gICAgICB0aGlzLl9sYXN0UG9zaXRpb24gPSBwb3NpdGlvbjtcbiAgICAgIHRoaXMuX2xhc3RTdWdnZXN0aW9uQXRNb3VzZVByb21pc2UgPVxuICAgICAgICAgIHRoaXMuX2h5cGVyY2xpY2suZ2V0U3VnZ2VzdGlvbih0aGlzLl90ZXh0RWRpdG9yLCBwb3NpdGlvbik7XG4gICAgICB0aGlzLl9sYXN0U3VnZ2VzdGlvbkF0TW91c2UgPSBhd2FpdCB0aGlzLl9sYXN0U3VnZ2VzdGlvbkF0TW91c2VQcm9taXNlO1xuICAgICAgaWYgKHRoaXMuX2lzRGVzdHJveWVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLl9sYXN0U3VnZ2VzdGlvbkF0TW91c2UgJiYgdGhpcy5faXNNb3VzZUF0TGFzdFN1Z2dlc3Rpb24oKSkge1xuICAgICAgICAvLyBBZGQgdGhlIGh5cGVyY2xpY2sgbWFya2VycyBpZiB0aGVyZSdzIGEgbmV3IHN1Z2dlc3Rpb24gYW5kIGl0J3MgdW5kZXIgdGhlIG1vdXNlLlxuICAgICAgICB0aGlzLl91cGRhdGVOYXZpZ2F0aW9uTWFya2Vycyh0aGlzLl9sYXN0U3VnZ2VzdGlvbkF0TW91c2UucmFuZ2UpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gUmVtb3ZlIGFsbCB0aGUgbWFya2VycyBpZiB3ZSd2ZSBmaW5pc2hlZCBsb2FkaW5nIGFuZCB0aGVyZSdzIG5vIHN1Z2dlc3Rpb24uXG4gICAgICAgIHRoaXMuX3VwZGF0ZU5hdmlnYXRpb25NYXJrZXJzKG51bGwpO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuX2xvYWRpbmdUcmFja2VyICE9IG51bGwpIHtcbiAgICAgICAgdGhpcy5fbG9hZGluZ1RyYWNrZXIub25TdWNjZXNzKCk7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgaWYgKHRoaXMuX2xvYWRpbmdUcmFja2VyICE9IG51bGwpIHtcbiAgICAgICAgdGhpcy5fbG9hZGluZ1RyYWNrZXIub25FcnJvcihlKTtcbiAgICAgIH1cbiAgICAgIGxvZ2dlci5lcnJvcignRXJyb3IgZ2V0dGluZyBIeXBlcmNsaWNrIHN1Z2dlc3Rpb246JywgZSk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRoaXMuX2RvbmVMb2FkaW5nKCk7XG4gICAgfVxuICB9XG5cbiAgX2dldE1vdXNlUG9zaXRpb25Bc0J1ZmZlclBvc2l0aW9uKCk6IGF0b20kUG9pbnQge1xuICAgIGNvbnN0IHtjb21wb25lbnR9ID0gdGhpcy5fdGV4dEVkaXRvclZpZXc7XG4gICAgaW52YXJpYW50KGNvbXBvbmVudCk7XG4gICAgaW52YXJpYW50KHRoaXMuX2xhc3RNb3VzZUV2ZW50KTtcbiAgICBjb25zdCBzY3JlZW5Qb3NpdGlvbiA9IGNvbXBvbmVudC5zY3JlZW5Qb3NpdGlvbkZvck1vdXNlRXZlbnQodGhpcy5fbGFzdE1vdXNlRXZlbnQpO1xuICAgIHJldHVybiB0aGlzLl90ZXh0RWRpdG9yLmJ1ZmZlclBvc2l0aW9uRm9yU2NyZWVuUG9zaXRpb24oc2NyZWVuUG9zaXRpb24pO1xuICB9XG5cbiAgX2lzTW91c2VBdExhc3RTdWdnZXN0aW9uKCk6IGJvb2xlYW4ge1xuICAgIGlmICghdGhpcy5fbGFzdFN1Z2dlc3Rpb25BdE1vdXNlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGNvbnN0IHtyYW5nZX0gPSB0aGlzLl9sYXN0U3VnZ2VzdGlvbkF0TW91c2U7XG4gICAgaW52YXJpYW50KHJhbmdlLCAnSHlwZXJjbGljayByZXN1bHQgbXVzdCBoYXZlIGEgdmFsaWQgUmFuZ2UnKTtcbiAgICByZXR1cm4gdGhpcy5faXNQb3NpdGlvbkluUmFuZ2UodGhpcy5fZ2V0TW91c2VQb3NpdGlvbkFzQnVmZmVyUG9zaXRpb24oKSwgcmFuZ2UpO1xuICB9XG5cbiAgX2lzTW91c2VBdExhc3RXb3JkUmFuZ2UoKTogYm9vbGVhbiB7XG4gICAgY29uc3QgbGFzdFdvcmRSYW5nZSA9IHRoaXMuX2xhc3RXb3JkUmFuZ2U7XG4gICAgaWYgKGxhc3RXb3JkUmFuZ2UgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5faXNQb3NpdGlvbkluUmFuZ2UodGhpcy5fZ2V0TW91c2VQb3NpdGlvbkFzQnVmZmVyUG9zaXRpb24oKSwgbGFzdFdvcmRSYW5nZSk7XG4gIH1cblxuICBfaXNQb3NpdGlvbkluUmFuZ2UocG9zaXRpb246IGF0b20kUG9pbnQsIHJhbmdlOiBhdG9tJFJhbmdlIHwgQXJyYXk8YXRvbSRSYW5nZT4pOiBib29sZWFuIHtcbiAgICByZXR1cm4gKEFycmF5LmlzQXJyYXkocmFuZ2UpXG4gICAgICAgID8gcmFuZ2Uuc29tZShyID0+IHIuY29udGFpbnNQb2ludChwb3NpdGlvbikpXG4gICAgICAgIDogcmFuZ2UuY29udGFpbnNQb2ludChwb3NpdGlvbikpO1xuICB9XG5cbiAgX2NsZWFyU3VnZ2VzdGlvbigpOiB2b2lkIHtcbiAgICB0aGlzLl9kb25lTG9hZGluZygpO1xuICAgIHRoaXMuX2xhc3RTdWdnZXN0aW9uQXRNb3VzZVByb21pc2UgPSBudWxsO1xuICAgIHRoaXMuX2xhc3RTdWdnZXN0aW9uQXRNb3VzZSA9IG51bGw7XG4gICAgdGhpcy5fdXBkYXRlTmF2aWdhdGlvbk1hcmtlcnMobnVsbCk7XG4gIH1cblxuICBAdHJhY2tUaW1pbmcoJ2h5cGVyY2xpY2s6Y29uZmlybS1jdXJzb3InKVxuICBhc3luYyBfY29uZmlybVN1Z2dlc3Rpb25BdEN1cnNvcigpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBzdWdnZXN0aW9uID0gYXdhaXQgdGhpcy5faHlwZXJjbGljay5nZXRTdWdnZXN0aW9uKFxuICAgICAgICB0aGlzLl90ZXh0RWRpdG9yLFxuICAgICAgICB0aGlzLl90ZXh0RWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpO1xuICAgIGlmIChzdWdnZXN0aW9uKSB7XG4gICAgICB0aGlzLl9jb25maXJtU3VnZ2VzdGlvbihzdWdnZXN0aW9uKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQWRkIG1hcmtlcnMgZm9yIHRoZSBnaXZlbiByYW5nZShzKSwgb3IgY2xlYXJzIHRoZW0gaWYgYHJhbmdlc2AgaXMgbnVsbC5cbiAgICovXG4gIF91cGRhdGVOYXZpZ2F0aW9uTWFya2VycyhyYW5nZTogPyAoYXRvbSRSYW5nZSB8IEFycmF5PGF0b20kUmFuZ2U+KSk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9uYXZpZ2F0aW9uTWFya2Vycykge1xuICAgICAgdGhpcy5fbmF2aWdhdGlvbk1hcmtlcnMuZm9yRWFjaChtYXJrZXIgPT4gbWFya2VyLmRlc3Ryb3koKSk7XG4gICAgICB0aGlzLl9uYXZpZ2F0aW9uTWFya2VycyA9IG51bGw7XG4gICAgfVxuXG4gICAgLy8gT25seSBjaGFuZ2UgdGhlIGN1cnNvciB0byBhIHBvaW50ZXIgaWYgdGhlcmUgaXMgYSBzdWdnZXN0aW9uIHJlYWR5LlxuICAgIGlmIChyYW5nZSA9PSBudWxsKSB7XG4gICAgICB0aGlzLl90ZXh0RWRpdG9yVmlldy5jbGFzc0xpc3QucmVtb3ZlKCdoeXBlcmNsaWNrJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5fdGV4dEVkaXRvclZpZXcuY2xhc3NMaXN0LmFkZCgnaHlwZXJjbGljaycpO1xuICAgIGNvbnN0IHJhbmdlcyA9IEFycmF5LmlzQXJyYXkocmFuZ2UpID8gcmFuZ2UgOiBbcmFuZ2VdO1xuICAgIHRoaXMuX25hdmlnYXRpb25NYXJrZXJzID0gcmFuZ2VzLm1hcChtYXJrZXJSYW5nZSA9PiB7XG4gICAgICBjb25zdCBtYXJrZXIgPSB0aGlzLl90ZXh0RWRpdG9yLm1hcmtCdWZmZXJSYW5nZShtYXJrZXJSYW5nZSwge2ludmFsaWRhdGU6ICduZXZlcid9KTtcbiAgICAgIHRoaXMuX3RleHRFZGl0b3IuZGVjb3JhdGVNYXJrZXIoXG4gICAgICAgIG1hcmtlcixcbiAgICAgICAge3R5cGU6ICdoaWdobGlnaHQnLCBjbGFzczogJ2h5cGVyY2xpY2snfSxcbiAgICAgICk7XG4gICAgICByZXR1cm4gbWFya2VyO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgd2hldGhlciBhbiBldmVudCBzaG91bGQgYmUgaGFuZGxlZCBieSBoeXBlcmNsaWNrIG9yIG5vdC5cbiAgICovXG4gIF9pc0h5cGVyY2xpY2tFdmVudChldmVudDogU3ludGhldGljS2V5Ym9hcmRFdmVudCB8IE1vdXNlRXZlbnQpOiBib29sZWFuIHtcbiAgICAvLyBJZiB0aGUgdXNlciBpcyBwcmVzc2luZyBlaXRoZXIgdGhlIG1ldGEvY3RybCBrZXkgb3IgdGhlIGFsdCBrZXkuXG4gICAgcmV0dXJuIHByb2Nlc3MucGxhdGZvcm0gPT09ICdkYXJ3aW4nID8gZXZlbnQubWV0YUtleSA6IGV2ZW50LmN0cmxLZXk7XG4gIH1cblxuICBfaXNMb2FkaW5nKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9sb2FkaW5nVHJhY2tlciAhPSBudWxsO1xuICB9XG5cbiAgX2RvbmVMb2FkaW5nKCk6IHZvaWQge1xuICAgIHRoaXMuX2xvYWRpbmdUcmFja2VyID0gbnVsbDtcbiAgICB0aGlzLl90ZXh0RWRpdG9yVmlldy5jbGFzc0xpc3QucmVtb3ZlKCdoeXBlcmNsaWNrLWxvYWRpbmcnKTtcbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5faXNEZXN0cm95ZWQgPSB0cnVlO1xuICAgIHRoaXMuX2NsZWFyU3VnZ2VzdGlvbigpO1xuICAgIC8vICRGbG93Rml4TWUgKG1vc3QpXG4gICAgdGhpcy5fdGV4dEVkaXRvclZpZXcucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgdGhpcy5fb25Nb3VzZU1vdmUpO1xuICAgIC8vICRGbG93Rml4TWUgKG1vc3QpXG4gICAgdGhpcy5fdGV4dEVkaXRvclZpZXcucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuX29uS2V5RG93bik7XG4gICAgLy8gJEZsb3dGaXhNZSAobW9zdClcbiAgICB0aGlzLl90ZXh0RWRpdG9yVmlldy5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXl1cCcsIHRoaXMuX29uS2V5VXApO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICB9XG59XG4iXX0=