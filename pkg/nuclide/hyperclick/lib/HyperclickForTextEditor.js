'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * Construct this object to enable Hyperclick in a text editor.
 * Call `dispose` to disable the feature.
 */
class HyperclickForTextEditor {
  constructor(textEditor: TextEditor, hyperclick: Hyperclick) {
    this._textEditor = textEditor;
    this._textEditorView = atom.views.getView(textEditor);

    this._hyperclick = hyperclick;

    this._lastMouseEvent = null;
    // We store the original promise that we use to retrieve the last suggestion
    // so callers can also await it to know when it's available.
    this._lastSuggestionAtMousePromise = null;
    // We store the last suggestion since we must await it immediately anyway.
    this._lastSuggestionAtMouse = null;
    this._navigationMarkers = null;

    // We deliberately use a DOM node that's deeper than `scrollViewNode` so
    // we can handle <meta-click> and still prevent the text editor from adding
    // another cursor.
    this._mouseEventHandlerEl = this._textEditorView.component.scrollViewNode.querySelector('.lines');
    this._onMouseMove = this._onMouseMove.bind(this);
    this._mouseEventHandlerEl.addEventListener('mousemove', this._onMouseMove);
    this._onMouseDown = this._onMouseDown.bind(this);
    this._mouseEventHandlerEl.addEventListener('mousedown', this._onMouseDown);

    this._onKeyDown = this._onKeyDown.bind(this);
    this._textEditorView.addEventListener('keydown', this._onKeyDown);
    this._onKeyUp = this._onKeyUp.bind(this);
    this._textEditorView.addEventListener('keyup', this._onKeyUp);
  }

  _confirmSuggestion(suggestion: HyperclickSuggestion): void {
    if (Array.isArray(suggestion.callback) && suggestion.callback.length > 0) {
      // TODO(jjiaa): Show a UI for the list of suggestions.
    } else {
      suggestion.callback();
    }
  }

  _onMouseMove(event: MouseEvent): Promise {
    // We save the last `MouseEvent` so the user can trigger Hyperclick by
    // pressing the key without moving the mouse again. We only save the
    // relevant properties to prevent retaining a reference to the event.
    this._lastMouseEvent = {
      clientX: event.clientX,
      clientY: event.clientY,
    };

    if (this._isHyperclickEvent(event)) {
      this._setSuggestionForLastMouseEvent();
    } else {
      this._clearSuggestion();
    }
  }

  _onMouseDown(event: MouseEvent): void {
    if (!this._isHyperclickEvent(event)) {
      return;
    }

    if (this._lastSuggestionAtMouse) {
      this._confirmSuggestion(this._lastSuggestionAtMouse);
    }

    this._clearSuggestion();
    // Prevent the <meta-click> event from adding another cursor.
    event.stopPropagation();
  }

  _onKeyDown(event: KeyboardEvent): void {
    // Show the suggestion at the last known mouse position.
    if (this._isHyperclickEvent(event)) {
      this._setSuggestionForLastMouseEvent();
    }
  }

  _onKeyUp(event: KeyboardEvent): void {
    if (!this._isHyperclickEvent(event)) {
      this._clearSuggestion();
    }
  }

  /**
   * Returns a `Promise` that's resolved when the latest suggestion's available.
   */
  getSuggestionAtMouse(): Promise<HyperclickSuggestion> {
    return this._lastSuggestionAtMousePromise || Promise.resolve(null);
  }

  async _setSuggestionForLastMouseEvent(): void {
    if (!this._lastMouseEvent) {
      return;
    }

    var position = this._textEditorView.component.screenPositionForMouseEvent(this._lastMouseEvent);

    if (this._lastSuggestionAtMouse) {
      var {range} = this._lastSuggestionAtMouse;
      var isInLastRanges = (Array.isArray(range) && range.some(r => r.containsPoint(position)));
      if (isInLastRanges || (!Array.isArray(range) && range.containsPoint(position))) {
        return;
      }
    }

    this._lastSuggestionAtMousePromise = this._hyperclick.getSuggestion(this._textEditor, position);
    this._lastSuggestionAtMouse = await this._lastSuggestionAtMousePromise;
    if (this._lastSuggestionAtMouse) {
      this._updateNavigationMarkers(this._lastSuggestionAtMouse.range);
    }
  }

  _clearSuggestion(): void {
    this._lastSuggestionAtMousePromise = null;
    this._lastSuggestionAtMouse = null;
    this._updateNavigationMarkers(null);
  }

  /**
   * Add markers for the given range(s), or clears them if `ranges` is null.
   */
  _updateNavigationMarkers(range: ?Range | ?Array<Range>): void {
    if (this._navigationMarkers) {
      this._navigationMarkers.forEach(marker => marker.destroy());
      this._navigationMarkers = null;
    }

    if (range) {
      var ranges = Array.isArray(range) ? range : [range];

      this._navigationMarkers = ranges.map(markerRange => {
        var marker = this._textEditor.markBufferRange(markerRange, {invalidate: 'never'});
        this._textEditor.decorateMarker(
            marker,
            {type: 'highlight', class: 'hyperclick'});
        return marker;
      });
      this._textEditorView.classList.add('hyperclick');
    } else {
      this._textEditorView.classList.remove('hyperclick');
    }
  }

  /**
   * Returns whether an event should be handled by hyperclick or not.
   */
  _isHyperclickEvent(event: KeyboardEvent | MouseEvent): boolean {
    // If the user is pressing either the meta key or the alt key.
    return event.metaKey !== event.altKey;
  }

  dispose() {
    this._mouseEventHandlerEl.removeEventListener('mousemove', this._onMouseMove);
    this._mouseEventHandlerEl.removeEventListener('mousedown', this._onMouseDown);
    this._textEditorView.removeEventListener('keydown', this._onKeyDown);
    this._textEditorView.removeEventListener('keyup', this._onKeyUp);
  }
}

module.exports = HyperclickForTextEditor;
