var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _featureConfig = require('../../feature-config');

var _featureConfig2 = _interopRequireDefault(_featureConfig);

/**
 * Minimum interval (in ms) between onChangeActivePaneItem events before revealing the active pane
 * item in the file tree.
 */
var ACTIVE_PANE_DEBOUNCE_INTERVAL_MS = 150;

var REVEAL_FILE_ON_SWITCH_SETTING = 'nuclide-file-tree.revealFileOnSwitch';

var Activation = (function () {
  function Activation(state) {
    _classCallCheck(this, Activation);

    this._packageState = state;
    this._subscriptions = new _atom.CompositeDisposable();

    var FileTreeController = require('./FileTreeController');
    this._fileTreeController = new FileTreeController(this._packageState);

    // Flow does not know that this setting is a boolean, thus the cast.
    this._setRevealOnFileSwitch(_featureConfig2['default'].get(REVEAL_FILE_ON_SWITCH_SETTING));

    var ignoredNamesSetting = 'core.ignoredNames';
    this._setIgnoredNames(atom.config.get(ignoredNamesSetting));

    var hideIgnoredNamesSetting = 'nuclide-file-tree.hideIgnoredNames';
    this._setRevealOnFileSwitch(_featureConfig2['default'].get(hideIgnoredNamesSetting));

    var excludeVcsIgnoredPathsSetting = 'core.excludeVcsIgnoredPaths';
    this._setExcludeVcsIgnoredPaths(atom.config.get(excludeVcsIgnoredPathsSetting));

    var usePreviewTabs = 'tabs.usePreviewTabs';
    this._setUsePreviewTabs(atom.config.get(usePreviewTabs));

    this._subscriptions.add(_featureConfig2['default'].observe(REVEAL_FILE_ON_SWITCH_SETTING, this._setRevealOnFileSwitch.bind(this)), atom.config.observe(ignoredNamesSetting, this._setIgnoredNames.bind(this)), _featureConfig2['default'].observe(hideIgnoredNamesSetting, this._setHideIgnoredNames.bind(this)), atom.config.observe(excludeVcsIgnoredPathsSetting, this._setExcludeVcsIgnoredPaths.bind(this)), atom.config.observe(usePreviewTabs, this._setUsePreviewTabs.bind(this)));
  }

  _createClass(Activation, [{
    key: 'dispose',
    value: function dispose() {
      this._deactivate();
      this._subscriptions.dispose();
    }
  }, {
    key: 'serialize',
    value: function serialize() {
      if (this._fileTreeController) {
        return this._fileTreeController.serialize();
      }
    }
  }, {
    key: '_setExcludeVcsIgnoredPaths',
    value: function _setExcludeVcsIgnoredPaths(excludeVcsIgnoredPaths) {
      if (!this._fileTreeController) {
        return;
      }
      this._fileTreeController.setExcludeVcsIgnoredPaths(excludeVcsIgnoredPaths);
    }
  }, {
    key: '_setHideIgnoredNames',
    value: function _setHideIgnoredNames(hideIgnoredNames) {
      if (!this._fileTreeController) {
        return;
      }
      this._fileTreeController.setHideIgnoredNames(hideIgnoredNames);
    }
  }, {
    key: '_setIgnoredNames',
    value: function _setIgnoredNames(ignoredNames) {
      if (!this._fileTreeController) {
        return;
      }
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
      var _this = this;

      var onWorkspaceDidStopChangingActivePaneItem = require('../../atom-helpers').atomEventDebounce.onWorkspaceDidStopChangingActivePaneItem;

      if (shouldReveal) {
        var reveal = function reveal() {
          if (_this._fileTreeController) {
            _this._fileTreeController.revealActiveFile( /* showIfHidden */false);
          }
        };
        // Guard against this getting called multiple times
        if (!this._paneItemSubscription) {
          // Debounce tab change events to limit unneeded scrolling when changing or closing tabs
          // in quick succession.
          this._paneItemSubscription = onWorkspaceDidStopChangingActivePaneItem(reveal, ACTIVE_PANE_DEBOUNCE_INTERVAL_MS);
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
    key: '_setUsePreviewTabs',
    value: function _setUsePreviewTabs(usePreviewTabs) {
      // config is void during startup, signifying no config yet
      if (usePreviewTabs == null || !this._fileTreeController) {
        return;
      }
      this._fileTreeController.setUsePreviewTabs(usePreviewTabs);
    }
  }, {
    key: '_deactivate',
    value: function _deactivate() {
      // Guard against deactivate being called twice
      if (this._fileTreeController) {
        this._fileTreeController.destroy();
        this._fileTreeController = null;
      }
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

module.exports = {
  activate: function activate(state) {
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
  },

  deactivate: function deactivate() {
    var nuclideFeatures = require('../../../../lib/nuclideFeatures');

    // Re-enable Atom's bundled 'tree-view' when this package is disabled to leave the user's
    // environment the way this package found it.
    if (nuclideFeatures.isFeatureDisabled('nuclide-file-tree') && atom.packages.isPackageDisabled('tree-view')) {
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

  serialize: function serialize() {
    if (activation) {
      return activation.serialize();
    }
  },

  consumeNuclideSideBar: function consumeNuclideSideBar(sidebar) {
    if (!activation) {
      activation = new Activation(deserializedState);
    }

    sidebar.registerView({
      getComponent: function getComponent() {
        return require('../components/FileTree');
      },
      onDidShow: function onDidShow() {
        // If "Reveal File on Switch" is enabled, ensure the scroll position is synced to where the
        // user expects when the side bar shows the file tree.
        if (_featureConfig2['default'].get(REVEAL_FILE_ON_SWITCH_SETTING)) {
          atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-file-tree:reveal-active-file');
        }
      },
      toggleCommand: 'nuclide-file-tree:toggle',
      viewId: 'nuclide-file-tree'
    });

    sideBarDisposable = new _atom.Disposable(function () {
      sidebar.destroyView('nuclide-file-tree');
    });

    return sideBarDisposable;
  }
};
//# sourceMappingURL=data:application/json;base64,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LENBQUMsU0FBUyxFQUFFLENBQUM7S0FDL0I7R0FDRjs7QUFFRCx1QkFBcUIsRUFBQSwrQkFBQyxPQUE4QixFQUFlO0FBQ2pFLFFBQUksQ0FBQyxVQUFVLEVBQUU7QUFDZixnQkFBVSxHQUFHLElBQUksVUFBVSxDQUFDLGlCQUFpQixDQUFDLENBQUM7S0FDaEQ7O0FBRUQsV0FBTyxDQUFDLFlBQVksQ0FBQztBQUNuQixrQkFBWSxFQUFBLHdCQUFHO0FBQUUsZUFBTyxPQUFPLENBQUMsd0JBQXdCLENBQUMsQ0FBQztPQUFFO0FBQzVELGVBQVMsRUFBQSxxQkFBRzs7O0FBR1YsWUFBSSwyQkFBYyxHQUFHLENBQUMsNkJBQTZCLENBQUMsRUFBRTtBQUNwRCxjQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FDcEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUNsQyxzQ0FBc0MsQ0FDdkMsQ0FBQztTQUNIO09BQ0Y7QUFDRCxtQkFBYSxFQUFFLDBCQUEwQjtBQUN6QyxZQUFNLEVBQUUsbUJBQW1CO0tBQzVCLENBQUMsQ0FBQzs7QUFFSCxxQkFBaUIsR0FBRyxxQkFBZSxZQUFNO0FBQ3ZDLGFBQU8sQ0FBQyxXQUFXLENBQUMsbUJBQW1CLENBQUMsQ0FBQztLQUMxQyxDQUFDLENBQUM7O0FBRUgsV0FBTyxpQkFBaUIsQ0FBQztHQUMxQjtDQUNGLENBQUMiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtGaWxlVHJlZUNvbnRyb2xsZXJTdGF0ZX0gZnJvbSAnLi9GaWxlVHJlZUNvbnRyb2xsZXInO1xuaW1wb3J0IHR5cGUgRmlsZVRyZWVDb250cm9sbGVyVHlwZSBmcm9tICcuL0ZpbGVUcmVlQ29udHJvbGxlcic7XG5pbXBvcnQgdHlwZSB7TnVjbGlkZVNpZGVCYXJTZXJ2aWNlfSBmcm9tICcuLi8uLi9zaWRlLWJhcic7XG5cbmltcG9ydCB7XG4gIENvbXBvc2l0ZURpc3Bvc2FibGUsXG4gIERpc3Bvc2FibGUsXG59IGZyb20gJ2F0b20nO1xuaW1wb3J0IGZlYXR1cmVDb25maWcgZnJvbSAnLi4vLi4vZmVhdHVyZS1jb25maWcnO1xuXG4vKipcbiAqIE1pbmltdW0gaW50ZXJ2YWwgKGluIG1zKSBiZXR3ZWVuIG9uQ2hhbmdlQWN0aXZlUGFuZUl0ZW0gZXZlbnRzIGJlZm9yZSByZXZlYWxpbmcgdGhlIGFjdGl2ZSBwYW5lXG4gKiBpdGVtIGluIHRoZSBmaWxlIHRyZWUuXG4gKi9cbmNvbnN0IEFDVElWRV9QQU5FX0RFQk9VTkNFX0lOVEVSVkFMX01TID0gMTUwO1xuXG5jb25zdCBSRVZFQUxfRklMRV9PTl9TV0lUQ0hfU0VUVElORyA9ICdudWNsaWRlLWZpbGUtdHJlZS5yZXZlYWxGaWxlT25Td2l0Y2gnO1xuXG5jbGFzcyBBY3RpdmF0aW9uIHtcbiAgX2ZpbGVUcmVlQ29udHJvbGxlcjogP0ZpbGVUcmVlQ29udHJvbGxlclR5cGU7XG4gIF9wYWNrYWdlU3RhdGU6ID9GaWxlVHJlZUNvbnRyb2xsZXJTdGF0ZTtcbiAgX3N1YnNjcmlwdGlvbnM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIF9wYW5lSXRlbVN1YnNjcmlwdGlvbjogP0Rpc3Bvc2FibGU7XG5cbiAgY29uc3RydWN0b3Ioc3RhdGU6ID9GaWxlVHJlZUNvbnRyb2xsZXJTdGF0ZSkge1xuICAgIHRoaXMuX3BhY2thZ2VTdGF0ZSA9IHN0YXRlO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuXG4gICAgY29uc3QgRmlsZVRyZWVDb250cm9sbGVyID0gcmVxdWlyZSgnLi9GaWxlVHJlZUNvbnRyb2xsZXInKTtcbiAgICB0aGlzLl9maWxlVHJlZUNvbnRyb2xsZXIgPSBuZXcgRmlsZVRyZWVDb250cm9sbGVyKHRoaXMuX3BhY2thZ2VTdGF0ZSk7XG5cbiAgICAvLyBGbG93IGRvZXMgbm90IGtub3cgdGhhdCB0aGlzIHNldHRpbmcgaXMgYSBib29sZWFuLCB0aHVzIHRoZSBjYXN0LlxuICAgIHRoaXMuX3NldFJldmVhbE9uRmlsZVN3aXRjaCgoKGZlYXR1cmVDb25maWcuZ2V0KFJFVkVBTF9GSUxFX09OX1NXSVRDSF9TRVRUSU5HKTogYW55KTogYm9vbGVhbikpO1xuXG4gICAgY29uc3QgaWdub3JlZE5hbWVzU2V0dGluZyA9ICdjb3JlLmlnbm9yZWROYW1lcyc7XG4gICAgdGhpcy5fc2V0SWdub3JlZE5hbWVzKCgoYXRvbS5jb25maWcuZ2V0KGlnbm9yZWROYW1lc1NldHRpbmcpOiBhbnkpOiBzdHJpbmcgfCBBcnJheTxzdHJpbmc+KSk7XG5cbiAgICBjb25zdCBoaWRlSWdub3JlZE5hbWVzU2V0dGluZyA9ICdudWNsaWRlLWZpbGUtdHJlZS5oaWRlSWdub3JlZE5hbWVzJztcbiAgICB0aGlzLl9zZXRSZXZlYWxPbkZpbGVTd2l0Y2goKChmZWF0dXJlQ29uZmlnLmdldChoaWRlSWdub3JlZE5hbWVzU2V0dGluZyk6IGFueSk6IGJvb2xlYW4pKTtcblxuICAgIGNvbnN0IGV4Y2x1ZGVWY3NJZ25vcmVkUGF0aHNTZXR0aW5nID0gJ2NvcmUuZXhjbHVkZVZjc0lnbm9yZWRQYXRocyc7XG4gICAgdGhpcy5fc2V0RXhjbHVkZVZjc0lnbm9yZWRQYXRocyhcbiAgICAgICgoYXRvbS5jb25maWcuZ2V0KGV4Y2x1ZGVWY3NJZ25vcmVkUGF0aHNTZXR0aW5nKTogYW55KTogYm9vbGVhbilcbiAgICApO1xuXG4gICAgY29uc3QgdXNlUHJldmlld1RhYnMgPSAndGFicy51c2VQcmV2aWV3VGFicyc7XG4gICAgdGhpcy5fc2V0VXNlUHJldmlld1RhYnMoKChhdG9tLmNvbmZpZy5nZXQodXNlUHJldmlld1RhYnMpOiBhbnkpOiA/Ym9vbGVhbikpO1xuXG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICBmZWF0dXJlQ29uZmlnLm9ic2VydmUoUkVWRUFMX0ZJTEVfT05fU1dJVENIX1NFVFRJTkcsIHRoaXMuX3NldFJldmVhbE9uRmlsZVN3aXRjaC5iaW5kKHRoaXMpKSxcbiAgICAgIGF0b20uY29uZmlnLm9ic2VydmUoaWdub3JlZE5hbWVzU2V0dGluZywgdGhpcy5fc2V0SWdub3JlZE5hbWVzLmJpbmQodGhpcykpLFxuICAgICAgZmVhdHVyZUNvbmZpZy5vYnNlcnZlKGhpZGVJZ25vcmVkTmFtZXNTZXR0aW5nLCB0aGlzLl9zZXRIaWRlSWdub3JlZE5hbWVzLmJpbmQodGhpcykpLFxuICAgICAgYXRvbS5jb25maWcub2JzZXJ2ZShcbiAgICAgICAgZXhjbHVkZVZjc0lnbm9yZWRQYXRoc1NldHRpbmcsXG4gICAgICAgIHRoaXMuX3NldEV4Y2x1ZGVWY3NJZ25vcmVkUGF0aHMuYmluZCh0aGlzKSxcbiAgICAgICksXG4gICAgICBhdG9tLmNvbmZpZy5vYnNlcnZlKHVzZVByZXZpZXdUYWJzLCB0aGlzLl9zZXRVc2VQcmV2aWV3VGFicy5iaW5kKHRoaXMpKSxcbiAgICApO1xuXG4gIH1cblxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuX2RlYWN0aXZhdGUoKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIHNlcmlhbGl6ZSgpOiA/RmlsZVRyZWVDb250cm9sbGVyU3RhdGUge1xuICAgIGlmICh0aGlzLl9maWxlVHJlZUNvbnRyb2xsZXIpIHtcbiAgICAgIHJldHVybiB0aGlzLl9maWxlVHJlZUNvbnRyb2xsZXIuc2VyaWFsaXplKCk7XG4gICAgfVxuICB9XG5cbiAgX3NldEV4Y2x1ZGVWY3NJZ25vcmVkUGF0aHMoZXhjbHVkZVZjc0lnbm9yZWRQYXRoczogYm9vbGVhbik6IHZvaWQge1xuICAgIGlmICghdGhpcy5fZmlsZVRyZWVDb250cm9sbGVyKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuX2ZpbGVUcmVlQ29udHJvbGxlci5zZXRFeGNsdWRlVmNzSWdub3JlZFBhdGhzKGV4Y2x1ZGVWY3NJZ25vcmVkUGF0aHMpO1xuICB9XG5cbiAgX3NldEhpZGVJZ25vcmVkTmFtZXMoaGlkZUlnbm9yZWROYW1lczogYm9vbGVhbik6IHZvaWQge1xuICAgIGlmICghdGhpcy5fZmlsZVRyZWVDb250cm9sbGVyKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuX2ZpbGVUcmVlQ29udHJvbGxlci5zZXRIaWRlSWdub3JlZE5hbWVzKGhpZGVJZ25vcmVkTmFtZXMpO1xuICB9XG5cbiAgX3NldElnbm9yZWROYW1lcyhpZ25vcmVkTmFtZXM6IHN0cmluZ3xBcnJheTxzdHJpbmc+KSB7XG4gICAgaWYgKCF0aGlzLl9maWxlVHJlZUNvbnRyb2xsZXIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbGV0IG5vcm1hbGl6ZWRJZ25vcmVkTmFtZXM7XG4gICAgaWYgKGlnbm9yZWROYW1lcyA9PT0gJycpIHtcbiAgICAgIG5vcm1hbGl6ZWRJZ25vcmVkTmFtZXMgPSBbXTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBpZ25vcmVkTmFtZXMgPT09ICdzdHJpbmcnKSB7XG4gICAgICBub3JtYWxpemVkSWdub3JlZE5hbWVzID0gW2lnbm9yZWROYW1lc107XG4gICAgfSBlbHNlIHtcbiAgICAgIG5vcm1hbGl6ZWRJZ25vcmVkTmFtZXMgPSBpZ25vcmVkTmFtZXM7XG4gICAgfVxuICAgIHRoaXMuX2ZpbGVUcmVlQ29udHJvbGxlci5zZXRJZ25vcmVkTmFtZXMobm9ybWFsaXplZElnbm9yZWROYW1lcyk7XG4gIH1cblxuICBfc2V0UmV2ZWFsT25GaWxlU3dpdGNoKHNob3VsZFJldmVhbDogYm9vbGVhbikge1xuICAgIGNvbnN0IHtvbldvcmtzcGFjZURpZFN0b3BDaGFuZ2luZ0FjdGl2ZVBhbmVJdGVtfSA9XG4gICAgICByZXF1aXJlKCcuLi8uLi9hdG9tLWhlbHBlcnMnKS5hdG9tRXZlbnREZWJvdW5jZTtcblxuICAgIGlmIChzaG91bGRSZXZlYWwpIHtcbiAgICAgIGNvbnN0IHJldmVhbCA9ICgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuX2ZpbGVUcmVlQ29udHJvbGxlcikge1xuICAgICAgICAgIHRoaXMuX2ZpbGVUcmVlQ29udHJvbGxlci5yZXZlYWxBY3RpdmVGaWxlKC8qIHNob3dJZkhpZGRlbiAqLyBmYWxzZSk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICAvLyBHdWFyZCBhZ2FpbnN0IHRoaXMgZ2V0dGluZyBjYWxsZWQgbXVsdGlwbGUgdGltZXNcbiAgICAgIGlmICghdGhpcy5fcGFuZUl0ZW1TdWJzY3JpcHRpb24pIHtcbiAgICAgICAgLy8gRGVib3VuY2UgdGFiIGNoYW5nZSBldmVudHMgdG8gbGltaXQgdW5uZWVkZWQgc2Nyb2xsaW5nIHdoZW4gY2hhbmdpbmcgb3IgY2xvc2luZyB0YWJzXG4gICAgICAgIC8vIGluIHF1aWNrIHN1Y2Nlc3Npb24uXG4gICAgICAgIHRoaXMuX3BhbmVJdGVtU3Vic2NyaXB0aW9uID0gb25Xb3Jrc3BhY2VEaWRTdG9wQ2hhbmdpbmdBY3RpdmVQYW5lSXRlbShcbiAgICAgICAgICByZXZlYWwsXG4gICAgICAgICAgQUNUSVZFX1BBTkVfREVCT1VOQ0VfSU5URVJWQUxfTVNcbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5fcGFuZUl0ZW1TdWJzY3JpcHRpb24pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBVc2UgYSBsb2NhbCBzbyBGbG93IGNhbiByZWZpbmUgdGhlIHR5cGUuXG4gICAgICBjb25zdCBwYW5lSXRlbVN1YnNjcmlwdGlvbiA9IHRoaXMuX3BhbmVJdGVtU3Vic2NyaXB0aW9uO1xuICAgICAgaWYgKHBhbmVJdGVtU3Vic2NyaXB0aW9uKSB7XG4gICAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMucmVtb3ZlKHBhbmVJdGVtU3Vic2NyaXB0aW9uKTtcbiAgICAgICAgcGFuZUl0ZW1TdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICAgICAgICB0aGlzLl9wYW5lSXRlbVN1YnNjcmlwdGlvbiA9IG51bGw7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgX3NldFVzZVByZXZpZXdUYWJzKHVzZVByZXZpZXdUYWJzOiA/Ym9vbGVhbik6IHZvaWQge1xuICAgIC8vIGNvbmZpZyBpcyB2b2lkIGR1cmluZyBzdGFydHVwLCBzaWduaWZ5aW5nIG5vIGNvbmZpZyB5ZXRcbiAgICBpZiAodXNlUHJldmlld1RhYnMgPT0gbnVsbCB8fCAhdGhpcy5fZmlsZVRyZWVDb250cm9sbGVyKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuX2ZpbGVUcmVlQ29udHJvbGxlci5zZXRVc2VQcmV2aWV3VGFicyh1c2VQcmV2aWV3VGFicyk7XG4gIH1cblxuICBfZGVhY3RpdmF0ZSgpIHtcbiAgICAvLyBHdWFyZCBhZ2FpbnN0IGRlYWN0aXZhdGUgYmVpbmcgY2FsbGVkIHR3aWNlXG4gICAgaWYgKHRoaXMuX2ZpbGVUcmVlQ29udHJvbGxlcikge1xuICAgICAgdGhpcy5fZmlsZVRyZWVDb250cm9sbGVyLmRlc3Ryb3koKTtcbiAgICAgIHRoaXMuX2ZpbGVUcmVlQ29udHJvbGxlciA9IG51bGw7XG4gICAgfVxuICB9XG59XG5cbmxldCBhY3RpdmF0aW9uOiA/QWN0aXZhdGlvbjtcbmxldCBkZXNlcmlhbGl6ZWRTdGF0ZTogP0ZpbGVUcmVlQ29udHJvbGxlclN0YXRlO1xubGV0IG9uRGlkQWN0aXZhdGVEaXNwb3NhYmxlOiBJRGlzcG9zYWJsZTtcbmxldCBzaWRlQmFyRGlzcG9zYWJsZTogP0lEaXNwb3NhYmxlO1xuXG5mdW5jdGlvbiBkaXNhYmxlVHJlZVZpZXdQYWNrYWdlKCkge1xuICBpZiAoIWF0b20ucGFja2FnZXMuaXNQYWNrYWdlRGlzYWJsZWQoJ3RyZWUtdmlldycpKSB7XG4gICAgLy8gQ2FsbGluZyBgZGlzYWJsZVBhY2thZ2VgIG9uIGEgcGFja2FnZSBmaXJzdCAqbG9hZHMqIHRoZSBwYWNrYWdlLiBUaGlzIHN0ZXAgbXVzdCBjb21lXG4gICAgLy8gYmVmb3JlIGNhbGxpbmcgYHVubG9hZFBhY2thZ2VgLlxuICAgIGF0b20ucGFja2FnZXMuZGlzYWJsZVBhY2thZ2UoJ3RyZWUtdmlldycpO1xuICB9XG5cbiAgaWYgKGF0b20ucGFja2FnZXMuaXNQYWNrYWdlQWN0aXZlKCd0cmVlLXZpZXcnKSkge1xuICAgIC8vIE9ubHkgKmluYWN0aXZlKiBwYWNrYWdlcyBjYW4gYmUgdW5sb2FkZWQuIEF0dGVtcHRpbmcgdG8gdW5sb2FkIGFuIGFjdGl2ZSBwYWNrYWdlIGlzXG4gICAgLy8gY29uc2lkZXJlZCBhbiBleGNlcHRpb24uIERlYWN0aXZhdGluZyBtdXN0IGNvbWUgYmVmb3JlIHVubG9hZGluZy5cbiAgICBhdG9tLnBhY2thZ2VzLmRlYWN0aXZhdGVQYWNrYWdlKCd0cmVlLXZpZXcnKTtcbiAgfVxuXG4gIGlmIChhdG9tLnBhY2thZ2VzLmlzUGFja2FnZUxvYWRlZCgndHJlZS12aWV3JykpIHtcbiAgICBhdG9tLnBhY2thZ2VzLnVubG9hZFBhY2thZ2UoJ3RyZWUtdmlldycpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBhY3RpdmF0ZShzdGF0ZTogP0ZpbGVUcmVlQ29udHJvbGxlclN0YXRlKTogdm9pZCB7XG4gICAgLy8gRGlzYWJsZSBBdG9tJ3MgYnVuZGxlZCAndHJlZS12aWV3JyBwYWNrYWdlLiBJZiB0aGlzIGFjdGl2YXRpb24gaXMgaGFwcGVuaW5nIGR1cmluZyB0aGVcbiAgICAvLyBub3JtYWwgc3RhcnR1cCBhY3RpdmF0aW9uLCB0aGUgYG9uRGlkQWN0aXZhdGVJbml0aWFsUGFja2FnZXNgIGhhbmRsZXIgYmVsb3cgbXVzdCB1bmxvYWQgdGhlXG4gICAgLy8gJ3RyZWUtdmlldycgYmVjYXVzZSBpdCB3aWxsIGhhdmUgYmVlbiBsb2FkZWQgZHVyaW5nIHN0YXJ0dXAuXG4gICAgZGlzYWJsZVRyZWVWaWV3UGFja2FnZSgpO1xuXG4gICAgLy8gRGlzYWJsaW5nIGFuZCB1bmxvYWRpbmcgQXRvbSdzIGJ1bmRsZWQgJ3RyZWUtdmlldycgbXVzdCBoYXBwZW4gYWZ0ZXIgYWN0aXZhdGlvbiBiZWNhdXNlIHRoaXNcbiAgICAvLyBwYWNrYWdlJ3MgYGFjdGl2YXRlYCBpcyBjYWxsZWQgZHVyaW5nIGFuIHRyYXZlcnNhbCBvZiBhbGwgaW5pdGlhbCBwYWNrYWdlcyB0byBhY3RpdmF0ZS5cbiAgICAvLyBEaXNhYmxpbmcgYSBwYWNrYWdlIGR1cmluZyB0aGUgdHJhdmVyc2FsIGhhcyBubyBlZmZlY3QgaWYgdGhpcyBpcyBhIHN0YXJ0dXAgbG9hZCBiZWNhdXNlXG4gICAgLy8gYFBhY2thZ2VNYW5hZ2VyYCBkb2VzIG5vdCByZS1sb2FkIHRoZSBsaXN0IG9mIHBhY2thZ2VzIHRvIGFjdGl2YXRlIGFmdGVyIGVhY2ggaXRlcmF0aW9uLlxuICAgIG9uRGlkQWN0aXZhdGVEaXNwb3NhYmxlID0gYXRvbS5wYWNrYWdlcy5vbkRpZEFjdGl2YXRlSW5pdGlhbFBhY2thZ2VzKCgpID0+IHtcbiAgICAgIGRpc2FibGVUcmVlVmlld1BhY2thZ2UoKTtcbiAgICAgIG9uRGlkQWN0aXZhdGVEaXNwb3NhYmxlLmRpc3Bvc2UoKTtcbiAgICB9KTtcblxuICAgIGRlc2VyaWFsaXplZFN0YXRlID0gc3RhdGU7XG4gIH0sXG5cbiAgZGVhY3RpdmF0ZSgpIHtcbiAgICBjb25zdCBudWNsaWRlRmVhdHVyZXMgPSByZXF1aXJlKCcuLi8uLi8uLi8uLi9saWIvbnVjbGlkZUZlYXR1cmVzJyk7XG5cbiAgICAvLyBSZS1lbmFibGUgQXRvbSdzIGJ1bmRsZWQgJ3RyZWUtdmlldycgd2hlbiB0aGlzIHBhY2thZ2UgaXMgZGlzYWJsZWQgdG8gbGVhdmUgdGhlIHVzZXInc1xuICAgIC8vIGVudmlyb25tZW50IHRoZSB3YXkgdGhpcyBwYWNrYWdlIGZvdW5kIGl0LlxuICAgIGlmIChudWNsaWRlRmVhdHVyZXMuaXNGZWF0dXJlRGlzYWJsZWQoJ251Y2xpZGUtZmlsZS10cmVlJylcbiAgICAgICYmIGF0b20ucGFja2FnZXMuaXNQYWNrYWdlRGlzYWJsZWQoJ3RyZWUtdmlldycpKSB7XG4gICAgICBhdG9tLnBhY2thZ2VzLmVuYWJsZVBhY2thZ2UoJ3RyZWUtdmlldycpO1xuICAgIH1cblxuICAgIGlmIChzaWRlQmFyRGlzcG9zYWJsZSAhPSBudWxsKSB7XG4gICAgICBzaWRlQmFyRGlzcG9zYWJsZS5kaXNwb3NlKCk7XG4gICAgfVxuXG4gICAgaWYgKCFvbkRpZEFjdGl2YXRlRGlzcG9zYWJsZS5kaXNwb3NlZCkge1xuICAgICAgb25EaWRBY3RpdmF0ZURpc3Bvc2FibGUuZGlzcG9zZSgpO1xuICAgIH1cblxuICAgIGlmIChhY3RpdmF0aW9uKSB7XG4gICAgICBhY3RpdmF0aW9uLmRpc3Bvc2UoKTtcbiAgICAgIGFjdGl2YXRpb24gPSBudWxsO1xuICAgIH1cbiAgfSxcblxuICBzZXJpYWxpemUoKTogP0ZpbGVUcmVlQ29udHJvbGxlclN0YXRlIHtcbiAgICBpZiAoYWN0aXZhdGlvbikge1xuICAgICAgcmV0dXJuIGFjdGl2YXRpb24uc2VyaWFsaXplKCk7XG4gICAgfVxuICB9LFxuXG4gIGNvbnN1bWVOdWNsaWRlU2lkZUJhcihzaWRlYmFyOiBOdWNsaWRlU2lkZUJhclNlcnZpY2UpOiBJRGlzcG9zYWJsZSB7XG4gICAgaWYgKCFhY3RpdmF0aW9uKSB7XG4gICAgICBhY3RpdmF0aW9uID0gbmV3IEFjdGl2YXRpb24oZGVzZXJpYWxpemVkU3RhdGUpO1xuICAgIH1cblxuICAgIHNpZGViYXIucmVnaXN0ZXJWaWV3KHtcbiAgICAgIGdldENvbXBvbmVudCgpIHsgcmV0dXJuIHJlcXVpcmUoJy4uL2NvbXBvbmVudHMvRmlsZVRyZWUnKTsgfSxcbiAgICAgIG9uRGlkU2hvdygpIHtcbiAgICAgICAgLy8gSWYgXCJSZXZlYWwgRmlsZSBvbiBTd2l0Y2hcIiBpcyBlbmFibGVkLCBlbnN1cmUgdGhlIHNjcm9sbCBwb3NpdGlvbiBpcyBzeW5jZWQgdG8gd2hlcmUgdGhlXG4gICAgICAgIC8vIHVzZXIgZXhwZWN0cyB3aGVuIHRoZSBzaWRlIGJhciBzaG93cyB0aGUgZmlsZSB0cmVlLlxuICAgICAgICBpZiAoZmVhdHVyZUNvbmZpZy5nZXQoUkVWRUFMX0ZJTEVfT05fU1dJVENIX1NFVFRJTkcpKSB7XG4gICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChcbiAgICAgICAgICAgIGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSksXG4gICAgICAgICAgICAnbnVjbGlkZS1maWxlLXRyZWU6cmV2ZWFsLWFjdGl2ZS1maWxlJ1xuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICB0b2dnbGVDb21tYW5kOiAnbnVjbGlkZS1maWxlLXRyZWU6dG9nZ2xlJyxcbiAgICAgIHZpZXdJZDogJ251Y2xpZGUtZmlsZS10cmVlJyxcbiAgICB9KTtcblxuICAgIHNpZGVCYXJEaXNwb3NhYmxlID0gbmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgc2lkZWJhci5kZXN0cm95VmlldygnbnVjbGlkZS1maWxlLXRyZWUnKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBzaWRlQmFyRGlzcG9zYWJsZTtcbiAgfSxcbn07XG4iXX0=