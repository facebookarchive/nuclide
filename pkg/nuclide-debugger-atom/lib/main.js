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
//# sourceMappingURL=data:application/json;base64,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LENBQUMsQ0FBQztBQUM5QixNQUFNLFVBQVUsR0FBRyxxQkFBZTtXQUFNLE9BQU8sQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDO0dBQUEsQ0FBQyxDQUFDO0FBQzFFLDJCQUFVLFVBQVUsQ0FBQyxDQUFDO0FBQ3RCLFlBQVUsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ3hDLFNBQU8sVUFBVSxDQUFDO0NBQ25CIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7XG4gICBudWNsaWRlX2RlYnVnZ2VyJFNlcnZpY2UsXG4gICBOdWNsaWRlRGVidWdnZXJQcm92aWRlcixcbiAgIE51Y2xpZGVFdmFsdWF0aW9uRXhwcmVzc2lvblByb3ZpZGVyLFxufSBmcm9tICcuLi8uLi9udWNsaWRlLWRlYnVnZ2VyLWludGVyZmFjZXMvc2VydmljZSc7XG5pbXBvcnQgdHlwZSB7U2VyaWFsaXplZEJyZWFrcG9pbnR9IGZyb20gJy4vQnJlYWtwb2ludFN0b3JlJztcbmltcG9ydCB0eXBlIHtcbiAgRGF0YXRpcFByb3ZpZGVyLFxuICBEYXRhdGlwU2VydmljZSxcbn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1kYXRhdGlwLWludGVyZmFjZXMnO1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGUsIERpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHt0cmFja1RpbWluZ30gZnJvbSAnLi4vLi4vbnVjbGlkZS1hbmFseXRpY3MnO1xuaW1wb3J0IFJlbW90ZUNvbnRyb2xTZXJ2aWNlIGZyb20gJy4vUmVtb3RlQ29udHJvbFNlcnZpY2UnO1xuaW1wb3J0IERlYnVnZ2VyTW9kZWwgZnJvbSAnLi9EZWJ1Z2dlck1vZGVsJztcbmltcG9ydCB7ZGVidWdnZXJEYXRhdGlwfSBmcm9tICcuL0RlYnVnZ2VyRGF0YXRpcCc7XG5pbXBvcnQge1xuICBSZWFjdCxcbiAgUmVhY3RET00sXG59IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcbmltcG9ydCB7RGVidWdnZXJMYXVuY2hBdHRhY2hVSX0gZnJvbSAnLi9EZWJ1Z2dlckxhdW5jaEF0dGFjaFVJJztcbmltcG9ydCByZW1vdGVVcmkgZnJvbSAnLi4vLi4vbnVjbGlkZS1yZW1vdGUtdXJpJztcbmltcG9ydCB7U2VydmVyQ29ubmVjdGlvbn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1yZW1vdGUtY29ubmVjdGlvbic7XG5pbXBvcnQge3Bhc3Nlc0dLfSBmcm9tICcuLi8uLi9udWNsaWRlLWNvbW1vbnMnO1xuXG5pbXBvcnQgRGVidWdnZXJQcm9jZXNzSW5mbyBmcm9tICcuL0RlYnVnZ2VyUHJvY2Vzc0luZm8nO1xuaW1wb3J0IERlYnVnZ2VySW5zdGFuY2UgZnJvbSAnLi9EZWJ1Z2dlckluc3RhbmNlJztcbmltcG9ydCBEZWJ1Z2dlckxhdW5jaEF0dGFjaFByb3ZpZGVyIGZyb20gJy4vRGVidWdnZXJMYXVuY2hBdHRhY2hQcm92aWRlcic7XG5cbmV4cG9ydCB7XG4gIERlYnVnZ2VyUHJvY2Vzc0luZm8sXG4gIERlYnVnZ2VySW5zdGFuY2UsXG4gIERlYnVnZ2VyTGF1bmNoQXR0YWNoUHJvdmlkZXIsXG59O1xuXG5leHBvcnQgdHlwZSBTZXJpYWxpemVkU3RhdGUgPSB7XG4gIGJyZWFrcG9pbnRzOiA/QXJyYXk8U2VyaWFsaXplZEJyZWFrcG9pbnQ+O1xufTtcblxuY29uc3QgREFUQVRJUF9QQUNLQUdFX05BTUUgPSAnbnVjbGlkZS1kZWJ1Z2dlci1kYXRhdGlwJztcbmNvbnN0IEdLX0RFQlVHR0VSX0xBVU5DSF9BVFRBQ0hfVUkgPSAnbnVjbGlkZV9kZWJ1Z2dlcl9sYXVuY2hfYXR0YWNoX3VpJztcbmNvbnN0IEdLX0RFQlVHR0VSX1VJX1JFVkFNUCA9ICdudWNsaWRlX2RlYnVnZ2VyX3VpX3JldmFtcCc7XG5jb25zdCBHS19USU1FT1VUID0gNTAwMDtcblxuZnVuY3Rpb24gY3JlYXRlRGVidWdnZXJWaWV3KG1vZGVsOiBEZWJ1Z2dlck1vZGVsLCB1c2VSZXZhbXBlZFVpOiBib29sZWFuKTogSFRNTEVsZW1lbnQge1xuICBjb25zdCBEZWJ1Z2dlckNvbnRyb2xsZXJWaWV3ID0gcmVxdWlyZSgnLi9EZWJ1Z2dlckNvbnRyb2xsZXJWaWV3Jyk7XG4gIGNvbnN0IGVsZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgZWxlbS5jbGFzc05hbWUgPSAnbnVjbGlkZS1kZWJ1Z2dlci1jb250YWluZXInO1xuICBSZWFjdERPTS5yZW5kZXIoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLWRlYnVnZ2VyLXJvb3RcIj5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS1kZWJ1Z2dlci1jb250YWluZXItb2xkXCI+XG4gICAgICAgIDxEZWJ1Z2dlckNvbnRyb2xsZXJWaWV3XG4gICAgICAgICAgc3RvcmU9e21vZGVsLmdldFN0b3JlKCl9XG4gICAgICAgICAgYnJpZGdlID0ge21vZGVsLmdldEJyaWRnZSgpfVxuICAgICAgICAgIGFjdGlvbnM9e21vZGVsLmdldEFjdGlvbnMoKX1cbiAgICAgICAgICBicmVha3BvaW50U3RvcmU9e21vZGVsLmdldEJyZWFrcG9pbnRTdG9yZSgpfVxuICAgICAgICAvPlxuICAgICAgPC9kaXY+XG4gICAgICB7dXNlUmV2YW1wZWRVaSA/XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS1kZWJ1Z2dlci1jb250YWluZXItbmV3XCI+XG4gICAgICAgICAgVE9ET1xuICAgICAgICA8L2Rpdj5cbiAgICAgICAgOiBudWxsXG4gICAgICB9XG4gICAgPC9kaXY+LFxuICAgIGVsZW0pO1xuICByZXR1cm4gZWxlbTtcbn1cblxuY2xhc3MgQWN0aXZhdGlvbiB7XG4gIF9kaXNwb3NhYmxlczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX21vZGVsOiBEZWJ1Z2dlck1vZGVsO1xuICBfcGFuZWw6ID9PYmplY3Q7XG4gIF9sYXVuY2hBdHRhY2hEaWFsb2c6ID9hdG9tJFBhbmVsO1xuXG4gIGNvbnN0cnVjdG9yKHN0YXRlOiA/U2VyaWFsaXplZFN0YXRlKSB7XG4gICAgdGhpcy5fbW9kZWwgPSBuZXcgRGVidWdnZXJNb2RlbChzdGF0ZSk7XG4gICAgdGhpcy5fcGFuZWwgPSBudWxsO1xuICAgIHRoaXMuX2xhdW5jaEF0dGFjaERpYWxvZyA9IG51bGw7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZShcbiAgICAgIHRoaXMuX21vZGVsLFxuICAgICAgLy8gTGlzdGVuIGZvciByZW1vdmVkIGNvbm5lY3Rpb25zIGFuZCBraWxsIHRoZSBkZWJ1Z2dlciBpZiBpdCBpcyB1c2luZyB0aGF0IGNvbm5lY3Rpb24uXG4gICAgICBTZXJ2ZXJDb25uZWN0aW9uLm9uRGlkQ2xvc2VTZXJ2ZXJDb25uZWN0aW9uKGNvbm5lY3Rpb24gPT4ge1xuICAgICAgICBjb25zdCBkZWJ1Z2dlclByb2Nlc3MgPSB0aGlzLl9tb2RlbC5nZXRTdG9yZSgpLmdldERlYnVnZ2VySW5zdGFuY2UoKTtcbiAgICAgICAgaWYgKGRlYnVnZ2VyUHJvY2VzcyA9PSBudWxsKSB7XG4gICAgICAgICAgcmV0dXJuOyAvLyBOb3RoaW5nIHRvIGRvIGlmIHdlJ3JlIG5vdCBkZWJ1Z2dpbmcuXG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZGVidWdnZWVUYXJnZXRVcmkgPSBkZWJ1Z2dlclByb2Nlc3MuZ2V0VGFyZ2V0VXJpKCk7XG4gICAgICAgIGlmIChyZW1vdGVVcmkuaXNMb2NhbChkZWJ1Z2dlZVRhcmdldFVyaSkpIHtcbiAgICAgICAgICByZXR1cm47IC8vIE5vdGhpbmcgdG8gZG8gaWYgb3VyIGRlYnVnIHNlc3Npb24gaXMgbG9jYWwuXG4gICAgICAgIH1cbiAgICAgICAgaWYgKHJlbW90ZVVyaS5nZXRIb3N0bmFtZShkZWJ1Z2dlZVRhcmdldFVyaSkgPT09IGNvbm5lY3Rpb24uZ2V0UmVtb3RlSG9zdG5hbWUoKVxuICAgICAgICAgICAgJiYgcmVtb3RlVXJpLmdldFBvcnQoZGVidWdnZWVUYXJnZXRVcmkpID09PSBjb25uZWN0aW9uLmdldFBvcnQoKSkge1xuICAgICAgICAgIHRoaXMuX21vZGVsLmdldEFjdGlvbnMoKS5zdG9wRGVidWdnaW5nKCk7XG4gICAgICAgIH1cbiAgICAgIH0pLFxuXG4gICAgICAvLyBDb21tYW5kcy5cbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsIHtcbiAgICAgICAgJ251Y2xpZGUtZGVidWdnZXI6dG9nZ2xlJzogdGhpcy5fdG9nZ2xlLmJpbmQodGhpcyksXG4gICAgICB9KSxcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsIHtcbiAgICAgICAgJ251Y2xpZGUtZGVidWdnZXI6c2hvdyc6IHRoaXMuX3Nob3cuYmluZCh0aGlzKSxcbiAgICAgIH0pLFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywge1xuICAgICAgICAnbnVjbGlkZS1kZWJ1Z2dlcjpoaWRlJzogdGhpcy5faGlkZS5iaW5kKHRoaXMpLFxuICAgICAgfSksXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS13b3Jrc3BhY2UnLCB7XG4gICAgICAgICdudWNsaWRlLWRlYnVnZ2VyOmNvbnRpbnVlLWRlYnVnZ2luZyc6IHRoaXMuX2NvbnRpbnVlLmJpbmQodGhpcyksXG4gICAgICB9KSxcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsIHtcbiAgICAgICAgJ251Y2xpZGUtZGVidWdnZXI6c3RvcC1kZWJ1Z2dpbmcnOiB0aGlzLl9zdG9wLmJpbmQodGhpcyksXG4gICAgICB9KSxcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsIHtcbiAgICAgICAgJ251Y2xpZGUtZGVidWdnZXI6c3RlcC1vdmVyJzogdGhpcy5fc3RlcE92ZXIuYmluZCh0aGlzKSxcbiAgICAgIH0pLFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywge1xuICAgICAgICAnbnVjbGlkZS1kZWJ1Z2dlcjpzdGVwLWludG8nOiB0aGlzLl9zdGVwSW50by5iaW5kKHRoaXMpLFxuICAgICAgfSksXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS13b3Jrc3BhY2UnLCB7XG4gICAgICAgICdudWNsaWRlLWRlYnVnZ2VyOnN0ZXAtb3V0JzogdGhpcy5fc3RlcE91dC5iaW5kKHRoaXMpLFxuICAgICAgfSksXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS13b3Jrc3BhY2UnLCB7XG4gICAgICAgICdudWNsaWRlLWRlYnVnZ2VyOnRvZ2dsZS1icmVha3BvaW50JzogdGhpcy5fdG9nZ2xlQnJlYWtwb2ludC5iaW5kKHRoaXMpLFxuICAgICAgfSksXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS13b3Jrc3BhY2UnLCB7XG4gICAgICAgICdudWNsaWRlLWRlYnVnZ2VyOnRvZ2dsZS1sYXVuY2gtYXR0YWNoJzogdGhpcy5fdG9nZ2xlTGF1bmNoQXR0YWNoRGlhbG9nLmJpbmQodGhpcyksXG4gICAgICB9KSxcblxuICAgICAgLy8gQ29udGV4dCBNZW51IEl0ZW1zLlxuICAgICAgYXRvbS5jb250ZXh0TWVudS5hZGQoe1xuICAgICAgICAnYXRvbS10ZXh0LWVkaXRvcic6IFtcbiAgICAgICAgICB7dHlwZTogJ3NlcGFyYXRvcid9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIGxhYmVsOiAnRGVidWdnZXInLFxuICAgICAgICAgICAgc3VibWVudTogW1xuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbGFiZWw6ICdUb2dnbGUgQnJlYWtwb2ludCcsXG4gICAgICAgICAgICAgICAgY29tbWFuZDogJ251Y2xpZGUtZGVidWdnZXI6dG9nZ2xlLWJyZWFrcG9pbnQnLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHt0eXBlOiAnc2VwYXJhdG9yJ30sXG4gICAgICAgIF0sXG4gICAgICB9KSxcbiAgICApO1xuICAgICh0aGlzOiBhbnkpLl9oaWRlTGF1bmNoQXR0YWNoRGlhbG9nID0gdGhpcy5faGlkZUxhdW5jaEF0dGFjaERpYWxvZy5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX3NldHVwVmlldygpO1xuICB9XG5cbiAgYXN5bmMgX3NldHVwVmlldygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBsZXQgdXNlUmV2YW1wZWRVaTtcbiAgICB0cnkge1xuICAgICAgdXNlUmV2YW1wZWRVaSA9IGF3YWl0IHBhc3Nlc0dLKEdLX0RFQlVHR0VSX1VJX1JFVkFNUCwgR0tfVElNRU9VVCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdXNlUmV2YW1wZWRVaSA9IGZhbHNlO1xuICAgIH1cbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5hZGQoXG4gICAgICBhdG9tLnZpZXdzLmFkZFZpZXdQcm92aWRlcihcbiAgICAgICAgRGVidWdnZXJNb2RlbCxcbiAgICAgICAgKG1vZGVsOiBEZWJ1Z2dlck1vZGVsKSA9PiBjcmVhdGVEZWJ1Z2dlclZpZXcobW9kZWwsIHVzZVJldmFtcGVkVWkpXG4gICAgICApXG4gICAgKTtcbiAgfVxuXG4gIHNlcmlhbGl6ZSgpOiBTZXJpYWxpemVkU3RhdGUge1xuICAgIGNvbnN0IHN0YXRlID0ge1xuICAgICAgYnJlYWtwb2ludHM6IHRoaXMuZ2V0TW9kZWwoKS5nZXRCcmVha3BvaW50U3RvcmUoKS5nZXRTZXJpYWxpemVkQnJlYWtwb2ludHMoKSxcbiAgICB9O1xuICAgIHJldHVybiBzdGF0ZTtcbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuZGlzcG9zZSgpO1xuICAgIGlmICh0aGlzLl9wYW5lbCkge1xuICAgICAgdGhpcy5fcGFuZWwuZGVzdHJveSgpO1xuICAgIH1cbiAgfVxuXG4gIGdldE1vZGVsKCk6IERlYnVnZ2VyTW9kZWwge1xuICAgIHJldHVybiB0aGlzLl9tb2RlbDtcbiAgfVxuXG4gIGFzeW5jIF90b2dnbGUoKSB7XG4gICAgY29uc3QgcGFzc2VkTmV3VUlHSyA9IGF3YWl0IHBhc3Nlc0dLKEdLX0RFQlVHR0VSX0xBVU5DSF9BVFRBQ0hfVUksIEdLX1RJTUVPVVQpO1xuICAgIGlmIChwYXNzZWROZXdVSUdLKSB7XG4gICAgICB0aGlzLl90b2dnbGVMYXVuY2hBdHRhY2hEaWFsb2coKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgcGFuZWwgPSB0aGlzLl9nZXRQYW5lbCgpO1xuICAgICAgaWYgKHBhbmVsLmlzVmlzaWJsZSgpKSB7XG4gICAgICAgIHBhbmVsLmhpZGUoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBhbmVsLnNob3coKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBfc2hvdygpIHtcbiAgICB0aGlzLl9nZXRQYW5lbCgpLnNob3coKTtcbiAgfVxuXG4gIF9oaWRlKCkge1xuICAgIHRoaXMuX2dldFBhbmVsKCkuaGlkZSgpO1xuICB9XG5cbiAgX2NvbnRpbnVlKCkge1xuICAgIC8vIFRPRE8oamVmZnJleXRhbik6IHdoZW4gd2UgZmlndXJlZCBvdXQgdGhlIGxhdW5jaCBsaWZlY3ljbGUgc3RvcnlcbiAgICAvLyB3ZSBtYXkgYmluZCB0aGlzIHRvIHN0YXJ0LWRlYnVnZ2luZyB0b28uXG4gICAgdGhpcy5fbW9kZWwuZ2V0QnJpZGdlKCkuY29udGludWUoKTtcbiAgfVxuXG4gIF9zdG9wKCkge1xuICAgIHRoaXMuX21vZGVsLmdldEFjdGlvbnMoKS5zdG9wRGVidWdnaW5nKCk7XG4gIH1cblxuICBfc3RlcE92ZXIoKSB7XG4gICAgdGhpcy5fbW9kZWwuZ2V0QnJpZGdlKCkuc3RlcE92ZXIoKTtcbiAgfVxuXG4gIF9zdGVwSW50bygpIHtcbiAgICB0aGlzLl9tb2RlbC5nZXRCcmlkZ2UoKS5zdGVwSW50bygpO1xuICB9XG5cbiAgX3N0ZXBPdXQoKSB7XG4gICAgdGhpcy5fbW9kZWwuZ2V0QnJpZGdlKCkuc3RlcE91dCgpO1xuICB9XG5cbiAgQHRyYWNrVGltaW5nKCdudWNsaWRlLWRlYnVnZ2VyLWF0b206dG9nZ2xlQnJlYWtwb2ludCcpXG4gIF90b2dnbGVCcmVha3BvaW50KCkge1xuICAgIGNvbnN0IGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKTtcbiAgICBpZiAoZWRpdG9yICYmIGVkaXRvci5nZXRQYXRoKCkpIHtcbiAgICAgIGNvbnN0IGZpbGVQYXRoID0gZWRpdG9yLmdldFBhdGgoKTtcbiAgICAgIGlmIChmaWxlUGF0aCkge1xuICAgICAgICBjb25zdCBsaW5lID0gZWRpdG9yLmdldExhc3RDdXJzb3IoKS5nZXRCdWZmZXJSb3coKTtcbiAgICAgICAgdGhpcy5nZXRNb2RlbCgpLmdldEJyZWFrcG9pbnRTdG9yZSgpLnRvZ2dsZUJyZWFrcG9pbnQoZmlsZVBhdGgsIGxpbmUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG5cbiAgX3RvZ2dsZUxhdW5jaEF0dGFjaERpYWxvZygpOiB2b2lkIHtcbiAgICBjb25zdCBkaWFsb2cgPSB0aGlzLl9nZXRMYXVuY2hBdHRhY2hEaWFsb2coKTtcbiAgICBpZiAoZGlhbG9nLmlzVmlzaWJsZSgpKSB7XG4gICAgICBkaWFsb2cuaGlkZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBkaWFsb2cuc2hvdygpO1xuICAgIH1cbiAgfVxuXG4gIF9oaWRlTGF1bmNoQXR0YWNoRGlhbG9nKCk6IHZvaWQge1xuICAgIGNvbnN0IGRpYWxvZyA9IHRoaXMuX2dldExhdW5jaEF0dGFjaERpYWxvZygpO1xuICAgIGlmIChkaWFsb2cuaXNWaXNpYmxlKCkpIHtcbiAgICAgIGRpYWxvZy5oaWRlKCk7XG4gICAgfVxuICB9XG5cbiAgX2dldExhdW5jaEF0dGFjaERpYWxvZygpOiBhdG9tJFBhbmVsIHtcbiAgICBpZiAoIXRoaXMuX2xhdW5jaEF0dGFjaERpYWxvZykge1xuICAgICAgY29uc3QgY29tcG9uZW50ID0gKFxuICAgICAgICA8RGVidWdnZXJMYXVuY2hBdHRhY2hVSVxuICAgICAgICAgIHN0b3JlPXt0aGlzLl9tb2RlbC5nZXREZWJ1Z2dlclByb3ZpZGVyU3RvcmUoKX1cbiAgICAgICAgICBkZWJ1Z2dlckFjdGlvbnM9e3RoaXMuX21vZGVsLmdldEFjdGlvbnMoKX1cbiAgICAgICAgLz5cbiAgICAgICk7XG4gICAgICBjb25zdCBob3N0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICBSZWFjdERPTS5yZW5kZXIoY29tcG9uZW50LCBob3N0KTtcbiAgICAgIHRoaXMuX2xhdW5jaEF0dGFjaERpYWxvZyA9IGF0b20ud29ya3NwYWNlLmFkZE1vZGFsUGFuZWwoe1xuICAgICAgICBpdGVtOiBob3N0LFxuICAgICAgICB2aXNpYmxlOiBmYWxzZSwgLy8gSGlkZSBmaXJzdCBzbyB0aGF0IGNhbGxlciBjYW4gdG9nZ2xlIGl0IHZpc2libGUuXG4gICAgICB9KTtcblxuICAgICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgICBuZXcgRGlzcG9zYWJsZSgoKSA9PiB7XG4gICAgICAgICAgaWYgKHRoaXMuX2xhdW5jaEF0dGFjaERpYWxvZyAhPSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLl9sYXVuY2hBdHRhY2hEaWFsb2cuZGVzdHJveSgpO1xuICAgICAgICAgICAgdGhpcy5fbGF1bmNoQXR0YWNoRGlhbG9nID0gbnVsbDtcbiAgICAgICAgICB9XG4gICAgICAgIH0pLFxuICAgICAgICBhdG9tLmNvbW1hbmRzLmFkZChcbiAgICAgICAgICAnYXRvbS13b3Jrc3BhY2UnLFxuICAgICAgICAgICdjb3JlOmNhbmNlbCcsXG4gICAgICAgICAgdGhpcy5faGlkZUxhdW5jaEF0dGFjaERpYWxvZyxcbiAgICAgICAgKSxcbiAgICAgICk7XG4gICAgfVxuICAgIGludmFyaWFudCh0aGlzLl9sYXVuY2hBdHRhY2hEaWFsb2cpO1xuICAgIHJldHVybiB0aGlzLl9sYXVuY2hBdHRhY2hEaWFsb2c7XG4gIH1cblxuICAvKipcbiAgICogTGF6eSBwYW5lbCBjcmVhdGlvbi5cbiAgICovXG4gIF9nZXRQYW5lbCgpOiBPYmplY3Qge1xuICAgIGlmICghdGhpcy5fcGFuZWwpIHtcbiAgICAgIGNvbnN0IHBhbmVsID0gYXRvbS53b3Jrc3BhY2UuYWRkUmlnaHRQYW5lbCh7XG4gICAgICAgIGl0ZW06IHRoaXMuX21vZGVsLFxuICAgICAgICB2aXNpYmxlOiBmYWxzZSxcbiAgICAgICAgLy8gTW92ZSB0aGlzIGxlZnQgb2YgdGhlIHRvb2xiYXIsIHdoZW4gaXQgaXMgb24gdGhlIHJpZ2h0LlxuICAgICAgICBwcmlvcml0eTogMTUwLFxuICAgICAgfSk7XG4gICAgICAvLyBGbG93IGRvZXNuJ3QgdHJhY2sgbm9uLW51bGwgd2hlbiBhc3NpZ25pbmcgaW50byBudWxsYWJsZSBkaXJlY3RseS5cbiAgICAgIHRoaXMuX3BhbmVsID0gcGFuZWw7XG4gICAgICByZXR1cm4gcGFuZWw7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLl9wYW5lbDtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gY3JlYXRlRGF0YXRpcFByb3ZpZGVyKCk6IERhdGF0aXBQcm92aWRlciB7XG4gIGlmIChkYXRhdGlwUHJvdmlkZXIgPT0gbnVsbCkge1xuICAgIGRhdGF0aXBQcm92aWRlciA9IHtcbiAgICAgIC8vIEVsaWdpYmlsaXR5IGlzIGRldGVybWluZWQgb25saW5lLCBiYXNlZCBvbiByZWdpc3RlcmVkIEV2YWx1YXRpb25FeHByZXNzaW9uIHByb3ZpZGVycy5cbiAgICAgIHZhbGlkRm9yU2NvcGU6IChzY29wZTogc3RyaW5nKSA9PiB0cnVlLFxuICAgICAgcHJvdmlkZXJOYW1lOiBEQVRBVElQX1BBQ0tBR0VfTkFNRSxcbiAgICAgIGluY2x1c2lvblByaW9yaXR5OiAxLFxuICAgICAgZGF0YXRpcDogKGVkaXRvcjogVGV4dEVkaXRvciwgcG9zaXRpb246IGF0b20kUG9pbnQpID0+IHtcbiAgICAgICAgaWYgKGFjdGl2YXRpb24gPT0gbnVsbCkge1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobnVsbCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbW9kZWwgPSBhY3RpdmF0aW9uLmdldE1vZGVsKCk7XG4gICAgICAgIHJldHVybiBkZWJ1Z2dlckRhdGF0aXAobW9kZWwsIGVkaXRvciwgcG9zaXRpb24pO1xuICAgICAgfSxcbiAgICB9O1xuICB9XG4gIHJldHVybiBkYXRhdGlwUHJvdmlkZXI7XG59XG5cbmxldCBhY3RpdmF0aW9uID0gbnVsbDtcbmxldCB0b29sQmFyOiA/YW55ID0gbnVsbDtcbmxldCBkYXRhdGlwUHJvdmlkZXI6ID9EYXRhdGlwUHJvdmlkZXI7XG5cbmV4cG9ydCBmdW5jdGlvbiBhY3RpdmF0ZShzdGF0ZTogP1NlcmlhbGl6ZWRTdGF0ZSk6IHZvaWQge1xuICBpZiAoIWFjdGl2YXRpb24pIHtcbiAgICBhY3RpdmF0aW9uID0gbmV3IEFjdGl2YXRpb24oc3RhdGUpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXJpYWxpemUoKTogU2VyaWFsaXplZFN0YXRlIHtcbiAgaWYgKGFjdGl2YXRpb24pIHtcbiAgICByZXR1cm4gYWN0aXZhdGlvbi5zZXJpYWxpemUoKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4ge1xuICAgICAgYnJlYWtwb2ludHM6IG51bGwsXG4gICAgfTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVhY3RpdmF0ZSgpIHtcbiAgaWYgKGFjdGl2YXRpb24pIHtcbiAgICBhY3RpdmF0aW9uLmRpc3Bvc2UoKTtcbiAgICBhY3RpdmF0aW9uID0gbnVsbDtcbiAgfVxuICBpZiAodG9vbEJhcikge1xuICAgIHRvb2xCYXIucmVtb3ZlSXRlbXMoKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY29uc3VtZU51Y2xpZGVEZWJ1Z2dlcihzZXJ2aWNlOiBudWNsaWRlX2RlYnVnZ2VyJFNlcnZpY2UpOiBEaXNwb3NhYmxlIHtcbiAgaWYgKGFjdGl2YXRpb24pIHtcbiAgICBhY3RpdmF0aW9uLmdldE1vZGVsKCkuZ2V0QWN0aW9ucygpLmFkZFNlcnZpY2Uoc2VydmljZSk7XG4gIH1cbiAgcmV0dXJuIG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICBpZiAoYWN0aXZhdGlvbikge1xuICAgICAgYWN0aXZhdGlvbi5nZXRNb2RlbCgpLmdldEFjdGlvbnMoKS5yZW1vdmVTZXJ2aWNlKHNlcnZpY2UpO1xuICAgIH1cbiAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb25zdW1lRGVidWdnZXJQcm92aWRlcihwcm92aWRlcjogTnVjbGlkZURlYnVnZ2VyUHJvdmlkZXIpOiBJRGlzcG9zYWJsZSB7XG4gIGlmIChhY3RpdmF0aW9uKSB7XG4gICAgYWN0aXZhdGlvbi5nZXRNb2RlbCgpLmdldEFjdGlvbnMoKS5hZGREZWJ1Z2dlclByb3ZpZGVyKHByb3ZpZGVyKTtcbiAgfVxuICByZXR1cm4gbmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgIGlmIChhY3RpdmF0aW9uKSB7XG4gICAgICBhY3RpdmF0aW9uLmdldE1vZGVsKCkuZ2V0QWN0aW9ucygpLnJlbW92ZURlYnVnZ2VyUHJvdmlkZXIocHJvdmlkZXIpO1xuICAgIH1cbiAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb25zdW1lRXZhbHVhdGlvbkV4cHJlc3Npb25Qcm92aWRlcihcbiAgcHJvdmlkZXI6IE51Y2xpZGVFdmFsdWF0aW9uRXhwcmVzc2lvblByb3ZpZGVyLFxuKTogSURpc3Bvc2FibGUge1xuICBpZiAoYWN0aXZhdGlvbikge1xuICAgIGFjdGl2YXRpb24uZ2V0TW9kZWwoKS5nZXRBY3Rpb25zKCkuYWRkRXZhbHVhdGlvbkV4cHJlc3Npb25Qcm92aWRlcihwcm92aWRlcik7XG4gIH1cbiAgcmV0dXJuIG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICBpZiAoYWN0aXZhdGlvbikge1xuICAgICAgYWN0aXZhdGlvbi5nZXRNb2RlbCgpLmdldEFjdGlvbnMoKS5yZW1vdmVFdmFsdWF0aW9uRXhwcmVzc2lvblByb3ZpZGVyKHByb3ZpZGVyKTtcbiAgICB9XG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29uc3VtZVRvb2xCYXIoZ2V0VG9vbEJhcjogKGdyb3VwOiBzdHJpbmcpID0+IE9iamVjdCk6IHZvaWQge1xuICB0b29sQmFyID0gZ2V0VG9vbEJhcignbnVjbGlkZS1kZWJ1Z2dlcicpO1xuICB0b29sQmFyLmFkZEJ1dHRvbih7XG4gICAgaWNvbjogJ3BsdWcnLFxuICAgIGNhbGxiYWNrOiAnbnVjbGlkZS1kZWJ1Z2dlcjp0b2dnbGUnLFxuICAgIHRvb2x0aXA6ICdUb2dnbGUgRGVidWdnZXInLFxuICAgIHByaW9yaXR5OiAxMDAsXG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcHJvdmlkZVJlbW90ZUNvbnRyb2xTZXJ2aWNlKCk6IFJlbW90ZUNvbnRyb2xTZXJ2aWNlIHtcbiAgcmV0dXJuIG5ldyBSZW1vdGVDb250cm9sU2VydmljZSgoKSA9PiBhY3RpdmF0aW9uID8gYWN0aXZhdGlvbi5nZXRNb2RlbCgpIDogbnVsbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVEYXRhdGlwUHJvdmlkZXIoKTogT2JqZWN0IHtcbiAgcmV0dXJuIHtcbiAgICAvLyBFbGlnaWJpbGl0eSBpcyBkZXRlcm1pbmVkIG9ubGluZSwgYmFzZWQgb24gcmVnaXN0ZXJlZCBFdmFsdWF0aW9uRXhwcmVzc2lvbiBwcm92aWRlcnMuXG4gICAgdmFsaWRGb3JTY29wZTogKHNjb3BlOiBzdHJpbmcpID0+IHRydWUsXG4gICAgcHJvdmlkZXJOYW1lOiBEQVRBVElQX1BBQ0tBR0VfTkFNRSxcbiAgICBpbmNsdXNpb25Qcmlvcml0eTogMSxcbiAgICBkYXRhdGlwOiAoZWRpdG9yOiBUZXh0RWRpdG9yLCBwb3NpdGlvbjogYXRvbSRQb2ludCkgPT4ge1xuICAgICAgaWYgKGFjdGl2YXRpb24gPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICAgIGNvbnN0IG1vZGVsID0gYWN0aXZhdGlvbi5nZXRNb2RlbCgpO1xuICAgICAgcmV0dXJuIGRlYnVnZ2VyRGF0YXRpcChtb2RlbCwgZWRpdG9yLCBwb3NpdGlvbik7XG4gICAgfSxcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbnN1bWVEYXRhdGlwU2VydmljZShzZXJ2aWNlOiBEYXRhdGlwU2VydmljZSk6IElEaXNwb3NhYmxlIHtcbiAgY29uc3QgcHJvdmlkZXIgPSBjcmVhdGVEYXRhdGlwUHJvdmlkZXIoKTtcbiAgc2VydmljZS5hZGRQcm92aWRlcihwcm92aWRlcik7XG4gIGNvbnN0IGRpc3Bvc2FibGUgPSBuZXcgRGlzcG9zYWJsZSgoKSA9PiBzZXJ2aWNlLnJlbW92ZVByb3ZpZGVyKHByb3ZpZGVyKSk7XG4gIGludmFyaWFudChhY3RpdmF0aW9uKTtcbiAgYWN0aXZhdGlvbi5fZGlzcG9zYWJsZXMuYWRkKGRpc3Bvc2FibGUpO1xuICByZXR1cm4gZGlzcG9zYWJsZTtcbn1cbiJdfQ==