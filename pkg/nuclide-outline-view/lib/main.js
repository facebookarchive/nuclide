Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.activate = activate;
exports.deactivate = deactivate;
exports.serialize = serialize;
exports.consumeOutlineProvider = consumeOutlineProvider;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _rx = require('rx');

var _atom = require('atom');

var _nuclideCommons = require('../../nuclide-commons');

var _nuclideLogging = require('../../nuclide-logging');

var _OutlineViewPanel = require('./OutlineViewPanel');

var _ProviderRegistry = require('./ProviderRegistry');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var observableFromSubscribeFunction = _nuclideCommons.event.observableFromSubscribeFunction;

var logger = (0, _nuclideLogging.getLogger)();

/**
 * Includes additional information that is useful to the UI, but redundant or nonsensical for
 * providers to include in their responses.
 */

var DEFAULT_WIDTH = 300; // px

function makeDefaultState() {
  return {
    width: DEFAULT_WIDTH,
    visible: false
  };
}

var Activation = (function () {
  function Activation() {
    var _this = this;

    var state = arguments.length <= 0 || arguments[0] === undefined ? makeDefaultState() : arguments[0];

    _classCallCheck(this, Activation);

    this._disposables = new _atom.CompositeDisposable();

    this._providers = new _ProviderRegistry.ProviderRegistry();

    var textEvent$ = _rx.Observable.create(function (observer) {
      var textEventDispatcher = require('../../nuclide-text-event-dispatcher').getInstance();
      return textEventDispatcher.onAnyFileChange(function (editor) {
        return observer.onNext(editor);
      });
    });

    var paneChange$ = observableFromSubscribeFunction(atom.workspace.observeActivePaneItem.bind(atom.workspace))
    // Delay the work on tab switch to keep tab switches snappy and avoid doing a bunch of
    // computation if there are a lot of consecutive tab switches.
    .debounce(200);

    // We are over-subscribing a little bit here, but since outlines are typically cheap and fast to
    // generate that's okay for now.
    var outlines = _rx.Observable.merge(textEvent$, paneChange$.map(function () {
      return atom.workspace.getActiveTextEditor();
    })).flatMap(_asyncToGenerator(function* (editor) {
      if (editor == null) {
        return {
          kind: 'not-text-editor'
        };
      } else {
        return _this._outlineForEditor(editor);
      }
    }));

    var panel = this._panel = new _OutlineViewPanel.OutlineViewPanelState(outlines, state.width, state.visible);
    this._disposables.add(panel);

    this._disposables.add(atom.commands.add('atom-workspace', 'nuclide-outline-view:toggle', panel.toggle.bind(panel)));
  }

  _createClass(Activation, [{
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
    }
  }, {
    key: 'serialize',
    value: function serialize() {
      return {
        visible: this._panel.isVisible(),
        width: this._panel.getWidth()
      };
    }
  }, {
    key: 'consumeOutlineProvider',
    value: function consumeOutlineProvider(provider) {
      var _this2 = this;

      this._providers.addProvider(provider);
      return new _atom.Disposable(function () {
        return _this2._providers.removeProvider(provider);
      });
    }
  }, {
    key: '_outlineForEditor',
    value: _asyncToGenerator(function* (editor) {
      var scopeName = editor.getGrammar().scopeName;
      var readableGrammarName = editor.getGrammar().name;

      var outlineProvider = this._providers.findProvider(scopeName);
      if (outlineProvider == null) {
        return {
          kind: 'no-provider',
          grammar: readableGrammarName
        };
      }
      var outline = undefined;
      try {
        outline = yield outlineProvider.getOutline(editor);
      } catch (e) {
        logger.error('Error in outline provider:', e);
        outline = null;
      }
      if (outline == null) {
        return {
          kind: 'provider-no-outline'
        };
      }
      return {
        kind: 'outline',
        outline: outline,
        editor: editor
      };
    })
  }]);

  return Activation;
})();

var activation = null;

function activate(state) {
  if (activation == null) {
    activation = new Activation(state);
  }
}

function deactivate() {
  if (activation != null) {
    activation.dispose();
    activation = null;
  }
}

function serialize() {
  if (activation != null) {
    return activation.serialize();
  }
}

function consumeOutlineProvider(provider) {
  (0, _assert2['default'])(activation != null);
  return activation.consumeOutlineProvider(provider);
}

// The initial state at startup.

// The thing that currently has focus is not a text editor.

// Indicates that no provider is registered for the given grammar.

// Human-readable name for the grammar.

// Indicates that a provider is registered but that it did not return an outline.

/**
 * Use a TextEditor instead of a path so that:
 * - If there are multiple editors for a file, we always jump to outline item
 *   locations in the correct editor.
 * - Jumping to outline item locations works for new, unsaved files.
 */

// If there are multiple providers for a given grammar, the one with the highest priority will be
// used.
//# sourceMappingURL=data:application/json;base64,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Q0Y7O0FBRU0sU0FBUyxVQUFVLEdBQUc7QUFDM0IsTUFBSSxVQUFVLElBQUksSUFBSSxFQUFFO0FBQ3RCLGNBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNyQixjQUFVLEdBQUcsSUFBSSxDQUFDO0dBQ25CO0NBQ0Y7O0FBRU0sU0FBUyxTQUFTLEdBQXNCO0FBQzdDLE1BQUksVUFBVSxJQUFJLElBQUksRUFBRTtBQUN0QixXQUFPLFVBQVUsQ0FBQyxTQUFTLEVBQUUsQ0FBQztHQUMvQjtDQUNGOztBQUVNLFNBQVMsc0JBQXNCLENBQUMsUUFBeUIsRUFBZTtBQUM3RSwyQkFBVSxVQUFVLElBQUksSUFBSSxDQUFDLENBQUM7QUFDOUIsU0FBTyxVQUFVLENBQUMsc0JBQXNCLENBQUMsUUFBUSxDQUFDLENBQUM7Q0FDcEQiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB7T2JzZXJ2YWJsZX0gZnJvbSAncngnO1xuXG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGUsIERpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuXG5pbXBvcnQge2V2ZW50IGFzIGNvbW1vbnNFdmVudH0gZnJvbSAnLi4vLi4vbnVjbGlkZS1jb21tb25zJztcbmNvbnN0IHtvYnNlcnZhYmxlRnJvbVN1YnNjcmliZUZ1bmN0aW9ufSA9IGNvbW1vbnNFdmVudDtcblxuaW1wb3J0IHtnZXRMb2dnZXJ9IGZyb20gJy4uLy4uL251Y2xpZGUtbG9nZ2luZyc7XG5jb25zdCBsb2dnZXIgPSBnZXRMb2dnZXIoKTtcblxuaW1wb3J0IHtPdXRsaW5lVmlld1BhbmVsU3RhdGV9IGZyb20gJy4vT3V0bGluZVZpZXdQYW5lbCc7XG5pbXBvcnQge1Byb3ZpZGVyUmVnaXN0cnl9IGZyb20gJy4vUHJvdmlkZXJSZWdpc3RyeSc7XG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcblxuZXhwb3J0IHR5cGUgT3V0bGluZVRyZWUgPSB7XG4gIGRpc3BsYXlUZXh0OiBzdHJpbmc7XG4gIHN0YXJ0UG9zaXRpb246IGF0b20kUG9pbnQ7XG4gIGNoaWxkcmVuOiBBcnJheTxPdXRsaW5lVHJlZT47XG59O1xuXG5leHBvcnQgdHlwZSBPdXRsaW5lID0ge1xuICBvdXRsaW5lVHJlZXM6IEFycmF5PE91dGxpbmVUcmVlPjtcbn1cblxuLyoqXG4gKiBJbmNsdWRlcyBhZGRpdGlvbmFsIGluZm9ybWF0aW9uIHRoYXQgaXMgdXNlZnVsIHRvIHRoZSBVSSwgYnV0IHJlZHVuZGFudCBvciBub25zZW5zaWNhbCBmb3JcbiAqIHByb3ZpZGVycyB0byBpbmNsdWRlIGluIHRoZWlyIHJlc3BvbnNlcy5cbiAqL1xuZXhwb3J0IHR5cGUgT3V0bGluZUZvclVpID0ge1xuICAvLyBUaGUgaW5pdGlhbCBzdGF0ZSBhdCBzdGFydHVwLlxuICBraW5kOiAnZW1wdHknO1xufSB8IHtcbiAgLy8gVGhlIHRoaW5nIHRoYXQgY3VycmVudGx5IGhhcyBmb2N1cyBpcyBub3QgYSB0ZXh0IGVkaXRvci5cbiAga2luZDogJ25vdC10ZXh0LWVkaXRvcic7XG59IHwge1xuICAvLyBJbmRpY2F0ZXMgdGhhdCBubyBwcm92aWRlciBpcyByZWdpc3RlcmVkIGZvciB0aGUgZ2l2ZW4gZ3JhbW1hci5cbiAga2luZDogJ25vLXByb3ZpZGVyJztcbiAgLy8gSHVtYW4tcmVhZGFibGUgbmFtZSBmb3IgdGhlIGdyYW1tYXIuXG4gIGdyYW1tYXI6IHN0cmluZztcbn0gfCB7XG4gIC8vIEluZGljYXRlcyB0aGF0IGEgcHJvdmlkZXIgaXMgcmVnaXN0ZXJlZCBidXQgdGhhdCBpdCBkaWQgbm90IHJldHVybiBhbiBvdXRsaW5lLlxuICBraW5kOiAncHJvdmlkZXItbm8tb3V0bGluZSc7XG59IHwge1xuICBraW5kOiAnb3V0bGluZSc7XG4gIG91dGxpbmU6IE91dGxpbmU7XG4gIC8qKlxuICAgKiBVc2UgYSBUZXh0RWRpdG9yIGluc3RlYWQgb2YgYSBwYXRoIHNvIHRoYXQ6XG4gICAqIC0gSWYgdGhlcmUgYXJlIG11bHRpcGxlIGVkaXRvcnMgZm9yIGEgZmlsZSwgd2UgYWx3YXlzIGp1bXAgdG8gb3V0bGluZSBpdGVtXG4gICAqICAgbG9jYXRpb25zIGluIHRoZSBjb3JyZWN0IGVkaXRvci5cbiAgICogLSBKdW1waW5nIHRvIG91dGxpbmUgaXRlbSBsb2NhdGlvbnMgd29ya3MgZm9yIG5ldywgdW5zYXZlZCBmaWxlcy5cbiAgICovXG4gIGVkaXRvcjogYXRvbSRUZXh0RWRpdG9yO1xufVxuXG5leHBvcnQgdHlwZSBPdXRsaW5lUHJvdmlkZXIgPSB7XG4gIG5hbWU6IHN0cmluZztcbiAgLy8gSWYgdGhlcmUgYXJlIG11bHRpcGxlIHByb3ZpZGVycyBmb3IgYSBnaXZlbiBncmFtbWFyLCB0aGUgb25lIHdpdGggdGhlIGhpZ2hlc3QgcHJpb3JpdHkgd2lsbCBiZVxuICAvLyB1c2VkLlxuICBwcmlvcml0eTogbnVtYmVyO1xuICBncmFtbWFyU2NvcGVzOiBBcnJheTxzdHJpbmc+O1xuICBnZXRPdXRsaW5lOiAoZWRpdG9yOiBUZXh0RWRpdG9yKSA9PiBQcm9taXNlPD9PdXRsaW5lPjtcbn07XG5cbnR5cGUgT3V0bGluZVZpZXdTdGF0ZSA9IHtcbiAgd2lkdGg6IG51bWJlcjtcbiAgdmlzaWJsZTogYm9vbGVhbjtcbn07XG5cbmNvbnN0IERFRkFVTFRfV0lEVEggPSAzMDA7IC8vIHB4XG5cbmZ1bmN0aW9uIG1ha2VEZWZhdWx0U3RhdGUoKTogT3V0bGluZVZpZXdTdGF0ZSB7XG4gIHJldHVybiB7XG4gICAgd2lkdGg6IERFRkFVTFRfV0lEVEgsXG4gICAgdmlzaWJsZTogZmFsc2UsXG4gIH07XG59XG5cbmNsYXNzIEFjdGl2YXRpb24ge1xuICBfZGlzcG9zYWJsZXM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG5cbiAgX3Byb3ZpZGVyczogUHJvdmlkZXJSZWdpc3RyeTxPdXRsaW5lUHJvdmlkZXI+O1xuXG4gIF9wYW5lbDogT3V0bGluZVZpZXdQYW5lbFN0YXRlO1xuXG4gIGNvbnN0cnVjdG9yKHN0YXRlPzogT3V0bGluZVZpZXdTdGF0ZSA9IG1ha2VEZWZhdWx0U3RhdGUoKSkge1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcblxuICAgIHRoaXMuX3Byb3ZpZGVycyA9IG5ldyBQcm92aWRlclJlZ2lzdHJ5KCk7XG5cbiAgICBjb25zdCB0ZXh0RXZlbnQkID0gT2JzZXJ2YWJsZS5jcmVhdGUob2JzZXJ2ZXIgPT4ge1xuICAgICAgY29uc3QgdGV4dEV2ZW50RGlzcGF0Y2hlciA9XG4gICAgICAgIHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtdGV4dC1ldmVudC1kaXNwYXRjaGVyJykuZ2V0SW5zdGFuY2UoKTtcbiAgICAgIHJldHVybiB0ZXh0RXZlbnREaXNwYXRjaGVyLm9uQW55RmlsZUNoYW5nZShlZGl0b3IgPT4gb2JzZXJ2ZXIub25OZXh0KGVkaXRvcikpO1xuICAgIH0pO1xuXG4gICAgY29uc3QgcGFuZUNoYW5nZSQgPSBvYnNlcnZhYmxlRnJvbVN1YnNjcmliZUZ1bmN0aW9uKFxuICAgICAgICBhdG9tLndvcmtzcGFjZS5vYnNlcnZlQWN0aXZlUGFuZUl0ZW0uYmluZChhdG9tLndvcmtzcGFjZSksXG4gICAgICApXG4gICAgICAvLyBEZWxheSB0aGUgd29yayBvbiB0YWIgc3dpdGNoIHRvIGtlZXAgdGFiIHN3aXRjaGVzIHNuYXBweSBhbmQgYXZvaWQgZG9pbmcgYSBidW5jaCBvZlxuICAgICAgLy8gY29tcHV0YXRpb24gaWYgdGhlcmUgYXJlIGEgbG90IG9mIGNvbnNlY3V0aXZlIHRhYiBzd2l0Y2hlcy5cbiAgICAgIC5kZWJvdW5jZSgyMDApO1xuXG4gICAgLy8gV2UgYXJlIG92ZXItc3Vic2NyaWJpbmcgYSBsaXR0bGUgYml0IGhlcmUsIGJ1dCBzaW5jZSBvdXRsaW5lcyBhcmUgdHlwaWNhbGx5IGNoZWFwIGFuZCBmYXN0IHRvXG4gICAgLy8gZ2VuZXJhdGUgdGhhdCdzIG9rYXkgZm9yIG5vdy5cbiAgICBjb25zdCBvdXRsaW5lczogT2JzZXJ2YWJsZTxPdXRsaW5lRm9yVWk+ID0gT2JzZXJ2YWJsZS5tZXJnZShcbiAgICAgICAgdGV4dEV2ZW50JCxcbiAgICAgICAgcGFuZUNoYW5nZSRcbiAgICAgICAgICAubWFwKCgpID0+IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKSksXG4gICAgICApXG4gICAgICAuZmxhdE1hcChhc3luYyBlZGl0b3IgPT4ge1xuICAgICAgICBpZiAoZWRpdG9yID09IG51bGwpIHtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAga2luZDogJ25vdC10ZXh0LWVkaXRvcicsXG4gICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5fb3V0bGluZUZvckVkaXRvcihlZGl0b3IpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgIGNvbnN0IHBhbmVsID0gdGhpcy5fcGFuZWwgPSBuZXcgT3V0bGluZVZpZXdQYW5lbFN0YXRlKG91dGxpbmVzLCBzdGF0ZS53aWR0aCwgc3RhdGUudmlzaWJsZSk7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKHBhbmVsKTtcblxuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZChcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKFxuICAgICAgICAnYXRvbS13b3Jrc3BhY2UnLFxuICAgICAgICAnbnVjbGlkZS1vdXRsaW5lLXZpZXc6dG9nZ2xlJyxcbiAgICAgICAgcGFuZWwudG9nZ2xlLmJpbmQocGFuZWwpLFxuICAgICAgKVxuICAgICk7XG4gIH1cblxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIHNlcmlhbGl6ZSgpOiBPdXRsaW5lVmlld1N0YXRlIHtcbiAgICByZXR1cm4ge1xuICAgICAgdmlzaWJsZTogdGhpcy5fcGFuZWwuaXNWaXNpYmxlKCksXG4gICAgICB3aWR0aDogdGhpcy5fcGFuZWwuZ2V0V2lkdGgoKSxcbiAgICB9O1xuICB9XG5cbiAgY29uc3VtZU91dGxpbmVQcm92aWRlcihwcm92aWRlcjogT3V0bGluZVByb3ZpZGVyKTogSURpc3Bvc2FibGUge1xuICAgIHRoaXMuX3Byb3ZpZGVycy5hZGRQcm92aWRlcihwcm92aWRlcik7XG4gICAgcmV0dXJuIG5ldyBEaXNwb3NhYmxlKCgpID0+IHRoaXMuX3Byb3ZpZGVycy5yZW1vdmVQcm92aWRlcihwcm92aWRlcikpO1xuICB9XG5cbiAgYXN5bmMgX291dGxpbmVGb3JFZGl0b3IoZWRpdG9yOiBhdG9tJFRleHRFZGl0b3IpOiBQcm9taXNlPE91dGxpbmVGb3JVaT4ge1xuICAgIGNvbnN0IHNjb3BlTmFtZSA9IGVkaXRvci5nZXRHcmFtbWFyKCkuc2NvcGVOYW1lO1xuICAgIGNvbnN0IHJlYWRhYmxlR3JhbW1hck5hbWUgPSBlZGl0b3IuZ2V0R3JhbW1hcigpLm5hbWU7XG5cbiAgICBjb25zdCBvdXRsaW5lUHJvdmlkZXIgPSB0aGlzLl9wcm92aWRlcnMuZmluZFByb3ZpZGVyKHNjb3BlTmFtZSk7XG4gICAgaWYgKG91dGxpbmVQcm92aWRlciA9PSBudWxsKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBraW5kOiAnbm8tcHJvdmlkZXInLFxuICAgICAgICBncmFtbWFyOiByZWFkYWJsZUdyYW1tYXJOYW1lLFxuICAgICAgfTtcbiAgICB9XG4gICAgbGV0IG91dGxpbmU6ID9PdXRsaW5lO1xuICAgIHRyeSB7XG4gICAgICBvdXRsaW5lID0gYXdhaXQgb3V0bGluZVByb3ZpZGVyLmdldE91dGxpbmUoZWRpdG9yKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBsb2dnZXIuZXJyb3IoJ0Vycm9yIGluIG91dGxpbmUgcHJvdmlkZXI6JywgZSk7XG4gICAgICBvdXRsaW5lID0gbnVsbDtcbiAgICB9XG4gICAgaWYgKG91dGxpbmUgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAga2luZDogJ3Byb3ZpZGVyLW5vLW91dGxpbmUnLFxuICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIGtpbmQ6ICdvdXRsaW5lJyxcbiAgICAgIG91dGxpbmUsXG4gICAgICBlZGl0b3IsXG4gICAgfTtcbiAgfVxufVxuXG5sZXQgYWN0aXZhdGlvbjogP0FjdGl2YXRpb24gPSBudWxsO1xuXG5leHBvcnQgZnVuY3Rpb24gYWN0aXZhdGUoc3RhdGU6IE9iamVjdCB8IHZvaWQpIHtcbiAgaWYgKGFjdGl2YXRpb24gPT0gbnVsbCkge1xuICAgIGFjdGl2YXRpb24gPSBuZXcgQWN0aXZhdGlvbihzdGF0ZSk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlYWN0aXZhdGUoKSB7XG4gIGlmIChhY3RpdmF0aW9uICE9IG51bGwpIHtcbiAgICBhY3RpdmF0aW9uLmRpc3Bvc2UoKTtcbiAgICBhY3RpdmF0aW9uID0gbnVsbDtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2VyaWFsaXplKCk6ID9PdXRsaW5lVmlld1N0YXRlIHtcbiAgaWYgKGFjdGl2YXRpb24gIT0gbnVsbCkge1xuICAgIHJldHVybiBhY3RpdmF0aW9uLnNlcmlhbGl6ZSgpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb25zdW1lT3V0bGluZVByb3ZpZGVyKHByb3ZpZGVyOiBPdXRsaW5lUHJvdmlkZXIpOiBJRGlzcG9zYWJsZSB7XG4gIGludmFyaWFudChhY3RpdmF0aW9uICE9IG51bGwpO1xuICByZXR1cm4gYWN0aXZhdGlvbi5jb25zdW1lT3V0bGluZVByb3ZpZGVyKHByb3ZpZGVyKTtcbn1cbiJdfQ==