'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = _interopRequireDefault(require('react'));

var _reactDom = _interopRequireDefault(require('react-dom'));

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _Icon;

function _load_Icon() {
  return _Icon = require('nuclide-commons-ui/Icon');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// We want to be the furthest left on the right side of the status bar so as not to leave a
// conspicuous gap (or cause jitter) when nothing is busy.
/**
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

const STATUS_BAR_PRIORITY = 1000;

function StatusBarTileComponent(props) {
  if (props.target.waitingForUser) {
    return _react.default.createElement((_Icon || _load_Icon()).Icon, { className: 'atom-ide-busy-signal-status-bar', icon: 'unverified' });
  } else if (props.target.waitingForComputer) {
    return _react.default.createElement('div', { className: 'atom-ide-busy-signal-status-bar loading-spinner-tiny' });
  } else {
    return null;
  }
}

class StatusBarTile {

  constructor(statusBar, messageStream, targetStream) {
    this._messages = [];
    this._isMouseOverItem = false;
    this._isMouseOverTooltip = 0;

    this._item = document.createElement('div');
    this._tile = this._createTile(statusBar);
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(messageStream.subscribe(messages => this._handleMessages(messages)), targetStream.subscribe(target => this._handleTarget(target)));
  }

  dispose() {
    _reactDom.default.unmountComponentAtNode(this._item);
    this._tile.destroy();
    if (this._tooltip != null) {
      this._tooltip.dispose();
    }
    this._disposables.dispose();
  }

  _createTile(statusBar) {
    const item = this._item;
    item.className = 'inline-block';
    item.addEventListener('mouseenter', () => {
      this._isMouseOverItem = true;
      this._stopLeaveTimeout();
      this._addTooltipIfNecessary();
    });
    item.addEventListener('mouseleave', () => {
      this._isMouseOverItem = false;
      this._startLeaveTimeoutIfNecessary();
    });
    const tile = statusBar.addRightTile({
      item,
      priority: STATUS_BAR_PRIORITY
    });
    return tile;
  }

  _handleTarget(target) {
    _reactDom.default.render(_react.default.createElement(StatusBarTileComponent, { target: target }), this._item);
    if (!target.waitingForComputer && !target.waitingForUser) {
      this._disposeTooltip();
      this._isMouseOverItem = false;
    }
  }

  _handleMessages(messages) {
    this._messages = messages;
    // If the tooltip is already up, we must refresh it
    if (this._tooltip != null) {
      this._disposeTooltip();
      this._addTooltipIfNecessary();
    }
  }

  _disposeTooltip() {
    if (this._tooltip != null) {
      this._tooltip.dispose();
      this._tooltip = null;
      this._isMouseOverTooltip = 0;
    }
  }

  _addTooltipIfNecessary() {
    if (this._tooltip != null) {
      return;
    }
    const body = document.createElement('div');
    for (const message of this._messages) {
      if (body.childElementCount > 0) {
        body.appendChild(document.createElement('br'));
      }
      body.appendChild(message);
    }

    this._tooltip = atom.tooltips.add(this._item, {
      item: body,
      delay: 0,
      trigger: 'manual'
    });
    const tooltipAtomObjects = atom.tooltips.tooltips.get(this._item);
    if (tooltipAtomObjects != null) {
      for (const tooltipAtomObject of tooltipAtomObjects) {
        const div = tooltipAtomObject.getTooltipElement();
        div.addEventListener('mouseenter', () => {
          this._isMouseOverTooltip++;
          this._stopLeaveTimeout();
        });
        div.addEventListener('mouseleave', () => {
          this._isMouseOverTooltip--;
          this._startLeaveTimeoutIfNecessary();
        });
      }
    }
  }

  _startLeaveTimeoutIfNecessary() {
    if (!this._isMouseOverItem && this._isMouseOverTooltip === 0 && this._leaveTimeoutId == null) {
      this._leaveTimeoutId = setTimeout(this._disposeTooltip.bind(this), 200);
    }
  }

  _stopLeaveTimeout() {
    if (this._leaveTimeoutId != null) {
      clearTimeout(this._leaveTimeoutId);
      this._leaveTimeoutId = null;
    }
  }
}
exports.default = StatusBarTile;