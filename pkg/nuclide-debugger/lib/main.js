'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createDebuggerView = createDebuggerView;
exports.activate = activate;
exports.serialize = serialize;
exports.deactivate = deactivate;
exports.consumeRegisterExecutor = consumeRegisterExecutor;
exports.consumeDebuggerProvider = consumeDebuggerProvider;
exports.consumeEvaluationExpressionProvider = consumeEvaluationExpressionProvider;
exports.consumeToolBar = consumeToolBar;
exports.consumeNotifications = consumeNotifications;
exports.provideRemoteControlService = provideRemoteControlService;
exports.consumeDatatipService = consumeDatatipService;
exports.consumeRegisterNuxService = consumeRegisterNuxService;
exports.consumeTriggerNuxService = consumeTriggerNuxService;
exports.consumeWorkspaceViewsService = consumeWorkspaceViewsService;

var _constants;

function _load_constants() {
  return _constants = require('./constants');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _atom = require('atom');

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _RemoteControlService;

function _load_RemoteControlService() {
  return _RemoteControlService = _interopRequireDefault(require('./RemoteControlService'));
}

var _DebuggerModel;

function _load_DebuggerModel() {
  return _DebuggerModel = _interopRequireDefault(require('./DebuggerModel'));
}

var _DebuggerModel2;

function _load_DebuggerModel2() {
  return _DebuggerModel2 = require('./DebuggerModel');
}

var _DebuggerDatatip;

function _load_DebuggerDatatip() {
  return _DebuggerDatatip = require('./DebuggerDatatip');
}

var _react = _interopRequireDefault(require('react'));

var _DebuggerLaunchAttachUI;

function _load_DebuggerLaunchAttachUI() {
  return _DebuggerLaunchAttachUI = require('./DebuggerLaunchAttachUI');
}

var _renderReactRoot;

function _load_renderReactRoot() {
  return _renderReactRoot = require('../../commons-atom/renderReactRoot');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _nuclideDebuggerBase;

function _load_nuclideDebuggerBase() {
  return _nuclideDebuggerBase = require('../../nuclide-debugger-base');
}

var _DebuggerStore;

function _load_DebuggerStore() {
  return _DebuggerStore = require('./DebuggerStore');
}

var _NewDebuggerView;

function _load_NewDebuggerView() {
  return _NewDebuggerView = require('./NewDebuggerView');
}

var _DebuggerControllerView;

function _load_DebuggerControllerView() {
  return _DebuggerControllerView = _interopRequireDefault(require('./DebuggerControllerView'));
}

var _range;

function _load_range() {
  return _range = require('nuclide-commons-atom/range');
}

var _os = _interopRequireDefault(require('os'));

var _nullthrows;

function _load_nullthrows() {
  return _nullthrows = _interopRequireDefault(require('nullthrows'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
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

const DATATIP_PACKAGE_NAME = 'nuclide-debugger-datatip';
const NUX_NEW_DEBUGGER_UI_ID = 4377;
const GK_NEW_DEBUGGER_UI_NUX = 'mp_nuclide_new_debugger_ui';
const NUX_NEW_DEBUGGER_UI_NAME = 'nuclide_new_debugger_ui';
const SCREEN_ROW_ATTRIBUTE_NAME = 'data-screen-row';

function getGutterLineNumber(target) {
  const eventLine = parseInt(target.dataset.line, 10);
  if (eventLine != null && eventLine >= 0 && !isNaN(Number(eventLine))) {
    return eventLine;
  }
}

function getEditorLineNumber(editor, target) {
  let node = target;
  while (node != null) {
    if (node.hasAttribute(SCREEN_ROW_ATTRIBUTE_NAME)) {
      const screenRow = Number(node.getAttribute(SCREEN_ROW_ATTRIBUTE_NAME));
      try {
        return editor.bufferPositionForScreenPosition([screenRow, 0]).row;
      } catch (error) {
        return null;
      }
    }
    node = node.parentElement;
  }
}

function firstNonNull(...args) {
  return (0, (_nullthrows || _load_nullthrows()).default)(args.find(arg => arg != null));
}

function getLineForEvent(editor, event) {
  const cursorLine = editor.getLastCursor().getBufferRow();
  const target = event ? event.target : null;
  if (target == null) {
    return cursorLine;
  }
  // toggleLine is the line the user clicked in the gutter next to, as opposed
  // to the line the editor's cursor happens to be in. If this command was invoked
  // from the menu, then the cursor position is the target line.
  return firstNonNull(getGutterLineNumber(target), getEditorLineNumber(editor, target),
  // fall back to the line the cursor is on.
  cursorLine);
}

// Configuration that defines a debugger pane. This controls what gets added
// to the workspace when starting debugging.


// A model that will serve as the view model for all debugger panes. We must provide
// a unique instance of a view model for each pane, which Atom can destroy when the
// pane that contains it is destroyed. We therefore cannot give it the actual debugger
// model directly, since there is only one and its lifetime is tied to the lifetime
// of the debugging session.
class DebuggerPaneViewModel {

  constructor(config, debuggerModel, isLifetimeView, paneDestroyed) {
    this._config = config;
    this._debuggerModel = debuggerModel;
    this._isLifetimeView = isLifetimeView;
    this._paneDestroyed = paneDestroyed;
    this._removedFromLayout = false;
  }

  dispose() {}

  destroy() {
    if (!this._removedFromLayout) {
      this._paneDestroyed(this._config);
    }
  }

  getIconName() {
    return 'nuclicon-debugger';
  }

  getTitle() {
    return this._config.title();
  }

  getDefaultLocation() {
    return this._debuggerModel.getDefaultLocation();
  }

  getURI() {
    return this._config.uri;
  }

  getPreferredWidth() {
    return this._debuggerModel.getPreferredWidth();
  }

  createView() {
    if (this._config.previousLocation != null) {
      this._config.previousLocation.userHidden = false;
    }
    return this._config.createView();
  }

  getConfig() {
    return this._config;
  }

  isLifetimeView() {
    return this._isLifetimeView;
  }

  setRemovedFromLayout(removed) {
    this._removedFromLayout = removed;
  }

  // Atom view needs to provide this, otherwise Atom throws an exception splitting panes for the view.
  serialize() {
    return {};
  }

  copy() {
    return false;
  }
}

class DebuggerView extends _react.default.Component {

  constructor(props) {
    super(props);
    this.state = {
      showOldView: false
    };
    this._openDevTools = this._openDevTools.bind(this);
    this._stopDebugging = this._stopDebugging.bind(this);
  }

  _getUiTypeForAnalytics() {
    return this.state.showOldView ? 'chrome-devtools' : 'nuclide';
  }

  componentDidMount() {
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)((_constants || _load_constants()).AnalyticsEvents.DEBUGGER_UI_MOUNTED, {
      frontend: this._getUiTypeForAnalytics()
    });
    // Wait for UI to initialize and "calm down"
    this._nuxTimeout = setTimeout(() => {
      if (activation != null && !this.state.showOldView) {
        activation.tryTriggerNux(NUX_NEW_DEBUGGER_UI_ID);
      }
    }, 2000);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.showOldView !== this.state.showOldView) {
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)((_constants || _load_constants()).AnalyticsEvents.DEBUGGER_UI_TOGGLED, {
        frontend: this._getUiTypeForAnalytics()
      });
    }
  }

  componentWillUnmount() {
    if (this._nuxTimeout) {
      clearTimeout(this._nuxTimeout);
    }
  }

  _openDevTools() {
    this.props.model.getActions().openDevTools();
  }

  _stopDebugging() {
    this.props.model.getActions().stopDebugging();
  }

  render() {
    const { model } = this.props;
    const { showOldView } = this.state;
    return _react.default.createElement(
      'div',
      { className: 'nuclide-debugger-root' },
      _react.default.createElement(
        'div',
        {
          className: (0, (_classnames || _load_classnames()).default)({
            'nuclide-debugger-container-old-enabled': showOldView
          }) },
        _react.default.createElement((_DebuggerControllerView || _load_DebuggerControllerView()).default, {
          store: model.getStore(),
          bridge: model.getBridge(),
          breakpointStore: model.getBreakpointStore(),
          openDevTools: this._openDevTools,
          stopDebugging: this._stopDebugging
        })
      ),
      !showOldView ? _react.default.createElement((_NewDebuggerView || _load_NewDebuggerView()).NewDebuggerView, {
        model: model,
        watchExpressionListStore: model.getWatchExpressionListStore()
      }) : null
    );
  }
}

function createDebuggerView(model) {
  let view = null;
  if (model instanceof (_DebuggerModel || _load_DebuggerModel()).default) {
    view = _react.default.createElement(DebuggerView, { model: model });
  } else if (model instanceof DebuggerPaneViewModel) {
    view = model.createView();
  }

  if (view != null) {
    const elem = (0, (_renderReactRoot || _load_renderReactRoot()).renderReactRoot)(view);
    elem.className = 'nuclide-debugger-container';
    return elem;
  }

  return null;
}

class Activation {

  constructor(state) {
    this._model = new (_DebuggerModel || _load_DebuggerModel()).default(state);
    this._launchAttachDialog = null;
    this._debuggerWorkspaceEnabled = this._shouldEnableDebuggerWorkspace();
    this._previousDebuggerMode = (_DebuggerStore || _load_DebuggerStore()).DebuggerMode.STOPPED;
    this._paneHiddenWarningShown = false;
    this._initializeDebuggerPanes(state);
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(this._model,
    // Listen for removed connections and kill the debugger if it is using that connection.
    (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).ServerConnection.onDidCloseServerConnection(connection => {
      const debuggerProcess = this._model.getStore().getDebuggerInstance();
      if (debuggerProcess == null) {
        return; // Nothing to do if we're not debugging.
      }
      const debuggeeTargetUri = debuggerProcess.getTargetUri();
      if ((_nuclideUri || _load_nuclideUri()).default.isLocal(debuggeeTargetUri)) {
        return; // Nothing to do if our debug session is local.
      }
      if ((_nuclideUri || _load_nuclideUri()).default.getHostname(debuggeeTargetUri) === connection.getRemoteHostname()) {
        this._model.getActions().stopDebugging();
      }
    }),
    // Commands.
    atom.commands.add('atom-workspace', {
      'nuclide-debugger:toggle': this._toggleLaunchAttachDialog.bind(this)
    }), atom.commands.add('atom-workspace', {
      'nuclide-debugger:continue-debugging': this._continue.bind(this)
    }), atom.commands.add('atom-workspace', {
      'nuclide-debugger:stop-debugging': this._stop.bind(this)
    }), atom.commands.add('atom-workspace', {
      'nuclide-debugger:restart-debugging': this._restart.bind(this)
    }), atom.commands.add('atom-workspace', {
      'nuclide-debugger:step-over': this._stepOver.bind(this)
    }), atom.commands.add('atom-workspace', {
      'nuclide-debugger:step-into': this._stepInto.bind(this)
    }), atom.commands.add('atom-workspace', {
      'nuclide-debugger:step-out': this._stepOut.bind(this)
    }), atom.commands.add('atom-workspace', {
      'nuclide-debugger:toggle-breakpoint': this._toggleBreakpoint.bind(this)
    }), atom.commands.add('atom-workspace', {
      'nuclide-debugger:toggle-breakpoint-enabled': this._toggleBreakpointEnabled.bind(this)
    }), atom.commands.add('atom-workspace', {
      'nuclide-debugger:toggle-launch-attach': this._toggleLaunchAttachDialog.bind(this)
    }), atom.commands.add('atom-workspace', {
      'nuclide-debugger:remove-all-breakpoints': this._deleteAllBreakpoints.bind(this)
    }), atom.commands.add('atom-workspace', {
      'nuclide-debugger:remove-breakpoint': this._deleteBreakpoint.bind(this)
    }), atom.commands.add('atom-workspace', {
      'nuclide-debugger:add-to-watch': this._addToWatch.bind(this)
    }), atom.commands.add('atom-workspace', {
      'nuclide-debugger:run-to-location': this._runToLocation.bind(this)
    }), atom.commands.add('.nuclide-debugger-root', {
      'nuclide-debugger:copy-debugger-expression-value': this._copyDebuggerExpressionValue.bind(this)
    }), atom.commands.add('.nuclide-debugger-root', {
      'nuclide-debugger:copy-debugger-callstack': this._copyDebuggerCallstack.bind(this)
    }),
    // Context Menu Items.
    atom.contextMenu.add({
      '.nuclide-debugger-breakpoint': [{
        label: 'Remove Breakpoint',
        command: 'nuclide-debugger:remove-breakpoint'
      }, {
        label: 'Remove All Breakpoints',
        command: 'nuclide-debugger:remove-all-breakpoints'
      }],
      '.nuclide-debugger-callstack-table': [{
        label: 'Copy Callstack',
        command: 'nuclide-debugger:copy-debugger-callstack'
      }],
      '.nuclide-debugger-expression-value-list': [{
        label: 'Copy',
        command: 'nuclide-debugger:copy-debugger-expression-value'
      }],
      'atom-text-editor': [{ type: 'separator' }, {
        label: 'Debugger',
        submenu: [{
          label: 'Run to Location',
          command: 'nuclide-debugger:run-to-location',
          shouldDisplay: event => {
            // Should also check for is paused.
            const store = this.getModel().getStore();
            const debuggerInstance = store.getDebuggerInstance();
            if (store.getDebuggerMode() === (_DebuggerStore || _load_DebuggerStore()).DebuggerMode.PAUSED && debuggerInstance != null && debuggerInstance.getDebuggerProcessInfo().supportContinueToLocation()) {
              return true;
            }
            return false;
          }
        }, {
          label: 'Toggle Breakpoint',
          command: 'nuclide-debugger:toggle-breakpoint'
        }, {
          label: 'Toggle Breakpoint enabled/disabled',
          command: 'nuclide-debugger:toggle-breakpoint-enabled',
          shouldDisplay: event => this._executeWithEditorPath(event, (filePath, line) => this.getModel().getBreakpointStore().getBreakpointAtLine(filePath, line) != null) || false
        }, {
          label: 'Add to Watch',
          command: 'nuclide-debugger:add-to-watch',
          shouldDisplay: event => {
            const textEditor = atom.workspace.getActiveTextEditor();
            if (!this.getModel().getStore().isDebugging() || textEditor == null) {
              return false;
            }
            return textEditor.getSelections().length === 1 && !textEditor.getSelectedBufferRange().isEmpty();
          }
        }]
      }, { type: 'separator' }]
    }));
    this._hideLaunchAttachDialog = this._hideLaunchAttachDialog.bind(this);
    this._handleDefaultAction = this._handleDefaultAction.bind(this);
  }

  serialize() {
    const state = {
      breakpoints: this.getModel().getBreakpointStore().getSerializedBreakpoints()
    };
    return state;
  }

  dispose() {
    this._disposables.dispose();
  }

  getModel() {
    return this._model;
  }

  consumeRegisterNuxService(addNewNux) {
    const disposable = addNewNux(createDebuggerNuxTourModel());
    this._disposables.add(disposable);
    return disposable;
  }

  consumeWorkspaceViewsService(api) {
    this._disposables.add(api.addOpener(uri => {
      return this._getModelForDebuggerUri(uri);
    }), () => {
      this._hideDebuggerViews(api, false);
    }, atom.commands.add('atom-workspace', {
      'nuclide-debugger:show': () => {
        this._showDebuggerViews(api);
      }
    }), atom.commands.add('atom-workspace', {
      'nuclide-debugger:hide': () => {
        this._hideDebuggerViews(api, false);
        this._model.destroy();
      }
    }), this._model.getStore().onDebuggerModeChange(() => this._debuggerModeChanged(api)), atom.commands.add('atom-workspace', {
      'nuclide-debugger:reset-layout': () => {
        this._resetLayout(api);
      }
    }));

    this._disposables.add(atom.contextMenu.add({
      '.nuclide-debugger-container': [{
        label: 'Debugger Views',
        submenu: [{
          label: 'Reset Layout',
          command: 'nuclide-debugger:reset-layout'
        }]
      }]
    }));

    // Add context menus to let the user restore hidden panes.
    this._debuggerPanes.forEach(pane => {
      const command = `nuclide-debugger:show-window-${pane.title().replace(/ /g, '-')}`;
      this._disposables.add(atom.commands.add('atom-workspace', {
        [String(command)]: () => this._showHiddenDebuggerPane(api, pane.uri)
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

  _initializeDebuggerPanes(state) {
    // const debuggerUriBase = 'atom://nuclide/debugger-';

    // This configures the debugger panes. By default, they'll appear below the stepping
    // controls from top to bottom in the order they're defined here. After that, the
    // user is free to move them around.
    this._debuggerPanes = [];

    this._restoreDebuggerPaneLocations();
  }

  _showHiddenDebuggerPane(api, uri) {
    const pane = this._debuggerPanes.find(p => p.uri === uri);
    if (pane != null && pane.previousLocation != null) {
      pane.previousLocation.userHidden = false;
    }

    this._showDebuggerViews(api);
  }

  _getModelForDebuggerUri(uri) {
    if (!this._debuggerWorkspaceEnabled) {
      if (uri === (_DebuggerModel2 || _load_DebuggerModel2()).WORKSPACE_VIEW_URI) {
        return this._model;
      }
    } else {
      const config = this._debuggerPanes.find(pane => pane.uri === uri);
      if (config != null) {
        return new DebuggerPaneViewModel(config, this._model, config.isLifetimeView, pane => this._paneDestroyed(pane));
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

  _resetLayout(api) {
    // Remove all debugger panes from the UI.
    this._hideDebuggerViews(api, false);

    // Forget all their previous locations.
    for (const debuggerPane of this._debuggerPanes) {
      debuggerPane.previousLocation = null;
      const key = this._getPaneStorageKey(debuggerPane.uri);
      localStorage.setItem(key, '');
    }

    // Pop the debugger open with the default layout.
    this._debuggerPanes = [];
    this._initializeDebuggerPanes(null);
    this._showDebuggerViews(api);
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
          if (item instanceof DebuggerPaneViewModel) {
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

  _debuggerModeChanged(api) {
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
        if (item instanceof DebuggerPaneViewModel) {
          const config = item.getConfig();
          if (config.debuggerModeFilter != null && !config.debuggerModeFilter(mode)) {
            item.setRemovedFromLayout(true);
            return true;
          }
        }
        return false;
      });
    } else if (mode === (_DebuggerStore || _load_DebuggerStore()).DebuggerMode.STARTING) {
      this._showDebuggerViews(api);
    }

    this._previousDebuggerMode = mode;
  }

  _showDebuggerViews(api) {
    if (!this._debuggerWorkspaceEnabled) {
      api.open((_DebuggerModel2 || _load_DebuggerModel2()).WORKSPACE_VIEW_URI, { searchAllPanes: true });
      return;
    }

    // Hide any debugger panes other than the controls so we have a known
    // starting point for preparing the layout.
    this._hideDebuggerViews(api, true);

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
        this._appendItemToDock(targetDock.dock, new DebuggerPaneViewModel(debuggerPane, this._model, debuggerPane.isLifetimeView, pane => this._paneDestroyed(pane)), addedItemsByDock);
      }
    });
  }

  _paneDestroyed(pane) {
    if (pane.isLifetimeView) {
      // Lifetime views are not hidden and remembered like the unimportant views.
      // This view being destroyed means the debugger is exiting completely, and
      // this view is never remembered as "hidden by the user" because it's reqiured
      // for running the debugger.
      this._hideDebuggerViews(null, false);
      this._model.destroy();
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

  _hideDebuggerViews(api, performingLayout) {
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
        if (item instanceof DebuggerPaneViewModel) {
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

  setTriggerNux(triggerNux) {
    this._tryTriggerNux = triggerNux;
  }

  tryTriggerNux(id) {
    if (this._tryTriggerNux != null) {
      this._tryTriggerNux(id);
    }
  }

  _continue() {
    // TODO(jeffreytan): when we figured out the launch lifecycle story
    // we may bind this to start-debugging too.
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)((_constants || _load_constants()).AnalyticsEvents.DEBUGGER_STEP_CONTINUE);
    this._model.getBridge().continue();
  }

  _stop() {
    this._model.getActions().stopDebugging();
  }

  _restart() {
    this._model.getActions().restartDebugger();
  }

  _stepOver() {
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)((_constants || _load_constants()).AnalyticsEvents.DEBUGGER_STEP_OVER);
    this._model.getBridge().stepOver();
  }

  _stepInto() {
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)((_constants || _load_constants()).AnalyticsEvents.DEBUGGER_STEP_INTO);
    this._model.getBridge().stepInto();
  }

  _stepOut() {
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)((_constants || _load_constants()).AnalyticsEvents.DEBUGGER_STEP_OUT);
    this._model.getBridge().stepOut();
  }

  _toggleBreakpoint(event) {
    return this._executeWithEditorPath(event, (filePath, line) => {
      this._model.getActions().toggleBreakpoint(filePath, line);
    });
  }

  _toggleBreakpointEnabled(event) {
    this._executeWithEditorPath(event, (filePath, line) => {
      const bp = this._model.getBreakpointStore().getBreakpointAtLine(filePath, line);

      if (bp) {
        const { id, enabled } = bp;
        this._model.getActions().updateBreakpointEnabled(id, !enabled);
      }
    });
  }

  _runToLocation(event) {
    this._executeWithEditorPath(event, (path, line) => {
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)((_constants || _load_constants()).AnalyticsEvents.DEBUGGER_STEP_RUN_TO_LOCATION);
      this._model.getBridge().runToLocation(path, line);
    });
  }

  _executeWithEditorPath(event, fn) {
    const editor = atom.workspace.getActiveTextEditor();
    if (!editor || !editor.getPath()) {
      return null;
    }

    const line = getLineForEvent(editor, event);
    return fn((0, (_nullthrows || _load_nullthrows()).default)(editor.getPath()), line);
  }

  _deleteBreakpoint(event) {
    const actions = this._model.getActions();
    const target = event.target;
    const path = target.dataset.path;
    const line = parseInt(target.dataset.line, 10);
    if (path == null) {
      return;
    }
    actions.deleteBreakpoint(path, line);
  }

  _deleteAllBreakpoints() {
    const actions = this._model.getActions();
    actions.deleteAllBreakpoints();
  }

  _toggleLaunchAttachDialog() {
    const dialog = this._getLaunchAttachDialog();
    if (dialog.isVisible()) {
      dialog.hide();
    } else {
      dialog.show();
    }
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)((_constants || _load_constants()).AnalyticsEvents.DEBUGGER_TOGGLE_ATTACH_DIALOG, {
      visible: dialog.isVisible()
    });
    this._emitLaunchAttachVisibilityChangedEvent();
  }

  _hideLaunchAttachDialog() {
    const dialog = this._getLaunchAttachDialog();
    if (dialog.isVisible()) {
      dialog.hide();
    }
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)((_constants || _load_constants()).AnalyticsEvents.DEBUGGER_TOGGLE_ATTACH_DIALOG, { visible: false });
    this._emitLaunchAttachVisibilityChangedEvent();
  }

  _emitLaunchAttachVisibilityChangedEvent() {
    const dialog = this._getLaunchAttachDialog();
    this._model.getLaunchAttachActionEventEmitter().emit((_nuclideDebuggerBase || _load_nuclideDebuggerBase()).DebuggerLaunchAttachEventTypes.VISIBILITY_CHANGED, dialog.isVisible());
  }

  _handleDefaultAction() {
    const dialog = this._getLaunchAttachDialog();
    if (dialog.isVisible()) {
      this._model.getLaunchAttachActionEventEmitter().emit((_nuclideDebuggerBase || _load_nuclideDebuggerBase()).DebuggerLaunchAttachEventTypes.ENTER_KEY_PRESSED);
    }
  }

  _getLaunchAttachDialog() {
    if (!this._launchAttachDialog) {
      const component = _react.default.createElement((_DebuggerLaunchAttachUI || _load_DebuggerLaunchAttachUI()).DebuggerLaunchAttachUI, {
        store: this._model.getDebuggerProviderStore(),
        debuggerActions: this._model.getActions(),
        emitter: this._model.getLaunchAttachActionEventEmitter()
      });
      const host = (0, (_renderReactRoot || _load_renderReactRoot()).renderReactRoot)(component);
      this._launchAttachDialog = atom.workspace.addModalPanel({
        item: host,
        visible: false });

      this._disposables.add(() => {
        if (this._launchAttachDialog != null) {
          this._launchAttachDialog.destroy();
          this._launchAttachDialog = null;
        }
      }, atom.commands.add('atom-workspace', 'core:cancel', this._hideLaunchAttachDialog), atom.commands.add('atom-workspace', 'core:confirm', this._handleDefaultAction));
    }

    if (!this._launchAttachDialog) {
      throw new Error('Invariant violation: "this._launchAttachDialog"');
    }

    return this._launchAttachDialog;
  }

  _addToWatch() {
    const editor = atom.workspace.getActiveTextEditor();
    if (!editor) {
      return;
    }
    const selectedText = editor.getTextInBufferRange((0, (_range || _load_range()).trimRange)(editor, editor.getSelectedBufferRange()));
    const expr = (0, (_range || _load_range()).wordAtPosition)(editor, editor.getCursorBufferPosition());

    const watchExpression = selectedText || expr && expr.wordMatch[0];
    if (watchExpression) {
      this._model.getActions().addWatchExpression(watchExpression);
    }
  }

  _copyDebuggerExpressionValue(event) {
    const clickedElement = event.target;
    atom.clipboard.write(clickedElement.textContent);
  }

  _copyDebuggerCallstack(event) {
    const callstackStore = this._model.getCallstackStore();
    const callstack = callstackStore.getCallstack();
    if (callstack) {
      let callstackText = '';
      callstack.forEach((item, i) => {
        const path = (_nuclideUri || _load_nuclideUri()).default.basename(item.location.path.replace(/^[a-zA-Z]+:\/\//, ''));
        callstackText += `${i}\t${item.name}\t${path}:${item.location.line}${_os.default.EOL}`;
      });

      atom.clipboard.write(callstackText.trim());
    }
  }
}

function createDatatipProvider() {
  if (datatipProvider == null) {
    datatipProvider = {
      // Eligibility is determined online, based on registered EvaluationExpression providers.
      validForScope: scope => true,
      providerName: DATATIP_PACKAGE_NAME,
      inclusionPriority: 1,
      datatip: (editor, position) => {
        if (activation == null) {
          return Promise.resolve(null);
        }
        const model = activation.getModel();
        return (0, (_DebuggerDatatip || _load_DebuggerDatatip()).debuggerDatatip)(model, editor, position);
      }
    };
  }
  return datatipProvider;
}

let activation = null;
let datatipProvider;

function activate(state) {
  if (!activation) {
    activation = new Activation(state);
  }
}

function serialize() {
  if (activation) {
    return activation.serialize();
  } else {
    return {
      breakpoints: null
    };
  }
}

function deactivate() {
  if (activation) {
    activation.dispose();
    activation = null;
  }
}

function registerConsoleExecutor(watchExpressionStore, registerExecutor) {
  const disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
  const rawOutput = new _rxjsBundlesRxMinJs.Subject();
  const send = expression => {
    disposables.add(
    // We filter here because the first value in the BehaviorSubject is null no matter what, and
    // we want the console to unsubscribe the stream after the first non-null value.
    watchExpressionStore.evaluateConsoleExpression(expression).filter(result => result != null).first().subscribe(result => rawOutput.next(result)));
    watchExpressionStore._triggerReevaluation();
  };
  const output = rawOutput.map(result => {
    if (!(result != null)) {
      throw new Error('Invariant violation: "result != null"');
    }

    return { data: result };
  });
  disposables.add(registerExecutor({
    id: 'debugger',
    name: 'Debugger',
    send,
    output,
    getProperties: watchExpressionStore.getProperties.bind(watchExpressionStore)
  }));
  return disposables;
}

function consumeRegisterExecutor(registerExecutor) {
  if (activation != null) {
    const model = activation.getModel();
    const register = () => registerConsoleExecutor(model.getWatchExpressionStore(), registerExecutor);
    model.getActions().addConsoleRegisterFunction(register);
    return new _atom.Disposable(() => model.getActions().removeConsoleRegisterFunction(register));
  } else {
    return new _atom.Disposable();
  }
}

function consumeDebuggerProvider(provider) {
  if (activation) {
    activation.getModel().getActions().addDebuggerProvider(provider);
  }
  return new _atom.Disposable(() => {
    if (activation) {
      activation.getModel().getActions().removeDebuggerProvider(provider);
    }
  });
}

function consumeEvaluationExpressionProvider(provider) {
  if (activation) {
    activation.getModel().getActions().addEvaluationExpressionProvider(provider);
  }
  return new _atom.Disposable(() => {
    if (activation) {
      activation.getModel().getActions().removeEvaluationExpressionProvider(provider);
    }
  });
}

function consumeToolBar(getToolBar) {
  const toolBar = getToolBar('nuclide-debugger');
  toolBar.addButton({
    iconset: 'icon-nuclicon',
    icon: 'debugger',
    callback: 'nuclide-debugger:toggle',
    tooltip: 'Toggle Debugger',
    priority: 500
  }).element;
  const disposable = new _atom.Disposable(() => {
    toolBar.removeItems();
  });

  if (!activation) {
    throw new Error('Invariant violation: "activation"');
  }

  activation._disposables.add(disposable);
  return disposable;
}

function consumeNotifications(raiseNativeNotification) {
  (0, (_nuclideDebuggerBase || _load_nuclideDebuggerBase()).setNotificationService)(raiseNativeNotification);
}

function provideRemoteControlService() {
  return new (_RemoteControlService || _load_RemoteControlService()).default(() => activation ? activation.getModel() : null);
}

function consumeDatatipService(service) {
  const provider = createDatatipProvider();
  const disposable = service.addProvider(provider);

  if (!activation) {
    throw new Error('Invariant violation: "activation"');
  }

  activation.getModel().getThreadStore().setDatatipService(service);
  activation._disposables.add(disposable);
  return disposable;
}

function createDebuggerNuxTourModel() {
  const welcomeToNewUiNux = {
    content: 'Welcome to the new Nuclide debugger UI!</br>' + 'We are evolving the debugger to integrate more closely with Nuclide.',
    selector: '.nuclide-debugger-container-new',
    position: 'left'
  };

  const newDebuggerUINuxTour = {
    id: NUX_NEW_DEBUGGER_UI_ID,
    name: NUX_NEW_DEBUGGER_UI_NAME,
    nuxList: [welcomeToNewUiNux],
    gatekeeperID: GK_NEW_DEBUGGER_UI_NUX
  };

  return newDebuggerUINuxTour;
}

function consumeRegisterNuxService(addNewNux) {
  if (!activation) {
    throw new Error('Invariant violation: "activation"');
  }

  return activation.consumeRegisterNuxService(addNewNux);
}

function consumeTriggerNuxService(tryTriggerNux) {
  if (activation != null) {
    activation.setTriggerNux(tryTriggerNux);
  }
}

function consumeWorkspaceViewsService(api) {
  if (!activation) {
    throw new Error('Invariant violation: "activation"');
  }

  activation.consumeWorkspaceViewsService(api);
}