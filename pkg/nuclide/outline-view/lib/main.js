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

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.activate = activate;
exports.deactivate = deactivate;
exports.consumeGadgetsService = consumeGadgetsService;
exports.consumeOutlineProvider = consumeOutlineProvider;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _rx = require('rx');

var _atom = require('atom');

var _commons = require('../../commons');

var _OutlineView = require('./OutlineView');

var _ProviderRegistry = require('./ProviderRegistry');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var observableFromSubscribeFunction = _commons.event.observableFromSubscribeFunction;

/**
 * Includes additional information that is useful to the UI, but redundant for
 * providers to include in their responses.
 */

var Activation = (function () {
  function Activation(state) {
    var _this = this;

    _classCallCheck(this, Activation);

    this._disposables = new _atom.CompositeDisposable();

    this._providers = new _ProviderRegistry.ProviderRegistry();

    var textEvent$ = _rx.Observable.create(function (observer) {
      var textEventDispatcher = require('../../text-event-dispatcher').getInstance();
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
    this._outline$ = _rx.Observable.merge(textEvent$, paneChange$.map(function () {
      return atom.workspace.getActiveTextEditor();
    })).flatMap(_asyncToGenerator(function* (editor) {
      if (editor == null) {
        return null;
      } else {
        return _this._outlineForEditor(editor);
      }
    }));
  }

  _createClass(Activation, [{
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
    }
  }, {
    key: 'consumeGadgetsService',
    value: function consumeGadgetsService(gadgets) {
      var OutlineView = (0, _OutlineView.createOutlineViewClass)(this._outline$);
      var disposable = gadgets.registerGadget(OutlineView);
      return disposable;
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

      var outlineProvider = this._providers.findProvider(scopeName);
      if (outlineProvider == null) {
        return Promise.resolve(null);
      }
      var outline = yield outlineProvider.getOutline(editor);
      if (outline == null) {
        return null;
      }
      return _extends({}, outline, {
        editor: editor
      });
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

function consumeGadgetsService(gadgets) {
  (0, _assert2['default'])(activation != null);
  return activation.consumeGadgetsService(gadgets);
}

function consumeOutlineProvider(provider) {
  (0, _assert2['default'])(activation != null);
  return activation.consumeOutlineProvider(provider);
}

/**
 * Use a TextEditor instead of a path so that:
 * - If there are multiple editors for a file, we always jump to outline item
 *   locations in the correct editor.
 * - Jumping to outline item locations works for new, unsaved files.
 */

// If there are multiple providers for a given grammar, the one with the highest priority will be
// used.
//# sourceMappingURL=data:application/json;base64,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QUcsSUFBSSxDQUFDOztBQUU1QixTQUFTLFFBQVEsQ0FBQyxLQUFjLEVBQUU7QUFDdkMsTUFBSSxVQUFVLElBQUksSUFBSSxFQUFFO0FBQ3RCLGNBQVUsR0FBRyxJQUFJLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztHQUNwQztDQUNGOztBQUVNLFNBQVMsVUFBVSxHQUFHO0FBQzNCLE1BQUksVUFBVSxJQUFJLElBQUksRUFBRTtBQUN0QixjQUFVLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDckIsY0FBVSxHQUFHLElBQUksQ0FBQztHQUNuQjtDQUNGOztBQUVNLFNBQVMscUJBQXFCLENBQUMsT0FBdUIsRUFBZTtBQUMxRSwyQkFBVSxVQUFVLElBQUksSUFBSSxDQUFDLENBQUM7QUFDOUIsU0FBTyxVQUFVLENBQUMscUJBQXFCLENBQUMsT0FBTyxDQUFDLENBQUM7Q0FDbEQ7O0FBRU0sU0FBUyxzQkFBc0IsQ0FBQyxRQUF5QixFQUFlO0FBQzdFLDJCQUFVLFVBQVUsSUFBSSxJQUFJLENBQUMsQ0FBQztBQUM5QixTQUFPLFVBQVUsQ0FBQyxzQkFBc0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztDQUNwRCIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0dhZGdldHNTZXJ2aWNlfSBmcm9tICcuLi8uLi9nYWRnZXRzLWludGVyZmFjZXMnO1xuXG5pbXBvcnQge09ic2VydmFibGV9IGZyb20gJ3J4JztcblxuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlLCBEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcblxuaW1wb3J0IHtldmVudCBhcyBjb21tb25zRXZlbnR9IGZyb20gJy4uLy4uL2NvbW1vbnMnO1xuY29uc3Qge29ic2VydmFibGVGcm9tU3Vic2NyaWJlRnVuY3Rpb259ID0gY29tbW9uc0V2ZW50O1xuXG5pbXBvcnQge2NyZWF0ZU91dGxpbmVWaWV3Q2xhc3N9IGZyb20gJy4vT3V0bGluZVZpZXcnO1xuaW1wb3J0IHtQcm92aWRlclJlZ2lzdHJ5fSBmcm9tICcuL1Byb3ZpZGVyUmVnaXN0cnknO1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5cbmV4cG9ydCB0eXBlIE91dGxpbmVUcmVlID0ge1xuICBkaXNwbGF5VGV4dDogc3RyaW5nLFxuICBzdGFydFBvc2l0aW9uOiBhdG9tJFBvaW50LFxuICBjaGlsZHJlbjogQXJyYXk8T3V0bGluZVRyZWU+LFxufTtcblxuZXhwb3J0IHR5cGUgT3V0bGluZSA9IHtcbiAgb3V0bGluZVRyZWVzOiBBcnJheTxPdXRsaW5lVHJlZT4sXG59XG5cbi8qKlxuICogSW5jbHVkZXMgYWRkaXRpb25hbCBpbmZvcm1hdGlvbiB0aGF0IGlzIHVzZWZ1bCB0byB0aGUgVUksIGJ1dCByZWR1bmRhbnQgZm9yXG4gKiBwcm92aWRlcnMgdG8gaW5jbHVkZSBpbiB0aGVpciByZXNwb25zZXMuXG4gKi9cbmV4cG9ydCB0eXBlIE91dGxpbmVGb3JVaSA9IE91dGxpbmUgJiB7XG4gIC8qKlxuICAgKiBVc2UgYSBUZXh0RWRpdG9yIGluc3RlYWQgb2YgYSBwYXRoIHNvIHRoYXQ6XG4gICAqIC0gSWYgdGhlcmUgYXJlIG11bHRpcGxlIGVkaXRvcnMgZm9yIGEgZmlsZSwgd2UgYWx3YXlzIGp1bXAgdG8gb3V0bGluZSBpdGVtXG4gICAqICAgbG9jYXRpb25zIGluIHRoZSBjb3JyZWN0IGVkaXRvci5cbiAgICogLSBKdW1waW5nIHRvIG91dGxpbmUgaXRlbSBsb2NhdGlvbnMgd29ya3MgZm9yIG5ldywgdW5zYXZlZCBmaWxlcy5cbiAgICovXG4gIGVkaXRvcjogYXRvbSRUZXh0RWRpdG9yLFxufVxuXG5leHBvcnQgdHlwZSBPdXRsaW5lUHJvdmlkZXIgPSB7XG4gIG5hbWU6IHN0cmluZyxcbiAgLy8gSWYgdGhlcmUgYXJlIG11bHRpcGxlIHByb3ZpZGVycyBmb3IgYSBnaXZlbiBncmFtbWFyLCB0aGUgb25lIHdpdGggdGhlIGhpZ2hlc3QgcHJpb3JpdHkgd2lsbCBiZVxuICAvLyB1c2VkLlxuICBwcmlvcml0eTogbnVtYmVyLFxuICBncmFtbWFyU2NvcGVzOiBBcnJheTxzdHJpbmc+LFxuICBnZXRPdXRsaW5lOiAoZWRpdG9yOiBUZXh0RWRpdG9yKSA9PiBQcm9taXNlPD9PdXRsaW5lPixcbn07XG5cbmNsYXNzIEFjdGl2YXRpb24ge1xuICBfZGlzcG9zYWJsZXM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG5cbiAgX291dGxpbmUkOiBPYnNlcnZhYmxlPD9PdXRsaW5lRm9yVWk+O1xuXG4gIF9wcm92aWRlcnM6IFByb3ZpZGVyUmVnaXN0cnk8T3V0bGluZVByb3ZpZGVyPjtcblxuICBjb25zdHJ1Y3RvcihzdGF0ZTogP09iamVjdCkge1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcblxuICAgIHRoaXMuX3Byb3ZpZGVycyA9IG5ldyBQcm92aWRlclJlZ2lzdHJ5KCk7XG5cbiAgICBjb25zdCB0ZXh0RXZlbnQkID0gT2JzZXJ2YWJsZS5jcmVhdGUob2JzZXJ2ZXIgPT4ge1xuICAgICAgY29uc3QgdGV4dEV2ZW50RGlzcGF0Y2hlciA9IHJlcXVpcmUoJy4uLy4uL3RleHQtZXZlbnQtZGlzcGF0Y2hlcicpLmdldEluc3RhbmNlKCk7XG4gICAgICByZXR1cm4gdGV4dEV2ZW50RGlzcGF0Y2hlci5vbkFueUZpbGVDaGFuZ2UoZWRpdG9yID0+IG9ic2VydmVyLm9uTmV4dChlZGl0b3IpKTtcbiAgICB9KTtcblxuICAgIGNvbnN0IHBhbmVDaGFuZ2UkID0gb2JzZXJ2YWJsZUZyb21TdWJzY3JpYmVGdW5jdGlvbihcbiAgICAgICAgYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZUFjdGl2ZVBhbmVJdGVtLmJpbmQoYXRvbS53b3Jrc3BhY2UpLFxuICAgICAgKVxuICAgICAgLy8gRGVsYXkgdGhlIHdvcmsgb24gdGFiIHN3aXRjaCB0byBrZWVwIHRhYiBzd2l0Y2hlcyBzbmFwcHkgYW5kIGF2b2lkIGRvaW5nIGEgYnVuY2ggb2ZcbiAgICAgIC8vIGNvbXB1dGF0aW9uIGlmIHRoZXJlIGFyZSBhIGxvdCBvZiBjb25zZWN1dGl2ZSB0YWIgc3dpdGNoZXMuXG4gICAgICAuZGVib3VuY2UoMjAwKTtcblxuICAgIC8vIFdlIGFyZSBvdmVyLXN1YnNjcmliaW5nIGEgbGl0dGxlIGJpdCBoZXJlLCBidXQgc2luY2Ugb3V0bGluZXMgYXJlIHR5cGljYWxseSBjaGVhcCBhbmQgZmFzdCB0b1xuICAgIC8vIGdlbmVyYXRlIHRoYXQncyBva2F5IGZvciBub3cuXG4gICAgdGhpcy5fb3V0bGluZSQgPSBPYnNlcnZhYmxlLm1lcmdlKFxuICAgICAgICB0ZXh0RXZlbnQkLFxuICAgICAgICBwYW5lQ2hhbmdlJFxuICAgICAgICAgIC5tYXAoKCkgPT4gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpKSxcbiAgICAgIClcbiAgICAgIC5mbGF0TWFwKGFzeW5jIGVkaXRvciA9PiB7XG4gICAgICAgIGlmIChlZGl0b3IgPT0gbnVsbCkge1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB0aGlzLl9vdXRsaW5lRm9yRWRpdG9yKGVkaXRvcik7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICB9XG5cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gIH1cblxuICBjb25zdW1lR2FkZ2V0c1NlcnZpY2UoZ2FkZ2V0czogR2FkZ2V0c1NlcnZpY2UpOiBJRGlzcG9zYWJsZSB7XG4gICAgY29uc3QgT3V0bGluZVZpZXcgPSBjcmVhdGVPdXRsaW5lVmlld0NsYXNzKHRoaXMuX291dGxpbmUkKTtcbiAgICBjb25zdCBkaXNwb3NhYmxlID0gZ2FkZ2V0cy5yZWdpc3RlckdhZGdldCgoT3V0bGluZVZpZXc6IGFueSkpO1xuICAgIHJldHVybiBkaXNwb3NhYmxlO1xuICB9XG5cbiAgY29uc3VtZU91dGxpbmVQcm92aWRlcihwcm92aWRlcjogT3V0bGluZVByb3ZpZGVyKTogSURpc3Bvc2FibGUge1xuICAgIHRoaXMuX3Byb3ZpZGVycy5hZGRQcm92aWRlcihwcm92aWRlcik7XG4gICAgcmV0dXJuIG5ldyBEaXNwb3NhYmxlKCgpID0+IHRoaXMuX3Byb3ZpZGVycy5yZW1vdmVQcm92aWRlcihwcm92aWRlcikpO1xuICB9XG5cbiAgYXN5bmMgX291dGxpbmVGb3JFZGl0b3IoZWRpdG9yOiBhdG9tJFRleHRFZGl0b3IpOiBQcm9taXNlPD9PdXRsaW5lRm9yVWk+IHtcbiAgICBjb25zdCBzY29wZU5hbWUgPSBlZGl0b3IuZ2V0R3JhbW1hcigpLnNjb3BlTmFtZTtcblxuICAgIGNvbnN0IG91dGxpbmVQcm92aWRlciA9IHRoaXMuX3Byb3ZpZGVycy5maW5kUHJvdmlkZXIoc2NvcGVOYW1lKTtcbiAgICBpZiAob3V0bGluZVByb3ZpZGVyID09IG51bGwpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobnVsbCk7XG4gICAgfVxuICAgIGNvbnN0IG91dGxpbmU6ID9PdXRsaW5lID0gYXdhaXQgb3V0bGluZVByb3ZpZGVyLmdldE91dGxpbmUoZWRpdG9yKTtcbiAgICBpZiAob3V0bGluZSA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLm91dGxpbmUsXG4gICAgICBlZGl0b3IsXG4gICAgfTtcbiAgfVxufVxuXG5sZXQgYWN0aXZhdGlvbjogP0FjdGl2YXRpb24gPSBudWxsO1xuXG5leHBvcnQgZnVuY3Rpb24gYWN0aXZhdGUoc3RhdGU6ID9PYmplY3QpIHtcbiAgaWYgKGFjdGl2YXRpb24gPT0gbnVsbCkge1xuICAgIGFjdGl2YXRpb24gPSBuZXcgQWN0aXZhdGlvbihzdGF0ZSk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlYWN0aXZhdGUoKSB7XG4gIGlmIChhY3RpdmF0aW9uICE9IG51bGwpIHtcbiAgICBhY3RpdmF0aW9uLmRpc3Bvc2UoKTtcbiAgICBhY3RpdmF0aW9uID0gbnVsbDtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY29uc3VtZUdhZGdldHNTZXJ2aWNlKGdhZGdldHM6IEdhZGdldHNTZXJ2aWNlKTogSURpc3Bvc2FibGUge1xuICBpbnZhcmlhbnQoYWN0aXZhdGlvbiAhPSBudWxsKTtcbiAgcmV0dXJuIGFjdGl2YXRpb24uY29uc3VtZUdhZGdldHNTZXJ2aWNlKGdhZGdldHMpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29uc3VtZU91dGxpbmVQcm92aWRlcihwcm92aWRlcjogT3V0bGluZVByb3ZpZGVyKTogSURpc3Bvc2FibGUge1xuICBpbnZhcmlhbnQoYWN0aXZhdGlvbiAhPSBudWxsKTtcbiAgcmV0dXJuIGFjdGl2YXRpb24uY29uc3VtZU91dGxpbmVQcm92aWRlcihwcm92aWRlcik7XG59XG4iXX0=