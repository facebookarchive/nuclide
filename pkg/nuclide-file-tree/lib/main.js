/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {FileTreeProjectSelectionManager} from './FileTreeController';
import type FileTreeContextMenu from './FileTreeContextMenu';
import type {ExportStoreData} from './FileTreeStore';
import type {CwdApi} from '../../nuclide-current-working-directory/lib/CwdApi';
import type {RemoteProjectsService} from '../../nuclide-remote-projects';
import type {WorkspaceViewsService} from '../../nuclide-workspace-views/lib/types';
import type {WorkingSetsStore} from '../../nuclide-working-sets/lib/types';

import invariant from 'assert';

import UniversalDisposable from '../../commons-node/UniversalDisposable';
import featureConfig from '../../commons-atom/featureConfig';
import {viewableFromReactElement} from '../../commons-atom/viewableFromReactElement';
import debounce from '../../commons-node/debounce';
import {nextAnimationFrame} from '../../commons-node/observable';

import FileTreeSidebarComponent from '../components/FileTreeSidebarComponent';
import FileTreeController from './FileTreeController';
import {WorkingSet} from '../../nuclide-working-sets-common';
import {REVEAL_FILE_ON_SWITCH_SETTING, WORKSPACE_VIEW_URI} from './Constants';
import React from 'react';

type SerializedState = {
  tree: ExportStoreData,
  restored: ?boolean,
};

/**
 * Minimum interval (in ms) between onChangeActivePaneItem events before revealing the active pane
 * item in the file tree.
 */
const OPEN_FILES_UPDATE_DEBOUNCE_INTERVAL_MS = 150;

class Activation {
  _cwdApiSubscription: ?IDisposable;
  _fileTreeController: FileTreeController;
  _fileTreeComponent: ?FileTreeSidebarComponent;
  _restored: boolean; // Has the package state been restored from a previous session?
  _disposables: UniversalDisposable;
  _paneItemSubscription: ?IDisposable;

  constructor(state: ?SerializedState) {
    this._disposables = new UniversalDisposable();

    this._fileTreeController = new FileTreeController(state == null ? null : state.tree);
    this._restored = state != null && state.restored === true;

    const excludeVcsIgnoredPathsSetting = 'core.excludeVcsIgnoredPaths';
    const hideIgnoredNamesSetting = 'nuclide-file-tree.hideIgnoredNames';
    const ignoredNamesSetting = 'core.ignoredNames';
    const prefixKeyNavSetting = 'nuclide-file-tree.allowKeyboardPrefixNavigation';
    const allowPendingPaneItems = 'core.allowPendingPaneItems';

    this._disposables.add(
      this._fixContextMenuHighlight(),
      featureConfig.observe(prefixKeyNavSetting, (x: any) => this._setPrefixKeyNavSetting(x)),
      featureConfig.observe(
        REVEAL_FILE_ON_SWITCH_SETTING,
        (x: any) => this._setRevealOnFileSwitch(x),
      ),
      atom.config.observe(ignoredNamesSetting, (x: any) => this._setIgnoredNames(x)),
      featureConfig.observe(hideIgnoredNamesSetting, (x: any) => this._setHideIgnoredNames(x)),
      atom.config.observe(
        excludeVcsIgnoredPathsSetting,
        this._setExcludeVcsIgnoredPaths.bind(this),
      ),
      atom.config.observe(allowPendingPaneItems, this._setUsePreviewTabs.bind(this)),
      atom.commands.add('atom-workspace', 'nuclide-file-tree:toggle-focus', () => {
        const component = this._fileTreeComponent;
        if (component == null) {
          return;
        }
        if (component.isFocused()) {
          // Focus the text editor.
          atom.workspace.getActivePane().activate();
        } else {
          // Focus the file tree.
          component.focus();
        }
      }),
    );
  }

  _fixContextMenuHighlight(): IDisposable {
    // Giant hack to fix the context menu highlight
    // For explanation, see https://github.com/atom/atom/pull/13266

    const {showForEvent} = atom.contextMenu;
    const disposables = new UniversalDisposable(() => {
      (atom.contextMenu: any).showForEvent = showForEvent;
    });
    // $FlowIgnore: Undocumented API
    atom.contextMenu.showForEvent = function(event) {
      // $FlowFixMe: Add repeat() to type def
      const sub = nextAnimationFrame.repeat(3).last().subscribe(() => {
        showForEvent.call(atom.contextMenu, event);
        disposables.remove(sub);
      });
      disposables.add(sub);
    };

    return disposables;
  }

  consumeCwdApi(cwdApi: CwdApi): IDisposable {
    invariant(this._fileTreeController);
    if (this._cwdApiSubscription != null) {
      this._cwdApiSubscription.dispose();
    }
    const controller = this._fileTreeController;
    controller.setCwdApi(cwdApi);
    this._cwdApiSubscription = new UniversalDisposable(() => controller.setCwdApi(null));
    return this._cwdApiSubscription;
  }

  consumeRemoteProjectsService(service: RemoteProjectsService): IDisposable {
    const controller = this._fileTreeController;
    controller.setRemoteProjectsService(service);
    return new UniversalDisposable(() => {
      controller.setRemoteProjectsService(null);
    });
  }

  dispose() {
    this._deactivate();
    this._disposables.dispose();
  }

  serialize(): ?SerializedState {
    return {
      tree: this._fileTreeController.serialize(),
      restored: true,
    };
  }

  consumeWorkingSetsStore(workingSetsStore: WorkingSetsStore): ?IDisposable {
    this._fileTreeController.updateWorkingSetsStore(workingSetsStore);
    this._fileTreeController.updateWorkingSet(workingSetsStore.getCurrent());

    const currentSubscription = workingSetsStore.subscribeToCurrent(currentWorkingSet => {
      this._fileTreeController.updateWorkingSet(currentWorkingSet);
    });
    this._disposables.add(currentSubscription);


    let updateOpenFilesWorkingSet = this._fileTreeController.updateOpenFilesWorkingSet.bind(
      this._fileTreeController,
    );

    this._disposables.add(() => {
      updateOpenFilesWorkingSet = () => {};
    });

    const rebuildOpenFilesWorkingSet = debounce(
      () => {
        const openUris = atom.workspace.getTextEditors()
          .filter(te => te.getPath() != null && te.getPath() !== '')
          .map(te => (te.getPath(): any));
        const openFilesWorkingSet = new WorkingSet(openUris);
        updateOpenFilesWorkingSet(openFilesWorkingSet);
      },
      OPEN_FILES_UPDATE_DEBOUNCE_INTERVAL_MS,
    );

    rebuildOpenFilesWorkingSet();

    const paneObservingDisposable = new UniversalDisposable();
    paneObservingDisposable.add(
      atom.workspace.onDidAddPaneItem(rebuildOpenFilesWorkingSet),
      atom.workspace.onDidDestroyPaneItem(rebuildOpenFilesWorkingSet),
    );

    this._disposables.add(paneObservingDisposable);

    return new UniversalDisposable(() => {
      this._fileTreeController.updateWorkingSetsStore(null);
      this._fileTreeController.updateWorkingSet(new WorkingSet());
      this._fileTreeController.updateOpenFilesWorkingSet(new WorkingSet());
      paneObservingDisposable.dispose();
      this._disposables.remove(currentSubscription);
      currentSubscription.dispose();
    });
  }

  _setExcludeVcsIgnoredPaths(excludeVcsIgnoredPaths: boolean): void {
    this._fileTreeController.setExcludeVcsIgnoredPaths(excludeVcsIgnoredPaths);
  }

  _setHideIgnoredNames(hideIgnoredNames: boolean): void {
    this._fileTreeController.setHideIgnoredNames(hideIgnoredNames);
  }

  _setIgnoredNames(ignoredNames: string | Array<string>) {
    let normalizedIgnoredNames;
    if (ignoredNames === '') {
      normalizedIgnoredNames = [];
    } else if (typeof ignoredNames === 'string') {
      normalizedIgnoredNames = [ignoredNames];
    } else {
      normalizedIgnoredNames = ignoredNames;
    }
    this._fileTreeController.setIgnoredNames(normalizedIgnoredNames);
  }

  _setRevealOnFileSwitch(shouldReveal: boolean) {
    if (shouldReveal) {
      // Guard against this getting called multiple times
      if (!this._paneItemSubscription) {
        this._paneItemSubscription = atom.workspace.onDidStopChangingActivePaneItem(
          this._fileTreeController.revealActiveFile.bind(
            this._fileTreeController,
            /* showIfHidden */ false,
          ),
        );
        this._disposables.add(this._paneItemSubscription);
      }
    } else {
      // Use a local so Flow can refine the type.
      const paneItemSubscription = this._paneItemSubscription;
      if (paneItemSubscription) {
        this._disposables.remove(paneItemSubscription);
        paneItemSubscription.dispose();
        this._paneItemSubscription = null;
      }
    }
  }

  _setPrefixKeyNavSetting(usePrefixNav: ?boolean): void {
    // config is void during startup, signifying no config yet
    if (usePrefixNav == null || !this._fileTreeController) {
      return;
    }
    this._fileTreeController.setUsePrefixNav(usePrefixNav);
  }

  _setUsePreviewTabs(usePreviewTabs: ?boolean): void {
    // config is void during startup, signifying no config yet
    if (usePreviewTabs == null) {
      return;
    }
    this._fileTreeController.setUsePreviewTabs(usePreviewTabs);
  }

  getContextMenu(): FileTreeContextMenu {
    invariant(this._fileTreeController);
    return this._fileTreeController.getContextMenu();
  }

  getProjectSelectionManager(): FileTreeProjectSelectionManager {
    invariant(this._fileTreeController);
    return this._fileTreeController.getProjectSelectionManager();
  }

  _deactivate() {
    // Guard against deactivate being called twice
    this._fileTreeController.destroy();
  }

  _createView(): FileTreeSidebarComponent {
    // Currently, we assume that only one will be created.
    this._fileTreeComponent = viewableFromReactElement(<FileTreeSidebarComponent />);
    return this._fileTreeComponent;
  }

  consumeWorkspaceViewsService(api: WorkspaceViewsService): void {
    this._disposables.add(
      api.addOpener(uri => {
        if (uri === WORKSPACE_VIEW_URI) {
          return this._createView();
        }
      }),
      () => api.destroyWhere(item => item instanceof FileTreeSidebarComponent),
      atom.commands.add(
        'atom-workspace',
        'nuclide-file-tree:toggle',
        event => { api.toggle(WORKSPACE_VIEW_URI, (event: any).detail); },
      ),
    );
    if (!this._restored) {
      api.open(WORKSPACE_VIEW_URI, {searchAllPanes: true});
    }
  }

  deserializeFileTreeSidebarComponent(): FileTreeSidebarComponent {
    return this._createView();
  }
}

let activation: ?Activation;
let deserializedState: ?SerializedState;
let onDidActivateDisposable: IDisposable;

function disableTreeViewPackage() {
  if (!atom.packages.isPackageDisabled('tree-view')) {
    // Calling `disablePackage` on a package first *loads* the package. This step must come
    // before calling `unloadPackage`.
    atom.packages.disablePackage('tree-view');
  }

  if (atom.packages.isPackageActive('tree-view')) {
    // Only *inactive* packages can be unloaded. Attempting to unload an active package is
    // considered an exception. Deactivating must come before unloading.
    atom.packages.deactivatePackage('tree-view');
  }

  if (atom.packages.isPackageLoaded('tree-view')) {
    atom.packages.unloadPackage('tree-view');
  }
}

export function activate(state: ?SerializedState): void {
  invariant(activation == null);
  // Disable Atom's bundled 'tree-view' package. If this activation is happening during the
  // normal startup activation, the `onDidActivateInitialPackages` handler below must unload the
  // 'tree-view' because it will have been loaded during startup.
  disableTreeViewPackage();

  // Disabling and unloading Atom's bundled 'tree-view' must happen after activation because this
  // package's `activate` is called during an traversal of all initial packages to activate.
  // Disabling a package during the traversal has no effect if this is a startup load because
  // `PackageManager` does not re-load the list of packages to activate after each iteration.
  onDidActivateDisposable = atom.packages.onDidActivateInitialPackages(() => {
    disableTreeViewPackage();
    onDidActivateDisposable.dispose();
  });

  deserializedState = state;
  activation = new Activation(deserializedState);
}

export function deactivate() {
  // Re-enable Atom's bundled 'tree-view' when this package is disabled to leave the user's
  // environment the way this package found it.
  if (featureConfig.isFeatureDisabled('nuclide-file-tree')
    && atom.packages.isPackageDisabled('tree-view')) {
    atom.packages.enablePackage('tree-view');
  }

  if (!onDidActivateDisposable.disposed) {
    onDidActivateDisposable.dispose();
  }

  if (activation) {
    activation.dispose();
    activation = null;
  }
}

export function serialize(): ?SerializedState {
  if (activation) {
    return activation.serialize();
  }
}

export function getContextMenuForFileTree(): FileTreeContextMenu {
  invariant(activation);
  return activation.getContextMenu();
}

export function consumeWorkspaceViewsService(api: WorkspaceViewsService): void {
  invariant(activation);
  activation.consumeWorkspaceViewsService(api);
}

export function getProjectSelectionManagerForFileTree(): FileTreeProjectSelectionManager {
  invariant(activation);
  return activation.getProjectSelectionManager();
}

export function deserializeFileTreeSidebarComponent(): FileTreeSidebarComponent {
  invariant(activation);
  return activation.deserializeFileTreeSidebarComponent();
}

export function consumeWorkingSetsStore(workingSetsStore: WorkingSetsStore): ?IDisposable {
  invariant(activation);

  return activation.consumeWorkingSetsStore(workingSetsStore);
}

export function consumeCwdApi(cwdApi: CwdApi): IDisposable {
  invariant(activation);
  return activation.consumeCwdApi(cwdApi);
}

export function consumeRemoteProjectsService(service: RemoteProjectsService): IDisposable {
  invariant(activation);
  return activation.consumeRemoteProjectsService(service);
}
