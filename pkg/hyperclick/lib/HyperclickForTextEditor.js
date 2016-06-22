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

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _hyperclickUtils2;

function _hyperclickUtils() {
  return _hyperclickUtils2 = require('./hyperclick-utils');
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../nuclide-analytics');
}

var _nuclideLogging2;

function _nuclideLogging() {
  return _nuclideLogging2 = require('../../nuclide-logging');
}

var logger = (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)();

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
    this._subscriptions = new (_atom2 || _atom()).CompositeDisposable();

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
    this._isLoading = false;
    this._loadingTracker = null;
  }

  _createDecoratedClass(HyperclickForTextEditor, [{
    key: '_setupMouseDownListener',
    value: function _setupMouseDownListener() {
      var _this2 = this;

      var getLinesDomNode = function getLinesDomNode() {
        var component = _this2._textEditorView.component;

        (0, (_assert2 || _assert()).default)(component);
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
      this._subscriptions.add(new (_atom2 || _atom()).Disposable(removeMouseDownListener));
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
        (0, (_assert2 || _assert()).default)(typeof suggestion.callback === 'function');
        suggestion.callback();
      }
    }
  }, {
    key: '_onMouseMove',
    value: function _onMouseMove(event) {
      if (this._isLoading) {
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

      var _ref = (0, (_hyperclickUtils2 || _hyperclickUtils()).getWordTextAndRange)(this._textEditor, this._getMousePositionAsBufferPosition());

      var range = _ref.range;

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

        (0, (_assert2 || _assert()).default)(range, 'Hyperclick result must have a valid Range');
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

      this._isLoading = true;
      this._loadingTracker = (0, (_nuclideAnalytics2 || _nuclideAnalytics()).startTracking)('hyperclick-loading');

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

      (0, (_assert2 || _assert()).default)(component);
      (0, (_assert2 || _assert()).default)(this._lastMouseEvent);
      var screenPosition = component.screenPositionForMouseEvent(this._lastMouseEvent);
      try {
        return this._textEditor.bufferPositionForScreenPosition(screenPosition);
      } catch (error) {
        // Fix https://github.com/facebook/nuclide/issues/292
        // When navigating Atom workspace with `CMD/CTRL` down,
        // it triggers TextEditorElement's `mousemove` with invalid screen position.
        // This falls back to returning the start of the editor.
        logger.error('Hyperclick: Error getting buffer position for screen position:', error);
        return new (_atom2 || _atom()).Point(0, 0);
      }
    }
  }, {
    key: '_isMouseAtLastSuggestion',
    value: function _isMouseAtLastSuggestion() {
      if (!this._lastSuggestionAtMouse) {
        return false;
      }
      var range = this._lastSuggestionAtMouse.range;

      (0, (_assert2 || _assert()).default)(range, 'Hyperclick result must have a valid Range');
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
    decorators: [(0, (_nuclideAnalytics2 || _nuclideAnalytics()).trackTiming)('hyperclick:confirm-cursor')],
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
    key: '_doneLoading',
    value: function _doneLoading() {
      this._isLoading = false;
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

exports.default = HyperclickForTextEditor;
module.exports = exports.default;