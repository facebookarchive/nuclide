'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.StatusBarTile = undefined;

var _reactForAtom = require('react-for-atom');

var _StatusBarTileComponent;

function _load_StatusBarTileComponent() {
  return _StatusBarTileComponent = require('./StatusBarTileComponent');
}

// We want to be the furthest left on the right side of the status bar so as not to leave a
// conspicuous gap (or cause jitter) when nothing is busy.
const STATUS_BAR_PRIORITY = 1000;

let StatusBarTile = exports.StatusBarTile = class StatusBarTile {

  constructor() {
    this._messages = [];
    this._isMouseOver = false;
  }

  dispose() {
    if (this._item) {
      _reactForAtom.ReactDOM.unmountComponentAtNode(this._item);
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
      item: item,
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
      _reactForAtom.ReactDOM.render(_reactForAtom.React.createElement((_StatusBarTileComponent || _load_StatusBarTileComponent()).StatusBarTileComponent, props), item);
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
          ['mouseover', 'mouseenter'].map(name => new window.MouseEvent(name)).forEach(event => item.dispatchEvent(event));
        }
      }
    }
  }
};