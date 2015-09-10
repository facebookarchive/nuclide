'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
var ProjectStore = require('./ProjectStore');

class Activation {

  _disposables: atom$CompositeDisposable;
  _initialBuildTarget: string;
  _item: ?HTMLElement;
  _panel: Object;
  _projectStore: ProjectStore;
  _nuclideToolbar: ?NuclideToolbar;

  constructor(state: ?Object) {
    var {CompositeDisposable} = require('atom');
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

  serialize(): Object {
    var state = {};
    // TODO(mbolin): If the toolbar has since been hidden/removed, should
    // serialize the last value that was displayed in it, or failing that,
    // this._initialBuildTarget, so it is available the next time the toolbar is
    // displayed.
    if (this._nuclideToolbar) {
      state.initialBuildTarget = this._nuclideToolbar.getBuildTarget();
    }
    return state;
  }

  dispose() {
    if (this._nuclideToolbar) {
      require('react-for-atom').unmountComponentAtNode(
          this._nuclideToolbar.getDOMNode().parentNode);
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
