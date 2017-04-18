'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _NuclideBridge;

function _load_NuclideBridge() {
  return _NuclideBridge = _interopRequireDefault(require('./NuclideBridge'));
}

var _UnresolvedBreakpointsSidebarPane;

function _load_UnresolvedBreakpointsSidebarPane() {
  return _UnresolvedBreakpointsSidebarPane = _interopRequireDefault(require('./UnresolvedBreakpointsSidebarPane'));
}

var _ThreadsWindowPane;

function _load_ThreadsWindowPane() {
  return _ThreadsWindowPane = _interopRequireDefault(require('./ThreadsWindowPane'));
}

var _WebInspector;

function _load_WebInspector() {
  return _WebInspector = _interopRequireDefault(require('../../lib/WebInspector'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * The App is declared in `module.json` and the highest priority one is loaded
 * by `Main`.
 *
 * The one method, `presentUI` is called by `Main` to attach the UI into the
 * DOM. Here we can inject any modifications into the UI.
 */
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

class NuclideApp extends (_WebInspector || _load_WebInspector()).default.App {

  presentUI() {
    (_NuclideBridge || _load_NuclideBridge()).default.onDebuggerSettingsChanged(this._handleSettingsUpdated.bind(this));

    const rootView = new (_WebInspector || _load_WebInspector()).default.RootView();
    (_WebInspector || _load_WebInspector()).default.inspectorView.show(rootView.element);
    (_WebInspector || _load_WebInspector()).default.inspectorView.panel('sources').then(panel => {
      // Force Sources view to hide the editor.
      const sourcesPanel = panel;
      sourcesPanel._splitView.addEventListener((_WebInspector || _load_WebInspector()).default.SplitView.Events.ShowModeChanged, this._forceOnlySidebar, this);
      sourcesPanel.sidebarPanes.domBreakpoints.setVisible(false);
      sourcesPanel.sidebarPanes.xhrBreakpoints.setVisible(false);
      sourcesPanel.sidebarPanes.eventListenerBreakpoints.setVisible(false);
      sourcesPanel.sidebarPanes.unresolvedBreakpoints = new (_UnresolvedBreakpointsSidebarPane || _load_UnresolvedBreakpointsSidebarPane()).default();
      this._threadsWindow = new (_ThreadsWindowPane || _load_ThreadsWindowPane()).default();
      sourcesPanel.sidebarPanes.threads = this._threadsWindow;
      this._handleSettingsUpdated();
      // Force redraw
      sourcesPanel.sidebarPaneView.detach();
      sourcesPanel.sidebarPaneView = null;
      sourcesPanel._dockSideChanged();

      (_WebInspector || _load_WebInspector()).default.inspectorView.showInitialPanel();
      sourcesPanel._splitView.hideMain();
      rootView.attachToDocument(document);
      // eslint-disable-next-line no-console
    }).catch(e => console.error(e));

    // Clear breakpoints whenever they are saved to localStorage.
    (_WebInspector || _load_WebInspector()).default.settings.breakpoints.addChangeListener(this._onBreakpointSettingsChanged, this);
  }

  _handleSettingsUpdated() {
    const settings = (_NuclideBridge || _load_NuclideBridge()).default.getSettings();
    if (this._threadsWindow != null && !settings.SupportThreadsWindow) {
      this._threadsWindow.setVisible(false);
    }
  }

  _forceOnlySidebar(event) {
    if (event.data !== (_WebInspector || _load_WebInspector()).default.SplitView.ShowMode.OnlySidebar) {
      event.target.hideMain();
    }
  }

  _onBreakpointSettingsChanged(event) {
    if (event.data.length > 0) {
      (_WebInspector || _load_WebInspector()).default.settings.breakpoints.set([]);
    }
  }
}

class NuclideAppProvider extends (_WebInspector || _load_WebInspector()).default.AppProvider {
  createApp() {
    return new NuclideApp();
  }
}
exports.default = NuclideAppProvider;