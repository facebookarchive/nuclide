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
exports.deactivate = deactivate;
exports.consumeBlameGutterClass = consumeBlameGutterClass;
exports.consumeBlameProvider = consumeBlameProvider;
exports.addItemsToFileTreeContextMenu = addItemsToFileTreeContextMenu;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _nuclideAnalytics = require('../../nuclide-analytics');

var _nuclideHgGitBridge = require('../../nuclide-hg-git-bridge');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var PACKAGES_MISSING_MESSAGE = 'Could not open blame: the nuclide-blame package needs other Atom packages to provide:\n  - a gutter UI class\n  - at least one blame provider\n\nYou are missing one of these.';

var TOGGLE_BLAME_FILE_TREE_CONTEXT_MENU_PRIORITY = 2000;

var Activation = (function () {
  function Activation() {
    var _this = this;

    _classCallCheck(this, Activation);

    this._registeredProviders = new Set();
    this._textEditorToBlameGutter = new Map();
    this._textEditorToDestroySubscription = new Map();
    this._packageDisposables = new _atom.CompositeDisposable();
    this._packageDisposables.add(atom.contextMenu.add({
      'atom-text-editor': [{
        label: 'Toggle Blame',
        command: 'nuclide-blame:toggle-blame',
        shouldDisplay: function shouldDisplay(event) {
          return _this._canShowBlame() || _this._canHideBlame();
        }
      }]
    }));
    this._packageDisposables.add(atom.commands.add('atom-text-editor', 'nuclide-blame:toggle-blame', function () {
      if (_this._canShowBlame()) {
        _this._showBlame();
      } else if (_this._canHideBlame()) {
        _this._hideBlame();
      }
    }));
  }

  /**
   * @return list of nodes against which "Toggle Blame" is an appropriate action.
   */

  _createDecoratedClass(Activation, [{
    key: 'dispose',
    value: function dispose() {
      this._packageDisposables.dispose();
      this._registeredProviders.clear();
      this._textEditorToBlameGutter.clear();
      for (var disposable of this._textEditorToDestroySubscription.values()) {
        disposable.dispose();
      }
      this._textEditorToDestroySubscription.clear();
    }

    /**
     * Section: Managing Gutters
     */

  }, {
    key: '_removeBlameGutterForEditor',
    value: function _removeBlameGutterForEditor(editor) {
      var blameGutter = this._textEditorToBlameGutter.get(editor);
      if (blameGutter != null) {
        blameGutter.destroy();
        this._textEditorToBlameGutter['delete'](editor);
      }
    }
  }, {
    key: '_showBlameGutterForEditor',
    value: function _showBlameGutterForEditor(editor) {
      var _this2 = this;

      if (this._blameGutterClass == null || this._registeredProviders.size === 0) {
        atom.notifications.addInfo(PACKAGES_MISSING_MESSAGE);
        return;
      }

      var blameGutter = this._textEditorToBlameGutter.get(editor);
      if (!blameGutter) {
        var providerForEditor = null;
        for (var blameProvider of this._registeredProviders) {
          if (blameProvider.canProvideBlameForEditor(editor)) {
            providerForEditor = blameProvider;
            break;
          }
        }

        if (providerForEditor) {
          var blameGutterClass = this._blameGutterClass;
          (0, _assert2['default'])(blameGutterClass);
          blameGutter = new blameGutterClass('nuclide-blame', editor, providerForEditor);
          this._textEditorToBlameGutter.set(editor, blameGutter);
          var destroySubscription = editor.onDidDestroy(function () {
            return _this2._editorWasDestroyed(editor);
          });
          this._textEditorToDestroySubscription.set(editor, destroySubscription);

          var _require = require('../../nuclide-analytics');

          var track = _require.track;

          track('blame-open', {
            editorPath: editor.getPath() || ''
          });
        } else {
          atom.notifications.addInfo('Could not open blame: no blame information currently available for this file.');
          var logger = require('../../nuclide-logging').getLogger();
          logger.info('nuclide-blame: Could not open blame: no blame provider currently available for this ' + ('file: ' + String(editor.getPath())));
        }
      }
    }
  }, {
    key: '_editorWasDestroyed',
    value: function _editorWasDestroyed(editor) {
      var blameGutter = this._textEditorToBlameGutter.get(editor);
      if (blameGutter) {
        blameGutter.destroy();
        this._textEditorToBlameGutter['delete'](editor);
      }
      this._textEditorToDestroySubscription['delete'](editor);
    }

    /**
     * Section: Managing Context Menus
     */

  }, {
    key: '_showBlame',
    decorators: [(0, _nuclideAnalytics.trackTiming)('blame.showBlame')],
    value: function _showBlame(event) {
      var editor = atom.workspace.getActiveTextEditor();
      if (editor != null) {
        this._showBlameGutterForEditor(editor);
      }
    }
  }, {
    key: '_hideBlame',
    decorators: [(0, _nuclideAnalytics.trackTiming)('blame.hideBlame')],
    value: function _hideBlame(event) {
      var editor = atom.workspace.getActiveTextEditor();
      if (editor != null) {
        this._removeBlameGutterForEditor(editor);
      }
    }
  }, {
    key: '_canShowBlame',
    value: function _canShowBlame() {
      var editor = atom.workspace.getActiveTextEditor();
      return !(editor != null && this._textEditorToBlameGutter.has(editor));
    }
  }, {
    key: '_canHideBlame',
    value: function _canHideBlame() {
      var editor = atom.workspace.getActiveTextEditor();
      return editor != null && this._textEditorToBlameGutter.has(editor);
    }

    /**
     * Section: Consuming Services
     */

  }, {
    key: 'consumeBlameGutterClass',
    value: function consumeBlameGutterClass(blameGutterClass) {
      var _this3 = this;

      // This package only expects one gutter UI. It will take the first one.
      if (this._blameGutterClass == null) {
        this._blameGutterClass = blameGutterClass;
        return new _atom.Disposable(function () {
          _this3._blameGutterClass = null;
        });
      } else {
        return new _atom.Disposable(function () {});
      }
    }
  }, {
    key: 'consumeBlameProvider',
    value: function consumeBlameProvider(provider) {
      var _this4 = this;

      this._registeredProviders.add(provider);
      return new _atom.Disposable(function () {
        if (_this4._registeredProviders) {
          _this4._registeredProviders['delete'](provider);
        }
      });
    }
  }, {
    key: 'addItemsToFileTreeContextMenu',
    value: function addItemsToFileTreeContextMenu(contextMenu) {
      var menuItemDescriptions = new _atom.CompositeDisposable();
      menuItemDescriptions.add(atom.commands.add(contextMenu.getCSSSelectorForFileTree(),
      /* eslint-disable nuclide-internal/command-menu-items */
      // This does not belong in a menu because it should not be a public command:
      // it should be a callback, but ContextMenuManager forces our hand.
      'nuclide-blame:toggle-blame-file-tree',
      /* eslint-enable nuclide-internal/command-menu-items */
      _asyncToGenerator(function* () {
        var _require2 = require('../../nuclide-atom-helpers');

        var goToLocation = _require2.goToLocation;

        findBlameableNodes(contextMenu).forEach(_asyncToGenerator(function* (node) {
          var editor = yield goToLocation(node.uri);
          atom.commands.dispatch(atom.views.getView(editor), 'nuclide-blame:toggle-blame');
        }));
      })), contextMenu.addItemToSourceControlMenu({
        label: 'Toggle Blame',
        command: 'nuclide-blame:toggle-blame-file-tree',
        shouldDisplay: function shouldDisplay() {
          return findBlameableNodes(contextMenu).length > 0;
        }
      }, TOGGLE_BLAME_FILE_TREE_CONTEXT_MENU_PRIORITY));
      this._packageDisposables.add(menuItemDescriptions);
      return menuItemDescriptions;
    }
  }]);

  return Activation;
})();

function findBlameableNodes(contextMenu) {
  var nodes = [];
  for (var node of contextMenu.getSelectedNodes()) {
    if (node == null || !node.uri) {
      continue;
    }
    var repo = (0, _nuclideHgGitBridge.repositoryForPath)(node.uri);
    if (!node.isContainer && repo != null && repo.getType() === 'hg') {
      nodes.push(node);
    }
  }
  return nodes;
}

var activation = undefined;

function activate(state) {
  if (!activation) {
    activation = new Activation();
  }
}

function deactivate() {
  if (activation) {
    activation.dispose();
    activation = null;
  }
}

function consumeBlameGutterClass(blameGutter) {
  (0, _assert2['default'])(activation);
  return activation.consumeBlameGutterClass(blameGutter);
}

function consumeBlameProvider(provider) {
  (0, _assert2['default'])(activation);
  return activation.consumeBlameProvider(provider);
}

function addItemsToFileTreeContextMenu(contextMenu) {
  (0, _assert2['default'])(activation);
  return activation.addItemsToFileTreeContextMenu(contextMenu);
}

// Map of a TextEditor to its BlameGutter, if it exists.

// Map of a TextEditor to the subscription on its ::onDidDestroy.
//# sourceMappingURL=data:application/json;base64,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SSxVQUFVLEVBQUU7QUFDZCxjQUFVLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDckIsY0FBVSxHQUFHLElBQUksQ0FBQztHQUNuQjtDQUNGOztBQUVNLFNBQVMsdUJBQXVCLENBQUMsV0FBNkIsRUFBZTtBQUNsRiwyQkFBVSxVQUFVLENBQUMsQ0FBQztBQUN0QixTQUFPLFVBQVUsQ0FBQyx1QkFBdUIsQ0FBQyxXQUFXLENBQUMsQ0FBQztDQUN4RDs7QUFFTSxTQUFTLG9CQUFvQixDQUFDLFFBQXVCLEVBQWU7QUFDekUsMkJBQVUsVUFBVSxDQUFDLENBQUM7QUFDdEIsU0FBTyxVQUFVLENBQUMsb0JBQW9CLENBQUMsUUFBUSxDQUFDLENBQUM7Q0FDbEQ7O0FBRU0sU0FBUyw2QkFBNkIsQ0FBQyxXQUFnQyxFQUFlO0FBQzNGLDJCQUFVLFVBQVUsQ0FBQyxDQUFDO0FBQ3RCLFNBQU8sVUFBVSxDQUFDLDZCQUE2QixDQUFDLFdBQVcsQ0FBQyxDQUFDO0NBQzlEIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7QmxhbWVQcm92aWRlcn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1ibGFtZS1iYXNlJztcbmltcG9ydCB0eXBlIEZpbGVUcmVlQ29udGV4dE1lbnUgZnJvbSAnLi4vLi4vbnVjbGlkZS1maWxlLXRyZWUvbGliL0ZpbGVUcmVlQ29udGV4dE1lbnUnO1xuaW1wb3J0IHR5cGUge0ZpbGVUcmVlTm9kZX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1maWxlLXRyZWUvbGliL0ZpbGVUcmVlTm9kZSc7XG5cbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZSwgRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQge3RyYWNrVGltaW5nfSBmcm9tICcuLi8uLi9udWNsaWRlLWFuYWx5dGljcyc7XG5pbXBvcnQge3JlcG9zaXRvcnlGb3JQYXRofSBmcm9tICcuLi8uLi9udWNsaWRlLWhnLWdpdC1icmlkZ2UnO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuXG5jb25zdCBQQUNLQUdFU19NSVNTSU5HX01FU1NBR0UgPVxuYENvdWxkIG5vdCBvcGVuIGJsYW1lOiB0aGUgbnVjbGlkZS1ibGFtZSBwYWNrYWdlIG5lZWRzIG90aGVyIEF0b20gcGFja2FnZXMgdG8gcHJvdmlkZTpcbiAgLSBhIGd1dHRlciBVSSBjbGFzc1xuICAtIGF0IGxlYXN0IG9uZSBibGFtZSBwcm92aWRlclxuXG5Zb3UgYXJlIG1pc3Npbmcgb25lIG9mIHRoZXNlLmA7XG5cbmNvbnN0IFRPR0dMRV9CTEFNRV9GSUxFX1RSRUVfQ09OVEVYVF9NRU5VX1BSSU9SSVRZID0gMjAwMDtcblxudHlwZSBCbGFtZUd1dHRlciA9IHtcbiAgZGVzdHJveTogKCkgPT4gdm9pZDtcbn07XG5cbnR5cGUgQmxhbWVHdXR0ZXJDbGFzcyA9ICgpID0+IEJsYW1lR3V0dGVyO1xuXG5jbGFzcyBBY3RpdmF0aW9uIHtcbiAgX3BhY2thZ2VEaXNwb3NhYmxlczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX3JlZ2lzdGVyZWRQcm92aWRlcnM6IFNldDxCbGFtZVByb3ZpZGVyPjtcbiAgX2JsYW1lR3V0dGVyQ2xhc3M6ID9CbGFtZUd1dHRlckNsYXNzO1xuICAvLyBNYXAgb2YgYSBUZXh0RWRpdG9yIHRvIGl0cyBCbGFtZUd1dHRlciwgaWYgaXQgZXhpc3RzLlxuICBfdGV4dEVkaXRvclRvQmxhbWVHdXR0ZXI6IE1hcDxhdG9tJFRleHRFZGl0b3IsIEJsYW1lR3V0dGVyPjtcbiAgLy8gTWFwIG9mIGEgVGV4dEVkaXRvciB0byB0aGUgc3Vic2NyaXB0aW9uIG9uIGl0cyA6Om9uRGlkRGVzdHJveS5cbiAgX3RleHRFZGl0b3JUb0Rlc3Ryb3lTdWJzY3JpcHRpb246IE1hcDxhdG9tJFRleHRFZGl0b3IsIElEaXNwb3NhYmxlPjtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl9yZWdpc3RlcmVkUHJvdmlkZXJzID0gbmV3IFNldCgpO1xuICAgIHRoaXMuX3RleHRFZGl0b3JUb0JsYW1lR3V0dGVyID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuX3RleHRFZGl0b3JUb0Rlc3Ryb3lTdWJzY3JpcHRpb24gPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5fcGFja2FnZURpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLl9wYWNrYWdlRGlzcG9zYWJsZXMuYWRkKGF0b20uY29udGV4dE1lbnUuYWRkKHtcbiAgICAgICdhdG9tLXRleHQtZWRpdG9yJzogW3tcbiAgICAgICAgbGFiZWw6ICdUb2dnbGUgQmxhbWUnLFxuICAgICAgICBjb21tYW5kOiAnbnVjbGlkZS1ibGFtZTp0b2dnbGUtYmxhbWUnLFxuICAgICAgICBzaG91bGREaXNwbGF5OiAoZXZlbnQ6IE1vdXNlRXZlbnQpID0+ICh0aGlzLl9jYW5TaG93QmxhbWUoKSB8fCB0aGlzLl9jYW5IaWRlQmxhbWUoKSksXG4gICAgICB9XSxcbiAgICB9KSk7XG4gICAgdGhpcy5fcGFja2FnZURpc3Bvc2FibGVzLmFkZChcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXRleHQtZWRpdG9yJywgJ251Y2xpZGUtYmxhbWU6dG9nZ2xlLWJsYW1lJywgKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5fY2FuU2hvd0JsYW1lKCkpIHtcbiAgICAgICAgICB0aGlzLl9zaG93QmxhbWUoKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9jYW5IaWRlQmxhbWUoKSkge1xuICAgICAgICAgIHRoaXMuX2hpZGVCbGFtZSgpO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgICk7XG4gIH1cblxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuX3BhY2thZ2VEaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gICAgdGhpcy5fcmVnaXN0ZXJlZFByb3ZpZGVycy5jbGVhcigpO1xuICAgIHRoaXMuX3RleHRFZGl0b3JUb0JsYW1lR3V0dGVyLmNsZWFyKCk7XG4gICAgZm9yIChjb25zdCBkaXNwb3NhYmxlIG9mIHRoaXMuX3RleHRFZGl0b3JUb0Rlc3Ryb3lTdWJzY3JpcHRpb24udmFsdWVzKCkpIHtcbiAgICAgIGRpc3Bvc2FibGUuZGlzcG9zZSgpO1xuICAgIH1cbiAgICB0aGlzLl90ZXh0RWRpdG9yVG9EZXN0cm95U3Vic2NyaXB0aW9uLmNsZWFyKCk7XG4gIH1cblxuICAvKipcbiAgICogU2VjdGlvbjogTWFuYWdpbmcgR3V0dGVyc1xuICAgKi9cblxuICBfcmVtb3ZlQmxhbWVHdXR0ZXJGb3JFZGl0b3IoZWRpdG9yOiBhdG9tJFRleHRFZGl0b3IpOiB2b2lkIHtcbiAgICBjb25zdCBibGFtZUd1dHRlciA9IHRoaXMuX3RleHRFZGl0b3JUb0JsYW1lR3V0dGVyLmdldChlZGl0b3IpO1xuICAgIGlmIChibGFtZUd1dHRlciAhPSBudWxsKSB7XG4gICAgICBibGFtZUd1dHRlci5kZXN0cm95KCk7XG4gICAgICB0aGlzLl90ZXh0RWRpdG9yVG9CbGFtZUd1dHRlci5kZWxldGUoZWRpdG9yKTtcbiAgICB9XG4gIH1cblxuICBfc2hvd0JsYW1lR3V0dGVyRm9yRWRpdG9yKGVkaXRvcjogYXRvbSRUZXh0RWRpdG9yKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2JsYW1lR3V0dGVyQ2xhc3MgPT0gbnVsbCB8fCB0aGlzLl9yZWdpc3RlcmVkUHJvdmlkZXJzLnNpemUgPT09IDApIHtcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvKFBBQ0tBR0VTX01JU1NJTkdfTUVTU0FHRSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IGJsYW1lR3V0dGVyID0gdGhpcy5fdGV4dEVkaXRvclRvQmxhbWVHdXR0ZXIuZ2V0KGVkaXRvcik7XG4gICAgaWYgKCFibGFtZUd1dHRlcikge1xuICAgICAgbGV0IHByb3ZpZGVyRm9yRWRpdG9yID0gbnVsbDtcbiAgICAgIGZvciAoY29uc3QgYmxhbWVQcm92aWRlciBvZiB0aGlzLl9yZWdpc3RlcmVkUHJvdmlkZXJzKSB7XG4gICAgICAgIGlmIChibGFtZVByb3ZpZGVyLmNhblByb3ZpZGVCbGFtZUZvckVkaXRvcihlZGl0b3IpKSB7XG4gICAgICAgICAgcHJvdmlkZXJGb3JFZGl0b3IgPSBibGFtZVByb3ZpZGVyO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChwcm92aWRlckZvckVkaXRvcikge1xuICAgICAgICBjb25zdCBibGFtZUd1dHRlckNsYXNzID0gdGhpcy5fYmxhbWVHdXR0ZXJDbGFzcztcbiAgICAgICAgaW52YXJpYW50KGJsYW1lR3V0dGVyQ2xhc3MpO1xuICAgICAgICBibGFtZUd1dHRlciA9IG5ldyBibGFtZUd1dHRlckNsYXNzKCdudWNsaWRlLWJsYW1lJywgZWRpdG9yLCBwcm92aWRlckZvckVkaXRvcik7XG4gICAgICAgIHRoaXMuX3RleHRFZGl0b3JUb0JsYW1lR3V0dGVyLnNldChlZGl0b3IsIGJsYW1lR3V0dGVyKTtcbiAgICAgICAgY29uc3QgZGVzdHJveVN1YnNjcmlwdGlvbiA9IGVkaXRvci5vbkRpZERlc3Ryb3koKCkgPT4gdGhpcy5fZWRpdG9yV2FzRGVzdHJveWVkKGVkaXRvcikpO1xuICAgICAgICB0aGlzLl90ZXh0RWRpdG9yVG9EZXN0cm95U3Vic2NyaXB0aW9uLnNldChlZGl0b3IsIGRlc3Ryb3lTdWJzY3JpcHRpb24pO1xuICAgICAgICBjb25zdCB7dHJhY2t9ID0gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS1hbmFseXRpY3MnKTtcbiAgICAgICAgdHJhY2soJ2JsYW1lLW9wZW4nLCB7XG4gICAgICAgICAgZWRpdG9yUGF0aDogZWRpdG9yLmdldFBhdGgoKSB8fCAnJyxcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbyhcbiAgICAgICAgICAnQ291bGQgbm90IG9wZW4gYmxhbWU6IG5vIGJsYW1lIGluZm9ybWF0aW9uIGN1cnJlbnRseSBhdmFpbGFibGUgZm9yIHRoaXMgZmlsZS4nXG4gICAgICAgICk7XG4gICAgICAgIGNvbnN0IGxvZ2dlciA9IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtbG9nZ2luZycpLmdldExvZ2dlcigpO1xuICAgICAgICBsb2dnZXIuaW5mbyhcbiAgICAgICAgICAnbnVjbGlkZS1ibGFtZTogQ291bGQgbm90IG9wZW4gYmxhbWU6IG5vIGJsYW1lIHByb3ZpZGVyIGN1cnJlbnRseSBhdmFpbGFibGUgZm9yIHRoaXMgJyArXG4gICAgICAgICAgYGZpbGU6ICR7U3RyaW5nKGVkaXRvci5nZXRQYXRoKCkpfWBcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBfZWRpdG9yV2FzRGVzdHJveWVkKGVkaXRvcjogYXRvbSRUZXh0RWRpdG9yKTogdm9pZCB7XG4gICAgY29uc3QgYmxhbWVHdXR0ZXIgPSB0aGlzLl90ZXh0RWRpdG9yVG9CbGFtZUd1dHRlci5nZXQoZWRpdG9yKTtcbiAgICBpZiAoYmxhbWVHdXR0ZXIpIHtcbiAgICAgIGJsYW1lR3V0dGVyLmRlc3Ryb3koKTtcbiAgICAgIHRoaXMuX3RleHRFZGl0b3JUb0JsYW1lR3V0dGVyLmRlbGV0ZShlZGl0b3IpO1xuICAgIH1cbiAgICB0aGlzLl90ZXh0RWRpdG9yVG9EZXN0cm95U3Vic2NyaXB0aW9uLmRlbGV0ZShlZGl0b3IpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlY3Rpb246IE1hbmFnaW5nIENvbnRleHQgTWVudXNcbiAgICovXG5cbiAgIEB0cmFja1RpbWluZygnYmxhbWUuc2hvd0JsYW1lJylcbiAgX3Nob3dCbGFtZShldmVudCk6IHZvaWQge1xuICAgIGNvbnN0IGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKTtcbiAgICBpZiAoZWRpdG9yICE9IG51bGwpIHtcbiAgICAgIHRoaXMuX3Nob3dCbGFtZUd1dHRlckZvckVkaXRvcihlZGl0b3IpO1xuICAgIH1cbiAgfVxuXG4gIEB0cmFja1RpbWluZygnYmxhbWUuaGlkZUJsYW1lJylcbiAgX2hpZGVCbGFtZShldmVudCk6IHZvaWQge1xuICAgIGNvbnN0IGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKTtcbiAgICBpZiAoZWRpdG9yICE9IG51bGwpIHtcbiAgICAgIHRoaXMuX3JlbW92ZUJsYW1lR3V0dGVyRm9yRWRpdG9yKGVkaXRvcik7XG4gICAgfVxuICB9XG5cbiAgX2NhblNob3dCbGFtZSgpOiBib29sZWFuIHtcbiAgICBjb25zdCBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk7XG4gICAgcmV0dXJuICEoZWRpdG9yICE9IG51bGwgJiYgdGhpcy5fdGV4dEVkaXRvclRvQmxhbWVHdXR0ZXIuaGFzKGVkaXRvcikpO1xuICB9XG5cbiAgX2NhbkhpZGVCbGFtZSgpOiBib29sZWFuIHtcbiAgICBjb25zdCBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk7XG4gICAgcmV0dXJuIGVkaXRvciAhPSBudWxsICYmIHRoaXMuX3RleHRFZGl0b3JUb0JsYW1lR3V0dGVyLmhhcyhlZGl0b3IpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlY3Rpb246IENvbnN1bWluZyBTZXJ2aWNlc1xuICAgKi9cblxuICBjb25zdW1lQmxhbWVHdXR0ZXJDbGFzcyhibGFtZUd1dHRlckNsYXNzOiBCbGFtZUd1dHRlckNsYXNzKTogSURpc3Bvc2FibGUge1xuICAgIC8vIFRoaXMgcGFja2FnZSBvbmx5IGV4cGVjdHMgb25lIGd1dHRlciBVSS4gSXQgd2lsbCB0YWtlIHRoZSBmaXJzdCBvbmUuXG4gICAgaWYgKHRoaXMuX2JsYW1lR3V0dGVyQ2xhc3MgPT0gbnVsbCkge1xuICAgICAgdGhpcy5fYmxhbWVHdXR0ZXJDbGFzcyA9IGJsYW1lR3V0dGVyQ2xhc3M7XG4gICAgICByZXR1cm4gbmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgICB0aGlzLl9ibGFtZUd1dHRlckNsYXNzID0gbnVsbDtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbmV3IERpc3Bvc2FibGUoKCkgPT4ge30pO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN1bWVCbGFtZVByb3ZpZGVyKHByb3ZpZGVyOiBCbGFtZVByb3ZpZGVyKTogSURpc3Bvc2FibGUge1xuICAgIHRoaXMuX3JlZ2lzdGVyZWRQcm92aWRlcnMuYWRkKHByb3ZpZGVyKTtcbiAgICByZXR1cm4gbmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgaWYgKHRoaXMuX3JlZ2lzdGVyZWRQcm92aWRlcnMpIHtcbiAgICAgICAgdGhpcy5fcmVnaXN0ZXJlZFByb3ZpZGVycy5kZWxldGUocHJvdmlkZXIpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgYWRkSXRlbXNUb0ZpbGVUcmVlQ29udGV4dE1lbnUoY29udGV4dE1lbnU6IEZpbGVUcmVlQ29udGV4dE1lbnUpOiBJRGlzcG9zYWJsZSB7XG4gICAgY29uc3QgbWVudUl0ZW1EZXNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIG1lbnVJdGVtRGVzY3JpcHRpb25zLmFkZChcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKFxuICAgICAgICBjb250ZXh0TWVudS5nZXRDU1NTZWxlY3RvckZvckZpbGVUcmVlKCksXG4gICAgICAgIC8qIGVzbGludC1kaXNhYmxlIG51Y2xpZGUtaW50ZXJuYWwvY29tbWFuZC1tZW51LWl0ZW1zICovXG4gICAgICAgIC8vIFRoaXMgZG9lcyBub3QgYmVsb25nIGluIGEgbWVudSBiZWNhdXNlIGl0IHNob3VsZCBub3QgYmUgYSBwdWJsaWMgY29tbWFuZDpcbiAgICAgICAgLy8gaXQgc2hvdWxkIGJlIGEgY2FsbGJhY2ssIGJ1dCBDb250ZXh0TWVudU1hbmFnZXIgZm9yY2VzIG91ciBoYW5kLlxuICAgICAgICAnbnVjbGlkZS1ibGFtZTp0b2dnbGUtYmxhbWUtZmlsZS10cmVlJyxcbiAgICAgICAgLyogZXNsaW50LWVuYWJsZSBudWNsaWRlLWludGVybmFsL2NvbW1hbmQtbWVudS1pdGVtcyAqL1xuICAgICAgICBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgY29uc3Qge2dvVG9Mb2NhdGlvbn0gPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLWF0b20taGVscGVycycpO1xuICAgICAgICAgIGZpbmRCbGFtZWFibGVOb2Rlcyhjb250ZXh0TWVudSkuZm9yRWFjaChhc3luYyBub2RlID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGVkaXRvciA9IGF3YWl0IGdvVG9Mb2NhdGlvbihub2RlLnVyaSk7XG4gICAgICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGF0b20udmlld3MuZ2V0VmlldyhlZGl0b3IpLCAnbnVjbGlkZS1ibGFtZTp0b2dnbGUtYmxhbWUnKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICksXG4gICAgICBjb250ZXh0TWVudS5hZGRJdGVtVG9Tb3VyY2VDb250cm9sTWVudShcbiAgICAgICAge1xuICAgICAgICAgIGxhYmVsOiAnVG9nZ2xlIEJsYW1lJyxcbiAgICAgICAgICBjb21tYW5kOiAnbnVjbGlkZS1ibGFtZTp0b2dnbGUtYmxhbWUtZmlsZS10cmVlJyxcbiAgICAgICAgICBzaG91bGREaXNwbGF5KCkge1xuICAgICAgICAgICAgcmV0dXJuIGZpbmRCbGFtZWFibGVOb2Rlcyhjb250ZXh0TWVudSkubGVuZ3RoID4gMDtcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICBUT0dHTEVfQkxBTUVfRklMRV9UUkVFX0NPTlRFWFRfTUVOVV9QUklPUklUWSxcbiAgICAgICksXG4gICAgKTtcbiAgICB0aGlzLl9wYWNrYWdlRGlzcG9zYWJsZXMuYWRkKG1lbnVJdGVtRGVzY3JpcHRpb25zKTtcbiAgICByZXR1cm4gbWVudUl0ZW1EZXNjcmlwdGlvbnM7XG4gIH1cbn1cblxuLyoqXG4gKiBAcmV0dXJuIGxpc3Qgb2Ygbm9kZXMgYWdhaW5zdCB3aGljaCBcIlRvZ2dsZSBCbGFtZVwiIGlzIGFuIGFwcHJvcHJpYXRlIGFjdGlvbi5cbiAqL1xuZnVuY3Rpb24gZmluZEJsYW1lYWJsZU5vZGVzKGNvbnRleHRNZW51OiBGaWxlVHJlZUNvbnRleHRNZW51KTogQXJyYXk8RmlsZVRyZWVOb2RlPiB7XG4gIGNvbnN0IG5vZGVzID0gW107XG4gIGZvciAoY29uc3Qgbm9kZSBvZiBjb250ZXh0TWVudS5nZXRTZWxlY3RlZE5vZGVzKCkpIHtcbiAgICBpZiAobm9kZSA9PSBudWxsIHx8ICFub2RlLnVyaSkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIGNvbnN0IHJlcG8gPSByZXBvc2l0b3J5Rm9yUGF0aChub2RlLnVyaSk7XG4gICAgaWYgKCFub2RlLmlzQ29udGFpbmVyICYmIHJlcG8gIT0gbnVsbCAmJiByZXBvLmdldFR5cGUoKSA9PT0gJ2hnJykge1xuICAgICAgbm9kZXMucHVzaChub2RlKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG5vZGVzO1xufVxuXG5sZXQgYWN0aXZhdGlvbjogP0FjdGl2YXRpb247XG5cbmV4cG9ydCBmdW5jdGlvbiBhY3RpdmF0ZShzdGF0ZTogP09iamVjdCk6IHZvaWQge1xuICBpZiAoIWFjdGl2YXRpb24pIHtcbiAgICBhY3RpdmF0aW9uID0gbmV3IEFjdGl2YXRpb24oKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVhY3RpdmF0ZSgpIHtcbiAgaWYgKGFjdGl2YXRpb24pIHtcbiAgICBhY3RpdmF0aW9uLmRpc3Bvc2UoKTtcbiAgICBhY3RpdmF0aW9uID0gbnVsbDtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY29uc3VtZUJsYW1lR3V0dGVyQ2xhc3MoYmxhbWVHdXR0ZXI6IEJsYW1lR3V0dGVyQ2xhc3MpOiBJRGlzcG9zYWJsZSB7XG4gIGludmFyaWFudChhY3RpdmF0aW9uKTtcbiAgcmV0dXJuIGFjdGl2YXRpb24uY29uc3VtZUJsYW1lR3V0dGVyQ2xhc3MoYmxhbWVHdXR0ZXIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29uc3VtZUJsYW1lUHJvdmlkZXIocHJvdmlkZXI6IEJsYW1lUHJvdmlkZXIpOiBJRGlzcG9zYWJsZSB7XG4gIGludmFyaWFudChhY3RpdmF0aW9uKTtcbiAgcmV0dXJuIGFjdGl2YXRpb24uY29uc3VtZUJsYW1lUHJvdmlkZXIocHJvdmlkZXIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYWRkSXRlbXNUb0ZpbGVUcmVlQ29udGV4dE1lbnUoY29udGV4dE1lbnU6IEZpbGVUcmVlQ29udGV4dE1lbnUpOiBJRGlzcG9zYWJsZSB7XG4gIGludmFyaWFudChhY3RpdmF0aW9uKTtcbiAgcmV0dXJuIGFjdGl2YXRpb24uYWRkSXRlbXNUb0ZpbGVUcmVlQ29udGV4dE1lbnUoY29udGV4dE1lbnUpO1xufVxuIl19