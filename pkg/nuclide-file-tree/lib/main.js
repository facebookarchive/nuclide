'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.activate = activate;
exports.deactivate = deactivate;
exports.serialize = serialize;
exports.getContextMenuForFileTree = getContextMenuForFileTree;
exports.consumeWorkspaceViewsService = consumeWorkspaceViewsService;
exports.getProjectSelectionManagerForFileTree = getProjectSelectionManagerForFileTree;
exports.deserializeFileTreeSidebarComponent = deserializeFileTreeSidebarComponent;
exports.consumeWorkingSetsStore = consumeWorkingSetsStore;
exports.consumeCwdApi = consumeCwdApi;
exports.consumeRemoteProjectsService = consumeRemoteProjectsService;

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('../../commons-atom/featureConfig'));
}

var _viewableFromReactElement;

function _load_viewableFromReactElement() {
  return _viewableFromReactElement = require('../../commons-atom/viewableFromReactElement');
}

var _debounce;

function _load_debounce() {
  return _debounce = _interopRequireDefault(require('../../commons-node/debounce'));
}

var _observable;

function _load_observable() {
  return _observable = require('../../commons-node/observable');
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

var _Constants;

function _load_Constants() {
  return _Constants = require('./Constants');
}

var _react = _interopRequireDefault(require('react'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Minimum interval (in ms) between onChangeActivePaneItem events before revealing the active pane
 * item in the file tree.
 */
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

const OPEN_FILES_UPDATE_DEBOUNCE_INTERVAL_MS = 150;

class Activation {
  // Has the package state been restored from a previous session?
  constructor(state) {
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();

    this._fileTreeController = new (_FileTreeController || _load_FileTreeController()).default(state == null ? null : state.tree);
    this._restored = state != null && state.restored === true;

    const excludeVcsIgnoredPathsSetting = 'core.excludeVcsIgnoredPaths';
    const hideIgnoredNamesSetting = 'nuclide-file-tree.hideIgnoredNames';
    const ignoredNamesSetting = 'core.ignoredNames';
    const prefixKeyNavSetting = 'nuclide-file-tree.allowKeyboardPrefixNavigation';
    const allowPendingPaneItems = 'core.allowPendingPaneItems';

    this._disposables.add(this._fixContextMenuHighlight(), (_featureConfig || _load_featureConfig()).default.observe(prefixKeyNavSetting, x => this._setPrefixKeyNavSetting(x)), (_featureConfig || _load_featureConfig()).default.observe((_Constants || _load_Constants()).REVEAL_FILE_ON_SWITCH_SETTING, x => this._setRevealOnFileSwitch(x)), atom.config.observe(ignoredNamesSetting, x => this._setIgnoredNames(x)), (_featureConfig || _load_featureConfig()).default.observe(hideIgnoredNamesSetting, x => this._setHideIgnoredNames(x)), atom.config.observe(excludeVcsIgnoredPathsSetting, this._setExcludeVcsIgnoredPaths.bind(this)), atom.config.observe(allowPendingPaneItems, this._setUsePreviewTabs.bind(this)), atom.commands.add('atom-workspace', 'nuclide-file-tree:toggle-focus', () => {
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
    }));
  }

  _fixContextMenuHighlight() {
    // Giant hack to fix the context menu highlight
    // For explanation, see https://github.com/atom/atom/pull/13266

    const { showForEvent } = atom.contextMenu;
    const disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
      atom.contextMenu.showForEvent = showForEvent;
    });
    // $FlowIgnore: Undocumented API
    atom.contextMenu.showForEvent = function (event) {
      // $FlowFixMe: Add repeat() to type def
      const sub = (_observable || _load_observable()).nextAnimationFrame.repeat(3).last().subscribe(() => {
        showForEvent.call(atom.contextMenu, event);
        disposables.remove(sub);
      });
      disposables.add(sub);
    };

    return disposables;
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
    this._cwdApiSubscription = new (_UniversalDisposable || _load_UniversalDisposable()).default(() => controller.setCwdApi(null));
    return this._cwdApiSubscription;
  }

  consumeRemoteProjectsService(service) {
    const controller = this._fileTreeController;
    controller.setRemoteProjectsService(service);
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
      controller.setRemoteProjectsService(null);
    });
  }

  dispose() {
    this._deactivate();
    this._disposables.dispose();
  }

  serialize() {
    return {
      tree: this._fileTreeController.serialize(),
      restored: true
    };
  }

  consumeWorkingSetsStore(workingSetsStore) {
    this._fileTreeController.updateWorkingSetsStore(workingSetsStore);
    this._fileTreeController.updateWorkingSet(workingSetsStore.getCurrent());

    const currentSubscription = workingSetsStore.subscribeToCurrent(currentWorkingSet => {
      this._fileTreeController.updateWorkingSet(currentWorkingSet);
    });
    this._disposables.add(currentSubscription);

    let updateOpenFilesWorkingSet = this._fileTreeController.updateOpenFilesWorkingSet.bind(this._fileTreeController);

    this._disposables.add(() => {
      updateOpenFilesWorkingSet = () => {};
    });

    const rebuildOpenFilesWorkingSet = (0, (_debounce || _load_debounce()).default)(() => {
      const openUris = atom.workspace.getTextEditors().filter(te => te.getPath() != null && te.getPath() !== '').map(te => te.getPath());
      const openFilesWorkingSet = new (_nuclideWorkingSetsCommon || _load_nuclideWorkingSetsCommon()).WorkingSet(openUris);
      updateOpenFilesWorkingSet(openFilesWorkingSet);
    }, OPEN_FILES_UPDATE_DEBOUNCE_INTERVAL_MS);

    rebuildOpenFilesWorkingSet();

    const paneObservingDisposable = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    paneObservingDisposable.add(atom.workspace.onDidAddPaneItem(rebuildOpenFilesWorkingSet), atom.workspace.onDidDestroyPaneItem(rebuildOpenFilesWorkingSet));

    this._disposables.add(paneObservingDisposable);

    return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
      this._fileTreeController.updateWorkingSetsStore(null);
      this._fileTreeController.updateWorkingSet(new (_nuclideWorkingSetsCommon || _load_nuclideWorkingSetsCommon()).WorkingSet());
      this._fileTreeController.updateOpenFilesWorkingSet(new (_nuclideWorkingSetsCommon || _load_nuclideWorkingSetsCommon()).WorkingSet());
      paneObservingDisposable.dispose();
      this._disposables.remove(currentSubscription);
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

  getProjectSelectionManager() {
    if (!this._fileTreeController) {
      throw new Error('Invariant violation: "this._fileTreeController"');
    }

    return this._fileTreeController.getProjectSelectionManager();
  }

  _deactivate() {
    // Guard against deactivate being called twice
    this._fileTreeController.destroy();
  }

  _createView() {
    // Currently, we assume that only one will be created.
    this._fileTreeComponent = (0, (_viewableFromReactElement || _load_viewableFromReactElement()).viewableFromReactElement)(_react.default.createElement((_FileTreeSidebarComponent || _load_FileTreeSidebarComponent()).default, null));
    return this._fileTreeComponent;
  }

  consumeWorkspaceViewsService(api) {
    this._disposables.add(api.addOpener(uri => {
      if (uri === (_Constants || _load_Constants()).WORKSPACE_VIEW_URI) {
        return this._createView();
      }
    }), () => api.destroyWhere(item => item instanceof (_FileTreeSidebarComponent || _load_FileTreeSidebarComponent()).default), atom.commands.add('atom-workspace', 'nuclide-file-tree:toggle', event => {
      api.toggle((_Constants || _load_Constants()).WORKSPACE_VIEW_URI, event.detail);
    }));
    if (!this._restored) {
      api.open((_Constants || _load_Constants()).WORKSPACE_VIEW_URI, { searchAllPanes: true });
    }
  }

  deserializeFileTreeSidebarComponent() {
    return this._createView();
  }
}

let activation;
let deserializedState;
let onDidActivateDisposable;

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

function consumeWorkspaceViewsService(api) {
  if (!activation) {
    throw new Error('Invariant violation: "activation"');
  }

  activation.consumeWorkspaceViewsService(api);
}

function getProjectSelectionManagerForFileTree() {
  if (!activation) {
    throw new Error('Invariant violation: "activation"');
  }

  return activation.getProjectSelectionManager();
}

function deserializeFileTreeSidebarComponent() {
  if (!activation) {
    throw new Error('Invariant violation: "activation"');
  }

  return activation.deserializeFileTreeSidebarComponent();
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

function consumeRemoteProjectsService(service) {
  if (!activation) {
    throw new Error('Invariant violation: "activation"');
  }

  return activation.consumeRemoteProjectsService(service);
}