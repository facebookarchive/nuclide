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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _atom = require('atom');

var _nuclideAnalytics = require('../../nuclide-analytics');

var _RemoteControlService = require('./RemoteControlService');

var _RemoteControlService2 = _interopRequireDefault(_RemoteControlService);

var _DebuggerModel = require('./DebuggerModel');

var _DebuggerModel2 = _interopRequireDefault(_DebuggerModel);

var _reactForAtom = require('react-for-atom');

var _DebuggerLaunchAttachUI = require('./DebuggerLaunchAttachUI');

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

    // Listen for removed projects and kill the associated debugger if it is attached.
    atom.project.onDidChangePaths(function (projectPaths) {
      var debuggerProcess = _this._model.getStore().getDebuggerProcess();
      if (debuggerProcess == null) {
        return;
      }
      var debugeeProjectPath = debuggerProcess.getTargetUri();
      if (projectPaths.indexOf(debugeeProjectPath) < 0) {
        _this._model.getActions().killDebugger();
      }
    }),

    // Commands.
    atom.commands.add('atom-workspace', {
      'nuclide-debugger:toggle': this._toggle.bind(this)
    }), atom.commands.add('atom-workspace', {
      'nuclide-debugger:show': this._show.bind(this)
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
    value: function _toggle() {
      var panel = this._getPanel();
      if (panel.isVisible()) {
        panel.hide();
      } else {
        panel.show();
      }
    }
  }, {
    key: '_show',
    value: function _show() {
      this._getPanel().show();
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
      this._model.getActions().killDebugger();
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
          visible: false
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

var activation = null;
var toolBar = null;

module.exports = {
  activate: function activate(state) {
    if (!activation) {
      activation = new Activation(state);
    }
  },

  serialize: function serialize() {
    if (activation) {
      return activation.serialize();
    } else {
      return {
        breakpoints: null
      };
    }
  },

  deactivate: function deactivate() {
    if (activation) {
      activation.dispose();
      activation = null;
    }
    if (toolBar) {
      toolBar.removeItems();
    }
  },

  consumeNuclideDebugger: function consumeNuclideDebugger(service) {
    if (activation) {
      activation.getModel().getActions().addService(service);
    }
    return new _atom.Disposable(function () {
      if (activation) {
        activation.getModel().getActions().removeService(service);
      }
    });
  },

  consumeDebuggerProvider: function consumeDebuggerProvider(provider) {
    if (activation) {
      activation.getModel().getActions().addDebuggerProvider(provider);
    }
    return new _atom.Disposable(function () {
      if (activation) {
        activation.getModel().getActions().removeDebuggerProvider(provider);
      }
    });
  },

  DebuggerProcessInfo: require('./DebuggerProcessInfo'),
  DebuggerInstance: require('./DebuggerInstance'),
  DebuggerLaunchAttachProvider: require('./DebuggerLaunchAttachProvider'),

  consumeToolBar: function consumeToolBar(getToolBar) {
    toolBar = getToolBar('nuclide-debugger');
    toolBar.addButton({
      icon: 'plug',
      callback: 'nuclide-debugger:toggle',
      tooltip: 'Toggle Debugger',
      priority: 100
    });
  },

  provideRemoteControlService: function provideRemoteControlService() {
    return new _RemoteControlService2['default'](function () {
      return activation ? activation.getModel() : null;
    });
  }
};
//# sourceMappingURL=data:application/json;base64,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QyxVQUFVLEVBQUUsQ0FBQyxzQkFBc0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztPQUNyRTtLQUNGLENBQUMsQ0FBQztHQUNKOztBQUVELHFCQUFtQixFQUFFLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQztBQUNyRCxrQkFBZ0IsRUFBRSxPQUFPLENBQUMsb0JBQW9CLENBQUM7QUFDL0MsOEJBQTRCLEVBQUUsT0FBTyxDQUFDLGdDQUFnQyxDQUFDOztBQUV2RSxnQkFBYyxFQUFBLHdCQUFDLFVBQXFDLEVBQVE7QUFDMUQsV0FBTyxHQUFHLFVBQVUsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0FBQ3pDLFdBQU8sQ0FBQyxTQUFTLENBQUM7QUFDaEIsVUFBSSxFQUFFLE1BQU07QUFDWixjQUFRLEVBQUUseUJBQXlCO0FBQ25DLGFBQU8sRUFBRSxpQkFBaUI7QUFDMUIsY0FBUSxFQUFFLEdBQUc7S0FDZCxDQUFDLENBQUM7R0FDSjs7QUFFRCw2QkFBMkIsRUFBQSx1Q0FBeUI7QUFDbEQsV0FBTyxzQ0FBeUI7YUFBTSxVQUFVLEdBQUcsVUFBVSxDQUFDLFFBQVEsRUFBRSxHQUFHLElBQUk7S0FBQSxDQUFDLENBQUM7R0FDbEY7Q0FDRixDQUFDIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7XG4gICBudWNsaWRlX2RlYnVnZ2VyJFNlcnZpY2UsXG4gICBOdWNsaWRlRGVidWdnZXJQcm92aWRlcixcbn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1kZWJ1Z2dlci1pbnRlcmZhY2VzL3NlcnZpY2UnO1xuaW1wb3J0IHR5cGUge1NlcmlhbGl6ZWRCcmVha3BvaW50fSBmcm9tICcuL0JyZWFrcG9pbnRTdG9yZSc7XG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZSwgRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQge3RyYWNrVGltaW5nfSBmcm9tICcuLi8uLi9udWNsaWRlLWFuYWx5dGljcyc7XG5pbXBvcnQgUmVtb3RlQ29udHJvbFNlcnZpY2UgZnJvbSAnLi9SZW1vdGVDb250cm9sU2VydmljZSc7XG5pbXBvcnQgRGVidWdnZXJNb2RlbCBmcm9tICcuL0RlYnVnZ2VyTW9kZWwnO1xuaW1wb3J0IHtcbiAgUmVhY3QsXG4gIFJlYWN0RE9NLFxufSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQge0RlYnVnZ2VyTGF1bmNoQXR0YWNoVUl9IGZyb20gJy4vRGVidWdnZXJMYXVuY2hBdHRhY2hVSSc7XG5cbmV4cG9ydCB0eXBlIFNlcmlhbGl6ZWRTdGF0ZSA9IHtcbiAgYnJlYWtwb2ludHM6ID9BcnJheTxTZXJpYWxpemVkQnJlYWtwb2ludD47XG59O1xuXG5mdW5jdGlvbiBjcmVhdGVEZWJ1Z2dlclZpZXcobW9kZWw6IERlYnVnZ2VyTW9kZWwpOiBIVE1MRWxlbWVudCB7XG4gIGNvbnN0IERlYnVnZ2VyQ29udHJvbGxlclZpZXcgPSByZXF1aXJlKCcuL0RlYnVnZ2VyQ29udHJvbGxlclZpZXcnKTtcbiAgY29uc3QgZWxlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICBlbGVtLmNsYXNzTmFtZSA9ICdudWNsaWRlLWRlYnVnZ2VyLXJvb3QnO1xuICBSZWFjdERPTS5yZW5kZXIoXG4gICAgPERlYnVnZ2VyQ29udHJvbGxlclZpZXdcbiAgICAgIHN0b3JlPXttb2RlbC5nZXRTdG9yZSgpfVxuICAgICAgYnJpZGdlID0ge21vZGVsLmdldEJyaWRnZSgpfVxuICAgICAgYWN0aW9ucz17bW9kZWwuZ2V0QWN0aW9ucygpfVxuICAgICAgYnJlYWtwb2ludFN0b3JlPXttb2RlbC5nZXRCcmVha3BvaW50U3RvcmUoKX1cbiAgICAvPixcbiAgICBlbGVtKTtcbiAgcmV0dXJuIGVsZW07XG59XG5cbmNsYXNzIEFjdGl2YXRpb24ge1xuICBfZGlzcG9zYWJsZXM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIF9tb2RlbDogRGVidWdnZXJNb2RlbDtcbiAgX3BhbmVsOiA/T2JqZWN0O1xuICBfbGF1bmNoQXR0YWNoRGlhbG9nOiA/YXRvbSRQYW5lbDtcblxuICBjb25zdHJ1Y3RvcihzdGF0ZTogP1NlcmlhbGl6ZWRTdGF0ZSkge1xuICAgIHRoaXMuX21vZGVsID0gbmV3IERlYnVnZ2VyTW9kZWwoc3RhdGUpO1xuICAgIHRoaXMuX3BhbmVsID0gbnVsbDtcbiAgICB0aGlzLl9sYXVuY2hBdHRhY2hEaWFsb2cgPSBudWxsO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoXG4gICAgICB0aGlzLl9tb2RlbCxcbiAgICAgIGF0b20udmlld3MuYWRkVmlld1Byb3ZpZGVyKERlYnVnZ2VyTW9kZWwsIGNyZWF0ZURlYnVnZ2VyVmlldyksXG5cbiAgICAgIC8vIExpc3RlbiBmb3IgcmVtb3ZlZCBwcm9qZWN0cyBhbmQga2lsbCB0aGUgYXNzb2NpYXRlZCBkZWJ1Z2dlciBpZiBpdCBpcyBhdHRhY2hlZC5cbiAgICAgIGF0b20ucHJvamVjdC5vbkRpZENoYW5nZVBhdGhzKHByb2plY3RQYXRocyA9PiB7XG4gICAgICAgIGNvbnN0IGRlYnVnZ2VyUHJvY2VzcyA9IHRoaXMuX21vZGVsLmdldFN0b3JlKCkuZ2V0RGVidWdnZXJQcm9jZXNzKCk7XG4gICAgICAgIGlmIChkZWJ1Z2dlclByb2Nlc3MgPT0gbnVsbCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBkZWJ1Z2VlUHJvamVjdFBhdGggPSBkZWJ1Z2dlclByb2Nlc3MuZ2V0VGFyZ2V0VXJpKCk7XG4gICAgICAgIGlmIChwcm9qZWN0UGF0aHMuaW5kZXhPZihkZWJ1Z2VlUHJvamVjdFBhdGgpIDwgMCkge1xuICAgICAgICAgIHRoaXMuX21vZGVsLmdldEFjdGlvbnMoKS5raWxsRGVidWdnZXIoKTtcbiAgICAgICAgfVxuICAgICAgfSksXG5cbiAgICAgIC8vIENvbW1hbmRzLlxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywge1xuICAgICAgICAnbnVjbGlkZS1kZWJ1Z2dlcjp0b2dnbGUnOiB0aGlzLl90b2dnbGUuYmluZCh0aGlzKSxcbiAgICAgIH0pLFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywge1xuICAgICAgICAnbnVjbGlkZS1kZWJ1Z2dlcjpzaG93JzogdGhpcy5fc2hvdy5iaW5kKHRoaXMpLFxuICAgICAgfSksXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS13b3Jrc3BhY2UnLCB7XG4gICAgICAgICdudWNsaWRlLWRlYnVnZ2VyOmNvbnRpbnVlLWRlYnVnZ2luZyc6IHRoaXMuX2NvbnRpbnVlLmJpbmQodGhpcyksXG4gICAgICB9KSxcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsIHtcbiAgICAgICAgJ251Y2xpZGUtZGVidWdnZXI6c3RvcC1kZWJ1Z2dpbmcnOiB0aGlzLl9zdG9wLmJpbmQodGhpcyksXG4gICAgICB9KSxcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsIHtcbiAgICAgICAgJ251Y2xpZGUtZGVidWdnZXI6c3RlcC1vdmVyJzogdGhpcy5fc3RlcE92ZXIuYmluZCh0aGlzKSxcbiAgICAgIH0pLFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywge1xuICAgICAgICAnbnVjbGlkZS1kZWJ1Z2dlcjpzdGVwLWludG8nOiB0aGlzLl9zdGVwSW50by5iaW5kKHRoaXMpLFxuICAgICAgfSksXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS13b3Jrc3BhY2UnLCB7XG4gICAgICAgICdudWNsaWRlLWRlYnVnZ2VyOnN0ZXAtb3V0JzogdGhpcy5fc3RlcE91dC5iaW5kKHRoaXMpLFxuICAgICAgfSksXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS13b3Jrc3BhY2UnLCB7XG4gICAgICAgICdudWNsaWRlLWRlYnVnZ2VyOnRvZ2dsZS1icmVha3BvaW50JzogdGhpcy5fdG9nZ2xlQnJlYWtwb2ludC5iaW5kKHRoaXMpLFxuICAgICAgfSksXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS13b3Jrc3BhY2UnLCB7XG4gICAgICAgICdudWNsaWRlLWRlYnVnZ2VyOnRvZ2dsZS1sYXVuY2gtYXR0YWNoJzogdGhpcy5fdG9nZ2xlTGF1bmNoQXR0YWNoRGlhbG9nLmJpbmQodGhpcyksXG4gICAgICB9KSxcblxuICAgICAgLy8gQ29udGV4dCBNZW51IEl0ZW1zLlxuICAgICAgYXRvbS5jb250ZXh0TWVudS5hZGQoe1xuICAgICAgICAnYXRvbS10ZXh0LWVkaXRvcic6IFtcbiAgICAgICAgICB7dHlwZTogJ3NlcGFyYXRvcid9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIGxhYmVsOiAnRGVidWdnZXInLFxuICAgICAgICAgICAgc3VibWVudTogW1xuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbGFiZWw6ICdUb2dnbGUgQnJlYWtwb2ludCcsXG4gICAgICAgICAgICAgICAgY29tbWFuZDogJ251Y2xpZGUtZGVidWdnZXI6dG9nZ2xlLWJyZWFrcG9pbnQnLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHt0eXBlOiAnc2VwYXJhdG9yJ30sXG4gICAgICAgIF0sXG4gICAgICB9KSxcbiAgICApO1xuICAgICh0aGlzOiBhbnkpLl9oaWRlTGF1bmNoQXR0YWNoRGlhbG9nID0gdGhpcy5faGlkZUxhdW5jaEF0dGFjaERpYWxvZy5iaW5kKHRoaXMpO1xuICB9XG5cbiAgc2VyaWFsaXplKCk6IFNlcmlhbGl6ZWRTdGF0ZSB7XG4gICAgY29uc3Qgc3RhdGUgPSB7XG4gICAgICBicmVha3BvaW50czogdGhpcy5nZXRNb2RlbCgpLmdldEJyZWFrcG9pbnRTdG9yZSgpLmdldFNlcmlhbGl6ZWRCcmVha3BvaW50cygpLFxuICAgIH07XG4gICAgcmV0dXJuIHN0YXRlO1xuICB9XG5cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gICAgaWYgKHRoaXMuX3BhbmVsKSB7XG4gICAgICB0aGlzLl9wYW5lbC5kZXN0cm95KCk7XG4gICAgfVxuICB9XG5cbiAgZ2V0TW9kZWwoKTogRGVidWdnZXJNb2RlbCB7XG4gICAgcmV0dXJuIHRoaXMuX21vZGVsO1xuICB9XG5cbiAgX3RvZ2dsZSgpIHtcbiAgICBjb25zdCBwYW5lbCA9IHRoaXMuX2dldFBhbmVsKCk7XG4gICAgaWYgKHBhbmVsLmlzVmlzaWJsZSgpKSB7XG4gICAgICBwYW5lbC5oaWRlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBhbmVsLnNob3coKTtcbiAgICB9XG4gIH1cblxuICBfc2hvdygpIHtcbiAgICB0aGlzLl9nZXRQYW5lbCgpLnNob3coKTtcbiAgfVxuXG4gIF9jb250aW51ZSgpIHtcbiAgICAvLyBUT0RPKGplZmZyZXl0YW4pOiB3aGVuIHdlIGZpZ3VyZWQgb3V0IHRoZSBsYXVuY2ggbGlmZWN5Y2xlIHN0b3J5XG4gICAgLy8gd2UgbWF5IGJpbmQgdGhpcyB0byBzdGFydC1kZWJ1Z2dpbmcgdG9vLlxuICAgIHRoaXMuX21vZGVsLmdldEJyaWRnZSgpLmNvbnRpbnVlKCk7XG4gIH1cblxuICBfc3RvcCgpIHtcbiAgICB0aGlzLl9tb2RlbC5nZXRBY3Rpb25zKCkua2lsbERlYnVnZ2VyKCk7XG4gIH1cblxuICBfc3RlcE92ZXIoKSB7XG4gICAgdGhpcy5fbW9kZWwuZ2V0QnJpZGdlKCkuc3RlcE92ZXIoKTtcbiAgfVxuXG4gIF9zdGVwSW50bygpIHtcbiAgICB0aGlzLl9tb2RlbC5nZXRCcmlkZ2UoKS5zdGVwSW50bygpO1xuICB9XG5cbiAgX3N0ZXBPdXQoKSB7XG4gICAgdGhpcy5fbW9kZWwuZ2V0QnJpZGdlKCkuc3RlcE91dCgpO1xuICB9XG5cbiAgQHRyYWNrVGltaW5nKCdudWNsaWRlLWRlYnVnZ2VyLWF0b206dG9nZ2xlQnJlYWtwb2ludCcpXG4gIF90b2dnbGVCcmVha3BvaW50KCkge1xuICAgIGNvbnN0IGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKTtcbiAgICBpZiAoZWRpdG9yICYmIGVkaXRvci5nZXRQYXRoKCkpIHtcbiAgICAgIGNvbnN0IGZpbGVQYXRoID0gZWRpdG9yLmdldFBhdGgoKTtcbiAgICAgIGlmIChmaWxlUGF0aCkge1xuICAgICAgICBjb25zdCBsaW5lID0gZWRpdG9yLmdldExhc3RDdXJzb3IoKS5nZXRCdWZmZXJSb3coKTtcbiAgICAgICAgdGhpcy5nZXRNb2RlbCgpLmdldEJyZWFrcG9pbnRTdG9yZSgpLnRvZ2dsZUJyZWFrcG9pbnQoZmlsZVBhdGgsIGxpbmUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG5cbiAgX3RvZ2dsZUxhdW5jaEF0dGFjaERpYWxvZygpOiB2b2lkIHtcbiAgICBjb25zdCBkaWFsb2cgPSB0aGlzLl9nZXRMYXVuY2hBdHRhY2hEaWFsb2coKTtcbiAgICBpZiAoZGlhbG9nLmlzVmlzaWJsZSgpKSB7XG4gICAgICBkaWFsb2cuaGlkZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBkaWFsb2cuc2hvdygpO1xuICAgIH1cbiAgfVxuXG4gIF9oaWRlTGF1bmNoQXR0YWNoRGlhbG9nKCk6IHZvaWQge1xuICAgIGNvbnN0IGRpYWxvZyA9IHRoaXMuX2dldExhdW5jaEF0dGFjaERpYWxvZygpO1xuICAgIGlmIChkaWFsb2cuaXNWaXNpYmxlKCkpIHtcbiAgICAgIGRpYWxvZy5oaWRlKCk7XG4gICAgfVxuICB9XG5cbiAgX2dldExhdW5jaEF0dGFjaERpYWxvZygpOiBhdG9tJFBhbmVsIHtcbiAgICBpZiAoIXRoaXMuX2xhdW5jaEF0dGFjaERpYWxvZykge1xuICAgICAgY29uc3QgY29tcG9uZW50ID0gKFxuICAgICAgICA8RGVidWdnZXJMYXVuY2hBdHRhY2hVSVxuICAgICAgICAgIHN0b3JlPXt0aGlzLl9tb2RlbC5nZXREZWJ1Z2dlclByb3ZpZGVyU3RvcmUoKX1cbiAgICAgICAgICBkZWJ1Z2dlckFjdGlvbnM9e3RoaXMuX21vZGVsLmdldEFjdGlvbnMoKX1cbiAgICAgICAgLz5cbiAgICAgICk7XG4gICAgICBjb25zdCBob3N0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICBSZWFjdERPTS5yZW5kZXIoY29tcG9uZW50LCBob3N0KTtcbiAgICAgIHRoaXMuX2xhdW5jaEF0dGFjaERpYWxvZyA9IGF0b20ud29ya3NwYWNlLmFkZE1vZGFsUGFuZWwoe1xuICAgICAgICBpdGVtOiBob3N0LFxuICAgICAgICB2aXNpYmxlOiBmYWxzZSwgLy8gSGlkZSBmaXJzdCBzbyB0aGF0IGNhbGxlciBjYW4gdG9nZ2xlIGl0IHZpc2libGUuXG4gICAgICB9KTtcblxuICAgICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgICBuZXcgRGlzcG9zYWJsZSgoKSA9PiB7XG4gICAgICAgICAgaWYgKHRoaXMuX2xhdW5jaEF0dGFjaERpYWxvZyAhPSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLl9sYXVuY2hBdHRhY2hEaWFsb2cuZGVzdHJveSgpO1xuICAgICAgICAgICAgdGhpcy5fbGF1bmNoQXR0YWNoRGlhbG9nID0gbnVsbDtcbiAgICAgICAgICB9XG4gICAgICAgIH0pLFxuICAgICAgICBhdG9tLmNvbW1hbmRzLmFkZChcbiAgICAgICAgICAnYXRvbS13b3Jrc3BhY2UnLFxuICAgICAgICAgICdjb3JlOmNhbmNlbCcsXG4gICAgICAgICAgdGhpcy5faGlkZUxhdW5jaEF0dGFjaERpYWxvZyxcbiAgICAgICAgKSxcbiAgICAgICk7XG4gICAgfVxuICAgIGludmFyaWFudCh0aGlzLl9sYXVuY2hBdHRhY2hEaWFsb2cpO1xuICAgIHJldHVybiB0aGlzLl9sYXVuY2hBdHRhY2hEaWFsb2c7XG4gIH1cblxuICAvKipcbiAgICogTGF6eSBwYW5lbCBjcmVhdGlvbi5cbiAgICovXG4gIF9nZXRQYW5lbCgpOiBPYmplY3Qge1xuICAgIGlmICghdGhpcy5fcGFuZWwpIHtcbiAgICAgIGNvbnN0IHBhbmVsID0gYXRvbS53b3Jrc3BhY2UuYWRkUmlnaHRQYW5lbCh7XG4gICAgICAgIGl0ZW06IHRoaXMuX21vZGVsLFxuICAgICAgICB2aXNpYmxlOiBmYWxzZSxcbiAgICAgIH0pO1xuICAgICAgLy8gRmxvdyBkb2Vzbid0IHRyYWNrIG5vbi1udWxsIHdoZW4gYXNzaWduaW5nIGludG8gbnVsbGFibGUgZGlyZWN0bHkuXG4gICAgICB0aGlzLl9wYW5lbCA9IHBhbmVsO1xuICAgICAgcmV0dXJuIHBhbmVsO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5fcGFuZWw7XG4gICAgfVxuICB9XG59XG5cbmxldCBhY3RpdmF0aW9uID0gbnVsbDtcbmxldCB0b29sQmFyOiA/YW55ID0gbnVsbDtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGFjdGl2YXRlKHN0YXRlOiA/U2VyaWFsaXplZFN0YXRlKSB7XG4gICAgaWYgKCFhY3RpdmF0aW9uKSB7XG4gICAgICBhY3RpdmF0aW9uID0gbmV3IEFjdGl2YXRpb24oc3RhdGUpO1xuICAgIH1cbiAgfSxcblxuICBzZXJpYWxpemUoKTogU2VyaWFsaXplZFN0YXRlIHtcbiAgICBpZiAoYWN0aXZhdGlvbikge1xuICAgICAgcmV0dXJuIGFjdGl2YXRpb24uc2VyaWFsaXplKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGJyZWFrcG9pbnRzOiBudWxsLFxuICAgICAgfTtcbiAgICB9XG4gIH0sXG5cbiAgZGVhY3RpdmF0ZSgpIHtcbiAgICBpZiAoYWN0aXZhdGlvbikge1xuICAgICAgYWN0aXZhdGlvbi5kaXNwb3NlKCk7XG4gICAgICBhY3RpdmF0aW9uID0gbnVsbDtcbiAgICB9XG4gICAgaWYgKHRvb2xCYXIpIHtcbiAgICAgIHRvb2xCYXIucmVtb3ZlSXRlbXMoKTtcbiAgICB9XG4gIH0sXG5cbiAgY29uc3VtZU51Y2xpZGVEZWJ1Z2dlcihzZXJ2aWNlOiBudWNsaWRlX2RlYnVnZ2VyJFNlcnZpY2UpOiBEaXNwb3NhYmxlIHtcbiAgICBpZiAoYWN0aXZhdGlvbikge1xuICAgICAgYWN0aXZhdGlvbi5nZXRNb2RlbCgpLmdldEFjdGlvbnMoKS5hZGRTZXJ2aWNlKHNlcnZpY2UpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgaWYgKGFjdGl2YXRpb24pIHtcbiAgICAgICAgYWN0aXZhdGlvbi5nZXRNb2RlbCgpLmdldEFjdGlvbnMoKS5yZW1vdmVTZXJ2aWNlKHNlcnZpY2UpO1xuICAgICAgfVxuICAgIH0pO1xuICB9LFxuXG4gIGNvbnN1bWVEZWJ1Z2dlclByb3ZpZGVyKFxuICAgIHByb3ZpZGVyOiBOdWNsaWRlRGVidWdnZXJQcm92aWRlclxuICApOiBJRGlzcG9zYWJsZSB7XG4gICAgaWYgKGFjdGl2YXRpb24pIHtcbiAgICAgIGFjdGl2YXRpb24uZ2V0TW9kZWwoKS5nZXRBY3Rpb25zKCkuYWRkRGVidWdnZXJQcm92aWRlcihwcm92aWRlcik7XG4gICAgfVxuICAgIHJldHVybiBuZXcgRGlzcG9zYWJsZSgoKSA9PiB7XG4gICAgICBpZiAoYWN0aXZhdGlvbikge1xuICAgICAgICBhY3RpdmF0aW9uLmdldE1vZGVsKCkuZ2V0QWN0aW9ucygpLnJlbW92ZURlYnVnZ2VyUHJvdmlkZXIocHJvdmlkZXIpO1xuICAgICAgfVxuICAgIH0pO1xuICB9LFxuXG4gIERlYnVnZ2VyUHJvY2Vzc0luZm86IHJlcXVpcmUoJy4vRGVidWdnZXJQcm9jZXNzSW5mbycpLFxuICBEZWJ1Z2dlckluc3RhbmNlOiByZXF1aXJlKCcuL0RlYnVnZ2VySW5zdGFuY2UnKSxcbiAgRGVidWdnZXJMYXVuY2hBdHRhY2hQcm92aWRlcjogcmVxdWlyZSgnLi9EZWJ1Z2dlckxhdW5jaEF0dGFjaFByb3ZpZGVyJyksXG5cbiAgY29uc3VtZVRvb2xCYXIoZ2V0VG9vbEJhcjogKGdyb3VwOiBzdHJpbmcpID0+IE9iamVjdCk6IHZvaWQge1xuICAgIHRvb2xCYXIgPSBnZXRUb29sQmFyKCdudWNsaWRlLWRlYnVnZ2VyJyk7XG4gICAgdG9vbEJhci5hZGRCdXR0b24oe1xuICAgICAgaWNvbjogJ3BsdWcnLFxuICAgICAgY2FsbGJhY2s6ICdudWNsaWRlLWRlYnVnZ2VyOnRvZ2dsZScsXG4gICAgICB0b29sdGlwOiAnVG9nZ2xlIERlYnVnZ2VyJyxcbiAgICAgIHByaW9yaXR5OiAxMDAsXG4gICAgfSk7XG4gIH0sXG5cbiAgcHJvdmlkZVJlbW90ZUNvbnRyb2xTZXJ2aWNlKCk6IFJlbW90ZUNvbnRyb2xTZXJ2aWNlIHtcbiAgICByZXR1cm4gbmV3IFJlbW90ZUNvbnRyb2xTZXJ2aWNlKCgpID0+IGFjdGl2YXRpb24gPyBhY3RpdmF0aW9uLmdldE1vZGVsKCkgOiBudWxsKTtcbiAgfSxcbn07XG4iXX0=