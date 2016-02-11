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
    value: function _outlineForEditor(editor) {
      var scopeName = editor.getGrammar().scopeName;

      var outlineProvider = this._providers.findProvider(scopeName);
      if (outlineProvider == null) {
        return Promise.resolve(null);
      }
      return outlineProvider.getOutline(editor);
    }
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

// If there are multiple providers for a given grammar, the one with the highest priority will be
// used.
//# sourceMappingURL=data:application/json;base64,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QztHQUNwQztDQUNGOztBQUVNLFNBQVMsVUFBVSxHQUFHO0FBQzNCLE1BQUksVUFBVSxJQUFJLElBQUksRUFBRTtBQUN0QixjQUFVLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDckIsY0FBVSxHQUFHLElBQUksQ0FBQztHQUNuQjtDQUNGOztBQUVNLFNBQVMscUJBQXFCLENBQUMsT0FBdUIsRUFBZTtBQUMxRSwyQkFBVSxVQUFVLElBQUksSUFBSSxDQUFDLENBQUM7QUFDOUIsU0FBTyxVQUFVLENBQUMscUJBQXFCLENBQUMsT0FBTyxDQUFDLENBQUM7Q0FDbEQ7O0FBRU0sU0FBUyxzQkFBc0IsQ0FBQyxRQUF5QixFQUFlO0FBQzdFLDJCQUFVLFVBQVUsSUFBSSxJQUFJLENBQUMsQ0FBQztBQUM5QixTQUFPLFVBQVUsQ0FBQyxzQkFBc0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztDQUNwRCIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0dhZGdldHNTZXJ2aWNlfSBmcm9tICcuLi8uLi9nYWRnZXRzLWludGVyZmFjZXMnO1xuXG5pbXBvcnQge09ic2VydmFibGV9IGZyb20gJ3J4JztcblxuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlLCBEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcblxuaW1wb3J0IHtldmVudCBhcyBjb21tb25zRXZlbnR9IGZyb20gJy4uLy4uL2NvbW1vbnMnO1xuY29uc3Qge29ic2VydmFibGVGcm9tU3Vic2NyaWJlRnVuY3Rpb259ID0gY29tbW9uc0V2ZW50O1xuXG5pbXBvcnQge2NyZWF0ZU91dGxpbmVWaWV3Q2xhc3N9IGZyb20gJy4vT3V0bGluZVZpZXcnO1xuaW1wb3J0IHtQcm92aWRlclJlZ2lzdHJ5fSBmcm9tICcuL1Byb3ZpZGVyUmVnaXN0cnknO1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5cbmV4cG9ydCB0eXBlIE91dGxpbmVUcmVlID0ge1xuICBkaXNwbGF5VGV4dDogc3RyaW5nLFxuICBzdGFydFBvc2l0aW9uOiBhdG9tJFBvaW50LFxuICBjaGlsZHJlbjogQXJyYXk8T3V0bGluZVRyZWU+LFxufTtcblxuZXhwb3J0IHR5cGUgT3V0bGluZSA9IHtcbiAgZmlsZTogc3RyaW5nLFxuICBvdXRsaW5lVHJlZXM6IEFycmF5PE91dGxpbmVUcmVlPixcbn1cblxuZXhwb3J0IHR5cGUgT3V0bGluZVByb3ZpZGVyID0ge1xuICBuYW1lOiBzdHJpbmcsXG4gIC8vIElmIHRoZXJlIGFyZSBtdWx0aXBsZSBwcm92aWRlcnMgZm9yIGEgZ2l2ZW4gZ3JhbW1hciwgdGhlIG9uZSB3aXRoIHRoZSBoaWdoZXN0IHByaW9yaXR5IHdpbGwgYmVcbiAgLy8gdXNlZC5cbiAgcHJpb3JpdHk6IG51bWJlcixcbiAgZ3JhbW1hclNjb3BlczogQXJyYXk8c3RyaW5nPixcbiAgZ2V0T3V0bGluZTogKGVkaXRvcjogVGV4dEVkaXRvcikgPT4gUHJvbWlzZTw/T3V0bGluZT4sXG59O1xuXG5jbGFzcyBBY3RpdmF0aW9uIHtcbiAgX2Rpc3Bvc2FibGVzOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuXG4gIF9vdXRsaW5lJDogT2JzZXJ2YWJsZTw/T3V0bGluZT47XG5cbiAgX3Byb3ZpZGVyczogUHJvdmlkZXJSZWdpc3RyeTxPdXRsaW5lUHJvdmlkZXI+O1xuXG4gIGNvbnN0cnVjdG9yKHN0YXRlOiA/T2JqZWN0KSB7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuXG4gICAgdGhpcy5fcHJvdmlkZXJzID0gbmV3IFByb3ZpZGVyUmVnaXN0cnkoKTtcblxuICAgIGNvbnN0IHRleHRFdmVudCQgPSBPYnNlcnZhYmxlLmNyZWF0ZShvYnNlcnZlciA9PiB7XG4gICAgICBjb25zdCB0ZXh0RXZlbnREaXNwYXRjaGVyID0gcmVxdWlyZSgnLi4vLi4vdGV4dC1ldmVudC1kaXNwYXRjaGVyJykuZ2V0SW5zdGFuY2UoKTtcbiAgICAgIHJldHVybiB0ZXh0RXZlbnREaXNwYXRjaGVyLm9uQW55RmlsZUNoYW5nZShlZGl0b3IgPT4gb2JzZXJ2ZXIub25OZXh0KGVkaXRvcikpO1xuICAgIH0pO1xuXG4gICAgY29uc3QgcGFuZUNoYW5nZSQgPSBvYnNlcnZhYmxlRnJvbVN1YnNjcmliZUZ1bmN0aW9uKFxuICAgICAgICBhdG9tLndvcmtzcGFjZS5vYnNlcnZlQWN0aXZlUGFuZUl0ZW0uYmluZChhdG9tLndvcmtzcGFjZSksXG4gICAgICApXG4gICAgICAvLyBEZWxheSB0aGUgd29yayBvbiB0YWIgc3dpdGNoIHRvIGtlZXAgdGFiIHN3aXRjaGVzIHNuYXBweSBhbmQgYXZvaWQgZG9pbmcgYSBidW5jaCBvZlxuICAgICAgLy8gY29tcHV0YXRpb24gaWYgdGhlcmUgYXJlIGEgbG90IG9mIGNvbnNlY3V0aXZlIHRhYiBzd2l0Y2hlcy5cbiAgICAgIC5kZWJvdW5jZSgyMDApO1xuXG4gICAgLy8gV2UgYXJlIG92ZXItc3Vic2NyaWJpbmcgYSBsaXR0bGUgYml0IGhlcmUsIGJ1dCBzaW5jZSBvdXRsaW5lcyBhcmUgdHlwaWNhbGx5IGNoZWFwIGFuZCBmYXN0IHRvXG4gICAgLy8gZ2VuZXJhdGUgdGhhdCdzIG9rYXkgZm9yIG5vdy5cbiAgICB0aGlzLl9vdXRsaW5lJCA9IE9ic2VydmFibGUubWVyZ2UoXG4gICAgICAgIHRleHRFdmVudCQsXG4gICAgICAgIHBhbmVDaGFuZ2UkXG4gICAgICAgICAgLm1hcCgoKSA9PiBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCkpLFxuICAgICAgKVxuICAgICAgLmZsYXRNYXAoYXN5bmMgZWRpdG9yID0+IHtcbiAgICAgICAgaWYgKGVkaXRvciA9PSBudWxsKSB7XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuX291dGxpbmVGb3JFZGl0b3IoZWRpdG9yKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gIH1cblxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIGNvbnN1bWVHYWRnZXRzU2VydmljZShnYWRnZXRzOiBHYWRnZXRzU2VydmljZSk6IElEaXNwb3NhYmxlIHtcbiAgICBjb25zdCBPdXRsaW5lVmlldyA9IGNyZWF0ZU91dGxpbmVWaWV3Q2xhc3ModGhpcy5fb3V0bGluZSQpO1xuICAgIGNvbnN0IGRpc3Bvc2FibGUgPSBnYWRnZXRzLnJlZ2lzdGVyR2FkZ2V0KChPdXRsaW5lVmlldzogYW55KSk7XG4gICAgcmV0dXJuIGRpc3Bvc2FibGU7XG4gIH1cblxuICBjb25zdW1lT3V0bGluZVByb3ZpZGVyKHByb3ZpZGVyOiBPdXRsaW5lUHJvdmlkZXIpOiBJRGlzcG9zYWJsZSB7XG4gICAgdGhpcy5fcHJvdmlkZXJzLmFkZFByb3ZpZGVyKHByb3ZpZGVyKTtcbiAgICByZXR1cm4gbmV3IERpc3Bvc2FibGUoKCkgPT4gdGhpcy5fcHJvdmlkZXJzLnJlbW92ZVByb3ZpZGVyKHByb3ZpZGVyKSk7XG4gIH1cblxuICBfb3V0bGluZUZvckVkaXRvcihlZGl0b3I6IGF0b20kVGV4dEVkaXRvcik6IFByb21pc2U8P091dGxpbmU+IHtcbiAgICBjb25zdCBzY29wZU5hbWUgPSBlZGl0b3IuZ2V0R3JhbW1hcigpLnNjb3BlTmFtZTtcblxuICAgIGNvbnN0IG91dGxpbmVQcm92aWRlciA9IHRoaXMuX3Byb3ZpZGVycy5maW5kUHJvdmlkZXIoc2NvcGVOYW1lKTtcbiAgICBpZiAob3V0bGluZVByb3ZpZGVyID09IG51bGwpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobnVsbCk7XG4gICAgfVxuICAgIHJldHVybiBvdXRsaW5lUHJvdmlkZXIuZ2V0T3V0bGluZShlZGl0b3IpO1xuICB9XG59XG5cbmxldCBhY3RpdmF0aW9uOiA/QWN0aXZhdGlvbiA9IG51bGw7XG5cbmV4cG9ydCBmdW5jdGlvbiBhY3RpdmF0ZShzdGF0ZTogP09iamVjdCkge1xuICBpZiAoYWN0aXZhdGlvbiA9PSBudWxsKSB7XG4gICAgYWN0aXZhdGlvbiA9IG5ldyBBY3RpdmF0aW9uKHN0YXRlKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVhY3RpdmF0ZSgpIHtcbiAgaWYgKGFjdGl2YXRpb24gIT0gbnVsbCkge1xuICAgIGFjdGl2YXRpb24uZGlzcG9zZSgpO1xuICAgIGFjdGl2YXRpb24gPSBudWxsO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb25zdW1lR2FkZ2V0c1NlcnZpY2UoZ2FkZ2V0czogR2FkZ2V0c1NlcnZpY2UpOiBJRGlzcG9zYWJsZSB7XG4gIGludmFyaWFudChhY3RpdmF0aW9uICE9IG51bGwpO1xuICByZXR1cm4gYWN0aXZhdGlvbi5jb25zdW1lR2FkZ2V0c1NlcnZpY2UoZ2FkZ2V0cyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb25zdW1lT3V0bGluZVByb3ZpZGVyKHByb3ZpZGVyOiBPdXRsaW5lUHJvdmlkZXIpOiBJRGlzcG9zYWJsZSB7XG4gIGludmFyaWFudChhY3RpdmF0aW9uICE9IG51bGwpO1xuICByZXR1cm4gYWN0aXZhdGlvbi5jb25zdW1lT3V0bGluZVByb3ZpZGVyKHByb3ZpZGVyKTtcbn1cbiJdfQ==