var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Activation = (function () {
  function Activation(state) {
    _classCallCheck(this, Activation);

    var _require = require('atom');

    var CompositeDisposable = _require.CompositeDisposable;

    var ProjectStore = require('./ProjectStore');

    this._state = {
      panelVisible: state != null && state.panelVisible != null ? state.panelVisible : true
    };

    // Bind functions used as callbacks to ensure correct context when called.
    this._handleBuildTargetChange = this._handleBuildTargetChange.bind(this);
    this._handleIsReactNativeServerModeChanged = this._handleIsReactNativeServerModeChanged.bind(this);

    this._disposables = new CompositeDisposable();
    this._initialBuildTarget = state && state.initialBuildTarget || '';
    this._initialIsReactNativeServerMode = state && state.initialIsReactNativeServerMode || false;
    this._projectStore = new ProjectStore();
    this._addCommands();
    this._createToolbar();
  }

  _createClass(Activation, [{
    key: '_addCommands',
    value: function _addCommands() {
      var _this = this;

      this._disposables.add(atom.commands.add('body', 'nuclide-toolbar:toggle', function () {
        _this.togglePanel();
      }));
    }
  }, {
    key: '_createToolbar',
    value: function _createToolbar() {
      var NuclideToolbar = require('./NuclideToolbar');
      var item = document.createElement('div');

      var _require2 = require('atom');

      var Disposable = _require2.Disposable;

      var React = require('react-for-atom');

      this._nuclideToolbar = React.render(React.createElement(NuclideToolbar, {
        initialIsReactNativeServerMode: this._initialIsReactNativeServerMode,
        onIsReactNativeServerModeChange: this._handleIsReactNativeServerModeChanged,
        initialBuildTarget: this._initialBuildTarget,
        onBuildTargetChange: this._handleBuildTargetChange,
        projectStore: this._projectStore
      }), item);

      var panel = atom.workspace.addTopPanel({
        item: item,
        // Increase priority (default is 100) to ensure this toolbar comes after the 'tool-bar'
        // package's toolbar. Hierarchically the controlling toolbar should be above, and practically
        // this ensures the popover in this build toolbar stacks on top of other UI.
        priority: 200
      });
      this._disposables.add(new Disposable(function () {
        return panel.destroy();
      }));
      this._panel = panel;
      this._updatePanelVisibility();
    }
  }, {
    key: '_handleBuildTargetChange',
    value: function _handleBuildTargetChange(buildTarget) {
      this._initialBuildTarget = buildTarget;
    }
  }, {
    key: '_handleIsReactNativeServerModeChanged',
    value: function _handleIsReactNativeServerModeChanged(isReactNativeServerMode) {
      this._initialIsReactNativeServerMode = isReactNativeServerMode;
    }

    /**
     * Show or hide the panel, if necessary, to match the current state.
     */
  }, {
    key: '_updatePanelVisibility',
    value: function _updatePanelVisibility() {
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
  }, {
    key: 'serialize',
    value: function serialize() {
      return {
        initialIsReactNativeServerMode: this._initialIsReactNativeServerMode,
        initialBuildTarget: this._initialBuildTarget,
        panelVisible: this._state.panelVisible
      };
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      if (this._nuclideToolbar) {
        var React = require('react-for-atom');
        var toolbarNode = React.findDOMNode(this._nuclideToolbar);
        // If the toolbar is currently hidden for some reason, then toolbarNode will be null.
        if (toolbarNode) {
          React.unmountComponentAtNode(toolbarNode.parentNode);
        }
      }
      this._projectStore.dispose();
      this._disposables.dispose();
    }
  }, {
    key: 'togglePanel',
    value: function togglePanel() {
      this._state.panelVisible = !this._state.panelVisible;
      this._updatePanelVisibility();
    }
  }]);

  return Activation;
})();

var activation = null;
var toolBar = null;

module.exports = {
  activate: function activate(state) {
    if (!activation) {
      activation = new Activation(state);
    }
  },

  consumeToolBar: function consumeToolBar(getToolBar) {
    toolBar = getToolBar('nuclide-toolbar');
    toolBar.addButton({
      icon: 'hammer',
      callback: 'nuclide-toolbar:toggle',
      tooltip: 'Toggle Build Toolbar',
      iconset: 'ion',
      priority: 500
    });
  },

  deactivate: function deactivate() {
    if (activation) {
      activation.dispose();
      activation = null;
    }
    if (toolBar) {
      toolBar.removeItems();
    }
  },

  serialize: function serialize() {
    if (activation) {
      return activation.serialize();
    } else {
      return {};
    }
  }
};

// Functions to be used as callbacks.
//# sourceMappingURL=data:application/json;base64,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XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUgTnVjbGlkZVRvb2xiYXJUeXBlIGZyb20gJy4vTnVjbGlkZVRvb2xiYXInO1xuaW1wb3J0IHR5cGUgUHJvamVjdFN0b3JlVHlwZSBmcm9tICcuL1Byb2plY3RTdG9yZSc7XG5cbmNsYXNzIEFjdGl2YXRpb24ge1xuXG4gIF9kaXNwb3NhYmxlczogYXRvbSRDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBfaW5pdGlhbEJ1aWxkVGFyZ2V0OiBzdHJpbmc7XG4gIF9pbml0aWFsSXNSZWFjdE5hdGl2ZVNlcnZlck1vZGU6IGJvb2xlYW47XG4gIF9pdGVtOiA/SFRNTEVsZW1lbnQ7XG4gIF9wYW5lbDogT2JqZWN0O1xuICBfcHJvamVjdFN0b3JlOiBQcm9qZWN0U3RvcmVUeXBlO1xuICBfbnVjbGlkZVRvb2xiYXI6ID9OdWNsaWRlVG9vbGJhclR5cGU7XG4gIF9zdGF0ZTogT2JqZWN0O1xuXG4gIC8vIEZ1bmN0aW9ucyB0byBiZSB1c2VkIGFzIGNhbGxiYWNrcy5cbiAgX2hhbmRsZUJ1aWxkVGFyZ2V0Q2hhbmdlOiBGdW5jdGlvbjtcbiAgX2hhbmRsZUlzUmVhY3ROYXRpdmVTZXJ2ZXJNb2RlQ2hhbmdlZDogRnVuY3Rpb247XG5cbiAgY29uc3RydWN0b3Ioc3RhdGU6ID9PYmplY3QpIHtcbiAgICBjb25zdCB7Q29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlKCdhdG9tJyk7XG4gICAgY29uc3QgUHJvamVjdFN0b3JlID0gcmVxdWlyZSgnLi9Qcm9qZWN0U3RvcmUnKTtcblxuICAgIHRoaXMuX3N0YXRlID0ge1xuICAgICAgcGFuZWxWaXNpYmxlOiBzdGF0ZSAhPSBudWxsICYmIHN0YXRlLnBhbmVsVmlzaWJsZSAhPSBudWxsID8gc3RhdGUucGFuZWxWaXNpYmxlIDogdHJ1ZSxcbiAgICB9O1xuXG4gICAgLy8gQmluZCBmdW5jdGlvbnMgdXNlZCBhcyBjYWxsYmFja3MgdG8gZW5zdXJlIGNvcnJlY3QgY29udGV4dCB3aGVuIGNhbGxlZC5cbiAgICB0aGlzLl9oYW5kbGVCdWlsZFRhcmdldENoYW5nZSA9IHRoaXMuX2hhbmRsZUJ1aWxkVGFyZ2V0Q2hhbmdlLmJpbmQodGhpcyk7XG4gICAgdGhpcy5faGFuZGxlSXNSZWFjdE5hdGl2ZVNlcnZlck1vZGVDaGFuZ2VkID1cbiAgICAgIHRoaXMuX2hhbmRsZUlzUmVhY3ROYXRpdmVTZXJ2ZXJNb2RlQ2hhbmdlZC5iaW5kKHRoaXMpO1xuXG4gICAgdGhpcy5fZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIHRoaXMuX2luaXRpYWxCdWlsZFRhcmdldCA9IChzdGF0ZSAmJiBzdGF0ZS5pbml0aWFsQnVpbGRUYXJnZXQpIHx8ICcnO1xuICAgIHRoaXMuX2luaXRpYWxJc1JlYWN0TmF0aXZlU2VydmVyTW9kZSA9XG4gICAgICAoc3RhdGUgJiYgc3RhdGUuaW5pdGlhbElzUmVhY3ROYXRpdmVTZXJ2ZXJNb2RlKSB8fCBmYWxzZTtcbiAgICB0aGlzLl9wcm9qZWN0U3RvcmUgPSBuZXcgUHJvamVjdFN0b3JlKCk7XG4gICAgdGhpcy5fYWRkQ29tbWFuZHMoKTtcbiAgICB0aGlzLl9jcmVhdGVUb29sYmFyKCk7XG4gIH1cblxuICBfYWRkQ29tbWFuZHMoKTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoXG4gICAgICAgICdib2R5JyxcbiAgICAgICAgJ251Y2xpZGUtdG9vbGJhcjp0b2dnbGUnLFxuICAgICAgICAoKSA9PiB7IHRoaXMudG9nZ2xlUGFuZWwoKTsgfSxcbiAgICAgIClcbiAgICApO1xuICB9XG5cbiAgX2NyZWF0ZVRvb2xiYXIoKSB7XG4gICAgY29uc3QgTnVjbGlkZVRvb2xiYXIgPSByZXF1aXJlKCcuL051Y2xpZGVUb29sYmFyJyk7XG4gICAgY29uc3QgaXRlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGNvbnN0IHtEaXNwb3NhYmxlfSA9IHJlcXVpcmUoJ2F0b20nKTtcbiAgICBjb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0LWZvci1hdG9tJyk7XG5cbiAgICB0aGlzLl9udWNsaWRlVG9vbGJhciA9IFJlYWN0LnJlbmRlcihcbiAgICAgIDxOdWNsaWRlVG9vbGJhclxuICAgICAgICBpbml0aWFsSXNSZWFjdE5hdGl2ZVNlcnZlck1vZGU9e3RoaXMuX2luaXRpYWxJc1JlYWN0TmF0aXZlU2VydmVyTW9kZX1cbiAgICAgICAgb25Jc1JlYWN0TmF0aXZlU2VydmVyTW9kZUNoYW5nZT17dGhpcy5faGFuZGxlSXNSZWFjdE5hdGl2ZVNlcnZlck1vZGVDaGFuZ2VkfVxuICAgICAgICBpbml0aWFsQnVpbGRUYXJnZXQ9e3RoaXMuX2luaXRpYWxCdWlsZFRhcmdldH1cbiAgICAgICAgb25CdWlsZFRhcmdldENoYW5nZT17dGhpcy5faGFuZGxlQnVpbGRUYXJnZXRDaGFuZ2V9XG4gICAgICAgIHByb2plY3RTdG9yZT17dGhpcy5fcHJvamVjdFN0b3JlfVxuICAgICAgLz4sXG4gICAgICBpdGVtXG4gICAgKTtcblxuICAgIGNvbnN0IHBhbmVsID0gYXRvbS53b3Jrc3BhY2UuYWRkVG9wUGFuZWwoe1xuICAgICAgaXRlbSxcbiAgICAgIC8vIEluY3JlYXNlIHByaW9yaXR5IChkZWZhdWx0IGlzIDEwMCkgdG8gZW5zdXJlIHRoaXMgdG9vbGJhciBjb21lcyBhZnRlciB0aGUgJ3Rvb2wtYmFyJ1xuICAgICAgLy8gcGFja2FnZSdzIHRvb2xiYXIuIEhpZXJhcmNoaWNhbGx5IHRoZSBjb250cm9sbGluZyB0b29sYmFyIHNob3VsZCBiZSBhYm92ZSwgYW5kIHByYWN0aWNhbGx5XG4gICAgICAvLyB0aGlzIGVuc3VyZXMgdGhlIHBvcG92ZXIgaW4gdGhpcyBidWlsZCB0b29sYmFyIHN0YWNrcyBvbiB0b3Agb2Ygb3RoZXIgVUkuXG4gICAgICBwcmlvcml0eTogMjAwLFxuICAgIH0pO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZChuZXcgRGlzcG9zYWJsZSgoKSA9PiBwYW5lbC5kZXN0cm95KCkpKTtcbiAgICB0aGlzLl9wYW5lbCA9IHBhbmVsO1xuICAgIHRoaXMuX3VwZGF0ZVBhbmVsVmlzaWJpbGl0eSgpO1xuICB9XG5cbiAgX2hhbmRsZUJ1aWxkVGFyZ2V0Q2hhbmdlKGJ1aWxkVGFyZ2V0OiBzdHJpbmcpIHtcbiAgICB0aGlzLl9pbml0aWFsQnVpbGRUYXJnZXQgPSBidWlsZFRhcmdldDtcbiAgfVxuXG4gIF9oYW5kbGVJc1JlYWN0TmF0aXZlU2VydmVyTW9kZUNoYW5nZWQoaXNSZWFjdE5hdGl2ZVNlcnZlck1vZGU6IGJvb2xlYW4pIHtcbiAgICB0aGlzLl9pbml0aWFsSXNSZWFjdE5hdGl2ZVNlcnZlck1vZGUgPSBpc1JlYWN0TmF0aXZlU2VydmVyTW9kZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTaG93IG9yIGhpZGUgdGhlIHBhbmVsLCBpZiBuZWNlc3NhcnksIHRvIG1hdGNoIHRoZSBjdXJyZW50IHN0YXRlLlxuICAgKi9cbiAgX3VwZGF0ZVBhbmVsVmlzaWJpbGl0eSgpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuX3BhbmVsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICh0aGlzLl9zdGF0ZS5wYW5lbFZpc2libGUgIT09IHRoaXMuX3BhbmVsLnZpc2libGUpIHtcbiAgICAgIGlmICh0aGlzLl9zdGF0ZS5wYW5lbFZpc2libGUpIHtcbiAgICAgICAgdGhpcy5fcGFuZWwuc2hvdygpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fcGFuZWwuaGlkZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHNlcmlhbGl6ZSgpOiBPYmplY3Qge1xuICAgIHJldHVybiB7XG4gICAgICBpbml0aWFsSXNSZWFjdE5hdGl2ZVNlcnZlck1vZGU6IHRoaXMuX2luaXRpYWxJc1JlYWN0TmF0aXZlU2VydmVyTW9kZSxcbiAgICAgIGluaXRpYWxCdWlsZFRhcmdldDogdGhpcy5faW5pdGlhbEJ1aWxkVGFyZ2V0LFxuICAgICAgcGFuZWxWaXNpYmxlOiB0aGlzLl9zdGF0ZS5wYW5lbFZpc2libGUsXG4gICAgfTtcbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gICAgaWYgKHRoaXMuX251Y2xpZGVUb29sYmFyKSB7XG4gICAgICBjb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0LWZvci1hdG9tJyk7XG4gICAgICBjb25zdCB0b29sYmFyTm9kZSA9IFJlYWN0LmZpbmRET01Ob2RlKHRoaXMuX251Y2xpZGVUb29sYmFyKTtcbiAgICAgIC8vIElmIHRoZSB0b29sYmFyIGlzIGN1cnJlbnRseSBoaWRkZW4gZm9yIHNvbWUgcmVhc29uLCB0aGVuIHRvb2xiYXJOb2RlIHdpbGwgYmUgbnVsbC5cbiAgICAgIGlmICh0b29sYmFyTm9kZSkge1xuICAgICAgICBSZWFjdC51bm1vdW50Q29tcG9uZW50QXROb2RlKHRvb2xiYXJOb2RlLnBhcmVudE5vZGUpO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLl9wcm9qZWN0U3RvcmUuZGlzcG9zZSgpO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIHRvZ2dsZVBhbmVsKCk6dm9pZCB7XG4gICAgdGhpcy5fc3RhdGUucGFuZWxWaXNpYmxlID0gIXRoaXMuX3N0YXRlLnBhbmVsVmlzaWJsZTtcbiAgICB0aGlzLl91cGRhdGVQYW5lbFZpc2liaWxpdHkoKTtcbiAgfVxufVxuXG5sZXQgYWN0aXZhdGlvbjogP0FjdGl2YXRpb24gPSBudWxsO1xubGV0IHRvb2xCYXI6ID9hbnkgPSBudWxsO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgYWN0aXZhdGUoc3RhdGU6ID9PYmplY3QpIHtcbiAgICBpZiAoIWFjdGl2YXRpb24pIHtcbiAgICAgIGFjdGl2YXRpb24gPSBuZXcgQWN0aXZhdGlvbihzdGF0ZSk7XG4gICAgfVxuICB9LFxuXG4gIGNvbnN1bWVUb29sQmFyKGdldFRvb2xCYXI6IChncm91cDogc3RyaW5nKSA9PiBPYmplY3QpOiB2b2lkIHtcbiAgICB0b29sQmFyID0gZ2V0VG9vbEJhcignbnVjbGlkZS10b29sYmFyJyk7XG4gICAgdG9vbEJhci5hZGRCdXR0b24oe1xuICAgICAgaWNvbjogJ2hhbW1lcicsXG4gICAgICBjYWxsYmFjazogJ251Y2xpZGUtdG9vbGJhcjp0b2dnbGUnLFxuICAgICAgdG9vbHRpcDogJ1RvZ2dsZSBCdWlsZCBUb29sYmFyJyxcbiAgICAgIGljb25zZXQ6ICdpb24nLFxuICAgICAgcHJpb3JpdHk6IDUwMCxcbiAgICB9KTtcbiAgfSxcblxuICBkZWFjdGl2YXRlKCkge1xuICAgIGlmIChhY3RpdmF0aW9uKSB7XG4gICAgICBhY3RpdmF0aW9uLmRpc3Bvc2UoKTtcbiAgICAgIGFjdGl2YXRpb24gPSBudWxsO1xuICAgIH1cbiAgICBpZiAodG9vbEJhcikge1xuICAgICAgdG9vbEJhci5yZW1vdmVJdGVtcygpO1xuICAgIH1cbiAgfSxcblxuICBzZXJpYWxpemUoKTogT2JqZWN0IHtcbiAgICBpZiAoYWN0aXZhdGlvbikge1xuICAgICAgcmV0dXJuIGFjdGl2YXRpb24uc2VyaWFsaXplKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG4gIH0sXG59O1xuIl19