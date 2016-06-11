'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {DefinitionPreviewContent} from './DefinitionPreviewContent';
import type {DefinitionService} from '../../nuclide-definition-service';

import invariant from 'assert';
import {DefinitionPreviewPanel} from './DefinitionPreviewPanel';
import {Observable} from 'rxjs';
import {getContent} from './DefinitionPreviewContent';

export class DefinitionPreviewState {
  _panel: ?DefinitionPreviewPanel;
  _data: Observable<?DefinitionPreviewContent>;

  constructor() {
    this.setDefinitionService(null);
  }

  setDefinitionService(service: ?DefinitionService) {
    if (service == null) {
      this._data = Observable.of(null);
    } else {
      this._data = getContent(service);
    }
    this.updatePanel();
  }

  updatePanel(): void {
    if (this._data != null) {
      this._panel = new DefinitionPreviewPanel(this._data);
    }
  }

  getDefinitionPreviewPanel(): ?DefinitionPreviewPanel {
    return this._panel;
  }

  dispose(): void {
    if (this._panel != null) {
      this._destroyPanel();
    }
  }

  _destroyPanel(): void {
    const outlineViewPanel = this._panel;
    invariant(outlineViewPanel != null);

    outlineViewPanel.dispose();
    this._panel = null;
  }
}
