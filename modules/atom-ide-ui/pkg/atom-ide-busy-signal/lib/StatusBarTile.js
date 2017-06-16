/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

/* global MouseEvent */

import type {Observable} from 'rxjs';

import classnames from 'classnames';
import React from 'react';
import ReactDOM from 'react-dom';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';

// We want to be the furthest left on the right side of the status bar so as not to leave a
// conspicuous gap (or cause jitter) when nothing is busy.
const STATUS_BAR_PRIORITY = 1000;

function StatusBarTileComponent(props: {busy: boolean}) {
  const classes = classnames('atom-ide-busy-signal-status-bar', {
    'loading-spinner-tiny': props.busy,
  });
  return <div className={classes} />;
}

export default class StatusBarTile {
  _item: HTMLElement;
  _tile: atom$StatusBarTile;
  _tooltip: ?IDisposable;
  _disposables: UniversalDisposable;
  _isMouseOver: boolean;

  constructor(
    statusBar: atom$StatusBar,
    messageStream: Observable<Array<string>>,
  ) {
    this._item = document.createElement('div');
    this._tile = this._consumeStatusBar(statusBar);
    this._isMouseOver = false;
    this._disposables = new UniversalDisposable(
      messageStream.subscribe(messages => this._render(messages)),
      () => {
        ReactDOM.unmountComponentAtNode(this._item);
        this._tile.destroy();
        if (this._tooltip != null) {
          this._tooltip.dispose();
        }
      },
    );
  }

  dispose(): void {
    this._disposables.dispose();
  }

  _consumeStatusBar(statusBar: atom$StatusBar): atom$StatusBarTile {
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
      priority: STATUS_BAR_PRIORITY,
    });
    return tile;
  }

  _render(messages: Array<string>): void {
    ReactDOM.render(
      <StatusBarTileComponent busy={messages.length !== 0} />,
      this._item,
    );
    if (this._tooltip) {
      this._tooltip.dispose();
      this._tooltip = null;
    }
    if (messages.length > 0) {
      this._tooltip = atom.tooltips.add(this._item, {
        title: messages.join('<br/>'),
        delay: 0,
      });
      if (this._isMouseOver) {
        // If the mouse is currently over the element, we want to trigger the new popup to appear.
        ['mouseover', 'mouseenter']
          .map(name => new MouseEvent(name))
          .forEach(event => this._item.dispatchEvent(event));
      }
    }
  }
}
