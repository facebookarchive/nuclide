'use strict';

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _BreakpointManager;

function _load_BreakpointManager() {
  return _BreakpointManager = _interopRequireDefault(require('./BreakpointManager'));
}

var _constants;

function _load_constants() {
  return _constants = require('./constants');
}

var _BreakpointConfigComponent;

function _load_BreakpointConfigComponent() {
  return _BreakpointConfigComponent = _interopRequireDefault(require('./ui/BreakpointConfigComponent'));
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

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _RemoteControlService;

function _load_RemoteControlService() {
  return _RemoteControlService = _interopRequireDefault(require('./RemoteControlService'));
}

var _DebuggerUiModel;

function _load_DebuggerUiModel() {
  return _DebuggerUiModel = _interopRequireDefault(require('./DebuggerUiModel'));
}

var _DebugService;

function _load_DebugService() {
  return _DebugService = _interopRequireDefault(require('./vsp/DebugService'));
}

var _DebuggerDatatip;

function _load_DebuggerDatatip() {
  return _DebuggerDatatip = require('./DebuggerDatatip');
}

var _react = _interopRequireWildcard(require('react'));

var _reactDom = _interopRequireDefault(require('react-dom'));

var _DebuggerLaunchAttachUI;

function _load_DebuggerLaunchAttachUI() {
  return _DebuggerLaunchAttachUI = _interopRequireDefault(require('./ui/DebuggerLaunchAttachUI'));
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
  return _DebuggerLayoutManager = _interopRequireDefault(require('./ui/DebuggerLayoutManager'));
}

var _DebuggerPaneViewModel;

function _load_DebuggerPaneViewModel() {
  return _DebuggerPaneViewModel = _interopRequireDefault(require('./ui/DebuggerPaneViewModel'));
}

var _DebuggerPaneContainerViewModel;

function _load_DebuggerPaneContainerViewModel() {
  return _DebuggerPaneContainerViewModel = _interopRequireDefault(require('./ui/DebuggerPaneContainerViewModel'));
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
    atom.views.addViewProvider((_DebuggerPaneViewModel || _load_DebuggerPaneViewModel()).default, createDebuggerView);
    atom.views.addViewProvider((_DebuggerPaneContainerViewModel || _load_DebuggerPaneContainerViewModel()).default, createDebuggerView);
    this._service = new (_DebugService || _load_DebugService()).default(state);
    this._uiModel = new (_DebuggerUiModel || _load_DebuggerUiModel()).default(this._service);
    this._breakpointManager = new (_BreakpointManager || _load_BreakpointManager()).default(this._service);
    this._selectedDebugConnection = null;
    this._visibleLaunchAttachDialogMode = null;
    this._lauchAttachDialogCloser = null;
    this._connectionProviders = new Map();
    this._layoutManager = new (_DebuggerLayoutManager || _load_DebuggerLayoutManager()).default(this._service, state);
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(this._service, this._uiModel, this._layoutManager, this._breakpointManager,
    // Listen for removed connections and kill the debugger if it is using that connection.
    (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).ServerConnection.onDidCloseServerConnection(connection => {
      const debuggerProcess = this._service.viewModel.focusedProcess;
      if (debuggerProcess == null) {
        return; // Nothing to do if we're not debugging.
      }
      const debuggeeTargetUri = debuggerProcess.configuration.targetUri;
      if ((_nuclideUri || _load_nuclideUri()).default.isLocal(debuggeeTargetUri)) {
        return; // Nothing to do if our debug session is local.
      }
      if ((_nuclideUri || _load_nuclideUri()).default.getHostname(debuggeeTargetUri) === connection.getRemoteHostname()) {
        this._service.stopProcess();
      }
    }), this._uiModel.onConnectionsUpdated(() => {
      const newConnections = this._uiModel.getConnections();
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
    }), this._uiModel.onProvidersUpdated(() => {
      const connections = this._uiModel.getConnections();
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
    }), atom.commands.add('.nuclide-debugger-expression-value-list', {
      'nuclide-debugger:copy-debugger-expression-value': this._copyDebuggerExpressionValue.bind(this)
    }), atom.commands.add('atom-workspace', {
      'nuclide-debugger:copy-debugger-callstack': this._copyDebuggerCallstack.bind(this)
    }),
    // Context Menu Items.
    atom.contextMenu.add({
      '.nuclide-debugger-disassembly-view': [{
        label: 'Copy disassembly',
        command: 'nuclide-debugger:copy-debugger-disassembly'
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
            const bp = this._service.getModel().getBreakpointAtLine(location.path, location.line);
            return bp != null && this._supportsConditionalBreakpoints();
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
          label: 'Toggle Breakpoint',
          command: 'nuclide-debugger:toggle-breakpoint'
        }, {
          label: 'Toggle Breakpoint enabled/disabled',
          command: 'nuclide-debugger:toggle-breakpoint-enabled',
          shouldDisplay: event => this._executeWithEditorPath(event, (filePath, line) => this._service.getModel().getBreakpointAtLine(filePath, line) != null) || false
        }, {
          label: 'Edit Breakpoint...',
          command: 'nuclide-debugger:edit-breakpoint',
          shouldDisplay: event => this._executeWithEditorPath(event, (filePath, line) => {
            const bp = this._service.getModel().getBreakpointAtLine(filePath, line);
            return bp != null && this._supportsConditionalBreakpoints();
          }) || false
        }, {
          label: 'Add to Watch',
          command: 'nuclide-debugger:add-to-watch',
          shouldDisplay: event => {
            const textEditor = atom.workspace.getActiveTextEditor();
            if (this._service.getDebuggerMode() === (_constants || _load_constants()).DebuggerMode.STOPPED || textEditor == null) {
              return false;
            }
            return textEditor.getSelections().length === 1 && !textEditor.getSelectedBufferRange().isEmpty();
          }
        }]
      }, { type: 'separator' }]
    }), this._registerCommandsContextMenuAndOpener(),
    // TODO remove after rollout, as we'd want to test against the new VSP debugger.
    atom.packages.onDidActivateInitialPackages(() => {
      if (atom.inSpecMode()) {
        atom.packages.deactivatePackage('nuclide-debugger-new');
      }
    }));
  }

  _supportsConditionalBreakpoints() {
    // If currently debugging, return whether or not the current debugger supports this.
    const { focusedProcess } = this._service.viewModel;
    if (focusedProcess == null) {
      // If not currently debugging, return if any of the debuggers that support
      // the file extension this bp is in support conditions.
      // TODO(ericblue): have providers register their file extensions and filter correctly here.
      return true;
    } else {
      return Boolean(focusedProcess.session.capabilities.supportsConditionalBreakpoints);
    }
  }

  _setProvidersForConnection(connection) {
    const key = (_nuclideUri || _load_nuclideUri()).default.isRemote(connection) ? (_nuclideUri || _load_nuclideUri()).default.getHostname(connection) : 'local';
    const availableProviders = this._uiModel.getLaunchAttachProvidersForConnection(connection);
    this._connectionProviders.set(key, availableProviders);
  }

  _getSuggestions(request) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      let text = request.editor.getText();
      const lines = text.split('\n');
      const { row } = request.bufferPosition;
      // Only keep the lines up to and including the buffer position row.
      text = lines.slice(0, row + 1).join('\n');
      const { focusedStackFrame, focusedProcess } = _this._service.viewModel;
      if (focusedProcess == null || focusedStackFrame == null) {
        return [];
      } else if (!Boolean(focusedProcess.session.capabilities.supportsCompletionsRequest)) {
        const scopes = yield focusedStackFrame.getScopes();
        return scopes.map(function (scope) {
          return { text: scope.name, type: 'variable' };
        });
      } else {
        const completions = yield focusedProcess.completions(focusedStackFrame.frameId, text, request.bufferPosition, 0);
        return completions.map(function (item) {
          return {
            displayText: item.label,
            text: item.text == null ? item.label : item.text,
            type: item.type
          };
        });
      }
    })();
  }

  serialize() {
    const model = this._service.getModel();
    const state = {
      sourceBreakpoints: model.getBreakpoints(),
      functionBreakpoints: model.getFunctionBreakpoints(),
      exceptionBreakpoints: model.getExceptionBreakpoints(),
      watchExpressions: model.getWatchExpressions().map(e => e.name),
      showDebugger: this._layoutManager.isDebuggerVisible(),
      workspaceDocksVisibility: this._layoutManager.getWorkspaceDocksVisibility()
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
        this._service.stopProcess();
      }
    }), atom.commands.add('atom-workspace', 'nuclide-debugger:toggle', () => {
      if (this._layoutManager.isDebuggerVisible() === true) {
        atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:hide');
      } else {
        atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:show');
      }
    }), this._service.onDidChangeMode(() => this._layoutManager.debuggerModeChanged()), atom.commands.add('atom-workspace', {
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
    const { focusedProcess } = this._service.viewModel;
    return focusedProcess == null ? false : focusedProcess.configuration.capabilities.readOnlyTarget;
  }

  _continue() {
    const { focusedThread } = this._service.viewModel;
    if (!this._isReadonlyTarget() && focusedThread != null) {
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)((_constants || _load_constants()).AnalyticsEvents.DEBUGGER_STEP_CONTINUE);
      focusedThread.continue();
    }
  }

  _stop() {
    this._service.stopProcess();
  }

  _restart() {
    this._service.restartProcess();
  }

  _stepOver() {
    const { focusedThread } = this._service.viewModel;
    if (!this._isReadonlyTarget() && focusedThread != null) {
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)((_constants || _load_constants()).AnalyticsEvents.DEBUGGER_STEP_OVER);
      focusedThread.next();
    }
  }

  _stepInto() {
    const { focusedThread } = this._service.viewModel;
    if (!this._isReadonlyTarget() && focusedThread != null) {
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)((_constants || _load_constants()).AnalyticsEvents.DEBUGGER_STEP_INTO);
      focusedThread.stepIn();
    }
  }

  _stepOut() {
    const { focusedThread } = this._service.viewModel;
    if (!this._isReadonlyTarget() && focusedThread != null) {
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)((_constants || _load_constants()).AnalyticsEvents.DEBUGGER_STEP_OUT);
      focusedThread.stepOut();
    }
  }

  _toggleBreakpoint(event) {
    return this._executeWithEditorPath(event, (filePath, lineNumber) => {
      this._service.toggleSourceBreakpoint(filePath, lineNumber);
    });
  }

  _toggleBreakpointEnabled(event) {
    this._executeWithEditorPath(event, (filePath, line) => {
      const bp = this._service.getModel().getBreakpointAtLine(filePath, line);

      if (bp != null) {
        this._service.enableOrDisableBreakpoints(!bp.enabled, bp);
      }
    });
  }

  _getLocationOfEvent(event) {
    return (0, (_utils || _load_utils()).getBreakpointEventLocation)(event.target) || this._executeWithEditorPath(event, (path, line) => ({ path, line }));
  }

  _configureBreakpoint(event) {
    const location = this._getLocationOfEvent(event);
    if (location != null) {
      const bp = this._service.getModel().getBreakpointAtLine(location.path, location.line);
      if (bp != null && this._supportsConditionalBreakpoints()) {
        // Open the configuration dialog.
        const container = new (_ReactMountRootElement || _load_ReactMountRootElement()).default();
        _reactDom.default.render(_react.createElement((_BreakpointConfigComponent || _load_BreakpointConfigComponent()).default, {
          breakpoint: bp,
          service: this._service,
          onDismiss: () => {
            _reactDom.default.unmountComponentAtNode(container);
          }
        }), container);
      }
    }
  }

  _executeWithEditorPath(event, fn) {
    const editor = atom.workspace.getActiveTextEditor();
    if (!editor || !editor.getPath()) {
      return null;
    }

    const line = (0, (_utils || _load_utils()).getLineForEvent)(editor, event) + 1;
    return fn((0, (_nullthrows || _load_nullthrows()).default)(editor.getPath()), line);
  }

  _deleteBreakpoint(event) {
    const location = this._getLocationOfEvent(event);
    if (location == null) {
      return;
    }
    const breakpoint = this._service.getModel().getBreakpointAtLine(location.path, location.line);
    if (breakpoint != null) {
      this._service.removeBreakpoints(breakpoint.getId());
    }
  }

  _deleteAllBreakpoints() {
    this._service.removeBreakpoints();
  }

  _enableAllBreakpoints() {
    this._service.enableOrDisableBreakpoints(true);
  }

  _disableAllBreakpoints() {
    this._service.enableOrDisableBreakpoints(false);
  }

  _renderConfigDialog(panel, dialogMode, dialogCloser) {
    if (this._selectedDebugConnection == null) {
      // If no connection is selected yet, default to the local connection.
      this._selectedDebugConnection = 'local';
    }

    if (!(this._selectedDebugConnection != null)) {
      throw new Error('Invariant violation: "this._selectedDebugConnection != null"');
    }

    const options = this._uiModel.getConnections().map(connection => {
      const displayName = (_nuclideUri || _load_nuclideUri()).default.isRemote(connection) ? (_nuclideUri || _load_nuclideUri()).default.getHostname(connection) : 'localhost';
      return {
        value: connection,
        label: displayName
      };
    }).filter(item => item.value != null && item.value !== '').sort((a, b) => a.label.localeCompare(b.label));

    // flowlint-next-line sketchy-null-string:off
    const connection = this._selectedDebugConnection || 'local';

    _reactDom.default.render(_react.createElement((_DebuggerLaunchAttachUI || _load_DebuggerLaunchAttachUI()).default, {
      dialogMode: dialogMode,
      model: this._uiModel,
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
    if (watchExpression != null && watchExpression.length > 0) {
      this._service.addWatchExpression(watchExpression);
    }
  }

  _copyDebuggerExpressionValue(event) {
    const clickedElement = event.target;
    const copyElement = clickedElement.closest('.nuclide-ui-lazy-nested-value');
    if (copyElement != null) {
      atom.clipboard.write(copyElement.textContent);
    }
  }

  _copyDebuggerCallstack(event) {
    const { focusedThread } = this._service.viewModel;
    if (focusedThread != null) {
      let callstackText = '';
      focusedThread.getCallStack().forEach((item, i) => {
        const path = (_nuclideUri || _load_nuclideUri()).default.basename(item.source.uri);
        callstackText += `${i}\t${item.name}\t${path}:${item.range.start.row}${_os.default.EOL}`;
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

  consumeConsole(createConsole) {
    return (0, (_AtomServiceContainer || _load_AtomServiceContainer()).setConsoleService)(createConsole);
  }

  consumeRegisterExecutor(registerExecutor) {
    return (0, (_AtomServiceContainer || _load_AtomServiceContainer()).setConsoleRegisterExecutor)(registerExecutor);
  }

  consumeDebuggerProvider(provider) {
    this._uiModel.addDebuggerProvider(provider);
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
      this._uiModel.removeDebuggerProvider(provider);
    });
  }

  consumeEvaluationExpressionProvider(provider) {
    this._uiModel.addEvaluationExpressionProvider(provider);
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
      this._uiModel.removeEvaluationExpressionProvider(provider);
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
    return new (_RemoteControlService || _load_RemoteControlService()).default(this._service);
  }

  consumeDatatipService(service) {
    const disposable = new (_UniversalDisposable || _load_UniversalDisposable()).default(service.addProvider(this._createDatatipProvider()), (0, (_AtomServiceContainer || _load_AtomServiceContainer()).setDatatipService)(service));
    this._disposables.add(disposable);
    return disposable;
  }

  _createDatatipProvider() {
    return {
      // Eligibility is determined online, based on registered EvaluationExpression providers.
      providerName: DATATIP_PACKAGE_NAME,
      priority: 1,
      datatip: (editor, position) => {
        return (0, (_DebuggerDatatip || _load_DebuggerDatatip()).debuggerDatatip)(this._uiModel.getEvaluationExpressionProviders(), this._service, editor, position);
      }
    };
  }
}

function createDebuggerView(model) {
  let view = null;
  if (model instanceof (_DebuggerPaneViewModel || _load_DebuggerPaneViewModel()).default || model instanceof (_DebuggerPaneContainerViewModel || _load_DebuggerPaneContainerViewModel()).default) {
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