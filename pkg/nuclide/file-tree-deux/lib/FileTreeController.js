'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {CompositeDisposable} = require('atom');
var {PanelController} = require('nuclide-panel');
var React = require('react-for-atom');

var PANEL_OPTIONS = {dock: 'left'};

export type FileTreeRootDirectoryState = {
  basePath: string;
  isRemote: boolean;
  expandedKeys: Array<string>;
  selectedKeys: Array<string>;
};

export type FileTreeControllerState = {
  panel: {
    isVisible: ?boolean;
  };
  tree: {
    roots: Array<FileTreeRootDirectoryState>
  };
};

class FileTreeController {
  _isVisible: boolean;
  _panelController: PanelController;
  _subscriptions: CompositeDisposable;

  constructor(state: ?FileTreeControllerState) {
    var panel = state && state.panel || {};
    // show the file tree by default
    this._isVisible = panel.isVisible != null ? panel.isVisible : true;
    this._initializePane(state);
    this._subscriptions = new CompositeDisposable();
    this._subscriptions.add(atom.commands.add(
      'atom-workspace',
      {
        'nuclide-file-tree-deux:toggle': () => this.toggleVisibility(),
      }
    ));
  }

  _initializePane(state: ?FileTreeControllerState): void {
    var panel = state && state.panel || {};
    this._panelController = new PanelController(
      <div>No project root</div>,
      PANEL_OPTIONS,
      panel
    );
    // panel controller will start out visible; toggle if necessary
    if (!this._isVisible) {
      this._panelController.toggle();
    }
  }

  toggleVisibility(): void {
    this._isVisible = !this._isVisible;
    this._panelController.toggle();
  }

  destroy(): void {
    this._panelController.destroy();
    this._subscriptions.dispose();
  }

  serialize(): FileTreeControllerState {
    return {
      panel: {
        isVisible: this._isVisible,
      },
      tree: {
        roots: [],
      },
    };
  }
}

module.exports = FileTreeController;
