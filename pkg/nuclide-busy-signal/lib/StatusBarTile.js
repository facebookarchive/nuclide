'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.StatusBarTile = undefined;

var _react = _interopRequireDefault(require('react'));

var _reactDom = _interopRequireDefault(require('react-dom'));

var _StatusBarTileComponent;

function _load_StatusBarTileComponent() {
  return _StatusBarTileComponent = require('./StatusBarTileComponent');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// We want to be the furthest left on the right side of the status bar so as not to leave a
// conspicuous gap (or cause jitter) when nothing is busy.
const STATUS_BAR_PRIORITY = 1000; /**
                                   * Copyright (c) 2015-present, Facebook, Inc.
                                   * All rights reserved.
                                   *
                                   * This source code is licensed under the license found in the LICENSE file in
                                   * the root directory of this source tree.
                                   *
                                   * 
                                   */

/* global MouseEvent */

class StatusBarTile {

  constructor() {
    this._messages = [];
    this._isMouseOver = false;
  }

  dispose() {
    if (this._item) {
      _reactDom.default.unmountComponentAtNode(this._item);
      this._item = null;
    }
    if (this._tile) {
      this._tile.destroy();
      this._tile = null;
    }
    if (this._tooltip) {
      this._tooltip.dispose();
      this._tooltip = null;
    }
    this._isMouseOver = false;
  }

  consumeStatusBar(statusBar) {
    const item = this._item = document.createElement('div');
    item.className = 'inline-block';
    item.addEventListener('mouseenter', () => {
      this._isMouseOver = true;
    });
    item.addEventListener('mouseleave', () => {
      this._isMouseOver = false;
    });
    this._tile = statusBar.addRightTile({
      item,
      priority: STATUS_BAR_PRIORITY
    });

    this._render();
  }

  consumeMessageStream(messageStream) {
    messageStream.subscribe(messages => {
      this._messages = messages.map(message => {
        return message.message;
      });
      this._render();
    });
  }

  _render() {
    const props = {
      busy: this._messages.length !== 0
    };

    const item = this._item;
    if (item) {
      _reactDom.default.render(_react.default.createElement((_StatusBarTileComponent || _load_StatusBarTileComponent()).StatusBarTileComponent, props), item);
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
          ['mouseover', 'mouseenter'].map(name => new MouseEvent(name)).forEach(event => item.dispatchEvent(event));
        }
      }
    }
  }
}
exports.StatusBarTile = StatusBarTile;