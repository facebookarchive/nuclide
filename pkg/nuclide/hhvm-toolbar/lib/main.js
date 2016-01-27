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
      var _require2 = require('react-for-atom');

      var React = _require2.React;

      var HhvmIcon = require('./HhvmIcon');

      var _require3 = require('atom');

      var Disposable = _require3.Disposable;

      var toolBar = getToolBar('nuclide-buck-toolbar');
      var toolBarButton = toolBar.addButton({
        callback: 'nuclide-hhvm-toolbar:toggle',
        tooltip: 'Toggle HHVM Toolbar',
        priority: 500
      })[0];
      toolBarButton.innerHTML = React.renderToStaticMarkup(React.createElement(HhvmIcon, null));
      this._disposables.add(new Disposable(function () {
        toolBar.removeItems();
      }));
    }
  }, {
    key: '_createToolbar',
    value: function _createToolbar() {
      var NuclideToolbar = require('./NuclideToolbar');
      var item = document.createElement('div');

      var _require4 = require('atom');

      var Disposable = _require4.Disposable;

      var _require5 = require('react-for-atom');

      var React = _require5.React;

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
        var _require6 = require('react-for-atom');

        var React = _require6.React;

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
//# sourceMappingURL=data:application/json;base64,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QWhIRyxVQUFVOzs7QUFtSGhCLElBQUksVUFBdUIsR0FBRyxJQUFJLENBQUM7O0FBRW5DLE1BQU0sQ0FBQyxPQUFPLEdBQUc7QUFDZixVQUFRLEVBQUEsa0JBQUMsS0FBYyxFQUFFO0FBQ3ZCLFFBQUksQ0FBQyxVQUFVLEVBQUU7QUFDZixnQkFBVSxHQUFHLElBQUksVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQ3BDO0dBQ0Y7O0FBRUQsZ0JBQWMsRUFBQSx3QkFBQyxVQUFxQyxFQUFRO0FBQzFELDZCQUFVLFVBQVUsQ0FBQyxDQUFDO0FBQ3RCLFdBQU8sVUFBVSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQztHQUM5Qzs7QUFFRCxZQUFVLEVBQUEsc0JBQUc7QUFDWCxRQUFJLFVBQVUsRUFBRTtBQUNkLGdCQUFVLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDckIsZ0JBQVUsR0FBRyxJQUFJLENBQUM7S0FDbkI7R0FDRjs7QUFFRCxXQUFTLEVBQUEscUJBQVc7QUFDbEIsUUFBSSxVQUFVLEVBQUU7QUFDZCxhQUFPLFVBQVUsQ0FBQyxTQUFTLEVBQUUsQ0FBQztLQUMvQixNQUFNO0FBQ0wsYUFBTyxFQUFFLENBQUM7S0FDWDtHQUNGO0NBQ0YsQ0FBQyIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUgTnVjbGlkZVRvb2xiYXJUeXBlIGZyb20gJy4vTnVjbGlkZVRvb2xiYXInO1xuaW1wb3J0IHR5cGUgUHJvamVjdFN0b3JlVHlwZSBmcm9tICcuL1Byb2plY3RTdG9yZSc7XG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcblxuY2xhc3MgQWN0aXZhdGlvbiB7XG5cbiAgX2Rpc3Bvc2FibGVzOiBhdG9tJENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIF9pdGVtOiA/SFRNTEVsZW1lbnQ7XG4gIF9wYW5lbDogT2JqZWN0O1xuICBfcHJvamVjdFN0b3JlOiBQcm9qZWN0U3RvcmVUeXBlO1xuICBfbnVjbGlkZVRvb2xiYXI6ID9OdWNsaWRlVG9vbGJhclR5cGU7XG4gIF9zdGF0ZTogT2JqZWN0O1xuXG4gIGNvbnN0cnVjdG9yKHN0YXRlOiA/T2JqZWN0KSB7XG4gICAgY29uc3Qge0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSgnYXRvbScpO1xuICAgIGNvbnN0IFByb2plY3RTdG9yZSA9IHJlcXVpcmUoJy4vUHJvamVjdFN0b3JlJyk7XG5cbiAgICB0aGlzLl9zdGF0ZSA9IHtcbiAgICAgIHBhbmVsVmlzaWJsZTogc3RhdGUgIT0gbnVsbCAmJiBzdGF0ZS5wYW5lbFZpc2libGUgIT0gbnVsbCA/IHN0YXRlLnBhbmVsVmlzaWJsZSA6IHRydWUsXG4gICAgfTtcblxuICAgIHRoaXMuX2Rpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLl9wcm9qZWN0U3RvcmUgPSBuZXcgUHJvamVjdFN0b3JlKCk7XG4gICAgdGhpcy5fYWRkQ29tbWFuZHMoKTtcbiAgICB0aGlzLl9jcmVhdGVUb29sYmFyKCk7XG4gIH1cblxuICBfYWRkQ29tbWFuZHMoKTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoXG4gICAgICAgICdib2R5JyxcbiAgICAgICAgJ251Y2xpZGUtaGh2bS10b29sYmFyOnRvZ2dsZScsXG4gICAgICAgICgpID0+IHsgdGhpcy50b2dnbGVQYW5lbCgpOyB9LFxuICAgICAgKVxuICAgICk7XG4gIH1cblxuICBjb25zdW1lVG9vbEJhcihnZXRUb29sQmFyOiAoZ3JvdXA6IHN0cmluZykgPT4gT2JqZWN0KTogdm9pZCB7XG4gICAgY29uc3Qge1JlYWN0fSA9IHJlcXVpcmUoJ3JlYWN0LWZvci1hdG9tJyk7XG4gICAgY29uc3QgSGh2bUljb24gPSByZXF1aXJlKCcuL0hodm1JY29uJyk7XG4gICAgY29uc3Qge0Rpc3Bvc2FibGV9ID0gcmVxdWlyZSgnYXRvbScpO1xuICAgIGNvbnN0IHRvb2xCYXIgPSBnZXRUb29sQmFyKCdudWNsaWRlLWJ1Y2stdG9vbGJhcicpO1xuICAgIGNvbnN0IHRvb2xCYXJCdXR0b24gPSB0b29sQmFyLmFkZEJ1dHRvbih7XG4gICAgICBjYWxsYmFjazogJ251Y2xpZGUtaGh2bS10b29sYmFyOnRvZ2dsZScsXG4gICAgICB0b29sdGlwOiAnVG9nZ2xlIEhIVk0gVG9vbGJhcicsXG4gICAgICBwcmlvcml0eTogNTAwLFxuICAgIH0pWzBdO1xuICAgIHRvb2xCYXJCdXR0b24uaW5uZXJIVE1MID0gUmVhY3QucmVuZGVyVG9TdGF0aWNNYXJrdXAoPEhodm1JY29uIC8+KTtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5hZGQoXG4gICAgICBuZXcgRGlzcG9zYWJsZSgoKSA9PiB7IHRvb2xCYXIucmVtb3ZlSXRlbXMoKTsgfSksXG4gICAgKTtcbiAgfVxuXG4gIF9jcmVhdGVUb29sYmFyKCkge1xuICAgIGNvbnN0IE51Y2xpZGVUb29sYmFyID0gcmVxdWlyZSgnLi9OdWNsaWRlVG9vbGJhcicpO1xuICAgIGNvbnN0IGl0ZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBjb25zdCB7RGlzcG9zYWJsZX0gPSByZXF1aXJlKCdhdG9tJyk7XG4gICAgY29uc3Qge1JlYWN0fSA9IHJlcXVpcmUoJ3JlYWN0LWZvci1hdG9tJyk7XG5cbiAgICB0aGlzLl9udWNsaWRlVG9vbGJhciA9IFJlYWN0LnJlbmRlcihcbiAgICAgIDxOdWNsaWRlVG9vbGJhclxuICAgICAgICBwcm9qZWN0U3RvcmU9e3RoaXMuX3Byb2plY3RTdG9yZX1cbiAgICAgIC8+LFxuICAgICAgaXRlbVxuICAgICk7XG5cbiAgICBjb25zdCBwYW5lbCA9IGF0b20ud29ya3NwYWNlLmFkZFRvcFBhbmVsKHtcbiAgICAgIGl0ZW0sXG4gICAgICAvLyBJbmNyZWFzZSBwcmlvcml0eSAoZGVmYXVsdCBpcyAxMDApIHRvIGVuc3VyZSB0aGlzIHRvb2xiYXIgY29tZXMgYWZ0ZXIgdGhlICd0b29sLWJhcidcbiAgICAgIC8vIHBhY2thZ2UncyB0b29sYmFyLiBIaWVyYXJjaGljYWxseSB0aGUgY29udHJvbGxpbmcgdG9vbGJhciBzaG91bGQgYmUgYWJvdmUsIGFuZCBwcmFjdGljYWxseVxuICAgICAgLy8gdGhpcyBlbnN1cmVzIHRoZSBwb3BvdmVyIGluIHRoaXMgYnVpbGQgdG9vbGJhciBzdGFja3Mgb24gdG9wIG9mIG90aGVyIFVJLlxuICAgICAgcHJpb3JpdHk6IDIwMCxcbiAgICB9KTtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5hZGQobmV3IERpc3Bvc2FibGUoKCkgPT4gcGFuZWwuZGVzdHJveSgpKSk7XG4gICAgdGhpcy5fcGFuZWwgPSBwYW5lbDtcbiAgICB0aGlzLl91cGRhdGVQYW5lbFZpc2liaWxpdHkoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTaG93IG9yIGhpZGUgdGhlIHBhbmVsLCBpZiBuZWNlc3NhcnksIHRvIG1hdGNoIHRoZSBjdXJyZW50IHN0YXRlLlxuICAgKi9cbiAgX3VwZGF0ZVBhbmVsVmlzaWJpbGl0eSgpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuX3BhbmVsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICh0aGlzLl9zdGF0ZS5wYW5lbFZpc2libGUgIT09IHRoaXMuX3BhbmVsLnZpc2libGUpIHtcbiAgICAgIGlmICh0aGlzLl9zdGF0ZS5wYW5lbFZpc2libGUpIHtcbiAgICAgICAgdGhpcy5fcGFuZWwuc2hvdygpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fcGFuZWwuaGlkZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHNlcmlhbGl6ZSgpOiBPYmplY3Qge1xuICAgIHJldHVybiB7XG4gICAgICBwYW5lbFZpc2libGU6IHRoaXMuX3N0YXRlLnBhbmVsVmlzaWJsZSxcbiAgICB9O1xuICB9XG5cbiAgZGlzcG9zZSgpIHtcbiAgICBpZiAodGhpcy5fbnVjbGlkZVRvb2xiYXIpIHtcbiAgICAgIGNvbnN0IHtSZWFjdH0gPSByZXF1aXJlKCdyZWFjdC1mb3ItYXRvbScpO1xuICAgICAgY29uc3QgdG9vbGJhck5vZGUgPSBSZWFjdC5maW5kRE9NTm9kZSh0aGlzLl9udWNsaWRlVG9vbGJhcik7XG4gICAgICAvLyBJZiB0aGUgdG9vbGJhciBpcyBjdXJyZW50bHkgaGlkZGVuIGZvciBzb21lIHJlYXNvbiwgdGhlbiB0b29sYmFyTm9kZSB3aWxsIGJlIG51bGwuXG4gICAgICBpZiAodG9vbGJhck5vZGUpIHtcbiAgICAgICAgUmVhY3QudW5tb3VudENvbXBvbmVudEF0Tm9kZSh0b29sYmFyTm9kZS5wYXJlbnROb2RlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5fcHJvamVjdFN0b3JlLmRpc3Bvc2UoKTtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gIH1cblxuICB0b2dnbGVQYW5lbCgpOnZvaWQge1xuICAgIHRoaXMuX3N0YXRlLnBhbmVsVmlzaWJsZSA9ICF0aGlzLl9zdGF0ZS5wYW5lbFZpc2libGU7XG4gICAgdGhpcy5fdXBkYXRlUGFuZWxWaXNpYmlsaXR5KCk7XG4gIH1cbn1cblxubGV0IGFjdGl2YXRpb246ID9BY3RpdmF0aW9uID0gbnVsbDtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGFjdGl2YXRlKHN0YXRlOiA/T2JqZWN0KSB7XG4gICAgaWYgKCFhY3RpdmF0aW9uKSB7XG4gICAgICBhY3RpdmF0aW9uID0gbmV3IEFjdGl2YXRpb24oc3RhdGUpO1xuICAgIH1cbiAgfSxcblxuICBjb25zdW1lVG9vbEJhcihnZXRUb29sQmFyOiAoZ3JvdXA6IHN0cmluZykgPT4gT2JqZWN0KTogdm9pZCB7XG4gICAgaW52YXJpYW50KGFjdGl2YXRpb24pO1xuICAgIHJldHVybiBhY3RpdmF0aW9uLmNvbnN1bWVUb29sQmFyKGdldFRvb2xCYXIpO1xuICB9LFxuXG4gIGRlYWN0aXZhdGUoKSB7XG4gICAgaWYgKGFjdGl2YXRpb24pIHtcbiAgICAgIGFjdGl2YXRpb24uZGlzcG9zZSgpO1xuICAgICAgYWN0aXZhdGlvbiA9IG51bGw7XG4gICAgfVxuICB9LFxuXG4gIHNlcmlhbGl6ZSgpOiBPYmplY3Qge1xuICAgIGlmIChhY3RpdmF0aW9uKSB7XG4gICAgICByZXR1cm4gYWN0aXZhdGlvbi5zZXJpYWxpemUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHt9O1xuICAgIH1cbiAgfSxcbn07XG4iXX0=