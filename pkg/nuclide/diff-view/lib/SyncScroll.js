'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {CompositeDisposable} = require('atom');

class SyncScroll {

  constructor(editor1Element: HTMLElement, editor2Element: HTMLElement) {
    // Atom master and releases after v1.0.18 will change the scroll logic to the editor element.
    var editor1ScrollElement = editor1Element;
    var editor2ScrollElement = editor2Element;
    if (editor1Element.onDidChangeScrollTop === undefined) {
      // As of Atom v1.0.18 and lower, the `TextEditor` is the controller
      // of the scroll functionality.
      editor1ScrollElement = editor1Element.getModel();
      editor2ScrollElement = editor2Element.getModel();
    }
    this._subscriptions = new CompositeDisposable();
    this._syncInfo = [{
      scrollElement: editor1ScrollElement,
      scrolling: false,
    }, {
      scrollElement: editor2ScrollElement,
      scrolling: false,
    }];

    this._syncInfo.forEach((editorInfo, i) => {
      // Note that `onDidChangeScrollTop` isn't technically in the public API.
      this._subscriptions.add(editorInfo.scrollElement.onDidChangeScrollTop(
        () => this._scrollPositionChanged(i))
      );
    });
  }

  _scrollPositionChanged(changeScrollIndex: number): void {
    var thisInfo  = this._syncInfo[changeScrollIndex];
    var otherInfo = this._syncInfo[1 - changeScrollIndex];
    if (thisInfo.scrolling) {
      return;
    }
    var {scrollElement: thisElement} = thisInfo;
    var {scrollElement: otherElement} = otherInfo;
    otherInfo.scrolling = true;
    otherElement.setScrollTop(thisElement.getScrollTop());
    otherInfo.scrolling = false;
  }

  dispose(): void {
    if (this._subscriptions) {
      this._subscriptions.dispose();
      this._subscriptions = null;
    }
  }
}

module.exports = SyncScroll;
