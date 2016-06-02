var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _NuclideBridge2;

function _NuclideBridge() {
  return _NuclideBridge2 = _interopRequireDefault(require('./NuclideBridge'));
}

var _UnresolvedBreakpointsSidebarPane2;

function _UnresolvedBreakpointsSidebarPane() {
  return _UnresolvedBreakpointsSidebarPane2 = _interopRequireDefault(require('./UnresolvedBreakpointsSidebarPane'));
}

var _ThreadsWindowPane2;

function _ThreadsWindowPane() {
  return _ThreadsWindowPane2 = _interopRequireDefault(require('./ThreadsWindowPane'));
}

// Supress ESLint no-undef about using WebInspector without window, which would
// not have flow types attached.
var WebInspector = window.WebInspector;

/**
 * The App is declared in `module.json` and the highest priority one is loaded
 * by `Main`.
 *
 * The one method, `presentUI` is called by `Main` to attach the UI into the
 * DOM. Here we can inject any modifications into the UI.
 */

var NuclideApp = (function (_WebInspector$App) {
  _inherits(NuclideApp, _WebInspector$App);

  function NuclideApp() {
    _classCallCheck(this, NuclideApp);

    _get(Object.getPrototypeOf(NuclideApp.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(NuclideApp, [{
    key: 'presentUI',
    value: function presentUI() {
      var _this = this;

      (_NuclideBridge2 || _NuclideBridge()).default.onDebuggerSettingsChanged(this._handleSettingsUpdated.bind(this));

      var rootView = new WebInspector.RootView();
      WebInspector.inspectorView.show(rootView.element);
      WebInspector.inspectorView.panel('sources').then(function (panel) {
        // Force Sources view to hide the editor.
        var sourcesPanel = panel;
        sourcesPanel._splitView.addEventListener(WebInspector.SplitView.Events.ShowModeChanged, _this._forceOnlySidebar, _this);
        sourcesPanel.sidebarPanes.domBreakpoints.setVisible(false);
        sourcesPanel.sidebarPanes.xhrBreakpoints.setVisible(false);
        sourcesPanel.sidebarPanes.eventListenerBreakpoints.setVisible(false);
        sourcesPanel.sidebarPanes.unresolvedBreakpoints = new (_UnresolvedBreakpointsSidebarPane2 || _UnresolvedBreakpointsSidebarPane()).default();
        _this._threadsWindow = new (_ThreadsWindowPane2 || _ThreadsWindowPane()).default();
        sourcesPanel.sidebarPanes.threads = _this._threadsWindow;
        _this._handleSettingsUpdated();
        // Force redraw
        sourcesPanel.sidebarPaneView.detach();
        sourcesPanel.sidebarPaneView = null;
        sourcesPanel._dockSideChanged();

        window.WebInspector.inspectorView.showInitialPanel();
        sourcesPanel._splitView.hideMain();
        rootView.attachToDocument(document);
        /*eslint-disable no-console */
      }).catch(function (e) {
        return console.error(e);
      });
      /*eslint-enable no-console */

      // Clear breakpoints whenever they are saved to localStorage.
      WebInspector.settings.breakpoints.addChangeListener(this._onBreakpointSettingsChanged, this);
    }
  }, {
    key: '_handleSettingsUpdated',
    value: function _handleSettingsUpdated() {
      var settings = (_NuclideBridge2 || _NuclideBridge()).default.getSettings();
      if (this._threadsWindow != null && !settings.SupportThreadsWindow) {
        this._threadsWindow.setVisible(false);
      }
    }
  }, {
    key: '_forceOnlySidebar',
    value: function _forceOnlySidebar(event) {
      if (event.data !== WebInspector.SplitView.ShowMode.OnlySidebar) {
        event.target.hideMain();
      }
    }
  }, {
    key: '_onBreakpointSettingsChanged',
    value: function _onBreakpointSettingsChanged(event) {
      if (event.data.length > 0) {
        WebInspector.settings.breakpoints.set([]);
      }
    }
  }]);

  return NuclideApp;
})(WebInspector.App);

var NuclideAppProvider = (function (_WebInspector$AppProvider) {
  _inherits(NuclideAppProvider, _WebInspector$AppProvider);

  function NuclideAppProvider() {
    _classCallCheck(this, NuclideAppProvider);

    _get(Object.getPrototypeOf(NuclideAppProvider.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(NuclideAppProvider, [{
    key: 'createApp',
    value: function createApp() {
      return new NuclideApp();
    }
  }]);

  return NuclideAppProvider;
})(WebInspector.AppProvider);

module.exports = NuclideAppProvider;