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
  var React = require('react-for-atom');
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
//# sourceMappingURL=data:application/json;base64,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QUEyQixFQUFBLHVDQUF5QjtBQUNsRCxXQUFPLHNDQUF5QjthQUFNLFVBQVUsR0FBRyxVQUFVLENBQUMsUUFBUSxFQUFFLEdBQUcsSUFBSTtLQUFBLENBQUMsQ0FBQztHQUNsRjtDQUNGLENBQUMiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IHtDb21wb3NpdGVEaXNwb3NhYmxlLCBEaXNwb3NhYmxlfSA9IHJlcXVpcmUoJ2F0b20nKTtcbmltcG9ydCB7dHJhY2tUaW1pbmd9IGZyb20gJy4uLy4uLy4uL2FuYWx5dGljcyc7XG5cbmltcG9ydCB0eXBlIHtudWNsaWRlX2RlYnVnZ2VyJFNlcnZpY2V9IGZyb20gJy4uLy4uL2ludGVyZmFjZXMvc2VydmljZSc7XG5pbXBvcnQgUmVtb3RlQ29udHJvbFNlcnZpY2UgZnJvbSAnLi9SZW1vdGVDb250cm9sU2VydmljZSc7XG5pbXBvcnQgRGVidWdnZXJNb2RlbCBmcm9tICcuL0RlYnVnZ2VyTW9kZWwnO1xuaW1wb3J0IHR5cGUge1NlcmlhbGl6ZWRCcmVha3BvaW50fSBmcm9tICcuL0JyZWFrcG9pbnRTdG9yZSc7XG5cbmV4cG9ydCB0eXBlIFNlcmlhbGl6ZWRTdGF0ZSA9IHtcbiAgYnJlYWtwb2ludHM6ID9BcnJheTxTZXJpYWxpemVkQnJlYWtwb2ludD4sXG59O1xuXG5mdW5jdGlvbiBjcmVhdGVEZWJ1Z2dlclZpZXcobW9kZWw6IERlYnVnZ2VyTW9kZWwpOiBIVE1MRWxlbWVudCB7XG4gIGNvbnN0IERlYnVnZ2VyQ29udHJvbGxlclZpZXcgPSByZXF1aXJlKCcuL0RlYnVnZ2VyQ29udHJvbGxlclZpZXcnKTtcbiAgY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC1mb3ItYXRvbScpO1xuICBjb25zdCBlbGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIGVsZW0uY2xhc3NOYW1lID0gJ251Y2xpZGUtZGVidWdnZXItcm9vdCc7XG4gIFJlYWN0LnJlbmRlcihcbiAgICA8RGVidWdnZXJDb250cm9sbGVyVmlld1xuICAgICAgc3RvcmU9e21vZGVsLmdldFN0b3JlKCl9XG4gICAgICBicmlkZ2UgPSB7bW9kZWwuZ2V0QnJpZGdlKCl9XG4gICAgICBhY3Rpb25zPXttb2RlbC5nZXRBY3Rpb25zKCl9XG4gICAgICBicmVha3BvaW50U3RvcmU9e21vZGVsLmdldEJyZWFrcG9pbnRTdG9yZSgpfSAvPixcbiAgICBlbGVtKTtcbiAgcmV0dXJuIGVsZW07XG59XG5cbmNsYXNzIEFjdGl2YXRpb24ge1xuICBfZGlzcG9zYWJsZXM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG5cbiAgX21vZGVsOiBEZWJ1Z2dlck1vZGVsO1xuICBfcGFuZWw6ID9PYmplY3Q7XG5cbiAgY29uc3RydWN0b3Ioc3RhdGU6ID9TZXJpYWxpemVkU3RhdGUpIHtcbiAgICB0aGlzLl9tb2RlbCA9IG5ldyBEZWJ1Z2dlck1vZGVsKHN0YXRlKTtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKFxuICAgICAgdGhpcy5fbW9kZWwsXG4gICAgICBhdG9tLnZpZXdzLmFkZFZpZXdQcm92aWRlcihEZWJ1Z2dlck1vZGVsLCBjcmVhdGVEZWJ1Z2dlclZpZXcpLFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywge1xuICAgICAgICAnbnVjbGlkZS1kZWJ1Z2dlcjp0b2dnbGUnOiB0aGlzLl90b2dnbGUuYmluZCh0aGlzKSxcbiAgICAgIH0pLFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywge1xuICAgICAgICAnbnVjbGlkZS1kZWJ1Z2dlcjpzaG93JzogdGhpcy5fc2hvdy5iaW5kKHRoaXMpLFxuICAgICAgfSksXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS13b3Jrc3BhY2UnLCB7XG4gICAgICAgICdudWNsaWRlLWRlYnVnZ2VyOmNvbnRpbnVlLWRlYnVnZ2luZyc6IHRoaXMuX2NvbnRpbnVlLmJpbmQodGhpcyksXG4gICAgICB9KSxcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsIHtcbiAgICAgICAgJ251Y2xpZGUtZGVidWdnZXI6c3RvcC1kZWJ1Z2dpbmcnOiB0aGlzLl9zdG9wLmJpbmQodGhpcyksXG4gICAgICB9KSxcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsIHtcbiAgICAgICAgJ251Y2xpZGUtZGVidWdnZXI6c3RlcC1vdmVyJzogdGhpcy5fc3RlcE92ZXIuYmluZCh0aGlzKSxcbiAgICAgIH0pLFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywge1xuICAgICAgICAnbnVjbGlkZS1kZWJ1Z2dlcjpzdGVwLWludG8nOiB0aGlzLl9zdGVwSW50by5iaW5kKHRoaXMpLFxuICAgICAgfSksXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS13b3Jrc3BhY2UnLCB7XG4gICAgICAgICdudWNsaWRlLWRlYnVnZ2VyOnN0ZXAtb3V0JzogdGhpcy5fc3RlcE91dC5iaW5kKHRoaXMpLFxuICAgICAgfSksXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS13b3Jrc3BhY2UnLCB7XG4gICAgICAgICdudWNsaWRlLWRlYnVnZ2VyOnRvZ2dsZS1icmVha3BvaW50JzogdGhpcy5fdG9nZ2xlQnJlYWtwb2ludC5iaW5kKHRoaXMpLFxuICAgICAgfSksXG4gICAgKTtcbiAgfVxuXG4gIHNlcmlhbGl6ZSgpOiBTZXJpYWxpemVkU3RhdGUge1xuICAgIGNvbnN0IHN0YXRlID0ge1xuICAgICAgYnJlYWtwb2ludHM6IHRoaXMuZ2V0TW9kZWwoKS5nZXRCcmVha3BvaW50U3RvcmUoKS5nZXRTZXJpYWxpemVkQnJlYWtwb2ludHMoKSxcbiAgICB9O1xuICAgIHJldHVybiBzdGF0ZTtcbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuZGlzcG9zZSgpO1xuICAgIGlmICh0aGlzLl9wYW5lbCkge1xuICAgICAgdGhpcy5fcGFuZWwuZGVzdHJveSgpO1xuICAgIH1cbiAgfVxuXG4gIGdldE1vZGVsKCk6IERlYnVnZ2VyTW9kZWwge1xuICAgIHJldHVybiB0aGlzLl9tb2RlbDtcbiAgfVxuXG4gIF90b2dnbGUoKSB7XG4gICAgY29uc3QgcGFuZWwgPSB0aGlzLl9nZXRQYW5lbCgpO1xuICAgIGlmIChwYW5lbC5pc1Zpc2libGUoKSkge1xuICAgICAgcGFuZWwuaGlkZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBwYW5lbC5zaG93KCk7XG4gICAgfVxuICB9XG5cbiAgX3Nob3coKSB7XG4gICAgdGhpcy5fZ2V0UGFuZWwoKS5zaG93KCk7XG4gIH1cblxuICBfY29udGludWUoKSB7XG4gICAgLy8gVE9ETyhqZWZmcmV5dGFuKTogd2hlbiB3ZSBmaWd1cmVkIG91dCB0aGUgbGF1bmNoIGxpZmVjeWNsZSBzdG9yeVxuICAgIC8vIHdlIG1heSBiaW5kIHRoaXMgdG8gc3RhcnQtZGVidWdnaW5nIHRvby5cbiAgICB0aGlzLl9tb2RlbC5nZXRCcmlkZ2UoKS5jb250aW51ZSgpO1xuICB9XG5cbiAgX3N0b3AoKSB7XG4gICAgdGhpcy5fbW9kZWwuZ2V0QWN0aW9ucygpLmtpbGxEZWJ1Z2dlcigpO1xuICB9XG5cbiAgX3N0ZXBPdmVyKCkge1xuICAgIHRoaXMuX21vZGVsLmdldEJyaWRnZSgpLnN0ZXBPdmVyKCk7XG4gIH1cblxuICBfc3RlcEludG8oKSB7XG4gICAgdGhpcy5fbW9kZWwuZ2V0QnJpZGdlKCkuc3RlcEludG8oKTtcbiAgfVxuXG4gIF9zdGVwT3V0KCkge1xuICAgIHRoaXMuX21vZGVsLmdldEJyaWRnZSgpLnN0ZXBPdXQoKTtcbiAgfVxuXG4gIEB0cmFja1RpbWluZygnbnVjbGlkZS1kZWJ1Z2dlci1hdG9tOnRvZ2dsZUJyZWFrcG9pbnQnKVxuICBfdG9nZ2xlQnJlYWtwb2ludCgpIHtcbiAgICBjb25zdCBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk7XG4gICAgaWYgKGVkaXRvciAmJiBlZGl0b3IuZ2V0UGF0aCgpKSB7XG4gICAgICBjb25zdCBmaWxlUGF0aCA9IGVkaXRvci5nZXRQYXRoKCk7XG4gICAgICBpZiAoZmlsZVBhdGgpIHtcbiAgICAgICAgY29uc3QgbGluZSA9IGVkaXRvci5nZXRMYXN0Q3Vyc29yKCkuZ2V0QnVmZmVyUm93KCk7XG4gICAgICAgIHRoaXMuZ2V0TW9kZWwoKS5nZXRCcmVha3BvaW50U3RvcmUoKS50b2dnbGVCcmVha3BvaW50KGZpbGVQYXRoLCBsaW5lKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogTGF6eSBwYW5lbCBjcmVhdGlvbi5cbiAgICovXG4gIF9nZXRQYW5lbCgpOiBPYmplY3Qge1xuICAgIGlmICghdGhpcy5fcGFuZWwpIHtcbiAgICAgIGNvbnN0IHBhbmVsID0gYXRvbS53b3Jrc3BhY2UuYWRkUmlnaHRQYW5lbCh7XG4gICAgICAgIGl0ZW06IHRoaXMuX21vZGVsLFxuICAgICAgICB2aXNpYmxlOiBmYWxzZSxcbiAgICAgIH0pO1xuICAgICAgLy8gRmxvdyBkb2Vzbid0IHRyYWNrIG5vbi1udWxsIHdoZW4gYXNzaWduaW5nIGludG8gbnVsbGFibGUgZGlyZWN0bHkuXG4gICAgICB0aGlzLl9wYW5lbCA9IHBhbmVsO1xuICAgICAgcmV0dXJuIHBhbmVsO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5fcGFuZWw7XG4gICAgfVxuICB9XG59XG5cbmxldCBhY3RpdmF0aW9uID0gbnVsbDtcbmxldCB0b29sQmFyOiA/YW55ID0gbnVsbDtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGFjdGl2YXRlKHN0YXRlOiA/U2VyaWFsaXplZFN0YXRlKSB7XG4gICAgaWYgKCFhY3RpdmF0aW9uKSB7XG4gICAgICBhY3RpdmF0aW9uID0gbmV3IEFjdGl2YXRpb24oc3RhdGUpO1xuICAgIH1cbiAgfSxcblxuICBzZXJpYWxpemUoKTogU2VyaWFsaXplZFN0YXRlIHtcbiAgICBpZiAoYWN0aXZhdGlvbikge1xuICAgICAgcmV0dXJuIGFjdGl2YXRpb24uc2VyaWFsaXplKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGJyZWFrcG9pbnRzOiBudWxsLFxuICAgICAgfTtcbiAgICB9XG4gIH0sXG5cbiAgZGVhY3RpdmF0ZSgpIHtcbiAgICBpZiAoYWN0aXZhdGlvbikge1xuICAgICAgYWN0aXZhdGlvbi5kaXNwb3NlKCk7XG4gICAgICBhY3RpdmF0aW9uID0gbnVsbDtcbiAgICB9XG4gICAgaWYgKHRvb2xCYXIpIHtcbiAgICAgIHRvb2xCYXIucmVtb3ZlSXRlbXMoKTtcbiAgICB9XG4gIH0sXG5cbiAgY29uc3VtZU51Y2xpZGVEZWJ1Z2dlcihzZXJ2aWNlOiBudWNsaWRlX2RlYnVnZ2VyJFNlcnZpY2UpOiBEaXNwb3NhYmxlIHtcbiAgICBpZiAoYWN0aXZhdGlvbikge1xuICAgICAgYWN0aXZhdGlvbi5nZXRNb2RlbCgpLmdldEFjdGlvbnMoKS5hZGRTZXJ2aWNlKHNlcnZpY2UpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgaWYgKGFjdGl2YXRpb24pIHtcbiAgICAgICAgYWN0aXZhdGlvbi5nZXRNb2RlbCgpLmdldEFjdGlvbnMoKS5yZW1vdmVTZXJ2aWNlKHNlcnZpY2UpO1xuICAgICAgfVxuICAgIH0pO1xuICB9LFxuICBEZWJ1Z2dlclByb2Nlc3NJbmZvOiByZXF1aXJlKCcuL0RlYnVnZ2VyUHJvY2Vzc0luZm8nKSxcblxuICBjb25zdW1lVG9vbEJhcihnZXRUb29sQmFyOiAoZ3JvdXA6IHN0cmluZykgPT4gT2JqZWN0KTogdm9pZCB7XG4gICAgdG9vbEJhciA9IGdldFRvb2xCYXIoJ251Y2xpZGUtZGVidWdnZXInKTtcbiAgICB0b29sQmFyLmFkZEJ1dHRvbih7XG4gICAgICBpY29uOiAncGx1ZycsXG4gICAgICBjYWxsYmFjazogJ251Y2xpZGUtZGVidWdnZXI6dG9nZ2xlJyxcbiAgICAgIHRvb2x0aXA6ICdUb2dnbGUgRGVidWdnZXInLFxuICAgICAgcHJpb3JpdHk6IDEwMCxcbiAgICB9KTtcbiAgfSxcblxuICBwcm92aWRlUmVtb3RlQ29udHJvbFNlcnZpY2UoKTogUmVtb3RlQ29udHJvbFNlcnZpY2Uge1xuICAgIHJldHVybiBuZXcgUmVtb3RlQ29udHJvbFNlcnZpY2UoKCkgPT4gYWN0aXZhdGlvbiA/IGFjdGl2YXRpb24uZ2V0TW9kZWwoKSA6IG51bGwpO1xuICB9LFxufTtcbiJdfQ==