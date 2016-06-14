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
import {CompositeDisposable} from 'atom';
import {React, ReactDOM} from 'react-for-atom';
import {ContextViewPanel} from './ContextViewPanel';
import type {DefinitionService} from '../../nuclide-definition-service';
import {DefinitionPreviewView}
  from '../../nuclide-definition-preview/lib/DefinitionPreviewView';
import {getContent} from '../../nuclide-definition-preview/lib/DefinitionPreviewContent';
import {ProviderContainer} from './ProviderContainer';

export type ContextViewConfig = {
  width: number;
  visible: boolean;
};

export class ContextViewManager {

  _width: number;
  _disposables: CompositeDisposable;
  _definitionService: DefinitionService;
  _panelDOMElement: ?HTMLElement;
  _atomPanel: atom$Panel;

  constructor(width: number, visible: boolean) {
    this._width = width;
    this._disposables = new CompositeDisposable();

    this._bindShortcuts();

    if (visible) {
      this._show();
    }
  }

  dispose(): void {
    if (this.isVisible()) {
      this._destroyPanel();
    }
    this._disposables.dispose();
  }

  getWidth(): number {
    return this._width;
  }

  hide(): void {
    if (this.isVisible()) {
      this._destroyPanel();
    }
  }

  isVisible(): boolean {
    return this._panelDOMElement != null;
  }

  serialize(): ContextViewConfig {
    return {
      width: this._width,
      visible: this.isVisible(),
    };
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

  show(): void {
    if (!this.isVisible()) {
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

  _bindShortcuts() {
    // Bind toggle command
    this._disposables.add(
      atom.commands.add(
        'atom-workspace',
        'nuclide-context-view:toggle',
        this.toggle.bind(this)
      )
    );

    // Bind show command
    this._disposables.add(
      atom.commands.add(
        'atom-workspace',
        'nuclide-context-view:show',
        this.show.bind(this)
      )
    );

    // Bind hide command
    this._disposables.add(
      atom.commands.add(
        'atom-workspace',
        'nuclide-context-view:hide',
        this.hide.bind(this)
      )
    );
  }

  _destroyPanel(): void {
    const tempHandle = this._panelDOMElement;
    if (tempHandle != null) {
      ReactDOM.unmountComponentAtNode(this._panelDOMElement);
      this._atomPanel.destroy();
    }

    this._panelDOMElement = null;
  }

  _onResize(newWidth: number): void {
    this._width = newWidth;
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

}
