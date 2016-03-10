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
//# sourceMappingURL=data:application/json;base64,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WSxFQUFFOztBQUVyQixhQUFDLFdBQVcsRUFBRSxZQUFZLENBQUMsQ0FDeEIsR0FBRyxDQUFDLFVBQUEsSUFBSTtxQkFBSSxJQUFJLFVBQVUsQ0FBQyxJQUFJLENBQUM7YUFBQSxDQUFDLENBQ2pDLE9BQU8sQ0FBQyxVQUFBLEtBQUs7cUJBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUM7YUFBQSxDQUFDLENBQUM7V0FDaEQ7U0FDRjtPQUNGO0tBQ0Y7OztTQTNFVSxhQUFhIiwiZmlsZSI6IlN0YXR1c0JhclRpbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG4vKiBlc2xpbnQtZW52IGJyb3dzZXIgKi9cblxuaW1wb3J0IHR5cGUge09ic2VydmFibGV9IGZyb20gJ3J4JztcblxuaW1wb3J0IHR5cGUge0J1c3lTaWduYWxNZXNzYWdlQnVzeX0gZnJvbSAnLi4vLi4vYnVzeS1zaWduYWwtaW50ZXJmYWNlcyc7XG5cbmltcG9ydCB7XG4gIFJlYWN0LFxuICBSZWFjdERPTSxcbn0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuaW1wb3J0IHtTdGF0dXNCYXJUaWxlQ29tcG9uZW50fSBmcm9tICcuL1N0YXR1c0JhclRpbGVDb21wb25lbnQnO1xuXG4vLyBXZSB3YW50IHRvIGJlIHRoZSBmdXJ0aGVzdCBsZWZ0IG9uIHRoZSByaWdodCBzaWRlIG9mIHRoZSBzdGF0dXMgYmFyIHNvIGFzIG5vdCB0byBsZWF2ZSBhXG4vLyBjb25zcGljdW91cyBnYXAgKG9yIGNhdXNlIGppdHRlcikgd2hlbiBub3RoaW5nIGlzIGJ1c3kuXG5jb25zdCBTVEFUVVNfQkFSX1BSSU9SSVRZID0gMTAwMDtcblxuZXhwb3J0IGNsYXNzIFN0YXR1c0JhclRpbGUge1xuICBfaXRlbTogP0hUTUxFbGVtZW50O1xuICBfdGlsZTogP2F0b20kU3RhdHVzQmFyVGlsZTtcbiAgX3Rvb2x0aXA6ID9JRGlzcG9zYWJsZTtcbiAgX2lzTW91c2VPdmVyOiBib29sZWFuO1xuICBfbWVzc2FnZXM6IEFycmF5PHN0cmluZz47XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fbWVzc2FnZXMgPSBbXTtcbiAgICB0aGlzLl9pc01vdXNlT3ZlciA9IGZhbHNlO1xuICB9XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fdGlsZSkge1xuICAgICAgdGhpcy5fdGlsZS5kZXN0cm95KCk7XG4gICAgICB0aGlzLl90aWxlID0gbnVsbDtcbiAgICAgIHRoaXMuX2l0ZW0gPSBudWxsO1xuICAgIH1cbiAgICBpZiAodGhpcy5fdG9vbHRpcCkge1xuICAgICAgdGhpcy5fdG9vbHRpcC5kaXNwb3NlKCk7XG4gICAgICB0aGlzLl90b29sdGlwID0gbnVsbDtcbiAgICB9XG4gICAgdGhpcy5faXNNb3VzZU92ZXIgPSBmYWxzZTtcbiAgfVxuXG4gIGNvbnN1bWVTdGF0dXNCYXIoc3RhdHVzQmFyOiBhdG9tJFN0YXR1c0Jhcik6IHZvaWQge1xuICAgIGNvbnN0IGl0ZW0gPSB0aGlzLl9pdGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgaXRlbS5jbGFzc05hbWUgPSAnaW5saW5lLWJsb2NrJztcbiAgICBpdGVtLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZW50ZXInLCAoKSA9PiB7XG4gICAgICB0aGlzLl9pc01vdXNlT3ZlciA9IHRydWU7XG4gICAgfSk7XG4gICAgaXRlbS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgKCkgPT4ge1xuICAgICAgdGhpcy5faXNNb3VzZU92ZXIgPSBmYWxzZTtcbiAgICB9KTtcbiAgICB0aGlzLl90aWxlID0gc3RhdHVzQmFyLmFkZFJpZ2h0VGlsZSh7XG4gICAgICBpdGVtLFxuICAgICAgcHJpb3JpdHk6IFNUQVRVU19CQVJfUFJJT1JJVFksXG4gICAgfSk7XG5cbiAgICB0aGlzLl9yZW5kZXIoKTtcbiAgfVxuXG4gIGNvbnN1bWVNZXNzYWdlU3RyZWFtKG1lc3NhZ2VTdHJlYW06IE9ic2VydmFibGU8QXJyYXk8QnVzeVNpZ25hbE1lc3NhZ2VCdXN5Pj4pOiB2b2lkIHtcbiAgICBtZXNzYWdlU3RyZWFtLnN1YnNjcmliZShtZXNzYWdlcyA9PiB7XG4gICAgICB0aGlzLl9tZXNzYWdlcyA9IG1lc3NhZ2VzLm1hcChtZXNzYWdlID0+IHtcbiAgICAgICAgcmV0dXJuIG1lc3NhZ2UubWVzc2FnZTtcbiAgICAgIH0pO1xuICAgICAgdGhpcy5fcmVuZGVyKCk7XG4gICAgfSk7XG4gIH1cblxuICBfcmVuZGVyKCk6IHZvaWQge1xuICAgIGNvbnN0IHByb3BzID0ge1xuICAgICAgYnVzeTogdGhpcy5fbWVzc2FnZXMubGVuZ3RoICE9PSAwLFxuICAgIH07XG5cbiAgICBjb25zdCBpdGVtID0gdGhpcy5faXRlbTtcbiAgICBpZiAoaXRlbSkge1xuICAgICAgUmVhY3RET00ucmVuZGVyKDxTdGF0dXNCYXJUaWxlQ29tcG9uZW50IHsuLi5wcm9wc30gLz4sIGl0ZW0pO1xuICAgICAgaWYgKHRoaXMuX3Rvb2x0aXApIHtcbiAgICAgICAgdGhpcy5fdG9vbHRpcC5kaXNwb3NlKCk7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5fbWVzc2FnZXMubGVuZ3RoID4gMCkge1xuICAgICAgICB0aGlzLl90b29sdGlwID0gYXRvbS50b29sdGlwcy5hZGQoaXRlbSwge1xuICAgICAgICAgIHRpdGxlOiB0aGlzLl9tZXNzYWdlcy5qb2luKCc8YnIvPicpLFxuICAgICAgICAgIGRlbGF5OiAwLFxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKHRoaXMuX2lzTW91c2VPdmVyKSB7XG4gICAgICAgICAgLy8gSWYgdGhlIG1vdXNlIGlzIGN1cnJlbnRseSBvdmVyIHRoZSBlbGVtZW50LCB3ZSB3YW50IHRvIHRyaWdnZXIgdGhlIG5ldyBwb3B1cCB0byBhcHBlYXIuXG4gICAgICAgICAgWydtb3VzZW92ZXInLCAnbW91c2VlbnRlciddXG4gICAgICAgICAgICAubWFwKG5hbWUgPT4gbmV3IE1vdXNlRXZlbnQobmFtZSkpXG4gICAgICAgICAgICAuZm9yRWFjaChldmVudCA9PiBpdGVtLmRpc3BhdGNoRXZlbnQoZXZlbnQpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIl19