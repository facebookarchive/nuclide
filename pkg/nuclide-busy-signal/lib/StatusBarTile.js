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
//# sourceMappingURL=data:application/json;base64,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WSxFQUFFOztBQUVyQixhQUFDLFdBQVcsRUFBRSxZQUFZLENBQUMsQ0FDeEIsR0FBRyxDQUFDLFVBQUEsSUFBSTtxQkFBSSxJQUFJLFVBQVUsQ0FBQyxJQUFJLENBQUM7YUFBQSxDQUFDLENBQ2pDLE9BQU8sQ0FBQyxVQUFBLEtBQUs7cUJBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUM7YUFBQSxDQUFDLENBQUM7V0FDaEQ7U0FDRjtPQUNGO0tBQ0Y7OztTQTNFVSxhQUFhIiwiZmlsZSI6IlN0YXR1c0JhclRpbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG4vKiBlc2xpbnQtZW52IGJyb3dzZXIgKi9cblxuaW1wb3J0IHR5cGUge09ic2VydmFibGV9IGZyb20gJ3J4JztcblxuaW1wb3J0IHR5cGUge0J1c3lTaWduYWxNZXNzYWdlQnVzeX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1idXN5LXNpZ25hbC1pbnRlcmZhY2VzJztcblxuaW1wb3J0IHtcbiAgUmVhY3QsXG4gIFJlYWN0RE9NLFxufSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQge1N0YXR1c0JhclRpbGVDb21wb25lbnR9IGZyb20gJy4vU3RhdHVzQmFyVGlsZUNvbXBvbmVudCc7XG5cbi8vIFdlIHdhbnQgdG8gYmUgdGhlIGZ1cnRoZXN0IGxlZnQgb24gdGhlIHJpZ2h0IHNpZGUgb2YgdGhlIHN0YXR1cyBiYXIgc28gYXMgbm90IHRvIGxlYXZlIGFcbi8vIGNvbnNwaWN1b3VzIGdhcCAob3IgY2F1c2Ugaml0dGVyKSB3aGVuIG5vdGhpbmcgaXMgYnVzeS5cbmNvbnN0IFNUQVRVU19CQVJfUFJJT1JJVFkgPSAxMDAwO1xuXG5leHBvcnQgY2xhc3MgU3RhdHVzQmFyVGlsZSB7XG4gIF9pdGVtOiA/SFRNTEVsZW1lbnQ7XG4gIF90aWxlOiA/YXRvbSRTdGF0dXNCYXJUaWxlO1xuICBfdG9vbHRpcDogP0lEaXNwb3NhYmxlO1xuICBfaXNNb3VzZU92ZXI6IGJvb2xlYW47XG4gIF9tZXNzYWdlczogQXJyYXk8c3RyaW5nPjtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl9tZXNzYWdlcyA9IFtdO1xuICAgIHRoaXMuX2lzTW91c2VPdmVyID0gZmFsc2U7XG4gIH1cblxuICBkaXNwb3NlKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl90aWxlKSB7XG4gICAgICB0aGlzLl90aWxlLmRlc3Ryb3koKTtcbiAgICAgIHRoaXMuX3RpbGUgPSBudWxsO1xuICAgICAgdGhpcy5faXRlbSA9IG51bGw7XG4gICAgfVxuICAgIGlmICh0aGlzLl90b29sdGlwKSB7XG4gICAgICB0aGlzLl90b29sdGlwLmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMuX3Rvb2x0aXAgPSBudWxsO1xuICAgIH1cbiAgICB0aGlzLl9pc01vdXNlT3ZlciA9IGZhbHNlO1xuICB9XG5cbiAgY29uc3VtZVN0YXR1c0JhcihzdGF0dXNCYXI6IGF0b20kU3RhdHVzQmFyKTogdm9pZCB7XG4gICAgY29uc3QgaXRlbSA9IHRoaXMuX2l0ZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBpdGVtLmNsYXNzTmFtZSA9ICdpbmxpbmUtYmxvY2snO1xuICAgIGl0ZW0uYWRkRXZlbnRMaXN0ZW5lcignbW91c2VlbnRlcicsICgpID0+IHtcbiAgICAgIHRoaXMuX2lzTW91c2VPdmVyID0gdHJ1ZTtcbiAgICB9KTtcbiAgICBpdGVtLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCAoKSA9PiB7XG4gICAgICB0aGlzLl9pc01vdXNlT3ZlciA9IGZhbHNlO1xuICAgIH0pO1xuICAgIHRoaXMuX3RpbGUgPSBzdGF0dXNCYXIuYWRkUmlnaHRUaWxlKHtcbiAgICAgIGl0ZW0sXG4gICAgICBwcmlvcml0eTogU1RBVFVTX0JBUl9QUklPUklUWSxcbiAgICB9KTtcblxuICAgIHRoaXMuX3JlbmRlcigpO1xuICB9XG5cbiAgY29uc3VtZU1lc3NhZ2VTdHJlYW0obWVzc2FnZVN0cmVhbTogT2JzZXJ2YWJsZTxBcnJheTxCdXN5U2lnbmFsTWVzc2FnZUJ1c3k+Pik6IHZvaWQge1xuICAgIG1lc3NhZ2VTdHJlYW0uc3Vic2NyaWJlKG1lc3NhZ2VzID0+IHtcbiAgICAgIHRoaXMuX21lc3NhZ2VzID0gbWVzc2FnZXMubWFwKG1lc3NhZ2UgPT4ge1xuICAgICAgICByZXR1cm4gbWVzc2FnZS5tZXNzYWdlO1xuICAgICAgfSk7XG4gICAgICB0aGlzLl9yZW5kZXIoKTtcbiAgICB9KTtcbiAgfVxuXG4gIF9yZW5kZXIoKTogdm9pZCB7XG4gICAgY29uc3QgcHJvcHMgPSB7XG4gICAgICBidXN5OiB0aGlzLl9tZXNzYWdlcy5sZW5ndGggIT09IDAsXG4gICAgfTtcblxuICAgIGNvbnN0IGl0ZW0gPSB0aGlzLl9pdGVtO1xuICAgIGlmIChpdGVtKSB7XG4gICAgICBSZWFjdERPTS5yZW5kZXIoPFN0YXR1c0JhclRpbGVDb21wb25lbnQgey4uLnByb3BzfSAvPiwgaXRlbSk7XG4gICAgICBpZiAodGhpcy5fdG9vbHRpcCkge1xuICAgICAgICB0aGlzLl90b29sdGlwLmRpc3Bvc2UoKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLl9tZXNzYWdlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHRoaXMuX3Rvb2x0aXAgPSBhdG9tLnRvb2x0aXBzLmFkZChpdGVtLCB7XG4gICAgICAgICAgdGl0bGU6IHRoaXMuX21lc3NhZ2VzLmpvaW4oJzxici8+JyksXG4gICAgICAgICAgZGVsYXk6IDAsXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAodGhpcy5faXNNb3VzZU92ZXIpIHtcbiAgICAgICAgICAvLyBJZiB0aGUgbW91c2UgaXMgY3VycmVudGx5IG92ZXIgdGhlIGVsZW1lbnQsIHdlIHdhbnQgdG8gdHJpZ2dlciB0aGUgbmV3IHBvcHVwIHRvIGFwcGVhci5cbiAgICAgICAgICBbJ21vdXNlb3ZlcicsICdtb3VzZWVudGVyJ11cbiAgICAgICAgICAgIC5tYXAobmFtZSA9PiBuZXcgTW91c2VFdmVudChuYW1lKSlcbiAgICAgICAgICAgIC5mb3JFYWNoKGV2ZW50ID0+IGl0ZW0uZGlzcGF0Y2hFdmVudChldmVudCkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iXX0=