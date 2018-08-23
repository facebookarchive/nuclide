"use strict";

function _projects() {
  const data = require("../../../../nuclide-commons-atom/projects");

  _projects = function () {
    return data;
  };

  return data;
}

function _BreakpointManager() {
  const data = _interopRequireDefault(require("./BreakpointManager"));

  _BreakpointManager = function () {
    return data;
  };

  return data;
}

function _constants() {
  const data = require("./constants");

  _constants = function () {
    return data;
  };

  return data;
}

function _BreakpointConfigComponent() {
  const data = _interopRequireDefault(require("./ui/BreakpointConfigComponent"));

  _BreakpointConfigComponent = function () {
    return data;
  };

  return data;
}

function _createPackage() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons-atom/createPackage"));

  _createPackage = function () {
    return data;
  };

  return data;
}

function _utils() {
  const data = require("./utils");

  _utils = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _analytics() {
  const data = require("../../../../nuclide-commons/analytics");

  _analytics = function () {
    return data;
  };

  return data;
}

function _RemoteControlService() {
  const data = _interopRequireDefault(require("./RemoteControlService"));

  _RemoteControlService = function () {
    return data;
  };

  return data;
}

function _DebuggerUiModel() {
  const data = _interopRequireDefault(require("./DebuggerUiModel"));

  _DebuggerUiModel = function () {
    return data;
  };

  return data;
}

function _DebugService() {
  const data = _interopRequireDefault(require("./vsp/DebugService"));

  _DebugService = function () {
    return data;
  };

  return data;
}

function _DebuggerDatatip() {
  const data = require("./DebuggerDatatip");

  _DebuggerDatatip = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

function _DebuggerLaunchAttachUI() {
  const data = _interopRequireDefault(require("./ui/DebuggerLaunchAttachUI"));

  _DebuggerLaunchAttachUI = function () {
    return data;
  };

  return data;
}

function _renderReactRoot() {
  const data = require("../../../../nuclide-commons-ui/renderReactRoot");

  _renderReactRoot = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _AtomServiceContainer() {
  const data = require("./AtomServiceContainer");

  _AtomServiceContainer = function () {
    return data;
  };

  return data;
}

function _range() {
  const data = require("../../../../nuclide-commons-atom/range");

  _range = function () {
    return data;
  };

  return data;
}

function _DebuggerLayoutManager() {
  const data = _interopRequireDefault(require("./ui/DebuggerLayoutManager"));

  _DebuggerLayoutManager = function () {
    return data;
  };

  return data;
}

function _DebuggerPaneViewModel() {
  const data = _interopRequireDefault(require("./ui/DebuggerPaneViewModel"));

  _DebuggerPaneViewModel = function () {
    return data;
  };

  return data;
}

function _DebuggerPaneContainerViewModel() {
  const data = _interopRequireDefault(require("./ui/DebuggerPaneContainerViewModel"));

  _DebuggerPaneContainerViewModel = function () {
    return data;
  };

  return data;
}

var _os = _interopRequireDefault(require("os"));

function _nullthrows() {
  const data = _interopRequireDefault(require("nullthrows"));

  _nullthrows = function () {
    return data;
  };

  return data;
}

function _ReactMountRootElement() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons-ui/ReactMountRootElement"));

  _ReactMountRootElement = function () {
    return data;
  };

  return data;
}

function _menuUtils() {
  const data = require("../../../../nuclide-commons/menuUtils");

  _menuUtils = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */
const DATATIP_PACKAGE_NAME = 'debugger-datatip';

class Activation {
  constructor(state) {
    atom.views.addViewProvider(_DebuggerPaneViewModel().default, createDebuggerView);
    atom.views.addViewProvider(_DebuggerPaneContainerViewModel().default, createDebuggerView);
    this._service = new (_DebugService().default)(state);
    this._uiModel = new (_DebuggerUiModel().default)(this._service);
    this._breakpointManager = new (_BreakpointManager().default)(this._service);
    this._selectedDebugConnection = null;
    this._visibleLaunchAttachDialogMode = null;
    this._lauchAttachDialogCloser = null;
    this._connectionProviders = new Map();
    this._layoutManager = new (_DebuggerLayoutManager().default)(this._service, state); // Manually manipulate the `Debugger` top level menu order.

    const insertIndex = atom.menu.template.findIndex(item => item.role === 'window' || item.role === 'help');

    if (insertIndex !== -1) {
      const deuggerIndex = atom.menu.template.findIndex(item => item.label === 'Debugger');
      const menuItem = atom.menu.template.splice(deuggerIndex, 1)[0];
      const newIndex = insertIndex > deuggerIndex ? insertIndex - 1 : insertIndex;
      atom.menu.template.splice(newIndex, 0, menuItem);
      atom.menu.update();
    }

    const removedHostnames = (0, _projects().observeRemovedHostnames)();
    this._disposables = new (_UniversalDisposable().default)(this._layoutManager, this._service, this._uiModel, this._breakpointManager, removedHostnames.subscribe(hostname => {
      this._service.getModel().getProcesses().forEach(debuggerProcess => {
        const debuggeeTargetUri = debuggerProcess.configuration.targetUri;

        if (_nuclideUri().default.isLocal(debuggeeTargetUri)) {
          return; // Nothing to do if our debug session is local.
        }

        if (_nuclideUri().default.getHostname(debuggeeTargetUri) === hostname) {
          this._service.stopProcess(debuggerProcess);
        }
      });
    }), this._uiModel.onConnectionsUpdated(() => {
      const newConnections = this._uiModel.getConnections();

      const keys = Array.from(this._connectionProviders.keys());
      const removedConnections = keys.filter(connection => newConnections.find(item => item === connection) == null);
      const addedConnections = newConnections.filter(connection => keys.find(item => item === connection) == null);

      for (const key of removedConnections) {
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
    }), // Commands.
    atom.commands.add('atom-workspace', {
      'debugger:show-attach-dialog': event => {
        var _ref, _ref2;

        const selectedTabName = (_ref = event) != null ? (_ref = _ref.detail) != null ? _ref.selectedTabName : _ref : _ref;
        const config = (_ref2 = event) != null ? (_ref2 = _ref2.detail) != null ? _ref2.config : _ref2 : _ref2;

        this._showLaunchAttachDialog({
          dialogMode: 'attach',
          selectedTabName,
          config
        });
      }
    }), atom.commands.add('atom-workspace', {
      'debugger:show-launch-dialog': event => {
        var _event$detail, _event$detail2;

        const selectedTabName = event === null || event === void 0 ? void 0 : (_event$detail = event.detail) === null || _event$detail === void 0 ? void 0 : _event$detail.selectedTabName;
        const config = event === null || event === void 0 ? void 0 : (_event$detail2 = event.detail) === null || _event$detail2 === void 0 ? void 0 : _event$detail2.config;

        this._showLaunchAttachDialog({
          dialogMode: 'launch',
          selectedTabName,
          config
        });
      }
    }), atom.commands.add('atom-workspace', {
      'debugger:continue-debugging': this._continue.bind(this)
    }), atom.commands.add('atom-workspace', {
      'debugger:stop-debugging': this._stop.bind(this)
    }), atom.commands.add('atom-workspace', {
      'debugger:restart-debugging': this._restart.bind(this)
    }), atom.commands.add('atom-workspace', {
      'debugger:step-over': this._stepOver.bind(this)
    }), atom.commands.add('atom-workspace', {
      'debugger:step-into': this._stepInto.bind(this)
    }), atom.commands.add('atom-workspace', {
      'debugger:step-out': this._stepOut.bind(this)
    }), atom.commands.add('atom-workspace', {
      // eslint-disable-next-line nuclide-internal/atom-apis
      'debugger:add-breakpoint': this._addBreakpoint.bind(this)
    }), atom.commands.add('atom-workspace', {
      'debugger:toggle-breakpoint': this._toggleBreakpoint.bind(this)
    }), atom.commands.add('atom-workspace', {
      'debugger:toggle-breakpoint-enabled': this._toggleBreakpointEnabled.bind(this)
    }), atom.commands.add('atom-workspace', {
      // eslint-disable-next-line nuclide-internal/atom-apis
      'debugger:edit-breakpoint': this._configureBreakpoint.bind(this)
    }), atom.commands.add('.debugger-thread-list-item', {
      'debugger:terminate-thread': this._terminateThread.bind(this)
    }), atom.commands.add('atom-workspace', {
      'debugger:remove-all-breakpoints': this._deleteAllBreakpoints.bind(this)
    }), atom.commands.add('atom-workspace', {
      'debugger:enable-all-breakpoints': this._enableAllBreakpoints.bind(this)
    }), atom.commands.add('atom-workspace', {
      'debugger:disable-all-breakpoints': this._disableAllBreakpoints.bind(this)
    }), atom.commands.add('atom-workspace', {
      'debugger:remove-breakpoint': this._deleteBreakpoint.bind(this)
    }), atom.commands.add('atom-workspace', {
      // eslint-disable-next-line nuclide-internal/atom-apis
      'debugger:add-to-watch': this._addToWatch.bind(this)
    }), atom.commands.add('atom-workspace', {
      'debugger:run-to-location': this._runToLocation.bind(this)
    }), atom.commands.add('.debugger-expression-value-list', {
      'debugger:copy-debugger-expression-value': this._copyDebuggerExpressionValue.bind(this)
    }), atom.commands.add('atom-workspace', {
      'debugger:copy-debugger-callstack': this._copyDebuggerCallstack.bind(this)
    }), // Context Menu Items.
    atom.contextMenu.add({
      '.debugger-breakpoint-list': [{
        label: 'Enable All Breakpoints',
        command: 'debugger:enable-all-breakpoints'
      }, {
        label: 'Disable All Breakpoints',
        command: 'debugger:disable-all-breakpoints'
      }, {
        label: 'Remove All Breakpoints',
        command: 'debugger:remove-all-breakpoints'
      }, {
        type: 'separator'
      }],
      '.debugger-breakpoint': [{
        label: 'Edit breakpoint...',
        command: 'debugger:edit-breakpoint',
        shouldDisplay: event => {
          const bp = this._getBreakpointFromEvent(event);

          return bp != null && this._supportsConditionalBreakpoints();
        }
      }, {
        label: 'Remove Breakpoint',
        command: 'debugger:remove-breakpoint'
      }, {
        type: 'separator'
      }],
      '.debugger-thread-list-item': [{
        label: 'Terminate thread',
        command: 'debugger:terminate-thread',
        shouldDisplay: event => {
          const target = event.target;

          if (target.dataset.threadid) {
            const threadId = parseInt(target.dataset.threadid, 10);

            if (!Number.isNaN(threadId)) {
              return this._supportsTerminateThreadsRequest();
            }
          }

          return false;
        }
      }],
      '.debugger-callstack-table': [{
        label: 'Copy Callstack',
        command: 'debugger:copy-debugger-callstack'
      }],
      '.debugger-expression-value-list': [{
        label: 'Copy',
        command: 'debugger:copy-debugger-expression-value'
      }],
      'atom-text-editor': [{
        type: 'separator'
      }, {
        label: 'Debugger',
        submenu: [{
          label: 'Toggle Breakpoint',
          command: 'debugger:toggle-breakpoint'
        }, {
          label: 'Toggle Breakpoint enabled/disabled',
          command: 'debugger:toggle-breakpoint-enabled',
          shouldDisplay: event => this._executeWithEditorPath(event, (filePath, line) => this._service.getModel().getBreakpointAtLine(filePath, line) != null) || false
        }, {
          label: 'Edit Breakpoint...',
          command: 'debugger:edit-breakpoint',
          shouldDisplay: event => this._executeWithEditorPath(event, (filePath, line) => {
            const bp = this._service.getModel().getBreakpointAtLine(filePath, line);

            return bp != null && this._supportsConditionalBreakpoints();
          }) || false
        }, {
          label: 'Add to Watch',
          command: 'debugger:add-to-watch',
          shouldDisplay: event => {
            const textEditor = atom.workspace.getActiveTextEditor();

            if (this._service.getDebuggerMode() === _constants().DebuggerMode.STOPPED || textEditor == null) {
              return false;
            }

            return textEditor.getSelections().length === 1 && !textEditor.getSelectedBufferRange().isEmpty();
          }
        }, {
          label: 'Run to Location',
          command: 'debugger:run-to-location',
          shouldDisplay: event => this._service.getDebuggerMode() === _constants().DebuggerMode.PAUSED
        }]
      }, {
        type: 'separator'
      }]
    }), this._registerCommandsContextMenuAndOpener());
    (0, _menuUtils().sortMenuGroups)(['Debugger']);
  }

  _supportsConditionalBreakpoints() {
    // If currently debugging, return whether or not the current debugger supports this.
    const {
      focusedProcess
    } = this._service.viewModel;

    if (focusedProcess == null) {
      // If not currently debugging, return if any of the debuggers that support
      // the file extension this bp is in support conditions.
      // TODO(ericblue): have providers register their file extensions and filter correctly here.
      return true;
    } else {
      return Boolean(focusedProcess.session.capabilities.supportsConditionalBreakpoints);
    }
  }

  _supportsTerminateThreadsRequest() {
    // If currently debugging, return whether or not the current debugger supports this.
    const {
      focusedProcess
    } = this._service.viewModel;

    if (focusedProcess == null) {
      return false;
    } else {
      return Boolean(focusedProcess.session.capabilities.supportsTerminateThreadsRequest);
    }
  }

  _setProvidersForConnection(connection) {
    const key = _nuclideUri().default.isRemote(connection) ? _nuclideUri().default.getHostname(connection) : 'local';

    const availableProviders = this._uiModel.getLaunchAttachProvidersForConnection(connection);

    this._connectionProviders.set(key, availableProviders);
  }

  async _getSuggestions(request) {
    let text = request.editor.getText();
    const lines = text.split('\n');
    const {
      row
    } = request.bufferPosition; // Only keep the lines up to and including the buffer position row.

    text = lines.slice(0, row + 1).join('\n');
    const {
      focusedStackFrame,
      focusedProcess
    } = this._service.viewModel;

    if (focusedProcess == null || focusedStackFrame == null) {
      return [];
    } else if (!Boolean(focusedProcess.session.capabilities.supportsCompletionsRequest)) {
      const scopes = await focusedStackFrame.getScopes();
      return scopes.map(scope => ({
        text: scope.name,
        type: 'variable'
      }));
    } else {
      const completions = await focusedProcess.completions(focusedStackFrame.frameId, text, request.bufferPosition, 0);
      return completions.map(item => ({
        displayText: item.label,
        text: item.text == null ? item.label : item.text,
        type: item.type
      }));
    }
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

  consumeGatekeeperService(service) {
    const disposable = this._layoutManager.consumeGatekeeperService(service);

    disposable.add(this._service.consumeGatekeeperService(service));
    return disposable;
  }

  _registerCommandsContextMenuAndOpener() {
    const disposable = new (_UniversalDisposable().default)(atom.workspace.addOpener(uri => {
      return this._layoutManager.getModelForDebuggerUri(uri);
    }), () => {
      this._layoutManager.hideDebuggerViews(false);
    }, atom.commands.add('atom-workspace', {
      'debugger:show': event => {
        const detail = event.detail;
        const show = detail == null || Boolean(detail.showOnlyIfHidden) === false || !this._layoutManager.isDebuggerVisible();

        if (show) {
          this._layoutManager.showDebuggerViews();
        }
      }
    }), atom.commands.add('atom-workspace', {
      'debugger:hide': () => {
        this._layoutManager.hideDebuggerViews(false);

        for (const process of this._service.getModel().getProcesses()) {
          this._service.stopProcess(process);
        }
      }
    }), atom.commands.add('atom-workspace', 'debugger:toggle', () => {
      if (this._layoutManager.isDebuggerVisible() === true) {
        atom.commands.dispatch(atom.views.getView(atom.workspace), 'debugger:hide');
      } else {
        atom.commands.dispatch(atom.views.getView(atom.workspace), 'debugger:show');
      }
    }), this._service.onDidChangeProcessMode(() => this._layoutManager.debuggerModeChanged()), this._service.viewModel.onDidChangeDebuggerFocus(() => this._layoutManager.debuggerModeChanged()), atom.commands.add('atom-workspace', {
      'debugger:reset-layout': () => {
        this._layoutManager.resetLayout();
      }
    }), atom.contextMenu.add({
      '.debugger-container': [{
        label: 'Debugger Views',
        submenu: [{
          label: 'Reset Layout',
          command: 'debugger:reset-layout'
        }]
      }]
    }));
    return disposable;
  }

  _continue() {
    const {
      focusedThread
    } = this._service.viewModel;

    if (focusedThread != null) {
      (0, _analytics().track)(_constants().AnalyticsEvents.DEBUGGER_STEP_CONTINUE);
      focusedThread.continue();
    }
  }

  _stop() {
    const {
      focusedProcess
    } = this._service.viewModel;

    if (focusedProcess) {
      this._service.stopProcess(focusedProcess);
    }
  }

  _restart() {
    const {
      focusedProcess
    } = this._service.viewModel;

    if (focusedProcess) {
      this._service.restartProcess(focusedProcess);
    }
  }

  _stepOver() {
    const {
      focusedThread
    } = this._service.viewModel;

    if (focusedThread != null) {
      (0, _analytics().track)(_constants().AnalyticsEvents.DEBUGGER_STEP_OVER);
      focusedThread.next();
    }
  }

  _stepInto() {
    const {
      focusedThread
    } = this._service.viewModel;

    if (focusedThread != null) {
      (0, _analytics().track)(_constants().AnalyticsEvents.DEBUGGER_STEP_INTO);
      focusedThread.stepIn();
    }
  }

  _stepOut() {
    const {
      focusedThread
    } = this._service.viewModel;

    if (focusedThread != null) {
      (0, _analytics().track)(_constants().AnalyticsEvents.DEBUGGER_STEP_OUT);
      focusedThread.stepOut();
    }
  }

  _addBreakpoint(event) {
    return this._executeWithEditorPath(event, (filePath, lineNumber) => {
      this._service.addSourceBreakpoint(filePath, lineNumber);
    });
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

  _getBreakpointFromEvent(event) {
    const target = event.target;
    let bp = null;

    if (target != null && target.dataset != null) {
      if (target.dataset.bpId != null) {
        const bpId = target.dataset.bpId;
        bp = this._service.getModel().getBreakpointById(bpId);
      }

      if (bp == null) {
        const path = target.dataset.path;
        const line = parseInt(target.dataset.line, 10);

        if (path != null && line != null) {
          bp = this._service.getModel().getBreakpointAtLine(path, line);
        }
      }
    }

    return bp;
  }

  _configureBreakpoint(event) {
    const bp = this._getBreakpointFromEvent(event);

    if (bp != null && this._supportsConditionalBreakpoints()) {
      // Open the configuration dialog.
      const container = new (_ReactMountRootElement().default)();

      _reactDom.default.render(React.createElement(_BreakpointConfigComponent().default, {
        breakpoint: bp,
        service: this._service,
        onDismiss: () => {
          _reactDom.default.unmountComponentAtNode(container);
        }
      }), container);
    }
  }

  _terminateThread(event) {
    const target = event.target;

    if (target.dataset.threadid) {
      const threadId = parseInt(target.dataset.threadid, 10);

      if (!Number.isNaN(threadId) && this._supportsTerminateThreadsRequest()) {
        this._service.terminateThreads([threadId]);
      }
    }
  }

  _executeWithEditorPath(event, fn) {
    const editor = atom.workspace.getActiveTextEditor();

    if (!editor || !editor.getPath()) {
      return null;
    }

    const line = (0, _utils().getLineForEvent)(editor, event) + 1;
    return fn((0, _nullthrows().default)(editor.getPath()), line);
  }

  _deleteBreakpoint(event) {
    const breakpoint = this._getBreakpointFromEvent(event);

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

  _renderConfigDialog(panel, args, dialogCloser) {
    if (this._selectedDebugConnection == null) {
      // If no connection is selected yet, default to the local connection.
      this._selectedDebugConnection = 'local';
    }

    if (!(this._selectedDebugConnection != null)) {
      throw new Error("Invariant violation: \"this._selectedDebugConnection != null\"");
    }

    const options = this._uiModel.getConnections().map(connection => {
      const displayName = _nuclideUri().default.isRemote(connection) ? _nuclideUri().default.getHostname(connection) : 'localhost';
      return {
        value: connection,
        label: displayName
      };
    }).filter(item => item.value != null && item.value !== '').sort((a, b) => a.label.localeCompare(b.label)); // flowlint-next-line sketchy-null-string:off


    const connection = this._selectedDebugConnection || 'local';

    _reactDom.default.render(React.createElement(_DebuggerLaunchAttachUI().default, {
      dialogMode: args.dialogMode,
      initialSelectedTabName: args.selectedTabName,
      initialProviderConfig: args.config,
      connectionChanged: newValue => {
        this._selectedDebugConnection = newValue;

        this._renderConfigDialog(panel, {
          dialogMode: args.dialogMode
        }, dialogCloser);
      },
      connection: connection,
      connectionOptions: options,
      dialogCloser: dialogCloser,
      providers: this._connectionProviders
    }), panel.getItem());
  }

  _showLaunchAttachDialog(args) {
    const {
      dialogMode
    } = args;

    if (this._visibleLaunchAttachDialogMode != null && this._visibleLaunchAttachDialogMode !== dialogMode) {
      // If the dialog is already visible, but isn't the correct mode, close it before
      // re-opening the correct mode.
      if (!(this._lauchAttachDialogCloser != null)) {
        throw new Error("Invariant violation: \"this._lauchAttachDialogCloser != null\"");
      }

      this._lauchAttachDialogCloser();
    }

    const disposables = new (_UniversalDisposable().default)();
    const hostEl = document.createElement('div');
    const pane = atom.workspace.addModalPanel({
      item: hostEl,
      className: 'debugger-config-dialog'
    });
    const parentEl = hostEl.parentElement;
    parentEl.style.maxWidth = '100em'; // Function callback that closes the dialog and frees all of its resources.

    this._renderConfigDialog(pane, args, () => disposables.dispose());

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
      (0, _analytics().track)(_constants().AnalyticsEvents.DEBUGGER_TOGGLE_ATTACH_DIALOG, {
        visible: false,
        dialogMode
      });

      _reactDom.default.unmountComponentAtNode(hostEl);

      pane.destroy();
    });
    (0, _analytics().track)(_constants().AnalyticsEvents.DEBUGGER_TOGGLE_ATTACH_DIALOG, {
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

    const selectedText = editor.getTextInBufferRange((0, _range().trimRange)(editor, editor.getSelectedBufferRange()));
    const expr = (0, _range().wordAtPosition)(editor, editor.getCursorBufferPosition());
    const watchExpression = selectedText || expr && expr.wordMatch[0];

    if (watchExpression != null && watchExpression.length > 0) {
      this._service.addWatchExpression(watchExpression);
    }
  }

  _runToLocation(event) {
    this._executeWithEditorPath(event, (path, line) => {
      this._service.runToLocation(path, line);
    });
  }

  _copyDebuggerExpressionValue(event) {
    const clickedElement = event.target;
    const copyElement = clickedElement.closest('.nuclide-ui-lazy-nested-value');

    if (copyElement != null) {
      atom.clipboard.write(copyElement.textContent);
    }
  }

  _copyDebuggerCallstack(event) {
    const {
      focusedThread
    } = this._service.viewModel;

    if (focusedThread != null) {
      let callstackText = '';
      focusedThread.getFullCallStack().filter(expectedStack => !expectedStack.isPending).take(1).subscribe(expectedStack => {
        expectedStack.getOrDefault([]).forEach((item, i) => {
          const path = _nuclideUri().default.basename(item.source.uri);

          callstackText += `${i}\t${item.name}\t${path}:${item.range.start.row}${_os.default.EOL}`;
        });
        atom.clipboard.write(callstackText.trim());
      });
    }
  }

  consumeCurrentWorkingDirectory(cwdApi) {
    const updateSelectedConnection = directory => {
      this._selectedDebugConnection = directory;

      if (this._selectedDebugConnection != null) {
        const conn = this._selectedDebugConnection;

        if (_nuclideUri().default.isRemote(conn)) {
          // Use root instead of current directory as launch point for debugger.
          this._selectedDebugConnection = _nuclideUri().default.createRemoteUri(_nuclideUri().default.getHostname(conn), '/');
        } else {
          // Use null instead of local path to use local debugger downstream.
          this._selectedDebugConnection = null;
        }
      }
    };

    const disposable = cwdApi.observeCwd(updateSelectedConnection);

    this._disposables.add(disposable);

    return new (_UniversalDisposable().default)(() => {
      disposable.dispose();

      this._disposables.remove(disposable);
    });
  }

  createAutocompleteProvider() {
    return {
      labels: ['nuclide-console'],
      selector: '*',
      filterSuggestions: true,
      getSuggestions: this._getSuggestions.bind(this)
    };
  }

  consumeConsole(createConsole) {
    return (0, _AtomServiceContainer().setConsoleService)(createConsole);
  }

  consumeTerminal(terminalApi) {
    return (0, _AtomServiceContainer().setTerminalService)(terminalApi);
  }

  consumeRpcService(rpcService) {
    return (0, _AtomServiceContainer().setRpcService)(rpcService);
  }

  consumeRegisterExecutor(registerExecutor) {
    return (0, _AtomServiceContainer().setConsoleRegisterExecutor)(registerExecutor);
  }

  consumeDebuggerProvider(provider) {
    this._uiModel.addDebuggerProvider(provider);

    return new (_UniversalDisposable().default)(() => {
      this._uiModel.removeDebuggerProvider(provider);
    });
  }

  consumeDebuggerConfigurationProviders(providers) {
    if (!Array.isArray(providers)) {
      throw new Error("Invariant violation: \"Array.isArray(providers)\"");
    }

    const disposable = new (_UniversalDisposable().default)();
    providers.forEach(provider => disposable.add((0, _AtomServiceContainer().addDebugConfigurationProvider)(provider)));
    return disposable;
  }

  consumeToolBar(getToolBar) {
    const toolBar = getToolBar('debugger');
    toolBar.addButton({
      iconset: 'icon-nuclicon',
      icon: 'debugger',
      callback: 'debugger:show-attach-dialog',
      tooltip: 'Attach Debugger',
      priority: 500
    }).element;
    const disposable = new (_UniversalDisposable().default)(() => {
      toolBar.removeItems();
    });

    this._disposables.add(disposable);

    return disposable;
  }

  consumeNotifications(raiseNativeNotification) {
    (0, _AtomServiceContainer().setNotificationService)(raiseNativeNotification);
  }

  provideRemoteControlService() {
    return new (_RemoteControlService().default)(this._service);
  }

  consumeDatatipService(service) {
    const disposable = new (_UniversalDisposable().default)(service.addProvider(this._createDatatipProvider()), (0, _AtomServiceContainer().setDatatipService)(service));

    this._disposables.add(disposable);

    return disposable;
  }

  _createDatatipProvider() {
    return {
      // Eligibility is determined online, based on registered EvaluationExpression providers.
      providerName: DATATIP_PACKAGE_NAME,
      priority: 1,
      datatip: (editor, position) => {
        return (0, _DebuggerDatatip().debuggerDatatip)(this._service, editor, position);
      }
    };
  }

}

function createDebuggerView(model) {
  let view = null;

  if (model instanceof _DebuggerPaneViewModel().default || model instanceof _DebuggerPaneContainerViewModel().default) {
    view = model.createView();
  }

  if (view != null) {
    const elem = (0, _renderReactRoot().renderReactRoot)(view);
    elem.className = 'debugger-container';
    return elem;
  }

  return null;
}

(0, _createPackage().default)(module.exports, Activation);