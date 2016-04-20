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

/* eslint-env browser */

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _reactForAtom = require('react-for-atom');

var _StatusBarTileComponent = require('./StatusBarTileComponent');

// We want to be the furthest left on the right side of the status bar so as not to leave a
// conspicuous gap (or cause jitter) when nothing is busy.
var STATUS_BAR_PRIORITY = 1000;

var StatusBarTile = (function () {
  function StatusBarTile() {
    _classCallCheck(this, StatusBarTile);

    this._messages = [];
    this._isMouseOver = false;
  }

  _createClass(StatusBarTile, [{
    key: 'dispose',
    value: function dispose() {
      if (this._tile) {
        this._tile.destroy();
        this._tile = null;
        this._item = null;
      }
      if (this._tooltip) {
        this._tooltip.dispose();
        this._tooltip = null;
      }
      this._isMouseOver = false;
    }
  }, {
    key: 'consumeStatusBar',
    value: function consumeStatusBar(statusBar) {
      var _this = this;

      var item = this._item = document.createElement('div');
      item.className = 'inline-block';
      item.addEventListener('mouseenter', function () {
        _this._isMouseOver = true;
      });
      item.addEventListener('mouseleave', function () {
        _this._isMouseOver = false;
      });
      this._tile = statusBar.addRightTile({
        item: item,
        priority: STATUS_BAR_PRIORITY
      });

      this._render();
    }
  }, {
    key: 'consumeMessageStream',
    value: function consumeMessageStream(messageStream) {
      var _this2 = this;

      messageStream.subscribe(function (messages) {
        _this2._messages = messages.map(function (message) {
          return message.message;
        });
        _this2._render();
      });
    }
  }, {
    key: '_render',
    value: function _render() {
      var props = {
        busy: this._messages.length !== 0
      };

      var item = this._item;
      if (item) {
        _reactForAtom.ReactDOM.render(_reactForAtom.React.createElement(_StatusBarTileComponent.StatusBarTileComponent, props), item);
        if (this._tooltip) {
          this._tooltip.dispose();
        }
        if (this._messages.length > 0) {
          this._tooltip = atom.tooltips.add(item, {
            title: this._messages.join('<br/>'),
            delay: 0
          });
          if (this._isMouseOver) {
            // If the mouse is currently over the element, we want to trigger the new popup to appear.
            ['mouseover', 'mouseenter'].map(function (name) {
              return new MouseEvent(name);
            }).forEach(function (event) {
              return item.dispatchEvent(event);
            });
          }
        }
      }
    }
  }]);

  return StatusBarTile;
})();

exports.StatusBarTile = StatusBarTile;
//# sourceMappingURL=data:application/json;base64,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WSxFQUFFOztBQUVyQixhQUFDLFdBQVcsRUFBRSxZQUFZLENBQUMsQ0FDeEIsR0FBRyxDQUFDLFVBQUEsSUFBSTtxQkFBSSxJQUFJLFVBQVUsQ0FBQyxJQUFJLENBQUM7YUFBQSxDQUFDLENBQ2pDLE9BQU8sQ0FBQyxVQUFBLEtBQUs7cUJBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUM7YUFBQSxDQUFDLENBQUM7V0FDaEQ7U0FDRjtPQUNGO0tBQ0Y7OztTQTNFVSxhQUFhIiwiZmlsZSI6IlN0YXR1c0JhclRpbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG4vKiBlc2xpbnQtZW52IGJyb3dzZXIgKi9cblxuaW1wb3J0IHR5cGUge09ic2VydmFibGV9IGZyb20gJ0ByZWFjdGl2ZXgvcnhqcyc7XG5cbmltcG9ydCB0eXBlIHtCdXN5U2lnbmFsTWVzc2FnZUJ1c3l9IGZyb20gJy4vdHlwZXMnO1xuXG5pbXBvcnQge1xuICBSZWFjdCxcbiAgUmVhY3RET00sXG59IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcbmltcG9ydCB7U3RhdHVzQmFyVGlsZUNvbXBvbmVudH0gZnJvbSAnLi9TdGF0dXNCYXJUaWxlQ29tcG9uZW50JztcblxuLy8gV2Ugd2FudCB0byBiZSB0aGUgZnVydGhlc3QgbGVmdCBvbiB0aGUgcmlnaHQgc2lkZSBvZiB0aGUgc3RhdHVzIGJhciBzbyBhcyBub3QgdG8gbGVhdmUgYVxuLy8gY29uc3BpY3VvdXMgZ2FwIChvciBjYXVzZSBqaXR0ZXIpIHdoZW4gbm90aGluZyBpcyBidXN5LlxuY29uc3QgU1RBVFVTX0JBUl9QUklPUklUWSA9IDEwMDA7XG5cbmV4cG9ydCBjbGFzcyBTdGF0dXNCYXJUaWxlIHtcbiAgX2l0ZW06ID9IVE1MRWxlbWVudDtcbiAgX3RpbGU6ID9hdG9tJFN0YXR1c0JhclRpbGU7XG4gIF90b29sdGlwOiA/SURpc3Bvc2FibGU7XG4gIF9pc01vdXNlT3ZlcjogYm9vbGVhbjtcbiAgX21lc3NhZ2VzOiBBcnJheTxzdHJpbmc+O1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX21lc3NhZ2VzID0gW107XG4gICAgdGhpcy5faXNNb3VzZU92ZXIgPSBmYWxzZTtcbiAgfVxuXG4gIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX3RpbGUpIHtcbiAgICAgIHRoaXMuX3RpbGUuZGVzdHJveSgpO1xuICAgICAgdGhpcy5fdGlsZSA9IG51bGw7XG4gICAgICB0aGlzLl9pdGVtID0gbnVsbDtcbiAgICB9XG4gICAgaWYgKHRoaXMuX3Rvb2x0aXApIHtcbiAgICAgIHRoaXMuX3Rvb2x0aXAuZGlzcG9zZSgpO1xuICAgICAgdGhpcy5fdG9vbHRpcCA9IG51bGw7XG4gICAgfVxuICAgIHRoaXMuX2lzTW91c2VPdmVyID0gZmFsc2U7XG4gIH1cblxuICBjb25zdW1lU3RhdHVzQmFyKHN0YXR1c0JhcjogYXRvbSRTdGF0dXNCYXIpOiB2b2lkIHtcbiAgICBjb25zdCBpdGVtID0gdGhpcy5faXRlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGl0ZW0uY2xhc3NOYW1lID0gJ2lubGluZS1ibG9jayc7XG4gICAgaXRlbS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgKCkgPT4ge1xuICAgICAgdGhpcy5faXNNb3VzZU92ZXIgPSB0cnVlO1xuICAgIH0pO1xuICAgIGl0ZW0uYWRkRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsICgpID0+IHtcbiAgICAgIHRoaXMuX2lzTW91c2VPdmVyID0gZmFsc2U7XG4gICAgfSk7XG4gICAgdGhpcy5fdGlsZSA9IHN0YXR1c0Jhci5hZGRSaWdodFRpbGUoe1xuICAgICAgaXRlbSxcbiAgICAgIHByaW9yaXR5OiBTVEFUVVNfQkFSX1BSSU9SSVRZLFxuICAgIH0pO1xuXG4gICAgdGhpcy5fcmVuZGVyKCk7XG4gIH1cblxuICBjb25zdW1lTWVzc2FnZVN0cmVhbShtZXNzYWdlU3RyZWFtOiBPYnNlcnZhYmxlPEFycmF5PEJ1c3lTaWduYWxNZXNzYWdlQnVzeT4+KTogdm9pZCB7XG4gICAgbWVzc2FnZVN0cmVhbS5zdWJzY3JpYmUobWVzc2FnZXMgPT4ge1xuICAgICAgdGhpcy5fbWVzc2FnZXMgPSBtZXNzYWdlcy5tYXAobWVzc2FnZSA9PiB7XG4gICAgICAgIHJldHVybiBtZXNzYWdlLm1lc3NhZ2U7XG4gICAgICB9KTtcbiAgICAgIHRoaXMuX3JlbmRlcigpO1xuICAgIH0pO1xuICB9XG5cbiAgX3JlbmRlcigpOiB2b2lkIHtcbiAgICBjb25zdCBwcm9wcyA9IHtcbiAgICAgIGJ1c3k6IHRoaXMuX21lc3NhZ2VzLmxlbmd0aCAhPT0gMCxcbiAgICB9O1xuXG4gICAgY29uc3QgaXRlbSA9IHRoaXMuX2l0ZW07XG4gICAgaWYgKGl0ZW0pIHtcbiAgICAgIFJlYWN0RE9NLnJlbmRlcig8U3RhdHVzQmFyVGlsZUNvbXBvbmVudCB7Li4ucHJvcHN9IC8+LCBpdGVtKTtcbiAgICAgIGlmICh0aGlzLl90b29sdGlwKSB7XG4gICAgICAgIHRoaXMuX3Rvb2x0aXAuZGlzcG9zZSgpO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuX21lc3NhZ2VzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgdGhpcy5fdG9vbHRpcCA9IGF0b20udG9vbHRpcHMuYWRkKGl0ZW0sIHtcbiAgICAgICAgICB0aXRsZTogdGhpcy5fbWVzc2FnZXMuam9pbignPGJyLz4nKSxcbiAgICAgICAgICBkZWxheTogMCxcbiAgICAgICAgfSk7XG4gICAgICAgIGlmICh0aGlzLl9pc01vdXNlT3Zlcikge1xuICAgICAgICAgIC8vIElmIHRoZSBtb3VzZSBpcyBjdXJyZW50bHkgb3ZlciB0aGUgZWxlbWVudCwgd2Ugd2FudCB0byB0cmlnZ2VyIHRoZSBuZXcgcG9wdXAgdG8gYXBwZWFyLlxuICAgICAgICAgIFsnbW91c2VvdmVyJywgJ21vdXNlZW50ZXInXVxuICAgICAgICAgICAgLm1hcChuYW1lID0+IG5ldyBNb3VzZUV2ZW50KG5hbWUpKVxuICAgICAgICAgICAgLmZvckVhY2goZXZlbnQgPT4gaXRlbS5kaXNwYXRjaEV2ZW50KGV2ZW50KSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiJdfQ==