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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _reactForAtom = require('react-for-atom');

var _reactForAtom2 = _interopRequireDefault(_reactForAtom);

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
        _reactForAtom2['default'].render(_reactForAtom2['default'].createElement(_StatusBarTileComponent.StatusBarTileComponent, props), item);
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
//# sourceMappingURL=data:application/json;base64,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QUFZLEVBQUU7O0FBRXJCLGFBQUMsV0FBVyxFQUFFLFlBQVksQ0FBQyxDQUN4QixHQUFHLENBQUMsVUFBQSxJQUFJO3FCQUFJLElBQUksVUFBVSxDQUFDLElBQUksQ0FBQzthQUFBLENBQUMsQ0FDakMsT0FBTyxDQUFDLFVBQUEsS0FBSztxQkFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQzthQUFBLENBQUMsQ0FBQztXQUNoRDtTQUNGO09BQ0Y7S0FDRjs7O1NBM0VVLGFBQWEiLCJmaWxlIjoiU3RhdHVzQmFyVGlsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtPYnNlcnZhYmxlfSBmcm9tICdyeCc7XG5cbmltcG9ydCB0eXBlIHtCdXN5U2lnbmFsTWVzc2FnZUJ1c3l9IGZyb20gJy4uLy4uL2J1c3ktc2lnbmFsLWludGVyZmFjZXMnO1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuXG5pbXBvcnQge1N0YXR1c0JhclRpbGVDb21wb25lbnR9IGZyb20gJy4vU3RhdHVzQmFyVGlsZUNvbXBvbmVudCc7XG5cbi8vIFdlIHdhbnQgdG8gYmUgdGhlIGZ1cnRoZXN0IGxlZnQgb24gdGhlIHJpZ2h0IHNpZGUgb2YgdGhlIHN0YXR1cyBiYXIgc28gYXMgbm90IHRvIGxlYXZlIGFcbi8vIGNvbnNwaWN1b3VzIGdhcCAob3IgY2F1c2Ugaml0dGVyKSB3aGVuIG5vdGhpbmcgaXMgYnVzeS5cbmNvbnN0IFNUQVRVU19CQVJfUFJJT1JJVFkgPSAxMDAwO1xuXG5leHBvcnQgY2xhc3MgU3RhdHVzQmFyVGlsZSB7XG4gIF9pdGVtOiA/SFRNTEVsZW1lbnQ7XG4gIF90aWxlOiA/YXRvbSRTdGF0dXNCYXJUaWxlO1xuICBfdG9vbHRpcDogP2F0b20kSURpc3Bvc2FibGU7XG4gIF9pc01vdXNlT3ZlcjogYm9vbGVhbjtcbiAgX21lc3NhZ2VzOiBBcnJheTxzdHJpbmc+O1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX21lc3NhZ2VzID0gW107XG4gICAgdGhpcy5faXNNb3VzZU92ZXIgPSBmYWxzZTtcbiAgfVxuXG4gIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX3RpbGUpIHtcbiAgICAgIHRoaXMuX3RpbGUuZGVzdHJveSgpO1xuICAgICAgdGhpcy5fdGlsZSA9IG51bGw7XG4gICAgICB0aGlzLl9pdGVtID0gbnVsbDtcbiAgICB9XG4gICAgaWYgKHRoaXMuX3Rvb2x0aXApIHtcbiAgICAgIHRoaXMuX3Rvb2x0aXAuZGlzcG9zZSgpO1xuICAgICAgdGhpcy5fdG9vbHRpcCA9IG51bGw7XG4gICAgfVxuICAgIHRoaXMuX2lzTW91c2VPdmVyID0gZmFsc2U7XG4gIH1cblxuICBjb25zdW1lU3RhdHVzQmFyKHN0YXR1c0JhcjogYXRvbSRTdGF0dXNCYXIpOiB2b2lkIHtcbiAgICBjb25zdCBpdGVtID0gdGhpcy5faXRlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGl0ZW0uY2xhc3NOYW1lID0gJ2lubGluZS1ibG9jayc7XG4gICAgaXRlbS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgKCkgPT4ge1xuICAgICAgdGhpcy5faXNNb3VzZU92ZXIgPSB0cnVlO1xuICAgIH0pO1xuICAgIGl0ZW0uYWRkRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsICgpID0+IHtcbiAgICAgIHRoaXMuX2lzTW91c2VPdmVyID0gZmFsc2U7XG4gICAgfSk7XG4gICAgdGhpcy5fdGlsZSA9IHN0YXR1c0Jhci5hZGRSaWdodFRpbGUoe1xuICAgICAgaXRlbSxcbiAgICAgIHByaW9yaXR5OiBTVEFUVVNfQkFSX1BSSU9SSVRZLFxuICAgIH0pO1xuXG4gICAgdGhpcy5fcmVuZGVyKCk7XG4gIH1cblxuICBjb25zdW1lTWVzc2FnZVN0cmVhbShtZXNzYWdlU3RyZWFtOiBPYnNlcnZhYmxlPEFycmF5PEJ1c3lTaWduYWxNZXNzYWdlQnVzeT4+KTogdm9pZCB7XG4gICAgbWVzc2FnZVN0cmVhbS5zdWJzY3JpYmUobWVzc2FnZXMgPT4ge1xuICAgICAgdGhpcy5fbWVzc2FnZXMgPSBtZXNzYWdlcy5tYXAobWVzc2FnZSA9PiB7XG4gICAgICAgIHJldHVybiBtZXNzYWdlLm1lc3NhZ2U7XG4gICAgICB9KTtcbiAgICAgIHRoaXMuX3JlbmRlcigpO1xuICAgIH0pO1xuICB9XG5cbiAgX3JlbmRlcigpOiB2b2lkIHtcbiAgICBjb25zdCBwcm9wcyA9IHtcbiAgICAgIGJ1c3k6IHRoaXMuX21lc3NhZ2VzLmxlbmd0aCAhPT0gMCxcbiAgICB9O1xuXG4gICAgY29uc3QgaXRlbSA9IHRoaXMuX2l0ZW07XG4gICAgaWYgKGl0ZW0pIHtcbiAgICAgIFJlYWN0LnJlbmRlcig8U3RhdHVzQmFyVGlsZUNvbXBvbmVudCB7Li4ucHJvcHN9Lz4sIGl0ZW0pO1xuICAgICAgaWYgKHRoaXMuX3Rvb2x0aXApIHtcbiAgICAgICAgdGhpcy5fdG9vbHRpcC5kaXNwb3NlKCk7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5fbWVzc2FnZXMubGVuZ3RoID4gMCkge1xuICAgICAgICB0aGlzLl90b29sdGlwID0gYXRvbS50b29sdGlwcy5hZGQoaXRlbSwge1xuICAgICAgICAgIHRpdGxlOiB0aGlzLl9tZXNzYWdlcy5qb2luKCc8YnIvPicpLFxuICAgICAgICAgIGRlbGF5OiAwLFxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKHRoaXMuX2lzTW91c2VPdmVyKSB7XG4gICAgICAgICAgLy8gSWYgdGhlIG1vdXNlIGlzIGN1cnJlbnRseSBvdmVyIHRoZSBlbGVtZW50LCB3ZSB3YW50IHRvIHRyaWdnZXIgdGhlIG5ldyBwb3B1cCB0byBhcHBlYXIuXG4gICAgICAgICAgWydtb3VzZW92ZXInLCAnbW91c2VlbnRlciddXG4gICAgICAgICAgICAubWFwKG5hbWUgPT4gbmV3IE1vdXNlRXZlbnQobmFtZSkpXG4gICAgICAgICAgICAuZm9yRWFjaChldmVudCA9PiBpdGVtLmRpc3BhdGNoRXZlbnQoZXZlbnQpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIl19