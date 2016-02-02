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
//# sourceMappingURL=data:application/json;base64,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LENBQUMsS0FBSyxDQUFDLENBQUM7S0FDcEM7R0FDRjs7QUFFRCxZQUFVLEVBQUEsc0JBQUc7QUFDWCxRQUFJLFVBQVUsRUFBRTtBQUNkLGdCQUFVLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDckIsZ0JBQVUsR0FBRyxJQUFJLENBQUM7S0FDbkI7R0FDRjs7QUFFRCxXQUFTLEVBQUEscUJBQTZCO0FBQ3BDLFFBQUksVUFBVSxFQUFFO0FBQ2QsYUFBTyxVQUFVLENBQUMsU0FBUyxFQUFFLENBQUM7S0FDL0I7R0FDRjtDQUNGLENBQUMiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCB0eXBlIHtGaWxlVHJlZUNvbnRyb2xsZXJTdGF0ZX0gZnJvbSAnLi9GaWxlVHJlZUNvbnRyb2xsZXInO1xuaW1wb3J0IHR5cGUgRmlsZVRyZWVDb250cm9sbGVyVHlwZSBmcm9tICcuL0ZpbGVUcmVlQ29udHJvbGxlcic7XG5cbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5cbmltcG9ydCBmZWF0dXJlQ29uZmlnIGZyb20gJy4uLy4uL2ZlYXR1cmUtY29uZmlnJztcblxuLyoqXG4gKiBNaW5pbXVtIGludGVydmFsIChpbiBtcykgYmV0d2VlbiBvbkNoYW5nZUFjdGl2ZVBhbmVJdGVtIGV2ZW50cyBiZWZvcmUgcmV2ZWFsaW5nIHRoZSBhY3RpdmUgcGFuZVxuICogaXRlbSBpbiB0aGUgZmlsZSB0cmVlLlxuICovXG5jb25zdCBBQ1RJVkVfUEFORV9ERUJPVU5DRV9JTlRFUlZBTF9NUyA9IDE1MDtcblxuY2xhc3MgQWN0aXZhdGlvbiB7XG4gIF9maWxlVHJlZUNvbnRyb2xsZXI6ID9GaWxlVHJlZUNvbnRyb2xsZXJUeXBlO1xuICBfcGFja2FnZVN0YXRlOiA/RmlsZVRyZWVDb250cm9sbGVyU3RhdGU7XG4gIF9zdWJzY3JpcHRpb25zOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBfcGFuZUl0ZW1TdWJzY3JpcHRpb246ID9EaXNwb3NhYmxlO1xuXG4gIGNvbnN0cnVjdG9yKHN0YXRlOiA/RmlsZVRyZWVDb250cm9sbGVyU3RhdGUpIHtcbiAgICB0aGlzLl9wYWNrYWdlU3RhdGUgPSBzdGF0ZTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcblxuICAgIGNvbnN0IEZpbGVUcmVlQ29udHJvbGxlciA9IHJlcXVpcmUoJy4vRmlsZVRyZWVDb250cm9sbGVyJyk7XG4gICAgdGhpcy5fZmlsZVRyZWVDb250cm9sbGVyID0gbmV3IEZpbGVUcmVlQ29udHJvbGxlcih0aGlzLl9wYWNrYWdlU3RhdGUpO1xuXG4gICAgY29uc3QgcmV2ZWFsU2V0dGluZyA9ICdudWNsaWRlLWZpbGUtdHJlZS5yZXZlYWxGaWxlT25Td2l0Y2gnO1xuICAgIC8vIEZsb3cgZG9lcyBub3Qga25vdyB0aGF0IHRoaXMgc2V0dGluZyBpcyBhIGJvb2xlYW4sIHRodXMgdGhlIGNhc3QuXG4gICAgdGhpcy5fc2V0UmV2ZWFsT25GaWxlU3dpdGNoKCgoZmVhdHVyZUNvbmZpZy5nZXQocmV2ZWFsU2V0dGluZyk6IGFueSk6IGJvb2xlYW4pKTtcblxuICAgIGNvbnN0IGlnbm9yZWROYW1lc1NldHRpbmcgPSAnY29yZS5pZ25vcmVkTmFtZXMnO1xuICAgIHRoaXMuX3NldElnbm9yZWROYW1lcygoKGF0b20uY29uZmlnLmdldChpZ25vcmVkTmFtZXNTZXR0aW5nKTogYW55KTogc3RyaW5nIHwgQXJyYXk8c3RyaW5nPikpO1xuXG4gICAgY29uc3QgaGlkZUlnbm9yZWROYW1lc1NldHRpbmcgPSAnbnVjbGlkZS1maWxlLXRyZWUuaGlkZUlnbm9yZWROYW1lcyc7XG4gICAgdGhpcy5fc2V0UmV2ZWFsT25GaWxlU3dpdGNoKCgoZmVhdHVyZUNvbmZpZy5nZXQoaGlkZUlnbm9yZWROYW1lc1NldHRpbmcpOiBhbnkpOiBib29sZWFuKSk7XG5cbiAgICBjb25zdCBleGNsdWRlVmNzSWdub3JlZFBhdGhzU2V0dGluZyA9ICdjb3JlLmV4Y2x1ZGVWY3NJZ25vcmVkUGF0aHMnO1xuICAgIHRoaXMuX3NldEV4Y2x1ZGVWY3NJZ25vcmVkUGF0aHMoXG4gICAgICAoKGF0b20uY29uZmlnLmdldChleGNsdWRlVmNzSWdub3JlZFBhdGhzU2V0dGluZyk6IGFueSk6IGJvb2xlYW4pXG4gICAgKTtcblxuICAgIGNvbnN0IHVzZVByZXZpZXdUYWJzID0gJ3RhYnMudXNlUHJldmlld1RhYnMnO1xuICAgIHRoaXMuX3NldFVzZVByZXZpZXdUYWJzKCgoYXRvbS5jb25maWcuZ2V0KHVzZVByZXZpZXdUYWJzKTogYW55KTogP2Jvb2xlYW4pKTtcblxuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgZmVhdHVyZUNvbmZpZy5vYnNlcnZlKHJldmVhbFNldHRpbmcsIHRoaXMuX3NldFJldmVhbE9uRmlsZVN3aXRjaC5iaW5kKHRoaXMpKSxcbiAgICAgIGF0b20uY29uZmlnLm9ic2VydmUoaWdub3JlZE5hbWVzU2V0dGluZywgdGhpcy5fc2V0SWdub3JlZE5hbWVzLmJpbmQodGhpcykpLFxuICAgICAgZmVhdHVyZUNvbmZpZy5vYnNlcnZlKGhpZGVJZ25vcmVkTmFtZXNTZXR0aW5nLCB0aGlzLl9zZXRIaWRlSWdub3JlZE5hbWVzLmJpbmQodGhpcykpLFxuICAgICAgYXRvbS5jb25maWcub2JzZXJ2ZShcbiAgICAgICAgZXhjbHVkZVZjc0lnbm9yZWRQYXRoc1NldHRpbmcsXG4gICAgICAgIHRoaXMuX3NldEV4Y2x1ZGVWY3NJZ25vcmVkUGF0aHMuYmluZCh0aGlzKSxcbiAgICAgICksXG4gICAgICBhdG9tLmNvbmZpZy5vYnNlcnZlKHVzZVByZXZpZXdUYWJzLCB0aGlzLl9zZXRVc2VQcmV2aWV3VGFicy5iaW5kKHRoaXMpKSxcbiAgICApO1xuXG4gIH1cblxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuX2RlYWN0aXZhdGUoKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIHNlcmlhbGl6ZSgpOiA/RmlsZVRyZWVDb250cm9sbGVyU3RhdGUge1xuICAgIGlmICh0aGlzLl9maWxlVHJlZUNvbnRyb2xsZXIpIHtcbiAgICAgIHJldHVybiB0aGlzLl9maWxlVHJlZUNvbnRyb2xsZXIuc2VyaWFsaXplKCk7XG4gICAgfVxuICB9XG5cbiAgX3NldEV4Y2x1ZGVWY3NJZ25vcmVkUGF0aHMoZXhjbHVkZVZjc0lnbm9yZWRQYXRoczogYm9vbGVhbik6IHZvaWQge1xuICAgIGlmICghdGhpcy5fZmlsZVRyZWVDb250cm9sbGVyKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuX2ZpbGVUcmVlQ29udHJvbGxlci5zZXRFeGNsdWRlVmNzSWdub3JlZFBhdGhzKGV4Y2x1ZGVWY3NJZ25vcmVkUGF0aHMpO1xuICB9XG5cbiAgX3NldEhpZGVJZ25vcmVkTmFtZXMoaGlkZUlnbm9yZWROYW1lczogYm9vbGVhbik6IHZvaWQge1xuICAgIGlmICghdGhpcy5fZmlsZVRyZWVDb250cm9sbGVyKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuX2ZpbGVUcmVlQ29udHJvbGxlci5zZXRIaWRlSWdub3JlZE5hbWVzKGhpZGVJZ25vcmVkTmFtZXMpO1xuICB9XG5cbiAgX3NldElnbm9yZWROYW1lcyhpZ25vcmVkTmFtZXM6IHN0cmluZ3xBcnJheTxzdHJpbmc+KSB7XG4gICAgaWYgKCF0aGlzLl9maWxlVHJlZUNvbnRyb2xsZXIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbGV0IG5vcm1hbGl6ZWRJZ25vcmVkTmFtZXM7XG4gICAgaWYgKGlnbm9yZWROYW1lcyA9PT0gJycpIHtcbiAgICAgIG5vcm1hbGl6ZWRJZ25vcmVkTmFtZXMgPSBbXTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBpZ25vcmVkTmFtZXMgPT09ICdzdHJpbmcnKSB7XG4gICAgICBub3JtYWxpemVkSWdub3JlZE5hbWVzID0gW2lnbm9yZWROYW1lc107XG4gICAgfSBlbHNlIHtcbiAgICAgIG5vcm1hbGl6ZWRJZ25vcmVkTmFtZXMgPSBpZ25vcmVkTmFtZXM7XG4gICAgfVxuICAgIHRoaXMuX2ZpbGVUcmVlQ29udHJvbGxlci5zZXRJZ25vcmVkTmFtZXMobm9ybWFsaXplZElnbm9yZWROYW1lcyk7XG4gIH1cblxuICBfc2V0UmV2ZWFsT25GaWxlU3dpdGNoKHNob3VsZFJldmVhbDogYm9vbGVhbikge1xuICAgIGNvbnN0IHtvbldvcmtzcGFjZURpZFN0b3BDaGFuZ2luZ0FjdGl2ZVBhbmVJdGVtfSA9XG4gICAgICByZXF1aXJlKCcuLi8uLi9hdG9tLWhlbHBlcnMnKS5hdG9tRXZlbnREZWJvdW5jZTtcblxuICAgIGlmIChzaG91bGRSZXZlYWwpIHtcbiAgICAgIGNvbnN0IHJldmVhbCA9ICgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuX2ZpbGVUcmVlQ29udHJvbGxlcikge1xuICAgICAgICAgIHRoaXMuX2ZpbGVUcmVlQ29udHJvbGxlci5yZXZlYWxBY3RpdmVGaWxlKC8qIHNob3dJZkhpZGRlbiAqLyBmYWxzZSk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICAvLyBHdWFyZCBhZ2FpbnN0IHRoaXMgZ2V0dGluZyBjYWxsZWQgbXVsdGlwbGUgdGltZXNcbiAgICAgIGlmICghdGhpcy5fcGFuZUl0ZW1TdWJzY3JpcHRpb24pIHtcbiAgICAgICAgLy8gRGVib3VuY2UgdGFiIGNoYW5nZSBldmVudHMgdG8gbGltaXQgdW5uZWVkZWQgc2Nyb2xsaW5nIHdoZW4gY2hhbmdpbmcgb3IgY2xvc2luZyB0YWJzXG4gICAgICAgIC8vIGluIHF1aWNrIHN1Y2Nlc3Npb24uXG4gICAgICAgIHRoaXMuX3BhbmVJdGVtU3Vic2NyaXB0aW9uID0gb25Xb3Jrc3BhY2VEaWRTdG9wQ2hhbmdpbmdBY3RpdmVQYW5lSXRlbShcbiAgICAgICAgICByZXZlYWwsXG4gICAgICAgICAgQUNUSVZFX1BBTkVfREVCT1VOQ0VfSU5URVJWQUxfTVNcbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5fcGFuZUl0ZW1TdWJzY3JpcHRpb24pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBVc2UgYSBsb2NhbCBzbyBGbG93IGNhbiByZWZpbmUgdGhlIHR5cGUuXG4gICAgICBjb25zdCBwYW5lSXRlbVN1YnNjcmlwdGlvbiA9IHRoaXMuX3BhbmVJdGVtU3Vic2NyaXB0aW9uO1xuICAgICAgaWYgKHBhbmVJdGVtU3Vic2NyaXB0aW9uKSB7XG4gICAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMucmVtb3ZlKHBhbmVJdGVtU3Vic2NyaXB0aW9uKTtcbiAgICAgICAgcGFuZUl0ZW1TdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICAgICAgICB0aGlzLl9wYW5lSXRlbVN1YnNjcmlwdGlvbiA9IG51bGw7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgX3NldFVzZVByZXZpZXdUYWJzKHVzZVByZXZpZXdUYWJzOiA/Ym9vbGVhbik6IHZvaWQge1xuICAgIC8vIGNvbmZpZyBpcyB2b2lkIGR1cmluZyBzdGFydHVwLCBzaWduaWZ5aW5nIG5vIGNvbmZpZyB5ZXRcbiAgICBpZiAodXNlUHJldmlld1RhYnMgPT0gbnVsbCB8fCAhdGhpcy5fZmlsZVRyZWVDb250cm9sbGVyKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuX2ZpbGVUcmVlQ29udHJvbGxlci5zZXRVc2VQcmV2aWV3VGFicyh1c2VQcmV2aWV3VGFicyk7XG4gIH1cblxuICBfZGVhY3RpdmF0ZSgpIHtcbiAgICAvLyBHdWFyZCBhZ2FpbnN0IGRlYWN0aXZhdGUgYmVpbmcgY2FsbGVkIHR3aWNlXG4gICAgaWYgKHRoaXMuX2ZpbGVUcmVlQ29udHJvbGxlcikge1xuICAgICAgdGhpcy5fZmlsZVRyZWVDb250cm9sbGVyLmRlc3Ryb3koKTtcbiAgICAgIHRoaXMuX2ZpbGVUcmVlQ29udHJvbGxlciA9IG51bGw7XG4gICAgfVxuICB9XG59XG5cbmxldCBhY3RpdmF0aW9uOiA/QWN0aXZhdGlvbjtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGFjdGl2YXRlKHN0YXRlOiA/RmlsZVRyZWVDb250cm9sbGVyU3RhdGUpOiB2b2lkIHtcbiAgICAvLyBXZSBuZWVkIHRvIGNoZWNrIGlmIHRoZSBwYWNrYWdlIGlzIGFscmVhZHkgZGlzYWJsZWQsIG90aGVyd2lzZSBBdG9tIHdpbGwgYWRkIGl0IHRvIHRoZVxuICAgIC8vICdjb3JlLmRpc2FibGVkUGFja2FnZXMnIGNvbmZpZyBtdWx0aXBsZSB0aW1lcy5cbiAgICBpZiAoIWF0b20ucGFja2FnZXMuaXNQYWNrYWdlRGlzYWJsZWQoJ3RyZWUtdmlldycpKSB7XG4gICAgICBhdG9tLnBhY2thZ2VzLmRpc2FibGVQYWNrYWdlKCd0cmVlLXZpZXcnKTtcbiAgICB9XG5cbiAgICAvLyBVbmxvYWQgJ3RyZWUtdmlldycgdG8gZnJlZSBpdHMgcmVzb3VyY2VzIHRoYXQgYXJlIG5vdCBuZWVkZWQuXG4gICAgaWYgKGF0b20ucGFja2FnZXMuaXNQYWNrYWdlTG9hZGVkKCd0cmVlLXZpZXcnKSkge1xuICAgICAgYXRvbS5wYWNrYWdlcy51bmxvYWRQYWNrYWdlKCd0cmVlLXZpZXcnKTtcbiAgICB9XG5cbiAgICBpZiAoIWFjdGl2YXRpb24pIHtcbiAgICAgIGFjdGl2YXRpb24gPSBuZXcgQWN0aXZhdGlvbihzdGF0ZSk7XG4gICAgfVxuICB9LFxuXG4gIGRlYWN0aXZhdGUoKSB7XG4gICAgaWYgKGFjdGl2YXRpb24pIHtcbiAgICAgIGFjdGl2YXRpb24uZGlzcG9zZSgpO1xuICAgICAgYWN0aXZhdGlvbiA9IG51bGw7XG4gICAgfVxuICB9LFxuXG4gIHNlcmlhbGl6ZSgpOiA/RmlsZVRyZWVDb250cm9sbGVyU3RhdGUge1xuICAgIGlmIChhY3RpdmF0aW9uKSB7XG4gICAgICByZXR1cm4gYWN0aXZhdGlvbi5zZXJpYWxpemUoKTtcbiAgICB9XG4gIH0sXG59O1xuIl19