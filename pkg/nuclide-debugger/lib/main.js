'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createDebuggerView = createDebuggerView;
exports.activate = activate;
exports.serialize = serialize;
exports.deactivate = deactivate;
exports.consumeOutputService = consumeOutputService;
exports.consumeRegisterExecutor = consumeRegisterExecutor;
exports.consumeDebuggerProvider = consumeDebuggerProvider;
exports.consumeEvaluationExpressionProvider = consumeEvaluationExpressionProvider;
exports.consumeToolBar = consumeToolBar;
exports.consumeNotifications = consumeNotifications;
exports.provideRemoteControlService = provideRemoteControlService;
exports.consumeDatatipService = consumeDatatipService;
exports.consumeRegisterNuxService = consumeRegisterNuxService;
exports.consumeTriggerNuxService = consumeTriggerNuxService;
exports.consumeCurrentWorkingDirectory = consumeCurrentWorkingDirectory;

var _constants;

function _load_constants() {
  return _constants = require('./constants');
}

var _BreakpointConfigComponent;

function _load_BreakpointConfigComponent() {
  return _BreakpointConfigComponent = require('./BreakpointConfigComponent');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

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

var _DebuggerDatatip;

function _load_DebuggerDatatip() {
  return _DebuggerDatatip = require('./DebuggerDatatip');
}

var _react = _interopRequireWildcard(require('react'));

var _reactDom = _interopRequireDefault(require('react-dom'));

var _DebuggerLaunchAttachUI;

function _load_DebuggerLaunchAttachUI() {
  return _DebuggerLaunchAttachUI = require('./DebuggerLaunchAttachUI');
}

var _DebuggerLaunchAttachConnectionChooser;

function _load_DebuggerLaunchAttachConnectionChooser() {
  return _DebuggerLaunchAttachConnectionChooser = require('./DebuggerLaunchAttachConnectionChooser');
}

var _renderReactRoot;

function _load_renderReactRoot() {
  return _renderReactRoot = require('nuclide-commons-ui/renderReactRoot');
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

var _range;

function _load_range() {
  return _range = require('nuclide-commons-atom/range');
}

var _DebuggerLayoutManager;

function _load_DebuggerLayoutManager() {
  return _DebuggerLayoutManager = require('./DebuggerLayoutManager');
}

var _DebuggerPaneViewModel;

function _load_DebuggerPaneViewModel() {
  return _DebuggerPaneViewModel = require('./DebuggerPaneViewModel');
}

var _DebuggerPaneContainerViewModel;

function _load_DebuggerPaneContainerViewModel() {
  return _DebuggerPaneContainerViewModel = require('./DebuggerPaneContainerViewModel');
}

var _os = _interopRequireDefault(require('os'));

var _nullthrows;

function _load_nullthrows() {
  return _nullthrows = _interopRequireDefault(require('nullthrows'));
}

var _ReactMountRootElement;

function _load_ReactMountRootElement() {
  return _ReactMountRootElement = _interopRequireDefault(require('nuclide-commons-ui/ReactMountRootElement'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const DATATIP_PACKAGE_NAME = 'nuclide-debugger-datatip'; /**
                                                          * Copyright (c) 2015-present, Facebook, Inc.
                                                          * All rights reserved.
                                                          *
                                                          * This source code is licensed under the license found in the LICENSE file in
                                                          * the root directory of this source tree.
                                                          *
                                                          * 
                                                          * @format
                                                          */

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

function getBreakpointEventLocation(target) {
  if (target != null && target.dataset != null && target.dataset.path != null && target.dataset.line != null) {
    return { path: target.dataset.path, line: parseInt(target.dataset.line, 10) };
  }
  return null;
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

function createDebuggerView(model) {
  let view = null;
  if (model instanceof (_DebuggerPaneViewModel || _load_DebuggerPaneViewModel()).DebuggerPaneViewModel || model instanceof (_DebuggerPaneContainerViewModel || _load_DebuggerPaneContainerViewModel()).DebuggerPaneContainerViewModel) {
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
    this._selectedDebugConnection = null;
    this._visibleLaunchAttachDialogMode = null;
    this._lauchAttachDialogCloser = null;
    this._connectionProviders = new Map();
    this._layoutManager = new (_DebuggerLayoutManager || _load_DebuggerLayoutManager()).DebuggerLayoutManager(this._model);
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(this._model, this._layoutManager,
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
    }), this._model.getDebuggerProviderStore().onConnectionsUpdated(() => {
      const store = this._model.getDebuggerProviderStore();
      const newConnections = store.getConnections();
      const keys = Array.from(this._connectionProviders.keys());

      const removedConnections = keys.filter(connection => newConnections.find(item => item === connection) == null);
      const addedConnections = newConnections.filter(connection => keys.find(item => item === connection) == null);

      for (const key of removedConnections) {
        for (const provider of this._connectionProviders.get(key) || []) {
          provider.dispose();
        }

        this._connectionProviders.delete(key);
      }

      for (const connection of addedConnections) {
        this._setProvidersForConnection(store, connection);
      }
    }), this._model.getDebuggerProviderStore().onProvidersUpdated(() => {
      const store = this._model.getDebuggerProviderStore();
      const connections = store.getConnections();
      for (const connection of connections) {
        this._setProvidersForConnection(store, connection);
      }
    }),
    // Commands.
    atom.commands.add('atom-workspace', {
      'nuclide-debugger:show-attach-dialog': () => {
        const boundFn = this._showLaunchAttachDialog.bind(this);
        boundFn('attach');
      }
    }), atom.commands.add('atom-workspace', {
      'nuclide-debugger:show-launch-dialog': () => {
        const boundFn = this._showLaunchAttachDialog.bind(this);
        boundFn('launch');
      }
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
      'nuclide-debugger:edit-breakpoint': this._configureBreakpoint.bind(this)
    }), atom.commands.add('atom-workspace', {
      'nuclide-debugger:remove-all-breakpoints': this._deleteAllBreakpoints.bind(this)
    }), atom.commands.add('atom-workspace', {
      'nuclide-debugger:enable-all-breakpoints': this._enableAllBreakpoints.bind(this)
    }), atom.commands.add('atom-workspace', {
      'nuclide-debugger:disable-all-breakpoints': this._disableAllBreakpoints.bind(this)
    }), atom.commands.add('atom-workspace', {
      'nuclide-debugger:remove-breakpoint': this._deleteBreakpoint.bind(this)
    }), atom.commands.add('atom-workspace', {
      'nuclide-debugger:add-to-watch': this._addToWatch.bind(this)
    }), atom.commands.add('atom-workspace', {
      'nuclide-debugger:run-to-location': this._runToLocation.bind(this)
    }), atom.commands.add('.nuclide-debugger-root', {
      'nuclide-debugger:copy-debugger-expression-value': this._copyDebuggerExpressionValue.bind(this)
    }), atom.commands.add('atom-workspace', {
      'nuclide-debugger:copy-debugger-callstack': this._copyDebuggerCallstack.bind(this)
    }),
    // Context Menu Items.
    atom.contextMenu.add({
      '.nuclide-debugger-breakpoint-list': [{
        label: 'Enable All Breakpoints',
        command: 'nuclide-debugger:enable-all-breakpoints'
      }, {
        label: 'Disable All Breakpoints',
        command: 'nuclide-debugger:disable-all-breakpoints'
      }, {
        label: 'Remove All Breakpoints',
        command: 'nuclide-debugger:remove-all-breakpoints'
      }, { type: 'separator' }],
      '.nuclide-debugger-breakpoint': [{
        label: 'Edit breakpoint...',
        command: 'nuclide-debugger:edit-breakpoint',
        shouldDisplay: event => {
          const location = getBreakpointEventLocation(event.target);
          if (location != null) {
            const bp = this._getBreakpointForLine(location.path, location.line);
            return bp != null && this.getModel().getBreakpointStore().breakpointSupportsConditions(bp);
          }
          return false;
        }
      }, {
        label: 'Remove Breakpoint',
        command: 'nuclide-debugger:remove-breakpoint'
      }, { type: 'separator' }],
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
            if (store.getDebuggerMode() === (_DebuggerStore || _load_DebuggerStore()).DebuggerMode.PAUSED && debuggerInstance != null && debuggerInstance.getDebuggerProcessInfo().getDebuggerCapabilities().continueToLocation) {
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
          label: 'Edit Breakpoint...',
          command: 'nuclide-debugger:edit-breakpoint',
          shouldDisplay: event => this._executeWithEditorPath(event, (filePath, line) => {
            const bp = this._getBreakpointForLine(filePath, line);
            return bp != null && this.getModel().getBreakpointStore().breakpointSupportsConditions(bp);
          }) || false
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
    }), this._registerCommandsContextMenuAndOpener());
  }

  _getBreakpointForLine(path, line) {
    const store = this.getModel().getBreakpointStore();
    return store.getBreakpointAtLine(path, line);
  }

  _setProvidersForConnection(store, connection) {
    const key = (_nuclideUri || _load_nuclideUri()).default.isRemote(connection) ? (_nuclideUri || _load_nuclideUri()).default.getHostname(connection) : 'local';
    const availableProviders = store.getLaunchAttachProvidersForConnection(connection);
    this._connectionProviders.set(key, availableProviders);
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

  _registerCommandsContextMenuAndOpener() {
    const disposable = new (_UniversalDisposable || _load_UniversalDisposable()).default(atom.workspace.addOpener(uri => {
      return this._layoutManager.getModelForDebuggerUri(uri);
    }), () => {
      this._layoutManager.hideDebuggerViews(false);
    }, atom.commands.add('atom-workspace', {
      'nuclide-debugger:show': () => {
        this._layoutManager.showDebuggerViews();
      }
    }), atom.commands.add('atom-workspace', {
      'nuclide-debugger:hide': () => {
        this._layoutManager.hideDebuggerViews(false);
        this._model.getActions().stopDebugging();
      }
    }), atom.commands.add('atom-workspace', 'nuclide-debugger:toggle', () => {
      if (this._layoutManager.isDebuggerVisible() === true) {
        atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:hide');
      } else {
        atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:show');
      }
    }), this._model.getStore().onDebuggerModeChange(() => this._layoutManager.debuggerModeChanged()), atom.commands.add('atom-workspace', {
      'nuclide-debugger:reset-layout': () => {
        this._layoutManager.resetLayout();
      }
    }), atom.contextMenu.add({
      '.nuclide-debugger-container': [{
        label: 'Debugger Views',
        submenu: [{
          label: 'Reset Layout',
          command: 'nuclide-debugger:reset-layout'
        }]
      }]
    }));
    this._layoutManager.registerContextMenus();
    return disposable;
  }

  setTriggerNux(triggerNux) {
    this._tryTriggerNux = triggerNux;
  }

  tryTriggerNux(id) {
    if (this._tryTriggerNux != null) {
      this._tryTriggerNux(id);
    }
  }

  _isReadonlyTarget() {
    return this._model.getStore().getIsReadonlyTarget();
  }

  _continue() {
    // TODO(jeffreytan): when we figured out the launch lifecycle story
    // we may bind this to start-debugging too.
    if (!this._isReadonlyTarget()) {
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)((_constants || _load_constants()).AnalyticsEvents.DEBUGGER_STEP_CONTINUE);
      this._model.getBridge().continue();
    }
  }

  _stop() {
    this._model.getActions().stopDebugging();
  }

  _restart() {
    this._model.getActions().restartDebugger();
  }

  _stepOver() {
    if (!this._isReadonlyTarget()) {
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)((_constants || _load_constants()).AnalyticsEvents.DEBUGGER_STEP_OVER);
      this._model.getBridge().stepOver();
    }
  }

  _stepInto() {
    if (!this._isReadonlyTarget()) {
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)((_constants || _load_constants()).AnalyticsEvents.DEBUGGER_STEP_INTO);
      this._model.getBridge().stepInto();
    }
  }

  _stepOut() {
    if (!this._isReadonlyTarget()) {
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)((_constants || _load_constants()).AnalyticsEvents.DEBUGGER_STEP_OUT);
      this._model.getBridge().stepOut();
    }
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

  _configureBreakpoint(event) {
    const location = getBreakpointEventLocation(event.target) || this._executeWithEditorPath(event, (path, line) => ({ path, line }));
    if (location != null) {
      const store = this.getModel().getBreakpointStore();
      const bp = this._getBreakpointForLine(location.path, location.line);
      if (bp != null && store.breakpointSupportsConditions(bp)) {
        // Open the configuration dialog.
        const container = new (_ReactMountRootElement || _load_ReactMountRootElement()).default();
        _reactDom.default.render(_react.createElement((_BreakpointConfigComponent || _load_BreakpointConfigComponent()).BreakpointConfigComponent, {
          breakpoint: bp,
          actions: this.getModel().getActions(),
          onDismiss: () => {
            _reactDom.default.unmountComponentAtNode(container);
          },
          breakpointStore: store
        }), container);
      }
    }
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

  _enableAllBreakpoints() {
    const actions = this._model.getActions();
    actions.enableAllBreakpoints();
  }

  _disableAllBreakpoints() {
    const actions = this._model.getActions();
    actions.disableAllBreakpoints();
  }

  _renderConfigDialog(panel, chooseConnection, dialogMode, dialogCloser) {
    if (this._selectedDebugConnection == null) {
      // If no connection is selected yet, default to the local connection.
      this._selectedDebugConnection = 'local';
    }

    if (!(this._selectedDebugConnection != null)) {
      throw new Error('Invariant violation: "this._selectedDebugConnection != null"');
    }

    if (chooseConnection) {
      const options = this._model.getDebuggerProviderStore().getConnections().map(connection => {
        const displayName = (_nuclideUri || _load_nuclideUri()).default.isRemote(connection) ? (_nuclideUri || _load_nuclideUri()).default.getHostname(connection) : 'localhost';
        return {
          value: connection,
          label: displayName
        };
      }).filter(item => item.value != null && item.value !== '').sort((a, b) => a.label.localeCompare(b.label));
      _reactDom.default.render(_react.createElement((_DebuggerLaunchAttachConnectionChooser || _load_DebuggerLaunchAttachConnectionChooser()).DebuggerLaunchAttachConnectionChooser, {
        options: options
        // flowlint-next-line sketchy-null-string:off
        , selectedConnection: this._selectedDebugConnection || 'local',
        connectionChanged: newValue => {
          this._selectedDebugConnection = newValue;
          this._renderConfigDialog(panel, false, dialogMode, dialogCloser);
        },
        dialogCloser: dialogCloser
      }), panel.getItem());
    } else {
      const connection = this._selectedDebugConnection || 'local';
      const key = (_nuclideUri || _load_nuclideUri()).default.isRemote(connection) ? (_nuclideUri || _load_nuclideUri()).default.getHostname(connection) : 'local';
      _reactDom.default.render(_react.createElement((_DebuggerLaunchAttachUI || _load_DebuggerLaunchAttachUI()).DebuggerLaunchAttachUI, {
        dialogMode: dialogMode,
        store: this._model.getDebuggerProviderStore(),
        debuggerActions: this._model.getActions(),
        connection: connection,
        chooseConnection: () => this._renderConfigDialog(panel, true, dialogMode, dialogCloser),
        dialogCloser: dialogCloser,
        providers: this._connectionProviders.get(key) || []
      }), panel.getItem());
    }
  }

  _showLaunchAttachDialog(dialogMode) {
    if (this._visibleLaunchAttachDialogMode != null && this._visibleLaunchAttachDialogMode !== dialogMode) {
      // If the dialog is already visible, but isn't the correct mode, close it before
      // re-opening the correct mode.
      if (!(this._lauchAttachDialogCloser != null)) {
        throw new Error('Invariant violation: "this._lauchAttachDialogCloser != null"');
      }

      this._lauchAttachDialogCloser();
    }

    const disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    const hostEl = document.createElement('div');
    const pane = atom.workspace.addModalPanel({
      item: hostEl
    });

    const parentEl = hostEl.parentElement;
    parentEl.style.maxWidth = '100em';

    // Function callback that closes the dialog and frees all of its resources.
    this._renderConfigDialog(pane, false, dialogMode, () => disposables.dispose());
    this._lauchAttachDialogCloser = () => disposables.dispose();
    disposables.add(pane.onDidChangeVisible(visible => {
      if (!visible) {
        disposables.dispose();
      }
    }));
    disposables.add(() => {
      this._disposables.remove(disposables);
      this._visibleLaunchAttachDialogMode = null;
      this._lauchAttachDialogCloser = null;
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)((_constants || _load_constants()).AnalyticsEvents.DEBUGGER_TOGGLE_ATTACH_DIALOG, {
        visible: false,
        dialogMode
      });
      _reactDom.default.unmountComponentAtNode(hostEl);
      pane.destroy();
    });

    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)((_constants || _load_constants()).AnalyticsEvents.DEBUGGER_TOGGLE_ATTACH_DIALOG, {
      visible: true,
      dialogMode
    });
    this._visibleLaunchAttachDialogMode = dialogMode;
    this._disposables.add(disposables);
  }

  _addToWatch() {
    const editor = atom.workspace.getActiveTextEditor();
    if (!editor) {
      return;
    }
    const selectedText = editor.getTextInBufferRange((0, (_range || _load_range()).trimRange)(editor, editor.getSelectedBufferRange()));
    const expr = (0, (_range || _load_range()).wordAtPosition)(editor, editor.getCursorBufferPosition());

    const watchExpression = selectedText || expr && expr.wordMatch[0];
    // flowlint-next-line sketchy-null-string:off
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

  consumeCurrentWorkingDirectory(cwdApi) {
    const updateSelectedConnection = directory => {
      this._selectedDebugConnection = directory != null ? directory.getPath() : null;
    };
    const boundUpdateSelectedColumn = updateSelectedConnection.bind(this);
    const disposable = cwdApi.observeCwd(directory => boundUpdateSelectedColumn(directory));
    this._disposables.add(disposable);
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
      disposable.dispose();
      this._disposables.remove(disposable);
    });
  }
}

function createDatatipProvider() {
  if (datatipProvider == null) {
    datatipProvider = {
      // Eligibility is determined online, based on registered EvaluationExpression providers.
      providerName: DATATIP_PACKAGE_NAME,
      priority: 1,
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

function consumeOutputService(api) {
  return (0, (_nuclideDebuggerBase || _load_nuclideDebuggerBase()).setOutputService)(api);
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
    callback: 'nuclide-debugger:show-attach-dialog',
    tooltip: 'Attach Debugger',
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

function consumeCurrentWorkingDirectory(cwdApi) {
  if (!activation) {
    throw new Error('Invariant violation: "activation"');
  }

  return activation.consumeCurrentWorkingDirectory(cwdApi);
}