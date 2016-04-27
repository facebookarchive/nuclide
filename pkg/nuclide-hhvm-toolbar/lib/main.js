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

      var component = _reactForAtom.ReactDOM.render(_reactForAtom.React.createElement(NuclideToolbar, {
        projectStore: this._projectStore
      }), item);
      (0, _assert2['default'])(component instanceof NuclideToolbar);
      this._nuclideToolbar = component;

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