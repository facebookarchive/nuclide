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
    breakpointStore: model.getBreakpointStore() }), elem);
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
  DebuggerProcessInfo: require('./DebuggerProcessInfo'),
  DebuggerInstance: require('./DebuggerInstance'),

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
//# sourceMappingURL=data:application/json;base64,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QUFDO0tBQ25CO0FBQ0QsUUFBSSxPQUFPLEVBQUU7QUFDWCxhQUFPLENBQUMsV0FBVyxFQUFFLENBQUM7S0FDdkI7R0FDRjs7QUFFRCx3QkFBc0IsRUFBQSxnQ0FBQyxPQUFpQyxFQUFjO0FBQ3BFLFFBQUksVUFBVSxFQUFFO0FBQ2QsZ0JBQVUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7S0FDeEQ7QUFDRCxXQUFPLElBQUksVUFBVSxDQUFDLFlBQU07QUFDMUIsVUFBSSxVQUFVLEVBQUU7QUFDZCxrQkFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDLFVBQVUsRUFBRSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztPQUMzRDtLQUNGLENBQUMsQ0FBQztHQUNKO0FBQ0QscUJBQW1CLEVBQUUsT0FBTyxDQUFDLHVCQUF1QixDQUFDO0FBQ3JELGtCQUFnQixFQUFFLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQzs7QUFFL0MsZ0JBQWMsRUFBQSx3QkFBQyxVQUFxQyxFQUFRO0FBQzFELFdBQU8sR0FBRyxVQUFVLENBQUMsa0JBQWtCLENBQUMsQ0FBQztBQUN6QyxXQUFPLENBQUMsU0FBUyxDQUFDO0FBQ2hCLFVBQUksRUFBRSxNQUFNO0FBQ1osY0FBUSxFQUFFLHlCQUF5QjtBQUNuQyxhQUFPLEVBQUUsaUJBQWlCO0FBQzFCLGNBQVEsRUFBRSxHQUFHO0tBQ2QsQ0FBQyxDQUFDO0dBQ0o7O0FBRUQsNkJBQTJCLEVBQUEsdUNBQXlCO0FBQ2xELFdBQU8sc0NBQXlCO2FBQU0sVUFBVSxHQUFHLFVBQVUsQ0FBQyxRQUFRLEVBQUUsR0FBRyxJQUFJO0tBQUEsQ0FBQyxDQUFDO0dBQ2xGO0NBQ0YsQ0FBQyIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuY29uc3Qge0NvbXBvc2l0ZURpc3Bvc2FibGUsIERpc3Bvc2FibGV9ID0gcmVxdWlyZSgnYXRvbScpO1xuaW1wb3J0IHt0cmFja1RpbWluZ30gZnJvbSAnLi4vLi4vLi4vYW5hbHl0aWNzJztcblxuaW1wb3J0IHR5cGUge251Y2xpZGVfZGVidWdnZXIkU2VydmljZX0gZnJvbSAnLi4vLi4vaW50ZXJmYWNlcy9zZXJ2aWNlJztcbmltcG9ydCBSZW1vdGVDb250cm9sU2VydmljZSBmcm9tICcuL1JlbW90ZUNvbnRyb2xTZXJ2aWNlJztcbmltcG9ydCBEZWJ1Z2dlck1vZGVsIGZyb20gJy4vRGVidWdnZXJNb2RlbCc7XG5pbXBvcnQgdHlwZSB7U2VyaWFsaXplZEJyZWFrcG9pbnR9IGZyb20gJy4vQnJlYWtwb2ludFN0b3JlJztcblxuZXhwb3J0IHR5cGUgU2VyaWFsaXplZFN0YXRlID0ge1xuICBicmVha3BvaW50czogP0FycmF5PFNlcmlhbGl6ZWRCcmVha3BvaW50Pixcbn07XG5cbmZ1bmN0aW9uIGNyZWF0ZURlYnVnZ2VyVmlldyhtb2RlbDogRGVidWdnZXJNb2RlbCk6IEhUTUxFbGVtZW50IHtcbiAgY29uc3QgRGVidWdnZXJDb250cm9sbGVyVmlldyA9IHJlcXVpcmUoJy4vRGVidWdnZXJDb250cm9sbGVyVmlldycpO1xuICBjb25zdCB7XG4gICAgUmVhY3QsXG4gICAgUmVhY3RET00sXG4gIH0gPSByZXF1aXJlKCdyZWFjdC1mb3ItYXRvbScpO1xuICBjb25zdCBlbGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIGVsZW0uY2xhc3NOYW1lID0gJ251Y2xpZGUtZGVidWdnZXItcm9vdCc7XG4gIFJlYWN0RE9NLnJlbmRlcihcbiAgICA8RGVidWdnZXJDb250cm9sbGVyVmlld1xuICAgICAgc3RvcmU9e21vZGVsLmdldFN0b3JlKCl9XG4gICAgICBicmlkZ2UgPSB7bW9kZWwuZ2V0QnJpZGdlKCl9XG4gICAgICBhY3Rpb25zPXttb2RlbC5nZXRBY3Rpb25zKCl9XG4gICAgICBicmVha3BvaW50U3RvcmU9e21vZGVsLmdldEJyZWFrcG9pbnRTdG9yZSgpfSAvPixcbiAgICBlbGVtKTtcbiAgcmV0dXJuIGVsZW07XG59XG5cbmNsYXNzIEFjdGl2YXRpb24ge1xuICBfZGlzcG9zYWJsZXM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG5cbiAgX21vZGVsOiBEZWJ1Z2dlck1vZGVsO1xuICBfcGFuZWw6ID9PYmplY3Q7XG5cbiAgY29uc3RydWN0b3Ioc3RhdGU6ID9TZXJpYWxpemVkU3RhdGUpIHtcbiAgICB0aGlzLl9tb2RlbCA9IG5ldyBEZWJ1Z2dlck1vZGVsKHN0YXRlKTtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKFxuICAgICAgdGhpcy5fbW9kZWwsXG4gICAgICBhdG9tLnZpZXdzLmFkZFZpZXdQcm92aWRlcihEZWJ1Z2dlck1vZGVsLCBjcmVhdGVEZWJ1Z2dlclZpZXcpLFxuXG4gICAgICAvLyBMaXN0ZW4gZm9yIHJlbW92ZWQgcHJvamVjdHMgYW5kIGtpbGwgdGhlIGFzc29jaWF0ZWQgZGVidWdnZXIgaWYgaXQgaXMgYXR0YWNoZWQuXG4gICAgICBhdG9tLnByb2plY3Qub25EaWRDaGFuZ2VQYXRocyhwcm9qZWN0UGF0aHMgPT4ge1xuICAgICAgICBjb25zdCBkZWJ1Z2dlclByb2Nlc3MgPSB0aGlzLl9tb2RlbC5nZXRTdG9yZSgpLmdldERlYnVnZ2VyUHJvY2VzcygpO1xuICAgICAgICBpZiAoZGVidWdnZXJQcm9jZXNzID09IG51bGwpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZGVidWdlZVByb2plY3RQYXRoID0gZGVidWdnZXJQcm9jZXNzLmdldFRhcmdldFVyaSgpO1xuICAgICAgICBpZiAocHJvamVjdFBhdGhzLmluZGV4T2YoZGVidWdlZVByb2plY3RQYXRoKSA8IDApIHtcbiAgICAgICAgICB0aGlzLl9tb2RlbC5nZXRBY3Rpb25zKCkua2lsbERlYnVnZ2VyKCk7XG4gICAgICAgIH1cbiAgICAgIH0pLFxuXG4gICAgICAvLyBDb21tYW5kcy5cbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsIHtcbiAgICAgICAgJ251Y2xpZGUtZGVidWdnZXI6dG9nZ2xlJzogdGhpcy5fdG9nZ2xlLmJpbmQodGhpcyksXG4gICAgICB9KSxcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsIHtcbiAgICAgICAgJ251Y2xpZGUtZGVidWdnZXI6c2hvdyc6IHRoaXMuX3Nob3cuYmluZCh0aGlzKSxcbiAgICAgIH0pLFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywge1xuICAgICAgICAnbnVjbGlkZS1kZWJ1Z2dlcjpjb250aW51ZS1kZWJ1Z2dpbmcnOiB0aGlzLl9jb250aW51ZS5iaW5kKHRoaXMpLFxuICAgICAgfSksXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS13b3Jrc3BhY2UnLCB7XG4gICAgICAgICdudWNsaWRlLWRlYnVnZ2VyOnN0b3AtZGVidWdnaW5nJzogdGhpcy5fc3RvcC5iaW5kKHRoaXMpLFxuICAgICAgfSksXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS13b3Jrc3BhY2UnLCB7XG4gICAgICAgICdudWNsaWRlLWRlYnVnZ2VyOnN0ZXAtb3Zlcic6IHRoaXMuX3N0ZXBPdmVyLmJpbmQodGhpcyksXG4gICAgICB9KSxcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsIHtcbiAgICAgICAgJ251Y2xpZGUtZGVidWdnZXI6c3RlcC1pbnRvJzogdGhpcy5fc3RlcEludG8uYmluZCh0aGlzKSxcbiAgICAgIH0pLFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywge1xuICAgICAgICAnbnVjbGlkZS1kZWJ1Z2dlcjpzdGVwLW91dCc6IHRoaXMuX3N0ZXBPdXQuYmluZCh0aGlzKSxcbiAgICAgIH0pLFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywge1xuICAgICAgICAnbnVjbGlkZS1kZWJ1Z2dlcjp0b2dnbGUtYnJlYWtwb2ludCc6IHRoaXMuX3RvZ2dsZUJyZWFrcG9pbnQuYmluZCh0aGlzKSxcbiAgICAgIH0pLFxuXG4gICAgICAvLyBDb250ZXh0IE1lbnUgSXRlbXMuXG4gICAgICBhdG9tLmNvbnRleHRNZW51LmFkZCh7XG4gICAgICAgICdhdG9tLXRleHQtZWRpdG9yJzogW1xuICAgICAgICAgIHt0eXBlOiAnc2VwYXJhdG9yJ30sXG4gICAgICAgICAge1xuICAgICAgICAgICAgbGFiZWw6ICdEZWJ1Z2dlcicsXG4gICAgICAgICAgICBzdWJtZW51OiBbXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBsYWJlbDogJ1RvZ2dsZSBCcmVha3BvaW50JyxcbiAgICAgICAgICAgICAgICBjb21tYW5kOiAnbnVjbGlkZS1kZWJ1Z2dlcjp0b2dnbGUtYnJlYWtwb2ludCcsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBdLFxuICAgICAgICAgIH0sXG4gICAgICAgICAge3R5cGU6ICdzZXBhcmF0b3InfSxcbiAgICAgICAgXSxcbiAgICAgIH0pLFxuICAgICk7XG4gIH1cblxuICBzZXJpYWxpemUoKTogU2VyaWFsaXplZFN0YXRlIHtcbiAgICBjb25zdCBzdGF0ZSA9IHtcbiAgICAgIGJyZWFrcG9pbnRzOiB0aGlzLmdldE1vZGVsKCkuZ2V0QnJlYWtwb2ludFN0b3JlKCkuZ2V0U2VyaWFsaXplZEJyZWFrcG9pbnRzKCksXG4gICAgfTtcbiAgICByZXR1cm4gc3RhdGU7XG4gIH1cblxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgICBpZiAodGhpcy5fcGFuZWwpIHtcbiAgICAgIHRoaXMuX3BhbmVsLmRlc3Ryb3koKTtcbiAgICB9XG4gIH1cblxuICBnZXRNb2RlbCgpOiBEZWJ1Z2dlck1vZGVsIHtcbiAgICByZXR1cm4gdGhpcy5fbW9kZWw7XG4gIH1cblxuICBfdG9nZ2xlKCkge1xuICAgIGNvbnN0IHBhbmVsID0gdGhpcy5fZ2V0UGFuZWwoKTtcbiAgICBpZiAocGFuZWwuaXNWaXNpYmxlKCkpIHtcbiAgICAgIHBhbmVsLmhpZGUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcGFuZWwuc2hvdygpO1xuICAgIH1cbiAgfVxuXG4gIF9zaG93KCkge1xuICAgIHRoaXMuX2dldFBhbmVsKCkuc2hvdygpO1xuICB9XG5cbiAgX2NvbnRpbnVlKCkge1xuICAgIC8vIFRPRE8oamVmZnJleXRhbik6IHdoZW4gd2UgZmlndXJlZCBvdXQgdGhlIGxhdW5jaCBsaWZlY3ljbGUgc3RvcnlcbiAgICAvLyB3ZSBtYXkgYmluZCB0aGlzIHRvIHN0YXJ0LWRlYnVnZ2luZyB0b28uXG4gICAgdGhpcy5fbW9kZWwuZ2V0QnJpZGdlKCkuY29udGludWUoKTtcbiAgfVxuXG4gIF9zdG9wKCkge1xuICAgIHRoaXMuX21vZGVsLmdldEFjdGlvbnMoKS5raWxsRGVidWdnZXIoKTtcbiAgfVxuXG4gIF9zdGVwT3ZlcigpIHtcbiAgICB0aGlzLl9tb2RlbC5nZXRCcmlkZ2UoKS5zdGVwT3ZlcigpO1xuICB9XG5cbiAgX3N0ZXBJbnRvKCkge1xuICAgIHRoaXMuX21vZGVsLmdldEJyaWRnZSgpLnN0ZXBJbnRvKCk7XG4gIH1cblxuICBfc3RlcE91dCgpIHtcbiAgICB0aGlzLl9tb2RlbC5nZXRCcmlkZ2UoKS5zdGVwT3V0KCk7XG4gIH1cblxuICBAdHJhY2tUaW1pbmcoJ251Y2xpZGUtZGVidWdnZXItYXRvbTp0b2dnbGVCcmVha3BvaW50JylcbiAgX3RvZ2dsZUJyZWFrcG9pbnQoKSB7XG4gICAgY29uc3QgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICAgIGlmIChlZGl0b3IgJiYgZWRpdG9yLmdldFBhdGgoKSkge1xuICAgICAgY29uc3QgZmlsZVBhdGggPSBlZGl0b3IuZ2V0UGF0aCgpO1xuICAgICAgaWYgKGZpbGVQYXRoKSB7XG4gICAgICAgIGNvbnN0IGxpbmUgPSBlZGl0b3IuZ2V0TGFzdEN1cnNvcigpLmdldEJ1ZmZlclJvdygpO1xuICAgICAgICB0aGlzLmdldE1vZGVsKCkuZ2V0QnJlYWtwb2ludFN0b3JlKCkudG9nZ2xlQnJlYWtwb2ludChmaWxlUGF0aCwgbGluZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIExhenkgcGFuZWwgY3JlYXRpb24uXG4gICAqL1xuICBfZ2V0UGFuZWwoKTogT2JqZWN0IHtcbiAgICBpZiAoIXRoaXMuX3BhbmVsKSB7XG4gICAgICBjb25zdCBwYW5lbCA9IGF0b20ud29ya3NwYWNlLmFkZFJpZ2h0UGFuZWwoe1xuICAgICAgICBpdGVtOiB0aGlzLl9tb2RlbCxcbiAgICAgICAgdmlzaWJsZTogZmFsc2UsXG4gICAgICB9KTtcbiAgICAgIC8vIEZsb3cgZG9lc24ndCB0cmFjayBub24tbnVsbCB3aGVuIGFzc2lnbmluZyBpbnRvIG51bGxhYmxlIGRpcmVjdGx5LlxuICAgICAgdGhpcy5fcGFuZWwgPSBwYW5lbDtcbiAgICAgIHJldHVybiBwYW5lbDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuX3BhbmVsO1xuICAgIH1cbiAgfVxufVxuXG5sZXQgYWN0aXZhdGlvbiA9IG51bGw7XG5sZXQgdG9vbEJhcjogP2FueSA9IG51bGw7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBhY3RpdmF0ZShzdGF0ZTogP1NlcmlhbGl6ZWRTdGF0ZSkge1xuICAgIGlmICghYWN0aXZhdGlvbikge1xuICAgICAgYWN0aXZhdGlvbiA9IG5ldyBBY3RpdmF0aW9uKHN0YXRlKTtcbiAgICB9XG4gIH0sXG5cbiAgc2VyaWFsaXplKCk6IFNlcmlhbGl6ZWRTdGF0ZSB7XG4gICAgaWYgKGFjdGl2YXRpb24pIHtcbiAgICAgIHJldHVybiBhY3RpdmF0aW9uLnNlcmlhbGl6ZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBicmVha3BvaW50czogbnVsbCxcbiAgICAgIH07XG4gICAgfVxuICB9LFxuXG4gIGRlYWN0aXZhdGUoKSB7XG4gICAgaWYgKGFjdGl2YXRpb24pIHtcbiAgICAgIGFjdGl2YXRpb24uZGlzcG9zZSgpO1xuICAgICAgYWN0aXZhdGlvbiA9IG51bGw7XG4gICAgfVxuICAgIGlmICh0b29sQmFyKSB7XG4gICAgICB0b29sQmFyLnJlbW92ZUl0ZW1zKCk7XG4gICAgfVxuICB9LFxuXG4gIGNvbnN1bWVOdWNsaWRlRGVidWdnZXIoc2VydmljZTogbnVjbGlkZV9kZWJ1Z2dlciRTZXJ2aWNlKTogRGlzcG9zYWJsZSB7XG4gICAgaWYgKGFjdGl2YXRpb24pIHtcbiAgICAgIGFjdGl2YXRpb24uZ2V0TW9kZWwoKS5nZXRBY3Rpb25zKCkuYWRkU2VydmljZShzZXJ2aWNlKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgIGlmIChhY3RpdmF0aW9uKSB7XG4gICAgICAgIGFjdGl2YXRpb24uZ2V0TW9kZWwoKS5nZXRBY3Rpb25zKCkucmVtb3ZlU2VydmljZShzZXJ2aWNlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSxcbiAgRGVidWdnZXJQcm9jZXNzSW5mbzogcmVxdWlyZSgnLi9EZWJ1Z2dlclByb2Nlc3NJbmZvJyksXG4gIERlYnVnZ2VySW5zdGFuY2U6IHJlcXVpcmUoJy4vRGVidWdnZXJJbnN0YW5jZScpLFxuXG4gIGNvbnN1bWVUb29sQmFyKGdldFRvb2xCYXI6IChncm91cDogc3RyaW5nKSA9PiBPYmplY3QpOiB2b2lkIHtcbiAgICB0b29sQmFyID0gZ2V0VG9vbEJhcignbnVjbGlkZS1kZWJ1Z2dlcicpO1xuICAgIHRvb2xCYXIuYWRkQnV0dG9uKHtcbiAgICAgIGljb246ICdwbHVnJyxcbiAgICAgIGNhbGxiYWNrOiAnbnVjbGlkZS1kZWJ1Z2dlcjp0b2dnbGUnLFxuICAgICAgdG9vbHRpcDogJ1RvZ2dsZSBEZWJ1Z2dlcicsXG4gICAgICBwcmlvcml0eTogMTAwLFxuICAgIH0pO1xuICB9LFxuXG4gIHByb3ZpZGVSZW1vdGVDb250cm9sU2VydmljZSgpOiBSZW1vdGVDb250cm9sU2VydmljZSB7XG4gICAgcmV0dXJuIG5ldyBSZW1vdGVDb250cm9sU2VydmljZSgoKSA9PiBhY3RpdmF0aW9uID8gYWN0aXZhdGlvbi5nZXRNb2RlbCgpIDogbnVsbCk7XG4gIH0sXG59O1xuIl19