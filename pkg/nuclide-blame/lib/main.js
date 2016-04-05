var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === 'function') { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError('The decorator for method ' + descriptor.key + ' is of the invalid type ' + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _nuclideAnalytics = require('../../nuclide-analytics');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var PACKAGES_MISSING_MESSAGE = 'Could not open blame: the nuclide-blame package needs other Atom packages to provide:\n  - a gutter UI class\n  - at least one blame provider\n\nYou are missing one of these.';

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
  }]);

  return Activation;
})();

var activation = undefined;

module.exports = {
  activate: function activate(state) {
    if (!activation) {
      activation = new Activation();
    }
  },

  deactivate: function deactivate() {
    if (activation) {
      activation.dispose();
      activation = null;
    }
  },

  consumeBlameGutterClass: function consumeBlameGutterClass(blameGutter) {
    (0, _assert2['default'])(activation);
    return activation.consumeBlameGutterClass(blameGutter);
  },

  consumeBlameProvider: function consumeBlameProvider(provider) {
    (0, _assert2['default'])(activation);
    return activation.consumeBlameProvider(provider);
  }
};

// Map of a TextEditor to its BlameGutter, if it exists.

// Map of a TextEditor to the subscription on its ::onDidDestroy.
//# sourceMappingURL=data:application/json;base64,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QUFDLFFBQVEsQ0FBQyxDQUFDO0dBQ2xEO0NBQ0YsQ0FBQyIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0JsYW1lUHJvdmlkZXJ9IGZyb20gJy4uLy4uL251Y2xpZGUtYmxhbWUtYmFzZSc7XG5cbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZSwgRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQge3RyYWNrVGltaW5nfSBmcm9tICcuLi8uLi9udWNsaWRlLWFuYWx5dGljcyc7XG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5cbmNvbnN0IFBBQ0tBR0VTX01JU1NJTkdfTUVTU0FHRSA9XG5gQ291bGQgbm90IG9wZW4gYmxhbWU6IHRoZSBudWNsaWRlLWJsYW1lIHBhY2thZ2UgbmVlZHMgb3RoZXIgQXRvbSBwYWNrYWdlcyB0byBwcm92aWRlOlxuICAtIGEgZ3V0dGVyIFVJIGNsYXNzXG4gIC0gYXQgbGVhc3Qgb25lIGJsYW1lIHByb3ZpZGVyXG5cbllvdSBhcmUgbWlzc2luZyBvbmUgb2YgdGhlc2UuYDtcblxudHlwZSBCbGFtZUd1dHRlciA9IHtcbiAgZGVzdHJveTogKCkgPT4gdm9pZDtcbn07XG5cbnR5cGUgQmxhbWVHdXR0ZXJDbGFzcyA9ICgpID0+IEJsYW1lR3V0dGVyO1xuXG5jbGFzcyBBY3RpdmF0aW9uIHtcbiAgX3BhY2thZ2VEaXNwb3NhYmxlczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX3JlZ2lzdGVyZWRQcm92aWRlcnM6IFNldDxCbGFtZVByb3ZpZGVyPjtcbiAgX2JsYW1lR3V0dGVyQ2xhc3M6ID9CbGFtZUd1dHRlckNsYXNzO1xuICAvLyBNYXAgb2YgYSBUZXh0RWRpdG9yIHRvIGl0cyBCbGFtZUd1dHRlciwgaWYgaXQgZXhpc3RzLlxuICBfdGV4dEVkaXRvclRvQmxhbWVHdXR0ZXI6IE1hcDxhdG9tJFRleHRFZGl0b3IsIEJsYW1lR3V0dGVyPjtcbiAgLy8gTWFwIG9mIGEgVGV4dEVkaXRvciB0byB0aGUgc3Vic2NyaXB0aW9uIG9uIGl0cyA6Om9uRGlkRGVzdHJveS5cbiAgX3RleHRFZGl0b3JUb0Rlc3Ryb3lTdWJzY3JpcHRpb246IE1hcDxhdG9tJFRleHRFZGl0b3IsIElEaXNwb3NhYmxlPjtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl9yZWdpc3RlcmVkUHJvdmlkZXJzID0gbmV3IFNldCgpO1xuICAgIHRoaXMuX3RleHRFZGl0b3JUb0JsYW1lR3V0dGVyID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuX3RleHRFZGl0b3JUb0Rlc3Ryb3lTdWJzY3JpcHRpb24gPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5fcGFja2FnZURpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLl9wYWNrYWdlRGlzcG9zYWJsZXMuYWRkKGF0b20uY29udGV4dE1lbnUuYWRkKHtcbiAgICAgICdhdG9tLXRleHQtZWRpdG9yJzogW3tcbiAgICAgICAgbGFiZWw6ICdUb2dnbGUgQmxhbWUnLFxuICAgICAgICBjb21tYW5kOiAnbnVjbGlkZS1ibGFtZTp0b2dnbGUtYmxhbWUnLFxuICAgICAgICBzaG91bGREaXNwbGF5OiAoZXZlbnQ6IE1vdXNlRXZlbnQpID0+ICh0aGlzLl9jYW5TaG93QmxhbWUoKSB8fCB0aGlzLl9jYW5IaWRlQmxhbWUoKSksXG4gICAgICB9XSxcbiAgICB9KSk7XG4gICAgdGhpcy5fcGFja2FnZURpc3Bvc2FibGVzLmFkZChcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXRleHQtZWRpdG9yJywgJ251Y2xpZGUtYmxhbWU6dG9nZ2xlLWJsYW1lJywgKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5fY2FuU2hvd0JsYW1lKCkpIHtcbiAgICAgICAgICB0aGlzLl9zaG93QmxhbWUoKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9jYW5IaWRlQmxhbWUoKSkge1xuICAgICAgICAgIHRoaXMuX2hpZGVCbGFtZSgpO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgICk7XG4gIH1cblxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuX3BhY2thZ2VEaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gICAgdGhpcy5fcmVnaXN0ZXJlZFByb3ZpZGVycy5jbGVhcigpO1xuICAgIHRoaXMuX3RleHRFZGl0b3JUb0JsYW1lR3V0dGVyLmNsZWFyKCk7XG4gICAgZm9yIChjb25zdCBkaXNwb3NhYmxlIG9mIHRoaXMuX3RleHRFZGl0b3JUb0Rlc3Ryb3lTdWJzY3JpcHRpb24udmFsdWVzKCkpIHtcbiAgICAgIGRpc3Bvc2FibGUuZGlzcG9zZSgpO1xuICAgIH1cbiAgICB0aGlzLl90ZXh0RWRpdG9yVG9EZXN0cm95U3Vic2NyaXB0aW9uLmNsZWFyKCk7XG4gIH1cblxuICAvKipcbiAgICogU2VjdGlvbjogTWFuYWdpbmcgR3V0dGVyc1xuICAgKi9cblxuICBfcmVtb3ZlQmxhbWVHdXR0ZXJGb3JFZGl0b3IoZWRpdG9yOiBhdG9tJFRleHRFZGl0b3IpOiB2b2lkIHtcbiAgICBjb25zdCBibGFtZUd1dHRlciA9IHRoaXMuX3RleHRFZGl0b3JUb0JsYW1lR3V0dGVyLmdldChlZGl0b3IpO1xuICAgIGlmIChibGFtZUd1dHRlciAhPSBudWxsKSB7XG4gICAgICBibGFtZUd1dHRlci5kZXN0cm95KCk7XG4gICAgICB0aGlzLl90ZXh0RWRpdG9yVG9CbGFtZUd1dHRlci5kZWxldGUoZWRpdG9yKTtcbiAgICB9XG4gIH1cblxuICBfc2hvd0JsYW1lR3V0dGVyRm9yRWRpdG9yKGVkaXRvcjogYXRvbSRUZXh0RWRpdG9yKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2JsYW1lR3V0dGVyQ2xhc3MgPT0gbnVsbCB8fCB0aGlzLl9yZWdpc3RlcmVkUHJvdmlkZXJzLnNpemUgPT09IDApIHtcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvKFBBQ0tBR0VTX01JU1NJTkdfTUVTU0FHRSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IGJsYW1lR3V0dGVyID0gdGhpcy5fdGV4dEVkaXRvclRvQmxhbWVHdXR0ZXIuZ2V0KGVkaXRvcik7XG4gICAgaWYgKCFibGFtZUd1dHRlcikge1xuICAgICAgbGV0IHByb3ZpZGVyRm9yRWRpdG9yID0gbnVsbDtcbiAgICAgIGZvciAoY29uc3QgYmxhbWVQcm92aWRlciBvZiB0aGlzLl9yZWdpc3RlcmVkUHJvdmlkZXJzKSB7XG4gICAgICAgIGlmIChibGFtZVByb3ZpZGVyLmNhblByb3ZpZGVCbGFtZUZvckVkaXRvcihlZGl0b3IpKSB7XG4gICAgICAgICAgcHJvdmlkZXJGb3JFZGl0b3IgPSBibGFtZVByb3ZpZGVyO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChwcm92aWRlckZvckVkaXRvcikge1xuICAgICAgICBjb25zdCBibGFtZUd1dHRlckNsYXNzID0gdGhpcy5fYmxhbWVHdXR0ZXJDbGFzcztcbiAgICAgICAgaW52YXJpYW50KGJsYW1lR3V0dGVyQ2xhc3MpO1xuICAgICAgICBibGFtZUd1dHRlciA9IG5ldyBibGFtZUd1dHRlckNsYXNzKCdudWNsaWRlLWJsYW1lJywgZWRpdG9yLCBwcm92aWRlckZvckVkaXRvcik7XG4gICAgICAgIHRoaXMuX3RleHRFZGl0b3JUb0JsYW1lR3V0dGVyLnNldChlZGl0b3IsIGJsYW1lR3V0dGVyKTtcbiAgICAgICAgY29uc3QgZGVzdHJveVN1YnNjcmlwdGlvbiA9IGVkaXRvci5vbkRpZERlc3Ryb3koKCkgPT4gdGhpcy5fZWRpdG9yV2FzRGVzdHJveWVkKGVkaXRvcikpO1xuICAgICAgICB0aGlzLl90ZXh0RWRpdG9yVG9EZXN0cm95U3Vic2NyaXB0aW9uLnNldChlZGl0b3IsIGRlc3Ryb3lTdWJzY3JpcHRpb24pO1xuICAgICAgICBjb25zdCB7dHJhY2t9ID0gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS1hbmFseXRpY3MnKTtcbiAgICAgICAgdHJhY2soJ2JsYW1lLW9wZW4nLCB7XG4gICAgICAgICAgZWRpdG9yUGF0aDogZWRpdG9yLmdldFBhdGgoKSB8fCAnJyxcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbyhcbiAgICAgICAgICAnQ291bGQgbm90IG9wZW4gYmxhbWU6IG5vIGJsYW1lIGluZm9ybWF0aW9uIGN1cnJlbnRseSBhdmFpbGFibGUgZm9yIHRoaXMgZmlsZS4nXG4gICAgICAgICk7XG4gICAgICAgIGNvbnN0IGxvZ2dlciA9IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtbG9nZ2luZycpLmdldExvZ2dlcigpO1xuICAgICAgICBsb2dnZXIuaW5mbyhcbiAgICAgICAgICAnbnVjbGlkZS1ibGFtZTogQ291bGQgbm90IG9wZW4gYmxhbWU6IG5vIGJsYW1lIHByb3ZpZGVyIGN1cnJlbnRseSBhdmFpbGFibGUgZm9yIHRoaXMgJyArXG4gICAgICAgICAgYGZpbGU6ICR7U3RyaW5nKGVkaXRvci5nZXRQYXRoKCkpfWBcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBfZWRpdG9yV2FzRGVzdHJveWVkKGVkaXRvcjogYXRvbSRUZXh0RWRpdG9yKTogdm9pZCB7XG4gICAgY29uc3QgYmxhbWVHdXR0ZXIgPSB0aGlzLl90ZXh0RWRpdG9yVG9CbGFtZUd1dHRlci5nZXQoZWRpdG9yKTtcbiAgICBpZiAoYmxhbWVHdXR0ZXIpIHtcbiAgICAgIGJsYW1lR3V0dGVyLmRlc3Ryb3koKTtcbiAgICAgIHRoaXMuX3RleHRFZGl0b3JUb0JsYW1lR3V0dGVyLmRlbGV0ZShlZGl0b3IpO1xuICAgIH1cbiAgICB0aGlzLl90ZXh0RWRpdG9yVG9EZXN0cm95U3Vic2NyaXB0aW9uLmRlbGV0ZShlZGl0b3IpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlY3Rpb246IE1hbmFnaW5nIENvbnRleHQgTWVudXNcbiAgICovXG5cbiAgIEB0cmFja1RpbWluZygnYmxhbWUuc2hvd0JsYW1lJylcbiAgX3Nob3dCbGFtZShldmVudCk6IHZvaWQge1xuICAgIGNvbnN0IGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKTtcbiAgICBpZiAoZWRpdG9yICE9IG51bGwpIHtcbiAgICAgIHRoaXMuX3Nob3dCbGFtZUd1dHRlckZvckVkaXRvcihlZGl0b3IpO1xuICAgIH1cbiAgfVxuXG4gIEB0cmFja1RpbWluZygnYmxhbWUuaGlkZUJsYW1lJylcbiAgX2hpZGVCbGFtZShldmVudCk6IHZvaWQge1xuICAgIGNvbnN0IGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKTtcbiAgICBpZiAoZWRpdG9yICE9IG51bGwpIHtcbiAgICAgIHRoaXMuX3JlbW92ZUJsYW1lR3V0dGVyRm9yRWRpdG9yKGVkaXRvcik7XG4gICAgfVxuICB9XG5cbiAgX2NhblNob3dCbGFtZSgpOiBib29sZWFuIHtcbiAgICBjb25zdCBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk7XG4gICAgcmV0dXJuICEoZWRpdG9yICE9IG51bGwgJiYgdGhpcy5fdGV4dEVkaXRvclRvQmxhbWVHdXR0ZXIuaGFzKGVkaXRvcikpO1xuICB9XG5cbiAgX2NhbkhpZGVCbGFtZSgpOiBib29sZWFuIHtcbiAgICBjb25zdCBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk7XG4gICAgcmV0dXJuIGVkaXRvciAhPSBudWxsICYmIHRoaXMuX3RleHRFZGl0b3JUb0JsYW1lR3V0dGVyLmhhcyhlZGl0b3IpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlY3Rpb246IENvbnN1bWluZyBTZXJ2aWNlc1xuICAgKi9cblxuICBjb25zdW1lQmxhbWVHdXR0ZXJDbGFzcyhibGFtZUd1dHRlckNsYXNzOiBCbGFtZUd1dHRlckNsYXNzKTogSURpc3Bvc2FibGUge1xuICAgIC8vIFRoaXMgcGFja2FnZSBvbmx5IGV4cGVjdHMgb25lIGd1dHRlciBVSS4gSXQgd2lsbCB0YWtlIHRoZSBmaXJzdCBvbmUuXG4gICAgaWYgKHRoaXMuX2JsYW1lR3V0dGVyQ2xhc3MgPT0gbnVsbCkge1xuICAgICAgdGhpcy5fYmxhbWVHdXR0ZXJDbGFzcyA9IGJsYW1lR3V0dGVyQ2xhc3M7XG4gICAgICByZXR1cm4gbmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgICB0aGlzLl9ibGFtZUd1dHRlckNsYXNzID0gbnVsbDtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbmV3IERpc3Bvc2FibGUoKCkgPT4ge30pO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN1bWVCbGFtZVByb3ZpZGVyKHByb3ZpZGVyOiBCbGFtZVByb3ZpZGVyKTogSURpc3Bvc2FibGUge1xuICAgIHRoaXMuX3JlZ2lzdGVyZWRQcm92aWRlcnMuYWRkKHByb3ZpZGVyKTtcbiAgICByZXR1cm4gbmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgaWYgKHRoaXMuX3JlZ2lzdGVyZWRQcm92aWRlcnMpIHtcbiAgICAgICAgdGhpcy5fcmVnaXN0ZXJlZFByb3ZpZGVycy5kZWxldGUocHJvdmlkZXIpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59XG5cblxubGV0IGFjdGl2YXRpb246ID9BY3RpdmF0aW9uO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgYWN0aXZhdGUoc3RhdGU6ID9PYmplY3QpOiB2b2lkIHtcbiAgICBpZiAoIWFjdGl2YXRpb24pIHtcbiAgICAgIGFjdGl2YXRpb24gPSBuZXcgQWN0aXZhdGlvbigpO1xuICAgIH1cbiAgfSxcblxuICBkZWFjdGl2YXRlKCkge1xuICAgIGlmIChhY3RpdmF0aW9uKSB7XG4gICAgICBhY3RpdmF0aW9uLmRpc3Bvc2UoKTtcbiAgICAgIGFjdGl2YXRpb24gPSBudWxsO1xuICAgIH1cbiAgfSxcblxuICBjb25zdW1lQmxhbWVHdXR0ZXJDbGFzcyhibGFtZUd1dHRlcjogQmxhbWVHdXR0ZXJDbGFzcyk6IElEaXNwb3NhYmxlIHtcbiAgICBpbnZhcmlhbnQoYWN0aXZhdGlvbik7XG4gICAgcmV0dXJuIGFjdGl2YXRpb24uY29uc3VtZUJsYW1lR3V0dGVyQ2xhc3MoYmxhbWVHdXR0ZXIpO1xuICB9LFxuXG4gIGNvbnN1bWVCbGFtZVByb3ZpZGVyKHByb3ZpZGVyOiBCbGFtZVByb3ZpZGVyKTogSURpc3Bvc2FibGUge1xuICAgIGludmFyaWFudChhY3RpdmF0aW9uKTtcbiAgICByZXR1cm4gYWN0aXZhdGlvbi5jb25zdW1lQmxhbWVQcm92aWRlcihwcm92aWRlcik7XG4gIH0sXG59O1xuIl19