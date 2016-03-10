Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === 'function') { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError('The decorator for method ' + descriptor.key + ' is of the invalid type ' + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _analytics = require('../../../analytics');

var _RemoteControlService = require('./RemoteControlService');

var _RemoteControlService2 = _interopRequireDefault(_RemoteControlService);

var _DebuggerModel = require('./DebuggerModel');

var _DebuggerModel2 = _interopRequireDefault(_DebuggerModel);

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _require = require('atom');

var CompositeDisposable = _require.CompositeDisposable;
var Disposable = _require.Disposable;

function createDebuggerView(model) {
  var DebuggerControllerView = require('./DebuggerControllerView');

  var _require2 = require('react-for-atom');

  var React = _require2.React;
  var ReactDOM = _require2.ReactDOM;

  var elem = document.createElement('div');
  elem.className = 'nuclide-debugger-root';
  ReactDOM.render(React.createElement(DebuggerControllerView, {
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
    this._disposables = new CompositeDisposable(this._model, atom.views.addViewProvider(_DebuggerModel2['default'], createDebuggerView),

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
    decorators: [(0, _analytics.trackTiming)('nuclide-debugger-atom:toggleBreakpoint')],
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
    return new Disposable(function () {
      if (activation) {
        activation.getModel().getActions().removeService(service);
      }
    });
  },

  consumeDebuggerProvider: function consumeDebuggerProvider(provider) {
    if (activation) {
      activation.getModel().getActions().addDebuggerProvider(provider);
    }
    return new Disposable(function () {
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
//# sourceMappingURL=data:application/json;base64,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QUF5QjtBQUNuQyxhQUFPLEVBQUUsaUJBQWlCO0FBQzFCLGNBQVEsRUFBRSxHQUFHO0tBQ2QsQ0FBQyxDQUFDO0dBQ0o7O0FBRUQsNkJBQTJCLEVBQUEsdUNBQXlCO0FBQ2xELFdBQU8sc0NBQXlCO2FBQU0sVUFBVSxHQUFHLFVBQVUsQ0FBQyxRQUFRLEVBQUUsR0FBRyxJQUFJO0tBQUEsQ0FBQyxDQUFDO0dBQ2xGO0NBQ0YsQ0FBQyIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuY29uc3Qge0NvbXBvc2l0ZURpc3Bvc2FibGUsIERpc3Bvc2FibGV9ID0gcmVxdWlyZSgnYXRvbScpO1xuaW1wb3J0IHt0cmFja1RpbWluZ30gZnJvbSAnLi4vLi4vLi4vYW5hbHl0aWNzJztcblxuaW1wb3J0IHR5cGUge1xuICBudWNsaWRlX2RlYnVnZ2VyJFNlcnZpY2UsXG4gIE51Y2xpZGVEZWJ1Z2dlclByb3ZpZGVyLFxufSBmcm9tICcuLi8uLi9pbnRlcmZhY2VzL3NlcnZpY2UnO1xuaW1wb3J0IFJlbW90ZUNvbnRyb2xTZXJ2aWNlIGZyb20gJy4vUmVtb3RlQ29udHJvbFNlcnZpY2UnO1xuaW1wb3J0IERlYnVnZ2VyTW9kZWwgZnJvbSAnLi9EZWJ1Z2dlck1vZGVsJztcbmltcG9ydCB0eXBlIHtTZXJpYWxpemVkQnJlYWtwb2ludH0gZnJvbSAnLi9CcmVha3BvaW50U3RvcmUnO1xuXG5leHBvcnQgdHlwZSBTZXJpYWxpemVkU3RhdGUgPSB7XG4gIGJyZWFrcG9pbnRzOiA/QXJyYXk8U2VyaWFsaXplZEJyZWFrcG9pbnQ+O1xufTtcblxuZnVuY3Rpb24gY3JlYXRlRGVidWdnZXJWaWV3KG1vZGVsOiBEZWJ1Z2dlck1vZGVsKTogSFRNTEVsZW1lbnQge1xuICBjb25zdCBEZWJ1Z2dlckNvbnRyb2xsZXJWaWV3ID0gcmVxdWlyZSgnLi9EZWJ1Z2dlckNvbnRyb2xsZXJWaWV3Jyk7XG4gIGNvbnN0IHtcbiAgICBSZWFjdCxcbiAgICBSZWFjdERPTSxcbiAgfSA9IHJlcXVpcmUoJ3JlYWN0LWZvci1hdG9tJyk7XG4gIGNvbnN0IGVsZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgZWxlbS5jbGFzc05hbWUgPSAnbnVjbGlkZS1kZWJ1Z2dlci1yb290JztcbiAgUmVhY3RET00ucmVuZGVyKFxuICAgIDxEZWJ1Z2dlckNvbnRyb2xsZXJWaWV3XG4gICAgICBzdG9yZT17bW9kZWwuZ2V0U3RvcmUoKX1cbiAgICAgIGJyaWRnZSA9IHttb2RlbC5nZXRCcmlkZ2UoKX1cbiAgICAgIGFjdGlvbnM9e21vZGVsLmdldEFjdGlvbnMoKX1cbiAgICAgIGJyZWFrcG9pbnRTdG9yZT17bW9kZWwuZ2V0QnJlYWtwb2ludFN0b3JlKCl9XG4gICAgLz4sXG4gICAgZWxlbSk7XG4gIHJldHVybiBlbGVtO1xufVxuXG5jbGFzcyBBY3RpdmF0aW9uIHtcbiAgX2Rpc3Bvc2FibGVzOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuXG4gIF9tb2RlbDogRGVidWdnZXJNb2RlbDtcbiAgX3BhbmVsOiA/T2JqZWN0O1xuXG4gIGNvbnN0cnVjdG9yKHN0YXRlOiA/U2VyaWFsaXplZFN0YXRlKSB7XG4gICAgdGhpcy5fbW9kZWwgPSBuZXcgRGVidWdnZXJNb2RlbChzdGF0ZSk7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZShcbiAgICAgIHRoaXMuX21vZGVsLFxuICAgICAgYXRvbS52aWV3cy5hZGRWaWV3UHJvdmlkZXIoRGVidWdnZXJNb2RlbCwgY3JlYXRlRGVidWdnZXJWaWV3KSxcblxuICAgICAgLy8gTGlzdGVuIGZvciByZW1vdmVkIHByb2plY3RzIGFuZCBraWxsIHRoZSBhc3NvY2lhdGVkIGRlYnVnZ2VyIGlmIGl0IGlzIGF0dGFjaGVkLlxuICAgICAgYXRvbS5wcm9qZWN0Lm9uRGlkQ2hhbmdlUGF0aHMocHJvamVjdFBhdGhzID0+IHtcbiAgICAgICAgY29uc3QgZGVidWdnZXJQcm9jZXNzID0gdGhpcy5fbW9kZWwuZ2V0U3RvcmUoKS5nZXREZWJ1Z2dlclByb2Nlc3MoKTtcbiAgICAgICAgaWYgKGRlYnVnZ2VyUHJvY2VzcyA9PSBudWxsKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGRlYnVnZWVQcm9qZWN0UGF0aCA9IGRlYnVnZ2VyUHJvY2Vzcy5nZXRUYXJnZXRVcmkoKTtcbiAgICAgICAgaWYgKHByb2plY3RQYXRocy5pbmRleE9mKGRlYnVnZWVQcm9qZWN0UGF0aCkgPCAwKSB7XG4gICAgICAgICAgdGhpcy5fbW9kZWwuZ2V0QWN0aW9ucygpLmtpbGxEZWJ1Z2dlcigpO1xuICAgICAgICB9XG4gICAgICB9KSxcblxuICAgICAgLy8gQ29tbWFuZHMuXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS13b3Jrc3BhY2UnLCB7XG4gICAgICAgICdudWNsaWRlLWRlYnVnZ2VyOnRvZ2dsZSc6IHRoaXMuX3RvZ2dsZS5iaW5kKHRoaXMpLFxuICAgICAgfSksXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS13b3Jrc3BhY2UnLCB7XG4gICAgICAgICdudWNsaWRlLWRlYnVnZ2VyOnNob3cnOiB0aGlzLl9zaG93LmJpbmQodGhpcyksXG4gICAgICB9KSxcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsIHtcbiAgICAgICAgJ251Y2xpZGUtZGVidWdnZXI6Y29udGludWUtZGVidWdnaW5nJzogdGhpcy5fY29udGludWUuYmluZCh0aGlzKSxcbiAgICAgIH0pLFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywge1xuICAgICAgICAnbnVjbGlkZS1kZWJ1Z2dlcjpzdG9wLWRlYnVnZ2luZyc6IHRoaXMuX3N0b3AuYmluZCh0aGlzKSxcbiAgICAgIH0pLFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywge1xuICAgICAgICAnbnVjbGlkZS1kZWJ1Z2dlcjpzdGVwLW92ZXInOiB0aGlzLl9zdGVwT3Zlci5iaW5kKHRoaXMpLFxuICAgICAgfSksXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS13b3Jrc3BhY2UnLCB7XG4gICAgICAgICdudWNsaWRlLWRlYnVnZ2VyOnN0ZXAtaW50byc6IHRoaXMuX3N0ZXBJbnRvLmJpbmQodGhpcyksXG4gICAgICB9KSxcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsIHtcbiAgICAgICAgJ251Y2xpZGUtZGVidWdnZXI6c3RlcC1vdXQnOiB0aGlzLl9zdGVwT3V0LmJpbmQodGhpcyksXG4gICAgICB9KSxcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsIHtcbiAgICAgICAgJ251Y2xpZGUtZGVidWdnZXI6dG9nZ2xlLWJyZWFrcG9pbnQnOiB0aGlzLl90b2dnbGVCcmVha3BvaW50LmJpbmQodGhpcyksXG4gICAgICB9KSxcblxuICAgICAgLy8gQ29udGV4dCBNZW51IEl0ZW1zLlxuICAgICAgYXRvbS5jb250ZXh0TWVudS5hZGQoe1xuICAgICAgICAnYXRvbS10ZXh0LWVkaXRvcic6IFtcbiAgICAgICAgICB7dHlwZTogJ3NlcGFyYXRvcid9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIGxhYmVsOiAnRGVidWdnZXInLFxuICAgICAgICAgICAgc3VibWVudTogW1xuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbGFiZWw6ICdUb2dnbGUgQnJlYWtwb2ludCcsXG4gICAgICAgICAgICAgICAgY29tbWFuZDogJ251Y2xpZGUtZGVidWdnZXI6dG9nZ2xlLWJyZWFrcG9pbnQnLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHt0eXBlOiAnc2VwYXJhdG9yJ30sXG4gICAgICAgIF0sXG4gICAgICB9KSxcbiAgICApO1xuICB9XG5cbiAgc2VyaWFsaXplKCk6IFNlcmlhbGl6ZWRTdGF0ZSB7XG4gICAgY29uc3Qgc3RhdGUgPSB7XG4gICAgICBicmVha3BvaW50czogdGhpcy5nZXRNb2RlbCgpLmdldEJyZWFrcG9pbnRTdG9yZSgpLmdldFNlcmlhbGl6ZWRCcmVha3BvaW50cygpLFxuICAgIH07XG4gICAgcmV0dXJuIHN0YXRlO1xuICB9XG5cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gICAgaWYgKHRoaXMuX3BhbmVsKSB7XG4gICAgICB0aGlzLl9wYW5lbC5kZXN0cm95KCk7XG4gICAgfVxuICB9XG5cbiAgZ2V0TW9kZWwoKTogRGVidWdnZXJNb2RlbCB7XG4gICAgcmV0dXJuIHRoaXMuX21vZGVsO1xuICB9XG5cbiAgX3RvZ2dsZSgpIHtcbiAgICBjb25zdCBwYW5lbCA9IHRoaXMuX2dldFBhbmVsKCk7XG4gICAgaWYgKHBhbmVsLmlzVmlzaWJsZSgpKSB7XG4gICAgICBwYW5lbC5oaWRlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBhbmVsLnNob3coKTtcbiAgICB9XG4gIH1cblxuICBfc2hvdygpIHtcbiAgICB0aGlzLl9nZXRQYW5lbCgpLnNob3coKTtcbiAgfVxuXG4gIF9jb250aW51ZSgpIHtcbiAgICAvLyBUT0RPKGplZmZyZXl0YW4pOiB3aGVuIHdlIGZpZ3VyZWQgb3V0IHRoZSBsYXVuY2ggbGlmZWN5Y2xlIHN0b3J5XG4gICAgLy8gd2UgbWF5IGJpbmQgdGhpcyB0byBzdGFydC1kZWJ1Z2dpbmcgdG9vLlxuICAgIHRoaXMuX21vZGVsLmdldEJyaWRnZSgpLmNvbnRpbnVlKCk7XG4gIH1cblxuICBfc3RvcCgpIHtcbiAgICB0aGlzLl9tb2RlbC5nZXRBY3Rpb25zKCkua2lsbERlYnVnZ2VyKCk7XG4gIH1cblxuICBfc3RlcE92ZXIoKSB7XG4gICAgdGhpcy5fbW9kZWwuZ2V0QnJpZGdlKCkuc3RlcE92ZXIoKTtcbiAgfVxuXG4gIF9zdGVwSW50bygpIHtcbiAgICB0aGlzLl9tb2RlbC5nZXRCcmlkZ2UoKS5zdGVwSW50bygpO1xuICB9XG5cbiAgX3N0ZXBPdXQoKSB7XG4gICAgdGhpcy5fbW9kZWwuZ2V0QnJpZGdlKCkuc3RlcE91dCgpO1xuICB9XG5cbiAgQHRyYWNrVGltaW5nKCdudWNsaWRlLWRlYnVnZ2VyLWF0b206dG9nZ2xlQnJlYWtwb2ludCcpXG4gIF90b2dnbGVCcmVha3BvaW50KCkge1xuICAgIGNvbnN0IGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKTtcbiAgICBpZiAoZWRpdG9yICYmIGVkaXRvci5nZXRQYXRoKCkpIHtcbiAgICAgIGNvbnN0IGZpbGVQYXRoID0gZWRpdG9yLmdldFBhdGgoKTtcbiAgICAgIGlmIChmaWxlUGF0aCkge1xuICAgICAgICBjb25zdCBsaW5lID0gZWRpdG9yLmdldExhc3RDdXJzb3IoKS5nZXRCdWZmZXJSb3coKTtcbiAgICAgICAgdGhpcy5nZXRNb2RlbCgpLmdldEJyZWFrcG9pbnRTdG9yZSgpLnRvZ2dsZUJyZWFrcG9pbnQoZmlsZVBhdGgsIGxpbmUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBMYXp5IHBhbmVsIGNyZWF0aW9uLlxuICAgKi9cbiAgX2dldFBhbmVsKCk6IE9iamVjdCB7XG4gICAgaWYgKCF0aGlzLl9wYW5lbCkge1xuICAgICAgY29uc3QgcGFuZWwgPSBhdG9tLndvcmtzcGFjZS5hZGRSaWdodFBhbmVsKHtcbiAgICAgICAgaXRlbTogdGhpcy5fbW9kZWwsXG4gICAgICAgIHZpc2libGU6IGZhbHNlLFxuICAgICAgfSk7XG4gICAgICAvLyBGbG93IGRvZXNuJ3QgdHJhY2sgbm9uLW51bGwgd2hlbiBhc3NpZ25pbmcgaW50byBudWxsYWJsZSBkaXJlY3RseS5cbiAgICAgIHRoaXMuX3BhbmVsID0gcGFuZWw7XG4gICAgICByZXR1cm4gcGFuZWw7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLl9wYW5lbDtcbiAgICB9XG4gIH1cbn1cblxubGV0IGFjdGl2YXRpb24gPSBudWxsO1xubGV0IHRvb2xCYXI6ID9hbnkgPSBudWxsO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgYWN0aXZhdGUoc3RhdGU6ID9TZXJpYWxpemVkU3RhdGUpIHtcbiAgICBpZiAoIWFjdGl2YXRpb24pIHtcbiAgICAgIGFjdGl2YXRpb24gPSBuZXcgQWN0aXZhdGlvbihzdGF0ZSk7XG4gICAgfVxuICB9LFxuXG4gIHNlcmlhbGl6ZSgpOiBTZXJpYWxpemVkU3RhdGUge1xuICAgIGlmIChhY3RpdmF0aW9uKSB7XG4gICAgICByZXR1cm4gYWN0aXZhdGlvbi5zZXJpYWxpemUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgYnJlYWtwb2ludHM6IG51bGwsXG4gICAgICB9O1xuICAgIH1cbiAgfSxcblxuICBkZWFjdGl2YXRlKCkge1xuICAgIGlmIChhY3RpdmF0aW9uKSB7XG4gICAgICBhY3RpdmF0aW9uLmRpc3Bvc2UoKTtcbiAgICAgIGFjdGl2YXRpb24gPSBudWxsO1xuICAgIH1cbiAgICBpZiAodG9vbEJhcikge1xuICAgICAgdG9vbEJhci5yZW1vdmVJdGVtcygpO1xuICAgIH1cbiAgfSxcblxuICBjb25zdW1lTnVjbGlkZURlYnVnZ2VyKHNlcnZpY2U6IG51Y2xpZGVfZGVidWdnZXIkU2VydmljZSk6IERpc3Bvc2FibGUge1xuICAgIGlmIChhY3RpdmF0aW9uKSB7XG4gICAgICBhY3RpdmF0aW9uLmdldE1vZGVsKCkuZ2V0QWN0aW9ucygpLmFkZFNlcnZpY2Uoc2VydmljZSk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgRGlzcG9zYWJsZSgoKSA9PiB7XG4gICAgICBpZiAoYWN0aXZhdGlvbikge1xuICAgICAgICBhY3RpdmF0aW9uLmdldE1vZGVsKCkuZ2V0QWN0aW9ucygpLnJlbW92ZVNlcnZpY2Uoc2VydmljZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0sXG5cbiAgY29uc3VtZURlYnVnZ2VyUHJvdmlkZXIoXG4gICAgcHJvdmlkZXI6IE51Y2xpZGVEZWJ1Z2dlclByb3ZpZGVyXG4gICk6IElEaXNwb3NhYmxlIHtcbiAgICBpZiAoYWN0aXZhdGlvbikge1xuICAgICAgYWN0aXZhdGlvbi5nZXRNb2RlbCgpLmdldEFjdGlvbnMoKS5hZGREZWJ1Z2dlclByb3ZpZGVyKHByb3ZpZGVyKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgIGlmIChhY3RpdmF0aW9uKSB7XG4gICAgICAgIGFjdGl2YXRpb24uZ2V0TW9kZWwoKS5nZXRBY3Rpb25zKCkucmVtb3ZlRGVidWdnZXJQcm92aWRlcihwcm92aWRlcik7XG4gICAgICB9XG4gICAgfSk7XG4gIH0sXG5cbiAgRGVidWdnZXJQcm9jZXNzSW5mbzogcmVxdWlyZSgnLi9EZWJ1Z2dlclByb2Nlc3NJbmZvJyksXG4gIERlYnVnZ2VySW5zdGFuY2U6IHJlcXVpcmUoJy4vRGVidWdnZXJJbnN0YW5jZScpLFxuICBEZWJ1Z2dlckxhdW5jaEF0dGFjaFByb3ZpZGVyOiByZXF1aXJlKCcuL0RlYnVnZ2VyTGF1bmNoQXR0YWNoUHJvdmlkZXInKSxcblxuICBjb25zdW1lVG9vbEJhcihnZXRUb29sQmFyOiAoZ3JvdXA6IHN0cmluZykgPT4gT2JqZWN0KTogdm9pZCB7XG4gICAgdG9vbEJhciA9IGdldFRvb2xCYXIoJ251Y2xpZGUtZGVidWdnZXInKTtcbiAgICB0b29sQmFyLmFkZEJ1dHRvbih7XG4gICAgICBpY29uOiAncGx1ZycsXG4gICAgICBjYWxsYmFjazogJ251Y2xpZGUtZGVidWdnZXI6dG9nZ2xlJyxcbiAgICAgIHRvb2x0aXA6ICdUb2dnbGUgRGVidWdnZXInLFxuICAgICAgcHJpb3JpdHk6IDEwMCxcbiAgICB9KTtcbiAgfSxcblxuICBwcm92aWRlUmVtb3RlQ29udHJvbFNlcnZpY2UoKTogUmVtb3RlQ29udHJvbFNlcnZpY2Uge1xuICAgIHJldHVybiBuZXcgUmVtb3RlQ29udHJvbFNlcnZpY2UoKCkgPT4gYWN0aXZhdGlvbiA/IGFjdGl2YXRpb24uZ2V0TW9kZWwoKSA6IG51bGwpO1xuICB9LFxufTtcbiJdfQ==