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

var _libNuclideFeatures = require('../../../../lib/nuclideFeatures');

var _libNuclideFeatures2 = _interopRequireDefault(_libNuclideFeatures);

/**
 * Minimum interval (in ms) between onChangeActivePaneItem events before revealing the active pane
 * item in the file tree.
 */
var ACTIVE_PANE_DEBOUNCE_INTERVAL_MS = 150;

var Activation = (function () {
  function Activation(state) {
    _classCallCheck(this, Activation);

    this._packageState = state;
    this._subscriptions = new _atom.CompositeDisposable();

    var FileTreeController = require('./FileTreeController');
    this._fileTreeController = new FileTreeController(this._packageState);

    var revealSetting = 'nuclide-file-tree.revealFileOnSwitch';
    // Flow does not know that this setting is a boolean, thus the cast.
    this._setRevealOnFileSwitch(_featureConfig2['default'].get(revealSetting));

    var ignoredNamesSetting = 'core.ignoredNames';
    this._setIgnoredNames(atom.config.get(ignoredNamesSetting));

    var hideIgnoredNamesSetting = 'nuclide-file-tree.hideIgnoredNames';
    this._setRevealOnFileSwitch(_featureConfig2['default'].get(hideIgnoredNamesSetting));

    var excludeVcsIgnoredPathsSetting = 'core.excludeVcsIgnoredPaths';
    this._setExcludeVcsIgnoredPaths(atom.config.get(excludeVcsIgnoredPathsSetting));

    var usePreviewTabs = 'tabs.usePreviewTabs';
    this._setUsePreviewTabs(atom.config.get(usePreviewTabs));

    this._subscriptions.add(_featureConfig2['default'].observe(revealSetting, this._setRevealOnFileSwitch.bind(this)), atom.config.observe(ignoredNamesSetting, this._setIgnoredNames.bind(this)), _featureConfig2['default'].observe(hideIgnoredNamesSetting, this._setHideIgnoredNames.bind(this)), atom.config.observe(excludeVcsIgnoredPathsSetting, this._setExcludeVcsIgnoredPaths.bind(this)), atom.config.observe(usePreviewTabs, this._setUsePreviewTabs.bind(this)));
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

module.exports = {
  activate: function activate(state) {
    // We need to check if the package is already disabled, otherwise Atom will add it to the
    // 'core.disabledPackages' config multiple times.
    if (!atom.packages.isPackageDisabled('tree-view')) {
      atom.packages.disablePackage('tree-view');
    }

    // Unload 'tree-view' to free its resources that are not needed.
    if (atom.packages.isPackageLoaded('tree-view')) {
      atom.packages.unloadPackage('tree-view');
    }

    if (!activation) {
      activation = new Activation(state);
    }
  },

  deactivate: function deactivate() {
    if (activation) {
      activation.dispose();
      activation = null;
    }
  },

  serialize: function serialize() {
    if (activation) {
      return activation.serialize();
    }
  }
};
//# sourceMappingURL=data:application/json;base64,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QVUsR0FBRyxJQUFJLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUNwQztHQUNGOztBQUVELFlBQVUsRUFBQSxzQkFBRztBQUNYLFFBQUksVUFBVSxFQUFFO0FBQ2QsZ0JBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNyQixnQkFBVSxHQUFHLElBQUksQ0FBQztLQUNuQjtHQUNGOztBQUVELFdBQVMsRUFBQSxxQkFBNkI7QUFDcEMsUUFBSSxVQUFVLEVBQUU7QUFDZCxhQUFPLFVBQVUsQ0FBQyxTQUFTLEVBQUUsQ0FBQztLQUMvQjtHQUNGO0NBQ0YsQ0FBQyIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0Rpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHR5cGUge0ZpbGVUcmVlQ29udHJvbGxlclN0YXRlfSBmcm9tICcuL0ZpbGVUcmVlQ29udHJvbGxlcic7XG5pbXBvcnQgdHlwZSBGaWxlVHJlZUNvbnRyb2xsZXJUeXBlIGZyb20gJy4vRmlsZVRyZWVDb250cm9sbGVyJztcblxuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcblxuaW1wb3J0IGZlYXR1cmVDb25maWcgZnJvbSAnLi4vLi4vZmVhdHVyZS1jb25maWcnO1xuaW1wb3J0IG51Y2xpZGVGZWF0dXJlcyBmcm9tICcuLi8uLi8uLi8uLi9saWIvbnVjbGlkZUZlYXR1cmVzJztcblxuLyoqXG4gKiBNaW5pbXVtIGludGVydmFsIChpbiBtcykgYmV0d2VlbiBvbkNoYW5nZUFjdGl2ZVBhbmVJdGVtIGV2ZW50cyBiZWZvcmUgcmV2ZWFsaW5nIHRoZSBhY3RpdmUgcGFuZVxuICogaXRlbSBpbiB0aGUgZmlsZSB0cmVlLlxuICovXG5jb25zdCBBQ1RJVkVfUEFORV9ERUJPVU5DRV9JTlRFUlZBTF9NUyA9IDE1MDtcblxuY2xhc3MgQWN0aXZhdGlvbiB7XG4gIF9maWxlVHJlZUNvbnRyb2xsZXI6ID9GaWxlVHJlZUNvbnRyb2xsZXJUeXBlO1xuICBfcGFja2FnZVN0YXRlOiA/RmlsZVRyZWVDb250cm9sbGVyU3RhdGU7XG4gIF9zdWJzY3JpcHRpb25zOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBfcGFuZUl0ZW1TdWJzY3JpcHRpb246ID9EaXNwb3NhYmxlO1xuXG4gIGNvbnN0cnVjdG9yKHN0YXRlOiA/RmlsZVRyZWVDb250cm9sbGVyU3RhdGUpIHtcbiAgICB0aGlzLl9wYWNrYWdlU3RhdGUgPSBzdGF0ZTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcblxuICAgIGNvbnN0IEZpbGVUcmVlQ29udHJvbGxlciA9IHJlcXVpcmUoJy4vRmlsZVRyZWVDb250cm9sbGVyJyk7XG4gICAgdGhpcy5fZmlsZVRyZWVDb250cm9sbGVyID0gbmV3IEZpbGVUcmVlQ29udHJvbGxlcih0aGlzLl9wYWNrYWdlU3RhdGUpO1xuXG4gICAgY29uc3QgcmV2ZWFsU2V0dGluZyA9ICdudWNsaWRlLWZpbGUtdHJlZS5yZXZlYWxGaWxlT25Td2l0Y2gnO1xuICAgIC8vIEZsb3cgZG9lcyBub3Qga25vdyB0aGF0IHRoaXMgc2V0dGluZyBpcyBhIGJvb2xlYW4sIHRodXMgdGhlIGNhc3QuXG4gICAgdGhpcy5fc2V0UmV2ZWFsT25GaWxlU3dpdGNoKCgoZmVhdHVyZUNvbmZpZy5nZXQocmV2ZWFsU2V0dGluZyk6IGFueSk6IGJvb2xlYW4pKTtcblxuICAgIGNvbnN0IGlnbm9yZWROYW1lc1NldHRpbmcgPSAnY29yZS5pZ25vcmVkTmFtZXMnO1xuICAgIHRoaXMuX3NldElnbm9yZWROYW1lcygoKGF0b20uY29uZmlnLmdldChpZ25vcmVkTmFtZXNTZXR0aW5nKTogYW55KTogc3RyaW5nIHwgQXJyYXk8c3RyaW5nPikpO1xuXG4gICAgY29uc3QgaGlkZUlnbm9yZWROYW1lc1NldHRpbmcgPSAnbnVjbGlkZS1maWxlLXRyZWUuaGlkZUlnbm9yZWROYW1lcyc7XG4gICAgdGhpcy5fc2V0UmV2ZWFsT25GaWxlU3dpdGNoKCgoZmVhdHVyZUNvbmZpZy5nZXQoaGlkZUlnbm9yZWROYW1lc1NldHRpbmcpOiBhbnkpOiBib29sZWFuKSk7XG5cbiAgICBjb25zdCBleGNsdWRlVmNzSWdub3JlZFBhdGhzU2V0dGluZyA9ICdjb3JlLmV4Y2x1ZGVWY3NJZ25vcmVkUGF0aHMnO1xuICAgIHRoaXMuX3NldEV4Y2x1ZGVWY3NJZ25vcmVkUGF0aHMoXG4gICAgICAoKGF0b20uY29uZmlnLmdldChleGNsdWRlVmNzSWdub3JlZFBhdGhzU2V0dGluZyk6IGFueSk6IGJvb2xlYW4pXG4gICAgKTtcblxuICAgIGNvbnN0IHVzZVByZXZpZXdUYWJzID0gJ3RhYnMudXNlUHJldmlld1RhYnMnO1xuICAgIHRoaXMuX3NldFVzZVByZXZpZXdUYWJzKCgoYXRvbS5jb25maWcuZ2V0KHVzZVByZXZpZXdUYWJzKTogYW55KTogP2Jvb2xlYW4pKTtcblxuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgZmVhdHVyZUNvbmZpZy5vYnNlcnZlKHJldmVhbFNldHRpbmcsIHRoaXMuX3NldFJldmVhbE9uRmlsZVN3aXRjaC5iaW5kKHRoaXMpKSxcbiAgICAgIGF0b20uY29uZmlnLm9ic2VydmUoaWdub3JlZE5hbWVzU2V0dGluZywgdGhpcy5fc2V0SWdub3JlZE5hbWVzLmJpbmQodGhpcykpLFxuICAgICAgZmVhdHVyZUNvbmZpZy5vYnNlcnZlKGhpZGVJZ25vcmVkTmFtZXNTZXR0aW5nLCB0aGlzLl9zZXRIaWRlSWdub3JlZE5hbWVzLmJpbmQodGhpcykpLFxuICAgICAgYXRvbS5jb25maWcub2JzZXJ2ZShcbiAgICAgICAgZXhjbHVkZVZjc0lnbm9yZWRQYXRoc1NldHRpbmcsXG4gICAgICAgIHRoaXMuX3NldEV4Y2x1ZGVWY3NJZ25vcmVkUGF0aHMuYmluZCh0aGlzKSxcbiAgICAgICksXG4gICAgICBhdG9tLmNvbmZpZy5vYnNlcnZlKHVzZVByZXZpZXdUYWJzLCB0aGlzLl9zZXRVc2VQcmV2aWV3VGFicy5iaW5kKHRoaXMpKSxcbiAgICApO1xuXG4gIH1cblxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuX2RlYWN0aXZhdGUoKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIHNlcmlhbGl6ZSgpOiA/RmlsZVRyZWVDb250cm9sbGVyU3RhdGUge1xuICAgIGlmICh0aGlzLl9maWxlVHJlZUNvbnRyb2xsZXIpIHtcbiAgICAgIHJldHVybiB0aGlzLl9maWxlVHJlZUNvbnRyb2xsZXIuc2VyaWFsaXplKCk7XG4gICAgfVxuICB9XG5cbiAgX3NldEV4Y2x1ZGVWY3NJZ25vcmVkUGF0aHMoZXhjbHVkZVZjc0lnbm9yZWRQYXRoczogYm9vbGVhbik6IHZvaWQge1xuICAgIGlmICghdGhpcy5fZmlsZVRyZWVDb250cm9sbGVyKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuX2ZpbGVUcmVlQ29udHJvbGxlci5zZXRFeGNsdWRlVmNzSWdub3JlZFBhdGhzKGV4Y2x1ZGVWY3NJZ25vcmVkUGF0aHMpO1xuICB9XG5cbiAgX3NldEhpZGVJZ25vcmVkTmFtZXMoaGlkZUlnbm9yZWROYW1lczogYm9vbGVhbik6IHZvaWQge1xuICAgIGlmICghdGhpcy5fZmlsZVRyZWVDb250cm9sbGVyKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuX2ZpbGVUcmVlQ29udHJvbGxlci5zZXRIaWRlSWdub3JlZE5hbWVzKGhpZGVJZ25vcmVkTmFtZXMpO1xuICB9XG5cbiAgX3NldElnbm9yZWROYW1lcyhpZ25vcmVkTmFtZXM6IHN0cmluZ3xBcnJheTxzdHJpbmc+KSB7XG4gICAgaWYgKCF0aGlzLl9maWxlVHJlZUNvbnRyb2xsZXIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbGV0IG5vcm1hbGl6ZWRJZ25vcmVkTmFtZXM7XG4gICAgaWYgKGlnbm9yZWROYW1lcyA9PT0gJycpIHtcbiAgICAgIG5vcm1hbGl6ZWRJZ25vcmVkTmFtZXMgPSBbXTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBpZ25vcmVkTmFtZXMgPT09ICdzdHJpbmcnKSB7XG4gICAgICBub3JtYWxpemVkSWdub3JlZE5hbWVzID0gW2lnbm9yZWROYW1lc107XG4gICAgfSBlbHNlIHtcbiAgICAgIG5vcm1hbGl6ZWRJZ25vcmVkTmFtZXMgPSBpZ25vcmVkTmFtZXM7XG4gICAgfVxuICAgIHRoaXMuX2ZpbGVUcmVlQ29udHJvbGxlci5zZXRJZ25vcmVkTmFtZXMobm9ybWFsaXplZElnbm9yZWROYW1lcyk7XG4gIH1cblxuICBfc2V0UmV2ZWFsT25GaWxlU3dpdGNoKHNob3VsZFJldmVhbDogYm9vbGVhbikge1xuICAgIGNvbnN0IHtvbldvcmtzcGFjZURpZFN0b3BDaGFuZ2luZ0FjdGl2ZVBhbmVJdGVtfSA9XG4gICAgICByZXF1aXJlKCcuLi8uLi9hdG9tLWhlbHBlcnMnKS5hdG9tRXZlbnREZWJvdW5jZTtcblxuICAgIGlmIChzaG91bGRSZXZlYWwpIHtcbiAgICAgIGNvbnN0IHJldmVhbCA9ICgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuX2ZpbGVUcmVlQ29udHJvbGxlcikge1xuICAgICAgICAgIHRoaXMuX2ZpbGVUcmVlQ29udHJvbGxlci5yZXZlYWxBY3RpdmVGaWxlKC8qIHNob3dJZkhpZGRlbiAqLyBmYWxzZSk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICAvLyBHdWFyZCBhZ2FpbnN0IHRoaXMgZ2V0dGluZyBjYWxsZWQgbXVsdGlwbGUgdGltZXNcbiAgICAgIGlmICghdGhpcy5fcGFuZUl0ZW1TdWJzY3JpcHRpb24pIHtcbiAgICAgICAgLy8gRGVib3VuY2UgdGFiIGNoYW5nZSBldmVudHMgdG8gbGltaXQgdW5uZWVkZWQgc2Nyb2xsaW5nIHdoZW4gY2hhbmdpbmcgb3IgY2xvc2luZyB0YWJzXG4gICAgICAgIC8vIGluIHF1aWNrIHN1Y2Nlc3Npb24uXG4gICAgICAgIHRoaXMuX3BhbmVJdGVtU3Vic2NyaXB0aW9uID0gb25Xb3Jrc3BhY2VEaWRTdG9wQ2hhbmdpbmdBY3RpdmVQYW5lSXRlbShcbiAgICAgICAgICByZXZlYWwsXG4gICAgICAgICAgQUNUSVZFX1BBTkVfREVCT1VOQ0VfSU5URVJWQUxfTVNcbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5fcGFuZUl0ZW1TdWJzY3JpcHRpb24pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBVc2UgYSBsb2NhbCBzbyBGbG93IGNhbiByZWZpbmUgdGhlIHR5cGUuXG4gICAgICBjb25zdCBwYW5lSXRlbVN1YnNjcmlwdGlvbiA9IHRoaXMuX3BhbmVJdGVtU3Vic2NyaXB0aW9uO1xuICAgICAgaWYgKHBhbmVJdGVtU3Vic2NyaXB0aW9uKSB7XG4gICAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMucmVtb3ZlKHBhbmVJdGVtU3Vic2NyaXB0aW9uKTtcbiAgICAgICAgcGFuZUl0ZW1TdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICAgICAgICB0aGlzLl9wYW5lSXRlbVN1YnNjcmlwdGlvbiA9IG51bGw7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgX3NldFVzZVByZXZpZXdUYWJzKHVzZVByZXZpZXdUYWJzOiA/Ym9vbGVhbik6IHZvaWQge1xuICAgIC8vIGNvbmZpZyBpcyB2b2lkIGR1cmluZyBzdGFydHVwLCBzaWduaWZ5aW5nIG5vIGNvbmZpZyB5ZXRcbiAgICBpZiAodXNlUHJldmlld1RhYnMgPT0gbnVsbCB8fCAhdGhpcy5fZmlsZVRyZWVDb250cm9sbGVyKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuX2ZpbGVUcmVlQ29udHJvbGxlci5zZXRVc2VQcmV2aWV3VGFicyh1c2VQcmV2aWV3VGFicyk7XG4gIH1cblxuICBfZGVhY3RpdmF0ZSgpIHtcbiAgICAvLyBHdWFyZCBhZ2FpbnN0IGRlYWN0aXZhdGUgYmVpbmcgY2FsbGVkIHR3aWNlXG4gICAgaWYgKHRoaXMuX2ZpbGVUcmVlQ29udHJvbGxlcikge1xuICAgICAgdGhpcy5fZmlsZVRyZWVDb250cm9sbGVyLmRlc3Ryb3koKTtcbiAgICAgIHRoaXMuX2ZpbGVUcmVlQ29udHJvbGxlciA9IG51bGw7XG4gICAgfVxuICB9XG59XG5cbmxldCBhY3RpdmF0aW9uOiA/QWN0aXZhdGlvbjtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGFjdGl2YXRlKHN0YXRlOiA/RmlsZVRyZWVDb250cm9sbGVyU3RhdGUpOiB2b2lkIHtcbiAgICAvLyBXZSBuZWVkIHRvIGNoZWNrIGlmIHRoZSBwYWNrYWdlIGlzIGFscmVhZHkgZGlzYWJsZWQsIG90aGVyd2lzZSBBdG9tIHdpbGwgYWRkIGl0IHRvIHRoZVxuICAgIC8vICdjb3JlLmRpc2FibGVkUGFja2FnZXMnIGNvbmZpZyBtdWx0aXBsZSB0aW1lcy5cbiAgICBpZiAoIWF0b20ucGFja2FnZXMuaXNQYWNrYWdlRGlzYWJsZWQoJ3RyZWUtdmlldycpKSB7XG4gICAgICBhdG9tLnBhY2thZ2VzLmRpc2FibGVQYWNrYWdlKCd0cmVlLXZpZXcnKTtcbiAgICB9XG5cbiAgICAvLyBVbmxvYWQgJ3RyZWUtdmlldycgdG8gZnJlZSBpdHMgcmVzb3VyY2VzIHRoYXQgYXJlIG5vdCBuZWVkZWQuXG4gICAgaWYgKGF0b20ucGFja2FnZXMuaXNQYWNrYWdlTG9hZGVkKCd0cmVlLXZpZXcnKSkge1xuICAgICAgYXRvbS5wYWNrYWdlcy51bmxvYWRQYWNrYWdlKCd0cmVlLXZpZXcnKTtcbiAgICB9XG5cbiAgICBpZiAoIWFjdGl2YXRpb24pIHtcbiAgICAgIGFjdGl2YXRpb24gPSBuZXcgQWN0aXZhdGlvbihzdGF0ZSk7XG4gICAgfVxuICB9LFxuXG4gIGRlYWN0aXZhdGUoKSB7XG4gICAgaWYgKGFjdGl2YXRpb24pIHtcbiAgICAgIGFjdGl2YXRpb24uZGlzcG9zZSgpO1xuICAgICAgYWN0aXZhdGlvbiA9IG51bGw7XG4gICAgfVxuICB9LFxuXG4gIHNlcmlhbGl6ZSgpOiA/RmlsZVRyZWVDb250cm9sbGVyU3RhdGUge1xuICAgIGlmIChhY3RpdmF0aW9uKSB7XG4gICAgICByZXR1cm4gYWN0aXZhdGlvbi5zZXJpYWxpemUoKTtcbiAgICB9XG4gIH0sXG59O1xuIl19