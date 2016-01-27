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

var _analytics = require('../../analytics');

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

          var _require = require('../../analytics');

          var track = _require.track;

          track('blame-open', {
            editorPath: editor.getPath() || ''
          });
        } else {
          atom.notifications.addInfo('Could not open blame: no blame information currently available for this file.');
          var logger = require('../../logging').getLogger();
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
    decorators: [(0, _analytics.trackTiming)('blame.showBlame')],
    value: function _showBlame(event) {
      var editor = atom.workspace.getActiveTextEditor();
      if (editor != null) {
        this._showBlameGutterForEditor(editor);
      }
    }
  }, {
    key: '_hideBlame',
    decorators: [(0, _analytics.trackTiming)('blame.hideBlame')],
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
//# sourceMappingURL=data:application/json;base64,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LENBQUMsUUFBUSxDQUFDLENBQUM7R0FDbEQ7Q0FDRixDQUFDIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7QmxhbWVQcm92aWRlcn0gZnJvbSAnLi4vLi4vYmxhbWUtYmFzZSc7XG5cbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZSwgRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQge3RyYWNrVGltaW5nfSBmcm9tICcuLi8uLi9hbmFseXRpY3MnO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuXG5jb25zdCBQQUNLQUdFU19NSVNTSU5HX01FU1NBR0UgPVxuYENvdWxkIG5vdCBvcGVuIGJsYW1lOiB0aGUgbnVjbGlkZS1ibGFtZSBwYWNrYWdlIG5lZWRzIG90aGVyIEF0b20gcGFja2FnZXMgdG8gcHJvdmlkZTpcbiAgLSBhIGd1dHRlciBVSSBjbGFzc1xuICAtIGF0IGxlYXN0IG9uZSBibGFtZSBwcm92aWRlclxuXG5Zb3UgYXJlIG1pc3Npbmcgb25lIG9mIHRoZXNlLmA7XG5cbnR5cGUgQmxhbWVHdXR0ZXIgPSB7XG4gIGRlc3Ryb3k6ICgpID0+IHZvaWQ7XG59O1xuXG50eXBlIEJsYW1lR3V0dGVyQ2xhc3MgPSAoKSA9PiBCbGFtZUd1dHRlcjtcblxuY2xhc3MgQWN0aXZhdGlvbiB7XG4gIF9wYWNrYWdlRGlzcG9zYWJsZXM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIF9yZWdpc3RlcmVkUHJvdmlkZXJzOiBTZXQ8QmxhbWVQcm92aWRlcj47XG4gIF9ibGFtZUd1dHRlckNsYXNzOiA/QmxhbWVHdXR0ZXJDbGFzcztcbiAgLy8gTWFwIG9mIGEgVGV4dEVkaXRvciB0byBpdHMgQmxhbWVHdXR0ZXIsIGlmIGl0IGV4aXN0cy5cbiAgX3RleHRFZGl0b3JUb0JsYW1lR3V0dGVyOiBNYXA8YXRvbSRUZXh0RWRpdG9yLCBCbGFtZUd1dHRlcj47XG4gIC8vIE1hcCBvZiBhIFRleHRFZGl0b3IgdG8gdGhlIHN1YnNjcmlwdGlvbiBvbiBpdHMgOjpvbkRpZERlc3Ryb3kuXG4gIF90ZXh0RWRpdG9yVG9EZXN0cm95U3Vic2NyaXB0aW9uOiBNYXA8YXRvbSRUZXh0RWRpdG9yLCBhdG9tJERpc3Bvc2FibGU+O1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX3JlZ2lzdGVyZWRQcm92aWRlcnMgPSBuZXcgU2V0KCk7XG4gICAgdGhpcy5fdGV4dEVkaXRvclRvQmxhbWVHdXR0ZXIgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5fdGV4dEVkaXRvclRvRGVzdHJveVN1YnNjcmlwdGlvbiA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLl9wYWNrYWdlRGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIHRoaXMuX3BhY2thZ2VEaXNwb3NhYmxlcy5hZGQoYXRvbS5jb250ZXh0TWVudS5hZGQoe1xuICAgICAgJ2F0b20tdGV4dC1lZGl0b3InOiBbe1xuICAgICAgICBsYWJlbDogJ1RvZ2dsZSBCbGFtZScsXG4gICAgICAgIGNvbW1hbmQ6ICdudWNsaWRlLWJsYW1lOnRvZ2dsZS1ibGFtZScsXG4gICAgICAgIHNob3VsZERpc3BsYXk6IChldmVudDogTW91c2VFdmVudCkgPT4gKHRoaXMuX2NhblNob3dCbGFtZSgpIHx8IHRoaXMuX2NhbkhpZGVCbGFtZSgpKSxcbiAgICAgIH1dLFxuICAgIH0pKTtcbiAgICB0aGlzLl9wYWNrYWdlRGlzcG9zYWJsZXMuYWRkKFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20tdGV4dC1lZGl0b3InLCAnbnVjbGlkZS1ibGFtZTp0b2dnbGUtYmxhbWUnLCAoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLl9jYW5TaG93QmxhbWUoKSkge1xuICAgICAgICAgIHRoaXMuX3Nob3dCbGFtZSgpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2NhbkhpZGVCbGFtZSgpKSB7XG4gICAgICAgICAgdGhpcy5faGlkZUJsYW1lKCk7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgKTtcbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5fcGFja2FnZURpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgICB0aGlzLl9yZWdpc3RlcmVkUHJvdmlkZXJzLmNsZWFyKCk7XG4gICAgdGhpcy5fdGV4dEVkaXRvclRvQmxhbWVHdXR0ZXIuY2xlYXIoKTtcbiAgICBmb3IgKGNvbnN0IGRpc3Bvc2FibGUgb2YgdGhpcy5fdGV4dEVkaXRvclRvRGVzdHJveVN1YnNjcmlwdGlvbi52YWx1ZXMoKSkge1xuICAgICAgZGlzcG9zYWJsZS5kaXNwb3NlKCk7XG4gICAgfVxuICAgIHRoaXMuX3RleHRFZGl0b3JUb0Rlc3Ryb3lTdWJzY3JpcHRpb24uY2xlYXIoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWN0aW9uOiBNYW5hZ2luZyBHdXR0ZXJzXG4gICAqL1xuXG4gIF9yZW1vdmVCbGFtZUd1dHRlckZvckVkaXRvcihlZGl0b3I6IGF0b20kVGV4dEVkaXRvcik6IHZvaWQge1xuICAgIGNvbnN0IGJsYW1lR3V0dGVyID0gdGhpcy5fdGV4dEVkaXRvclRvQmxhbWVHdXR0ZXIuZ2V0KGVkaXRvcik7XG4gICAgaWYgKGJsYW1lR3V0dGVyICE9IG51bGwpIHtcbiAgICAgIGJsYW1lR3V0dGVyLmRlc3Ryb3koKTtcbiAgICAgIHRoaXMuX3RleHRFZGl0b3JUb0JsYW1lR3V0dGVyLmRlbGV0ZShlZGl0b3IpO1xuICAgIH1cbiAgfVxuXG4gIF9zaG93QmxhbWVHdXR0ZXJGb3JFZGl0b3IoZWRpdG9yOiBhdG9tJFRleHRFZGl0b3IpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fYmxhbWVHdXR0ZXJDbGFzcyA9PSBudWxsIHx8IHRoaXMuX3JlZ2lzdGVyZWRQcm92aWRlcnMuc2l6ZSA9PT0gMCkge1xuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oUEFDS0FHRVNfTUlTU0lOR19NRVNTQUdFKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgYmxhbWVHdXR0ZXIgPSB0aGlzLl90ZXh0RWRpdG9yVG9CbGFtZUd1dHRlci5nZXQoZWRpdG9yKTtcbiAgICBpZiAoIWJsYW1lR3V0dGVyKSB7XG4gICAgICBsZXQgcHJvdmlkZXJGb3JFZGl0b3IgPSBudWxsO1xuICAgICAgZm9yIChjb25zdCBibGFtZVByb3ZpZGVyIG9mIHRoaXMuX3JlZ2lzdGVyZWRQcm92aWRlcnMpIHtcbiAgICAgICAgaWYgKGJsYW1lUHJvdmlkZXIuY2FuUHJvdmlkZUJsYW1lRm9yRWRpdG9yKGVkaXRvcikpIHtcbiAgICAgICAgICBwcm92aWRlckZvckVkaXRvciA9IGJsYW1lUHJvdmlkZXI7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHByb3ZpZGVyRm9yRWRpdG9yKSB7XG4gICAgICAgIGNvbnN0IGJsYW1lR3V0dGVyQ2xhc3MgPSB0aGlzLl9ibGFtZUd1dHRlckNsYXNzO1xuICAgICAgICBpbnZhcmlhbnQoYmxhbWVHdXR0ZXJDbGFzcyk7XG4gICAgICAgIGJsYW1lR3V0dGVyID0gbmV3IGJsYW1lR3V0dGVyQ2xhc3MoJ251Y2xpZGUtYmxhbWUnLCBlZGl0b3IsIHByb3ZpZGVyRm9yRWRpdG9yKTtcbiAgICAgICAgdGhpcy5fdGV4dEVkaXRvclRvQmxhbWVHdXR0ZXIuc2V0KGVkaXRvciwgYmxhbWVHdXR0ZXIpO1xuICAgICAgICBjb25zdCBkZXN0cm95U3Vic2NyaXB0aW9uID0gZWRpdG9yLm9uRGlkRGVzdHJveSgoKSA9PiB0aGlzLl9lZGl0b3JXYXNEZXN0cm95ZWQoZWRpdG9yKSk7XG4gICAgICAgIHRoaXMuX3RleHRFZGl0b3JUb0Rlc3Ryb3lTdWJzY3JpcHRpb24uc2V0KGVkaXRvciwgZGVzdHJveVN1YnNjcmlwdGlvbik7XG4gICAgICAgIGNvbnN0IHt0cmFja30gPSByZXF1aXJlKCcuLi8uLi9hbmFseXRpY3MnKTtcbiAgICAgICAgdHJhY2soJ2JsYW1lLW9wZW4nLCB7XG4gICAgICAgICAgZWRpdG9yUGF0aDogZWRpdG9yLmdldFBhdGgoKSB8fCAnJyxcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbyhcbiAgICAgICAgICAnQ291bGQgbm90IG9wZW4gYmxhbWU6IG5vIGJsYW1lIGluZm9ybWF0aW9uIGN1cnJlbnRseSBhdmFpbGFibGUgZm9yIHRoaXMgZmlsZS4nXG4gICAgICAgICk7XG4gICAgICAgIGNvbnN0IGxvZ2dlciA9IHJlcXVpcmUoJy4uLy4uL2xvZ2dpbmcnKS5nZXRMb2dnZXIoKTtcbiAgICAgICAgbG9nZ2VyLmluZm8oXG4gICAgICAgICAgJ251Y2xpZGUtYmxhbWU6IENvdWxkIG5vdCBvcGVuIGJsYW1lOiBubyBibGFtZSBwcm92aWRlciBjdXJyZW50bHkgYXZhaWxhYmxlIGZvciB0aGlzICcgK1xuICAgICAgICAgIGBmaWxlOiAke1N0cmluZyhlZGl0b3IuZ2V0UGF0aCgpKX1gXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgX2VkaXRvcldhc0Rlc3Ryb3llZChlZGl0b3I6IGF0b20kVGV4dEVkaXRvcik6IHZvaWQge1xuICAgIGNvbnN0IGJsYW1lR3V0dGVyID0gdGhpcy5fdGV4dEVkaXRvclRvQmxhbWVHdXR0ZXIuZ2V0KGVkaXRvcik7XG4gICAgaWYgKGJsYW1lR3V0dGVyKSB7XG4gICAgICBibGFtZUd1dHRlci5kZXN0cm95KCk7XG4gICAgICB0aGlzLl90ZXh0RWRpdG9yVG9CbGFtZUd1dHRlci5kZWxldGUoZWRpdG9yKTtcbiAgICB9XG4gICAgdGhpcy5fdGV4dEVkaXRvclRvRGVzdHJveVN1YnNjcmlwdGlvbi5kZWxldGUoZWRpdG9yKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWN0aW9uOiBNYW5hZ2luZyBDb250ZXh0IE1lbnVzXG4gICAqL1xuXG4gICBAdHJhY2tUaW1pbmcoJ2JsYW1lLnNob3dCbGFtZScpXG4gIF9zaG93QmxhbWUoZXZlbnQpOiB2b2lkIHtcbiAgICBjb25zdCBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk7XG4gICAgaWYgKGVkaXRvciAhPSBudWxsKSB7XG4gICAgICB0aGlzLl9zaG93QmxhbWVHdXR0ZXJGb3JFZGl0b3IoZWRpdG9yKTtcbiAgICB9XG4gIH1cblxuICBAdHJhY2tUaW1pbmcoJ2JsYW1lLmhpZGVCbGFtZScpXG4gIF9oaWRlQmxhbWUoZXZlbnQpOiB2b2lkIHtcbiAgICBjb25zdCBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk7XG4gICAgaWYgKGVkaXRvciAhPSBudWxsKSB7XG4gICAgICB0aGlzLl9yZW1vdmVCbGFtZUd1dHRlckZvckVkaXRvcihlZGl0b3IpO1xuICAgIH1cbiAgfVxuXG4gIF9jYW5TaG93QmxhbWUoKTogYm9vbGVhbiB7XG4gICAgY29uc3QgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICAgIHJldHVybiAhKGVkaXRvciAhPSBudWxsICYmIHRoaXMuX3RleHRFZGl0b3JUb0JsYW1lR3V0dGVyLmhhcyhlZGl0b3IpKTtcbiAgfVxuXG4gIF9jYW5IaWRlQmxhbWUoKTogYm9vbGVhbiB7XG4gICAgY29uc3QgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICAgIHJldHVybiBlZGl0b3IgIT0gbnVsbCAmJiB0aGlzLl90ZXh0RWRpdG9yVG9CbGFtZUd1dHRlci5oYXMoZWRpdG9yKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWN0aW9uOiBDb25zdW1pbmcgU2VydmljZXNcbiAgICovXG5cbiAgY29uc3VtZUJsYW1lR3V0dGVyQ2xhc3MoYmxhbWVHdXR0ZXJDbGFzczogQmxhbWVHdXR0ZXJDbGFzcyk6IGF0b20kRGlzcG9zYWJsZSB7XG4gICAgLy8gVGhpcyBwYWNrYWdlIG9ubHkgZXhwZWN0cyBvbmUgZ3V0dGVyIFVJLiBJdCB3aWxsIHRha2UgdGhlIGZpcnN0IG9uZS5cbiAgICBpZiAodGhpcy5fYmxhbWVHdXR0ZXJDbGFzcyA9PSBudWxsKSB7XG4gICAgICB0aGlzLl9ibGFtZUd1dHRlckNsYXNzID0gYmxhbWVHdXR0ZXJDbGFzcztcbiAgICAgIHJldHVybiBuZXcgRGlzcG9zYWJsZSgoKSA9PiB7XG4gICAgICAgIHRoaXMuX2JsYW1lR3V0dGVyQ2xhc3MgPSBudWxsO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBuZXcgRGlzcG9zYWJsZSgoKSA9PiB7fSk7XG4gICAgfVxuICB9XG5cbiAgY29uc3VtZUJsYW1lUHJvdmlkZXIocHJvdmlkZXI6IEJsYW1lUHJvdmlkZXIpOiBhdG9tJERpc3Bvc2FibGUge1xuICAgIHRoaXMuX3JlZ2lzdGVyZWRQcm92aWRlcnMuYWRkKHByb3ZpZGVyKTtcbiAgICByZXR1cm4gbmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgaWYgKHRoaXMuX3JlZ2lzdGVyZWRQcm92aWRlcnMpIHtcbiAgICAgICAgdGhpcy5fcmVnaXN0ZXJlZFByb3ZpZGVycy5kZWxldGUocHJvdmlkZXIpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59XG5cblxubGV0IGFjdGl2YXRpb246ID9BY3RpdmF0aW9uO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgYWN0aXZhdGUoc3RhdGU6ID9PYmplY3QpOiB2b2lkIHtcbiAgICBpZiAoIWFjdGl2YXRpb24pIHtcbiAgICAgIGFjdGl2YXRpb24gPSBuZXcgQWN0aXZhdGlvbigpO1xuICAgIH1cbiAgfSxcblxuICBkZWFjdGl2YXRlKCkge1xuICAgIGlmIChhY3RpdmF0aW9uKSB7XG4gICAgICBhY3RpdmF0aW9uLmRpc3Bvc2UoKTtcbiAgICAgIGFjdGl2YXRpb24gPSBudWxsO1xuICAgIH1cbiAgfSxcblxuICBjb25zdW1lQmxhbWVHdXR0ZXJDbGFzcyhibGFtZUd1dHRlcjogQmxhbWVHdXR0ZXJDbGFzcyk6IGF0b20kRGlzcG9zYWJsZSB7XG4gICAgaW52YXJpYW50KGFjdGl2YXRpb24pO1xuICAgIHJldHVybiBhY3RpdmF0aW9uLmNvbnN1bWVCbGFtZUd1dHRlckNsYXNzKGJsYW1lR3V0dGVyKTtcbiAgfSxcblxuICBjb25zdW1lQmxhbWVQcm92aWRlcihwcm92aWRlcjogQmxhbWVQcm92aWRlcik6IGF0b20kRGlzcG9zYWJsZSB7XG4gICAgaW52YXJpYW50KGFjdGl2YXRpb24pO1xuICAgIHJldHVybiBhY3RpdmF0aW9uLmNvbnN1bWVCbGFtZVByb3ZpZGVyKHByb3ZpZGVyKTtcbiAgfSxcbn07XG4iXX0=