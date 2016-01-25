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
        label: 'Show Blame',
        command: 'nuclide-blame:show-blame',
        shouldDisplay: function shouldDisplay(event) {
          return _this._canShowBlame();
        }
      }]
    }));
    this._packageDisposables.add(atom.contextMenu.add({
      'atom-text-editor': [{
        label: 'Hide Blame',
        command: 'nuclide-blame:hide-blame',
        shouldDisplay: function shouldDisplay(event) {
          return _this._canHideBlame();
        }
      }]
    }));
    this._packageDisposables.add(atom.commands.add('atom-text-editor', 'nuclide-blame:show-blame', function () {
      return _this._showBlame();
    }));
    this._packageDisposables.add(atom.commands.add('atom-text-editor', 'nuclide-blame:hide-blame', function () {
      return _this._hideBlame();
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
//# sourceMappingURL=data:application/json;base64,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LENBQUM7S0FDbkI7R0FDRjs7QUFFRCx5QkFBdUIsRUFBQSxpQ0FBQyxXQUE2QixFQUFtQjtBQUN0RSw2QkFBVSxVQUFVLENBQUMsQ0FBQztBQUN0QixXQUFPLFVBQVUsQ0FBQyx1QkFBdUIsQ0FBQyxXQUFXLENBQUMsQ0FBQztHQUN4RDs7QUFFRCxzQkFBb0IsRUFBQSw4QkFBQyxRQUF1QixFQUFtQjtBQUM3RCw2QkFBVSxVQUFVLENBQUMsQ0FBQztBQUN0QixXQUFPLFVBQVUsQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztHQUNsRDtDQUNGLENBQUMiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtCbGFtZVByb3ZpZGVyfSBmcm9tICcuLi8uLi9ibGFtZS1iYXNlJztcblxuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlLCBEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCB7dHJhY2tUaW1pbmd9IGZyb20gJy4uLy4uL2FuYWx5dGljcyc7XG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5cbmNvbnN0IFBBQ0tBR0VTX01JU1NJTkdfTUVTU0FHRSA9XG5gQ291bGQgbm90IG9wZW4gYmxhbWU6IHRoZSBudWNsaWRlLWJsYW1lIHBhY2thZ2UgbmVlZHMgb3RoZXIgQXRvbSBwYWNrYWdlcyB0byBwcm92aWRlOlxuICAtIGEgZ3V0dGVyIFVJIGNsYXNzXG4gIC0gYXQgbGVhc3Qgb25lIGJsYW1lIHByb3ZpZGVyXG5cbllvdSBhcmUgbWlzc2luZyBvbmUgb2YgdGhlc2UuYDtcblxudHlwZSBCbGFtZUd1dHRlciA9IHtcbiAgZGVzdHJveTogKCkgPT4gdm9pZDtcbn07XG5cbnR5cGUgQmxhbWVHdXR0ZXJDbGFzcyA9ICgpID0+IEJsYW1lR3V0dGVyO1xuXG5jbGFzcyBBY3RpdmF0aW9uIHtcbiAgX3BhY2thZ2VEaXNwb3NhYmxlczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX3JlZ2lzdGVyZWRQcm92aWRlcnM6IFNldDxCbGFtZVByb3ZpZGVyPjtcbiAgX2JsYW1lR3V0dGVyQ2xhc3M6ID9CbGFtZUd1dHRlckNsYXNzO1xuICAvLyBNYXAgb2YgYSBUZXh0RWRpdG9yIHRvIGl0cyBCbGFtZUd1dHRlciwgaWYgaXQgZXhpc3RzLlxuICBfdGV4dEVkaXRvclRvQmxhbWVHdXR0ZXI6IE1hcDxhdG9tJFRleHRFZGl0b3IsIEJsYW1lR3V0dGVyPjtcbiAgLy8gTWFwIG9mIGEgVGV4dEVkaXRvciB0byB0aGUgc3Vic2NyaXB0aW9uIG9uIGl0cyA6Om9uRGlkRGVzdHJveS5cbiAgX3RleHRFZGl0b3JUb0Rlc3Ryb3lTdWJzY3JpcHRpb246IE1hcDxhdG9tJFRleHRFZGl0b3IsIGF0b20kRGlzcG9zYWJsZT47XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fcmVnaXN0ZXJlZFByb3ZpZGVycyA9IG5ldyBTZXQoKTtcbiAgICB0aGlzLl90ZXh0RWRpdG9yVG9CbGFtZUd1dHRlciA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLl90ZXh0RWRpdG9yVG9EZXN0cm95U3Vic2NyaXB0aW9uID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuX3BhY2thZ2VEaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgdGhpcy5fcGFja2FnZURpc3Bvc2FibGVzLmFkZChhdG9tLmNvbnRleHRNZW51LmFkZCh7XG4gICAgICAnYXRvbS10ZXh0LWVkaXRvcic6IFt7XG4gICAgICAgIGxhYmVsOiAnU2hvdyBCbGFtZScsXG4gICAgICAgIGNvbW1hbmQ6ICdudWNsaWRlLWJsYW1lOnNob3ctYmxhbWUnLFxuICAgICAgICBzaG91bGREaXNwbGF5OiAoZXZlbnQ6IE1vdXNlRXZlbnQpID0+IHRoaXMuX2NhblNob3dCbGFtZSgpLFxuICAgICAgfV0sXG4gICAgfSkpO1xuICAgIHRoaXMuX3BhY2thZ2VEaXNwb3NhYmxlcy5hZGQoYXRvbS5jb250ZXh0TWVudS5hZGQoe1xuICAgICAgJ2F0b20tdGV4dC1lZGl0b3InOiBbe1xuICAgICAgICBsYWJlbDogJ0hpZGUgQmxhbWUnLFxuICAgICAgICBjb21tYW5kOiAnbnVjbGlkZS1ibGFtZTpoaWRlLWJsYW1lJyxcbiAgICAgICAgc2hvdWxkRGlzcGxheTogKGV2ZW50OiBNb3VzZUV2ZW50KSA9PiB0aGlzLl9jYW5IaWRlQmxhbWUoKSxcbiAgICAgIH1dLFxuICAgIH0pKTtcbiAgICB0aGlzLl9wYWNrYWdlRGlzcG9zYWJsZXMuYWRkKFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20tdGV4dC1lZGl0b3InLCAnbnVjbGlkZS1ibGFtZTpzaG93LWJsYW1lJywgKCkgPT4gdGhpcy5fc2hvd0JsYW1lKCkpXG4gICAgKTtcbiAgICB0aGlzLl9wYWNrYWdlRGlzcG9zYWJsZXMuYWRkKFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20tdGV4dC1lZGl0b3InLCAnbnVjbGlkZS1ibGFtZTpoaWRlLWJsYW1lJywgKCkgPT4gdGhpcy5faGlkZUJsYW1lKCkpXG4gICAgKTtcbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5fcGFja2FnZURpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgICB0aGlzLl9yZWdpc3RlcmVkUHJvdmlkZXJzLmNsZWFyKCk7XG4gICAgdGhpcy5fdGV4dEVkaXRvclRvQmxhbWVHdXR0ZXIuY2xlYXIoKTtcbiAgICBmb3IgKGNvbnN0IGRpc3Bvc2FibGUgb2YgdGhpcy5fdGV4dEVkaXRvclRvRGVzdHJveVN1YnNjcmlwdGlvbi52YWx1ZXMoKSkge1xuICAgICAgZGlzcG9zYWJsZS5kaXNwb3NlKCk7XG4gICAgfVxuICAgIHRoaXMuX3RleHRFZGl0b3JUb0Rlc3Ryb3lTdWJzY3JpcHRpb24uY2xlYXIoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWN0aW9uOiBNYW5hZ2luZyBHdXR0ZXJzXG4gICAqL1xuXG4gIF9yZW1vdmVCbGFtZUd1dHRlckZvckVkaXRvcihlZGl0b3I6IGF0b20kVGV4dEVkaXRvcik6IHZvaWQge1xuICAgIGNvbnN0IGJsYW1lR3V0dGVyID0gdGhpcy5fdGV4dEVkaXRvclRvQmxhbWVHdXR0ZXIuZ2V0KGVkaXRvcik7XG4gICAgaWYgKGJsYW1lR3V0dGVyICE9IG51bGwpIHtcbiAgICAgIGJsYW1lR3V0dGVyLmRlc3Ryb3koKTtcbiAgICAgIHRoaXMuX3RleHRFZGl0b3JUb0JsYW1lR3V0dGVyLmRlbGV0ZShlZGl0b3IpO1xuICAgIH1cbiAgfVxuXG4gIF9zaG93QmxhbWVHdXR0ZXJGb3JFZGl0b3IoZWRpdG9yOiBhdG9tJFRleHRFZGl0b3IpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fYmxhbWVHdXR0ZXJDbGFzcyA9PSBudWxsIHx8IHRoaXMuX3JlZ2lzdGVyZWRQcm92aWRlcnMuc2l6ZSA9PT0gMCkge1xuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oUEFDS0FHRVNfTUlTU0lOR19NRVNTQUdFKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgYmxhbWVHdXR0ZXIgPSB0aGlzLl90ZXh0RWRpdG9yVG9CbGFtZUd1dHRlci5nZXQoZWRpdG9yKTtcbiAgICBpZiAoIWJsYW1lR3V0dGVyKSB7XG4gICAgICBsZXQgcHJvdmlkZXJGb3JFZGl0b3IgPSBudWxsO1xuICAgICAgZm9yIChjb25zdCBibGFtZVByb3ZpZGVyIG9mIHRoaXMuX3JlZ2lzdGVyZWRQcm92aWRlcnMpIHtcbiAgICAgICAgaWYgKGJsYW1lUHJvdmlkZXIuY2FuUHJvdmlkZUJsYW1lRm9yRWRpdG9yKGVkaXRvcikpIHtcbiAgICAgICAgICBwcm92aWRlckZvckVkaXRvciA9IGJsYW1lUHJvdmlkZXI7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHByb3ZpZGVyRm9yRWRpdG9yKSB7XG4gICAgICAgIGNvbnN0IGJsYW1lR3V0dGVyQ2xhc3MgPSB0aGlzLl9ibGFtZUd1dHRlckNsYXNzO1xuICAgICAgICBpbnZhcmlhbnQoYmxhbWVHdXR0ZXJDbGFzcyk7XG4gICAgICAgIGJsYW1lR3V0dGVyID0gbmV3IGJsYW1lR3V0dGVyQ2xhc3MoJ251Y2xpZGUtYmxhbWUnLCBlZGl0b3IsIHByb3ZpZGVyRm9yRWRpdG9yKTtcbiAgICAgICAgdGhpcy5fdGV4dEVkaXRvclRvQmxhbWVHdXR0ZXIuc2V0KGVkaXRvciwgYmxhbWVHdXR0ZXIpO1xuICAgICAgICBjb25zdCBkZXN0cm95U3Vic2NyaXB0aW9uID0gZWRpdG9yLm9uRGlkRGVzdHJveSgoKSA9PiB0aGlzLl9lZGl0b3JXYXNEZXN0cm95ZWQoZWRpdG9yKSk7XG4gICAgICAgIHRoaXMuX3RleHRFZGl0b3JUb0Rlc3Ryb3lTdWJzY3JpcHRpb24uc2V0KGVkaXRvciwgZGVzdHJveVN1YnNjcmlwdGlvbik7XG4gICAgICAgIGNvbnN0IHt0cmFja30gPSByZXF1aXJlKCcuLi8uLi9hbmFseXRpY3MnKTtcbiAgICAgICAgdHJhY2soJ2JsYW1lLW9wZW4nLCB7XG4gICAgICAgICAgZWRpdG9yUGF0aDogZWRpdG9yLmdldFBhdGgoKSB8fCAnJyxcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbyhcbiAgICAgICAgICAnQ291bGQgbm90IG9wZW4gYmxhbWU6IG5vIGJsYW1lIGluZm9ybWF0aW9uIGN1cnJlbnRseSBhdmFpbGFibGUgZm9yIHRoaXMgZmlsZS4nXG4gICAgICAgICk7XG4gICAgICAgIGNvbnN0IGxvZ2dlciA9IHJlcXVpcmUoJy4uLy4uL2xvZ2dpbmcnKS5nZXRMb2dnZXIoKTtcbiAgICAgICAgbG9nZ2VyLmluZm8oXG4gICAgICAgICAgJ251Y2xpZGUtYmxhbWU6IENvdWxkIG5vdCBvcGVuIGJsYW1lOiBubyBibGFtZSBwcm92aWRlciBjdXJyZW50bHkgYXZhaWxhYmxlIGZvciB0aGlzICcgK1xuICAgICAgICAgIGBmaWxlOiAke1N0cmluZyhlZGl0b3IuZ2V0UGF0aCgpKX1gXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgX2VkaXRvcldhc0Rlc3Ryb3llZChlZGl0b3I6IGF0b20kVGV4dEVkaXRvcik6IHZvaWQge1xuICAgIGNvbnN0IGJsYW1lR3V0dGVyID0gdGhpcy5fdGV4dEVkaXRvclRvQmxhbWVHdXR0ZXIuZ2V0KGVkaXRvcik7XG4gICAgaWYgKGJsYW1lR3V0dGVyKSB7XG4gICAgICBibGFtZUd1dHRlci5kZXN0cm95KCk7XG4gICAgICB0aGlzLl90ZXh0RWRpdG9yVG9CbGFtZUd1dHRlci5kZWxldGUoZWRpdG9yKTtcbiAgICB9XG4gICAgdGhpcy5fdGV4dEVkaXRvclRvRGVzdHJveVN1YnNjcmlwdGlvbi5kZWxldGUoZWRpdG9yKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWN0aW9uOiBNYW5hZ2luZyBDb250ZXh0IE1lbnVzXG4gICAqL1xuXG4gICBAdHJhY2tUaW1pbmcoJ2JsYW1lLnNob3dCbGFtZScpXG4gIF9zaG93QmxhbWUoZXZlbnQpOiB2b2lkIHtcbiAgICBjb25zdCBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk7XG4gICAgaWYgKGVkaXRvciAhPSBudWxsKSB7XG4gICAgICB0aGlzLl9zaG93QmxhbWVHdXR0ZXJGb3JFZGl0b3IoZWRpdG9yKTtcbiAgICB9XG4gIH1cblxuICBAdHJhY2tUaW1pbmcoJ2JsYW1lLmhpZGVCbGFtZScpXG4gIF9oaWRlQmxhbWUoZXZlbnQpOiB2b2lkIHtcbiAgICBjb25zdCBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk7XG4gICAgaWYgKGVkaXRvciAhPSBudWxsKSB7XG4gICAgICB0aGlzLl9yZW1vdmVCbGFtZUd1dHRlckZvckVkaXRvcihlZGl0b3IpO1xuICAgIH1cbiAgfVxuXG4gIF9jYW5TaG93QmxhbWUoKTogYm9vbGVhbiB7XG4gICAgY29uc3QgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICAgIHJldHVybiAhKGVkaXRvciAhPSBudWxsICYmIHRoaXMuX3RleHRFZGl0b3JUb0JsYW1lR3V0dGVyLmhhcyhlZGl0b3IpKTtcbiAgfVxuXG4gIF9jYW5IaWRlQmxhbWUoKTogYm9vbGVhbiB7XG4gICAgY29uc3QgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICAgIHJldHVybiBlZGl0b3IgIT0gbnVsbCAmJiB0aGlzLl90ZXh0RWRpdG9yVG9CbGFtZUd1dHRlci5oYXMoZWRpdG9yKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWN0aW9uOiBDb25zdW1pbmcgU2VydmljZXNcbiAgICovXG5cbiAgY29uc3VtZUJsYW1lR3V0dGVyQ2xhc3MoYmxhbWVHdXR0ZXJDbGFzczogQmxhbWVHdXR0ZXJDbGFzcyk6IGF0b20kRGlzcG9zYWJsZSB7XG4gICAgLy8gVGhpcyBwYWNrYWdlIG9ubHkgZXhwZWN0cyBvbmUgZ3V0dGVyIFVJLiBJdCB3aWxsIHRha2UgdGhlIGZpcnN0IG9uZS5cbiAgICBpZiAodGhpcy5fYmxhbWVHdXR0ZXJDbGFzcyA9PSBudWxsKSB7XG4gICAgICB0aGlzLl9ibGFtZUd1dHRlckNsYXNzID0gYmxhbWVHdXR0ZXJDbGFzcztcbiAgICAgIHJldHVybiBuZXcgRGlzcG9zYWJsZSgoKSA9PiB7XG4gICAgICAgIHRoaXMuX2JsYW1lR3V0dGVyQ2xhc3MgPSBudWxsO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBuZXcgRGlzcG9zYWJsZSgoKSA9PiB7fSk7XG4gICAgfVxuICB9XG5cbiAgY29uc3VtZUJsYW1lUHJvdmlkZXIocHJvdmlkZXI6IEJsYW1lUHJvdmlkZXIpOiBhdG9tJERpc3Bvc2FibGUge1xuICAgIHRoaXMuX3JlZ2lzdGVyZWRQcm92aWRlcnMuYWRkKHByb3ZpZGVyKTtcbiAgICByZXR1cm4gbmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgaWYgKHRoaXMuX3JlZ2lzdGVyZWRQcm92aWRlcnMpIHtcbiAgICAgICAgdGhpcy5fcmVnaXN0ZXJlZFByb3ZpZGVycy5kZWxldGUocHJvdmlkZXIpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59XG5cblxubGV0IGFjdGl2YXRpb246ID9BY3RpdmF0aW9uO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgYWN0aXZhdGUoc3RhdGU6ID9PYmplY3QpOiB2b2lkIHtcbiAgICBpZiAoIWFjdGl2YXRpb24pIHtcbiAgICAgIGFjdGl2YXRpb24gPSBuZXcgQWN0aXZhdGlvbigpO1xuICAgIH1cbiAgfSxcblxuICBkZWFjdGl2YXRlKCkge1xuICAgIGlmIChhY3RpdmF0aW9uKSB7XG4gICAgICBhY3RpdmF0aW9uLmRpc3Bvc2UoKTtcbiAgICAgIGFjdGl2YXRpb24gPSBudWxsO1xuICAgIH1cbiAgfSxcblxuICBjb25zdW1lQmxhbWVHdXR0ZXJDbGFzcyhibGFtZUd1dHRlcjogQmxhbWVHdXR0ZXJDbGFzcyk6IGF0b20kRGlzcG9zYWJsZSB7XG4gICAgaW52YXJpYW50KGFjdGl2YXRpb24pO1xuICAgIHJldHVybiBhY3RpdmF0aW9uLmNvbnN1bWVCbGFtZUd1dHRlckNsYXNzKGJsYW1lR3V0dGVyKTtcbiAgfSxcblxuICBjb25zdW1lQmxhbWVQcm92aWRlcihwcm92aWRlcjogQmxhbWVQcm92aWRlcik6IGF0b20kRGlzcG9zYWJsZSB7XG4gICAgaW52YXJpYW50KGFjdGl2YXRpb24pO1xuICAgIHJldHVybiBhY3RpdmF0aW9uLmNvbnN1bWVCbGFtZVByb3ZpZGVyKHByb3ZpZGVyKTtcbiAgfSxcbn07XG4iXX0=