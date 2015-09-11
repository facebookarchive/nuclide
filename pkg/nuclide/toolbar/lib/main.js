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

  // Functions to be used as callbacks.
  _handleBuildTargetChange: Function;

  constructor(state: ?Object) {
    var {CompositeDisposable} = require('atom');
    var ProjectStore = require('./ProjectStore');

    // Bind functions used as callbacks to ensure correct context when called.
    this._handleBuildTargetChange = this._handleBuildTargetChange.bind(this);

    this._disposables = new CompositeDisposable();
    this._initialBuildTarget = (state && state.initialBuildTarget) || '';
    this._projectStore = new ProjectStore();
    this._createToolbar();
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
  }

  _handleBuildTargetChange(buildTarget: string) {
    this._initialBuildTarget = buildTarget;
  }

  serialize(): Object {
    return {initialBuildTarget: this._initialBuildTarget};
  }

  dispose() {
    if (this._nuclideToolbar) {
      var React = require('react-for-atom');
      React.unmountComponentAtNode(React.findDOMNode(this._nuclideToolbar).parentNode);
    }
    this._projectStore.dispose();
    this._disposables.dispose();
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
