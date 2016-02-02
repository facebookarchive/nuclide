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
      var hhvmIcon = require('./hhvmIcon');

      var _require2 = require('atom');

      var Disposable = _require2.Disposable;

      var toolBar = getToolBar('nuclide-buck-toolbar');
      var toolBarButton = toolBar.addButton({
        callback: 'nuclide-hhvm-toolbar:toggle',
        tooltip: 'Toggle HHVM Toolbar',
        priority: 500
      })[0];
      toolBarButton.innerHTML = hhvmIcon();
      this._disposables.add(new Disposable(function () {
        toolBar.removeItems();
      }));
    }
  }, {
    key: '_createToolbar',
    value: function _createToolbar() {
      var NuclideToolbar = require('./NuclideToolbar');
      var item = document.createElement('div');

      var _require3 = require('atom');

      var Disposable = _require3.Disposable;

      var _require4 = require('react-for-atom');

      var React = _require4.React;
      var ReactDOM = _require4.ReactDOM;

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
        var _require5 = require('react-for-atom');

        var ReactDOM = _require5.ReactDOM;

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
//# sourceMappingURL=data:application/json;base64,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QUFPLEdBQUc7QUFDZixVQUFRLEVBQUEsa0JBQUMsS0FBYyxFQUFFO0FBQ3ZCLFFBQUksQ0FBQyxVQUFVLEVBQUU7QUFDZixnQkFBVSxHQUFHLElBQUksVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQ3BDO0dBQ0Y7O0FBRUQsZ0JBQWMsRUFBQSx3QkFBQyxVQUFxQyxFQUFRO0FBQzFELDZCQUFVLFVBQVUsQ0FBQyxDQUFDO0FBQ3RCLFdBQU8sVUFBVSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQztHQUM5Qzs7QUFFRCxZQUFVLEVBQUEsc0JBQUc7QUFDWCxRQUFJLFVBQVUsRUFBRTtBQUNkLGdCQUFVLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDckIsZ0JBQVUsR0FBRyxJQUFJLENBQUM7S0FDbkI7R0FDRjs7QUFFRCxXQUFTLEVBQUEscUJBQVc7QUFDbEIsUUFBSSxVQUFVLEVBQUU7QUFDZCxhQUFPLFVBQVUsQ0FBQyxTQUFTLEVBQUUsQ0FBQztLQUMvQixNQUFNO0FBQ0wsYUFBTyxFQUFFLENBQUM7S0FDWDtHQUNGO0NBQ0YsQ0FBQyIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUgTnVjbGlkZVRvb2xiYXJUeXBlIGZyb20gJy4vTnVjbGlkZVRvb2xiYXInO1xuaW1wb3J0IHR5cGUgUHJvamVjdFN0b3JlVHlwZSBmcm9tICcuL1Byb2plY3RTdG9yZSc7XG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcblxuY2xhc3MgQWN0aXZhdGlvbiB7XG5cbiAgX2Rpc3Bvc2FibGVzOiBhdG9tJENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIF9pdGVtOiA/SFRNTEVsZW1lbnQ7XG4gIF9wYW5lbDogT2JqZWN0O1xuICBfcHJvamVjdFN0b3JlOiBQcm9qZWN0U3RvcmVUeXBlO1xuICBfbnVjbGlkZVRvb2xiYXI6ID9OdWNsaWRlVG9vbGJhclR5cGU7XG4gIF9zdGF0ZTogT2JqZWN0O1xuXG4gIGNvbnN0cnVjdG9yKHN0YXRlOiA/T2JqZWN0KSB7XG4gICAgY29uc3Qge0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSgnYXRvbScpO1xuICAgIGNvbnN0IFByb2plY3RTdG9yZSA9IHJlcXVpcmUoJy4vUHJvamVjdFN0b3JlJyk7XG5cbiAgICB0aGlzLl9zdGF0ZSA9IHtcbiAgICAgIHBhbmVsVmlzaWJsZTogc3RhdGUgIT0gbnVsbCAmJiBzdGF0ZS5wYW5lbFZpc2libGUgIT0gbnVsbCA/IHN0YXRlLnBhbmVsVmlzaWJsZSA6IHRydWUsXG4gICAgfTtcblxuICAgIHRoaXMuX2Rpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLl9wcm9qZWN0U3RvcmUgPSBuZXcgUHJvamVjdFN0b3JlKCk7XG4gICAgdGhpcy5fYWRkQ29tbWFuZHMoKTtcbiAgICB0aGlzLl9jcmVhdGVUb29sYmFyKCk7XG4gIH1cblxuICBfYWRkQ29tbWFuZHMoKTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoXG4gICAgICAgICdib2R5JyxcbiAgICAgICAgJ251Y2xpZGUtaGh2bS10b29sYmFyOnRvZ2dsZScsXG4gICAgICAgICgpID0+IHsgdGhpcy50b2dnbGVQYW5lbCgpOyB9LFxuICAgICAgKVxuICAgICk7XG4gIH1cblxuICBjb25zdW1lVG9vbEJhcihnZXRUb29sQmFyOiAoZ3JvdXA6IHN0cmluZykgPT4gT2JqZWN0KTogdm9pZCB7XG4gICAgY29uc3QgaGh2bUljb24gPSByZXF1aXJlKCcuL2hodm1JY29uJyk7XG4gICAgY29uc3Qge0Rpc3Bvc2FibGV9ID0gcmVxdWlyZSgnYXRvbScpO1xuICAgIGNvbnN0IHRvb2xCYXIgPSBnZXRUb29sQmFyKCdudWNsaWRlLWJ1Y2stdG9vbGJhcicpO1xuICAgIGNvbnN0IHRvb2xCYXJCdXR0b24gPSB0b29sQmFyLmFkZEJ1dHRvbih7XG4gICAgICBjYWxsYmFjazogJ251Y2xpZGUtaGh2bS10b29sYmFyOnRvZ2dsZScsXG4gICAgICB0b29sdGlwOiAnVG9nZ2xlIEhIVk0gVG9vbGJhcicsXG4gICAgICBwcmlvcml0eTogNTAwLFxuICAgIH0pWzBdO1xuICAgIHRvb2xCYXJCdXR0b24uaW5uZXJIVE1MID0gaGh2bUljb24oKTtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5hZGQoXG4gICAgICBuZXcgRGlzcG9zYWJsZSgoKSA9PiB7IHRvb2xCYXIucmVtb3ZlSXRlbXMoKTsgfSksXG4gICAgKTtcbiAgfVxuXG4gIF9jcmVhdGVUb29sYmFyKCkge1xuICAgIGNvbnN0IE51Y2xpZGVUb29sYmFyID0gcmVxdWlyZSgnLi9OdWNsaWRlVG9vbGJhcicpO1xuICAgIGNvbnN0IGl0ZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBjb25zdCB7RGlzcG9zYWJsZX0gPSByZXF1aXJlKCdhdG9tJyk7XG4gICAgY29uc3Qge1xuICAgICAgUmVhY3QsXG4gICAgICBSZWFjdERPTSxcbiAgICB9ID0gcmVxdWlyZSgncmVhY3QtZm9yLWF0b20nKTtcblxuICAgIHRoaXMuX251Y2xpZGVUb29sYmFyID0gUmVhY3RET00ucmVuZGVyKFxuICAgICAgPE51Y2xpZGVUb29sYmFyXG4gICAgICAgIHByb2plY3RTdG9yZT17dGhpcy5fcHJvamVjdFN0b3JlfVxuICAgICAgLz4sXG4gICAgICBpdGVtXG4gICAgKTtcblxuICAgIGNvbnN0IHBhbmVsID0gYXRvbS53b3Jrc3BhY2UuYWRkVG9wUGFuZWwoe1xuICAgICAgaXRlbSxcbiAgICAgIC8vIEluY3JlYXNlIHByaW9yaXR5IChkZWZhdWx0IGlzIDEwMCkgdG8gZW5zdXJlIHRoaXMgdG9vbGJhciBjb21lcyBhZnRlciB0aGUgJ3Rvb2wtYmFyJ1xuICAgICAgLy8gcGFja2FnZSdzIHRvb2xiYXIuIEhpZXJhcmNoaWNhbGx5IHRoZSBjb250cm9sbGluZyB0b29sYmFyIHNob3VsZCBiZSBhYm92ZSwgYW5kIHByYWN0aWNhbGx5XG4gICAgICAvLyB0aGlzIGVuc3VyZXMgdGhlIHBvcG92ZXIgaW4gdGhpcyBidWlsZCB0b29sYmFyIHN0YWNrcyBvbiB0b3Agb2Ygb3RoZXIgVUkuXG4gICAgICBwcmlvcml0eTogMjAwLFxuICAgIH0pO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZChuZXcgRGlzcG9zYWJsZSgoKSA9PiBwYW5lbC5kZXN0cm95KCkpKTtcbiAgICB0aGlzLl9wYW5lbCA9IHBhbmVsO1xuICAgIHRoaXMuX3VwZGF0ZVBhbmVsVmlzaWJpbGl0eSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNob3cgb3IgaGlkZSB0aGUgcGFuZWwsIGlmIG5lY2Vzc2FyeSwgdG8gbWF0Y2ggdGhlIGN1cnJlbnQgc3RhdGUuXG4gICAqL1xuICBfdXBkYXRlUGFuZWxWaXNpYmlsaXR5KCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5fcGFuZWwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHRoaXMuX3N0YXRlLnBhbmVsVmlzaWJsZSAhPT0gdGhpcy5fcGFuZWwudmlzaWJsZSkge1xuICAgICAgaWYgKHRoaXMuX3N0YXRlLnBhbmVsVmlzaWJsZSkge1xuICAgICAgICB0aGlzLl9wYW5lbC5zaG93KCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9wYW5lbC5oaWRlKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgc2VyaWFsaXplKCk6IE9iamVjdCB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHBhbmVsVmlzaWJsZTogdGhpcy5fc3RhdGUucGFuZWxWaXNpYmxlLFxuICAgIH07XG4gIH1cblxuICBkaXNwb3NlKCkge1xuICAgIGlmICh0aGlzLl9udWNsaWRlVG9vbGJhcikge1xuICAgICAgY29uc3Qge1JlYWN0RE9NfSA9IHJlcXVpcmUoJ3JlYWN0LWZvci1hdG9tJyk7XG4gICAgICBjb25zdCB0b29sYmFyTm9kZSA9IFJlYWN0RE9NLmZpbmRET01Ob2RlKHRoaXMuX251Y2xpZGVUb29sYmFyKTtcbiAgICAgIC8vIElmIHRoZSB0b29sYmFyIGlzIGN1cnJlbnRseSBoaWRkZW4gZm9yIHNvbWUgcmVhc29uLCB0aGVuIHRvb2xiYXJOb2RlIHdpbGwgYmUgbnVsbC5cbiAgICAgIGlmICh0b29sYmFyTm9kZSkge1xuICAgICAgICBSZWFjdERPTS51bm1vdW50Q29tcG9uZW50QXROb2RlKHRvb2xiYXJOb2RlLnBhcmVudE5vZGUpO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLl9wcm9qZWN0U3RvcmUuZGlzcG9zZSgpO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIHRvZ2dsZVBhbmVsKCk6dm9pZCB7XG4gICAgdGhpcy5fc3RhdGUucGFuZWxWaXNpYmxlID0gIXRoaXMuX3N0YXRlLnBhbmVsVmlzaWJsZTtcbiAgICB0aGlzLl91cGRhdGVQYW5lbFZpc2liaWxpdHkoKTtcbiAgfVxufVxuXG5sZXQgYWN0aXZhdGlvbjogP0FjdGl2YXRpb24gPSBudWxsO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgYWN0aXZhdGUoc3RhdGU6ID9PYmplY3QpIHtcbiAgICBpZiAoIWFjdGl2YXRpb24pIHtcbiAgICAgIGFjdGl2YXRpb24gPSBuZXcgQWN0aXZhdGlvbihzdGF0ZSk7XG4gICAgfVxuICB9LFxuXG4gIGNvbnN1bWVUb29sQmFyKGdldFRvb2xCYXI6IChncm91cDogc3RyaW5nKSA9PiBPYmplY3QpOiB2b2lkIHtcbiAgICBpbnZhcmlhbnQoYWN0aXZhdGlvbik7XG4gICAgcmV0dXJuIGFjdGl2YXRpb24uY29uc3VtZVRvb2xCYXIoZ2V0VG9vbEJhcik7XG4gIH0sXG5cbiAgZGVhY3RpdmF0ZSgpIHtcbiAgICBpZiAoYWN0aXZhdGlvbikge1xuICAgICAgYWN0aXZhdGlvbi5kaXNwb3NlKCk7XG4gICAgICBhY3RpdmF0aW9uID0gbnVsbDtcbiAgICB9XG4gIH0sXG5cbiAgc2VyaWFsaXplKCk6IE9iamVjdCB7XG4gICAgaWYgKGFjdGl2YXRpb24pIHtcbiAgICAgIHJldHVybiBhY3RpdmF0aW9uLnNlcmlhbGl6ZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4ge307XG4gICAgfVxuICB9LFxufTtcbiJdfQ==