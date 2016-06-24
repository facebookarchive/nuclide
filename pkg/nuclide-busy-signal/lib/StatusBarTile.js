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

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _StatusBarTileComponent2;

function _StatusBarTileComponent() {
  return _StatusBarTileComponent2 = require('./StatusBarTileComponent');
}

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
        (_reactForAtom2 || _reactForAtom()).ReactDOM.render((_reactForAtom2 || _reactForAtom()).React.createElement((_StatusBarTileComponent2 || _StatusBarTileComponent()).StatusBarTileComponent, props), item);
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
              return new window.MouseEvent(name);
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