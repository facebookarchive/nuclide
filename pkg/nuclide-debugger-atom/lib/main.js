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

var _nuclideDebuggerCommonLibUtils = require('../../nuclide-debugger-common/lib/utils');

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
var GK_TIMEOUT = 1000;

function createDebuggerView(model) {
  var DebuggerControllerView = require('./DebuggerControllerView');
  var elem = document.createElement('div');
  elem.className = 'nuclide-debugger-root';
  _reactForAtom.ReactDOM.render(_reactForAtom.React.createElement(DebuggerControllerView, {
    store: model.getStore(),
    bridge: model.getBridge(),
    actions: model.getActions(),
    breakpointStore: model.getBreakpointStore()
  }), elem);
  return elem;
}

var Activation = (function () {
  function Activation(state) {
    var _this = this;

    _classCallCheck(this, Activation);

    this._model = new _DebuggerModel2['default'](state);
    this._panel = null;
    this._launchAttachDialog = null;
    this._disposables = new _atom.CompositeDisposable(this._model, atom.views.addViewProvider(_DebuggerModel2['default'], createDebuggerView),

    // Listen for removed connections and kill the debugger if it is using that connection.
    _nuclideRemoteConnection.ServerConnection.onDidCloseServerConnection(function (connection) {
      var debuggerProcess = _this._model.getStore().getDebuggerProcess();
      if (debuggerProcess == null) {
        return; // Nothing to do if we're not debugging.
      }
      var debuggeeTargetUri = debuggerProcess.getTargetUri();
      if (_nuclideRemoteUri2['default'].isLocal(debuggeeTargetUri)) {
        return; // Nothing to do if our debug session is local.
      }
      if (_nuclideRemoteUri2['default'].getHostname(debuggeeTargetUri) === connection.getRemoteHostname() && _nuclideRemoteUri2['default'].getPort(debuggeeTargetUri) === connection.getPort()) {
        _this._model.getActions().killDebugger();
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
  }

  _createDecoratedClass(Activation, [{
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
      var passedNewUIGK = yield (0, _nuclideDebuggerCommonLibUtils.passesGK)(GK_DEBUGGER_LAUNCH_ATTACH_UI, GK_TIMEOUT);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztzQkFzQnNCLFFBQVE7Ozs7b0JBQ2dCLE1BQU07O2dDQUMxQix5QkFBeUI7O29DQUNsQix3QkFBd0I7Ozs7NkJBQy9CLGlCQUFpQjs7OzsrQkFDYixtQkFBbUI7OzRCQUkxQyxnQkFBZ0I7O3NDQUNjLDBCQUEwQjs7Z0NBQ3pDLDBCQUEwQjs7Ozt1Q0FDakIsaUNBQWlDOzs2Q0FDekMseUNBQXlDOzttQ0FFaEMsdUJBQXVCOzs7O2dDQUMxQixvQkFBb0I7Ozs7NENBQ1IsZ0NBQWdDOzs7O1FBR3ZFLG1CQUFtQjtRQUNuQixnQkFBZ0I7UUFDaEIsNEJBQTRCOztBQU85QixJQUFNLG9CQUFvQixHQUFHLDBCQUEwQixDQUFDO0FBQ3hELElBQU0sNEJBQTRCLEdBQUcsbUNBQW1DLENBQUM7QUFDekUsSUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDOztBQUV4QixTQUFTLGtCQUFrQixDQUFDLEtBQW9CLEVBQWU7QUFDN0QsTUFBTSxzQkFBc0IsR0FBRyxPQUFPLENBQUMsMEJBQTBCLENBQUMsQ0FBQztBQUNuRSxNQUFNLElBQUksR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzNDLE1BQUksQ0FBQyxTQUFTLEdBQUcsdUJBQXVCLENBQUM7QUFDekMseUJBQVMsTUFBTSxDQUNiLGtDQUFDLHNCQUFzQjtBQUNyQixTQUFLLEVBQUUsS0FBSyxDQUFDLFFBQVEsRUFBRSxBQUFDO0FBQ3hCLFVBQU0sRUFBSSxLQUFLLENBQUMsU0FBUyxFQUFFLEFBQUM7QUFDNUIsV0FBTyxFQUFFLEtBQUssQ0FBQyxVQUFVLEVBQUUsQUFBQztBQUM1QixtQkFBZSxFQUFFLEtBQUssQ0FBQyxrQkFBa0IsRUFBRSxBQUFDO0lBQzVDLEVBQ0YsSUFBSSxDQUFDLENBQUM7QUFDUixTQUFPLElBQUksQ0FBQztDQUNiOztJQUVLLFVBQVU7QUFNSCxXQU5QLFVBQVUsQ0FNRixLQUF1QixFQUFFOzs7MEJBTmpDLFVBQVU7O0FBT1osUUFBSSxDQUFDLE1BQU0sR0FBRywrQkFBa0IsS0FBSyxDQUFDLENBQUM7QUFDdkMsUUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7QUFDbkIsUUFBSSxDQUFDLG1CQUFtQixHQUFHLElBQUksQ0FBQztBQUNoQyxRQUFJLENBQUMsWUFBWSxHQUFHLDhCQUNsQixJQUFJLENBQUMsTUFBTSxFQUNYLElBQUksQ0FBQyxLQUFLLENBQUMsZUFBZSw2QkFBZ0Isa0JBQWtCLENBQUM7OztBQUc3RCw4Q0FBaUIsMEJBQTBCLENBQUMsVUFBQSxVQUFVLEVBQUk7QUFDeEQsVUFBTSxlQUFlLEdBQUcsTUFBSyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztBQUNwRSxVQUFJLGVBQWUsSUFBSSxJQUFJLEVBQUU7QUFDM0IsZUFBTztPQUNSO0FBQ0QsVUFBTSxpQkFBaUIsR0FBRyxlQUFlLENBQUMsWUFBWSxFQUFFLENBQUM7QUFDekQsVUFBSSw4QkFBVSxPQUFPLENBQUMsaUJBQWlCLENBQUMsRUFBRTtBQUN4QyxlQUFPO09BQ1I7QUFDRCxVQUFJLDhCQUFVLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLFVBQVUsQ0FBQyxpQkFBaUIsRUFBRSxJQUN4RSw4QkFBVSxPQUFPLENBQUMsaUJBQWlCLENBQUMsS0FBSyxVQUFVLENBQUMsT0FBTyxFQUFFLEVBQUU7QUFDcEUsY0FBSyxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUMsWUFBWSxFQUFFLENBQUM7T0FDekM7S0FDRixDQUFDOzs7QUFHRixRQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRTtBQUNsQywrQkFBeUIsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7S0FDbkQsQ0FBQyxFQUNGLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFO0FBQ2xDLDZCQUF1QixFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztLQUMvQyxDQUFDLEVBQ0YsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUU7QUFDbEMsNkJBQXVCLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO0tBQy9DLENBQUMsRUFDRixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRTtBQUNsQywyQ0FBcUMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7S0FDakUsQ0FBQyxFQUNGLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFO0FBQ2xDLHVDQUFpQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztLQUN6RCxDQUFDLEVBQ0YsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUU7QUFDbEMsa0NBQTRCLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO0tBQ3hELENBQUMsRUFDRixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRTtBQUNsQyxrQ0FBNEIsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7S0FDeEQsQ0FBQyxFQUNGLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFO0FBQ2xDLGlDQUEyQixFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztLQUN0RCxDQUFDLEVBQ0YsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUU7QUFDbEMsMENBQW9DLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7S0FDeEUsQ0FBQyxFQUNGLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFO0FBQ2xDLDZDQUF1QyxFQUFFLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO0tBQ25GLENBQUM7OztBQUdGLFFBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDO0FBQ25CLHdCQUFrQixFQUFFLENBQ2xCLEVBQUMsSUFBSSxFQUFFLFdBQVcsRUFBQyxFQUNuQjtBQUNFLGFBQUssRUFBRSxVQUFVO0FBQ2pCLGVBQU8sRUFBRSxDQUNQO0FBQ0UsZUFBSyxFQUFFLG1CQUFtQjtBQUMxQixpQkFBTyxFQUFFLG9DQUFvQztTQUM5QyxDQUNGO09BQ0YsRUFDRCxFQUFDLElBQUksRUFBRSxXQUFXLEVBQUMsQ0FDcEI7S0FDRixDQUFDLENBQ0gsQ0FBQztBQUNGLEFBQUMsUUFBSSxDQUFPLHVCQUF1QixHQUFHLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7R0FDL0U7O3dCQWhGRyxVQUFVOztXQWtGTCxxQkFBb0I7QUFDM0IsVUFBTSxLQUFLLEdBQUc7QUFDWixtQkFBVyxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLHdCQUF3QixFQUFFO09BQzdFLENBQUM7QUFDRixhQUFPLEtBQUssQ0FBQztLQUNkOzs7V0FFTSxtQkFBRztBQUNSLFVBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDNUIsVUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO0FBQ2YsWUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztPQUN2QjtLQUNGOzs7V0FFTyxvQkFBa0I7QUFDeEIsYUFBTyxJQUFJLENBQUMsTUFBTSxDQUFDO0tBQ3BCOzs7NkJBRVksYUFBRztBQUNkLFVBQU0sYUFBYSxHQUFHLE1BQU0sNkNBQVMsNEJBQTRCLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFDL0UsVUFBSSxhQUFhLEVBQUU7QUFDakIsWUFBSSxDQUFDLHlCQUF5QixFQUFFLENBQUM7T0FDbEMsTUFBTTtBQUNMLFlBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUMvQixZQUFJLEtBQUssQ0FBQyxTQUFTLEVBQUUsRUFBRTtBQUNyQixlQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7U0FDZCxNQUFNO0FBQ0wsZUFBSyxDQUFDLElBQUksRUFBRSxDQUFDO1NBQ2Q7T0FDRjtLQUNGOzs7V0FFSSxpQkFBRztBQUNOLFVBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztLQUN6Qjs7O1dBRUksaUJBQUc7QUFDTixVQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7S0FDekI7OztXQUVRLHFCQUFHOzs7QUFHVixVQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxZQUFTLEVBQUUsQ0FBQztLQUNwQzs7O1dBRUksaUJBQUc7QUFDTixVQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDLGFBQWEsRUFBRSxDQUFDO0tBQzFDOzs7V0FFUSxxQkFBRztBQUNWLFVBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUM7S0FDcEM7OztXQUVRLHFCQUFHO0FBQ1YsVUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQztLQUNwQzs7O1dBRU8sb0JBQUc7QUFDVCxVQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQ25DOzs7aUJBRUEsbUNBQVksd0NBQXdDLENBQUM7V0FDckMsNkJBQUc7QUFDbEIsVUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO0FBQ3BELFVBQUksTUFBTSxJQUFJLE1BQU0sQ0FBQyxPQUFPLEVBQUUsRUFBRTtBQUM5QixZQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDbEMsWUFBSSxRQUFRLEVBQUU7QUFDWixjQUFNLElBQUksR0FBRyxNQUFNLENBQUMsYUFBYSxFQUFFLENBQUMsWUFBWSxFQUFFLENBQUM7QUFDbkQsY0FBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLGtCQUFrQixFQUFFLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQ3ZFO09BQ0Y7S0FDRjs7O1dBR3dCLHFDQUFTO0FBQ2hDLFVBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO0FBQzdDLFVBQUksTUFBTSxDQUFDLFNBQVMsRUFBRSxFQUFFO0FBQ3RCLGNBQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztPQUNmLE1BQU07QUFDTCxjQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7T0FDZjtLQUNGOzs7V0FFc0IsbUNBQVM7QUFDOUIsVUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUM7QUFDN0MsVUFBSSxNQUFNLENBQUMsU0FBUyxFQUFFLEVBQUU7QUFDdEIsY0FBTSxDQUFDLElBQUksRUFBRSxDQUFDO09BQ2Y7S0FDRjs7O1dBRXFCLGtDQUFlOzs7QUFDbkMsVUFBSSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsRUFBRTtBQUM3QixZQUFNLFNBQVMsR0FDYjtBQUNFLGVBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLHdCQUF3QixFQUFFLEFBQUM7QUFDOUMseUJBQWUsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxBQUFDO1VBQzFDLEFBQ0gsQ0FBQztBQUNGLFlBQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDM0MsK0JBQVMsTUFBTSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNqQyxZQUFJLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUM7QUFDdEQsY0FBSSxFQUFFLElBQUk7QUFDVixpQkFBTyxFQUFFLEtBQUssRUFDZixDQUFDLENBQUM7OztBQUVILFlBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUNuQixxQkFBZSxZQUFNO0FBQ25CLGNBQUksT0FBSyxtQkFBbUIsSUFBSSxJQUFJLEVBQUU7QUFDcEMsbUJBQUssbUJBQW1CLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDbkMsbUJBQUssbUJBQW1CLEdBQUcsSUFBSSxDQUFDO1dBQ2pDO1NBQ0YsQ0FBQyxFQUNGLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUNmLGdCQUFnQixFQUNoQixhQUFhLEVBQ2IsSUFBSSxDQUFDLHVCQUF1QixDQUM3QixDQUNGLENBQUM7T0FDSDtBQUNELCtCQUFVLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0FBQ3BDLGFBQU8sSUFBSSxDQUFDLG1CQUFtQixDQUFDO0tBQ2pDOzs7Ozs7O1dBS1EscUJBQVc7QUFDbEIsVUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUU7QUFDaEIsWUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUM7QUFDekMsY0FBSSxFQUFFLElBQUksQ0FBQyxNQUFNO0FBQ2pCLGlCQUFPLEVBQUUsS0FBSzs7QUFFZCxrQkFBUSxFQUFFLEdBQUc7U0FDZCxDQUFDLENBQUM7O0FBRUgsWUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7QUFDcEIsZUFBTyxLQUFLLENBQUM7T0FDZCxNQUFNO0FBQ0wsZUFBTyxJQUFJLENBQUMsTUFBTSxDQUFDO09BQ3BCO0tBQ0Y7OztTQS9ORyxVQUFVOzs7QUFrT2hCLFNBQVMscUJBQXFCLEdBQW9CO0FBQ2hELE1BQUksZUFBZSxJQUFJLElBQUksRUFBRTtBQUMzQixtQkFBZSxHQUFHOztBQUVoQixtQkFBYSxFQUFFLHVCQUFDLEtBQUs7ZUFBYSxJQUFJO09BQUE7QUFDdEMsa0JBQVksRUFBRSxvQkFBb0I7QUFDbEMsdUJBQWlCLEVBQUUsQ0FBQztBQUNwQixhQUFPLEVBQUUsaUJBQUMsTUFBTSxFQUFjLFFBQVEsRUFBaUI7QUFDckQsWUFBSSxVQUFVLElBQUksSUFBSSxFQUFFO0FBQ3RCLGlCQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDOUI7QUFDRCxZQUFNLEtBQUssR0FBRyxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUM7QUFDcEMsZUFBTyxzQ0FBZ0IsS0FBSyxFQUFFLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQztPQUNqRDtLQUNGLENBQUM7R0FDSDtBQUNELFNBQU8sZUFBZSxDQUFDO0NBQ3hCOztBQUVELElBQUksVUFBVSxHQUFHLElBQUksQ0FBQztBQUN0QixJQUFJLE9BQWEsR0FBRyxJQUFJLENBQUM7QUFDekIsSUFBSSxlQUFpQyxZQUFBLENBQUM7O0FBRS9CLFNBQVMsUUFBUSxDQUFDLEtBQXVCLEVBQUU7QUFDaEQsTUFBSSxDQUFDLFVBQVUsRUFBRTtBQUNmLGNBQVUsR0FBRyxJQUFJLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztHQUNwQztDQUNGOztBQUVNLFNBQVMsU0FBUyxHQUFvQjtBQUMzQyxNQUFJLFVBQVUsRUFBRTtBQUNkLFdBQU8sVUFBVSxDQUFDLFNBQVMsRUFBRSxDQUFDO0dBQy9CLE1BQU07QUFDTCxXQUFPO0FBQ0wsaUJBQVcsRUFBRSxJQUFJO0tBQ2xCLENBQUM7R0FDSDtDQUNGOztBQUVNLFNBQVMsVUFBVSxHQUFHO0FBQzNCLE1BQUksVUFBVSxFQUFFO0FBQ2QsY0FBVSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3JCLGNBQVUsR0FBRyxJQUFJLENBQUM7R0FDbkI7QUFDRCxNQUFJLE9BQU8sRUFBRTtBQUNYLFdBQU8sQ0FBQyxXQUFXLEVBQUUsQ0FBQztHQUN2QjtDQUNGOztBQUVNLFNBQVMsc0JBQXNCLENBQUMsT0FBaUMsRUFBYztBQUNwRixNQUFJLFVBQVUsRUFBRTtBQUNkLGNBQVUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7R0FDeEQ7QUFDRCxTQUFPLHFCQUFlLFlBQU07QUFDMUIsUUFBSSxVQUFVLEVBQUU7QUFDZCxnQkFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDLFVBQVUsRUFBRSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztLQUMzRDtHQUNGLENBQUMsQ0FBQztDQUNKOztBQUVNLFNBQVMsdUJBQXVCLENBQUMsUUFBaUMsRUFBZTtBQUN0RixNQUFJLFVBQVUsRUFBRTtBQUNkLGNBQVUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztHQUNsRTtBQUNELFNBQU8scUJBQWUsWUFBTTtBQUMxQixRQUFJLFVBQVUsRUFBRTtBQUNkLGdCQUFVLENBQUMsUUFBUSxFQUFFLENBQUMsVUFBVSxFQUFFLENBQUMsc0JBQXNCLENBQUMsUUFBUSxDQUFDLENBQUM7S0FDckU7R0FDRixDQUFDLENBQUM7Q0FDSjs7QUFFTSxTQUFTLG1DQUFtQyxDQUNqRCxRQUE2QyxFQUNoQztBQUNiLE1BQUksVUFBVSxFQUFFO0FBQ2QsY0FBVSxDQUFDLFFBQVEsRUFBRSxDQUFDLFVBQVUsRUFBRSxDQUFDLCtCQUErQixDQUFDLFFBQVEsQ0FBQyxDQUFDO0dBQzlFO0FBQ0QsU0FBTyxxQkFBZSxZQUFNO0FBQzFCLFFBQUksVUFBVSxFQUFFO0FBQ2QsZ0JBQVUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxrQ0FBa0MsQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUNqRjtHQUNGLENBQUMsQ0FBQztDQUNKOztBQUVNLFNBQVMsY0FBYyxDQUFDLFVBQXFDLEVBQVE7QUFDMUUsU0FBTyxHQUFHLFVBQVUsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0FBQ3pDLFNBQU8sQ0FBQyxTQUFTLENBQUM7QUFDaEIsUUFBSSxFQUFFLE1BQU07QUFDWixZQUFRLEVBQUUseUJBQXlCO0FBQ25DLFdBQU8sRUFBRSxpQkFBaUI7QUFDMUIsWUFBUSxFQUFFLEdBQUc7R0FDZCxDQUFDLENBQUM7Q0FDSjs7QUFFTSxTQUFTLDJCQUEyQixHQUF5QjtBQUNsRSxTQUFPLHNDQUF5QjtXQUFNLFVBQVUsR0FBRyxVQUFVLENBQUMsUUFBUSxFQUFFLEdBQUcsSUFBSTtHQUFBLENBQUMsQ0FBQztDQUNsRjs7QUFFTSxTQUFTLHFCQUFxQixHQUFXO0FBQzlDLFNBQU87O0FBRUwsaUJBQWEsRUFBRSx1QkFBQyxLQUFLO2FBQWEsSUFBSTtLQUFBO0FBQ3RDLGdCQUFZLEVBQUUsb0JBQW9CO0FBQ2xDLHFCQUFpQixFQUFFLENBQUM7QUFDcEIsV0FBTyxFQUFFLGlCQUFDLE1BQU0sRUFBYyxRQUFRLEVBQWlCO0FBQ3JELFVBQUksVUFBVSxJQUFJLElBQUksRUFBRTtBQUN0QixlQUFPLElBQUksQ0FBQztPQUNiO0FBQ0QsVUFBTSxLQUFLLEdBQUcsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDO0FBQ3BDLGFBQU8sc0NBQWdCLEtBQUssRUFBRSxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUM7S0FDakQ7R0FDRixDQUFDO0NBQ0g7O0FBRU0sU0FBUyxxQkFBcUIsQ0FBQyxPQUF1QixFQUFlO0FBQzFFLE1BQU0sUUFBUSxHQUFHLHFCQUFxQixFQUFFLENBQUM7QUFDekMsU0FBTyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUM5QixNQUFNLFVBQVUsR0FBRyxxQkFBZTtXQUFNLE9BQU8sQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDO0dBQUEsQ0FBQyxDQUFDO0FBQzFFLDJCQUFVLFVBQVUsQ0FBQyxDQUFDO0FBQ3RCLFlBQVUsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ3hDLFNBQU8sVUFBVSxDQUFDO0NBQ25CIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7XG4gICBudWNsaWRlX2RlYnVnZ2VyJFNlcnZpY2UsXG4gICBOdWNsaWRlRGVidWdnZXJQcm92aWRlcixcbiAgIE51Y2xpZGVFdmFsdWF0aW9uRXhwcmVzc2lvblByb3ZpZGVyLFxufSBmcm9tICcuLi8uLi9udWNsaWRlLWRlYnVnZ2VyLWludGVyZmFjZXMvc2VydmljZSc7XG5pbXBvcnQgdHlwZSB7U2VyaWFsaXplZEJyZWFrcG9pbnR9IGZyb20gJy4vQnJlYWtwb2ludFN0b3JlJztcbmltcG9ydCB0eXBlIHtcbiAgRGF0YXRpcFByb3ZpZGVyLFxuICBEYXRhdGlwU2VydmljZSxcbn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1kYXRhdGlwLWludGVyZmFjZXMnO1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGUsIERpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHt0cmFja1RpbWluZ30gZnJvbSAnLi4vLi4vbnVjbGlkZS1hbmFseXRpY3MnO1xuaW1wb3J0IFJlbW90ZUNvbnRyb2xTZXJ2aWNlIGZyb20gJy4vUmVtb3RlQ29udHJvbFNlcnZpY2UnO1xuaW1wb3J0IERlYnVnZ2VyTW9kZWwgZnJvbSAnLi9EZWJ1Z2dlck1vZGVsJztcbmltcG9ydCB7ZGVidWdnZXJEYXRhdGlwfSBmcm9tICcuL0RlYnVnZ2VyRGF0YXRpcCc7XG5pbXBvcnQge1xuICBSZWFjdCxcbiAgUmVhY3RET00sXG59IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcbmltcG9ydCB7RGVidWdnZXJMYXVuY2hBdHRhY2hVSX0gZnJvbSAnLi9EZWJ1Z2dlckxhdW5jaEF0dGFjaFVJJztcbmltcG9ydCByZW1vdGVVcmkgZnJvbSAnLi4vLi4vbnVjbGlkZS1yZW1vdGUtdXJpJztcbmltcG9ydCB7U2VydmVyQ29ubmVjdGlvbn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1yZW1vdGUtY29ubmVjdGlvbic7XG5pbXBvcnQge3Bhc3Nlc0dLfSBmcm9tICcuLi8uLi9udWNsaWRlLWRlYnVnZ2VyLWNvbW1vbi9saWIvdXRpbHMnO1xuXG5pbXBvcnQgRGVidWdnZXJQcm9jZXNzSW5mbyBmcm9tICcuL0RlYnVnZ2VyUHJvY2Vzc0luZm8nO1xuaW1wb3J0IERlYnVnZ2VySW5zdGFuY2UgZnJvbSAnLi9EZWJ1Z2dlckluc3RhbmNlJztcbmltcG9ydCBEZWJ1Z2dlckxhdW5jaEF0dGFjaFByb3ZpZGVyIGZyb20gJy4vRGVidWdnZXJMYXVuY2hBdHRhY2hQcm92aWRlcic7XG5cbmV4cG9ydCB7XG4gIERlYnVnZ2VyUHJvY2Vzc0luZm8sXG4gIERlYnVnZ2VySW5zdGFuY2UsXG4gIERlYnVnZ2VyTGF1bmNoQXR0YWNoUHJvdmlkZXIsXG59O1xuXG5leHBvcnQgdHlwZSBTZXJpYWxpemVkU3RhdGUgPSB7XG4gIGJyZWFrcG9pbnRzOiA/QXJyYXk8U2VyaWFsaXplZEJyZWFrcG9pbnQ+O1xufTtcblxuY29uc3QgREFUQVRJUF9QQUNLQUdFX05BTUUgPSAnbnVjbGlkZS1kZWJ1Z2dlci1kYXRhdGlwJztcbmNvbnN0IEdLX0RFQlVHR0VSX0xBVU5DSF9BVFRBQ0hfVUkgPSAnbnVjbGlkZV9kZWJ1Z2dlcl9sYXVuY2hfYXR0YWNoX3VpJztcbmNvbnN0IEdLX1RJTUVPVVQgPSAxMDAwO1xuXG5mdW5jdGlvbiBjcmVhdGVEZWJ1Z2dlclZpZXcobW9kZWw6IERlYnVnZ2VyTW9kZWwpOiBIVE1MRWxlbWVudCB7XG4gIGNvbnN0IERlYnVnZ2VyQ29udHJvbGxlclZpZXcgPSByZXF1aXJlKCcuL0RlYnVnZ2VyQ29udHJvbGxlclZpZXcnKTtcbiAgY29uc3QgZWxlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICBlbGVtLmNsYXNzTmFtZSA9ICdudWNsaWRlLWRlYnVnZ2VyLXJvb3QnO1xuICBSZWFjdERPTS5yZW5kZXIoXG4gICAgPERlYnVnZ2VyQ29udHJvbGxlclZpZXdcbiAgICAgIHN0b3JlPXttb2RlbC5nZXRTdG9yZSgpfVxuICAgICAgYnJpZGdlID0ge21vZGVsLmdldEJyaWRnZSgpfVxuICAgICAgYWN0aW9ucz17bW9kZWwuZ2V0QWN0aW9ucygpfVxuICAgICAgYnJlYWtwb2ludFN0b3JlPXttb2RlbC5nZXRCcmVha3BvaW50U3RvcmUoKX1cbiAgICAvPixcbiAgICBlbGVtKTtcbiAgcmV0dXJuIGVsZW07XG59XG5cbmNsYXNzIEFjdGl2YXRpb24ge1xuICBfZGlzcG9zYWJsZXM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIF9tb2RlbDogRGVidWdnZXJNb2RlbDtcbiAgX3BhbmVsOiA/T2JqZWN0O1xuICBfbGF1bmNoQXR0YWNoRGlhbG9nOiA/YXRvbSRQYW5lbDtcblxuICBjb25zdHJ1Y3RvcihzdGF0ZTogP1NlcmlhbGl6ZWRTdGF0ZSkge1xuICAgIHRoaXMuX21vZGVsID0gbmV3IERlYnVnZ2VyTW9kZWwoc3RhdGUpO1xuICAgIHRoaXMuX3BhbmVsID0gbnVsbDtcbiAgICB0aGlzLl9sYXVuY2hBdHRhY2hEaWFsb2cgPSBudWxsO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoXG4gICAgICB0aGlzLl9tb2RlbCxcbiAgICAgIGF0b20udmlld3MuYWRkVmlld1Byb3ZpZGVyKERlYnVnZ2VyTW9kZWwsIGNyZWF0ZURlYnVnZ2VyVmlldyksXG5cbiAgICAgIC8vIExpc3RlbiBmb3IgcmVtb3ZlZCBjb25uZWN0aW9ucyBhbmQga2lsbCB0aGUgZGVidWdnZXIgaWYgaXQgaXMgdXNpbmcgdGhhdCBjb25uZWN0aW9uLlxuICAgICAgU2VydmVyQ29ubmVjdGlvbi5vbkRpZENsb3NlU2VydmVyQ29ubmVjdGlvbihjb25uZWN0aW9uID0+IHtcbiAgICAgICAgY29uc3QgZGVidWdnZXJQcm9jZXNzID0gdGhpcy5fbW9kZWwuZ2V0U3RvcmUoKS5nZXREZWJ1Z2dlclByb2Nlc3MoKTtcbiAgICAgICAgaWYgKGRlYnVnZ2VyUHJvY2VzcyA9PSBudWxsKSB7XG4gICAgICAgICAgcmV0dXJuOyAvLyBOb3RoaW5nIHRvIGRvIGlmIHdlJ3JlIG5vdCBkZWJ1Z2dpbmcuXG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZGVidWdnZWVUYXJnZXRVcmkgPSBkZWJ1Z2dlclByb2Nlc3MuZ2V0VGFyZ2V0VXJpKCk7XG4gICAgICAgIGlmIChyZW1vdGVVcmkuaXNMb2NhbChkZWJ1Z2dlZVRhcmdldFVyaSkpIHtcbiAgICAgICAgICByZXR1cm47IC8vIE5vdGhpbmcgdG8gZG8gaWYgb3VyIGRlYnVnIHNlc3Npb24gaXMgbG9jYWwuXG4gICAgICAgIH1cbiAgICAgICAgaWYgKHJlbW90ZVVyaS5nZXRIb3N0bmFtZShkZWJ1Z2dlZVRhcmdldFVyaSkgPT09IGNvbm5lY3Rpb24uZ2V0UmVtb3RlSG9zdG5hbWUoKVxuICAgICAgICAgICAgJiYgcmVtb3RlVXJpLmdldFBvcnQoZGVidWdnZWVUYXJnZXRVcmkpID09PSBjb25uZWN0aW9uLmdldFBvcnQoKSkge1xuICAgICAgICAgIHRoaXMuX21vZGVsLmdldEFjdGlvbnMoKS5raWxsRGVidWdnZXIoKTtcbiAgICAgICAgfVxuICAgICAgfSksXG5cbiAgICAgIC8vIENvbW1hbmRzLlxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywge1xuICAgICAgICAnbnVjbGlkZS1kZWJ1Z2dlcjp0b2dnbGUnOiB0aGlzLl90b2dnbGUuYmluZCh0aGlzKSxcbiAgICAgIH0pLFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywge1xuICAgICAgICAnbnVjbGlkZS1kZWJ1Z2dlcjpzaG93JzogdGhpcy5fc2hvdy5iaW5kKHRoaXMpLFxuICAgICAgfSksXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS13b3Jrc3BhY2UnLCB7XG4gICAgICAgICdudWNsaWRlLWRlYnVnZ2VyOmhpZGUnOiB0aGlzLl9oaWRlLmJpbmQodGhpcyksXG4gICAgICB9KSxcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsIHtcbiAgICAgICAgJ251Y2xpZGUtZGVidWdnZXI6Y29udGludWUtZGVidWdnaW5nJzogdGhpcy5fY29udGludWUuYmluZCh0aGlzKSxcbiAgICAgIH0pLFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywge1xuICAgICAgICAnbnVjbGlkZS1kZWJ1Z2dlcjpzdG9wLWRlYnVnZ2luZyc6IHRoaXMuX3N0b3AuYmluZCh0aGlzKSxcbiAgICAgIH0pLFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywge1xuICAgICAgICAnbnVjbGlkZS1kZWJ1Z2dlcjpzdGVwLW92ZXInOiB0aGlzLl9zdGVwT3Zlci5iaW5kKHRoaXMpLFxuICAgICAgfSksXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS13b3Jrc3BhY2UnLCB7XG4gICAgICAgICdudWNsaWRlLWRlYnVnZ2VyOnN0ZXAtaW50byc6IHRoaXMuX3N0ZXBJbnRvLmJpbmQodGhpcyksXG4gICAgICB9KSxcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsIHtcbiAgICAgICAgJ251Y2xpZGUtZGVidWdnZXI6c3RlcC1vdXQnOiB0aGlzLl9zdGVwT3V0LmJpbmQodGhpcyksXG4gICAgICB9KSxcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsIHtcbiAgICAgICAgJ251Y2xpZGUtZGVidWdnZXI6dG9nZ2xlLWJyZWFrcG9pbnQnOiB0aGlzLl90b2dnbGVCcmVha3BvaW50LmJpbmQodGhpcyksXG4gICAgICB9KSxcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsIHtcbiAgICAgICAgJ251Y2xpZGUtZGVidWdnZXI6dG9nZ2xlLWxhdW5jaC1hdHRhY2gnOiB0aGlzLl90b2dnbGVMYXVuY2hBdHRhY2hEaWFsb2cuYmluZCh0aGlzKSxcbiAgICAgIH0pLFxuXG4gICAgICAvLyBDb250ZXh0IE1lbnUgSXRlbXMuXG4gICAgICBhdG9tLmNvbnRleHRNZW51LmFkZCh7XG4gICAgICAgICdhdG9tLXRleHQtZWRpdG9yJzogW1xuICAgICAgICAgIHt0eXBlOiAnc2VwYXJhdG9yJ30sXG4gICAgICAgICAge1xuICAgICAgICAgICAgbGFiZWw6ICdEZWJ1Z2dlcicsXG4gICAgICAgICAgICBzdWJtZW51OiBbXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBsYWJlbDogJ1RvZ2dsZSBCcmVha3BvaW50JyxcbiAgICAgICAgICAgICAgICBjb21tYW5kOiAnbnVjbGlkZS1kZWJ1Z2dlcjp0b2dnbGUtYnJlYWtwb2ludCcsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBdLFxuICAgICAgICAgIH0sXG4gICAgICAgICAge3R5cGU6ICdzZXBhcmF0b3InfSxcbiAgICAgICAgXSxcbiAgICAgIH0pLFxuICAgICk7XG4gICAgKHRoaXM6IGFueSkuX2hpZGVMYXVuY2hBdHRhY2hEaWFsb2cgPSB0aGlzLl9oaWRlTGF1bmNoQXR0YWNoRGlhbG9nLmJpbmQodGhpcyk7XG4gIH1cblxuICBzZXJpYWxpemUoKTogU2VyaWFsaXplZFN0YXRlIHtcbiAgICBjb25zdCBzdGF0ZSA9IHtcbiAgICAgIGJyZWFrcG9pbnRzOiB0aGlzLmdldE1vZGVsKCkuZ2V0QnJlYWtwb2ludFN0b3JlKCkuZ2V0U2VyaWFsaXplZEJyZWFrcG9pbnRzKCksXG4gICAgfTtcbiAgICByZXR1cm4gc3RhdGU7XG4gIH1cblxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgICBpZiAodGhpcy5fcGFuZWwpIHtcbiAgICAgIHRoaXMuX3BhbmVsLmRlc3Ryb3koKTtcbiAgICB9XG4gIH1cblxuICBnZXRNb2RlbCgpOiBEZWJ1Z2dlck1vZGVsIHtcbiAgICByZXR1cm4gdGhpcy5fbW9kZWw7XG4gIH1cblxuICBhc3luYyBfdG9nZ2xlKCkge1xuICAgIGNvbnN0IHBhc3NlZE5ld1VJR0sgPSBhd2FpdCBwYXNzZXNHSyhHS19ERUJVR0dFUl9MQVVOQ0hfQVRUQUNIX1VJLCBHS19USU1FT1VUKTtcbiAgICBpZiAocGFzc2VkTmV3VUlHSykge1xuICAgICAgdGhpcy5fdG9nZ2xlTGF1bmNoQXR0YWNoRGlhbG9nKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHBhbmVsID0gdGhpcy5fZ2V0UGFuZWwoKTtcbiAgICAgIGlmIChwYW5lbC5pc1Zpc2libGUoKSkge1xuICAgICAgICBwYW5lbC5oaWRlKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwYW5lbC5zaG93KCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgX3Nob3coKSB7XG4gICAgdGhpcy5fZ2V0UGFuZWwoKS5zaG93KCk7XG4gIH1cblxuICBfaGlkZSgpIHtcbiAgICB0aGlzLl9nZXRQYW5lbCgpLmhpZGUoKTtcbiAgfVxuXG4gIF9jb250aW51ZSgpIHtcbiAgICAvLyBUT0RPKGplZmZyZXl0YW4pOiB3aGVuIHdlIGZpZ3VyZWQgb3V0IHRoZSBsYXVuY2ggbGlmZWN5Y2xlIHN0b3J5XG4gICAgLy8gd2UgbWF5IGJpbmQgdGhpcyB0byBzdGFydC1kZWJ1Z2dpbmcgdG9vLlxuICAgIHRoaXMuX21vZGVsLmdldEJyaWRnZSgpLmNvbnRpbnVlKCk7XG4gIH1cblxuICBfc3RvcCgpIHtcbiAgICB0aGlzLl9tb2RlbC5nZXRBY3Rpb25zKCkuc3RvcERlYnVnZ2luZygpO1xuICB9XG5cbiAgX3N0ZXBPdmVyKCkge1xuICAgIHRoaXMuX21vZGVsLmdldEJyaWRnZSgpLnN0ZXBPdmVyKCk7XG4gIH1cblxuICBfc3RlcEludG8oKSB7XG4gICAgdGhpcy5fbW9kZWwuZ2V0QnJpZGdlKCkuc3RlcEludG8oKTtcbiAgfVxuXG4gIF9zdGVwT3V0KCkge1xuICAgIHRoaXMuX21vZGVsLmdldEJyaWRnZSgpLnN0ZXBPdXQoKTtcbiAgfVxuXG4gIEB0cmFja1RpbWluZygnbnVjbGlkZS1kZWJ1Z2dlci1hdG9tOnRvZ2dsZUJyZWFrcG9pbnQnKVxuICBfdG9nZ2xlQnJlYWtwb2ludCgpIHtcbiAgICBjb25zdCBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk7XG4gICAgaWYgKGVkaXRvciAmJiBlZGl0b3IuZ2V0UGF0aCgpKSB7XG4gICAgICBjb25zdCBmaWxlUGF0aCA9IGVkaXRvci5nZXRQYXRoKCk7XG4gICAgICBpZiAoZmlsZVBhdGgpIHtcbiAgICAgICAgY29uc3QgbGluZSA9IGVkaXRvci5nZXRMYXN0Q3Vyc29yKCkuZ2V0QnVmZmVyUm93KCk7XG4gICAgICAgIHRoaXMuZ2V0TW9kZWwoKS5nZXRCcmVha3BvaW50U3RvcmUoKS50b2dnbGVCcmVha3BvaW50KGZpbGVQYXRoLCBsaW5lKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuXG4gIF90b2dnbGVMYXVuY2hBdHRhY2hEaWFsb2coKTogdm9pZCB7XG4gICAgY29uc3QgZGlhbG9nID0gdGhpcy5fZ2V0TGF1bmNoQXR0YWNoRGlhbG9nKCk7XG4gICAgaWYgKGRpYWxvZy5pc1Zpc2libGUoKSkge1xuICAgICAgZGlhbG9nLmhpZGUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZGlhbG9nLnNob3coKTtcbiAgICB9XG4gIH1cblxuICBfaGlkZUxhdW5jaEF0dGFjaERpYWxvZygpOiB2b2lkIHtcbiAgICBjb25zdCBkaWFsb2cgPSB0aGlzLl9nZXRMYXVuY2hBdHRhY2hEaWFsb2coKTtcbiAgICBpZiAoZGlhbG9nLmlzVmlzaWJsZSgpKSB7XG4gICAgICBkaWFsb2cuaGlkZSgpO1xuICAgIH1cbiAgfVxuXG4gIF9nZXRMYXVuY2hBdHRhY2hEaWFsb2coKTogYXRvbSRQYW5lbCB7XG4gICAgaWYgKCF0aGlzLl9sYXVuY2hBdHRhY2hEaWFsb2cpIHtcbiAgICAgIGNvbnN0IGNvbXBvbmVudCA9IChcbiAgICAgICAgPERlYnVnZ2VyTGF1bmNoQXR0YWNoVUlcbiAgICAgICAgICBzdG9yZT17dGhpcy5fbW9kZWwuZ2V0RGVidWdnZXJQcm92aWRlclN0b3JlKCl9XG4gICAgICAgICAgZGVidWdnZXJBY3Rpb25zPXt0aGlzLl9tb2RlbC5nZXRBY3Rpb25zKCl9XG4gICAgICAgIC8+XG4gICAgICApO1xuICAgICAgY29uc3QgaG9zdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgUmVhY3RET00ucmVuZGVyKGNvbXBvbmVudCwgaG9zdCk7XG4gICAgICB0aGlzLl9sYXVuY2hBdHRhY2hEaWFsb2cgPSBhdG9tLndvcmtzcGFjZS5hZGRNb2RhbFBhbmVsKHtcbiAgICAgICAgaXRlbTogaG9zdCxcbiAgICAgICAgdmlzaWJsZTogZmFsc2UsIC8vIEhpZGUgZmlyc3Qgc28gdGhhdCBjYWxsZXIgY2FuIHRvZ2dsZSBpdCB2aXNpYmxlLlxuICAgICAgfSk7XG5cbiAgICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZChcbiAgICAgICAgbmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgICAgIGlmICh0aGlzLl9sYXVuY2hBdHRhY2hEaWFsb2cgIT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy5fbGF1bmNoQXR0YWNoRGlhbG9nLmRlc3Ryb3koKTtcbiAgICAgICAgICAgIHRoaXMuX2xhdW5jaEF0dGFjaERpYWxvZyA9IG51bGw7XG4gICAgICAgICAgfVxuICAgICAgICB9KSxcbiAgICAgICAgYXRvbS5jb21tYW5kcy5hZGQoXG4gICAgICAgICAgJ2F0b20td29ya3NwYWNlJyxcbiAgICAgICAgICAnY29yZTpjYW5jZWwnLFxuICAgICAgICAgIHRoaXMuX2hpZGVMYXVuY2hBdHRhY2hEaWFsb2csXG4gICAgICAgICksXG4gICAgICApO1xuICAgIH1cbiAgICBpbnZhcmlhbnQodGhpcy5fbGF1bmNoQXR0YWNoRGlhbG9nKTtcbiAgICByZXR1cm4gdGhpcy5fbGF1bmNoQXR0YWNoRGlhbG9nO1xuICB9XG5cbiAgLyoqXG4gICAqIExhenkgcGFuZWwgY3JlYXRpb24uXG4gICAqL1xuICBfZ2V0UGFuZWwoKTogT2JqZWN0IHtcbiAgICBpZiAoIXRoaXMuX3BhbmVsKSB7XG4gICAgICBjb25zdCBwYW5lbCA9IGF0b20ud29ya3NwYWNlLmFkZFJpZ2h0UGFuZWwoe1xuICAgICAgICBpdGVtOiB0aGlzLl9tb2RlbCxcbiAgICAgICAgdmlzaWJsZTogZmFsc2UsXG4gICAgICAgIC8vIE1vdmUgdGhpcyBsZWZ0IG9mIHRoZSB0b29sYmFyLCB3aGVuIGl0IGlzIG9uIHRoZSByaWdodC5cbiAgICAgICAgcHJpb3JpdHk6IDE1MCxcbiAgICAgIH0pO1xuICAgICAgLy8gRmxvdyBkb2Vzbid0IHRyYWNrIG5vbi1udWxsIHdoZW4gYXNzaWduaW5nIGludG8gbnVsbGFibGUgZGlyZWN0bHkuXG4gICAgICB0aGlzLl9wYW5lbCA9IHBhbmVsO1xuICAgICAgcmV0dXJuIHBhbmVsO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5fcGFuZWw7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZURhdGF0aXBQcm92aWRlcigpOiBEYXRhdGlwUHJvdmlkZXIge1xuICBpZiAoZGF0YXRpcFByb3ZpZGVyID09IG51bGwpIHtcbiAgICBkYXRhdGlwUHJvdmlkZXIgPSB7XG4gICAgICAvLyBFbGlnaWJpbGl0eSBpcyBkZXRlcm1pbmVkIG9ubGluZSwgYmFzZWQgb24gcmVnaXN0ZXJlZCBFdmFsdWF0aW9uRXhwcmVzc2lvbiBwcm92aWRlcnMuXG4gICAgICB2YWxpZEZvclNjb3BlOiAoc2NvcGU6IHN0cmluZykgPT4gdHJ1ZSxcbiAgICAgIHByb3ZpZGVyTmFtZTogREFUQVRJUF9QQUNLQUdFX05BTUUsXG4gICAgICBpbmNsdXNpb25Qcmlvcml0eTogMSxcbiAgICAgIGRhdGF0aXA6IChlZGl0b3I6IFRleHRFZGl0b3IsIHBvc2l0aW9uOiBhdG9tJFBvaW50KSA9PiB7XG4gICAgICAgIGlmIChhY3RpdmF0aW9uID09IG51bGwpIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG51bGwpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG1vZGVsID0gYWN0aXZhdGlvbi5nZXRNb2RlbCgpO1xuICAgICAgICByZXR1cm4gZGVidWdnZXJEYXRhdGlwKG1vZGVsLCBlZGl0b3IsIHBvc2l0aW9uKTtcbiAgICAgIH0sXG4gICAgfTtcbiAgfVxuICByZXR1cm4gZGF0YXRpcFByb3ZpZGVyO1xufVxuXG5sZXQgYWN0aXZhdGlvbiA9IG51bGw7XG5sZXQgdG9vbEJhcjogP2FueSA9IG51bGw7XG5sZXQgZGF0YXRpcFByb3ZpZGVyOiA/RGF0YXRpcFByb3ZpZGVyO1xuXG5leHBvcnQgZnVuY3Rpb24gYWN0aXZhdGUoc3RhdGU6ID9TZXJpYWxpemVkU3RhdGUpIHtcbiAgaWYgKCFhY3RpdmF0aW9uKSB7XG4gICAgYWN0aXZhdGlvbiA9IG5ldyBBY3RpdmF0aW9uKHN0YXRlKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2VyaWFsaXplKCk6IFNlcmlhbGl6ZWRTdGF0ZSB7XG4gIGlmIChhY3RpdmF0aW9uKSB7XG4gICAgcmV0dXJuIGFjdGl2YXRpb24uc2VyaWFsaXplKCk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGJyZWFrcG9pbnRzOiBudWxsLFxuICAgIH07XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlYWN0aXZhdGUoKSB7XG4gIGlmIChhY3RpdmF0aW9uKSB7XG4gICAgYWN0aXZhdGlvbi5kaXNwb3NlKCk7XG4gICAgYWN0aXZhdGlvbiA9IG51bGw7XG4gIH1cbiAgaWYgKHRvb2xCYXIpIHtcbiAgICB0b29sQmFyLnJlbW92ZUl0ZW1zKCk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbnN1bWVOdWNsaWRlRGVidWdnZXIoc2VydmljZTogbnVjbGlkZV9kZWJ1Z2dlciRTZXJ2aWNlKTogRGlzcG9zYWJsZSB7XG4gIGlmIChhY3RpdmF0aW9uKSB7XG4gICAgYWN0aXZhdGlvbi5nZXRNb2RlbCgpLmdldEFjdGlvbnMoKS5hZGRTZXJ2aWNlKHNlcnZpY2UpO1xuICB9XG4gIHJldHVybiBuZXcgRGlzcG9zYWJsZSgoKSA9PiB7XG4gICAgaWYgKGFjdGl2YXRpb24pIHtcbiAgICAgIGFjdGl2YXRpb24uZ2V0TW9kZWwoKS5nZXRBY3Rpb25zKCkucmVtb3ZlU2VydmljZShzZXJ2aWNlKTtcbiAgICB9XG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29uc3VtZURlYnVnZ2VyUHJvdmlkZXIocHJvdmlkZXI6IE51Y2xpZGVEZWJ1Z2dlclByb3ZpZGVyKTogSURpc3Bvc2FibGUge1xuICBpZiAoYWN0aXZhdGlvbikge1xuICAgIGFjdGl2YXRpb24uZ2V0TW9kZWwoKS5nZXRBY3Rpb25zKCkuYWRkRGVidWdnZXJQcm92aWRlcihwcm92aWRlcik7XG4gIH1cbiAgcmV0dXJuIG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICBpZiAoYWN0aXZhdGlvbikge1xuICAgICAgYWN0aXZhdGlvbi5nZXRNb2RlbCgpLmdldEFjdGlvbnMoKS5yZW1vdmVEZWJ1Z2dlclByb3ZpZGVyKHByb3ZpZGVyKTtcbiAgICB9XG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29uc3VtZUV2YWx1YXRpb25FeHByZXNzaW9uUHJvdmlkZXIoXG4gIHByb3ZpZGVyOiBOdWNsaWRlRXZhbHVhdGlvbkV4cHJlc3Npb25Qcm92aWRlcixcbik6IElEaXNwb3NhYmxlIHtcbiAgaWYgKGFjdGl2YXRpb24pIHtcbiAgICBhY3RpdmF0aW9uLmdldE1vZGVsKCkuZ2V0QWN0aW9ucygpLmFkZEV2YWx1YXRpb25FeHByZXNzaW9uUHJvdmlkZXIocHJvdmlkZXIpO1xuICB9XG4gIHJldHVybiBuZXcgRGlzcG9zYWJsZSgoKSA9PiB7XG4gICAgaWYgKGFjdGl2YXRpb24pIHtcbiAgICAgIGFjdGl2YXRpb24uZ2V0TW9kZWwoKS5nZXRBY3Rpb25zKCkucmVtb3ZlRXZhbHVhdGlvbkV4cHJlc3Npb25Qcm92aWRlcihwcm92aWRlcik7XG4gICAgfVxuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbnN1bWVUb29sQmFyKGdldFRvb2xCYXI6IChncm91cDogc3RyaW5nKSA9PiBPYmplY3QpOiB2b2lkIHtcbiAgdG9vbEJhciA9IGdldFRvb2xCYXIoJ251Y2xpZGUtZGVidWdnZXInKTtcbiAgdG9vbEJhci5hZGRCdXR0b24oe1xuICAgIGljb246ICdwbHVnJyxcbiAgICBjYWxsYmFjazogJ251Y2xpZGUtZGVidWdnZXI6dG9nZ2xlJyxcbiAgICB0b29sdGlwOiAnVG9nZ2xlIERlYnVnZ2VyJyxcbiAgICBwcmlvcml0eTogMTAwLFxuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHByb3ZpZGVSZW1vdGVDb250cm9sU2VydmljZSgpOiBSZW1vdGVDb250cm9sU2VydmljZSB7XG4gIHJldHVybiBuZXcgUmVtb3RlQ29udHJvbFNlcnZpY2UoKCkgPT4gYWN0aXZhdGlvbiA/IGFjdGl2YXRpb24uZ2V0TW9kZWwoKSA6IG51bGwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRGF0YXRpcFByb3ZpZGVyKCk6IE9iamVjdCB7XG4gIHJldHVybiB7XG4gICAgLy8gRWxpZ2liaWxpdHkgaXMgZGV0ZXJtaW5lZCBvbmxpbmUsIGJhc2VkIG9uIHJlZ2lzdGVyZWQgRXZhbHVhdGlvbkV4cHJlc3Npb24gcHJvdmlkZXJzLlxuICAgIHZhbGlkRm9yU2NvcGU6IChzY29wZTogc3RyaW5nKSA9PiB0cnVlLFxuICAgIHByb3ZpZGVyTmFtZTogREFUQVRJUF9QQUNLQUdFX05BTUUsXG4gICAgaW5jbHVzaW9uUHJpb3JpdHk6IDEsXG4gICAgZGF0YXRpcDogKGVkaXRvcjogVGV4dEVkaXRvciwgcG9zaXRpb246IGF0b20kUG9pbnQpID0+IHtcbiAgICAgIGlmIChhY3RpdmF0aW9uID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgICBjb25zdCBtb2RlbCA9IGFjdGl2YXRpb24uZ2V0TW9kZWwoKTtcbiAgICAgIHJldHVybiBkZWJ1Z2dlckRhdGF0aXAobW9kZWwsIGVkaXRvciwgcG9zaXRpb24pO1xuICAgIH0sXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb25zdW1lRGF0YXRpcFNlcnZpY2Uoc2VydmljZTogRGF0YXRpcFNlcnZpY2UpOiBJRGlzcG9zYWJsZSB7XG4gIGNvbnN0IHByb3ZpZGVyID0gY3JlYXRlRGF0YXRpcFByb3ZpZGVyKCk7XG4gIHNlcnZpY2UuYWRkUHJvdmlkZXIocHJvdmlkZXIpO1xuICBjb25zdCBkaXNwb3NhYmxlID0gbmV3IERpc3Bvc2FibGUoKCkgPT4gc2VydmljZS5yZW1vdmVQcm92aWRlcihwcm92aWRlcikpO1xuICBpbnZhcmlhbnQoYWN0aXZhdGlvbik7XG4gIGFjdGl2YXRpb24uX2Rpc3Bvc2FibGVzLmFkZChkaXNwb3NhYmxlKTtcbiAgcmV0dXJuIGRpc3Bvc2FibGU7XG59XG4iXX0=