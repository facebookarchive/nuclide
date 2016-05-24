'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {CodePreviewContent} from './CodePreviewContent';
import type {DefinitionService} from '../../nuclide-definition-service';

import invariant from 'assert';
import {CodePreviewPanel} from './CodePreviewPanel';
import {Observable} from 'rxjs';
import {track} from '../../nuclide-analytics';
import {getContent} from './CodePreviewContent';

export class CodePreviewState {
  _panel: ?CodePreviewPanel;
  _width: number;
  _data: Observable<?CodePreviewContent>;

  constructor(width: number, visible: boolean) {
    this._width = width;

    this.setDefinitionService(null);
    if (visible) {
      this._show();
    }
  }

  setDefinitionService(service: ?DefinitionService) {
    if (service == null) {
      this._data = Observable.of(null);
    } else {
      this._data = getContent(service);
    }

    if (this.isVisible()) {
      this._hide();
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
    return this._panel == null ? this._width : this._panel.getWidth();
  }

  isVisible(): boolean {
    return this._panel != null;
  }

  _show(): void {
    invariant(this._panel == null);

    track('nuclide-definition-preview-show');

    this._panel = new CodePreviewPanel(this._width, this._data);
  }

  _hide(): void {
    this._destroyPanel();
  }

  _destroyPanel(): void {
    const outlineViewPanel = this._panel;
    invariant(outlineViewPanel != null);

    this._width = outlineViewPanel.getWidth();
    outlineViewPanel.dispose();
    this._panel = null;
  }
}
