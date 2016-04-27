Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === 'function') { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError('The decorator for method ' + descriptor.key + ' is of the invalid type ' + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

exports.activate = activate;
exports.serialize = serialize;
exports.deactivate = deactivate;
exports.consumeNuclideDebugger = consumeNuclideDebugger;
exports.consumeDebuggerProvider = consumeDebuggerProvider;
exports.consumeEvaluationExpressionProvider = consumeEvaluationExpressionProvider;
exports.consumeToolBar = consumeToolBar;
exports.provideRemoteControlService = provideRemoteControlService;
exports.createDatatipProvider = createDatatipProvider;
exports.consumeDatatipService = consumeDatatipService;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _atom = require('atom');

var _nuclideAnalytics = require('../../nuclide-analytics');

var _RemoteControlService = require('./RemoteControlService');

var _RemoteControlService2 = _interopRequireDefault(_RemoteControlService);

var _DebuggerModel = require('./DebuggerModel');

var _DebuggerModel2 = _interopRequireDefault(_DebuggerModel);

var _DebuggerDatatip = require('./DebuggerDatatip');

var _reactForAtom = require('react-for-atom');

var _DebuggerLaunchAttachUI = require('./DebuggerLaunchAttachUI');

var _nuclideRemoteUri = require('../../nuclide-remote-uri');

var _nuclideRemoteUri2 = _interopRequireDefault(_nuclideRemoteUri);

var _nuclideRemoteConnection = require('../../nuclide-remote-connection');

var _nuclideCommons = require('../../nuclide-commons');

var _DebuggerProcessInfo = require('./DebuggerProcessInfo');

var _DebuggerProcessInfo2 = _interopRequireDefault(_DebuggerProcessInfo);

var _DebuggerInstance = require('./DebuggerInstance');

var _DebuggerInstance2 = _interopRequireDefault(_DebuggerInstance);

var _DebuggerLaunchAttachProvider = require('./DebuggerLaunchAttachProvider');

var _DebuggerLaunchAttachProvider2 = _interopRequireDefault(_DebuggerLaunchAttachProvider);

exports.DebuggerProcessInfo = _DebuggerProcessInfo2['default'];
exports.DebuggerInstance = _DebuggerInstance2['default'];
exports.DebuggerLaunchAttachProvider = _DebuggerLaunchAttachProvider2['default'];

var DATATIP_PACKAGE_NAME = 'nuclide-debugger-datatip';
var GK_DEBUGGER_LAUNCH_ATTACH_UI = 'nuclide_debugger_launch_attach_ui';
var GK_DEBUGGER_UI_REVAMP = 'nuclide_debugger_ui_revamp';
var GK_TIMEOUT = 5000;

function createDebuggerView(model, useRevampedUi) {
  var DebuggerControllerView = require('./DebuggerControllerView');
  var elem = document.createElement('div');
  elem.className = 'nuclide-debugger-container';
  _reactForAtom.ReactDOM.render(_reactForAtom.React.createElement(
    'div',
    { className: 'nuclide-debugger-root' },
    _reactForAtom.React.createElement(
      'div',
      { className: 'nuclide-debugger-container-old' },
      _reactForAtom.React.createElement(DebuggerControllerView, {
        store: model.getStore(),
        bridge: model.getBridge(),
        actions: model.getActions(),
        breakpointStore: model.getBreakpointStore()
      })
    ),
    useRevampedUi ? _reactForAtom.React.createElement(
      'div',
      { className: 'nuclide-debugger-container-new' },
      'TODO'
    ) : null
  ), elem);
  return elem;
}

var Activation = (function () {
  function Activation(state) {
    var _this = this;

    _classCallCheck(this, Activation);

    this._model = new _DebuggerModel2['default'](state);
    this._panel = null;
    this._launchAttachDialog = null;
    this._disposables = new _atom.CompositeDisposable(this._model,
    // Listen for removed connections and kill the debugger if it is using that connection.
    _nuclideRemoteConnection.ServerConnection.onDidCloseServerConnection(function (connection) {
      var debuggerProcess = _this._model.getStore().getDebuggerInstance();
      if (debuggerProcess == null) {
        return; // Nothing to do if we're not debugging.
      }
      var debuggeeTargetUri = debuggerProcess.getTargetUri();
      if (_nuclideRemoteUri2['default'].isLocal(debuggeeTargetUri)) {
        return; // Nothing to do if our debug session is local.
      }
      if (_nuclideRemoteUri2['default'].getHostname(debuggeeTargetUri) === connection.getRemoteHostname() && _nuclideRemoteUri2['default'].getPort(debuggeeTargetUri) === connection.getPort()) {
        _this._model.getActions().stopDebugging();
      }
    }),

    // Commands.
    atom.commands.add('atom-workspace', {
      'nuclide-debugger:toggle': this._toggle.bind(this)
    }), atom.commands.add('atom-workspace', {
      'nuclide-debugger:show': this._show.bind(this)
    }), atom.commands.add('atom-workspace', {
      'nuclide-debugger:hide': this._hide.bind(this)
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
    }),

    // Context Menu Items.
    atom.contextMenu.add({
      'atom-text-editor': [{ type: 'separator' }, {
        label: 'Debugger',
        submenu: [{
          label: 'Toggle Breakpoint',
          command: 'nuclide-debugger:toggle-breakpoint'
        }]
      }, { type: 'separator' }]
    }));
    this._hideLaunchAttachDialog = this._hideLaunchAttachDialog.bind(this);
    this._setupView();
  }

  _createDecoratedClass(Activation, [{
    key: '_setupView',
    value: _asyncToGenerator(function* () {
      var useRevampedUi = undefined;
      try {
        useRevampedUi = yield (0, _nuclideCommons.passesGK)(GK_DEBUGGER_UI_REVAMP, GK_TIMEOUT);
      } catch (e) {
        useRevampedUi = false;
      }
      this._disposables.add(atom.views.addViewProvider(_DebuggerModel2['default'], function (model) {
        return createDebuggerView(model, useRevampedUi);
      }));
    })
  }, {
    key: 'serialize',
    value: function serialize() {
      var state = {
        breakpoints: this.getModel().getBreakpointStore().getSerializedBreakpoints()
      };
      return state;
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
      if (this._panel) {
        this._panel.destroy();
      }
    }
  }, {
    key: 'getModel',
    value: function getModel() {
      return this._model;
    }
  }, {
    key: '_toggle',
    value: _asyncToGenerator(function* () {
      var passedNewUIGK = yield (0, _nuclideCommons.passesGK)(GK_DEBUGGER_LAUNCH_ATTACH_UI, GK_TIMEOUT);
      if (passedNewUIGK) {
        this._toggleLaunchAttachDialog();
      } else {
        var panel = this._getPanel();
        if (panel.isVisible()) {
          panel.hide();
        } else {
          panel.show();
        }
      }
    })
  }, {
    key: '_show',
    value: function _show() {
      this._getPanel().show();
    }
  }, {
    key: '_hide',
    value: function _hide() {
      this._getPanel().hide();
    }
  }, {
    key: '_continue',
    value: function _continue() {
      // TODO(jeffreytan): when we figured out the launch lifecycle story
      // we may bind this to start-debugging too.
      this._model.getBridge()['continue']();
    }
  }, {
    key: '_stop',
    value: function _stop() {
      this._model.getActions().stopDebugging();
    }
  }, {
    key: '_stepOver',
    value: function _stepOver() {
      this._model.getBridge().stepOver();
    }
  }, {
    key: '_stepInto',
    value: function _stepInto() {
      this._model.getBridge().stepInto();
    }
  }, {
    key: '_stepOut',
    value: function _stepOut() {
      this._model.getBridge().stepOut();
    }
  }, {
    key: '_toggleBreakpoint',
    decorators: [(0, _nuclideAnalytics.trackTiming)('nuclide-debugger-atom:toggleBreakpoint')],
    value: function _toggleBreakpoint() {
      var editor = atom.workspace.getActiveTextEditor();
      if (editor && editor.getPath()) {
        var filePath = editor.getPath();
        if (filePath) {
          var line = editor.getLastCursor().getBufferRow();
          this.getModel().getBreakpointStore().toggleBreakpoint(filePath, line);
        }
      }
    }
  }, {
    key: '_toggleLaunchAttachDialog',
    value: function _toggleLaunchAttachDialog() {
      var dialog = this._getLaunchAttachDialog();
      if (dialog.isVisible()) {
        dialog.hide();
      } else {
        dialog.show();
      }
    }
  }, {
    key: '_hideLaunchAttachDialog',
    value: function _hideLaunchAttachDialog() {
      var dialog = this._getLaunchAttachDialog();
      if (dialog.isVisible()) {
        dialog.hide();
      }
    }
  }, {
    key: '_getLaunchAttachDialog',
    value: function _getLaunchAttachDialog() {
      var _this2 = this;

      if (!this._launchAttachDialog) {
        var component = _reactForAtom.React.createElement(_DebuggerLaunchAttachUI.DebuggerLaunchAttachUI, {
          store: this._model.getDebuggerProviderStore(),
          debuggerActions: this._model.getActions()
        });
        var host = document.createElement('div');
        _reactForAtom.ReactDOM.render(component, host);
        this._launchAttachDialog = atom.workspace.addModalPanel({
          item: host,
          visible: false });

        // Hide first so that caller can toggle it visible.
        this._disposables.add(new _atom.Disposable(function () {
          if (_this2._launchAttachDialog != null) {
            _this2._launchAttachDialog.destroy();
            _this2._launchAttachDialog = null;
          }
        }), atom.commands.add('atom-workspace', 'core:cancel', this._hideLaunchAttachDialog));
      }
      (0, _assert2['default'])(this._launchAttachDialog);
      return this._launchAttachDialog;
    }

    /**
     * Lazy panel creation.
     */
  }, {
    key: '_getPanel',
    value: function _getPanel() {
      if (!this._panel) {
        var panel = atom.workspace.addRightPanel({
          item: this._model,
          visible: false,
          // Move this left of the toolbar, when it is on the right.
          priority: 150
        });
        // Flow doesn't track non-null when assigning into nullable directly.
        this._panel = panel;
        return panel;
      } else {
        return this._panel;
      }
    }
  }]);

  return Activation;
})();

function createDatatipProvider() {
  if (datatipProvider == null) {
    datatipProvider = {
      // Eligibility is determined online, based on registered EvaluationExpression providers.
      validForScope: function validForScope(scope) {
        return true;
      },
      providerName: DATATIP_PACKAGE_NAME,
      inclusionPriority: 1,
      datatip: function datatip(editor, position) {
        if (activation == null) {
          return Promise.resolve(null);
        }
        var model = activation.getModel();
        return (0, _DebuggerDatatip.debuggerDatatip)(model, editor, position);
      }
    };
  }
  return datatipProvider;
}

var activation = null;
var toolBar = null;
var datatipProvider = undefined;

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
  if (toolBar) {
    toolBar.removeItems();
  }
}

function consumeNuclideDebugger(service) {
  if (activation) {
    activation.getModel().getActions().addService(service);
  }
  return new _atom.Disposable(function () {
    if (activation) {
      activation.getModel().getActions().removeService(service);
    }
  });
}

function consumeDebuggerProvider(provider) {
  if (activation) {
    activation.getModel().getActions().addDebuggerProvider(provider);
  }
  return new _atom.Disposable(function () {
    if (activation) {
      activation.getModel().getActions().removeDebuggerProvider(provider);
    }
  });
}

function consumeEvaluationExpressionProvider(provider) {
  if (activation) {
    activation.getModel().getActions().addEvaluationExpressionProvider(provider);
  }
  return new _atom.Disposable(function () {
    if (activation) {
      activation.getModel().getActions().removeEvaluationExpressionProvider(provider);
    }
  });
}

function consumeToolBar(getToolBar) {
  toolBar = getToolBar('nuclide-debugger');
  toolBar.addButton({
    icon: 'plug',
    callback: 'nuclide-debugger:toggle',
    tooltip: 'Toggle Debugger',
    priority: 100
  });
}

function provideRemoteControlService() {
  return new _RemoteControlService2['default'](function () {
    return activation ? activation.getModel() : null;
  });
}

function createDatatipProvider() {
  return {
    // Eligibility is determined online, based on registered EvaluationExpression providers.
    validForScope: function validForScope(scope) {
      return true;
    },
    providerName: DATATIP_PACKAGE_NAME,
    inclusionPriority: 1,
    datatip: function datatip(editor, position) {
      if (activation == null) {
        return null;
      }
      var model = activation.getModel();
      return (0, _DebuggerDatatip.debuggerDatatip)(model, editor, position);
    }
  };
}

function consumeDatatipService(service) {
  var provider = createDatatipProvider();
  service.addProvider(provider);
  var disposable = new _atom.Disposable(function () {
    return service.removeProvider(provider);
  });
  (0, _assert2['default'])(activation);
  activation._disposables.add(disposable);
  return disposable;
}