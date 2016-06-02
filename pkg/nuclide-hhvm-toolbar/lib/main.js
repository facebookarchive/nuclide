'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {DistractionFreeModeProvider} from '../../nuclide-distraction-free-mode';
import type {GetToolBar} from '../../commons-atom/suda-tool-bar';
import type {BuildSystem, BuildSystemRegistry} from '../../nuclide-build/lib/types';
import type {CwdApi} from '../../nuclide-current-working-directory/lib/CwdApi';

import type NuclideToolbarType from './NuclideToolbar';
import type ProjectStoreType from './ProjectStore';

import {CompositeDisposable, Disposable} from 'atom';
import {React, ReactDOM} from 'react-for-atom';
import invariant from 'assert';
import HhvmIcon from './ui/HhvmIcon';
import HhvmBuildSystem from './HhvmBuildSystem';

class Activation {

  _disposables: atom$CompositeDisposable;
  _item: ?HTMLElement;
  _panel: Object;
  _projectStore: ProjectStoreType;
  _nuclideToolbar: ?NuclideToolbarType;
  _state: Object;
  _buildSystem: ?HhvmBuildSystem;
  _cwdApi: ?CwdApi;

  constructor(state: ?Object) {
    const ProjectStore = require('./ProjectStore');

    this._state = {
      panelVisible: state != null && state.panelVisible != null ? state.panelVisible : true,
    };

    this._disposables = new CompositeDisposable();
    this._projectStore = new ProjectStore();
    this._addCommands();
    this._createToolbar();
  }

  setCwdApi(cwdApi: ?CwdApi) {
    this._cwdApi = cwdApi;
    if (this._buildSystem != null) {
      this._buildSystem.setCwdApi(cwdApi);
    }
  }

  _addCommands(): void {
    this._disposables.add(
      atom.commands.add(
        'body',
        'nuclide-hhvm-toolbar:toggle',
        () => { this.togglePanel(); },
      )
    );
  }

  consumeToolBar(getToolBar: GetToolBar): void {
    const toolBar = getToolBar('nuclide-buck-toolbar');
    const toolBarButton = toolBar.addButton({
      callback: 'nuclide-hhvm-toolbar:toggle',
      tooltip: 'Toggle HHVM Toolbar',
      priority: 500,
    })[0];
    toolBar.addSpacer({
      priority: 501,
    });
    ReactDOM.render(
      <div className="hhvm-toolbar-icon-container">
        <HhvmIcon width="37%" />
      </div>,
      toolBarButton,
    );
    this._disposables.add(
      new Disposable(() => {
        ReactDOM.unmountComponentAtNode(toolBarButton);
        toolBar.removeItems();
      }),
    );
  }

  consumeBuildSystemRegistry(registry: BuildSystemRegistry): void {
    this._disposables.add(registry.register(this._getBuildSystem()));
  }

  _getBuildSystem(): BuildSystem {
    if (this._buildSystem == null) {
      const buildSystem = new HhvmBuildSystem();
      if (this._cwdApi != null) {
        buildSystem.setCwdApi(this._cwdApi);
      }
      this._buildSystem = buildSystem;
    }
    return this._buildSystem;
  }


  getDistractionFreeModeProvider(): DistractionFreeModeProvider {
    return {
      name: 'nuclide-hhvm-toolbar',
      isVisible: () => this._state.panelVisible,
      toggle: () => this.togglePanel(),
    };
  }

  _createToolbar() {
    const NuclideToolbar = require('./NuclideToolbar');
    const item = document.createElement('div');

    const component = ReactDOM.render(
      <NuclideToolbar
        projectStore={this._projectStore}
      />,
      item
    );
    invariant(component instanceof NuclideToolbar);
    this._nuclideToolbar = component;

    const panel = atom.workspace.addTopPanel({
      item,
      // Increase priority (default is 100) to ensure this toolbar comes after the 'tool-bar'
      // package's toolbar. Hierarchically the controlling toolbar should be above, and practically
      // this ensures the popover in this build toolbar stacks on top of other UI.
      priority: 200,
    });
    this._disposables.add(new Disposable(() => panel.destroy()));
    this._panel = panel;
    this._updatePanelVisibility();
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
      panelVisible: this._state.panelVisible,
    };
  }

  dispose() {
    if (this._nuclideToolbar) {
      const toolbarNode = ReactDOM.findDOMNode(this._nuclideToolbar);
      // If the toolbar is currently hidden for some reason, then toolbarNode will be null.
      if (toolbarNode) {
        ReactDOM.unmountComponentAtNode(toolbarNode.parentNode);
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

let activation: ?Activation = null;

export function activate(state: ?Object) {
  if (!activation) {
    activation = new Activation(state);
  }
}

export function consumeBuildSystemRegistry(registry: BuildSystemRegistry): void {
  invariant(activation);
  activation.consumeBuildSystemRegistry(registry);
}

export function consumeCwdApi(api: CwdApi): IDisposable {
  invariant(activation);
  activation.setCwdApi(api);
  return new Disposable(() => {
    if (activation != null) {
      activation.setCwdApi(null);
    }
  });
}

export function consumeToolBar(getToolBar: (group: string) => Object): void {
  invariant(activation);
  return activation.consumeToolBar(getToolBar);
}

export function getDistractionFreeModeProvider(): DistractionFreeModeProvider {
  invariant(activation != null);
  return activation.getDistractionFreeModeProvider();
}

export function deactivate() {
  if (activation != null) {
    activation.dispose();
    activation = null;
  }
}

export function serialize(): Object {
  if (activation != null) {
    return activation.serialize();
  } else {
    return {};
  }
}
