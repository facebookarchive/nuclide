'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Observable} from 'rx';

import React from 'react-for-atom';

import {StatusBarTileComponent} from './StatusBarTileComponent';

// Put us to the left of the remote connection icon.
const STATUS_BAR_PRIORITY = -100;

export class StatusBarTile {
  _item: ?HTMLElement;
  _tile: ?atom$StatusBarTile;
  _tooltip: ?atom$IDisposable;

  _messages: Array<string>;

  constructor() {
    this._messages = [];
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
  }

  consumeStatusBar(statusBar: atom$StatusBar): void {
    const item = this._item = document.createElement('div');
    item.className = 'inline-block';
    this._tile = statusBar.addLeftTile({
      item,
      priority: STATUS_BAR_PRIORITY,
    });

    this._render();
  }

  consumeMessageStream(messageStream: Observable<Array<BusySignalMessage>>): void {
    messageStream.subscribe(messages => {
      this._messages = messages.map(message => message.message);
      this._render();
    });
  }

  _render(): void {
    const props = {
      busy: this._messages.length !== 0,
    };

    const item = this._item;
    if (item) {
      React.render(<StatusBarTileComponent {...props}/>, item);
      if (this._tooltip) {
        this._tooltip.dispose();
      }
      if (this._messages.length > 0) {
        this._tooltip = atom.tooltips.add(item, {
          title: this._messages.join('<br/>'),
          delay: 0,
        });
      }
    }
  }
}
