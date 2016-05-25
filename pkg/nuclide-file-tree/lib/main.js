Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.activate = activate;
exports.deactivate = deactivate;
exports.serialize = serialize;
exports.getContextMenuForFileTree = getContextMenuForFileTree;
exports.consumeNuclideSideBar = consumeNuclideSideBar;
exports.consumeWorkingSetsStore = consumeWorkingSetsStore;
exports.consumeCwdApi = consumeCwdApi;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _nuclideFeatureConfig2;

function _nuclideFeatureConfig() {
  return _nuclideFeatureConfig2 = _interopRequireDefault(require('../../nuclide-feature-config'));
}

var _libNuclideFeatures2;

function _libNuclideFeatures() {
  return _libNuclideFeatures2 = require('../../../lib/nuclide-features');
}

var _commonsNodeDebounce2;

function _commonsNodeDebounce() {
  return _commonsNodeDebounce2 = _interopRequireDefault(require('../../commons-node/debounce'));
}

var _commonsAtomDebounced2;

function _commonsAtomDebounced() {
  return _commonsAtomDebounced2 = require('../../commons-atom/debounced');
}

var _nuclideWorkingSets2;

function _nuclideWorkingSets() {
  return _nuclideWorkingSets2 = require('../../nuclide-working-sets');
}

var _semver2;

function _semver() {
  return _semver2 = _interopRequireDefault(require('semver'));
}

/**
 * Minimum interval (in ms) between onChangeActivePaneItem events before revealing the active pane
 * item in the file tree.
 */
var ACTIVE_PANE_DEBOUNCE_INTERVAL_MS = 150;
var OPEN_FILES_UPDATE_DEBOUNCE_INTERVAL_MS = 150;

var REVEAL_FILE_ON_SWITCH_SETTING = 'nuclide-file-tree.revealFileOnSwitch';

var Activation = (function () {
  function Activation(state) {
    _classCallCheck(this, Activation);

    this._packageState = state;
    this._subscriptions = new (_atom2 || _atom()).CompositeDisposable();

    var FileTreeController = require('./FileTreeController');
    this._fileTreeController = new FileTreeController(this._packageState);

    var excludeVcsIgnoredPathsSetting = 'core.excludeVcsIgnoredPaths';
    var hideIgnoredNamesSetting = 'nuclide-file-tree.hideIgnoredNames';
    var ignoredNamesSetting = 'core.ignoredNames';
    var prefixKeyNavSetting = 'nuclide-file-tree.allowKeyboardPrefixNavigation';
    var usePreviewTabs = 'tabs.usePreviewTabs';
    var allowPendingPaneItems = 'core.allowPendingPaneItems';

    this._subscriptions.add((_nuclideFeatureConfig2 || _nuclideFeatureConfig()).default.observe(prefixKeyNavSetting, this._setPrefixKeyNavSetting.bind(this)), (_nuclideFeatureConfig2 || _nuclideFeatureConfig()).default.observe(REVEAL_FILE_ON_SWITCH_SETTING, this._setRevealOnFileSwitch.bind(this)), atom.config.observe(ignoredNamesSetting, this._setIgnoredNames.bind(this)), (_nuclideFeatureConfig2 || _nuclideFeatureConfig()).default.observe(hideIgnoredNamesSetting, this._setHideIgnoredNames.bind(this)), atom.config.observe(excludeVcsIgnoredPathsSetting, this._setExcludeVcsIgnoredPaths.bind(this)));

    // The use preview tabs setting was removed from 'tabs' package in atom 1.6 and moved to core
    // instead. Until Atoms <1.6.0 are supported we need to be ready for both
    if ((_semver2 || _semver()).default.gte(atom.getVersion(), '1.6.0')) {
      this._subscriptions.add(atom.config.observe(allowPendingPaneItems, this._setUsePreviewTabs.bind(this)));
    } else {
      this._subscriptions.add(atom.config.observe(usePreviewTabs, this._setUsePreviewTabs.bind(this)));
    }
  }

  _createClass(Activation, [{
    key: 'consumeCwdApi',
    value: function consumeCwdApi(cwdApi) {
      (0, (_assert2 || _assert()).default)(this._fileTreeController);
      if (this._cwdApiSubscription != null) {
        this._cwdApiSubscription.dispose();
      }
      var controller = this._fileTreeController;
      controller.setCwdApi(cwdApi);
      this._cwdApiSubscription = new (_atom2 || _atom()).Disposable(function () {
        return controller.setCwdApi(null);
      });
      return this._cwdApiSubscription;
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._deactivate();
      this._subscriptions.dispose();
    }
  }, {
    key: 'serialize',
    value: function serialize() {
      return this._fileTreeController.serialize();
    }
  }, {
    key: 'consumeWorkingSetsStore',
    value: function consumeWorkingSetsStore(workingSetsStore) {
      var _this = this;

      this._fileTreeController.updateWorkingSetsStore(workingSetsStore);
      this._fileTreeController.updateWorkingSet(workingSetsStore.getCurrent());

      var currentSubscription = workingSetsStore.subscribeToCurrent(function (currentWorkingSet) {
        _this._fileTreeController.updateWorkingSet(currentWorkingSet);
      });
      this._subscriptions.add(currentSubscription);

      var updateOpenFilesWorkingSet = this._fileTreeController.updateOpenFilesWorkingSet.bind(this._fileTreeController);

      this._subscriptions.add(new (_atom2 || _atom()).Disposable(function () {
        updateOpenFilesWorkingSet = function () {};
      }));

      var rebuildOpenFilesWorkingSet = (0, (_commonsNodeDebounce2 || _commonsNodeDebounce()).default)(function () {
        var openUris = atom.workspace.getTextEditors().filter(function (te) {
          return te.getPath() != null && te.getPath() !== '';
        }).map(function (te) {
          return te.getPath();
        });
        var openFilesWorkingSet = new (_nuclideWorkingSets2 || _nuclideWorkingSets()).WorkingSet(openUris);
        updateOpenFilesWorkingSet(openFilesWorkingSet);
      }, OPEN_FILES_UPDATE_DEBOUNCE_INTERVAL_MS);

      rebuildOpenFilesWorkingSet();

      var paneObservingDisposable = new (_atom2 || _atom()).CompositeDisposable();
      paneObservingDisposable.add(atom.workspace.onDidAddPaneItem(rebuildOpenFilesWorkingSet));
      paneObservingDisposable.add(atom.workspace.onDidDestroyPaneItem(rebuildOpenFilesWorkingSet));

      this._subscriptions.add(paneObservingDisposable);

      return new (_atom2 || _atom()).Disposable(function () {
        _this._fileTreeController.updateWorkingSetsStore(null);
        _this._fileTreeController.updateWorkingSet(new (_nuclideWorkingSets2 || _nuclideWorkingSets()).WorkingSet());
        _this._fileTreeController.updateOpenFilesWorkingSet(new (_nuclideWorkingSets2 || _nuclideWorkingSets()).WorkingSet());
        paneObservingDisposable.dispose();
        _this._subscriptions.remove(currentSubscription);
        currentSubscription.dispose();
      });
    }
  }, {
    key: '_setExcludeVcsIgnoredPaths',
    value: function _setExcludeVcsIgnoredPaths(excludeVcsIgnoredPaths) {
      this._fileTreeController.setExcludeVcsIgnoredPaths(excludeVcsIgnoredPaths);
    }
  }, {
    key: '_setHideIgnoredNames',
    value: function _setHideIgnoredNames(hideIgnoredNames) {
      this._fileTreeController.setHideIgnoredNames(hideIgnoredNames);
    }
  }, {
    key: '_setIgnoredNames',
    value: function _setIgnoredNames(ignoredNames) {
      var normalizedIgnoredNames = undefined;
      if (ignoredNames === '') {
        normalizedIgnoredNames = [];
      } else if (typeof ignoredNames === 'string') {
        normalizedIgnoredNames = [ignoredNames];
      } else {
        normalizedIgnoredNames = ignoredNames;
      }
      this._fileTreeController.setIgnoredNames(normalizedIgnoredNames);
    }
  }, {
    key: '_setRevealOnFileSwitch',
    value: function _setRevealOnFileSwitch(shouldReveal) {
      var _this2 = this;

      if (shouldReveal) {
        var reveal = function reveal() {
          _this2._fileTreeController.revealActiveFile( /* showIfHidden */false);
        };
        // Guard against this getting called multiple times
        if (!this._paneItemSubscription) {
          // Debounce tab change events to limit unneeded scrolling when changing or closing tabs
          // in quick succession.
          this._paneItemSubscription = (0, (_commonsAtomDebounced2 || _commonsAtomDebounced()).onWorkspaceDidStopChangingActivePaneItem)(reveal, ACTIVE_PANE_DEBOUNCE_INTERVAL_MS);
          this._subscriptions.add(this._paneItemSubscription);
        }
      } else {
        // Use a local so Flow can refine the type.
        var paneItemSubscription = this._paneItemSubscription;
        if (paneItemSubscription) {
          this._subscriptions.remove(paneItemSubscription);
          paneItemSubscription.dispose();
          this._paneItemSubscription = null;
        }
      }
    }
  }, {
    key: '_setPrefixKeyNavSetting',
    value: function _setPrefixKeyNavSetting(usePrefixNav) {
      // config is void during startup, signifying no config yet
      if (usePrefixNav == null || !this._fileTreeController) {
        return;
      }
      this._fileTreeController.setUsePrefixNav(usePrefixNav);
    }
  }, {
    key: '_setUsePreviewTabs',
    value: function _setUsePreviewTabs(usePreviewTabs) {
      // config is void during startup, signifying no config yet
      if (usePreviewTabs == null) {
        return;
      }
      this._fileTreeController.setUsePreviewTabs(usePreviewTabs);
    }
  }, {
    key: 'getContextMenu',
    value: function getContextMenu() {
      (0, (_assert2 || _assert()).default)(this._fileTreeController);
      return this._fileTreeController.getContextMenu();
    }
  }, {
    key: '_deactivate',
    value: function _deactivate() {
      // Guard against deactivate being called twice
      this._fileTreeController.destroy();
    }
  }]);

  return Activation;
})();

var activation = undefined;
var deserializedState = undefined;
var onDidActivateDisposable = undefined;
var sideBarDisposable = undefined;

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
  (0, (_assert2 || _assert()).default)(activation == null);
  // Disable Atom's bundled 'tree-view' package. If this activation is happening during the
  // normal startup activation, the `onDidActivateInitialPackages` handler below must unload the
  // 'tree-view' because it will have been loaded during startup.
  disableTreeViewPackage();

  // Disabling and unloading Atom's bundled 'tree-view' must happen after activation because this
  // package's `activate` is called during an traversal of all initial packages to activate.
  // Disabling a package during the traversal has no effect if this is a startup load because
  // `PackageManager` does not re-load the list of packages to activate after each iteration.
  onDidActivateDisposable = atom.packages.onDidActivateInitialPackages(function () {
    disableTreeViewPackage();
    onDidActivateDisposable.dispose();
  });

  deserializedState = state;
  activation = new Activation(deserializedState);
}

function deactivate() {
  // Re-enable Atom's bundled 'tree-view' when this package is disabled to leave the user's
  // environment the way this package found it.
  if ((_libNuclideFeatures2 || _libNuclideFeatures()).nuclideFeatures.isFeatureDisabled('nuclide-file-tree') && atom.packages.isPackageDisabled('tree-view')) {
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
  (0, (_assert2 || _assert()).default)(activation);
  return activation.getContextMenu();
}

function consumeNuclideSideBar(sidebar) {
  (0, (_assert2 || _assert()).default)(activation);

  sidebar.registerView({
    getComponent: function getComponent() {
      return require('../components/FileTreeSidebarComponent');
    },
    onDidShow: function onDidShow() {
      // If "Reveal File on Switch" is enabled, ensure the scroll position is synced to where the
      // user expects when the side bar shows the file tree.
      if ((_nuclideFeatureConfig2 || _nuclideFeatureConfig()).default.get(REVEAL_FILE_ON_SWITCH_SETTING)) {
        atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-file-tree:reveal-active-file');
      }
    },
    title: 'File Tree',
    toggleCommand: 'nuclide-file-tree:toggle',
    viewId: 'nuclide-file-tree'
  });

  sideBarDisposable = new (_atom2 || _atom()).Disposable(function () {
    sidebar.destroyView('nuclide-file-tree');
  });

  return sideBarDisposable;
}

function consumeWorkingSetsStore(workingSetsStore) {
  (0, (_assert2 || _assert()).default)(activation);

  return activation.consumeWorkingSetsStore(workingSetsStore);
}

function consumeCwdApi(cwdApi) {
  (0, (_assert2 || _assert()).default)(activation);
  return activation.consumeCwdApi(cwdApi);
}