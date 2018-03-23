'use strict';

var _collection;

function _load_collection() {
  return _collection = require('nuclide-commons/collection');
}

var _constants;

function _load_constants() {
  return _constants = require('./constants');
}

var _BreakpointConfigComponent;

function _load_BreakpointConfigComponent() {
  return _BreakpointConfigComponent = require('./BreakpointConfigComponent');
}

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('nuclide-commons-atom/createPackage'));
}

var _utils;

function _load_utils() {
  return _utils = require('./utils');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

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

var _AtomServiceContainer;

function _load_AtomServiceContainer() {
  return _AtomServiceContainer = require('./AtomServiceContainer');
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

var _ToolbarUtils;

function _load_ToolbarUtils() {
  return _ToolbarUtils = require('nuclide-commons-ui/ToolbarUtils');
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

class Activation {

  constructor(state) {
    atom.views.addViewProvider((_DebuggerPaneViewModel || _load_DebuggerPaneViewModel()).DebuggerPaneViewModel, createDebuggerView);
    atom.views.addViewProvider((_DebuggerPaneContainerViewModel || _load_DebuggerPaneContainerViewModel()).DebuggerPaneContainerViewModel, createDebuggerView);
    this._model = new (_DebuggerModel || _load_DebuggerModel()).default(state);
    this._selectedDebugConnection = null;
    this._visibleLaunchAttachDialogMode = null;
    this._lauchAttachDialogCloser = null;
    this._connectionProviders = new Map();
    this._layoutManager = new (_DebuggerLayoutManager || _load_DebuggerLayoutManager()).DebuggerLayoutManager(this._model, state);
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(this._model, this._layoutManager,
    // Listen for removed connections and kill the debugger if it is using that connection.
    (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).ServerConnection.onDidCloseServerConnection(connection => {
      const debuggerProcess = this._model.getDebuggerInstance();
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
    }), this._model.onConnectionsUpdated(() => {
      const newConnections = this._model.getConnections();
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
        this._setProvidersForConnection(connection);
      }
    }), this._model.onProvidersUpdated(() => {
      const connections = this._model.getConnections();
      for (const connection of connections) {
        this._setProvidersForConnection(connection);
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
    }), atom.commands.add('.nuclide-debugger-expression-value-list', {
      'nuclide-debugger:copy-debugger-expression-value': this._copyDebuggerExpressionValue.bind(this)
    }), atom.commands.add('atom-workspace', {
      'nuclide-debugger:copy-debugger-callstack': this._copyDebuggerCallstack.bind(this)
    }), atom.commands.add('.nuclide-debugger-disassembly-view', {
      'nuclide-debugger:copy-debugger-disassembly': this._copyDebuggerDisassembly.bind(this)
    }), atom.commands.add('.nuclide-debugger-disassembly-table', {
      'nuclide-debugger:add-disassembly-breakpoint': this._addDisassemblyBreakpoint.bind(this)
    }), atom.commands.add('.nuclide-debugger-registers-view', {
      'nuclide-debugger:copy-debugger-registers': this._copyDebuggerRegisters.bind(this)
    }),
    // Context Menu Items.
    atom.contextMenu.add({
      '.nuclide-debugger-disassembly-view': [{
        label: 'Copy disassembly',
        command: 'nuclide-debugger:copy-debugger-disassembly'
      }],
      '.nuclide-debugger-disassembly-table': [{
        label: 'Add breakpoint at address',
        command: 'nuclide-debugger:add-disassembly-breakpoint'
      }],
      '.nuclide-debugger-registers-view': [{
        label: 'Copy registers',
        command: 'nuclide-debugger:copy-debugger-registers'
      }],
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
          const location = (0, (_utils || _load_utils()).getBreakpointEventLocation)(event.target);
          if (location != null) {
            const bp = this._getBreakpointForLine(location.path, location.line);
            return bp != null && this._model.breakpointSupportsConditions(bp);
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
            const store = this._model;
            const debuggerInstance = store.getDebuggerInstance();
            if (store.getDebuggerMode() === (_constants || _load_constants()).DebuggerMode.PAUSED && debuggerInstance != null && debuggerInstance.getDebuggerProcessInfo().getDebuggerCapabilities().continueToLocation) {
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
          shouldDisplay: event => this._executeWithEditorPath(event, (filePath, line) => this._model.getBreakpointAtLine(filePath, line) != null) || false
        }, {
          label: 'Edit Breakpoint...',
          command: 'nuclide-debugger:edit-breakpoint',
          shouldDisplay: event => this._executeWithEditorPath(event, (filePath, line) => {
            const bp = this._getBreakpointForLine(filePath, line);
            return bp != null && this._model.breakpointSupportsConditions(bp);
          }) || false
        }, {
          label: 'Add to Watch',
          command: 'nuclide-debugger:add-to-watch',
          shouldDisplay: event => {
            const textEditor = atom.workspace.getActiveTextEditor();
            if (!this._model.isDebugging() || textEditor == null) {
              return false;
            }
            return textEditor.getSelections().length === 1 && !textEditor.getSelectedBufferRange().isEmpty();
          }
        }]
      }, { type: 'separator' }]
    }), this._registerCommandsContextMenuAndOpener());
  }

  _getBreakpointForLine(path, line) {
    return this._model.getBreakpointAtLine(path, line);
  }

  _setProvidersForConnection(connection) {
    const key = (_nuclideUri || _load_nuclideUri()).default.isRemote(connection) ? (_nuclideUri || _load_nuclideUri()).default.getHostname(connection) : 'local';
    const availableProviders = this._model.getLaunchAttachProvidersForConnection(connection);
    this._connectionProviders.set(key, availableProviders);
  }

  _getSuggestions(request) {
    let text = request.editor.getText();
    const lines = text.split('\n');
    const { row, column } = request.bufferPosition;
    // Only keep the lines up to and including the buffer position row.
    text = lines.slice(0, row + 1).join('\n');
    const debuggerInstance = this._model.getDebuggerInstance();
    if (debuggerInstance == null || !debuggerInstance.getDebuggerProcessInfo().getDebuggerCapabilities().completionsRequest) {
      // As a fallback look at the variable names of currently visible scopes.
      const scopes = this._model.getScopesNow();
      return Promise.resolve((0, (_collection || _load_collection()).arrayFlatten)(Array.from(scopes.values()).map(({ scopeVariables }) => scopeVariables.map(({ name }) => ({ text: name, type: 'variable' })))));
    }
    return new Promise((resolve, reject) => {
      this._model.getBridge().sendCompletionsCommand(text, column + 1, (err, response) => {
        if (err != null) {
          reject(err);
        } else {
          const result = response.targets.map(obj => {
            const { label, type } = obj;
            let replaceText;
            if (obj.text != null) {
              replaceText = obj.text;
            } else {
              replaceText = label;
            }
            return { text: replaceText, displayText: label, type };
          });
          resolve(result);
        }
      });
    });
  }

  serialize() {
    const model = this._model;
    const state = {
      breakpoints: model.getSerializedBreakpoints(),
      watchExpressions: model.getSerializedWatchExpressions(),
      showDebugger: this._layoutManager.isDebuggerVisible(),
      workspaceDocksVisibility: this._layoutManager.getWorkspaceDocksVisibility(),
      pauseOnException: this._model.getTogglePauseOnException(),
      pauseOnCaughtException: this._model.getTogglePauseOnCaughtException()
    };
    return state;
  }

  dispose() {
    this._disposables.dispose();
  }

  _registerCommandsContextMenuAndOpener() {
    const disposable = new (_UniversalDisposable || _load_UniversalDisposable()).default(atom.workspace.addOpener(uri => {
      return this._layoutManager.getModelForDebuggerUri(uri);
    }), () => {
      this._layoutManager.hideDebuggerViews(false);
    }, atom.commands.add('atom-workspace', {
      'nuclide-debugger:show': event => {
        const detail = event.detail;
        const show = detail == null || Boolean(detail.showOnlyIfHidden) === false || !this._layoutManager.isDebuggerVisible();
        if (show) {
          this._layoutManager.showDebuggerViews();
        }
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
    }), this._model.onDebuggerModeChange(() => this._layoutManager.debuggerModeChanged()), atom.commands.add('atom-workspace', {
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

  _isReadonlyTarget() {
    return this._model.getIsReadonlyTarget();
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
      const bp = this._model.getBreakpointAtLine(filePath, line);

      if (bp) {
        const { id, enabled } = bp;
        this._model.getActions().updateBreakpointEnabled(id, !enabled);
      }
    });
  }

  _configureBreakpoint(event) {
    const location = (0, (_utils || _load_utils()).getBreakpointEventLocation)(event.target) || this._executeWithEditorPath(event, (path, line) => ({ path, line }));
    if (location != null) {
      const bp = this._getBreakpointForLine(location.path, location.line);
      if (bp != null && this._model.breakpointSupportsConditions(bp)) {
        // Open the configuration dialog.
        const container = new (_ReactMountRootElement || _load_ReactMountRootElement()).default();
        _reactDom.default.render(_react.createElement((_BreakpointConfigComponent || _load_BreakpointConfigComponent()).BreakpointConfigComponent, {
          breakpoint: bp,
          actions: this._model.getActions(),
          onDismiss: () => {
            _reactDom.default.unmountComponentAtNode(container);
          },
          model: this._model
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

    const line = (0, (_utils || _load_utils()).getLineForEvent)(editor, event);
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

  _renderConfigDialog(panel, dialogMode, dialogCloser) {
    if (this._selectedDebugConnection == null) {
      // If no connection is selected yet, default to the local connection.
      this._selectedDebugConnection = 'local';
    }

    if (!(this._selectedDebugConnection != null)) {
      throw new Error('Invariant violation: "this._selectedDebugConnection != null"');
    }

    const options = this._model.getConnections().map(connection => {
      const displayName = (_nuclideUri || _load_nuclideUri()).default.isRemote(connection) ? (_nuclideUri || _load_nuclideUri()).default.getHostname(connection) : 'localhost';
      return {
        value: connection,
        label: displayName
      };
    }).filter(item => item.value != null && item.value !== '').sort((a, b) => a.label.localeCompare(b.label));

    // flowlint-next-line sketchy-null-string:off
    const connection = this._selectedDebugConnection || 'local';

    _reactDom.default.render(_react.createElement((_DebuggerLaunchAttachUI || _load_DebuggerLaunchAttachUI()).DebuggerLaunchAttachUI, {
      dialogMode: dialogMode,
      model: this._model,
      connectionChanged: newValue => {
        this._selectedDebugConnection = newValue;
        this._renderConfigDialog(panel, dialogMode, dialogCloser);
      },
      connection: connection,
      connectionOptions: options,
      dialogCloser: dialogCloser,
      providers: this._connectionProviders
    }), panel.getItem());
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
    this._renderConfigDialog(pane, dialogMode, () => disposables.dispose());
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
    const copyElement = clickedElement.closest('.nuclide-ui-lazy-nested-value');
    if (copyElement != null) {
      atom.clipboard.write(copyElement.textContent);
    }
  }

  _copyDebuggerDisassembly() {
    const callstack = this._model.getCallstack();
    if (callstack != null) {
      const selectedFrame = this._model.getSelectedCallFrameIndex();
      if (selectedFrame >= 0 && selectedFrame < callstack.length) {
        const frameInfo = callstack[selectedFrame].disassembly;
        if (frameInfo != null) {
          const metadata = frameInfo.metadata.map(m => {
            return `${m.name}:\t${m.value}`;
          }).join(_os.default.EOL);

          const entries = frameInfo.instructions.map(instruction => {
            return `${instruction.address}\t` + `${instruction.offset || ''}\t` + `${instruction.instruction}` + `${instruction.comment || ''}\t`;
          }).join(_os.default.EOL);

          atom.clipboard.write(`${frameInfo.frameTitle}${_os.default.EOL}` + metadata + _os.default.EOL + entries);
        }
      }
    }
  }

  _copyDebuggerRegisters() {
    const callstack = this._model.getCallstack();
    if (callstack != null) {
      const selectedFrame = this._model.getSelectedCallFrameIndex();
      if (selectedFrame >= 0 && selectedFrame < callstack.length) {
        const registerInfo = callstack[selectedFrame].registers;
        if (registerInfo != null) {
          const rows = [];
          for (const group of registerInfo) {
            rows.push(group.groupName + _os.default.EOL);
            for (const register of group.registers) {
              const value = register.value != null ? register.value : '';
              let decimalValue = parseInt(value, 16);
              if (Number.isNaN(decimalValue)) {
                decimalValue = '';
              }
              rows.push(`${register.name}:\t${value}\t${decimalValue}`);
            }
            rows.push(_os.default.EOL);
          }
          atom.clipboard.write(rows.join(_os.default.EOL));
        }
      }
    }
  }

  _addDisassemblyBreakpoint(event) {
    const clickedElement = event.target;
    const clickedRow = clickedElement.closest('.nuclide-ui-table-row');
    if (clickedRow != null) {
      const rowIndex = clickedRow.dataset.rowindex;
      const callstack = this._model.getCallstack();
      const selectedFrameIndex = this._model.getSelectedCallFrameIndex();
      if (callstack != null && selectedFrameIndex >= 0 && selectedFrameIndex < callstack.length) {
        const disassembly = callstack[selectedFrameIndex].disassembly;

        if (disassembly != null) {
          const instruction = parseInt(rowIndex, 10);
          const address = disassembly.instructions[instruction].address;
          this._model.getActions().addBreakpoint(address, -1);
        }
      }
    }
  }

  _copyDebuggerCallstack(event) {
    const callstack = this._model.getCallstack();
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
      if (this._selectedDebugConnection != null) {
        const conn = this._selectedDebugConnection;
        if ((_nuclideUri || _load_nuclideUri()).default.isRemote(conn)) {
          // Use root instead of current directory as launch point for debugger.
          this._selectedDebugConnection = (_nuclideUri || _load_nuclideUri()).default.createRemoteUri((_nuclideUri || _load_nuclideUri()).default.getHostname(conn), '/');
        } else {
          // Use null instead of local path to use local debugger downstream.
          this._selectedDebugConnection = null;
        }
      }
    };
    const boundUpdateSelectedColumn = updateSelectedConnection.bind(this);
    const disposable = cwdApi.observeCwd(directory => boundUpdateSelectedColumn(directory));
    this._disposables.add(disposable);
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
      disposable.dispose();
      this._disposables.remove(disposable);
    });
  }

  createAutocompleteProvider() {
    return {
      analytics: {
        eventName: 'nuclide-debugger',
        shouldLogInsertedSuggestion: false
      },
      labels: ['nuclide-console'],
      selector: '*',
      filterSuggestions: true,
      getSuggestions: this._getSuggestions.bind(this)
    };
  }

  consumeOutputService(api) {
    return (0, (_AtomServiceContainer || _load_AtomServiceContainer()).setOutputService)(api);
  }

  consumeRegisterExecutor(registerExecutor) {
    const model = this._model;
    const register = () => registerConsoleExecutor(model, registerExecutor);
    model.getActions().addConsoleRegisterFunction(register);
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => model.getActions().removeConsoleRegisterFunction(register));
  }

  consumeDebuggerProvider(provider) {
    this._model.getActions().addDebuggerProvider(provider);
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
      this._model.getActions().removeDebuggerProvider(provider);
    });
  }

  consumeEvaluationExpressionProvider(provider) {
    this._model.getActions().addEvaluationExpressionProvider(provider);
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
      this._model.getActions().removeEvaluationExpressionProvider(provider);
    });
  }

  consumeToolBar(getToolBar) {
    const toolBar = getToolBar('nuclide-debugger');
    toolBar.addButton((0, (_ToolbarUtils || _load_ToolbarUtils()).makeToolbarButtonSpec)({
      iconset: 'icon-nuclicon',
      icon: 'debugger',
      callback: 'nuclide-debugger:show-attach-dialog',
      tooltip: 'Attach Debugger',
      priority: 500
    })).element;
    const disposable = new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
      toolBar.removeItems();
    });
    this._disposables.add(disposable);
    return disposable;
  }

  consumeNotifications(raiseNativeNotification) {
    (0, (_AtomServiceContainer || _load_AtomServiceContainer()).setNotificationService)(raiseNativeNotification);
  }

  provideRemoteControlService() {
    return new (_RemoteControlService || _load_RemoteControlService()).default(() => this._model);
  }

  consumeDatatipService(service) {
    const provider = this._createDatatipProvider();
    const disposable = service.addProvider(provider);
    this._model.setDatatipService(service);
    this._disposables.add(disposable);
    return disposable;
  }

  _createDatatipProvider() {
    return {
      // Eligibility is determined online, based on registered EvaluationExpression providers.
      providerName: DATATIP_PACKAGE_NAME,
      priority: 1,
      datatip: (editor, position) => {
        return (0, (_DebuggerDatatip || _load_DebuggerDatatip()).debuggerDatatip)(this._model, editor, position);
      }
    };
  }
}

function registerConsoleExecutor(model, registerExecutor) {
  const disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
  const rawOutput = new _rxjsBundlesRxMinJs.Subject();
  const send = expression => {
    disposables.add(
    // We filter here because the first value in the BehaviorSubject is null no matter what, and
    // we want the console to unsubscribe the stream after the first non-null value.
    model.evaluateConsoleExpression(expression).filter(result => result != null).first().subscribe(result => rawOutput.next(result)));
    model.triggerReevaluation();
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
    scopeName: 'text.plain',
    send,
    output,
    getProperties: model.getProperties.bind(model)
  }));
  return disposables;
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

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);