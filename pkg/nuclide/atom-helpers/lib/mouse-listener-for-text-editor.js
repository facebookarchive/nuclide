'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {CompositeDisposable, Disposable, Emitter, Point} = require('atom');

type PositionChangeEvent = {
  nativeEvent: MouseEvent;
  position: Point;
};

var DEBOUNCE_TIME = 200;

class WindowMouseListener {
  constructor() {
    this._subscriptions = new CompositeDisposable();

    var {debounce} = require('nuclide-commons');
    var handler = debounce(
        event => this._handleMouseMove(event),
        DEBOUNCE_TIME,
        /* immediate */ true);
    window.addEventListener('mousemove', handler);
    this._mouseMoveListener = new Disposable(() => {
      window.removeEventListener('mousemove', handler);
    });

    this._textEditorMouseListenersMap = new Map();
    this._textEditorMouseListenersCountMap = new Map();
    this._subscriptions.add(new Disposable(() => {
      this._textEditorMouseListenersMap.forEach(listener => listener.dispose());
      this._textEditorMouseListenersMap.clear();
      this._textEditorMouseListenersCountMap.clear();
    }));
  }

  mouseListenerForTextEditor(textEditor: TextEditor): TextEditorMouseListener {
    // Keep track of how many mouse listeners were returned for the text editor
    // so we know when it's safe to actually dispose it.
    var count = this._textEditorMouseListenersCountMap.get(textEditor) || 0;
    this._textEditorMouseListenersCountMap.set(textEditor, count + 1);

    var mouseListener = this._textEditorMouseListenersMap.get(textEditor);
    if (!mouseListener) {
      mouseListener = new TextEditorMouseListener(textEditor, /* shouldDispose */ () => {
        var currentCount = this._textEditorMouseListenersCountMap.get(textEditor) || 0;
        if (currentCount === 1) {
          this._textEditorMouseListenersCountMap.delete(textEditor);
          this._textEditorMouseListenersMap.delete(textEditor);
          return true;
        } else {
          this._textEditorMouseListenersCountMap.set(textEditor, currentCount - 1);
          return false;
        }
      });
      this._textEditorMouseListenersMap.set(textEditor, mouseListener);

      var destroySubscription = textEditor.onDidDestroy(() => {
        mouseListener.dispose();
        this._textEditorMouseListenersMap.delete(textEditor);
        this._textEditorMouseListenersCountMap.delete(textEditor);
        destroySubscription.dispose();
        destroySubscription = null;
      });
    }
    return mouseListener;
  }

  _handleMouseMove(event: MouseEvent): void {
    this._textEditorMouseListenersMap.forEach(
        mouseListener => mouseListener._handleMouseMove(event));
  }

  dispose(): void {
    this._subscriptions.dispose();
    if (this._mouseMoveListener) {
      this._mouseMoveListener.dispose();
    }
  }
}

class TextEditorMouseListener {
  constructor(textEditor: TextEditor, shouldDispose: () => boolean) {
    this._textEditor = textEditor;
    this._textEditorView = atom.views.getView(this._textEditor);

    this._shouldDispose = shouldDispose;
    this._subscriptions = new CompositeDisposable();

    this._emitter = new Emitter();
    this._subscriptions.add(this._emitter);

    this._lastPosition = new Point(0, 0);
  }

  /**
   * Returns the last known text editor screen position under the mouse,
   * initialized to (0, 0).
   */
  getLastPosition(): Point {
    return this._lastPosition;
  }

  /**
   * Calls `fn` when the mouse moves onto another text editor screen position,
   * not pixel position.
   */
  onDidPositionChange(fn: (event: PositionChangeEvent) => void): Disposable {
    return this._emitter.on('did-position-change', fn);
  }

  screenPositionForMouseEvent(event: MouseEvent): Point {
    return this._textEditorView.component.screenPositionForMouseEvent(event);
  }

  _handleMouseMove(event: MouseEvent): void {
    var position = this.screenPositionForMouseEvent(event);
    if (position.compare(this._lastPosition) !== 0) {
      this._lastPosition = position;
      this._emitter.emit('did-position-change', {
        nativeEvent: event,
        position,
      });
    }
  }

  dispose(): void {
    if (this._shouldDispose()) {
      this._subscriptions.dispose();
    }
  }
}

module.exports =
/**
 * Returns an object that tracks the mouse position in a text editor.
 *
 * The positions are in text editor screen coordinates and are rounded down
 * to the last position on each line.
 */
function mouseListenerForTextEditor(textEditor: TextEditor): TextEditorMouseListener {
  atom.nuclide = atom.nuclide || {};
  atom.nuclide.windowMouseListener = atom.nuclide.windowMouseListener || new WindowMouseListener();
  return atom.nuclide.windowMouseListener.mouseListenerForTextEditor(textEditor);
};
