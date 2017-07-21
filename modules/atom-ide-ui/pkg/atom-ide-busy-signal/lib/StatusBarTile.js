/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import type {Observable} from 'rxjs';
import type {BusyTarget} from './MessageStore';

import React from 'react';
import ReactDOM from 'react-dom';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {Icon} from 'nuclide-commons-ui/Icon';

// We want to be the furthest left on the right side of the status bar so as not to leave a
// conspicuous gap (or cause jitter) when nothing is busy.
const STATUS_BAR_PRIORITY = 1000;

function StatusBarTileComponent(props: {target: BusyTarget}) {
  if (props.target.waitingForUser) {
    return (
      <Icon className="atom-ide-busy-signal-status-bar" icon="unverified" />
    );
  } else if (props.target.waitingForComputer) {
    return (
      <div className="atom-ide-busy-signal-status-bar loading-spinner-tiny" />
    );
  } else {
    return null;
  }
}

export default class StatusBarTile {
  _item: HTMLElement;
  _tile: atom$StatusBarTile;
  _tooltip: ?IDisposable;
  _disposables: UniversalDisposable;
  _messages: Array<HTMLElement> = [];
  _isMouseOverItem: boolean = false;
  _isMouseOverTooltip: number = 0;
  _leaveTimeoutId: ?number;

  constructor(
    statusBar: atom$StatusBar,
    messageStream: Observable<Array<HTMLElement>>,
    targetStream: Observable<BusyTarget>,
  ) {
    this._item = document.createElement('div');
    this._tile = this._createTile(statusBar);
    this._disposables = new UniversalDisposable(
      messageStream.subscribe(messages => this._handleMessages(messages)),
      targetStream.subscribe(target => this._handleTarget(target)),
    );
  }

  dispose(): void {
    ReactDOM.unmountComponentAtNode(this._item);
    this._tile.destroy();
    if (this._tooltip != null) {
      this._tooltip.dispose();
    }
    this._disposables.dispose();
  }

  _createTile(statusBar: atom$StatusBar): atom$StatusBarTile {
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
      priority: STATUS_BAR_PRIORITY,
    });
    return tile;
  }

  _handleTarget(target: BusyTarget): void {
    ReactDOM.render(<StatusBarTileComponent target={target} />, this._item);
    if (!target.waitingForComputer && !target.waitingForUser) {
      this._disposeTooltip();
      this._isMouseOverItem = false;
    }
  }

  _handleMessages(messages: Array<HTMLElement>): void {
    this._messages = messages;
    // If the tooltip is already up, we must refresh it
    if (this._tooltip != null) {
      this._disposeTooltip();
      this._addTooltipIfNecessary();
    }
  }

  _disposeTooltip(): void {
    if (this._tooltip != null) {
      this._tooltip.dispose();
      this._tooltip = null;
      this._isMouseOverTooltip = 0;
    }
  }

  _addTooltipIfNecessary(): void {
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
      trigger: 'manual',
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

  _startLeaveTimeoutIfNecessary(): void {
    if (
      !this._isMouseOverItem &&
      this._isMouseOverTooltip === 0 &&
      this._leaveTimeoutId == null
    ) {
      this._leaveTimeoutId = setTimeout(this._disposeTooltip.bind(this), 200);
    }
  }

  _stopLeaveTimeout(): void {
    if (this._leaveTimeoutId != null) {
      clearTimeout(this._leaveTimeoutId);
      this._leaveTimeoutId = null;
    }
  }
}
