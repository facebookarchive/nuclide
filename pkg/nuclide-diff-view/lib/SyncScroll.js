'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _atom = require('atom');

class SyncScroll {

  constructor(editor1Element, editor2Element) {
    // Atom master or >= v1.0.18 have changed the scroll logic to the editor element.
    this._subscriptions = new _atom.CompositeDisposable();
    this._syncInfo = [{
      scrollElement: editor1Element,
      scrolling: false
    }, {
      scrollElement: editor2Element,
      scrolling: false
    }];
    this._syncInfo.forEach((editorInfo, i) => {
      // Note that `onDidChangeScrollTop` isn't technically in the public API.
      const { scrollElement } = editorInfo;
      const updateScrollPosition = () => this._scrollPositionChanged(i);
      this._subscriptions.add(scrollElement.onDidChangeScrollTop(updateScrollPosition));
      this._subscriptions.add(scrollElement.onDidChangeScrollLeft(updateScrollPosition));
    });
    this._scrollPositionChanged(1);
  }

  _scrollPositionChanged(changeScrollIndex) {
    const thisInfo = this._syncInfo[changeScrollIndex];
    if (thisInfo.scrolling) {
      return;
    }
    const otherInfo = this._syncInfo[1 - changeScrollIndex];
    const { scrollElement: otherElement } = otherInfo;
    if (otherElement.component == null) {
      // The other editor isn't yet attached,
      // while both editors were already in sync when attached.
      return;
    }
    const { scrollElement: thisElement } = thisInfo;
    otherInfo.scrolling = true;
    otherElement.setScrollTop(thisElement.getScrollTop());
    otherElement.setScrollLeft(thisElement.getScrollLeft());
    otherInfo.scrolling = false;
  }

  dispose() {
    this._subscriptions.dispose();
  }
}
exports.default = SyncScroll; /**
                               * Copyright (c) 2015-present, Facebook, Inc.
                               * All rights reserved.
                               *
                               * This source code is licensed under the license found in the LICENSE file in
                               * the root directory of this source tree.
                               *
                               * 
                               */