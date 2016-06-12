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
import {React, ReactDOM} from 'react-for-atom';
import {ContextViewPanel} from './ContextViewPanel';
import type {DefinitionService} from '../../nuclide-definition-service';
import {DefinitionPreviewView}
  from '../../nuclide-definition-preview/lib/DefinitionPreviewView';
import {getContent} from '../../nuclide-definition-preview/lib/DefinitionPreviewContent';
import {ProviderContainer} from './ProviderContainer';

export class ContextViewState {

  _width: number;
  _definitionService: DefinitionService;
  _panelDOMElement: ?HTMLElement;
  _atomPanel: atom$Panel;

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

  setDefinitionService(service: ?DefinitionService) {
    if (service != null) {
      this._definitionService = service;
    }

    if (this.isVisible()) {
      this._destroyPanel();
      this._show();
    }
  }

  toggle(): void {
    if (this.isVisible()) {
      this._destroyPanel();
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
      this._destroyPanel();
    }
  }

  getWidth(): number {
    return this._width;
  }

  isVisible(): boolean {
    return this._panelDOMElement != null;
  }

  _show(): void {
    const data = getContent(this._definitionService);
    const content = data.map(value => {
      if (value == null) {
        return null;
      }
      return {
        location: value.definition,
        grammar: value.grammar,
      };
    });

    this._panelDOMElement = document.createElement('div');
    // Render the panel in atom workspace
    ReactDOM.render(
      <ContextViewPanel
        initialWidth={300}
        onResize={newWidth => { this._width = newWidth; }}>
        <ProviderContainer title="Definition Preview">
          <DefinitionPreviewView data={content} />
        </ProviderContainer>
      </ContextViewPanel>,
      this._panelDOMElement
    );
    invariant(this._panelDOMElement != null);
    this._panelDOMElement.style.display = 'flex';
    this._panelDOMElement.style.height = 'inherit';

    this._atomPanel = atom.workspace.addRightPanel({
      item: this._panelDOMElement,
      priority: 200,
    });
  }

  _onResize(newWidth: number): void {
    this._width = newWidth;
  }

  _destroyPanel(): void {
    const tempHandle = this._panelDOMElement;
    if (tempHandle != null) {
      ReactDOM.unmountComponentAtNode(this._panelDOMElement);
      this._atomPanel.destroy();
    }

    this._panelDOMElement = null;
  }
}
