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

  var elem = document.createElement('div');
  elem.className = 'nuclide-debugger-root';
  React.render(React.createElement(DebuggerControllerView, {
    store: model.getStore(),
    bridge: model.getBridge(),
    actions: model.getActions(),
    breakpointStore: model.getBreakpointStore() }), elem);
  return elem;
}

var Activation = (function () {
  function Activation(state) {
    _classCallCheck(this, Activation);

    this._model = new _DebuggerModel2['default'](state);
    this._disposables = new CompositeDisposable(this._model, atom.views.addViewProvider(_DebuggerModel2['default'], createDebuggerView), atom.commands.add('atom-workspace', {
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
//# sourceMappingURL=data:application/json;base64,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QUFFLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQzs7QUFFckQsZ0JBQWMsRUFBQSx3QkFBQyxVQUFxQyxFQUFRO0FBQzFELFdBQU8sR0FBRyxVQUFVLENBQUMsa0JBQWtCLENBQUMsQ0FBQztBQUN6QyxXQUFPLENBQUMsU0FBUyxDQUFDO0FBQ2hCLFVBQUksRUFBRSxNQUFNO0FBQ1osY0FBUSxFQUFFLHlCQUF5QjtBQUNuQyxhQUFPLEVBQUUsaUJBQWlCO0FBQzFCLGNBQVEsRUFBRSxHQUFHO0tBQ2QsQ0FBQyxDQUFDO0dBQ0o7O0FBRUQsNkJBQTJCLEVBQUEsdUNBQXlCO0FBQ2xELFdBQU8sc0NBQXlCO2FBQU0sVUFBVSxHQUFHLFVBQVUsQ0FBQyxRQUFRLEVBQUUsR0FBRyxJQUFJO0tBQUEsQ0FBQyxDQUFDO0dBQ2xGO0NBQ0YsQ0FBQyIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuY29uc3Qge0NvbXBvc2l0ZURpc3Bvc2FibGUsIERpc3Bvc2FibGV9ID0gcmVxdWlyZSgnYXRvbScpO1xuaW1wb3J0IHt0cmFja1RpbWluZ30gZnJvbSAnLi4vLi4vLi4vYW5hbHl0aWNzJztcblxuaW1wb3J0IHR5cGUge251Y2xpZGVfZGVidWdnZXIkU2VydmljZX0gZnJvbSAnLi4vLi4vaW50ZXJmYWNlcy9zZXJ2aWNlJztcbmltcG9ydCBSZW1vdGVDb250cm9sU2VydmljZSBmcm9tICcuL1JlbW90ZUNvbnRyb2xTZXJ2aWNlJztcbmltcG9ydCBEZWJ1Z2dlck1vZGVsIGZyb20gJy4vRGVidWdnZXJNb2RlbCc7XG5pbXBvcnQgdHlwZSB7U2VyaWFsaXplZEJyZWFrcG9pbnR9IGZyb20gJy4vQnJlYWtwb2ludFN0b3JlJztcblxuZXhwb3J0IHR5cGUgU2VyaWFsaXplZFN0YXRlID0ge1xuICBicmVha3BvaW50czogP0FycmF5PFNlcmlhbGl6ZWRCcmVha3BvaW50Pixcbn07XG5cbmZ1bmN0aW9uIGNyZWF0ZURlYnVnZ2VyVmlldyhtb2RlbDogRGVidWdnZXJNb2RlbCk6IEhUTUxFbGVtZW50IHtcbiAgY29uc3QgRGVidWdnZXJDb250cm9sbGVyVmlldyA9IHJlcXVpcmUoJy4vRGVidWdnZXJDb250cm9sbGVyVmlldycpO1xuICBjb25zdCB7UmVhY3R9ID0gcmVxdWlyZSgncmVhY3QtZm9yLWF0b20nKTtcbiAgY29uc3QgZWxlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICBlbGVtLmNsYXNzTmFtZSA9ICdudWNsaWRlLWRlYnVnZ2VyLXJvb3QnO1xuICBSZWFjdC5yZW5kZXIoXG4gICAgPERlYnVnZ2VyQ29udHJvbGxlclZpZXdcbiAgICAgIHN0b3JlPXttb2RlbC5nZXRTdG9yZSgpfVxuICAgICAgYnJpZGdlID0ge21vZGVsLmdldEJyaWRnZSgpfVxuICAgICAgYWN0aW9ucz17bW9kZWwuZ2V0QWN0aW9ucygpfVxuICAgICAgYnJlYWtwb2ludFN0b3JlPXttb2RlbC5nZXRCcmVha3BvaW50U3RvcmUoKX0gLz4sXG4gICAgZWxlbSk7XG4gIHJldHVybiBlbGVtO1xufVxuXG5jbGFzcyBBY3RpdmF0aW9uIHtcbiAgX2Rpc3Bvc2FibGVzOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuXG4gIF9tb2RlbDogRGVidWdnZXJNb2RlbDtcbiAgX3BhbmVsOiA/T2JqZWN0O1xuXG4gIGNvbnN0cnVjdG9yKHN0YXRlOiA/U2VyaWFsaXplZFN0YXRlKSB7XG4gICAgdGhpcy5fbW9kZWwgPSBuZXcgRGVidWdnZXJNb2RlbChzdGF0ZSk7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZShcbiAgICAgIHRoaXMuX21vZGVsLFxuICAgICAgYXRvbS52aWV3cy5hZGRWaWV3UHJvdmlkZXIoRGVidWdnZXJNb2RlbCwgY3JlYXRlRGVidWdnZXJWaWV3KSxcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsIHtcbiAgICAgICAgJ251Y2xpZGUtZGVidWdnZXI6dG9nZ2xlJzogdGhpcy5fdG9nZ2xlLmJpbmQodGhpcyksXG4gICAgICB9KSxcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsIHtcbiAgICAgICAgJ251Y2xpZGUtZGVidWdnZXI6c2hvdyc6IHRoaXMuX3Nob3cuYmluZCh0aGlzKSxcbiAgICAgIH0pLFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywge1xuICAgICAgICAnbnVjbGlkZS1kZWJ1Z2dlcjpjb250aW51ZS1kZWJ1Z2dpbmcnOiB0aGlzLl9jb250aW51ZS5iaW5kKHRoaXMpLFxuICAgICAgfSksXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS13b3Jrc3BhY2UnLCB7XG4gICAgICAgICdudWNsaWRlLWRlYnVnZ2VyOnN0b3AtZGVidWdnaW5nJzogdGhpcy5fc3RvcC5iaW5kKHRoaXMpLFxuICAgICAgfSksXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS13b3Jrc3BhY2UnLCB7XG4gICAgICAgICdudWNsaWRlLWRlYnVnZ2VyOnN0ZXAtb3Zlcic6IHRoaXMuX3N0ZXBPdmVyLmJpbmQodGhpcyksXG4gICAgICB9KSxcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsIHtcbiAgICAgICAgJ251Y2xpZGUtZGVidWdnZXI6c3RlcC1pbnRvJzogdGhpcy5fc3RlcEludG8uYmluZCh0aGlzKSxcbiAgICAgIH0pLFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywge1xuICAgICAgICAnbnVjbGlkZS1kZWJ1Z2dlcjpzdGVwLW91dCc6IHRoaXMuX3N0ZXBPdXQuYmluZCh0aGlzKSxcbiAgICAgIH0pLFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywge1xuICAgICAgICAnbnVjbGlkZS1kZWJ1Z2dlcjp0b2dnbGUtYnJlYWtwb2ludCc6IHRoaXMuX3RvZ2dsZUJyZWFrcG9pbnQuYmluZCh0aGlzKSxcbiAgICAgIH0pLFxuXG4gICAgICAvLyBDb250ZXh0IE1lbnUgSXRlbXMuXG4gICAgICBhdG9tLmNvbnRleHRNZW51LmFkZCh7XG4gICAgICAgICdhdG9tLXRleHQtZWRpdG9yJzogW1xuICAgICAgICAgIHt0eXBlOiAnc2VwYXJhdG9yJ30sXG4gICAgICAgICAge1xuICAgICAgICAgICAgbGFiZWw6ICdEZWJ1Z2dlcicsXG4gICAgICAgICAgICBzdWJtZW51OiBbXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBsYWJlbDogJ1RvZ2dsZSBCcmVha3BvaW50JyxcbiAgICAgICAgICAgICAgICBjb21tYW5kOiAnbnVjbGlkZS1kZWJ1Z2dlcjp0b2dnbGUtYnJlYWtwb2ludCcsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBdLFxuICAgICAgICAgIH0sXG4gICAgICAgICAge3R5cGU6ICdzZXBhcmF0b3InfSxcbiAgICAgICAgXSxcbiAgICAgIH0pLFxuICAgICk7XG4gIH1cblxuICBzZXJpYWxpemUoKTogU2VyaWFsaXplZFN0YXRlIHtcbiAgICBjb25zdCBzdGF0ZSA9IHtcbiAgICAgIGJyZWFrcG9pbnRzOiB0aGlzLmdldE1vZGVsKCkuZ2V0QnJlYWtwb2ludFN0b3JlKCkuZ2V0U2VyaWFsaXplZEJyZWFrcG9pbnRzKCksXG4gICAgfTtcbiAgICByZXR1cm4gc3RhdGU7XG4gIH1cblxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgICBpZiAodGhpcy5fcGFuZWwpIHtcbiAgICAgIHRoaXMuX3BhbmVsLmRlc3Ryb3koKTtcbiAgICB9XG4gIH1cblxuICBnZXRNb2RlbCgpOiBEZWJ1Z2dlck1vZGVsIHtcbiAgICByZXR1cm4gdGhpcy5fbW9kZWw7XG4gIH1cblxuICBfdG9nZ2xlKCkge1xuICAgIGNvbnN0IHBhbmVsID0gdGhpcy5fZ2V0UGFuZWwoKTtcbiAgICBpZiAocGFuZWwuaXNWaXNpYmxlKCkpIHtcbiAgICAgIHBhbmVsLmhpZGUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcGFuZWwuc2hvdygpO1xuICAgIH1cbiAgfVxuXG4gIF9zaG93KCkge1xuICAgIHRoaXMuX2dldFBhbmVsKCkuc2hvdygpO1xuICB9XG5cbiAgX2NvbnRpbnVlKCkge1xuICAgIC8vIFRPRE8oamVmZnJleXRhbik6IHdoZW4gd2UgZmlndXJlZCBvdXQgdGhlIGxhdW5jaCBsaWZlY3ljbGUgc3RvcnlcbiAgICAvLyB3ZSBtYXkgYmluZCB0aGlzIHRvIHN0YXJ0LWRlYnVnZ2luZyB0b28uXG4gICAgdGhpcy5fbW9kZWwuZ2V0QnJpZGdlKCkuY29udGludWUoKTtcbiAgfVxuXG4gIF9zdG9wKCkge1xuICAgIHRoaXMuX21vZGVsLmdldEFjdGlvbnMoKS5raWxsRGVidWdnZXIoKTtcbiAgfVxuXG4gIF9zdGVwT3ZlcigpIHtcbiAgICB0aGlzLl9tb2RlbC5nZXRCcmlkZ2UoKS5zdGVwT3ZlcigpO1xuICB9XG5cbiAgX3N0ZXBJbnRvKCkge1xuICAgIHRoaXMuX21vZGVsLmdldEJyaWRnZSgpLnN0ZXBJbnRvKCk7XG4gIH1cblxuICBfc3RlcE91dCgpIHtcbiAgICB0aGlzLl9tb2RlbC5nZXRCcmlkZ2UoKS5zdGVwT3V0KCk7XG4gIH1cblxuICBAdHJhY2tUaW1pbmcoJ251Y2xpZGUtZGVidWdnZXItYXRvbTp0b2dnbGVCcmVha3BvaW50JylcbiAgX3RvZ2dsZUJyZWFrcG9pbnQoKSB7XG4gICAgY29uc3QgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICAgIGlmIChlZGl0b3IgJiYgZWRpdG9yLmdldFBhdGgoKSkge1xuICAgICAgY29uc3QgZmlsZVBhdGggPSBlZGl0b3IuZ2V0UGF0aCgpO1xuICAgICAgaWYgKGZpbGVQYXRoKSB7XG4gICAgICAgIGNvbnN0IGxpbmUgPSBlZGl0b3IuZ2V0TGFzdEN1cnNvcigpLmdldEJ1ZmZlclJvdygpO1xuICAgICAgICB0aGlzLmdldE1vZGVsKCkuZ2V0QnJlYWtwb2ludFN0b3JlKCkudG9nZ2xlQnJlYWtwb2ludChmaWxlUGF0aCwgbGluZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIExhenkgcGFuZWwgY3JlYXRpb24uXG4gICAqL1xuICBfZ2V0UGFuZWwoKTogT2JqZWN0IHtcbiAgICBpZiAoIXRoaXMuX3BhbmVsKSB7XG4gICAgICBjb25zdCBwYW5lbCA9IGF0b20ud29ya3NwYWNlLmFkZFJpZ2h0UGFuZWwoe1xuICAgICAgICBpdGVtOiB0aGlzLl9tb2RlbCxcbiAgICAgICAgdmlzaWJsZTogZmFsc2UsXG4gICAgICB9KTtcbiAgICAgIC8vIEZsb3cgZG9lc24ndCB0cmFjayBub24tbnVsbCB3aGVuIGFzc2lnbmluZyBpbnRvIG51bGxhYmxlIGRpcmVjdGx5LlxuICAgICAgdGhpcy5fcGFuZWwgPSBwYW5lbDtcbiAgICAgIHJldHVybiBwYW5lbDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuX3BhbmVsO1xuICAgIH1cbiAgfVxufVxuXG5sZXQgYWN0aXZhdGlvbiA9IG51bGw7XG5sZXQgdG9vbEJhcjogP2FueSA9IG51bGw7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBhY3RpdmF0ZShzdGF0ZTogP1NlcmlhbGl6ZWRTdGF0ZSkge1xuICAgIGlmICghYWN0aXZhdGlvbikge1xuICAgICAgYWN0aXZhdGlvbiA9IG5ldyBBY3RpdmF0aW9uKHN0YXRlKTtcbiAgICB9XG4gIH0sXG5cbiAgc2VyaWFsaXplKCk6IFNlcmlhbGl6ZWRTdGF0ZSB7XG4gICAgaWYgKGFjdGl2YXRpb24pIHtcbiAgICAgIHJldHVybiBhY3RpdmF0aW9uLnNlcmlhbGl6ZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBicmVha3BvaW50czogbnVsbCxcbiAgICAgIH07XG4gICAgfVxuICB9LFxuXG4gIGRlYWN0aXZhdGUoKSB7XG4gICAgaWYgKGFjdGl2YXRpb24pIHtcbiAgICAgIGFjdGl2YXRpb24uZGlzcG9zZSgpO1xuICAgICAgYWN0aXZhdGlvbiA9IG51bGw7XG4gICAgfVxuICAgIGlmICh0b29sQmFyKSB7XG4gICAgICB0b29sQmFyLnJlbW92ZUl0ZW1zKCk7XG4gICAgfVxuICB9LFxuXG4gIGNvbnN1bWVOdWNsaWRlRGVidWdnZXIoc2VydmljZTogbnVjbGlkZV9kZWJ1Z2dlciRTZXJ2aWNlKTogRGlzcG9zYWJsZSB7XG4gICAgaWYgKGFjdGl2YXRpb24pIHtcbiAgICAgIGFjdGl2YXRpb24uZ2V0TW9kZWwoKS5nZXRBY3Rpb25zKCkuYWRkU2VydmljZShzZXJ2aWNlKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgIGlmIChhY3RpdmF0aW9uKSB7XG4gICAgICAgIGFjdGl2YXRpb24uZ2V0TW9kZWwoKS5nZXRBY3Rpb25zKCkucmVtb3ZlU2VydmljZShzZXJ2aWNlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSxcbiAgRGVidWdnZXJQcm9jZXNzSW5mbzogcmVxdWlyZSgnLi9EZWJ1Z2dlclByb2Nlc3NJbmZvJyksXG5cbiAgY29uc3VtZVRvb2xCYXIoZ2V0VG9vbEJhcjogKGdyb3VwOiBzdHJpbmcpID0+IE9iamVjdCk6IHZvaWQge1xuICAgIHRvb2xCYXIgPSBnZXRUb29sQmFyKCdudWNsaWRlLWRlYnVnZ2VyJyk7XG4gICAgdG9vbEJhci5hZGRCdXR0b24oe1xuICAgICAgaWNvbjogJ3BsdWcnLFxuICAgICAgY2FsbGJhY2s6ICdudWNsaWRlLWRlYnVnZ2VyOnRvZ2dsZScsXG4gICAgICB0b29sdGlwOiAnVG9nZ2xlIERlYnVnZ2VyJyxcbiAgICAgIHByaW9yaXR5OiAxMDAsXG4gICAgfSk7XG4gIH0sXG5cbiAgcHJvdmlkZVJlbW90ZUNvbnRyb2xTZXJ2aWNlKCk6IFJlbW90ZUNvbnRyb2xTZXJ2aWNlIHtcbiAgICByZXR1cm4gbmV3IFJlbW90ZUNvbnRyb2xTZXJ2aWNlKCgpID0+IGFjdGl2YXRpb24gPyBhY3RpdmF0aW9uLmdldE1vZGVsKCkgOiBudWxsKTtcbiAgfSxcbn07XG4iXX0=