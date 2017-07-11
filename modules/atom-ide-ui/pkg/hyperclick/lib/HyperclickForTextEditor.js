'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _atom = require('atom');

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('nuclide-commons-atom/feature-config'));
}

var _range;

function _load_range() {
  return _range = require('nuclide-commons-atom/range');
}

var _range2;

function _load_range2() {
  return _range2 = require('nuclide-commons/range');
}

var _showTriggerConflictWarning;

function _load_showTriggerConflictWarning() {
  return _showTriggerConflictWarning = _interopRequireDefault(require('./showTriggerConflictWarning'));
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
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

/* global localStorage */

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

    this._subscriptions.add((_featureConfig || _load_featureConfig()).default.observe(process.platform === 'darwin' ? 'hyperclick.darwinTriggerKeys' : process.platform === 'win32' ? 'hyperclick.win32TriggerKeys' : 'hyperclick.linuxTriggerKeys', newValue_ => {
      const newValue = newValue_;
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

      if (component.refs != null) {
        return component.refs.lineTiles;
      } else {
        return component.linesComponent.getDomNode();
      }
    };
    const addMouseListeners = () => {
      const { component } = this._textEditorView;

      if (!component) {
        throw new Error('Invariant violation: "component"');
      }

      const linesDomNode = getLinesDomNode();
      if (linesDomNode == null) {
        return;
      }
      linesDomNode.addEventListener('mousedown', this._onMouseDown);
      linesDomNode.addEventListener('mousemove', this._onMouseMove);
      const removalDisposable = new _atom.Disposable(() => {
        linesDomNode.removeEventListener('mousedown', this._onMouseDown);
        linesDomNode.removeEventListener('mousemove', this._onMouseMove);
      });
      this._subscriptions.add(removalDisposable);
      this._subscriptions.add(this._textEditorView.onDidDetach(() => removalDisposable.dispose()));
    };
    if (this._textEditorView.component && this._textEditorView.parentNode != null) {
      addMouseListeners();
    } else {
      this._subscriptions.add(this._textEditorView.onDidAttach(addMouseListeners));
    }
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
    // 'word' is defined by the wordRegExp at the current position.
    //
    // If the last suggestion had multiple ranges, we have no choice but to
    // fetch suggestions because the new word might be between those ranges.
    // This should be ok because it will reuse that last suggestion until the
    // mouse moves off of it.
    const lastSuggestionIsNotMultiRange = !this._lastSuggestionAtMouse || !Array.isArray(this._lastSuggestionAtMouse.range);
    if (this._isMouseAtLastWordRange() && lastSuggestionIsNotMultiRange) {
      return;
    }
    const match = (0, (_range || _load_range()).wordAtPosition)(this._textEditor, this._getMousePositionAsBufferPosition());
    this._lastWordRange = match != null ? match.range : null;

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

        if ((0, (_range2 || _load_range2()).isPositionInRange)(position, range)) {
          return;
        }
      }

      // if we don't have any prior hyperclick position data, or we don't
      // have any prior suggestion data, or the cursor has moved since the
      // last suggestion, then refetch hyperclick suggestions. Otherwise,
      // we might be able to reuse it below.
      if (!_this._lastPosition || !_this._lastSuggestionAtMouse || position.compare(_this._lastPosition) !== 0) {
        _this._isLoading = true;
        _this._lastPosition = position;

        try {
          _this._lastSuggestionAtMousePromise = _this._hyperclick.getSuggestion(_this._textEditor, position);
          _this._lastSuggestionAtMouse = yield _this._lastSuggestionAtMousePromise;
        } catch (e) {
          (0, (_log4js || _load_log4js()).getLogger)('hyperclick').error('Error getting Hyperclick suggestion:', e);
        } finally {
          _this._doneLoading();
        }
      }

      // it's possible that the text editor buffer (and therefore this hyperclick
      // provider for the editor) has been closed by the user since we
      // asynchronously queried for suggestions.
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
      (0, (_log4js || _load_log4js()).getLogger)('hyperclick').error('Hyperclick: Error getting buffer position for screen position:', error);
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

    return (0, (_range2 || _load_range2()).isPositionInRange)(this._getMousePositionAsBufferPosition(), range);
  }

  _isMouseAtLastWordRange() {
    const lastWordRange = this._lastWordRange;
    if (lastWordRange == null) {
      return false;
    }
    return (0, (_range2 || _load_range2()).isPositionInRange)(this._getMousePositionAsBufferPosition(), lastWordRange);
  }

  _clearSuggestion() {
    this._doneLoading();
    this._lastSuggestionAtMousePromise = null;
    this._lastSuggestionAtMouse = null;
    this._updateNavigationMarkers(null);
  }

  _confirmSuggestionAtCursor() {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const suggestion = yield _this2._hyperclick.getSuggestion(_this2._textEditor, _this2._textEditor.getCursorBufferPosition());
      if (suggestion) {
        _this2._confirmSuggestion(suggestion);
      }
    })();
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
      const marker = this._textEditor.markBufferRange(markerRange, {
        invalidate: 'never'
      });
      this._textEditor.decorateMarker(marker, {
        type: 'highlight',
        class: 'hyperclick'
      });
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