Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var DEFER_SCROLL_SYNC_MS = 10;

var SyncScroll = (function () {
  function SyncScroll(editor1Element, editor2Element) {
    var _this = this;

    _classCallCheck(this, SyncScroll);

    // Atom master or >= v1.0.18 have changed the scroll logic to the editor element.
    this._subscriptions = new (_atom2 || _atom()).CompositeDisposable();
    this._syncInfo = [{
      scrollElement: editor1Element,
      scrolling: false
    }, {
      scrollElement: editor2Element,
      scrolling: false
    }];
    this._syncInfo.forEach(function (editorInfo, i) {
      // Note that `onDidChangeScrollTop` isn't technically in the public API.
      var scrollElement = editorInfo.scrollElement;

      var updateScrollPosition = function updateScrollPosition() {
        return _this._scrollPositionChanged(i);
      };
      _this._subscriptions.add(scrollElement.onDidChangeScrollTop(updateScrollPosition));
      _this._subscriptions.add(scrollElement.onDidChangeScrollLeft(updateScrollPosition));
    });
    this._scrollSyncTimeout = null;
    this._scrollPositionChanged(1);
  }

  _createClass(SyncScroll, [{
    key: '_scrollPositionChanged',
    value: function _scrollPositionChanged(changeScrollIndex) {
      var _this2 = this;

      var thisInfo = this._syncInfo[changeScrollIndex];
      if (thisInfo.scrolling) {
        return;
      }
      var otherInfo = this._syncInfo[1 - changeScrollIndex];
      var otherElement = otherInfo.scrollElement;

      if (otherElement.component == null) {
        // The other editor isn't yet attached,
        // while both editors were already in sync when attached.
        return;
      }
      var thisElement = thisInfo.scrollElement;

      if (thisElement.getScrollHeight() !== otherElement.getScrollHeight()) {
        // One of the editors' dimensions is pending sync.
        if (this._scrollSyncTimeout != null) {
          clearTimeout(this._scrollSyncTimeout);
        }
        this._scrollSyncTimeout = setTimeout(function () {
          _this2._scrollPositionChanged(1);
          _this2._scrollSyncTimeout = null;
        }, DEFER_SCROLL_SYNC_MS);
        return;
      }
      otherInfo.scrolling = true;
      otherElement.setScrollTop(thisElement.getScrollTop());
      otherElement.setScrollLeft(thisElement.getScrollLeft());
      otherInfo.scrolling = false;
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._subscriptions.dispose();
      if (this._scrollSyncTimeout != null) {
        clearTimeout(this._scrollSyncTimeout);
      }
    }
  }]);

  return SyncScroll;
})();

exports.default = SyncScroll;
module.exports = exports.default;