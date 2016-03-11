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
import type {OutlineForUi} from './main';

import {React, ReactDOM} from 'react-for-atom';
import invariant from 'assert';

import {PanelComponent} from '../../ui/panel';

import {OutlineView} from './OutlineView';

export class OutlineViewPanelState {
  _outlines: Observable<?OutlineForUi>;
  _outlineViewPanel: ?OutlineViewPanel;

  constructor(outlines: Observable<?OutlineForUi>) {
    this._outlines = outlines;
    this._outlineViewPanel = null;
  }

  dispose(): void {
    if (this._isVisible()) {
      this._destroyPanel();
    }
  }

  toggle(): void {
    if (this._isVisible()) {
      this._hide();
    } else {
      this._show();
    }
  }

  _show(): void {
    invariant(this._outlineViewPanel == null);

    this._outlineViewPanel = new OutlineViewPanel(this._outlines);
  }

  _hide(): void {
    this._destroyPanel();
  }

  _isVisible(): boolean {
    return this._outlineViewPanel != null;
  }

  _destroyPanel(): void {
    const outlineViewPanel = this._outlineViewPanel;
    invariant(outlineViewPanel != null);

    outlineViewPanel.dispose();
    this._outlineViewPanel = null;
  }
}

class OutlineViewPanel {
  _panelDOMElement: HTMLElement;
  _panel: atom$Panel;

  constructor(outlines: Observable<?OutlineForUi>) {
    this._panelDOMElement = document.createElement('div');
    // Otherwise it does not fill the whole panel, which might be alright except it means that the
    // resize-handle doesn't extend all the way to the bottom.
    this._panelDOMElement.style.height = '100%';

    ReactDOM.render(
      <div style={{height: '100%'}}>
        <OutlineViewHeader />
        <PanelComponent
          dock="right">
          <OutlineView outlines={outlines} />
        </PanelComponent>
      </div>,
      this._panelDOMElement,
    );
    this._panel = atom.workspace.addRightPanel({
      item: this._panelDOMElement,
      priority: 200,
    });
  }

  dispose(): void {
    ReactDOM.unmountComponentAtNode(this._panelDOMElement);
    this._panel.destroy();
  }
}

class OutlineViewHeader extends React.Component {
  render(): React.Element {
    return (
      <div className="panel-heading">
        <span className="icon icon-list-unordered" />
        Outline View
      </div>
    );
  }
}
