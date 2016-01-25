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

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var Activation = (function () {
  function Activation(state) {
    _classCallCheck(this, Activation);

    var _require = require('atom');

    var CompositeDisposable = _require.CompositeDisposable;

    var ProjectStore = require('./ProjectStore');

    this._state = {
      panelVisible: state != null && state.panelVisible != null ? state.panelVisible : true
    };

    this._disposables = new CompositeDisposable();
    this._projectStore = new ProjectStore();
    this._addCommands();
    this._createToolbar();
  }

  _createClass(Activation, [{
    key: '_addCommands',
    value: function _addCommands() {
      var _this = this;

      this._disposables.add(atom.commands.add('body', 'nuclide-hhvm-toolbar:toggle', function () {
        _this.togglePanel();
      }));
    }
  }, {
    key: 'consumeToolBar',
    value: function consumeToolBar(getToolBar) {
      var React = require('react-for-atom');
      var HhvmIcon = require('./HhvmIcon');

      var _require2 = require('atom');

      var Disposable = _require2.Disposable;

      var toolBar = getToolBar('nuclide-buck-toolbar');
      var toolBarButton = toolBar.addButton({
        callback: 'nuclide-hhvm-toolbar:toggle',
        tooltip: 'Toggle HHVM Toolbar',
        priority: 500
      })[0];
      var container = document.createElement('div');
      container.className = 'hhvm-toolbar-icon-container';
      toolBarButton.appendChild(container);
      React.render(React.createElement(HhvmIcon, null), container);
      this._disposables.add(new Disposable(function () {
        toolBar.removeItems();
      }), new Disposable(function () {
        React.unmountComponentAtNode(container);
      }));
    }
  }, {
    key: '_createToolbar',
    value: function _createToolbar() {
      var NuclideToolbar = require('./NuclideToolbar');
      var item = document.createElement('div');

      var _require3 = require('atom');

      var Disposable = _require3.Disposable;

      var React = require('react-for-atom');

      this._nuclideToolbar = React.render(React.createElement(NuclideToolbar, {
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

module.exports = {
  activate: function activate(state) {
    if (!activation) {
      activation = new Activation(state);
    }
  },

  consumeToolBar: function consumeToolBar(getToolBar) {
    (0, _assert2['default'])(activation);
    return activation.consumeToolBar(getToolBar);
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
    } else {
      return {};
    }
  }
};
//# sourceMappingURL=data:application/json;base64,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YSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQzdCLFVBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDN0I7OztXQUVVLHVCQUFRO0FBQ2pCLFVBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUM7QUFDckQsVUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUM7S0FDL0I7OztTQXBIRyxVQUFVOzs7QUF1SGhCLElBQUksVUFBdUIsR0FBRyxJQUFJLENBQUM7O0FBRW5DLE1BQU0sQ0FBQyxPQUFPLEdBQUc7QUFDZixVQUFRLEVBQUEsa0JBQUMsS0FBYyxFQUFFO0FBQ3ZCLFFBQUksQ0FBQyxVQUFVLEVBQUU7QUFDZixnQkFBVSxHQUFHLElBQUksVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQ3BDO0dBQ0Y7O0FBRUQsZ0JBQWMsRUFBQSx3QkFBQyxVQUFxQyxFQUFRO0FBQzFELDZCQUFVLFVBQVUsQ0FBQyxDQUFDO0FBQ3RCLFdBQU8sVUFBVSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQztHQUM5Qzs7QUFFRCxZQUFVLEVBQUEsc0JBQUc7QUFDWCxRQUFJLFVBQVUsRUFBRTtBQUNkLGdCQUFVLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDckIsZ0JBQVUsR0FBRyxJQUFJLENBQUM7S0FDbkI7R0FDRjs7QUFFRCxXQUFTLEVBQUEscUJBQVc7QUFDbEIsUUFBSSxVQUFVLEVBQUU7QUFDZCxhQUFPLFVBQVUsQ0FBQyxTQUFTLEVBQUUsQ0FBQztLQUMvQixNQUFNO0FBQ0wsYUFBTyxFQUFFLENBQUM7S0FDWDtHQUNGO0NBQ0YsQ0FBQyIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUgTnVjbGlkZVRvb2xiYXJUeXBlIGZyb20gJy4vTnVjbGlkZVRvb2xiYXInO1xuaW1wb3J0IHR5cGUgUHJvamVjdFN0b3JlVHlwZSBmcm9tICcuL1Byb2plY3RTdG9yZSc7XG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcblxuY2xhc3MgQWN0aXZhdGlvbiB7XG5cbiAgX2Rpc3Bvc2FibGVzOiBhdG9tJENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIF9pdGVtOiA/SFRNTEVsZW1lbnQ7XG4gIF9wYW5lbDogT2JqZWN0O1xuICBfcHJvamVjdFN0b3JlOiBQcm9qZWN0U3RvcmVUeXBlO1xuICBfbnVjbGlkZVRvb2xiYXI6ID9OdWNsaWRlVG9vbGJhclR5cGU7XG4gIF9zdGF0ZTogT2JqZWN0O1xuXG4gIGNvbnN0cnVjdG9yKHN0YXRlOiA/T2JqZWN0KSB7XG4gICAgY29uc3Qge0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSgnYXRvbScpO1xuICAgIGNvbnN0IFByb2plY3RTdG9yZSA9IHJlcXVpcmUoJy4vUHJvamVjdFN0b3JlJyk7XG5cbiAgICB0aGlzLl9zdGF0ZSA9IHtcbiAgICAgIHBhbmVsVmlzaWJsZTogc3RhdGUgIT0gbnVsbCAmJiBzdGF0ZS5wYW5lbFZpc2libGUgIT0gbnVsbCA/IHN0YXRlLnBhbmVsVmlzaWJsZSA6IHRydWUsXG4gICAgfTtcblxuICAgIHRoaXMuX2Rpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLl9wcm9qZWN0U3RvcmUgPSBuZXcgUHJvamVjdFN0b3JlKCk7XG4gICAgdGhpcy5fYWRkQ29tbWFuZHMoKTtcbiAgICB0aGlzLl9jcmVhdGVUb29sYmFyKCk7XG4gIH1cblxuICBfYWRkQ29tbWFuZHMoKTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoXG4gICAgICAgICdib2R5JyxcbiAgICAgICAgJ251Y2xpZGUtaGh2bS10b29sYmFyOnRvZ2dsZScsXG4gICAgICAgICgpID0+IHsgdGhpcy50b2dnbGVQYW5lbCgpOyB9LFxuICAgICAgKVxuICAgICk7XG4gIH1cblxuICBjb25zdW1lVG9vbEJhcihnZXRUb29sQmFyOiAoZ3JvdXA6IHN0cmluZykgPT4gT2JqZWN0KTogdm9pZCB7XG4gICAgY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC1mb3ItYXRvbScpO1xuICAgIGNvbnN0IEhodm1JY29uID0gcmVxdWlyZSgnLi9IaHZtSWNvbicpO1xuICAgIGNvbnN0IHtEaXNwb3NhYmxlfSA9IHJlcXVpcmUoJ2F0b20nKTtcbiAgICBjb25zdCB0b29sQmFyID0gZ2V0VG9vbEJhcignbnVjbGlkZS1idWNrLXRvb2xiYXInKTtcbiAgICBjb25zdCB0b29sQmFyQnV0dG9uID0gdG9vbEJhci5hZGRCdXR0b24oe1xuICAgICAgY2FsbGJhY2s6ICdudWNsaWRlLWhodm0tdG9vbGJhcjp0b2dnbGUnLFxuICAgICAgdG9vbHRpcDogJ1RvZ2dsZSBISFZNIFRvb2xiYXInLFxuICAgICAgcHJpb3JpdHk6IDUwMCxcbiAgICB9KVswXTtcbiAgICBjb25zdCBjb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBjb250YWluZXIuY2xhc3NOYW1lID0gJ2hodm0tdG9vbGJhci1pY29uLWNvbnRhaW5lcic7XG4gICAgdG9vbEJhckJ1dHRvbi5hcHBlbmRDaGlsZChjb250YWluZXIpO1xuICAgIFJlYWN0LnJlbmRlcig8SGh2bUljb24gLz4sIGNvbnRhaW5lcik7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgbmV3IERpc3Bvc2FibGUoKCkgPT4geyB0b29sQmFyLnJlbW92ZUl0ZW1zKCk7IH0pLFxuICAgICAgbmV3IERpc3Bvc2FibGUoKCkgPT4geyBSZWFjdC51bm1vdW50Q29tcG9uZW50QXROb2RlKGNvbnRhaW5lcik7IH0pLFxuICAgICk7XG4gIH1cblxuICBfY3JlYXRlVG9vbGJhcigpIHtcbiAgICBjb25zdCBOdWNsaWRlVG9vbGJhciA9IHJlcXVpcmUoJy4vTnVjbGlkZVRvb2xiYXInKTtcbiAgICBjb25zdCBpdGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgY29uc3Qge0Rpc3Bvc2FibGV9ID0gcmVxdWlyZSgnYXRvbScpO1xuICAgIGNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QtZm9yLWF0b20nKTtcblxuICAgIHRoaXMuX251Y2xpZGVUb29sYmFyID0gUmVhY3QucmVuZGVyKFxuICAgICAgPE51Y2xpZGVUb29sYmFyXG4gICAgICAgIHByb2plY3RTdG9yZT17dGhpcy5fcHJvamVjdFN0b3JlfVxuICAgICAgLz4sXG4gICAgICBpdGVtXG4gICAgKTtcblxuICAgIGNvbnN0IHBhbmVsID0gYXRvbS53b3Jrc3BhY2UuYWRkVG9wUGFuZWwoe1xuICAgICAgaXRlbSxcbiAgICAgIC8vIEluY3JlYXNlIHByaW9yaXR5IChkZWZhdWx0IGlzIDEwMCkgdG8gZW5zdXJlIHRoaXMgdG9vbGJhciBjb21lcyBhZnRlciB0aGUgJ3Rvb2wtYmFyJ1xuICAgICAgLy8gcGFja2FnZSdzIHRvb2xiYXIuIEhpZXJhcmNoaWNhbGx5IHRoZSBjb250cm9sbGluZyB0b29sYmFyIHNob3VsZCBiZSBhYm92ZSwgYW5kIHByYWN0aWNhbGx5XG4gICAgICAvLyB0aGlzIGVuc3VyZXMgdGhlIHBvcG92ZXIgaW4gdGhpcyBidWlsZCB0b29sYmFyIHN0YWNrcyBvbiB0b3Agb2Ygb3RoZXIgVUkuXG4gICAgICBwcmlvcml0eTogMjAwLFxuICAgIH0pO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZChuZXcgRGlzcG9zYWJsZSgoKSA9PiBwYW5lbC5kZXN0cm95KCkpKTtcbiAgICB0aGlzLl9wYW5lbCA9IHBhbmVsO1xuICAgIHRoaXMuX3VwZGF0ZVBhbmVsVmlzaWJpbGl0eSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNob3cgb3IgaGlkZSB0aGUgcGFuZWwsIGlmIG5lY2Vzc2FyeSwgdG8gbWF0Y2ggdGhlIGN1cnJlbnQgc3RhdGUuXG4gICAqL1xuICBfdXBkYXRlUGFuZWxWaXNpYmlsaXR5KCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5fcGFuZWwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHRoaXMuX3N0YXRlLnBhbmVsVmlzaWJsZSAhPT0gdGhpcy5fcGFuZWwudmlzaWJsZSkge1xuICAgICAgaWYgKHRoaXMuX3N0YXRlLnBhbmVsVmlzaWJsZSkge1xuICAgICAgICB0aGlzLl9wYW5lbC5zaG93KCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9wYW5lbC5oaWRlKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgc2VyaWFsaXplKCk6IE9iamVjdCB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHBhbmVsVmlzaWJsZTogdGhpcy5fc3RhdGUucGFuZWxWaXNpYmxlLFxuICAgIH07XG4gIH1cblxuICBkaXNwb3NlKCkge1xuICAgIGlmICh0aGlzLl9udWNsaWRlVG9vbGJhcikge1xuICAgICAgY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC1mb3ItYXRvbScpO1xuICAgICAgY29uc3QgdG9vbGJhck5vZGUgPSBSZWFjdC5maW5kRE9NTm9kZSh0aGlzLl9udWNsaWRlVG9vbGJhcik7XG4gICAgICAvLyBJZiB0aGUgdG9vbGJhciBpcyBjdXJyZW50bHkgaGlkZGVuIGZvciBzb21lIHJlYXNvbiwgdGhlbiB0b29sYmFyTm9kZSB3aWxsIGJlIG51bGwuXG4gICAgICBpZiAodG9vbGJhck5vZGUpIHtcbiAgICAgICAgUmVhY3QudW5tb3VudENvbXBvbmVudEF0Tm9kZSh0b29sYmFyTm9kZS5wYXJlbnROb2RlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5fcHJvamVjdFN0b3JlLmRpc3Bvc2UoKTtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gIH1cblxuICB0b2dnbGVQYW5lbCgpOnZvaWQge1xuICAgIHRoaXMuX3N0YXRlLnBhbmVsVmlzaWJsZSA9ICF0aGlzLl9zdGF0ZS5wYW5lbFZpc2libGU7XG4gICAgdGhpcy5fdXBkYXRlUGFuZWxWaXNpYmlsaXR5KCk7XG4gIH1cbn1cblxubGV0IGFjdGl2YXRpb246ID9BY3RpdmF0aW9uID0gbnVsbDtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGFjdGl2YXRlKHN0YXRlOiA/T2JqZWN0KSB7XG4gICAgaWYgKCFhY3RpdmF0aW9uKSB7XG4gICAgICBhY3RpdmF0aW9uID0gbmV3IEFjdGl2YXRpb24oc3RhdGUpO1xuICAgIH1cbiAgfSxcblxuICBjb25zdW1lVG9vbEJhcihnZXRUb29sQmFyOiAoZ3JvdXA6IHN0cmluZykgPT4gT2JqZWN0KTogdm9pZCB7XG4gICAgaW52YXJpYW50KGFjdGl2YXRpb24pO1xuICAgIHJldHVybiBhY3RpdmF0aW9uLmNvbnN1bWVUb29sQmFyKGdldFRvb2xCYXIpO1xuICB9LFxuXG4gIGRlYWN0aXZhdGUoKSB7XG4gICAgaWYgKGFjdGl2YXRpb24pIHtcbiAgICAgIGFjdGl2YXRpb24uZGlzcG9zZSgpO1xuICAgICAgYWN0aXZhdGlvbiA9IG51bGw7XG4gICAgfVxuICB9LFxuXG4gIHNlcmlhbGl6ZSgpOiBPYmplY3Qge1xuICAgIGlmIChhY3RpdmF0aW9uKSB7XG4gICAgICByZXR1cm4gYWN0aXZhdGlvbi5zZXJpYWxpemUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHt9O1xuICAgIH1cbiAgfSxcbn07XG4iXX0=