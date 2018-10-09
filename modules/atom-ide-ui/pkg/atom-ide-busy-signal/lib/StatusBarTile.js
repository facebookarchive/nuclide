"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var React = _interopRequireWildcard(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _collection() {
  const data = require("../../../../nuclide-commons/collection");

  _collection = function () {
    return data;
  };

  return data;
}

function _Icon() {
  const data = require("../../../../nuclide-commons-ui/Icon");

  _Icon = function () {
    return data;
  };

  return data;
}

function _BusyMessageInstance() {
  const data = require("./BusyMessageInstance");

  _BusyMessageInstance = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 */
// We want to be the furthest left on the right side of the status bar so as not to leave a
// conspicuous gap (or cause jitter) when nothing is busy.
const STATUS_BAR_PRIORITY = 1000;

function StatusBarTileComponent(props) {
  let element;

  if (props.waitingForUser) {
    element = React.createElement(_Icon().Icon, {
      className: "busy-signal-status-bar",
      icon: "unverified"
    });
  } else if (props.waitingForComputer) {
    element = React.createElement("div", {
      className: "busy-signal-status-bar loading-spinner-tiny"
    });
  } else {
    element = null;
  }

  if (props.onDidClick != null) {
    element = React.createElement("a", {
      onClick: props.onDidClick
    }, element);
  }

  return element;
}

class StatusBarTile {
  constructor(statusBar, messageStream) {
    this._messages = [];
    this._isMouseOverItem = false;
    this._isMouseOverTooltip = 0;
    this._item = document.createElement('div');
    this._tile = this._createTile(statusBar);
    this._disposables = new (_UniversalDisposable().default)(messageStream.subscribe(messages => this._handleMessages(messages)));
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

      this._ensureTooltip();
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

  _handleMessages(messages) {
    this._messages = messages;
    const onDidClicks = (0, _collection().arrayCompact)(messages.map(m => m._onDidClick));
    const props = {
      waitingForComputer: messages.some(m => m.waitingFor === 'computer'),
      waitingForUser: messages.some(m => m.waitingFor === 'user'),
      onDidClick: onDidClicks.length > 0 ? () => onDidClicks.forEach(callback => callback()) : null
    };

    _reactDom.default.render(React.createElement(StatusBarTileComponent, props), this._item);

    const revealTooltip = messages.some(message => message.shouldRevealTooltip());

    if (this._tooltip != null) {
      // If the user already had the tooltip up, then we'll either
      // refresh it or hide it. No matter what, we'll have to unmount it.
      this._disposeTooltip(); // There are two reasons to refresh the tooltip (bringing it back):
      // 1) the mouse was previously over the tile or the tooltip
      // 2) one of the messages is marked with 'reveal tooltip'


      if (messages.length > 0 && (revealTooltip || this._isMouseOverItem || this._isMouseOverTooltip)) {
        this._ensureTooltip();
      } else {
        this._isMouseOverItem = false;
      }
    } else if (revealTooltip) {
      this._ensureTooltip();
    }
  }

  _disposeTooltip() {
    if (this._tooltip != null) {
      this._tooltip.dispose();

      this._tooltip = null;
      this._isMouseOverTooltip = 0;
    }
  }

  _ensureTooltip() {
    if (this._tooltip != null) {
      return;
    }

    const body = document.createElement('div');

    for (const message of this._messages) {
      if (body.childElementCount > 0) {
        body.appendChild(document.createElement('br'));
      }

      const titleElement = message.getTitleElement();

      if (!(titleElement != null)) {
        throw new Error("Invariant violation: \"titleElement != null\"");
      }

      body.appendChild(titleElement);
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
      this._leaveTimeoutId = setTimeout(() => {
        this._disposeTooltip(); // Currently visible messages should no longer reveal the tooltip again.


        this._messages.forEach(message => message.setRevealTooltip(false));
      }, 200);
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