'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _react = _interopRequireDefault(require('react'));

var _reactDom = _interopRequireDefault(require('react-dom'));

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// We want to be the furthest left on the right side of the status bar so as not to leave a
// conspicuous gap (or cause jitter) when nothing is busy.
const STATUS_BAR_PRIORITY = 1000; /**
                                   * Copyright (c) 2017-present, Facebook, Inc.
                                   * All rights reserved.
                                   *
                                   * This source code is licensed under the BSD-style license found in the
                                   * LICENSE file in the root directory of this source tree. An additional grant
                                   * of patent rights can be found in the PATENTS file in the same directory.
                                   *
                                   * 
                                   * @format
                                   */

/* global MouseEvent */

function StatusBarTileComponent(props) {
  const classes = (0, (_classnames || _load_classnames()).default)('atom-ide-busy-signal-status-bar', {
    'loading-spinner-tiny': props.busy
  });
  return _react.default.createElement('div', { className: classes });
}

class StatusBarTile {

  constructor(statusBar, messageStream) {
    this._item = document.createElement('div');
    this._tile = this._consumeStatusBar(statusBar);
    this._isMouseOver = false;
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(messageStream.subscribe(messages => this._render(messages)), () => {
      _reactDom.default.unmountComponentAtNode(this._item);
      this._tile.destroy();
      if (this._tooltip != null) {
        this._tooltip.dispose();
      }
    });
  }

  dispose() {
    this._disposables.dispose();
  }

  _consumeStatusBar(statusBar) {
    const item = this._item;
    item.className = 'inline-block';
    item.addEventListener('mouseenter', () => {
      this._isMouseOver = true;
    });
    item.addEventListener('mouseleave', () => {
      this._isMouseOver = false;
    });
    const tile = statusBar.addRightTile({
      item,
      priority: STATUS_BAR_PRIORITY
    });
    return tile;
  }

  _render(messages) {
    _reactDom.default.render(_react.default.createElement(StatusBarTileComponent, { busy: messages.length !== 0 }), this._item);
    if (this._tooltip) {
      this._tooltip.dispose();
      this._tooltip = null;
    }
    if (messages.length > 0) {
      this._tooltip = atom.tooltips.add(this._item, {
        title: messages.join('<br/>'),
        delay: 0
      });
      if (this._isMouseOver) {
        // If the mouse is currently over the element, we want to trigger the new popup to appear.
        ['mouseover', 'mouseenter'].map(name => new MouseEvent(name)).forEach(event => this._item.dispatchEvent(event));
      }
    }
  }
}
exports.default = StatusBarTile;