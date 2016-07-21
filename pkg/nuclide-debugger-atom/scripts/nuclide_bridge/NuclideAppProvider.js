'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import NuclideBridge from './NuclideBridge';
import UnresolvedBreakpointsSidebarPane from './UnresolvedBreakpointsSidebarPane';
import ThreadsWindowPane from './ThreadsWindowPane';
import WebInspector from '../../lib/WebInspector';

/**
 * The App is declared in `module.json` and the highest priority one is loaded
 * by `Main`.
 *
 * The one method, `presentUI` is called by `Main` to attach the UI into the
 * DOM. Here we can inject any modifications into the UI.
 */
class NuclideApp extends WebInspector.App {
  _threadsWindow: Object;

  presentUI() {
    NuclideBridge.onDebuggerSettingsChanged(this._handleSettingsUpdated.bind(this));

    const rootView = new WebInspector.RootView();
    WebInspector.inspectorView.show(rootView.element);
    WebInspector.inspectorView.panel('sources').then(panel => {
      // Force Sources view to hide the editor.
      const sourcesPanel: any = panel;
      sourcesPanel._splitView.addEventListener(
        WebInspector.SplitView.Events.ShowModeChanged,
        this._forceOnlySidebar,
        this);
      sourcesPanel.sidebarPanes.domBreakpoints.setVisible(false);
      sourcesPanel.sidebarPanes.xhrBreakpoints.setVisible(false);
      sourcesPanel.sidebarPanes.eventListenerBreakpoints.setVisible(false);
      sourcesPanel.sidebarPanes.unresolvedBreakpoints = new UnresolvedBreakpointsSidebarPane();
      this._threadsWindow = new ThreadsWindowPane();
      sourcesPanel.sidebarPanes.threads = this._threadsWindow;
      this._handleSettingsUpdated();
      // Force redraw
      sourcesPanel.sidebarPaneView.detach();
      sourcesPanel.sidebarPaneView = null;
      sourcesPanel._dockSideChanged();

      window.WebInspector.inspectorView.showInitialPanel();
      sourcesPanel._splitView.hideMain();
      rootView.attachToDocument(document);
    // eslint-disable-next-line no-console
    }).catch(e => console.error(e));

    // Clear breakpoints whenever they are saved to localStorage.
    WebInspector.settings.breakpoints.addChangeListener(
      this._onBreakpointSettingsChanged, this);
  }

  _handleSettingsUpdated(): void {
    const settings = NuclideBridge.getSettings();
    if (this._threadsWindow != null && !settings.SupportThreadsWindow) {
      this._threadsWindow.setVisible(false);
    }
  }

  _forceOnlySidebar(event: any) {
    if (event.data !== WebInspector.SplitView.ShowMode.OnlySidebar) {
      event.target.hideMain();
    }
  }

  _onBreakpointSettingsChanged(event: WebInspector.Event) {
    if (event.data.length > 0) {
      WebInspector.settings.breakpoints.set([]);
    }
  }
}

class NuclideAppProvider extends WebInspector.AppProvider {
  createApp(): WebInspector.App {
    return new NuclideApp();
  }
}

module.exports = NuclideAppProvider;
