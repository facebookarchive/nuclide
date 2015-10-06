'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var React = require('react-for-atom');

var PanelComponent = require('./PanelComponent');

type PanelControllerState = {
  isVisible: boolean;
  resizableLength: number;
};

/**
 * Instantiating this class adds it to the UI (even if it's not visible).
 * It currently does this with `atom.workspace.addLeftPanel()` but should
 * support different sides in the future.
 */
class PanelController {
  _hostEl: HTMLElement;
  _panel: atom$Panel;

  constructor(
    childElement: ReactElement,
    props: {dock: string},
    state: ?PanelControllerState
  ) {
    this._hostEl = document.createElement('div');
    // Fill the entire panel with this div so content can also use 100% to fill
    // up the entire panel.
    this._hostEl.style.height = '100%';

    var shouldBeVisible = false;
    var initialLength = null;
    if (state) {
      props.initialLength = state.resizableLength;
      shouldBeVisible = state.isVisible;
    }

    this._component = React.render(
        <PanelComponent {...props}>{childElement}</PanelComponent>,
        this._hostEl);
    this._panel = atom.workspace.addLeftPanel({item: this._hostEl, visible: shouldBeVisible});
  }

  destroy(): void {
    React.unmountComponentAtNode(this._hostEl);
    this._panel.destroy();
  }

  toggle(): void {
    this.setVisible(!this.isVisible());
  }

  setVisible(shouldBeVisible: boolean): void {
    if (shouldBeVisible) {
      this._panel.show();
      this._component.focus();
    } else {
      this._panel.hide();
    }
  }

  isVisible(): boolean {
    return this._panel.isVisible();
  }

  getChildComponent(): ReactComponent {
    return this._component.getChildComponent();
  }

  serialize(): PanelControllerState {
    return {
      isVisible: this.isVisible(),
      resizableLength: this._component.getLength(),
    };
  }
}

module.exports = PanelController;
