'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/* eslint-env browser */

import type {Observable} from 'rx';

import type {BusySignalMessageBusy} from '../../nuclide-busy-signal-interfaces';

import {
  React,
  ReactDOM,
} from 'react-for-atom';
import {StatusBarTileComponent} from './StatusBarTileComponent';

// We want to be the furthest left on the right side of the status bar so as not to leave a
// conspicuous gap (or cause jitter) when nothing is busy.
const STATUS_BAR_PRIORITY = 1000;

export class StatusBarTile {
  _item: ?HTMLElement;
  _tile: ?atom$StatusBarTile;
  _tooltip: ?IDisposable;
  _isMouseOver: boolean;
  _messages: Array<string>;

  constructor() {
    this._messages = [];
    this._isMouseOver = false;
  }

  dispose(): void {
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

  consumeStatusBar(statusBar: atom$StatusBar): void {
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
      priority: STATUS_BAR_PRIORITY,
    });

    this._render();
  }

  consumeMessageStream(messageStream: Observable<Array<BusySignalMessageBusy>>): void {
    messageStream.subscribe(messages => {
      this._messages = messages.map(message => {
        return message.message;
      });
      this._render();
    });
  }

  _render(): void {
    const props = {
      busy: this._messages.length !== 0,
    };

    const item = this._item;
    if (item) {
      ReactDOM.render(<StatusBarTileComponent {...props} />, item);
      if (this._tooltip) {
        this._tooltip.dispose();
      }
      if (this._messages.length > 0) {
        this._tooltip = atom.tooltips.add(item, {
          title: this._messages.join('<br/>'),
          delay: 0,
        });
        if (this._isMouseOver) {
          // If the mouse is currently over the element, we want to trigger the new popup to appear.
          ['mouseover', 'mouseenter']
            .map(name => new MouseEvent(name))
            .forEach(event => item.dispatchEvent(event));
        }
      }
    }
  }
}
