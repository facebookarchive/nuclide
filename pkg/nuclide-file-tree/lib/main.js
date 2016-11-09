'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.activate = activate;
exports.deactivate = deactivate;
exports.serialize = serialize;
exports.getContextMenuForFileTree = getContextMenuForFileTree;
exports.consumeNuclideSideBar = consumeNuclideSideBar;
exports.consumeWorkingSetsStore = consumeWorkingSetsStore;
exports.consumeCwdApi = consumeCwdApi;

var _atom = require('atom');

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('../../commons-atom/featureConfig'));
}

var _debounce;

function _load_debounce() {
  return _debounce = _interopRequireDefault(require('../../commons-node/debounce'));
}

var _FileTreeSidebarComponent;

function _load_FileTreeSidebarComponent() {
  return _FileTreeSidebarComponent = _interopRequireDefault(require('../components/FileTreeSidebarComponent'));
}

var _FileTreeController;

function _load_FileTreeController() {
  return _FileTreeController = _interopRequireDefault(require('./FileTreeController'));
}

var _nuclideWorkingSetsCommon;

function _load_nuclideWorkingSetsCommon() {
  return _nuclideWorkingSetsCommon = require('../../nuclide-working-sets-common');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Minimum interval (in ms) between onChangeActivePaneItem events before revealing the active pane
 * item in the file tree.
 */
const OPEN_FILES_UPDATE_DEBOUNCE_INTERVAL_MS = 150;

const REVEAL_FILE_ON_SWITCH_SETTING = 'nuclide-file-tree.revealFileOnSwitch';

let Activation = class Activation {

  constructor(state) {
    this._packageState = state;
    this._subscriptions = new _atom.CompositeDisposable();

    this._fileTreeController = new (_FileTreeController || _load_FileTreeController()).default(this._packageState);

    const excludeVcsIgnoredPathsSetting = 'core.excludeVcsIgnoredPaths';
    const hideIgnoredNamesSetting = 'nuclide-file-tree.hideIgnoredNames';
    const ignoredNamesSetting = 'core.ignoredNames';
    const prefixKeyNavSetting = 'nuclide-file-tree.allowKeyboardPrefixNavigation';
    const allowPendingPaneItems = 'core.allowPendingPaneItems';

    this._subscriptions.add((_featureConfig || _load_featureConfig()).default.observe(prefixKeyNavSetting, this._setPrefixKeyNavSetting.bind(this)), (_featureConfig || _load_featureConfig()).default.observe(REVEAL_FILE_ON_SWITCH_SETTING, this._setRevealOnFileSwitch.bind(this)), atom.config.observe(ignoredNamesSetting, this._setIgnoredNames.bind(this)), (_featureConfig || _load_featureConfig()).default.observe(hideIgnoredNamesSetting, this._setHideIgnoredNames.bind(this)), atom.config.observe(excludeVcsIgnoredPathsSetting, this._setExcludeVcsIgnoredPaths.bind(this)), atom.config.observe(allowPendingPaneItems, this._setUsePreviewTabs.bind(this)));
  }

  consumeCwdApi(cwdApi) {
    if (!this._fileTreeController) {
      throw new Error('Invariant violation: "this._fileTreeController"');
    }

    if (this._cwdApiSubscription != null) {
      this._cwdApiSubscription.dispose();
    }
    const controller = this._fileTreeController;
    controller.setCwdApi(cwdApi);
    this._cwdApiSubscription = new _atom.Disposable(() => controller.setCwdApi(null));
    return this._cwdApiSubscription;
  }

  dispose() {
    this._deactivate();
    this._subscriptions.dispose();
  }

  serialize() {
    return this._fileTreeController.serialize();
  }

  consumeWorkingSetsStore(workingSetsStore) {
    this._fileTreeController.updateWorkingSetsStore(workingSetsStore);
    this._fileTreeController.updateWorkingSet(workingSetsStore.getCurrent());

    const currentSubscription = workingSetsStore.subscribeToCurrent(currentWorkingSet => {
      this._fileTreeController.updateWorkingSet(currentWorkingSet);
    });
    this._subscriptions.add(currentSubscription);

    let updateOpenFilesWorkingSet = this._fileTreeController.updateOpenFilesWorkingSet.bind(this._fileTreeController);

    this._subscriptions.add(new _atom.Disposable(() => {
      updateOpenFilesWorkingSet = () => {};
    }));

    const rebuildOpenFilesWorkingSet = (0, (_debounce || _load_debounce()).default)(() => {
      const openUris = atom.workspace.getTextEditors().filter(te => te.getPath() != null && te.getPath() !== '').map(te => te.getPath());
      const openFilesWorkingSet = new (_nuclideWorkingSetsCommon || _load_nuclideWorkingSetsCommon()).WorkingSet(openUris);
      updateOpenFilesWorkingSet(openFilesWorkingSet);
    }, OPEN_FILES_UPDATE_DEBOUNCE_INTERVAL_MS);

    rebuildOpenFilesWorkingSet();

    const paneObservingDisposable = new _atom.CompositeDisposable();
    paneObservingDisposable.add(atom.workspace.onDidAddPaneItem(rebuildOpenFilesWorkingSet));
    paneObservingDisposable.add(atom.workspace.onDidDestroyPaneItem(rebuildOpenFilesWorkingSet));

    this._subscriptions.add(paneObservingDisposable);

    return new _atom.Disposable(() => {
      this._fileTreeController.updateWorkingSetsStore(null);
      this._fileTreeController.updateWorkingSet(new (_nuclideWorkingSetsCommon || _load_nuclideWorkingSetsCommon()).WorkingSet());
      this._fileTreeController.updateOpenFilesWorkingSet(new (_nuclideWorkingSetsCommon || _load_nuclideWorkingSetsCommon()).WorkingSet());
      paneObservingDisposable.dispose();
      this._subscriptions.remove(currentSubscription);
      currentSubscription.dispose();
    });
  }

  _setExcludeVcsIgnoredPaths(excludeVcsIgnoredPaths) {
    this._fileTreeController.setExcludeVcsIgnoredPaths(excludeVcsIgnoredPaths);
  }

  _setHideIgnoredNames(hideIgnoredNames) {
    this._fileTreeController.setHideIgnoredNames(hideIgnoredNames);
  }

  _setIgnoredNames(ignoredNames) {
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

  _setRevealOnFileSwitch(shouldReveal) {
    if (shouldReveal) {
      // Guard against this getting called multiple times
      if (!this._paneItemSubscription) {
        this._paneItemSubscription = atom.workspace.onDidStopChangingActivePaneItem(this._fileTreeController.revealActiveFile.bind(this._fileTreeController,
        /* showIfHidden */false));
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

  _setPrefixKeyNavSetting(usePrefixNav) {
    // config is void during startup, signifying no config yet
    if (usePrefixNav == null || !this._fileTreeController) {
      return;
    }
    this._fileTreeController.setUsePrefixNav(usePrefixNav);
  }

  _setUsePreviewTabs(usePreviewTabs) {
    // config is void during startup, signifying no config yet
    if (usePreviewTabs == null) {
      return;
    }
    this._fileTreeController.setUsePreviewTabs(usePreviewTabs);
  }

  getContextMenu() {
    if (!this._fileTreeController) {
      throw new Error('Invariant violation: "this._fileTreeController"');
    }

    return this._fileTreeController.getContextMenu();
  }

  _deactivate() {
    // Guard against deactivate being called twice
    this._fileTreeController.destroy();
  }
};


let activation;
let deserializedState;
let onDidActivateDisposable;
let sideBarDisposable;

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

function activate(state) {
  if (!(activation == null)) {
    throw new Error('Invariant violation: "activation == null"');
  }
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

function deactivate() {
  // Re-enable Atom's bundled 'tree-view' when this package is disabled to leave the user's
  // environment the way this package found it.
  if ((_featureConfig || _load_featureConfig()).default.isFeatureDisabled('nuclide-file-tree') && atom.packages.isPackageDisabled('tree-view')) {
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
}

function serialize() {
  if (activation) {
    return activation.serialize();
  }
}

function getContextMenuForFileTree() {
  if (!activation) {
    throw new Error('Invariant violation: "activation"');
  }

  return activation.getContextMenu();
}

function consumeNuclideSideBar(sidebar) {
  if (!activation) {
    throw new Error('Invariant violation: "activation"');
  }

  sidebar.registerView({
    getComponent: function () {
      return (_FileTreeSidebarComponent || _load_FileTreeSidebarComponent()).default;
    },
    onDidShow: function () {
      // If "Reveal File on Switch" is enabled, ensure the scroll position is synced to where the
      // user expects when the side bar shows the file tree.
      if ((_featureConfig || _load_featureConfig()).default.get(REVEAL_FILE_ON_SWITCH_SETTING)) {
        atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-file-tree:reveal-active-file');
      }
    },

    title: 'File Tree',
    toggleCommand: 'nuclide-file-tree:toggle',
    viewId: 'nuclide-file-tree'
  });

  sideBarDisposable = new _atom.Disposable(() => {
    sidebar.destroyView('nuclide-file-tree');
  });

  return sideBarDisposable;
}

function consumeWorkingSetsStore(workingSetsStore) {
  if (!activation) {
    throw new Error('Invariant violation: "activation"');
  }

  return activation.consumeWorkingSetsStore(workingSetsStore);
}

function consumeCwdApi(cwdApi) {
  if (!activation) {
    throw new Error('Invariant violation: "activation"');
  }

  return activation.consumeCwdApi(cwdApi);
}