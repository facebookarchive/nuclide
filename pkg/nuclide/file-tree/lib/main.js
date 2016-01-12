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

    this._subscriptions.add(_featureConfig2['default'].observe(revealSetting, this._setRevealOnFileSwitch.bind(this)), atom.config.observe(ignoredNamesSetting, this._setIgnoredNames.bind(this)), _featureConfig2['default'].observe(hideIgnoredNamesSetting, this._setHideIgnoredNames.bind(this)), atom.config.observe(excludeVcsIgnoredPathsSetting, this._setExcludeVcsIgnoredPaths.bind(this)));
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
//# sourceMappingURL=data:application/json;base64,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QUksQ0FBQztTQUNuQztPQUNGO0tBQ0Y7OztXQUVVLHVCQUFHOztBQUVaLFVBQUksSUFBSSxDQUFDLG1CQUFtQixFQUFFO0FBQzVCLFlBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNuQyxZQUFJLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxDQUFDO09BQ2pDO0tBQ0Y7OztTQXJIRyxVQUFVOzs7QUF3SGhCLElBQUksVUFBdUIsWUFBQSxDQUFDOztBQUU1QixNQUFNLENBQUMsT0FBTyxHQUFHO0FBQ2YsVUFBUSxFQUFBLGtCQUFDLEtBQStCLEVBQVE7OztBQUc5QyxRQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxXQUFXLENBQUMsRUFBRTtBQUNqRCxVQUFJLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsQ0FBQztLQUMzQzs7O0FBR0QsUUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxXQUFXLENBQUMsRUFBRTtBQUM5QyxVQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUMsQ0FBQztLQUMxQzs7QUFFRCxRQUFJLENBQUMsVUFBVSxFQUFFO0FBQ2YsZ0JBQVUsR0FBRyxJQUFJLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUNwQztHQUNGOztBQUVELFlBQVUsRUFBQSxzQkFBRztBQUNYLFFBQUksVUFBVSxFQUFFO0FBQ2QsZ0JBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNyQixnQkFBVSxHQUFHLElBQUksQ0FBQztLQUNuQjtHQUNGOztBQUVELFdBQVMsRUFBQSxxQkFBNkI7QUFDcEMsUUFBSSxVQUFVLEVBQUU7QUFDZCxhQUFPLFVBQVUsQ0FBQyxTQUFTLEVBQUUsQ0FBQztLQUMvQjtHQUNGO0NBQ0YsQ0FBQyIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0Rpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHR5cGUgRmlsZVRyZWVDb250cm9sbGVyVHlwZSBmcm9tICcuL0ZpbGVUcmVlQ29udHJvbGxlcic7XG5pbXBvcnQgdHlwZSB7RmlsZVRyZWVDb250cm9sbGVyU3RhdGV9IGZyb20gJy4vRmlsZVRyZWVDb250cm9sbGVyJztcblxuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcblxuaW1wb3J0IGZlYXR1cmVDb25maWcgZnJvbSAnLi4vLi4vZmVhdHVyZS1jb25maWcnO1xuaW1wb3J0IG51Y2xpZGVGZWF0dXJlcyBmcm9tICcuLi8uLi8uLi8uLi9saWIvbnVjbGlkZUZlYXR1cmVzJztcblxuLyoqXG4gKiBNaW5pbXVtIGludGVydmFsIChpbiBtcykgYmV0d2VlbiBvbkNoYW5nZUFjdGl2ZVBhbmVJdGVtIGV2ZW50cyBiZWZvcmUgcmV2ZWFsaW5nIHRoZSBhY3RpdmUgcGFuZVxuICogaXRlbSBpbiB0aGUgZmlsZSB0cmVlLlxuICovXG5jb25zdCBBQ1RJVkVfUEFORV9ERUJPVU5DRV9JTlRFUlZBTF9NUyA9IDE1MDtcblxuY2xhc3MgQWN0aXZhdGlvbiB7XG4gIF9maWxlVHJlZUNvbnRyb2xsZXI6ID9GaWxlVHJlZUNvbnRyb2xsZXJUeXBlO1xuICBfcGFja2FnZVN0YXRlOiA/RmlsZVRyZWVDb250cm9sbGVyU3RhdGU7XG4gIF9zdWJzY3JpcHRpb25zOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBfcGFuZUl0ZW1TdWJzY3JpcHRpb246ID9EaXNwb3NhYmxlO1xuXG4gIGNvbnN0cnVjdG9yKHN0YXRlOiA/RmlsZVRyZWVDb250cm9sbGVyU3RhdGUpIHtcbiAgICB0aGlzLl9wYWNrYWdlU3RhdGUgPSBzdGF0ZTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcblxuICAgIGNvbnN0IEZpbGVUcmVlQ29udHJvbGxlciA9IHJlcXVpcmUoJy4vRmlsZVRyZWVDb250cm9sbGVyJyk7XG4gICAgdGhpcy5fZmlsZVRyZWVDb250cm9sbGVyID0gbmV3IEZpbGVUcmVlQ29udHJvbGxlcih0aGlzLl9wYWNrYWdlU3RhdGUpO1xuXG4gICAgY29uc3QgcmV2ZWFsU2V0dGluZyA9ICdudWNsaWRlLWZpbGUtdHJlZS5yZXZlYWxGaWxlT25Td2l0Y2gnO1xuICAgIC8vIEZsb3cgZG9lcyBub3Qga25vdyB0aGF0IHRoaXMgc2V0dGluZyBpcyBhIGJvb2xlYW4sIHRodXMgdGhlIGNhc3QuXG4gICAgdGhpcy5fc2V0UmV2ZWFsT25GaWxlU3dpdGNoKCgoZmVhdHVyZUNvbmZpZy5nZXQocmV2ZWFsU2V0dGluZyk6IGFueSk6IGJvb2xlYW4pKTtcblxuICAgIGNvbnN0IGlnbm9yZWROYW1lc1NldHRpbmcgPSAnY29yZS5pZ25vcmVkTmFtZXMnO1xuICAgIHRoaXMuX3NldElnbm9yZWROYW1lcygoKGF0b20uY29uZmlnLmdldChpZ25vcmVkTmFtZXNTZXR0aW5nKTogYW55KTogc3RyaW5nIHwgQXJyYXk8c3RyaW5nPikpO1xuXG4gICAgY29uc3QgaGlkZUlnbm9yZWROYW1lc1NldHRpbmcgPSAnbnVjbGlkZS1maWxlLXRyZWUuaGlkZUlnbm9yZWROYW1lcyc7XG4gICAgdGhpcy5fc2V0UmV2ZWFsT25GaWxlU3dpdGNoKCgoZmVhdHVyZUNvbmZpZy5nZXQoaGlkZUlnbm9yZWROYW1lc1NldHRpbmcpOiBhbnkpOiBib29sZWFuKSk7XG5cbiAgICBjb25zdCBleGNsdWRlVmNzSWdub3JlZFBhdGhzU2V0dGluZyA9ICdjb3JlLmV4Y2x1ZGVWY3NJZ25vcmVkUGF0aHMnO1xuICAgIHRoaXMuX3NldEV4Y2x1ZGVWY3NJZ25vcmVkUGF0aHMoXG4gICAgICAoKGF0b20uY29uZmlnLmdldChleGNsdWRlVmNzSWdub3JlZFBhdGhzU2V0dGluZyk6IGFueSk6IGJvb2xlYW4pXG4gICAgKTtcblxuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgZmVhdHVyZUNvbmZpZy5vYnNlcnZlKHJldmVhbFNldHRpbmcsIHRoaXMuX3NldFJldmVhbE9uRmlsZVN3aXRjaC5iaW5kKHRoaXMpKSxcbiAgICAgIGF0b20uY29uZmlnLm9ic2VydmUoaWdub3JlZE5hbWVzU2V0dGluZywgdGhpcy5fc2V0SWdub3JlZE5hbWVzLmJpbmQodGhpcykpLFxuICAgICAgZmVhdHVyZUNvbmZpZy5vYnNlcnZlKGhpZGVJZ25vcmVkTmFtZXNTZXR0aW5nLCB0aGlzLl9zZXRIaWRlSWdub3JlZE5hbWVzLmJpbmQodGhpcykpLFxuICAgICAgYXRvbS5jb25maWcub2JzZXJ2ZShcbiAgICAgICAgZXhjbHVkZVZjc0lnbm9yZWRQYXRoc1NldHRpbmcsXG4gICAgICAgIHRoaXMuX3NldEV4Y2x1ZGVWY3NJZ25vcmVkUGF0aHMuYmluZCh0aGlzKSxcbiAgICAgICksXG4gICAgKTtcblxuICB9XG5cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLl9kZWFjdGl2YXRlKCk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gIH1cblxuICBzZXJpYWxpemUoKTogP0ZpbGVUcmVlQ29udHJvbGxlclN0YXRlIHtcbiAgICBpZiAodGhpcy5fZmlsZVRyZWVDb250cm9sbGVyKSB7XG4gICAgICByZXR1cm4gdGhpcy5fZmlsZVRyZWVDb250cm9sbGVyLnNlcmlhbGl6ZSgpO1xuICAgIH1cbiAgfVxuXG4gIF9zZXRFeGNsdWRlVmNzSWdub3JlZFBhdGhzKGV4Y2x1ZGVWY3NJZ25vcmVkUGF0aHM6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuX2ZpbGVUcmVlQ29udHJvbGxlcikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLl9maWxlVHJlZUNvbnRyb2xsZXIuc2V0RXhjbHVkZVZjc0lnbm9yZWRQYXRocyhleGNsdWRlVmNzSWdub3JlZFBhdGhzKTtcbiAgfVxuXG4gIF9zZXRIaWRlSWdub3JlZE5hbWVzKGhpZGVJZ25vcmVkTmFtZXM6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuX2ZpbGVUcmVlQ29udHJvbGxlcikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLl9maWxlVHJlZUNvbnRyb2xsZXIuc2V0SGlkZUlnbm9yZWROYW1lcyhoaWRlSWdub3JlZE5hbWVzKTtcbiAgfVxuXG4gIF9zZXRJZ25vcmVkTmFtZXMoaWdub3JlZE5hbWVzOiBzdHJpbmd8QXJyYXk8c3RyaW5nPikge1xuICAgIGlmICghdGhpcy5fZmlsZVRyZWVDb250cm9sbGVyKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGxldCBub3JtYWxpemVkSWdub3JlZE5hbWVzO1xuICAgIGlmIChpZ25vcmVkTmFtZXMgPT09ICcnKSB7XG4gICAgICBub3JtYWxpemVkSWdub3JlZE5hbWVzID0gW107XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgaWdub3JlZE5hbWVzID09PSAnc3RyaW5nJykge1xuICAgICAgbm9ybWFsaXplZElnbm9yZWROYW1lcyA9IFtpZ25vcmVkTmFtZXNdO1xuICAgIH0gZWxzZSB7XG4gICAgICBub3JtYWxpemVkSWdub3JlZE5hbWVzID0gaWdub3JlZE5hbWVzO1xuICAgIH1cbiAgICB0aGlzLl9maWxlVHJlZUNvbnRyb2xsZXIuc2V0SWdub3JlZE5hbWVzKG5vcm1hbGl6ZWRJZ25vcmVkTmFtZXMpO1xuICB9XG5cbiAgX3NldFJldmVhbE9uRmlsZVN3aXRjaChzaG91bGRSZXZlYWw6IGJvb2xlYW4pIHtcbiAgICBjb25zdCB7b25Xb3Jrc3BhY2VEaWRTdG9wQ2hhbmdpbmdBY3RpdmVQYW5lSXRlbX0gPVxuICAgICAgcmVxdWlyZSgnLi4vLi4vYXRvbS1oZWxwZXJzJykuYXRvbUV2ZW50RGVib3VuY2U7XG5cbiAgICBpZiAoc2hvdWxkUmV2ZWFsKSB7XG4gICAgICBjb25zdCByZXZlYWwgPSAoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLl9maWxlVHJlZUNvbnRyb2xsZXIpIHtcbiAgICAgICAgICB0aGlzLl9maWxlVHJlZUNvbnRyb2xsZXIucmV2ZWFsQWN0aXZlRmlsZSgvKiBzaG93SWZIaWRkZW4gKi8gZmFsc2UpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgLy8gR3VhcmQgYWdhaW5zdCB0aGlzIGdldHRpbmcgY2FsbGVkIG11bHRpcGxlIHRpbWVzXG4gICAgICBpZiAoIXRoaXMuX3BhbmVJdGVtU3Vic2NyaXB0aW9uKSB7XG4gICAgICAgIC8vIERlYm91bmNlIHRhYiBjaGFuZ2UgZXZlbnRzIHRvIGxpbWl0IHVubmVlZGVkIHNjcm9sbGluZyB3aGVuIGNoYW5naW5nIG9yIGNsb3NpbmcgdGFic1xuICAgICAgICAvLyBpbiBxdWljayBzdWNjZXNzaW9uLlxuICAgICAgICB0aGlzLl9wYW5lSXRlbVN1YnNjcmlwdGlvbiA9IG9uV29ya3NwYWNlRGlkU3RvcENoYW5naW5nQWN0aXZlUGFuZUl0ZW0oXG4gICAgICAgICAgcmV2ZWFsLFxuICAgICAgICAgIEFDVElWRV9QQU5FX0RFQk9VTkNFX0lOVEVSVkFMX01TXG4gICAgICAgICk7XG4gICAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKHRoaXMuX3BhbmVJdGVtU3Vic2NyaXB0aW9uKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVXNlIGEgbG9jYWwgc28gRmxvdyBjYW4gcmVmaW5lIHRoZSB0eXBlLlxuICAgICAgY29uc3QgcGFuZUl0ZW1TdWJzY3JpcHRpb24gPSB0aGlzLl9wYW5lSXRlbVN1YnNjcmlwdGlvbjtcbiAgICAgIGlmIChwYW5lSXRlbVN1YnNjcmlwdGlvbikge1xuICAgICAgICB0aGlzLl9zdWJzY3JpcHRpb25zLnJlbW92ZShwYW5lSXRlbVN1YnNjcmlwdGlvbik7XG4gICAgICAgIHBhbmVJdGVtU3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgICAgICAgdGhpcy5fcGFuZUl0ZW1TdWJzY3JpcHRpb24gPSBudWxsO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIF9kZWFjdGl2YXRlKCkge1xuICAgIC8vIEd1YXJkIGFnYWluc3QgZGVhY3RpdmF0ZSBiZWluZyBjYWxsZWQgdHdpY2VcbiAgICBpZiAodGhpcy5fZmlsZVRyZWVDb250cm9sbGVyKSB7XG4gICAgICB0aGlzLl9maWxlVHJlZUNvbnRyb2xsZXIuZGVzdHJveSgpO1xuICAgICAgdGhpcy5fZmlsZVRyZWVDb250cm9sbGVyID0gbnVsbDtcbiAgICB9XG4gIH1cbn1cblxubGV0IGFjdGl2YXRpb246ID9BY3RpdmF0aW9uO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgYWN0aXZhdGUoc3RhdGU6ID9GaWxlVHJlZUNvbnRyb2xsZXJTdGF0ZSk6IHZvaWQge1xuICAgIC8vIFdlIG5lZWQgdG8gY2hlY2sgaWYgdGhlIHBhY2thZ2UgaXMgYWxyZWFkeSBkaXNhYmxlZCwgb3RoZXJ3aXNlIEF0b20gd2lsbCBhZGQgaXQgdG8gdGhlXG4gICAgLy8gJ2NvcmUuZGlzYWJsZWRQYWNrYWdlcycgY29uZmlnIG11bHRpcGxlIHRpbWVzLlxuICAgIGlmICghYXRvbS5wYWNrYWdlcy5pc1BhY2thZ2VEaXNhYmxlZCgndHJlZS12aWV3JykpIHtcbiAgICAgIGF0b20ucGFja2FnZXMuZGlzYWJsZVBhY2thZ2UoJ3RyZWUtdmlldycpO1xuICAgIH1cblxuICAgIC8vIFVubG9hZCAndHJlZS12aWV3JyB0byBmcmVlIGl0cyByZXNvdXJjZXMgdGhhdCBhcmUgbm90IG5lZWRlZC5cbiAgICBpZiAoYXRvbS5wYWNrYWdlcy5pc1BhY2thZ2VMb2FkZWQoJ3RyZWUtdmlldycpKSB7XG4gICAgICBhdG9tLnBhY2thZ2VzLnVubG9hZFBhY2thZ2UoJ3RyZWUtdmlldycpO1xuICAgIH1cblxuICAgIGlmICghYWN0aXZhdGlvbikge1xuICAgICAgYWN0aXZhdGlvbiA9IG5ldyBBY3RpdmF0aW9uKHN0YXRlKTtcbiAgICB9XG4gIH0sXG5cbiAgZGVhY3RpdmF0ZSgpIHtcbiAgICBpZiAoYWN0aXZhdGlvbikge1xuICAgICAgYWN0aXZhdGlvbi5kaXNwb3NlKCk7XG4gICAgICBhY3RpdmF0aW9uID0gbnVsbDtcbiAgICB9XG4gIH0sXG5cbiAgc2VyaWFsaXplKCk6ID9GaWxlVHJlZUNvbnRyb2xsZXJTdGF0ZSB7XG4gICAgaWYgKGFjdGl2YXRpb24pIHtcbiAgICAgIHJldHVybiBhY3RpdmF0aW9uLnNlcmlhbGl6ZSgpO1xuICAgIH1cbiAgfSxcbn07XG4iXX0=