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

  constructor(editor1: TextEditor, editor2: TextEditor) {
    this._subscriptions = new CompositeDisposable();
    this._syncInfo = [{
      editor: editor1,
      scrolling: false,
    }, {
      editor: editor2,
      scrolling: false,
    }];

    this._syncInfo.forEach((editorInfo, i) => {
      // Note that `onDidChangeScrollTop` isn't technically in the public API.
      this._subscriptions.add(editorInfo.editor.onDidChangeScrollTop(() => this._scrollPositionChanged(i)));
    });
  }

  _scrollPositionChanged(changeScrollIndex: number): void {
    var thisInfo  = this._syncInfo[changeScrollIndex];
    var otherInfo = this._syncInfo[1 - changeScrollIndex];
    if (thisInfo.scrolling) {
      return;
    }
    var {editor: thisEditor} = thisInfo;
    var {editor: otherEditor} = otherInfo;
    otherInfo.scrolling = true;
    otherEditor.setScrollTop(thisEditor.getScrollTop());
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
