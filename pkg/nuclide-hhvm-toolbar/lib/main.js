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

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var Activation = (function () {
  function Activation(state) {
    _classCallCheck(this, Activation);

    var ProjectStore = require('./ProjectStore');

    this._state = {
      panelVisible: state != null && state.panelVisible != null ? state.panelVisible : true
    };

    this._disposables = new _atom.CompositeDisposable();
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
      var hhvmIcon = require('./hhvmIcon');
      var toolBar = getToolBar('nuclide-buck-toolbar');
      var toolBarButton = toolBar.addButton({
        callback: 'nuclide-hhvm-toolbar:toggle',
        tooltip: 'Toggle HHVM Toolbar',
        priority: 500
      })[0];
      toolBarButton.innerHTML = hhvmIcon();
      this._disposables.add(new _atom.Disposable(function () {
        toolBar.removeItems();
      }));
    }
  }, {
    key: '_createToolbar',
    value: function _createToolbar() {
      var NuclideToolbar = require('./NuclideToolbar');
      var item = document.createElement('div');

      var _require = require('react-for-atom');

      var React = _require.React;
      var ReactDOM = _require.ReactDOM;

      this._nuclideToolbar = ReactDOM.render(React.createElement(NuclideToolbar, {
        projectStore: this._projectStore
      }), item);

      var panel = atom.workspace.addTopPanel({
        item: item,
        // Increase priority (default is 100) to ensure this toolbar comes after the 'tool-bar'
        // package's toolbar. Hierarchically the controlling toolbar should be above, and practically
        // this ensures the popover in this build toolbar stacks on top of other UI.
        priority: 200
      });
      this._disposables.add(new _atom.Disposable(function () {
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
        var _require2 = require('react-for-atom');

        var ReactDOM = _require2.ReactDOM;

        var toolbarNode = ReactDOM.findDOMNode(this._nuclideToolbar);
        // If the toolbar is currently hidden for some reason, then toolbarNode will be null.
        if (toolbarNode) {
          ReactDOM.unmountComponentAtNode(toolbarNode.parentNode);
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
//# sourceMappingURL=data:application/json;base64,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QVUsQ0FBQyxDQUFDO0FBQ3RCLFdBQU8sVUFBVSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQztHQUM5Qzs7QUFFRCxZQUFVLEVBQUEsc0JBQUc7QUFDWCxRQUFJLFVBQVUsRUFBRTtBQUNkLGdCQUFVLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDckIsZ0JBQVUsR0FBRyxJQUFJLENBQUM7S0FDbkI7R0FDRjs7QUFFRCxXQUFTLEVBQUEscUJBQVc7QUFDbEIsUUFBSSxVQUFVLEVBQUU7QUFDZCxhQUFPLFVBQVUsQ0FBQyxTQUFTLEVBQUUsQ0FBQztLQUMvQixNQUFNO0FBQ0wsYUFBTyxFQUFFLENBQUM7S0FDWDtHQUNGO0NBQ0YsQ0FBQyIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUgTnVjbGlkZVRvb2xiYXJUeXBlIGZyb20gJy4vTnVjbGlkZVRvb2xiYXInO1xuaW1wb3J0IHR5cGUgUHJvamVjdFN0b3JlVHlwZSBmcm9tICcuL1Byb2plY3RTdG9yZSc7XG5cbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZSwgRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5cbmNsYXNzIEFjdGl2YXRpb24ge1xuXG4gIF9kaXNwb3NhYmxlczogYXRvbSRDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBfaXRlbTogP0hUTUxFbGVtZW50O1xuICBfcGFuZWw6IE9iamVjdDtcbiAgX3Byb2plY3RTdG9yZTogUHJvamVjdFN0b3JlVHlwZTtcbiAgX251Y2xpZGVUb29sYmFyOiA/TnVjbGlkZVRvb2xiYXJUeXBlO1xuICBfc3RhdGU6IE9iamVjdDtcblxuICBjb25zdHJ1Y3RvcihzdGF0ZTogP09iamVjdCkge1xuICAgIGNvbnN0IFByb2plY3RTdG9yZSA9IHJlcXVpcmUoJy4vUHJvamVjdFN0b3JlJyk7XG5cbiAgICB0aGlzLl9zdGF0ZSA9IHtcbiAgICAgIHBhbmVsVmlzaWJsZTogc3RhdGUgIT0gbnVsbCAmJiBzdGF0ZS5wYW5lbFZpc2libGUgIT0gbnVsbCA/IHN0YXRlLnBhbmVsVmlzaWJsZSA6IHRydWUsXG4gICAgfTtcblxuICAgIHRoaXMuX2Rpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLl9wcm9qZWN0U3RvcmUgPSBuZXcgUHJvamVjdFN0b3JlKCk7XG4gICAgdGhpcy5fYWRkQ29tbWFuZHMoKTtcbiAgICB0aGlzLl9jcmVhdGVUb29sYmFyKCk7XG4gIH1cblxuICBfYWRkQ29tbWFuZHMoKTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoXG4gICAgICAgICdib2R5JyxcbiAgICAgICAgJ251Y2xpZGUtaGh2bS10b29sYmFyOnRvZ2dsZScsXG4gICAgICAgICgpID0+IHsgdGhpcy50b2dnbGVQYW5lbCgpOyB9LFxuICAgICAgKVxuICAgICk7XG4gIH1cblxuICBjb25zdW1lVG9vbEJhcihnZXRUb29sQmFyOiAoZ3JvdXA6IHN0cmluZykgPT4gT2JqZWN0KTogdm9pZCB7XG4gICAgY29uc3QgaGh2bUljb24gPSByZXF1aXJlKCcuL2hodm1JY29uJyk7XG4gICAgY29uc3QgdG9vbEJhciA9IGdldFRvb2xCYXIoJ251Y2xpZGUtYnVjay10b29sYmFyJyk7XG4gICAgY29uc3QgdG9vbEJhckJ1dHRvbiA9IHRvb2xCYXIuYWRkQnV0dG9uKHtcbiAgICAgIGNhbGxiYWNrOiAnbnVjbGlkZS1oaHZtLXRvb2xiYXI6dG9nZ2xlJyxcbiAgICAgIHRvb2x0aXA6ICdUb2dnbGUgSEhWTSBUb29sYmFyJyxcbiAgICAgIHByaW9yaXR5OiA1MDAsXG4gICAgfSlbMF07XG4gICAgdG9vbEJhckJ1dHRvbi5pbm5lckhUTUwgPSBoaHZtSWNvbigpO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZChcbiAgICAgIG5ldyBEaXNwb3NhYmxlKCgpID0+IHsgdG9vbEJhci5yZW1vdmVJdGVtcygpOyB9KSxcbiAgICApO1xuICB9XG5cbiAgX2NyZWF0ZVRvb2xiYXIoKSB7XG4gICAgY29uc3QgTnVjbGlkZVRvb2xiYXIgPSByZXF1aXJlKCcuL051Y2xpZGVUb29sYmFyJyk7XG4gICAgY29uc3QgaXRlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGNvbnN0IHtcbiAgICAgIFJlYWN0LFxuICAgICAgUmVhY3RET00sXG4gICAgfSA9IHJlcXVpcmUoJ3JlYWN0LWZvci1hdG9tJyk7XG5cbiAgICB0aGlzLl9udWNsaWRlVG9vbGJhciA9IFJlYWN0RE9NLnJlbmRlcihcbiAgICAgIDxOdWNsaWRlVG9vbGJhclxuICAgICAgICBwcm9qZWN0U3RvcmU9e3RoaXMuX3Byb2plY3RTdG9yZX1cbiAgICAgIC8+LFxuICAgICAgaXRlbVxuICAgICk7XG5cbiAgICBjb25zdCBwYW5lbCA9IGF0b20ud29ya3NwYWNlLmFkZFRvcFBhbmVsKHtcbiAgICAgIGl0ZW0sXG4gICAgICAvLyBJbmNyZWFzZSBwcmlvcml0eSAoZGVmYXVsdCBpcyAxMDApIHRvIGVuc3VyZSB0aGlzIHRvb2xiYXIgY29tZXMgYWZ0ZXIgdGhlICd0b29sLWJhcidcbiAgICAgIC8vIHBhY2thZ2UncyB0b29sYmFyLiBIaWVyYXJjaGljYWxseSB0aGUgY29udHJvbGxpbmcgdG9vbGJhciBzaG91bGQgYmUgYWJvdmUsIGFuZCBwcmFjdGljYWxseVxuICAgICAgLy8gdGhpcyBlbnN1cmVzIHRoZSBwb3BvdmVyIGluIHRoaXMgYnVpbGQgdG9vbGJhciBzdGFja3Mgb24gdG9wIG9mIG90aGVyIFVJLlxuICAgICAgcHJpb3JpdHk6IDIwMCxcbiAgICB9KTtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5hZGQobmV3IERpc3Bvc2FibGUoKCkgPT4gcGFuZWwuZGVzdHJveSgpKSk7XG4gICAgdGhpcy5fcGFuZWwgPSBwYW5lbDtcbiAgICB0aGlzLl91cGRhdGVQYW5lbFZpc2liaWxpdHkoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTaG93IG9yIGhpZGUgdGhlIHBhbmVsLCBpZiBuZWNlc3NhcnksIHRvIG1hdGNoIHRoZSBjdXJyZW50IHN0YXRlLlxuICAgKi9cbiAgX3VwZGF0ZVBhbmVsVmlzaWJpbGl0eSgpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuX3BhbmVsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICh0aGlzLl9zdGF0ZS5wYW5lbFZpc2libGUgIT09IHRoaXMuX3BhbmVsLnZpc2libGUpIHtcbiAgICAgIGlmICh0aGlzLl9zdGF0ZS5wYW5lbFZpc2libGUpIHtcbiAgICAgICAgdGhpcy5fcGFuZWwuc2hvdygpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fcGFuZWwuaGlkZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHNlcmlhbGl6ZSgpOiBPYmplY3Qge1xuICAgIHJldHVybiB7XG4gICAgICBwYW5lbFZpc2libGU6IHRoaXMuX3N0YXRlLnBhbmVsVmlzaWJsZSxcbiAgICB9O1xuICB9XG5cbiAgZGlzcG9zZSgpIHtcbiAgICBpZiAodGhpcy5fbnVjbGlkZVRvb2xiYXIpIHtcbiAgICAgIGNvbnN0IHtSZWFjdERPTX0gPSByZXF1aXJlKCdyZWFjdC1mb3ItYXRvbScpO1xuICAgICAgY29uc3QgdG9vbGJhck5vZGUgPSBSZWFjdERPTS5maW5kRE9NTm9kZSh0aGlzLl9udWNsaWRlVG9vbGJhcik7XG4gICAgICAvLyBJZiB0aGUgdG9vbGJhciBpcyBjdXJyZW50bHkgaGlkZGVuIGZvciBzb21lIHJlYXNvbiwgdGhlbiB0b29sYmFyTm9kZSB3aWxsIGJlIG51bGwuXG4gICAgICBpZiAodG9vbGJhck5vZGUpIHtcbiAgICAgICAgUmVhY3RET00udW5tb3VudENvbXBvbmVudEF0Tm9kZSh0b29sYmFyTm9kZS5wYXJlbnROb2RlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5fcHJvamVjdFN0b3JlLmRpc3Bvc2UoKTtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gIH1cblxuICB0b2dnbGVQYW5lbCgpOnZvaWQge1xuICAgIHRoaXMuX3N0YXRlLnBhbmVsVmlzaWJsZSA9ICF0aGlzLl9zdGF0ZS5wYW5lbFZpc2libGU7XG4gICAgdGhpcy5fdXBkYXRlUGFuZWxWaXNpYmlsaXR5KCk7XG4gIH1cbn1cblxubGV0IGFjdGl2YXRpb246ID9BY3RpdmF0aW9uID0gbnVsbDtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGFjdGl2YXRlKHN0YXRlOiA/T2JqZWN0KSB7XG4gICAgaWYgKCFhY3RpdmF0aW9uKSB7XG4gICAgICBhY3RpdmF0aW9uID0gbmV3IEFjdGl2YXRpb24oc3RhdGUpO1xuICAgIH1cbiAgfSxcblxuICBjb25zdW1lVG9vbEJhcihnZXRUb29sQmFyOiAoZ3JvdXA6IHN0cmluZykgPT4gT2JqZWN0KTogdm9pZCB7XG4gICAgaW52YXJpYW50KGFjdGl2YXRpb24pO1xuICAgIHJldHVybiBhY3RpdmF0aW9uLmNvbnN1bWVUb29sQmFyKGdldFRvb2xCYXIpO1xuICB9LFxuXG4gIGRlYWN0aXZhdGUoKSB7XG4gICAgaWYgKGFjdGl2YXRpb24pIHtcbiAgICAgIGFjdGl2YXRpb24uZGlzcG9zZSgpO1xuICAgICAgYWN0aXZhdGlvbiA9IG51bGw7XG4gICAgfVxuICB9LFxuXG4gIHNlcmlhbGl6ZSgpOiBPYmplY3Qge1xuICAgIGlmIChhY3RpdmF0aW9uKSB7XG4gICAgICByZXR1cm4gYWN0aXZhdGlvbi5zZXJpYWxpemUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHt9O1xuICAgIH1cbiAgfSxcbn07XG4iXX0=