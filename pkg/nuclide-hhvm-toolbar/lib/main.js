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
exports.consumeToolBar = consumeToolBar;
exports.deactivate = deactivate;
exports.serialize = serialize;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _reactForAtom = require('react-for-atom');

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
      toolBar.addSpacer({
        priority: 501
      });
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

      this._nuclideToolbar = _reactForAtom.ReactDOM.render(_reactForAtom.React.createElement(NuclideToolbar, {
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
        var toolbarNode = _reactForAtom.ReactDOM.findDOMNode(this._nuclideToolbar);
        // If the toolbar is currently hidden for some reason, then toolbarNode will be null.
        if (toolbarNode) {
          _reactForAtom.ReactDOM.unmountComponentAtNode(toolbarNode.parentNode);
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

function activate(state) {
  if (!activation) {
    activation = new Activation(state);
  }
}

function consumeToolBar(getToolBar) {
  (0, _assert2['default'])(activation);
  return activation.consumeToolBar(getToolBar);
}

function deactivate() {
  if (activation) {
    activation.dispose();
    activation = null;
  }
}

function serialize() {
  if (activation) {
    return activation.serialize();
  } else {
    return {};
  }
}
//# sourceMappingURL=data:application/json;base64,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QUFVLEdBQUc7QUFDM0IsTUFBSSxVQUFVLEVBQUU7QUFDZCxjQUFVLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDckIsY0FBVSxHQUFHLElBQUksQ0FBQztHQUNuQjtDQUNGOztBQUVNLFNBQVMsU0FBUyxHQUFXO0FBQ2xDLE1BQUksVUFBVSxFQUFFO0FBQ2QsV0FBTyxVQUFVLENBQUMsU0FBUyxFQUFFLENBQUM7R0FDL0IsTUFBTTtBQUNMLFdBQU8sRUFBRSxDQUFDO0dBQ1g7Q0FDRiIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUgTnVjbGlkZVRvb2xiYXJUeXBlIGZyb20gJy4vTnVjbGlkZVRvb2xiYXInO1xuaW1wb3J0IHR5cGUgUHJvamVjdFN0b3JlVHlwZSBmcm9tICcuL1Byb2plY3RTdG9yZSc7XG5cbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZSwgRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQge1JlYWN0LCBSZWFjdERPTX0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuXG5jbGFzcyBBY3RpdmF0aW9uIHtcblxuICBfZGlzcG9zYWJsZXM6IGF0b20kQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX2l0ZW06ID9IVE1MRWxlbWVudDtcbiAgX3BhbmVsOiBPYmplY3Q7XG4gIF9wcm9qZWN0U3RvcmU6IFByb2plY3RTdG9yZVR5cGU7XG4gIF9udWNsaWRlVG9vbGJhcjogP051Y2xpZGVUb29sYmFyVHlwZTtcbiAgX3N0YXRlOiBPYmplY3Q7XG5cbiAgY29uc3RydWN0b3Ioc3RhdGU6ID9PYmplY3QpIHtcbiAgICBjb25zdCBQcm9qZWN0U3RvcmUgPSByZXF1aXJlKCcuL1Byb2plY3RTdG9yZScpO1xuXG4gICAgdGhpcy5fc3RhdGUgPSB7XG4gICAgICBwYW5lbFZpc2libGU6IHN0YXRlICE9IG51bGwgJiYgc3RhdGUucGFuZWxWaXNpYmxlICE9IG51bGwgPyBzdGF0ZS5wYW5lbFZpc2libGUgOiB0cnVlLFxuICAgIH07XG5cbiAgICB0aGlzLl9kaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgdGhpcy5fcHJvamVjdFN0b3JlID0gbmV3IFByb2plY3RTdG9yZSgpO1xuICAgIHRoaXMuX2FkZENvbW1hbmRzKCk7XG4gICAgdGhpcy5fY3JlYXRlVG9vbGJhcigpO1xuICB9XG5cbiAgX2FkZENvbW1hbmRzKCk6IHZvaWQge1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZChcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKFxuICAgICAgICAnYm9keScsXG4gICAgICAgICdudWNsaWRlLWhodm0tdG9vbGJhcjp0b2dnbGUnLFxuICAgICAgICAoKSA9PiB7IHRoaXMudG9nZ2xlUGFuZWwoKTsgfSxcbiAgICAgIClcbiAgICApO1xuICB9XG5cbiAgY29uc3VtZVRvb2xCYXIoZ2V0VG9vbEJhcjogKGdyb3VwOiBzdHJpbmcpID0+IE9iamVjdCk6IHZvaWQge1xuICAgIGNvbnN0IGhodm1JY29uID0gcmVxdWlyZSgnLi9oaHZtSWNvbicpO1xuICAgIGNvbnN0IHRvb2xCYXIgPSBnZXRUb29sQmFyKCdudWNsaWRlLWJ1Y2stdG9vbGJhcicpO1xuICAgIGNvbnN0IHRvb2xCYXJCdXR0b24gPSB0b29sQmFyLmFkZEJ1dHRvbih7XG4gICAgICBjYWxsYmFjazogJ251Y2xpZGUtaGh2bS10b29sYmFyOnRvZ2dsZScsXG4gICAgICB0b29sdGlwOiAnVG9nZ2xlIEhIVk0gVG9vbGJhcicsXG4gICAgICBwcmlvcml0eTogNTAwLFxuICAgIH0pWzBdO1xuICAgIHRvb2xCYXIuYWRkU3BhY2VyKHtcbiAgICAgIHByaW9yaXR5OiA1MDEsXG4gICAgfSk7XG4gICAgdG9vbEJhckJ1dHRvbi5pbm5lckhUTUwgPSBoaHZtSWNvbigpO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZChcbiAgICAgIG5ldyBEaXNwb3NhYmxlKCgpID0+IHsgdG9vbEJhci5yZW1vdmVJdGVtcygpOyB9KSxcbiAgICApO1xuICB9XG5cbiAgX2NyZWF0ZVRvb2xiYXIoKSB7XG4gICAgY29uc3QgTnVjbGlkZVRvb2xiYXIgPSByZXF1aXJlKCcuL051Y2xpZGVUb29sYmFyJyk7XG4gICAgY29uc3QgaXRlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXG4gICAgdGhpcy5fbnVjbGlkZVRvb2xiYXIgPSBSZWFjdERPTS5yZW5kZXIoXG4gICAgICA8TnVjbGlkZVRvb2xiYXJcbiAgICAgICAgcHJvamVjdFN0b3JlPXt0aGlzLl9wcm9qZWN0U3RvcmV9XG4gICAgICAvPixcbiAgICAgIGl0ZW1cbiAgICApO1xuXG4gICAgY29uc3QgcGFuZWwgPSBhdG9tLndvcmtzcGFjZS5hZGRUb3BQYW5lbCh7XG4gICAgICBpdGVtLFxuICAgICAgLy8gSW5jcmVhc2UgcHJpb3JpdHkgKGRlZmF1bHQgaXMgMTAwKSB0byBlbnN1cmUgdGhpcyB0b29sYmFyIGNvbWVzIGFmdGVyIHRoZSAndG9vbC1iYXInXG4gICAgICAvLyBwYWNrYWdlJ3MgdG9vbGJhci4gSGllcmFyY2hpY2FsbHkgdGhlIGNvbnRyb2xsaW5nIHRvb2xiYXIgc2hvdWxkIGJlIGFib3ZlLCBhbmQgcHJhY3RpY2FsbHlcbiAgICAgIC8vIHRoaXMgZW5zdXJlcyB0aGUgcG9wb3ZlciBpbiB0aGlzIGJ1aWxkIHRvb2xiYXIgc3RhY2tzIG9uIHRvcCBvZiBvdGhlciBVSS5cbiAgICAgIHByaW9yaXR5OiAyMDAsXG4gICAgfSk7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKG5ldyBEaXNwb3NhYmxlKCgpID0+IHBhbmVsLmRlc3Ryb3koKSkpO1xuICAgIHRoaXMuX3BhbmVsID0gcGFuZWw7XG4gICAgdGhpcy5fdXBkYXRlUGFuZWxWaXNpYmlsaXR5KCk7XG4gIH1cblxuICAvKipcbiAgICogU2hvdyBvciBoaWRlIHRoZSBwYW5lbCwgaWYgbmVjZXNzYXJ5LCB0byBtYXRjaCB0aGUgY3VycmVudCBzdGF0ZS5cbiAgICovXG4gIF91cGRhdGVQYW5lbFZpc2liaWxpdHkoKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLl9wYW5lbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAodGhpcy5fc3RhdGUucGFuZWxWaXNpYmxlICE9PSB0aGlzLl9wYW5lbC52aXNpYmxlKSB7XG4gICAgICBpZiAodGhpcy5fc3RhdGUucGFuZWxWaXNpYmxlKSB7XG4gICAgICAgIHRoaXMuX3BhbmVsLnNob3coKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3BhbmVsLmhpZGUoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBzZXJpYWxpemUoKTogT2JqZWN0IHtcbiAgICByZXR1cm4ge1xuICAgICAgcGFuZWxWaXNpYmxlOiB0aGlzLl9zdGF0ZS5wYW5lbFZpc2libGUsXG4gICAgfTtcbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gICAgaWYgKHRoaXMuX251Y2xpZGVUb29sYmFyKSB7XG4gICAgICBjb25zdCB0b29sYmFyTm9kZSA9IFJlYWN0RE9NLmZpbmRET01Ob2RlKHRoaXMuX251Y2xpZGVUb29sYmFyKTtcbiAgICAgIC8vIElmIHRoZSB0b29sYmFyIGlzIGN1cnJlbnRseSBoaWRkZW4gZm9yIHNvbWUgcmVhc29uLCB0aGVuIHRvb2xiYXJOb2RlIHdpbGwgYmUgbnVsbC5cbiAgICAgIGlmICh0b29sYmFyTm9kZSkge1xuICAgICAgICBSZWFjdERPTS51bm1vdW50Q29tcG9uZW50QXROb2RlKHRvb2xiYXJOb2RlLnBhcmVudE5vZGUpO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLl9wcm9qZWN0U3RvcmUuZGlzcG9zZSgpO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIHRvZ2dsZVBhbmVsKCk6dm9pZCB7XG4gICAgdGhpcy5fc3RhdGUucGFuZWxWaXNpYmxlID0gIXRoaXMuX3N0YXRlLnBhbmVsVmlzaWJsZTtcbiAgICB0aGlzLl91cGRhdGVQYW5lbFZpc2liaWxpdHkoKTtcbiAgfVxufVxuXG5sZXQgYWN0aXZhdGlvbjogP0FjdGl2YXRpb24gPSBudWxsO1xuXG5leHBvcnQgZnVuY3Rpb24gYWN0aXZhdGUoc3RhdGU6ID9PYmplY3QpIHtcbiAgaWYgKCFhY3RpdmF0aW9uKSB7XG4gICAgYWN0aXZhdGlvbiA9IG5ldyBBY3RpdmF0aW9uKHN0YXRlKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY29uc3VtZVRvb2xCYXIoZ2V0VG9vbEJhcjogKGdyb3VwOiBzdHJpbmcpID0+IE9iamVjdCk6IHZvaWQge1xuICBpbnZhcmlhbnQoYWN0aXZhdGlvbik7XG4gIHJldHVybiBhY3RpdmF0aW9uLmNvbnN1bWVUb29sQmFyKGdldFRvb2xCYXIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVhY3RpdmF0ZSgpIHtcbiAgaWYgKGFjdGl2YXRpb24pIHtcbiAgICBhY3RpdmF0aW9uLmRpc3Bvc2UoKTtcbiAgICBhY3RpdmF0aW9uID0gbnVsbDtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2VyaWFsaXplKCk6IE9iamVjdCB7XG4gIGlmIChhY3RpdmF0aW9uKSB7XG4gICAgcmV0dXJuIGFjdGl2YXRpb24uc2VyaWFsaXplKCk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHt9O1xuICB9XG59XG4iXX0=