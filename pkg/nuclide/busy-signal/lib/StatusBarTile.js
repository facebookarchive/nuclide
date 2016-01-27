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
        _reactForAtom.React.render(_reactForAtom.React.createElement(_StatusBarTileComponent.StatusBarTileComponent, props), item);
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
//# sourceMappingURL=data:application/json;base64,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RUFBRTs7QUFFckIsYUFBQyxXQUFXLEVBQUUsWUFBWSxDQUFDLENBQ3hCLEdBQUcsQ0FBQyxVQUFBLElBQUk7cUJBQUksSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDO2FBQUEsQ0FBQyxDQUNqQyxPQUFPLENBQUMsVUFBQSxLQUFLO3FCQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDO2FBQUEsQ0FBQyxDQUFDO1dBQ2hEO1NBQ0Y7T0FDRjtLQUNGOzs7U0EzRVUsYUFBYSIsImZpbGUiOiJTdGF0dXNCYXJUaWxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge09ic2VydmFibGV9IGZyb20gJ3J4JztcblxuaW1wb3J0IHR5cGUge0J1c3lTaWduYWxNZXNzYWdlQnVzeX0gZnJvbSAnLi4vLi4vYnVzeS1zaWduYWwtaW50ZXJmYWNlcyc7XG5cbmltcG9ydCB7UmVhY3R9IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcblxuaW1wb3J0IHtTdGF0dXNCYXJUaWxlQ29tcG9uZW50fSBmcm9tICcuL1N0YXR1c0JhclRpbGVDb21wb25lbnQnO1xuXG4vLyBXZSB3YW50IHRvIGJlIHRoZSBmdXJ0aGVzdCBsZWZ0IG9uIHRoZSByaWdodCBzaWRlIG9mIHRoZSBzdGF0dXMgYmFyIHNvIGFzIG5vdCB0byBsZWF2ZSBhXG4vLyBjb25zcGljdW91cyBnYXAgKG9yIGNhdXNlIGppdHRlcikgd2hlbiBub3RoaW5nIGlzIGJ1c3kuXG5jb25zdCBTVEFUVVNfQkFSX1BSSU9SSVRZID0gMTAwMDtcblxuZXhwb3J0IGNsYXNzIFN0YXR1c0JhclRpbGUge1xuICBfaXRlbTogP0hUTUxFbGVtZW50O1xuICBfdGlsZTogP2F0b20kU3RhdHVzQmFyVGlsZTtcbiAgX3Rvb2x0aXA6ID9hdG9tJElEaXNwb3NhYmxlO1xuICBfaXNNb3VzZU92ZXI6IGJvb2xlYW47XG4gIF9tZXNzYWdlczogQXJyYXk8c3RyaW5nPjtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl9tZXNzYWdlcyA9IFtdO1xuICAgIHRoaXMuX2lzTW91c2VPdmVyID0gZmFsc2U7XG4gIH1cblxuICBkaXNwb3NlKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl90aWxlKSB7XG4gICAgICB0aGlzLl90aWxlLmRlc3Ryb3koKTtcbiAgICAgIHRoaXMuX3RpbGUgPSBudWxsO1xuICAgICAgdGhpcy5faXRlbSA9IG51bGw7XG4gICAgfVxuICAgIGlmICh0aGlzLl90b29sdGlwKSB7XG4gICAgICB0aGlzLl90b29sdGlwLmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMuX3Rvb2x0aXAgPSBudWxsO1xuICAgIH1cbiAgICB0aGlzLl9pc01vdXNlT3ZlciA9IGZhbHNlO1xuICB9XG5cbiAgY29uc3VtZVN0YXR1c0JhcihzdGF0dXNCYXI6IGF0b20kU3RhdHVzQmFyKTogdm9pZCB7XG4gICAgY29uc3QgaXRlbSA9IHRoaXMuX2l0ZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBpdGVtLmNsYXNzTmFtZSA9ICdpbmxpbmUtYmxvY2snO1xuICAgIGl0ZW0uYWRkRXZlbnRMaXN0ZW5lcignbW91c2VlbnRlcicsICgpID0+IHtcbiAgICAgIHRoaXMuX2lzTW91c2VPdmVyID0gdHJ1ZTtcbiAgICB9KTtcbiAgICBpdGVtLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCAoKSA9PiB7XG4gICAgICB0aGlzLl9pc01vdXNlT3ZlciA9IGZhbHNlO1xuICAgIH0pO1xuICAgIHRoaXMuX3RpbGUgPSBzdGF0dXNCYXIuYWRkUmlnaHRUaWxlKHtcbiAgICAgIGl0ZW0sXG4gICAgICBwcmlvcml0eTogU1RBVFVTX0JBUl9QUklPUklUWSxcbiAgICB9KTtcblxuICAgIHRoaXMuX3JlbmRlcigpO1xuICB9XG5cbiAgY29uc3VtZU1lc3NhZ2VTdHJlYW0obWVzc2FnZVN0cmVhbTogT2JzZXJ2YWJsZTxBcnJheTxCdXN5U2lnbmFsTWVzc2FnZUJ1c3k+Pik6IHZvaWQge1xuICAgIG1lc3NhZ2VTdHJlYW0uc3Vic2NyaWJlKG1lc3NhZ2VzID0+IHtcbiAgICAgIHRoaXMuX21lc3NhZ2VzID0gbWVzc2FnZXMubWFwKG1lc3NhZ2UgPT4ge1xuICAgICAgICByZXR1cm4gbWVzc2FnZS5tZXNzYWdlO1xuICAgICAgfSk7XG4gICAgICB0aGlzLl9yZW5kZXIoKTtcbiAgICB9KTtcbiAgfVxuXG4gIF9yZW5kZXIoKTogdm9pZCB7XG4gICAgY29uc3QgcHJvcHMgPSB7XG4gICAgICBidXN5OiB0aGlzLl9tZXNzYWdlcy5sZW5ndGggIT09IDAsXG4gICAgfTtcblxuICAgIGNvbnN0IGl0ZW0gPSB0aGlzLl9pdGVtO1xuICAgIGlmIChpdGVtKSB7XG4gICAgICBSZWFjdC5yZW5kZXIoPFN0YXR1c0JhclRpbGVDb21wb25lbnQgey4uLnByb3BzfS8+LCBpdGVtKTtcbiAgICAgIGlmICh0aGlzLl90b29sdGlwKSB7XG4gICAgICAgIHRoaXMuX3Rvb2x0aXAuZGlzcG9zZSgpO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuX21lc3NhZ2VzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgdGhpcy5fdG9vbHRpcCA9IGF0b20udG9vbHRpcHMuYWRkKGl0ZW0sIHtcbiAgICAgICAgICB0aXRsZTogdGhpcy5fbWVzc2FnZXMuam9pbignPGJyLz4nKSxcbiAgICAgICAgICBkZWxheTogMCxcbiAgICAgICAgfSk7XG4gICAgICAgIGlmICh0aGlzLl9pc01vdXNlT3Zlcikge1xuICAgICAgICAgIC8vIElmIHRoZSBtb3VzZSBpcyBjdXJyZW50bHkgb3ZlciB0aGUgZWxlbWVudCwgd2Ugd2FudCB0byB0cmlnZ2VyIHRoZSBuZXcgcG9wdXAgdG8gYXBwZWFyLlxuICAgICAgICAgIFsnbW91c2VvdmVyJywgJ21vdXNlZW50ZXInXVxuICAgICAgICAgICAgLm1hcChuYW1lID0+IG5ldyBNb3VzZUV2ZW50KG5hbWUpKVxuICAgICAgICAgICAgLmZvckVhY2goZXZlbnQgPT4gaXRlbS5kaXNwYXRjaEV2ZW50KGV2ZW50KSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiJdfQ==