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

    // We deliberately use a DOM node that's deeper than `scrollViewNode` so
    // we can handle <meta-click> and still prevent the text editor from adding
    // another cursor.
    this._mouseEventHandlerEl = this._textEditorView.component.scrollViewNode.querySelector('.lines');
    this._onMouseMove = this._onMouseMove.bind(this);
    this._mouseEventHandlerEl.addEventListener('mousemove', this._onMouseMove);
    this._onMouseDown = this._onMouseDown.bind(this);
    this._mouseEventHandlerEl.addEventListener('mousedown', this._onMouseDown);
  }

  _onMouseMove(event: MouseEvent): Promise {
    // We save the last `MouseEvent` so the user can trigger Hyperclick by
    // pressing the key without moving the mouse again. We only save the
    // relevant properties to prevent retaining a reference to the event.
    this._lastMouseEvent = {
      clientX: event.clientX,
      clientY: event.clientY,
    };

    // TODO(jjiaa): Handle the event.
  }

  _onMouseDown(event: MouseEvent): void {
    if (!this._isHyperclickEvent(event)) {
      return;
    }

    // TODO(jjiaa): Handle the event.

    // Prevent the <meta-click> event from adding another cursor.
    event.stopPropagation();
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
  }
}

module.exports = HyperclickForTextEditor;
