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
//# sourceMappingURL=data:application/json;base64,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RUFBRTs7QUFFckIsYUFBQyxXQUFXLEVBQUUsWUFBWSxDQUFDLENBQ3hCLEdBQUcsQ0FBQyxVQUFBLElBQUk7cUJBQUksSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDO2FBQUEsQ0FBQyxDQUNqQyxPQUFPLENBQUMsVUFBQSxLQUFLO3FCQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDO2FBQUEsQ0FBQyxDQUFDO1dBQ2hEO1NBQ0Y7T0FDRjtLQUNGOzs7U0EzRVUsYUFBYSIsImZpbGUiOiJTdGF0dXNCYXJUaWxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge09ic2VydmFibGV9IGZyb20gJ3J4JztcblxuaW1wb3J0IHR5cGUge0J1c3lTaWduYWxNZXNzYWdlQnVzeX0gZnJvbSAnLi4vLi4vYnVzeS1zaWduYWwtaW50ZXJmYWNlcyc7XG5cbmltcG9ydCB7XG4gIFJlYWN0LFxuICBSZWFjdERPTSxcbn0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuaW1wb3J0IHtTdGF0dXNCYXJUaWxlQ29tcG9uZW50fSBmcm9tICcuL1N0YXR1c0JhclRpbGVDb21wb25lbnQnO1xuXG4vLyBXZSB3YW50IHRvIGJlIHRoZSBmdXJ0aGVzdCBsZWZ0IG9uIHRoZSByaWdodCBzaWRlIG9mIHRoZSBzdGF0dXMgYmFyIHNvIGFzIG5vdCB0byBsZWF2ZSBhXG4vLyBjb25zcGljdW91cyBnYXAgKG9yIGNhdXNlIGppdHRlcikgd2hlbiBub3RoaW5nIGlzIGJ1c3kuXG5jb25zdCBTVEFUVVNfQkFSX1BSSU9SSVRZID0gMTAwMDtcblxuZXhwb3J0IGNsYXNzIFN0YXR1c0JhclRpbGUge1xuICBfaXRlbTogP0hUTUxFbGVtZW50O1xuICBfdGlsZTogP2F0b20kU3RhdHVzQmFyVGlsZTtcbiAgX3Rvb2x0aXA6ID9JRGlzcG9zYWJsZTtcbiAgX2lzTW91c2VPdmVyOiBib29sZWFuO1xuICBfbWVzc2FnZXM6IEFycmF5PHN0cmluZz47XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fbWVzc2FnZXMgPSBbXTtcbiAgICB0aGlzLl9pc01vdXNlT3ZlciA9IGZhbHNlO1xuICB9XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fdGlsZSkge1xuICAgICAgdGhpcy5fdGlsZS5kZXN0cm95KCk7XG4gICAgICB0aGlzLl90aWxlID0gbnVsbDtcbiAgICAgIHRoaXMuX2l0ZW0gPSBudWxsO1xuICAgIH1cbiAgICBpZiAodGhpcy5fdG9vbHRpcCkge1xuICAgICAgdGhpcy5fdG9vbHRpcC5kaXNwb3NlKCk7XG4gICAgICB0aGlzLl90b29sdGlwID0gbnVsbDtcbiAgICB9XG4gICAgdGhpcy5faXNNb3VzZU92ZXIgPSBmYWxzZTtcbiAgfVxuXG4gIGNvbnN1bWVTdGF0dXNCYXIoc3RhdHVzQmFyOiBhdG9tJFN0YXR1c0Jhcik6IHZvaWQge1xuICAgIGNvbnN0IGl0ZW0gPSB0aGlzLl9pdGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgaXRlbS5jbGFzc05hbWUgPSAnaW5saW5lLWJsb2NrJztcbiAgICBpdGVtLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZW50ZXInLCAoKSA9PiB7XG4gICAgICB0aGlzLl9pc01vdXNlT3ZlciA9IHRydWU7XG4gICAgfSk7XG4gICAgaXRlbS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgKCkgPT4ge1xuICAgICAgdGhpcy5faXNNb3VzZU92ZXIgPSBmYWxzZTtcbiAgICB9KTtcbiAgICB0aGlzLl90aWxlID0gc3RhdHVzQmFyLmFkZFJpZ2h0VGlsZSh7XG4gICAgICBpdGVtLFxuICAgICAgcHJpb3JpdHk6IFNUQVRVU19CQVJfUFJJT1JJVFksXG4gICAgfSk7XG5cbiAgICB0aGlzLl9yZW5kZXIoKTtcbiAgfVxuXG4gIGNvbnN1bWVNZXNzYWdlU3RyZWFtKG1lc3NhZ2VTdHJlYW06IE9ic2VydmFibGU8QXJyYXk8QnVzeVNpZ25hbE1lc3NhZ2VCdXN5Pj4pOiB2b2lkIHtcbiAgICBtZXNzYWdlU3RyZWFtLnN1YnNjcmliZShtZXNzYWdlcyA9PiB7XG4gICAgICB0aGlzLl9tZXNzYWdlcyA9IG1lc3NhZ2VzLm1hcChtZXNzYWdlID0+IHtcbiAgICAgICAgcmV0dXJuIG1lc3NhZ2UubWVzc2FnZTtcbiAgICAgIH0pO1xuICAgICAgdGhpcy5fcmVuZGVyKCk7XG4gICAgfSk7XG4gIH1cblxuICBfcmVuZGVyKCk6IHZvaWQge1xuICAgIGNvbnN0IHByb3BzID0ge1xuICAgICAgYnVzeTogdGhpcy5fbWVzc2FnZXMubGVuZ3RoICE9PSAwLFxuICAgIH07XG5cbiAgICBjb25zdCBpdGVtID0gdGhpcy5faXRlbTtcbiAgICBpZiAoaXRlbSkge1xuICAgICAgUmVhY3RET00ucmVuZGVyKDxTdGF0dXNCYXJUaWxlQ29tcG9uZW50IHsuLi5wcm9wc30vPiwgaXRlbSk7XG4gICAgICBpZiAodGhpcy5fdG9vbHRpcCkge1xuICAgICAgICB0aGlzLl90b29sdGlwLmRpc3Bvc2UoKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLl9tZXNzYWdlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHRoaXMuX3Rvb2x0aXAgPSBhdG9tLnRvb2x0aXBzLmFkZChpdGVtLCB7XG4gICAgICAgICAgdGl0bGU6IHRoaXMuX21lc3NhZ2VzLmpvaW4oJzxici8+JyksXG4gICAgICAgICAgZGVsYXk6IDAsXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAodGhpcy5faXNNb3VzZU92ZXIpIHtcbiAgICAgICAgICAvLyBJZiB0aGUgbW91c2UgaXMgY3VycmVudGx5IG92ZXIgdGhlIGVsZW1lbnQsIHdlIHdhbnQgdG8gdHJpZ2dlciB0aGUgbmV3IHBvcHVwIHRvIGFwcGVhci5cbiAgICAgICAgICBbJ21vdXNlb3ZlcicsICdtb3VzZWVudGVyJ11cbiAgICAgICAgICAgIC5tYXAobmFtZSA9PiBuZXcgTW91c2VFdmVudChuYW1lKSlcbiAgICAgICAgICAgIC5mb3JFYWNoKGV2ZW50ID0+IGl0ZW0uZGlzcGF0Y2hFdmVudChldmVudCkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iXX0=