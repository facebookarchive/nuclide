'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */


import invariant from 'assert';
import {ContextViewPanel} from './ContextViewPanel';

export class ContextViewState {

  _width: number;
  _contextViewPanel: ?ContextViewPanel;

  constructor(width: number, visible: boolean) {
    this._width = width;

    if (visible) {
      this._show();
    }
  }

  dispose(): void {
    if (this.isVisible()) {
      this._destroyPanel();
    }
  }

  toggle(): void {
    if (this.isVisible()) {
      this._hide();
    } else {
      this._show();
    }
  }

  show(): void {
    if (!this.isVisible()) {
      this._show();
    }
  }

  hide(): void {
    if (this.isVisible()) {
      this._hide();
    }
  }

  getWidth(): number {
    return this._width;
  }

  isVisible(): boolean {
    return this._contextViewPanel != null;
  }

  _show(): void {
    invariant(this._contextViewPanel == null);
    this._contextViewPanel = new ContextViewPanel(this._width);
  }

  _hide(): void {
    this._destroyPanel();
  }

  _destroyPanel(): void {
    const contextViewPanel = this._contextViewPanel;
    invariant(contextViewPanel != null);

    contextViewPanel.dispose();
    this._contextViewPanel = null;
  }
}
