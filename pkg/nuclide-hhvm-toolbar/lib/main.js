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
exports.consumeBuildSystemRegistry = consumeBuildSystemRegistry;
exports.consumeCwdApi = consumeCwdApi;
exports.consumeToolBar = consumeToolBar;
exports.getDistractionFreeModeProvider = getDistractionFreeModeProvider;
exports.deactivate = deactivate;
exports.serialize = serialize;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _uiHhvmIcon2;

function _uiHhvmIcon() {
  return _uiHhvmIcon2 = _interopRequireDefault(require('./ui/HhvmIcon'));
}

var _HhvmBuildSystem2;

function _HhvmBuildSystem() {
  return _HhvmBuildSystem2 = _interopRequireDefault(require('./HhvmBuildSystem'));
}

var Activation = (function () {
  function Activation(state) {
    _classCallCheck(this, Activation);

    var ProjectStore = require('./ProjectStore');

    this._state = {
      panelVisible: state != null && state.panelVisible != null ? state.panelVisible : true
    };

    this._disposables = new (_atom2 || _atom()).CompositeDisposable();
    this._projectStore = new ProjectStore();
    this._addCommands();
    this._createToolbar();
  }

  _createClass(Activation, [{
    key: 'setCwdApi',
    value: function setCwdApi(cwdApi) {
      this._cwdApi = cwdApi;
      if (this._buildSystem != null) {
        this._buildSystem.setCwdApi(cwdApi);
      }
    }
  }, {
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
      var toolBar = getToolBar('nuclide-buck-toolbar');

      var _toolBar$addButton = toolBar.addButton({
        callback: 'nuclide-hhvm-toolbar:toggle',
        tooltip: 'Toggle HHVM Toolbar',
        priority: 500
      });

      var element = _toolBar$addButton.element;

      toolBar.addSpacer({
        priority: 501
      });
      (_reactForAtom2 || _reactForAtom()).ReactDOM.render((_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        { className: 'hhvm-toolbar-icon-container' },
        (_reactForAtom2 || _reactForAtom()).React.createElement((_uiHhvmIcon2 || _uiHhvmIcon()).default, { width: '37%' })
      ), element);
      var disposable = new (_atom2 || _atom()).Disposable(function () {
        (_reactForAtom2 || _reactForAtom()).ReactDOM.unmountComponentAtNode(element);
        toolBar.removeItems();
      });
      this._disposables.add(disposable);
      return disposable;
    }
  }, {
    key: 'consumeBuildSystemRegistry',
    value: function consumeBuildSystemRegistry(registry) {
      this._disposables.add(registry.register(this._getBuildSystem()));
    }
  }, {
    key: '_getBuildSystem',
    value: function _getBuildSystem() {
      if (this._buildSystem == null) {
        var buildSystem = new (_HhvmBuildSystem2 || _HhvmBuildSystem()).default();
        if (this._cwdApi != null) {
          buildSystem.setCwdApi(this._cwdApi);
        }
        this._buildSystem = buildSystem;
      }
      return this._buildSystem;
    }
  }, {
    key: 'getDistractionFreeModeProvider',
    value: function getDistractionFreeModeProvider() {
      var _this2 = this;

      return {
        name: 'nuclide-hhvm-toolbar',
        isVisible: function isVisible() {
          return _this2._state.panelVisible;
        },
        toggle: function toggle() {
          return _this2.togglePanel();
        }
      };
    }
  }, {
    key: '_createToolbar',
    value: function _createToolbar() {
      var NuclideToolbar = require('./NuclideToolbar');
      var item = document.createElement('div');

      var component = (_reactForAtom2 || _reactForAtom()).ReactDOM.render((_reactForAtom2 || _reactForAtom()).React.createElement(NuclideToolbar, {
        projectStore: this._projectStore
      }), item);
      (0, (_assert2 || _assert()).default)(component instanceof NuclideToolbar);
      this._nuclideToolbar = component;

      var panel = atom.workspace.addTopPanel({
        item: item,
        // Increase priority (default is 100) to ensure this toolbar comes after the 'tool-bar'
        // package's toolbar. Hierarchically the controlling toolbar should be above, and practically
        // this ensures the popover in this build toolbar stacks on top of other UI.
        priority: 200
      });
      this._disposables.add(new (_atom2 || _atom()).Disposable(function () {
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
        var toolbarNode = (_reactForAtom2 || _reactForAtom()).ReactDOM.findDOMNode(this._nuclideToolbar);
        // If the toolbar is currently hidden for some reason, then toolbarNode will be null.
        if (toolbarNode) {
          (_reactForAtom2 || _reactForAtom()).ReactDOM.unmountComponentAtNode(toolbarNode.parentNode);
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

function consumeBuildSystemRegistry(registry) {
  (0, (_assert2 || _assert()).default)(activation);
  activation.consumeBuildSystemRegistry(registry);
}

function consumeCwdApi(api) {
  (0, (_assert2 || _assert()).default)(activation);
  activation.setCwdApi(api);
  return new (_atom2 || _atom()).Disposable(function () {
    if (activation != null) {
      activation.setCwdApi(null);
    }
  });
}

function consumeToolBar(getToolBar) {
  (0, (_assert2 || _assert()).default)(activation);
  return activation.consumeToolBar(getToolBar);
}

function getDistractionFreeModeProvider() {
  (0, (_assert2 || _assert()).default)(activation != null);
  return activation.getDistractionFreeModeProvider();
}

function deactivate() {
  if (activation != null) {
    activation.dispose();
    activation = null;
  }
}

function serialize() {
  if (activation != null) {
    return activation.serialize();
  } else {
    return {};
  }
}