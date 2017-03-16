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

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
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
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _nuclideDebuggerBase;

function _load_nuclideDebuggerBase() {
  return _nuclideDebuggerBase = require('../../nuclide-debugger-base');
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
  return _range = require('../../commons-atom/range');
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
 */

const DATATIP_PACKAGE_NAME = 'nuclide-debugger-datatip';
const NUX_NEW_DEBUGGER_UI_ID = 4377;
const GK_NEW_DEBUGGER_UI_NUX = 'mp_nuclide_new_debugger_ui';
const NUX_NEW_DEBUGGER_UI_NAME = 'nuclide_new_debugger_ui';

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
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('debugger-ui-mounted', {
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
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('debugger-ui-toggled', {
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
    const {
      model
    } = this.props;
    const { showOldView } = this.state;
    return _react.default.createElement(
      'div',
      { className: 'nuclide-debugger-root' },
      _react.default.createElement(
        'div',
        { className: (0, (_classnames || _load_classnames()).default)({ 'nuclide-debugger-container-old-enabled': showOldView }) },
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
  if (!(model instanceof (_DebuggerModel || _load_DebuggerModel()).default)) {
    return;
  }
  const elem = (0, (_renderReactRoot || _load_renderReactRoot()).renderReactRoot)(_react.default.createElement(DebuggerView, { model: model }));
  elem.className = 'nuclide-debugger-container';
  return elem;
}

class Activation {

  constructor(state) {
    this._model = new (_DebuggerModel || _load_DebuggerModel()).default(state);
    this._launchAttachDialog = null;
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
      'nuclide-debugger:step-over': this._stepOver.bind(this)
    }), atom.commands.add('atom-workspace', {
      'nuclide-debugger:step-into': this._stepInto.bind(this)
    }), atom.commands.add('atom-workspace', {
      'nuclide-debugger:step-out': this._stepOut.bind(this)
    }), atom.commands.add('atom-workspace', {
      'nuclide-debugger:toggle-breakpoint': this._toggleBreakpoint.bind(this)
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
      '.nuclide-debugger-expression-value-list .list-item': [{
        label: 'Copy',
        command: 'nuclide-debugger:copy-debugger-expression-value'
      }],
      'atom-text-editor': [{ type: 'separator' }, {
        label: 'Debugger',
        submenu: [{
          label: 'Toggle Breakpoint',
          command: 'nuclide-debugger:toggle-breakpoint'
        }, {
          label: 'Add to Watch',
          command: 'nuclide-debugger:add-to-watch'
        }, {
          label: 'Run to Location',
          command: 'nuclide-debugger:run-to-location'
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
      if (uri === (_DebuggerModel2 || _load_DebuggerModel2()).WORKSPACE_VIEW_URI) {
        return this._model;
      }
    }), () => {
      api.destroyWhere(item => item instanceof (_DebuggerModel || _load_DebuggerModel()).default);
    }, atom.commands.add('atom-workspace', {
      'nuclide-debugger:show': () => {
        api.open((_DebuggerModel2 || _load_DebuggerModel2()).WORKSPACE_VIEW_URI, { searchAllPanes: true });
      }
    }), atom.commands.add('atom-workspace', {
      'nuclide-debugger:hide': () => {
        api.destroyWhere(item => item instanceof (_DebuggerModel || _load_DebuggerModel()).default);
      }
    }));
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
    this._model.getBridge().continue();
  }

  _stop() {
    this._model.getActions().stopDebugging();
  }

  _stepOver() {
    this._model.getBridge().stepOver();
  }

  _stepInto() {
    this._model.getBridge().stepInto();
  }

  _stepOut() {
    this._model.getBridge().stepOut();
  }

  _toggleBreakpoint() {
    return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)('nuclide-debugger-atom:toggleBreakpoint', () => {
      this._executeWithEditorPath((filePath, line) => {
        this._model.getActions().toggleBreakpoint(filePath, line);
      });
    });
  }

  _runToLocation() {
    this._executeWithEditorPath((path, line) => {
      this._model.getBridge().runToLocation(path, line);
    });
  }

  _executeWithEditorPath(fn) {
    const editor = atom.workspace.getActiveTextEditor();
    if (editor && editor.getPath()) {
      const filePath = editor.getPath();
      if (filePath) {
        const line = editor.getLastCursor().getBufferRow();
        fn(filePath, line);
      }
    }
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
    this._emitLaunchAttachVisibilityChangedEvent();
  }

  _hideLaunchAttachDialog() {
    const dialog = this._getLaunchAttachDialog();
    if (dialog.isVisible()) {
      dialog.hide();
    }
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
  service.addProvider(provider);
  const disposable = new _atom.Disposable(() => service.removeProvider(provider));

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