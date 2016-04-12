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
   * @return list of nodes against which "Toggle Blame" is an appropriate action. Currently, this
   *   blindly returns all files, but it would be better to limit it to files that are part of an
   *   Hg repository.
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
      menuItemDescriptions.add(atom.commands.add('atom-workspace',
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
    if (!node.isContainer) {
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
//# sourceMappingURL=data:application/json;base64,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QUFvQixDQUFDLFFBQXVCLEVBQWU7QUFDekUsMkJBQVUsVUFBVSxDQUFDLENBQUM7QUFDdEIsU0FBTyxVQUFVLENBQUMsb0JBQW9CLENBQUMsUUFBUSxDQUFDLENBQUM7Q0FDbEQ7O0FBRU0sU0FBUyw2QkFBNkIsQ0FBQyxXQUFnQyxFQUFlO0FBQzNGLDJCQUFVLFVBQVUsQ0FBQyxDQUFDO0FBQ3RCLFNBQU8sVUFBVSxDQUFDLDZCQUE2QixDQUFDLFdBQVcsQ0FBQyxDQUFDO0NBQzlEIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7QmxhbWVQcm92aWRlcn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1ibGFtZS1iYXNlJztcbmltcG9ydCB0eXBlIEZpbGVUcmVlQ29udGV4dE1lbnUgZnJvbSAnLi4vLi4vbnVjbGlkZS1maWxlLXRyZWUvbGliL0ZpbGVUcmVlQ29udGV4dE1lbnUnO1xuaW1wb3J0IHR5cGUge0ZpbGVUcmVlTm9kZX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1maWxlLXRyZWUvbGliL0ZpbGVUcmVlTm9kZSc7XG5cbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZSwgRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQge3RyYWNrVGltaW5nfSBmcm9tICcuLi8uLi9udWNsaWRlLWFuYWx5dGljcyc7XG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5cbmNvbnN0IFBBQ0tBR0VTX01JU1NJTkdfTUVTU0FHRSA9XG5gQ291bGQgbm90IG9wZW4gYmxhbWU6IHRoZSBudWNsaWRlLWJsYW1lIHBhY2thZ2UgbmVlZHMgb3RoZXIgQXRvbSBwYWNrYWdlcyB0byBwcm92aWRlOlxuICAtIGEgZ3V0dGVyIFVJIGNsYXNzXG4gIC0gYXQgbGVhc3Qgb25lIGJsYW1lIHByb3ZpZGVyXG5cbllvdSBhcmUgbWlzc2luZyBvbmUgb2YgdGhlc2UuYDtcblxuY29uc3QgVE9HR0xFX0JMQU1FX0ZJTEVfVFJFRV9DT05URVhUX01FTlVfUFJJT1JJVFkgPSAyMDAwO1xuXG50eXBlIEJsYW1lR3V0dGVyID0ge1xuICBkZXN0cm95OiAoKSA9PiB2b2lkO1xufTtcblxudHlwZSBCbGFtZUd1dHRlckNsYXNzID0gKCkgPT4gQmxhbWVHdXR0ZXI7XG5cbmNsYXNzIEFjdGl2YXRpb24ge1xuICBfcGFja2FnZURpc3Bvc2FibGVzOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBfcmVnaXN0ZXJlZFByb3ZpZGVyczogU2V0PEJsYW1lUHJvdmlkZXI+O1xuICBfYmxhbWVHdXR0ZXJDbGFzczogP0JsYW1lR3V0dGVyQ2xhc3M7XG4gIC8vIE1hcCBvZiBhIFRleHRFZGl0b3IgdG8gaXRzIEJsYW1lR3V0dGVyLCBpZiBpdCBleGlzdHMuXG4gIF90ZXh0RWRpdG9yVG9CbGFtZUd1dHRlcjogTWFwPGF0b20kVGV4dEVkaXRvciwgQmxhbWVHdXR0ZXI+O1xuICAvLyBNYXAgb2YgYSBUZXh0RWRpdG9yIHRvIHRoZSBzdWJzY3JpcHRpb24gb24gaXRzIDo6b25EaWREZXN0cm95LlxuICBfdGV4dEVkaXRvclRvRGVzdHJveVN1YnNjcmlwdGlvbjogTWFwPGF0b20kVGV4dEVkaXRvciwgSURpc3Bvc2FibGU+O1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX3JlZ2lzdGVyZWRQcm92aWRlcnMgPSBuZXcgU2V0KCk7XG4gICAgdGhpcy5fdGV4dEVkaXRvclRvQmxhbWVHdXR0ZXIgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5fdGV4dEVkaXRvclRvRGVzdHJveVN1YnNjcmlwdGlvbiA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLl9wYWNrYWdlRGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIHRoaXMuX3BhY2thZ2VEaXNwb3NhYmxlcy5hZGQoYXRvbS5jb250ZXh0TWVudS5hZGQoe1xuICAgICAgJ2F0b20tdGV4dC1lZGl0b3InOiBbe1xuICAgICAgICBsYWJlbDogJ1RvZ2dsZSBCbGFtZScsXG4gICAgICAgIGNvbW1hbmQ6ICdudWNsaWRlLWJsYW1lOnRvZ2dsZS1ibGFtZScsXG4gICAgICAgIHNob3VsZERpc3BsYXk6IChldmVudDogTW91c2VFdmVudCkgPT4gKHRoaXMuX2NhblNob3dCbGFtZSgpIHx8IHRoaXMuX2NhbkhpZGVCbGFtZSgpKSxcbiAgICAgIH1dLFxuICAgIH0pKTtcbiAgICB0aGlzLl9wYWNrYWdlRGlzcG9zYWJsZXMuYWRkKFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20tdGV4dC1lZGl0b3InLCAnbnVjbGlkZS1ibGFtZTp0b2dnbGUtYmxhbWUnLCAoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLl9jYW5TaG93QmxhbWUoKSkge1xuICAgICAgICAgIHRoaXMuX3Nob3dCbGFtZSgpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2NhbkhpZGVCbGFtZSgpKSB7XG4gICAgICAgICAgdGhpcy5faGlkZUJsYW1lKCk7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgKTtcbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5fcGFja2FnZURpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgICB0aGlzLl9yZWdpc3RlcmVkUHJvdmlkZXJzLmNsZWFyKCk7XG4gICAgdGhpcy5fdGV4dEVkaXRvclRvQmxhbWVHdXR0ZXIuY2xlYXIoKTtcbiAgICBmb3IgKGNvbnN0IGRpc3Bvc2FibGUgb2YgdGhpcy5fdGV4dEVkaXRvclRvRGVzdHJveVN1YnNjcmlwdGlvbi52YWx1ZXMoKSkge1xuICAgICAgZGlzcG9zYWJsZS5kaXNwb3NlKCk7XG4gICAgfVxuICAgIHRoaXMuX3RleHRFZGl0b3JUb0Rlc3Ryb3lTdWJzY3JpcHRpb24uY2xlYXIoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWN0aW9uOiBNYW5hZ2luZyBHdXR0ZXJzXG4gICAqL1xuXG4gIF9yZW1vdmVCbGFtZUd1dHRlckZvckVkaXRvcihlZGl0b3I6IGF0b20kVGV4dEVkaXRvcik6IHZvaWQge1xuICAgIGNvbnN0IGJsYW1lR3V0dGVyID0gdGhpcy5fdGV4dEVkaXRvclRvQmxhbWVHdXR0ZXIuZ2V0KGVkaXRvcik7XG4gICAgaWYgKGJsYW1lR3V0dGVyICE9IG51bGwpIHtcbiAgICAgIGJsYW1lR3V0dGVyLmRlc3Ryb3koKTtcbiAgICAgIHRoaXMuX3RleHRFZGl0b3JUb0JsYW1lR3V0dGVyLmRlbGV0ZShlZGl0b3IpO1xuICAgIH1cbiAgfVxuXG4gIF9zaG93QmxhbWVHdXR0ZXJGb3JFZGl0b3IoZWRpdG9yOiBhdG9tJFRleHRFZGl0b3IpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fYmxhbWVHdXR0ZXJDbGFzcyA9PSBudWxsIHx8IHRoaXMuX3JlZ2lzdGVyZWRQcm92aWRlcnMuc2l6ZSA9PT0gMCkge1xuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oUEFDS0FHRVNfTUlTU0lOR19NRVNTQUdFKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgYmxhbWVHdXR0ZXIgPSB0aGlzLl90ZXh0RWRpdG9yVG9CbGFtZUd1dHRlci5nZXQoZWRpdG9yKTtcbiAgICBpZiAoIWJsYW1lR3V0dGVyKSB7XG4gICAgICBsZXQgcHJvdmlkZXJGb3JFZGl0b3IgPSBudWxsO1xuICAgICAgZm9yIChjb25zdCBibGFtZVByb3ZpZGVyIG9mIHRoaXMuX3JlZ2lzdGVyZWRQcm92aWRlcnMpIHtcbiAgICAgICAgaWYgKGJsYW1lUHJvdmlkZXIuY2FuUHJvdmlkZUJsYW1lRm9yRWRpdG9yKGVkaXRvcikpIHtcbiAgICAgICAgICBwcm92aWRlckZvckVkaXRvciA9IGJsYW1lUHJvdmlkZXI7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHByb3ZpZGVyRm9yRWRpdG9yKSB7XG4gICAgICAgIGNvbnN0IGJsYW1lR3V0dGVyQ2xhc3MgPSB0aGlzLl9ibGFtZUd1dHRlckNsYXNzO1xuICAgICAgICBpbnZhcmlhbnQoYmxhbWVHdXR0ZXJDbGFzcyk7XG4gICAgICAgIGJsYW1lR3V0dGVyID0gbmV3IGJsYW1lR3V0dGVyQ2xhc3MoJ251Y2xpZGUtYmxhbWUnLCBlZGl0b3IsIHByb3ZpZGVyRm9yRWRpdG9yKTtcbiAgICAgICAgdGhpcy5fdGV4dEVkaXRvclRvQmxhbWVHdXR0ZXIuc2V0KGVkaXRvciwgYmxhbWVHdXR0ZXIpO1xuICAgICAgICBjb25zdCBkZXN0cm95U3Vic2NyaXB0aW9uID0gZWRpdG9yLm9uRGlkRGVzdHJveSgoKSA9PiB0aGlzLl9lZGl0b3JXYXNEZXN0cm95ZWQoZWRpdG9yKSk7XG4gICAgICAgIHRoaXMuX3RleHRFZGl0b3JUb0Rlc3Ryb3lTdWJzY3JpcHRpb24uc2V0KGVkaXRvciwgZGVzdHJveVN1YnNjcmlwdGlvbik7XG4gICAgICAgIGNvbnN0IHt0cmFja30gPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLWFuYWx5dGljcycpO1xuICAgICAgICB0cmFjaygnYmxhbWUtb3BlbicsIHtcbiAgICAgICAgICBlZGl0b3JQYXRoOiBlZGl0b3IuZ2V0UGF0aCgpIHx8ICcnLFxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvKFxuICAgICAgICAgICdDb3VsZCBub3Qgb3BlbiBibGFtZTogbm8gYmxhbWUgaW5mb3JtYXRpb24gY3VycmVudGx5IGF2YWlsYWJsZSBmb3IgdGhpcyBmaWxlLidcbiAgICAgICAgKTtcbiAgICAgICAgY29uc3QgbG9nZ2VyID0gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS1sb2dnaW5nJykuZ2V0TG9nZ2VyKCk7XG4gICAgICAgIGxvZ2dlci5pbmZvKFxuICAgICAgICAgICdudWNsaWRlLWJsYW1lOiBDb3VsZCBub3Qgb3BlbiBibGFtZTogbm8gYmxhbWUgcHJvdmlkZXIgY3VycmVudGx5IGF2YWlsYWJsZSBmb3IgdGhpcyAnICtcbiAgICAgICAgICBgZmlsZTogJHtTdHJpbmcoZWRpdG9yLmdldFBhdGgoKSl9YFxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIF9lZGl0b3JXYXNEZXN0cm95ZWQoZWRpdG9yOiBhdG9tJFRleHRFZGl0b3IpOiB2b2lkIHtcbiAgICBjb25zdCBibGFtZUd1dHRlciA9IHRoaXMuX3RleHRFZGl0b3JUb0JsYW1lR3V0dGVyLmdldChlZGl0b3IpO1xuICAgIGlmIChibGFtZUd1dHRlcikge1xuICAgICAgYmxhbWVHdXR0ZXIuZGVzdHJveSgpO1xuICAgICAgdGhpcy5fdGV4dEVkaXRvclRvQmxhbWVHdXR0ZXIuZGVsZXRlKGVkaXRvcik7XG4gICAgfVxuICAgIHRoaXMuX3RleHRFZGl0b3JUb0Rlc3Ryb3lTdWJzY3JpcHRpb24uZGVsZXRlKGVkaXRvcik7XG4gIH1cblxuICAvKipcbiAgICogU2VjdGlvbjogTWFuYWdpbmcgQ29udGV4dCBNZW51c1xuICAgKi9cblxuICAgQHRyYWNrVGltaW5nKCdibGFtZS5zaG93QmxhbWUnKVxuICBfc2hvd0JsYW1lKGV2ZW50KTogdm9pZCB7XG4gICAgY29uc3QgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICAgIGlmIChlZGl0b3IgIT0gbnVsbCkge1xuICAgICAgdGhpcy5fc2hvd0JsYW1lR3V0dGVyRm9yRWRpdG9yKGVkaXRvcik7XG4gICAgfVxuICB9XG5cbiAgQHRyYWNrVGltaW5nKCdibGFtZS5oaWRlQmxhbWUnKVxuICBfaGlkZUJsYW1lKGV2ZW50KTogdm9pZCB7XG4gICAgY29uc3QgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICAgIGlmIChlZGl0b3IgIT0gbnVsbCkge1xuICAgICAgdGhpcy5fcmVtb3ZlQmxhbWVHdXR0ZXJGb3JFZGl0b3IoZWRpdG9yKTtcbiAgICB9XG4gIH1cblxuICBfY2FuU2hvd0JsYW1lKCk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKTtcbiAgICByZXR1cm4gIShlZGl0b3IgIT0gbnVsbCAmJiB0aGlzLl90ZXh0RWRpdG9yVG9CbGFtZUd1dHRlci5oYXMoZWRpdG9yKSk7XG4gIH1cblxuICBfY2FuSGlkZUJsYW1lKCk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKTtcbiAgICByZXR1cm4gZWRpdG9yICE9IG51bGwgJiYgdGhpcy5fdGV4dEVkaXRvclRvQmxhbWVHdXR0ZXIuaGFzKGVkaXRvcik7XG4gIH1cblxuICAvKipcbiAgICogU2VjdGlvbjogQ29uc3VtaW5nIFNlcnZpY2VzXG4gICAqL1xuXG4gIGNvbnN1bWVCbGFtZUd1dHRlckNsYXNzKGJsYW1lR3V0dGVyQ2xhc3M6IEJsYW1lR3V0dGVyQ2xhc3MpOiBJRGlzcG9zYWJsZSB7XG4gICAgLy8gVGhpcyBwYWNrYWdlIG9ubHkgZXhwZWN0cyBvbmUgZ3V0dGVyIFVJLiBJdCB3aWxsIHRha2UgdGhlIGZpcnN0IG9uZS5cbiAgICBpZiAodGhpcy5fYmxhbWVHdXR0ZXJDbGFzcyA9PSBudWxsKSB7XG4gICAgICB0aGlzLl9ibGFtZUd1dHRlckNsYXNzID0gYmxhbWVHdXR0ZXJDbGFzcztcbiAgICAgIHJldHVybiBuZXcgRGlzcG9zYWJsZSgoKSA9PiB7XG4gICAgICAgIHRoaXMuX2JsYW1lR3V0dGVyQ2xhc3MgPSBudWxsO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBuZXcgRGlzcG9zYWJsZSgoKSA9PiB7fSk7XG4gICAgfVxuICB9XG5cbiAgY29uc3VtZUJsYW1lUHJvdmlkZXIocHJvdmlkZXI6IEJsYW1lUHJvdmlkZXIpOiBJRGlzcG9zYWJsZSB7XG4gICAgdGhpcy5fcmVnaXN0ZXJlZFByb3ZpZGVycy5hZGQocHJvdmlkZXIpO1xuICAgIHJldHVybiBuZXcgRGlzcG9zYWJsZSgoKSA9PiB7XG4gICAgICBpZiAodGhpcy5fcmVnaXN0ZXJlZFByb3ZpZGVycykge1xuICAgICAgICB0aGlzLl9yZWdpc3RlcmVkUHJvdmlkZXJzLmRlbGV0ZShwcm92aWRlcik7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBhZGRJdGVtc1RvRmlsZVRyZWVDb250ZXh0TWVudShjb250ZXh0TWVudTogRmlsZVRyZWVDb250ZXh0TWVudSk6IElEaXNwb3NhYmxlIHtcbiAgICBjb25zdCBtZW51SXRlbURlc2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgbWVudUl0ZW1EZXNjcmlwdGlvbnMuYWRkKFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoXG4gICAgICAgICdhdG9tLXdvcmtzcGFjZScsXG4gICAgICAgIC8qIGVzbGludC1kaXNhYmxlIG51Y2xpZGUtaW50ZXJuYWwvY29tbWFuZC1tZW51LWl0ZW1zICovXG4gICAgICAgIC8vIFRoaXMgZG9lcyBub3QgYmVsb25nIGluIGEgbWVudSBiZWNhdXNlIGl0IHNob3VsZCBub3QgYmUgYSBwdWJsaWMgY29tbWFuZDpcbiAgICAgICAgLy8gaXQgc2hvdWxkIGJlIGEgY2FsbGJhY2ssIGJ1dCBDb250ZXh0TWVudU1hbmFnZXIgZm9yY2VzIG91ciBoYW5kLlxuICAgICAgICAnbnVjbGlkZS1ibGFtZTp0b2dnbGUtYmxhbWUtZmlsZS10cmVlJyxcbiAgICAgICAgLyogZXNsaW50LWVuYWJsZSBudWNsaWRlLWludGVybmFsL2NvbW1hbmQtbWVudS1pdGVtcyAqL1xuICAgICAgICBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgY29uc3Qge2dvVG9Mb2NhdGlvbn0gPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLWF0b20taGVscGVycycpO1xuICAgICAgICAgIGZpbmRCbGFtZWFibGVOb2Rlcyhjb250ZXh0TWVudSkuZm9yRWFjaChhc3luYyBub2RlID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGVkaXRvciA9IGF3YWl0IGdvVG9Mb2NhdGlvbihub2RlLnVyaSk7XG4gICAgICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGF0b20udmlld3MuZ2V0VmlldyhlZGl0b3IpLCAnbnVjbGlkZS1ibGFtZTp0b2dnbGUtYmxhbWUnKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICksXG4gICAgICBjb250ZXh0TWVudS5hZGRJdGVtVG9Tb3VyY2VDb250cm9sTWVudShcbiAgICAgICAge1xuICAgICAgICAgIGxhYmVsOiAnVG9nZ2xlIEJsYW1lJyxcbiAgICAgICAgICBjb21tYW5kOiAnbnVjbGlkZS1ibGFtZTp0b2dnbGUtYmxhbWUtZmlsZS10cmVlJyxcbiAgICAgICAgICBzaG91bGREaXNwbGF5KCkge1xuICAgICAgICAgICAgcmV0dXJuIGZpbmRCbGFtZWFibGVOb2Rlcyhjb250ZXh0TWVudSkubGVuZ3RoID4gMDtcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICBUT0dHTEVfQkxBTUVfRklMRV9UUkVFX0NPTlRFWFRfTUVOVV9QUklPUklUWSxcbiAgICAgICksXG4gICAgKTtcbiAgICB0aGlzLl9wYWNrYWdlRGlzcG9zYWJsZXMuYWRkKG1lbnVJdGVtRGVzY3JpcHRpb25zKTtcbiAgICByZXR1cm4gbWVudUl0ZW1EZXNjcmlwdGlvbnM7XG4gIH1cbn1cblxuLyoqXG4gKiBAcmV0dXJuIGxpc3Qgb2Ygbm9kZXMgYWdhaW5zdCB3aGljaCBcIlRvZ2dsZSBCbGFtZVwiIGlzIGFuIGFwcHJvcHJpYXRlIGFjdGlvbi4gQ3VycmVudGx5LCB0aGlzXG4gKiAgIGJsaW5kbHkgcmV0dXJucyBhbGwgZmlsZXMsIGJ1dCBpdCB3b3VsZCBiZSBiZXR0ZXIgdG8gbGltaXQgaXQgdG8gZmlsZXMgdGhhdCBhcmUgcGFydCBvZiBhblxuICogICBIZyByZXBvc2l0b3J5LlxuICovXG5mdW5jdGlvbiBmaW5kQmxhbWVhYmxlTm9kZXMoY29udGV4dE1lbnU6IEZpbGVUcmVlQ29udGV4dE1lbnUpOiBBcnJheTxGaWxlVHJlZU5vZGU+IHtcbiAgY29uc3Qgbm9kZXMgPSBbXTtcbiAgZm9yIChjb25zdCBub2RlIG9mIGNvbnRleHRNZW51LmdldFNlbGVjdGVkTm9kZXMoKSkge1xuICAgIGlmICghbm9kZS5pc0NvbnRhaW5lcikge1xuICAgICAgbm9kZXMucHVzaChub2RlKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG5vZGVzO1xufVxuXG5sZXQgYWN0aXZhdGlvbjogP0FjdGl2YXRpb247XG5cbmV4cG9ydCBmdW5jdGlvbiBhY3RpdmF0ZShzdGF0ZTogP09iamVjdCk6IHZvaWQge1xuICBpZiAoIWFjdGl2YXRpb24pIHtcbiAgICBhY3RpdmF0aW9uID0gbmV3IEFjdGl2YXRpb24oKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVhY3RpdmF0ZSgpIHtcbiAgaWYgKGFjdGl2YXRpb24pIHtcbiAgICBhY3RpdmF0aW9uLmRpc3Bvc2UoKTtcbiAgICBhY3RpdmF0aW9uID0gbnVsbDtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY29uc3VtZUJsYW1lR3V0dGVyQ2xhc3MoYmxhbWVHdXR0ZXI6IEJsYW1lR3V0dGVyQ2xhc3MpOiBJRGlzcG9zYWJsZSB7XG4gIGludmFyaWFudChhY3RpdmF0aW9uKTtcbiAgcmV0dXJuIGFjdGl2YXRpb24uY29uc3VtZUJsYW1lR3V0dGVyQ2xhc3MoYmxhbWVHdXR0ZXIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29uc3VtZUJsYW1lUHJvdmlkZXIocHJvdmlkZXI6IEJsYW1lUHJvdmlkZXIpOiBJRGlzcG9zYWJsZSB7XG4gIGludmFyaWFudChhY3RpdmF0aW9uKTtcbiAgcmV0dXJuIGFjdGl2YXRpb24uY29uc3VtZUJsYW1lUHJvdmlkZXIocHJvdmlkZXIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYWRkSXRlbXNUb0ZpbGVUcmVlQ29udGV4dE1lbnUoY29udGV4dE1lbnU6IEZpbGVUcmVlQ29udGV4dE1lbnUpOiBJRGlzcG9zYWJsZSB7XG4gIGludmFyaWFudChhY3RpdmF0aW9uKTtcbiAgcmV0dXJuIGFjdGl2YXRpb24uYWRkSXRlbXNUb0ZpbGVUcmVlQ29udGV4dE1lbnUoY29udGV4dE1lbnUpO1xufVxuIl19