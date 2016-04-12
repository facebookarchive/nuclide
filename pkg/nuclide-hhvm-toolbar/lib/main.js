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
//# sourceMappingURL=data:application/json;base64,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TSxTQUFTLGNBQWMsQ0FBQyxVQUFxQyxFQUFRO0FBQzFFLDJCQUFVLFVBQVUsQ0FBQyxDQUFDO0FBQ3RCLFNBQU8sVUFBVSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQztDQUM5Qzs7QUFFTSxTQUFTLFVBQVUsR0FBRztBQUMzQixNQUFJLFVBQVUsRUFBRTtBQUNkLGNBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNyQixjQUFVLEdBQUcsSUFBSSxDQUFDO0dBQ25CO0NBQ0Y7O0FBRU0sU0FBUyxTQUFTLEdBQVc7QUFDbEMsTUFBSSxVQUFVLEVBQUU7QUFDZCxXQUFPLFVBQVUsQ0FBQyxTQUFTLEVBQUUsQ0FBQztHQUMvQixNQUFNO0FBQ0wsV0FBTyxFQUFFLENBQUM7R0FDWDtDQUNGIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSBOdWNsaWRlVG9vbGJhclR5cGUgZnJvbSAnLi9OdWNsaWRlVG9vbGJhcic7XG5pbXBvcnQgdHlwZSBQcm9qZWN0U3RvcmVUeXBlIGZyb20gJy4vUHJvamVjdFN0b3JlJztcblxuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlLCBEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcblxuY2xhc3MgQWN0aXZhdGlvbiB7XG5cbiAgX2Rpc3Bvc2FibGVzOiBhdG9tJENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIF9pdGVtOiA/SFRNTEVsZW1lbnQ7XG4gIF9wYW5lbDogT2JqZWN0O1xuICBfcHJvamVjdFN0b3JlOiBQcm9qZWN0U3RvcmVUeXBlO1xuICBfbnVjbGlkZVRvb2xiYXI6ID9OdWNsaWRlVG9vbGJhclR5cGU7XG4gIF9zdGF0ZTogT2JqZWN0O1xuXG4gIGNvbnN0cnVjdG9yKHN0YXRlOiA/T2JqZWN0KSB7XG4gICAgY29uc3QgUHJvamVjdFN0b3JlID0gcmVxdWlyZSgnLi9Qcm9qZWN0U3RvcmUnKTtcblxuICAgIHRoaXMuX3N0YXRlID0ge1xuICAgICAgcGFuZWxWaXNpYmxlOiBzdGF0ZSAhPSBudWxsICYmIHN0YXRlLnBhbmVsVmlzaWJsZSAhPSBudWxsID8gc3RhdGUucGFuZWxWaXNpYmxlIDogdHJ1ZSxcbiAgICB9O1xuXG4gICAgdGhpcy5fZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIHRoaXMuX3Byb2plY3RTdG9yZSA9IG5ldyBQcm9qZWN0U3RvcmUoKTtcbiAgICB0aGlzLl9hZGRDb21tYW5kcygpO1xuICAgIHRoaXMuX2NyZWF0ZVRvb2xiYXIoKTtcbiAgfVxuXG4gIF9hZGRDb21tYW5kcygpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5hZGQoXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZChcbiAgICAgICAgJ2JvZHknLFxuICAgICAgICAnbnVjbGlkZS1oaHZtLXRvb2xiYXI6dG9nZ2xlJyxcbiAgICAgICAgKCkgPT4geyB0aGlzLnRvZ2dsZVBhbmVsKCk7IH0sXG4gICAgICApXG4gICAgKTtcbiAgfVxuXG4gIGNvbnN1bWVUb29sQmFyKGdldFRvb2xCYXI6IChncm91cDogc3RyaW5nKSA9PiBPYmplY3QpOiB2b2lkIHtcbiAgICBjb25zdCBoaHZtSWNvbiA9IHJlcXVpcmUoJy4vaGh2bUljb24nKTtcbiAgICBjb25zdCB0b29sQmFyID0gZ2V0VG9vbEJhcignbnVjbGlkZS1idWNrLXRvb2xiYXInKTtcbiAgICBjb25zdCB0b29sQmFyQnV0dG9uID0gdG9vbEJhci5hZGRCdXR0b24oe1xuICAgICAgY2FsbGJhY2s6ICdudWNsaWRlLWhodm0tdG9vbGJhcjp0b2dnbGUnLFxuICAgICAgdG9vbHRpcDogJ1RvZ2dsZSBISFZNIFRvb2xiYXInLFxuICAgICAgcHJpb3JpdHk6IDUwMCxcbiAgICB9KVswXTtcbiAgICB0b29sQmFyLmFkZFNwYWNlcih7XG4gICAgICBwcmlvcml0eTogNTAxLFxuICAgIH0pO1xuICAgIHRvb2xCYXJCdXR0b24uaW5uZXJIVE1MID0gaGh2bUljb24oKTtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5hZGQoXG4gICAgICBuZXcgRGlzcG9zYWJsZSgoKSA9PiB7IHRvb2xCYXIucmVtb3ZlSXRlbXMoKTsgfSksXG4gICAgKTtcbiAgfVxuXG4gIF9jcmVhdGVUb29sYmFyKCkge1xuICAgIGNvbnN0IE51Y2xpZGVUb29sYmFyID0gcmVxdWlyZSgnLi9OdWNsaWRlVG9vbGJhcicpO1xuICAgIGNvbnN0IGl0ZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBjb25zdCB7XG4gICAgICBSZWFjdCxcbiAgICAgIFJlYWN0RE9NLFxuICAgIH0gPSByZXF1aXJlKCdyZWFjdC1mb3ItYXRvbScpO1xuXG4gICAgdGhpcy5fbnVjbGlkZVRvb2xiYXIgPSBSZWFjdERPTS5yZW5kZXIoXG4gICAgICA8TnVjbGlkZVRvb2xiYXJcbiAgICAgICAgcHJvamVjdFN0b3JlPXt0aGlzLl9wcm9qZWN0U3RvcmV9XG4gICAgICAvPixcbiAgICAgIGl0ZW1cbiAgICApO1xuXG4gICAgY29uc3QgcGFuZWwgPSBhdG9tLndvcmtzcGFjZS5hZGRUb3BQYW5lbCh7XG4gICAgICBpdGVtLFxuICAgICAgLy8gSW5jcmVhc2UgcHJpb3JpdHkgKGRlZmF1bHQgaXMgMTAwKSB0byBlbnN1cmUgdGhpcyB0b29sYmFyIGNvbWVzIGFmdGVyIHRoZSAndG9vbC1iYXInXG4gICAgICAvLyBwYWNrYWdlJ3MgdG9vbGJhci4gSGllcmFyY2hpY2FsbHkgdGhlIGNvbnRyb2xsaW5nIHRvb2xiYXIgc2hvdWxkIGJlIGFib3ZlLCBhbmQgcHJhY3RpY2FsbHlcbiAgICAgIC8vIHRoaXMgZW5zdXJlcyB0aGUgcG9wb3ZlciBpbiB0aGlzIGJ1aWxkIHRvb2xiYXIgc3RhY2tzIG9uIHRvcCBvZiBvdGhlciBVSS5cbiAgICAgIHByaW9yaXR5OiAyMDAsXG4gICAgfSk7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKG5ldyBEaXNwb3NhYmxlKCgpID0+IHBhbmVsLmRlc3Ryb3koKSkpO1xuICAgIHRoaXMuX3BhbmVsID0gcGFuZWw7XG4gICAgdGhpcy5fdXBkYXRlUGFuZWxWaXNpYmlsaXR5KCk7XG4gIH1cblxuICAvKipcbiAgICogU2hvdyBvciBoaWRlIHRoZSBwYW5lbCwgaWYgbmVjZXNzYXJ5LCB0byBtYXRjaCB0aGUgY3VycmVudCBzdGF0ZS5cbiAgICovXG4gIF91cGRhdGVQYW5lbFZpc2liaWxpdHkoKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLl9wYW5lbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAodGhpcy5fc3RhdGUucGFuZWxWaXNpYmxlICE9PSB0aGlzLl9wYW5lbC52aXNpYmxlKSB7XG4gICAgICBpZiAodGhpcy5fc3RhdGUucGFuZWxWaXNpYmxlKSB7XG4gICAgICAgIHRoaXMuX3BhbmVsLnNob3coKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3BhbmVsLmhpZGUoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBzZXJpYWxpemUoKTogT2JqZWN0IHtcbiAgICByZXR1cm4ge1xuICAgICAgcGFuZWxWaXNpYmxlOiB0aGlzLl9zdGF0ZS5wYW5lbFZpc2libGUsXG4gICAgfTtcbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gICAgaWYgKHRoaXMuX251Y2xpZGVUb29sYmFyKSB7XG4gICAgICBjb25zdCB7UmVhY3RET019ID0gcmVxdWlyZSgncmVhY3QtZm9yLWF0b20nKTtcbiAgICAgIGNvbnN0IHRvb2xiYXJOb2RlID0gUmVhY3RET00uZmluZERPTU5vZGUodGhpcy5fbnVjbGlkZVRvb2xiYXIpO1xuICAgICAgLy8gSWYgdGhlIHRvb2xiYXIgaXMgY3VycmVudGx5IGhpZGRlbiBmb3Igc29tZSByZWFzb24sIHRoZW4gdG9vbGJhck5vZGUgd2lsbCBiZSBudWxsLlxuICAgICAgaWYgKHRvb2xiYXJOb2RlKSB7XG4gICAgICAgIFJlYWN0RE9NLnVubW91bnRDb21wb25lbnRBdE5vZGUodG9vbGJhck5vZGUucGFyZW50Tm9kZSk7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuX3Byb2plY3RTdG9yZS5kaXNwb3NlKCk7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuZGlzcG9zZSgpO1xuICB9XG5cbiAgdG9nZ2xlUGFuZWwoKTp2b2lkIHtcbiAgICB0aGlzLl9zdGF0ZS5wYW5lbFZpc2libGUgPSAhdGhpcy5fc3RhdGUucGFuZWxWaXNpYmxlO1xuICAgIHRoaXMuX3VwZGF0ZVBhbmVsVmlzaWJpbGl0eSgpO1xuICB9XG59XG5cbmxldCBhY3RpdmF0aW9uOiA/QWN0aXZhdGlvbiA9IG51bGw7XG5cbmV4cG9ydCBmdW5jdGlvbiBhY3RpdmF0ZShzdGF0ZTogP09iamVjdCkge1xuICBpZiAoIWFjdGl2YXRpb24pIHtcbiAgICBhY3RpdmF0aW9uID0gbmV3IEFjdGl2YXRpb24oc3RhdGUpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb25zdW1lVG9vbEJhcihnZXRUb29sQmFyOiAoZ3JvdXA6IHN0cmluZykgPT4gT2JqZWN0KTogdm9pZCB7XG4gIGludmFyaWFudChhY3RpdmF0aW9uKTtcbiAgcmV0dXJuIGFjdGl2YXRpb24uY29uc3VtZVRvb2xCYXIoZ2V0VG9vbEJhcik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZWFjdGl2YXRlKCkge1xuICBpZiAoYWN0aXZhdGlvbikge1xuICAgIGFjdGl2YXRpb24uZGlzcG9zZSgpO1xuICAgIGFjdGl2YXRpb24gPSBudWxsO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXJpYWxpemUoKTogT2JqZWN0IHtcbiAgaWYgKGFjdGl2YXRpb24pIHtcbiAgICByZXR1cm4gYWN0aXZhdGlvbi5zZXJpYWxpemUoKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4ge307XG4gIH1cbn1cbiJdfQ==