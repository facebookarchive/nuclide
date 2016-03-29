'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {FileTreeControllerState} from './FileTreeController';
import type FileTreeControllerType from './FileTreeController';
import type {NuclideSideBarService} from '../../nuclide-side-bar';
import type {CwdApi} from '../../nuclide-current-working-directory/lib/CwdApi';

import {Disposable, CompositeDisposable} from 'atom';
import invariant from 'assert';

import featureConfig from '../../nuclide-feature-config';

import {WorkingSet} from '../../nuclide-working-sets';
import type {WorkingSetsStore} from '../../nuclide-working-sets/lib/WorkingSetsStore';

import semver from 'semver';

/**
 * Minimum interval (in ms) between onChangeActivePaneItem events before revealing the active pane
 * item in the file tree.
 */
const ACTIVE_PANE_DEBOUNCE_INTERVAL_MS = 150;

const REVEAL_FILE_ON_SWITCH_SETTING = 'nuclide-file-tree.revealFileOnSwitch';

class Activation {
  _cwdApiSubscription: ?IDisposable;
  _fileTreeController: FileTreeControllerType;
  _packageState: ?FileTreeControllerState;
  _subscriptions: CompositeDisposable;
  _paneItemSubscription: ?Disposable;

  constructor(state: ?FileTreeControllerState) {
    this._packageState = state;
    this._subscriptions = new CompositeDisposable();

    const FileTreeController = require('./FileTreeController');
    this._fileTreeController = new FileTreeController(this._packageState);

    const excludeVcsIgnoredPathsSetting = 'core.excludeVcsIgnoredPaths';
    const hideIgnoredNamesSetting = 'nuclide-file-tree.hideIgnoredNames';
    const ignoredNamesSetting = 'core.ignoredNames';
    const prefixKeyNavSetting = 'nuclide-file-tree.allowKeyboardPrefixNavigation';
    const usePreviewTabs = 'tabs.usePreviewTabs';
    const allowPendingPaneItems = 'core.allowPendingPaneItems';

    this._subscriptions.add(
      featureConfig.observe(prefixKeyNavSetting, this._setPrefixKeyNavSetting.bind(this)),
      featureConfig.observe(REVEAL_FILE_ON_SWITCH_SETTING, this._setRevealOnFileSwitch.bind(this)),
      atom.config.observe(ignoredNamesSetting, this._setIgnoredNames.bind(this)),
      featureConfig.observe(hideIgnoredNamesSetting, this._setHideIgnoredNames.bind(this)),
      atom.config.observe(
        excludeVcsIgnoredPathsSetting,
        this._setExcludeVcsIgnoredPaths.bind(this),
      ),
    );

    // The use preview tabs setting was removed from 'tabs' package in atom 1.6 and moved to core
    // instead. Until Atoms <1.6.0 are supported we need to be ready for both
    if (semver.gte(atom.getVersion(), '1.6.0')) {
      this._subscriptions.add(
        atom.config.observe(allowPendingPaneItems, this._setUsePreviewTabs.bind(this)),
      );
    } else {
      this._subscriptions.add(
        atom.config.observe(usePreviewTabs, this._setUsePreviewTabs.bind(this)),
      );
    }
  }

  consumeCwdApi(cwdApi: CwdApi): IDisposable {
    invariant(this._fileTreeController);
    if (this._cwdApiSubscription != null) {
      this._cwdApiSubscription.dispose();
    }
    const controller = this._fileTreeController;
    controller.setCwdApi(cwdApi);
    this._cwdApiSubscription = new Disposable(() => controller.setCwdApi(null));
    return this._cwdApiSubscription;
  }

  dispose() {
    this._deactivate();
    this._subscriptions.dispose();
  }

  serialize(): ?FileTreeControllerState {
    return this._fileTreeController.serialize();
  }

  consumeWorkingSetsStore(workingSetsStore: WorkingSetsStore): ?IDisposable {
    this._fileTreeController.updateWorkingSetsStore(workingSetsStore);
    this._fileTreeController.updateWorkingSet(workingSetsStore.getCurrent());

    const currentSubscription = workingSetsStore.subscribeToCurrent(currentWorkingSet => {
      this._fileTreeController.updateWorkingSet(currentWorkingSet);
    });
    this._subscriptions.add(currentSubscription);

    const rebuildOpenFilesWorkingSet = () => {
      const openUris = atom.workspace.getTextEditors()
        .filter(te => te.getPath() != null && te.getPath() !== '')
        .map(te => (te.getPath(): any));
      const openFilesWorkingSet = new WorkingSet(openUris);
      this._fileTreeController.updateOpenFilesWorkingSet(openFilesWorkingSet);
    };

    rebuildOpenFilesWorkingSet();

    const paneObservingDisposable = new CompositeDisposable();
    paneObservingDisposable.add(atom.workspace.onDidAddPaneItem(rebuildOpenFilesWorkingSet));
    paneObservingDisposable.add(atom.workspace.onDidDestroyPaneItem(rebuildOpenFilesWorkingSet));

    this._subscriptions.add(paneObservingDisposable);

    return new Disposable(() => {
      this._fileTreeController.updateWorkingSetsStore(null);
      this._fileTreeController.updateWorkingSet(new WorkingSet());
      this._fileTreeController.updateOpenFilesWorkingSet(new WorkingSet());
      paneObservingDisposable.dispose();
      this._subscriptions.remove(currentSubscription);
      currentSubscription.dispose();
    });
  }

  _setExcludeVcsIgnoredPaths(excludeVcsIgnoredPaths: boolean): void {
    this._fileTreeController.setExcludeVcsIgnoredPaths(excludeVcsIgnoredPaths);
  }

  _setHideIgnoredNames(hideIgnoredNames: boolean): void {
    this._fileTreeController.setHideIgnoredNames(hideIgnoredNames);
  }

  _setIgnoredNames(ignoredNames: string|Array<string>) {
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
    const {onWorkspaceDidStopChangingActivePaneItem} =
      require('../../nuclide-atom-helpers').atomEventDebounce;

    if (shouldReveal) {
      const reveal = () => {
        this._fileTreeController.revealActiveFile(/* showIfHidden */ false);
      };
      // Guard against this getting called multiple times
      if (!this._paneItemSubscription) {
        // Debounce tab change events to limit unneeded scrolling when changing or closing tabs
        // in quick succession.
        this._paneItemSubscription = onWorkspaceDidStopChangingActivePaneItem(
          reveal,
          ACTIVE_PANE_DEBOUNCE_INTERVAL_MS
        );
        this._subscriptions.add(this._paneItemSubscription);
      }
    } else {
      // Use a local so Flow can refine the type.
      const paneItemSubscription = this._paneItemSubscription;
      if (paneItemSubscription) {
        this._subscriptions.remove(paneItemSubscription);
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

  _deactivate() {
    // Guard against deactivate being called twice
    this._fileTreeController.destroy();
  }
}

let activation: ?Activation;
let deserializedState: ?FileTreeControllerState;
let onDidActivateDisposable: IDisposable;
let sideBarDisposable: ?IDisposable;

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

module.exports = {
  activate(state: ?FileTreeControllerState): void {
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
  },

  deactivate() {
    const nuclideFeatures = require('../../../lib/nuclideFeatures');

    // Re-enable Atom's bundled 'tree-view' when this package is disabled to leave the user's
    // environment the way this package found it.
    if (nuclideFeatures.isFeatureDisabled('nuclide-file-tree')
      && atom.packages.isPackageDisabled('tree-view')) {
      atom.packages.enablePackage('tree-view');
    }

    if (sideBarDisposable != null) {
      sideBarDisposable.dispose();
    }

    if (!onDidActivateDisposable.disposed) {
      onDidActivateDisposable.dispose();
    }

    if (activation) {
      activation.dispose();
      activation = null;
    }
  },

  serialize(): ?FileTreeControllerState {
    if (activation) {
      return activation.serialize();
    }
  },

  consumeNuclideSideBar(sidebar: NuclideSideBarService): IDisposable {
    invariant(activation);

    sidebar.registerView({
      getComponent() { return require('../components/FileTreeSidebarComponent'); },
      onDidShow() {
        // If "Reveal File on Switch" is enabled, ensure the scroll position is synced to where the
        // user expects when the side bar shows the file tree.
        if (featureConfig.get(REVEAL_FILE_ON_SWITCH_SETTING)) {
          atom.commands.dispatch(
            atom.views.getView(atom.workspace),
            'nuclide-file-tree:reveal-active-file'
          );
        }
      },
      toggleCommand: 'nuclide-file-tree:toggle',
      viewId: 'nuclide-file-tree',
    });

    sideBarDisposable = new Disposable(() => {
      sidebar.destroyView('nuclide-file-tree');
    });

    return sideBarDisposable;
  },

  consumeWorkingSetsStore(workingSetsStore: WorkingSetsStore): ?IDisposable {
    invariant(activation);

    return activation.consumeWorkingSetsStore(workingSetsStore);
  },

  consumeCwdApi(cwdApi: CwdApi): IDisposable {
    invariant(activation);
    return activation.consumeCwdApi(cwdApi);
  },
};
