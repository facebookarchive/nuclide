'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _atom = require('atom');

var _hyperclickUtils;

function _load_hyperclickUtils() {
  return _hyperclickUtils = require('./hyperclick-utils');
}

var _showTriggerConflictWarning;

function _load_showTriggerConflictWarning() {
  return _showTriggerConflictWarning = _interopRequireDefault(require('./showTriggerConflictWarning'));
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
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

/* global localStorage */

const logger = (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)();

const WARN_ABOUT_TRIGGER_CONFLICT_KEY = 'hyperclick.warnAboutTriggerConflict';

/**
 * Construct this object to enable Hyperclick in a text editor.
 * Call `dispose` to disable the feature.
 */
class HyperclickForTextEditor {

  constructor(textEditor, hyperclick) {
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
    this._onMouseDown = this._onMouseDown.bind(this);
    this._setupMouseListeners();

    this._onKeyDown = this._onKeyDown.bind(this);
    this._textEditorView.addEventListener('keydown', this._onKeyDown);
    this._onKeyUp = this._onKeyUp.bind(this);
    this._textEditorView.addEventListener('keyup', this._onKeyUp);
    this._onContextMenu = this._onContextMenu.bind(this);
    this._textEditorView.addEventListener('contextmenu', this._onContextMenu);

    this._subscriptions.add(atom.commands.add(this._textEditorView, {
      'hyperclick:confirm-cursor': () => this._confirmSuggestionAtCursor()
    }));

    this._isDestroyed = false;
    this._isLoading = false;
    this._loadingTracker = null;

    this._subscriptions.add(atom.config.observe(process.platform === 'darwin' ? 'nuclide.hyperclick.darwinTriggerKeys' : process.platform === 'win32' ? 'nuclide.hyperclick.win32TriggerKeys' : 'nuclide.hyperclick.linuxTriggerKeys', newValue => {
      // For all Flow knows, newValue.split could return any old strings
      this._triggerKeys = new Set(newValue.split(','));
    }));
  }

  _setupMouseListeners() {
    const getLinesDomNode = () => {
      const { component } = this._textEditorView;

      if (!component) {
        throw new Error('Invariant violation: "component"');
      }

      return component.linesComponent.getDomNode();
    };
    const removeMouseListeners = () => {
      if (this._textEditorView.component == null) {
        return;
      }
      getLinesDomNode().removeEventListener('mousedown', this._onMouseDown);
      getLinesDomNode().removeEventListener('mousemove', this._onMouseMove);
    };
    const addMouseListeners = () => {
      getLinesDomNode().addEventListener('mousedown', this._onMouseDown);
      getLinesDomNode().addEventListener('mousemove', this._onMouseMove);
    };
    this._subscriptions.add(new _atom.Disposable(removeMouseListeners));
    this._subscriptions.add(this._textEditorView.onDidDetach(removeMouseListeners));
    this._subscriptions.add(this._textEditorView.onDidAttach(addMouseListeners));
    addMouseListeners();
  }

  _confirmSuggestion(suggestion) {
    if (Array.isArray(suggestion.callback) && suggestion.callback.length > 0) {
      this._hyperclick.showSuggestionList(this._textEditor, suggestion);
    } else {
      if (!(typeof suggestion.callback === 'function')) {
        throw new Error('Invariant violation: "typeof suggestion.callback === \'function\'"');
      }

      suggestion.callback();
    }
  }

  _onContextMenu(event) {
    const mouseEvent = event;
    // If the key trigger happens to cause the context menu to show up, then
    // cancel it. By this point, it's too late to know if you're at a suggestion
    // position to be more fine grained. So if your trigger keys are "ctrl+cmd",
    // then you can't use that combination to bring up the context menu.
    if (this._isHyperclickEvent(mouseEvent)) {
      event.stopPropagation();
    }
  }

  _onMouseMove(event) {
    const mouseEvent = event;
    if (this._isLoading) {
      // Show the loading cursor.
      this._textEditorView.classList.add('hyperclick-loading');
    }

    // We save the last `MouseEvent` so the user can trigger Hyperclick by
    // pressing the key without moving the mouse again. We only save the
    // relevant properties to prevent retaining a reference to the event.
    this._lastMouseEvent = {
      clientX: mouseEvent.clientX,
      clientY: mouseEvent.clientY
    };

    // Don't fetch suggestions if the mouse is still in the same 'word', where
    // 'word' is a whitespace-delimited group of characters.
    //
    // If the last suggestion had multiple ranges, we have no choice but to
    // fetch suggestions because the new word might be between those ranges.
    // This should be ok because it will reuse that last suggestion until the
    // mouse moves off of it.
    const lastSuggestionIsNotMultiRange = !this._lastSuggestionAtMouse || !Array.isArray(this._lastSuggestionAtMouse.range);
    if (this._isMouseAtLastWordRange() && lastSuggestionIsNotMultiRange) {
      return;
    }
    const { range } = (0, (_hyperclickUtils || _load_hyperclickUtils()).getWordTextAndRange)(this._textEditor, this._getMousePositionAsBufferPosition());
    this._lastWordRange = range;

    if (this._isHyperclickEvent(mouseEvent)) {
      // Clear the suggestion if the mouse moved out of the range.
      if (!this._isMouseAtLastSuggestion()) {
        this._clearSuggestion();
      }
      this._setSuggestionForLastMouseEvent();
    } else {
      this._clearSuggestion();
    }
  }

  _onMouseDown(event) {
    const mouseEvent = event;
    const isHyperclickEvent = this._isHyperclickEvent(mouseEvent);

    // If hyperclick and multicursor are using the same trigger, prevent multicursor.
    if (isHyperclickEvent && isMulticursorEvent(mouseEvent)) {
      mouseEvent.stopPropagation();
      if (localStorage.getItem(WARN_ABOUT_TRIGGER_CONFLICT_KEY) !== 'false') {
        localStorage.setItem(WARN_ABOUT_TRIGGER_CONFLICT_KEY, 'false');
        (0, (_showTriggerConflictWarning || _load_showTriggerConflictWarning()).default)();
      }
    }

    if (!isHyperclickEvent || !this._isMouseAtLastSuggestion()) {
      return;
    }

    if (this._lastSuggestionAtMouse) {
      const lastSuggestionAtMouse = this._lastSuggestionAtMouse;
      // Move the cursor to the click location to force a navigation-stack push.
      const newCursorPosition = this._getMousePositionAsBufferPosition();
      this._textEditor.setCursorBufferPosition(newCursorPosition);

      this._confirmSuggestion(lastSuggestionAtMouse);
      // Prevent the <meta-click> event from adding another cursor.
      event.stopPropagation();
    }

    this._clearSuggestion();
  }

  _onKeyDown(event) {
    const mouseEvent = event;
    // Show the suggestion at the last known mouse position.
    if (this._isHyperclickEvent(mouseEvent)) {
      this._setSuggestionForLastMouseEvent();
    }
  }

  _onKeyUp(event) {
    const mouseEvent = event;
    if (!this._isHyperclickEvent(mouseEvent)) {
      this._clearSuggestion();
    }
  }

  /**
   * Returns a `Promise` that's resolved when the latest suggestion's available.
   */
  getSuggestionAtMouse() {
    return this._lastSuggestionAtMousePromise || Promise.resolve(null);
  }

  _setSuggestionForLastMouseEvent() {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (!_this._lastMouseEvent) {
        return;
      }

      const position = _this._getMousePositionAsBufferPosition();

      if (_this._lastSuggestionAtMouse != null) {
        const { range } = _this._lastSuggestionAtMouse;

        if (!range) {
          throw new Error('Hyperclick result must have a valid Range');
        }

        if (_this._isPositionInRange(position, range)) {
          return;
        }
      }
      // this._lastSuggestionAtMouse will only be set if hyperclick returned a promise that
      // resolved to a non-null value. So, in order to not ask hyperclick for the same thing
      // again and again which will be anyway null, we check if the mouse position has changed.
      if (_this._lastPosition && position.compare(_this._lastPosition) === 0) {
        return;
      }

      _this._isLoading = true;
      _this._loadingTracker = (0, (_nuclideAnalytics || _load_nuclideAnalytics()).startTracking)('hyperclick-loading');

      try {
        _this._lastPosition = position;
        _this._lastSuggestionAtMousePromise = _this._hyperclick.getSuggestion(_this._textEditor, position);
        _this._lastSuggestionAtMouse = yield _this._lastSuggestionAtMousePromise;
        if (_this._isDestroyed) {
          return;
        }
        if (_this._lastSuggestionAtMouse && _this._isMouseAtLastSuggestion()) {
          // Add the hyperclick markers if there's a new suggestion and it's under the mouse.
          _this._updateNavigationMarkers(_this._lastSuggestionAtMouse.range);
        } else {
          // Remove all the markers if we've finished loading and there's no suggestion.
          _this._updateNavigationMarkers(null);
        }
        if (_this._loadingTracker != null) {
          _this._loadingTracker.onSuccess();
        }
      } catch (e) {
        if (_this._loadingTracker != null) {
          _this._loadingTracker.onError(e);
        }
        logger.error('Error getting Hyperclick suggestion:', e);
      } finally {
        _this._doneLoading();
      }
    })();
  }

  _getMousePositionAsBufferPosition() {
    const { component } = this._textEditorView;

    if (!component) {
      throw new Error('Invariant violation: "component"');
    }

    if (!this._lastMouseEvent) {
      throw new Error('Invariant violation: "this._lastMouseEvent"');
    }

    const screenPosition = component.screenPositionForMouseEvent(this._lastMouseEvent);
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

  _isMouseAtLastSuggestion() {
    if (!this._lastSuggestionAtMouse) {
      return false;
    }
    const { range } = this._lastSuggestionAtMouse;

    if (!range) {
      throw new Error('Hyperclick result must have a valid Range');
    }

    return this._isPositionInRange(this._getMousePositionAsBufferPosition(), range);
  }

  _isMouseAtLastWordRange() {
    const lastWordRange = this._lastWordRange;
    if (lastWordRange == null) {
      return false;
    }
    return this._isPositionInRange(this._getMousePositionAsBufferPosition(), lastWordRange);
  }

  _isPositionInRange(position, range) {
    return Array.isArray(range) ? range.some(r => r.containsPoint(position)) : range.containsPoint(position);
  }

  _clearSuggestion() {
    this._doneLoading();
    this._lastSuggestionAtMousePromise = null;
    this._lastSuggestionAtMouse = null;
    this._updateNavigationMarkers(null);
  }

  _confirmSuggestionAtCursor() {
    var _this2 = this;

    return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)('hyperclick:confirm-cursor', (0, _asyncToGenerator.default)(function* () {
      const suggestion = yield _this2._hyperclick.getSuggestion(_this2._textEditor, _this2._textEditor.getCursorBufferPosition());
      if (suggestion) {
        _this2._confirmSuggestion(suggestion);
      }
    }));
  }

  /**
   * Add markers for the given range(s), or clears them if `ranges` is null.
   */
  _updateNavigationMarkers(range) {
    if (this._navigationMarkers) {
      this._navigationMarkers.forEach(marker => marker.destroy());
      this._navigationMarkers = null;
    }

    // Only change the cursor to a pointer if there is a suggestion ready.
    if (range == null) {
      this._textEditorView.classList.remove('hyperclick');
      return;
    }

    this._textEditorView.classList.add('hyperclick');
    const ranges = Array.isArray(range) ? range : [range];
    this._navigationMarkers = ranges.map(markerRange => {
      const marker = this._textEditor.markBufferRange(markerRange, { invalidate: 'never' });
      this._textEditor.decorateMarker(marker, { type: 'highlight', class: 'hyperclick' });
      return marker;
    });
  }

  /**
   * Returns whether an event should be handled by hyperclick or not.
   */
  _isHyperclickEvent(event) {
    return event.shiftKey === this._triggerKeys.has('shiftKey') && event.ctrlKey === this._triggerKeys.has('ctrlKey') && event.altKey === this._triggerKeys.has('altKey') && event.metaKey === this._triggerKeys.has('metaKey');
  }

  _doneLoading() {
    this._isLoading = false;
    this._loadingTracker = null;
    this._textEditorView.classList.remove('hyperclick-loading');
  }

  dispose() {
    this._isDestroyed = true;
    this._clearSuggestion();
    this._textEditorView.removeEventListener('keydown', this._onKeyDown);
    this._textEditorView.removeEventListener('keyup', this._onKeyUp);
    this._textEditorView.removeEventListener('contextmenu', this._onContextMenu);
    this._subscriptions.dispose();
  }
}

exports.default = HyperclickForTextEditor; /**
                                            * Determine whether the specified event will trigger Atom's multiple cursors. This is based on (and
                                            * must be the same as!) [Atom's
                                            * logic](https://github.com/atom/atom/blob/v1.14.2/src/text-editor-component.coffee#L527).
                                            */

function isMulticursorEvent(event) {
  const { platform } = process;
  const isLeftButton = event.button === 0 || event.button === 1 && platform === 'linux';
  const { metaKey, ctrlKey } = event;

  if (!isLeftButton) {
    return false;
  }
  if (ctrlKey && platform === 'darwin') {
    return false;
  }

  return metaKey || ctrlKey && platform !== 'darwin';
}