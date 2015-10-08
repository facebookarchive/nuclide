'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type NuclideToolbarType from './NuclideToolbar';
import type ProjectStoreType from './ProjectStore';

class Activation {

  _disposables: atom$CompositeDisposable;
  _initialBuildTarget: string;
  _item: ?HTMLElement;
  _panel: Object;
  _projectStore: ProjectStoreType;
  _nuclideToolbar: ?NuclideToolbarType;
  _state: Object;

  // Functions to be used as callbacks.
  _handleBuildTargetChange: Function;

  constructor(state: ?Object) {
    var {CompositeDisposable} = require('atom');
    var ProjectStore = require('./ProjectStore');

    this._state = {
      panelVisible: state != null && state.panelVisible != null ? state.panelVisible : true,
    };

    // Bind functions used as callbacks to ensure correct context when called.
    this._handleBuildTargetChange = this._handleBuildTargetChange.bind(this);

    this._disposables = new CompositeDisposable();
    this._initialBuildTarget = (state && state.initialBuildTarget) || '';
    this._projectStore = new ProjectStore();
    this._addCommands();
    this._createToolbar();
  }

  _addCommands(): void {
    this._disposables.add(
      atom.commands.add(
        'body',
        'nuclide-toolbar:toggle',
        () => { this.togglePanel(); },
      )
    );
  }

  _createToolbar() {
    var NuclideToolbar = require('./NuclideToolbar');
    var item = document.createElement('div');
    var {Disposable} = require('atom');
    var React = require('react-for-atom');

    this._nuclideToolbar = React.render(
      <NuclideToolbar
        initialBuildTarget={this._initialBuildTarget}
        onBuildTargetChange={this._handleBuildTargetChange}
        projectStore={this._projectStore}
      />,
      item
    );

    var panel = atom.workspace.addTopPanel({
      item,
    });
    this._disposables.add(new Disposable(() => panel.destroy()));
    this._panel = panel;
    this._updatePanelVisibility();
  }

  _handleBuildTargetChange(buildTarget: string) {
    this._initialBuildTarget = buildTarget;
  }

  /**
   * Show or hide the panel, if necessary, to match the current state.
   */
  _updatePanelVisibility(): void {
    if (!this._panel) {
      return;
    }
    if (this._state.panelVisible !== this._panel.visible) {
      if (this._state.panelVisible) {
        this._panel.show();
      } else {
        this._panel.hide();
      }
    }
  }

  serialize(): Object {
    return {
      initialBuildTarget: this._initialBuildTarget,
      panelVisible: this._state.panelVisible,
    };
  }

  dispose() {
    if (this._nuclideToolbar) {
      var React = require('react-for-atom');
      var toolbarNode = React.findDOMNode(this._nuclideToolbar);
      // If the toolbar is currently hidden for some reason, then toolbarNode will be null.
      if (toolbarNode) {
        React.unmountComponentAtNode(toolbarNode.parentNode);
      }
    }
    this._projectStore.dispose();
    this._disposables.dispose();
  }

  togglePanel():void {
    this._state.panelVisible = !this._state.panelVisible;
    this._updatePanelVisibility();
  }
}

var activation: ?Activation = null;
module.exports = {
  activate(state: ?Object) {
    if (!activation) {
      activation = new Activation(state);
    }
  },

  deactivate() {
    if (activation) {
      activation.dispose();
      activation = null;
    }
  },

  serialize(): Object {
    if (activation) {
      return activation.serialize();
    } else {
      return {};
    }
  },
};
