'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DebuggerLayoutManager = undefined;

var _react = _interopRequireDefault(require('react'));

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _DebuggerPaneViewModel;

function _load_DebuggerPaneViewModel() {
  return _DebuggerPaneViewModel = require('./DebuggerPaneViewModel');
}

var _DebuggerModel;

function _load_DebuggerModel() {
  return _DebuggerModel = _interopRequireDefault(require('./DebuggerModel'));
}

var _DebuggerModel2;

function _load_DebuggerModel2() {
  return _DebuggerModel2 = require('./DebuggerModel');
}

var _DebuggerStore;

function _load_DebuggerStore() {
  return _DebuggerStore = require('./DebuggerStore');
}

var _DebuggerControlsView;

function _load_DebuggerControlsView() {
  return _DebuggerControlsView = require('./DebuggerControlsView');
}

var _ThreadsView;

function _load_ThreadsView() {
  return _ThreadsView = require('./ThreadsView');
}

var _CallstackView;

function _load_CallstackView() {
  return _CallstackView = require('./CallstackView');
}

var _BreakpointsView;

function _load_BreakpointsView() {
  return _BreakpointsView = require('./BreakpointsView');
}

var _ScopesView;

function _load_ScopesView() {
  return _ScopesView = require('./ScopesView');
}

var _WatchView;

function _load_WatchView() {
  return _WatchView = require('./WatchView');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Configuration that defines a debugger pane. This controls what gets added
// to the workspace when starting debugging.


// Debugger views
class DebuggerLayoutManager {

  constructor(model) {
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._model = model;
    this._debuggerWorkspaceEnabled = this._shouldEnableDebuggerWorkspace();
    this._previousDebuggerMode = (_DebuggerStore || _load_DebuggerStore()).DebuggerMode.STOPPED;
    this._paneHiddenWarningShown = false;
    this._initializeDebuggerPanes();
  }

  dispose() {
    this._disposables.dispose();
  }

  consumeWorkspaceViewsService(api) {
    // Add context menus to let the user restore hidden panes.
    this._debuggerPanes.forEach(pane => {
      const command = `nuclide-debugger:show-window-${pane.title().replace(/ /g, '-')}`;
      this._disposables.add(atom.commands.add('atom-workspace', {
        [String(command)]: () => this.showHiddenDebuggerPane(api, pane.uri)
      }));

      this._disposables.add(atom.contextMenu.add({
        '.nuclide-debugger-container': [{
          label: 'Debugger Views',
          submenu: [{
            label: `Show ${pane.title()} window`,
            command,
            shouldDisplay: event => {
              const debuggerPane = this._debuggerPanes.find(p => p.uri === pane.uri);
              if (debuggerPane != null && (debuggerPane.isEnabled == null || debuggerPane.isEnabled())) {
                return debuggerPane.previousLocation != null && debuggerPane.previousLocation.userHidden;
              }
              return false;
            }
          }]
        }]
      }));
    });
  }

  _shouldEnableDebuggerWorkspace() {
    // Enable workspace view layout only if the following required Atom APIs are available.
    // Expected in Atom >= 1.17 only.
    return atom.workspace.getLeftDock != null && atom.workspace.getBottomDock != null && atom.workspace.getCenter != null && atom.workspace.getRightDock != null;
  }

  _initializeDebuggerPanes() {
    const debuggerUriBase = 'atom://nuclide/debugger-';

    // This configures the debugger panes. By default, they'll appear below the stepping
    // controls from top to bottom in the order they're defined here. After that, the
    // user is free to move them around.
    this._debuggerPanes = [{
      uri: debuggerUriBase + 'controls',
      isLifetimeView: true,
      title: () => 'Debugger',
      isEnabled: () => true,
      createView: () => _react.default.createElement((_DebuggerControlsView || _load_DebuggerControlsView()).DebuggerControlsView, { model: this._model })
    }, {
      uri: debuggerUriBase + 'callstack',
      isLifetimeView: false,
      title: () => 'Call Stack',
      isEnabled: () => true,
      createView: () => _react.default.createElement((_CallstackView || _load_CallstackView()).CallstackView, { model: this._model }),
      debuggerModeFilter: mode => mode !== (_DebuggerStore || _load_DebuggerStore()).DebuggerMode.STOPPED
    }, {
      uri: debuggerUriBase + 'breakpoints',
      isLifetimeView: false,
      title: () => 'Breakpoints',
      isEnabled: () => true,
      createView: () => _react.default.createElement((_BreakpointsView || _load_BreakpointsView()).BreakpointsView, { model: this._model })
    }, {
      uri: debuggerUriBase + 'scopes',
      isLifetimeView: false,
      title: () => 'Scopes',
      isEnabled: () => true,
      createView: () => _react.default.createElement((_ScopesView || _load_ScopesView()).ScopesView, { model: this._model }),
      debuggerModeFilter: mode => mode !== (_DebuggerStore || _load_DebuggerStore()).DebuggerMode.STOPPED
    }, {
      uri: debuggerUriBase + 'watch-expressions',
      isLifetimeView: false,
      title: () => 'Watch Expressions',
      isEnabled: () => true,
      createView: () => _react.default.createElement((_WatchView || _load_WatchView()).WatchView, {
        model: this._model,
        watchExpressionListStore: this._model.getWatchExpressionListStore()
      }),
      debuggerModeFilter: mode => mode !== (_DebuggerStore || _load_DebuggerStore()).DebuggerMode.STOPPED
    }, {
      uri: debuggerUriBase + 'threads',
      isLifetimeView: false,
      title: () => {
        return String(this._model.getStore().getSettings().get('threadsComponentTitle'));
      },
      isEnabled: () => {
        return Boolean(this._model.getStore().getSettings().get('SupportThreadsWindow'));
      },
      createView: () => _react.default.createElement((_ThreadsView || _load_ThreadsView()).ThreadsView, { model: this._model }),
      debuggerModeFilter: mode => mode !== (_DebuggerStore || _load_DebuggerStore()).DebuggerMode.STOPPED
    }];

    this._restoreDebuggerPaneLocations();
  }

  showHiddenDebuggerPane(api, uri) {
    const pane = this._debuggerPanes.find(p => p.uri === uri);
    if (pane != null && pane.previousLocation != null) {
      pane.previousLocation.userHidden = false;
    }

    this.showDebuggerViews(api);
  }

  getModelForDebuggerUri(uri) {
    if (!this._debuggerWorkspaceEnabled) {
      if (uri === (_DebuggerModel2 || _load_DebuggerModel2()).WORKSPACE_VIEW_URI) {
        return this._model;
      }
    } else {
      const config = this._debuggerPanes.find(pane => pane.uri === uri);
      if (config != null) {
        return new (_DebuggerPaneViewModel || _load_DebuggerPaneViewModel()).DebuggerPaneViewModel(config, this._model, config.isLifetimeView, pane => this._paneDestroyed(pane));
      }
    }

    return null;
  }

  _getWorkspaceDocks() {
    if (!this._debuggerWorkspaceEnabled) {
      throw new Error('Invariant violation: "this._debuggerWorkspaceEnabled"');
    }

    const docks = new Array(4);

    if (!(atom.workspace.getLeftDock != null)) {
      throw new Error('Invariant violation: "atom.workspace.getLeftDock != null"');
    }

    docks[0] = {
      name: 'left',
      dock: atom.workspace.getLeftDock(),
      orientation: 'vertical'
    };

    if (!(atom.workspace.getBottomDock != null)) {
      throw new Error('Invariant violation: "atom.workspace.getBottomDock != null"');
    }

    docks[1] = {
      name: 'bottom',
      dock: atom.workspace.getBottomDock(),
      orientation: 'horizontal'
    };

    if (!(atom.workspace.getCenter != null)) {
      throw new Error('Invariant violation: "atom.workspace.getCenter != null"');
    }

    docks[2] = {
      name: 'center',
      dock: atom.workspace.getCenter(),
      orientation: 'horizontal'
    };

    if (!(atom.workspace.getRightDock != null)) {
      throw new Error('Invariant violation: "atom.workspace.getRightDock != null"');
    }

    docks[3] = {
      name: 'right',
      dock: atom.workspace.getRightDock(),
      orientation: 'vertical'
    };

    return docks;
  }

  _isDockEmpty(dock) {
    const panes = dock.getPanes();

    // A dock is empty for our purposes if it has nothing visible in it. If a dock
    // with no items is left open, Atom implicitly adds a single pane with no items
    // in it, so check for no panes, or a single pane with no items.
    return panes.length === 0 || panes.length === 1 && panes[0].getItems().length === 0;
  }

  _appendItemToDock(dock, item, debuggerItemsPerDock) {
    const panes = dock.getPanes();

    if (!(panes.length >= 1)) {
      throw new Error('Invariant violation: "panes.length >= 1"');
    }

    const dockPane = panes[panes.length - 1];
    if (this._isDockEmpty(dock)) {
      dockPane.addItem(item);
    } else {
      const dockConfig = this._getWorkspaceDocks().find(d => d.dock === dock);

      if (!(dockConfig != null)) {
        throw new Error('Invariant violation: "dockConfig != null"');
      }

      if (dockConfig.orientation === 'horizontal') {
        // Add the item as a new tab in the existing pane to the right of the current active pane for the dock.
        dockPane.addItem(item);
        try {
          dockPane.activateItem(item);
        } catch (e) {
          // During testing, I saw some cases where Atom threw trying to activate an item
          // that was still in progress of being added. This was tested on a Beta release
          // and may indicate a temporary bug. However, there is no reason to throw here
          // and stop laying out the debugger if an item could not be set as active.
        }
      } else {
        // When adding to a vertical dock that is not empty, but contains no debugger
        // items, split to create a new column for the debugger stuff. Otherwise, append
        // downward.
        if (debuggerItemsPerDock.get(dock) == null) {
          dock.getActivePane().splitRight({
            items: [item]
          });
        } else {
          dockPane.splitDown({
            items: [item]
          });
        }
      }
    }

    // Keep track of which dock(s) we've appended debugger panes into. This
    // allows us to quickly check if the dock needs to be split to separate
    // debugger panes and pre-existing panes that have nothing to do with
    // the debugger.
    if (debuggerItemsPerDock.get(dock) == null) {
      debuggerItemsPerDock.set(dock, 1);
    } else {
      const itemCount = debuggerItemsPerDock.get(dock);
      debuggerItemsPerDock.set(dock, itemCount + 1);
    }

    if (dock.isVisible != null && dock.show != null && !dock.isVisible()) {
      dock.show();
    }
  }

  resetLayout(api) {
    // Remove all debugger panes from the UI.
    this.hideDebuggerViews(api, false);

    // Forget all their previous locations.
    for (const debuggerPane of this._debuggerPanes) {
      debuggerPane.previousLocation = null;
      const key = this._getPaneStorageKey(debuggerPane.uri);
      localStorage.setItem(key, '');
    }

    // Pop the debugger open with the default layout.
    this._debuggerPanes = [];
    this._initializeDebuggerPanes();
    this.showDebuggerViews(api);
  }

  _getPaneStorageKey(uri) {
    return 'nuclide-debugger-pane-location-' + uri;
  }

  _deserializeSavedLocation(savedItem) {
    try {
      const obj = JSON.parse(savedItem);
      if (obj != null && obj.dock != null && obj.layoutIndex != null && obj.userHidden != null) {
        return obj;
      }
    } catch (e) {}

    return null;
  }

  _restoreDebuggerPaneLocations() {
    // See if there are saved previous locations for the debugger panes.
    for (const debuggerPane of this._debuggerPanes) {
      const savedItem = localStorage.getItem(this._getPaneStorageKey(debuggerPane.uri));
      if (savedItem != null) {
        debuggerPane.previousLocation = this._deserializeSavedLocation(savedItem);
      }
    }
  }

  _saveDebuggerPaneLocations() {
    for (const dockInfo of this._getWorkspaceDocks()) {
      const { name, dock } = dockInfo;
      const panes = dock.getPanes();
      let layoutIndex = 0;
      for (const pane of panes) {
        for (const item of pane.getItems()) {
          if (item instanceof (_DebuggerPaneViewModel || _load_DebuggerPaneViewModel()).DebuggerPaneViewModel) {
            const location = {
              dock: name,
              layoutIndex,
              userHidden: false
            };

            item.getConfig().previousLocation = location;
            layoutIndex++;
          }
        }
      }
    }

    // Serialize to storage.
    for (const debuggerPane of this._debuggerPanes) {
      const loc = JSON.stringify(debuggerPane.previousLocation);
      const key = this._getPaneStorageKey(debuggerPane.uri);
      localStorage.setItem(key, loc);
    }
  }

  debuggerModeChanged(api) {
    if (!this._debuggerWorkspaceEnabled) {
      return;
    }

    const mode = this._model.getStore().getDebuggerMode();

    // Most panes disappear when the debugger is stopped, only keep
    // the ones that should still be shown.
    if (mode === (_DebuggerStore || _load_DebuggerStore()).DebuggerMode.STOPPING && this._previousDebuggerMode !== (_DebuggerStore || _load_DebuggerStore()).DebuggerMode.STOPPED) {
      this._saveDebuggerPaneLocations();
    } else if (mode === (_DebuggerStore || _load_DebuggerStore()).DebuggerMode.STOPPED) {
      api.destroyWhere(item => {
        if (item instanceof (_DebuggerPaneViewModel || _load_DebuggerPaneViewModel()).DebuggerPaneViewModel) {
          const config = item.getConfig();
          if (config.debuggerModeFilter != null && !config.debuggerModeFilter(mode)) {
            item.setRemovedFromLayout(true);
            return true;
          }
        }
        return false;
      });
    } else if (mode === (_DebuggerStore || _load_DebuggerStore()).DebuggerMode.STARTING) {
      this.showDebuggerViews(api);
    }

    this._previousDebuggerMode = mode;
  }

  showDebuggerViews(api) {
    if (!this._debuggerWorkspaceEnabled) {
      api.open((_DebuggerModel2 || _load_DebuggerModel2()).WORKSPACE_VIEW_URI, { searchAllPanes: true });
      return;
    }

    // Hide any debugger panes other than the controls so we have a known
    // starting point for preparing the layout.
    this.hideDebuggerViews(api, true);

    const addedItemsByDock = new Map();
    const defaultDock = this._getWorkspaceDocks().find(d => d.name === 'right');

    if (!(defaultDock != null)) {
      throw new Error('Invariant violation: "defaultDock != null"');
    }

    // Lay out the remaining debugger panes according to their configurations.
    // Sort the debugger panes by the index at which they appeared the last
    // time they were positioned, so we maintain the relative ordering of
    // debugger panes within the same dock.


    const mode = this._model.getStore().getDebuggerMode();
    this._debuggerPanes.slice().sort((a, b) => {
      const aPos = a.previousLocation == null ? 0 : a.previousLocation.layoutIndex;
      const bPos = b.previousLocation == null ? 0 : b.previousLocation.layoutIndex;
      return aPos - bPos;
    }).filter(debuggerPane => debuggerPane.previousLocation == null || !debuggerPane.previousLocation.userHidden).forEach(debuggerPane => {
      let targetDock = defaultDock;

      // If this pane had a previous location, restore to the previous dock.
      const loc = debuggerPane.previousLocation;
      if (loc != null) {
        const previousDock = this._getWorkspaceDocks().find(d => d.name === loc.dock);
        if (previousDock != null) {
          targetDock = previousDock;
        }
      }

      if (debuggerPane.debuggerModeFilter == null || debuggerPane.debuggerModeFilter(mode)) {
        this._appendItemToDock(targetDock.dock, new (_DebuggerPaneViewModel || _load_DebuggerPaneViewModel()).DebuggerPaneViewModel(debuggerPane, this._model, debuggerPane.isLifetimeView, pane => this._paneDestroyed(pane)), addedItemsByDock);
      }
    });
  }

  _paneDestroyed(pane) {
    if (pane.isLifetimeView) {
      // Lifetime views are not hidden and remembered like the unimportant views.
      // This view being destroyed means the debugger is exiting completely, and
      // this view is never remembered as "hidden by the user" because it's reqiured
      // for running the debugger.
      const mode = this._model.getStore().getDebuggerMode();
      if (mode === (_DebuggerStore || _load_DebuggerStore()).DebuggerMode.RUNNING || mode === (_DebuggerStore || _load_DebuggerStore()).DebuggerMode.PAUSED) {
        this._saveDebuggerPaneLocations();
      }

      this.hideDebuggerViews(null, false);
      this._model.getActions().stopDebugging();
      return;
    }

    // Views can be selectively hidden by the user while the debugger is
    // running and that preference should be remembered.
    const config = this._debuggerPanes.find(p => p.uri === pane.uri);

    if (!(config != null)) {
      throw new Error('Invariant violation: "config != null"');
    }

    if (config.previousLocation == null) {
      config.previousLocation = {
        dock: '',
        layoutIndex: 0,
        userHidden: false
      };
    }

    if (config.isEnabled == null || config.isEnabled()) {
      const mode = this._model.getStore().getDebuggerMode();
      if (config.debuggerModeFilter == null || config.debuggerModeFilter(mode)) {
        if (!(config.previousLocation != null)) {
          throw new Error('Invariant violation: "config.previousLocation != null"');
        }

        config.previousLocation.userHidden = true;

        // Show a notification telling the user how to get the pane back
        // only once per session.
        if (!this._paneHiddenWarningShown) {
          this._paneHiddenWarningShown = true;

          atom.notifications.addInfo(`${config.title()} has been hidden. Right click any Debugger pane to bring it back.`);
        }
      }
    }
  }

  hideDebuggerViews(api, performingLayout) {
    if (!this._debuggerWorkspaceEnabled) {
      if (!(api != null)) {
        throw new Error('Invariant violation: "api != null"');
      }

      api.destroyWhere(item => item instanceof (_DebuggerModel || _load_DebuggerModel()).default);
      return;
    }

    // Docks do not toggle closed automatically when we remove all their items.
    // They can contain things other than the debugger items though, and could
    // have been left open and empty by the user. Toggle closed any docks that
    // end up empty only as a result of closing the debugger.
    const docks = this._getWorkspaceDocks();
    const previouslyEmpty = docks.map(dock => this._isDockEmpty(dock.dock));

    // Find and destroy all debugger items, and the panes that contained them.
    atom.workspace.getPanes().forEach(pane => {
      pane.getItems().forEach(item => {
        if (item instanceof (_DebuggerPaneViewModel || _load_DebuggerPaneViewModel()).DebuggerPaneViewModel) {
          // Remove the view model.
          item.setRemovedFromLayout(true);
          pane.destroyItem(item);

          // If removing the model left an empty pane, remove the pane.
          if (pane.getItems().length === 0) {
            pane.destroy();
          }
        }
      });
    });

    // If any docks became empty as a result of closing those panes, hide the dock.
    if (!performingLayout) {
      docks.map(dock => this._isDockEmpty(dock.dock)).forEach((empty, index) => {
        if (empty && !previouslyEmpty[index]) {
          docks[index].dock.hide();
        }
      });
    }
  }
}
exports.DebuggerLayoutManager = DebuggerLayoutManager; /**
                                                        * Copyright (c) 2015-present, Facebook, Inc.
                                                        * All rights reserved.
                                                        *
                                                        * This source code is licensed under the license found in the LICENSE file in
                                                        * the root directory of this source tree.
                                                        *
                                                        * 
                                                        * @format
                                                        */
/* global localStorage */