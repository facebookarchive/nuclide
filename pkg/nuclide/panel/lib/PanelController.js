'use babel';
/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
/* @flow */

var React = require('react-for-atom');

var PanelComponent = require('./PanelComponent');


type PanelControllerState = {
  isVisible: boolean;
  width: number;
};

/**
 * Instantiating this class adds it to the UI (even if it's not visible).
 * It currently does this with `atom.workspace.addLeftPanel()` but should
 * support different sides in the future.
 */
class PanelController {
  /**
   * @param childElement should use PanelController.getEventHandlerSelector() to
   *     get the selector it needs for its eventHandlerSelector prop.
   */
  constructor(childElement: ReactElement, state: ?PanelControllerState) {
    this._hostEl = document.createElement('div');

    var props = {};
    var shouldBeVisible = false;
    if (state) {
      props.initialContainerWidthInPixels = state.width;
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
    return this._component.refs['child'];
  }

  serialize(): PanelControllerState {
    return {
      isVisible: this.isVisible(),
      width: this._component.getContainerWidthInPixels(),
    };
  }
}

PanelController.getEventHandlerSelector = () => '.nuclide-panel-component-content';

module.exports = PanelController;
