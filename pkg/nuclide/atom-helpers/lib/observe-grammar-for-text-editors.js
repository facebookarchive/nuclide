var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _require = require('atom');

var Disposable = _require.Disposable;

var _require2 = require('events');

var EventEmitter = _require2.EventEmitter;

var GRAMMAR_CHANGE_EVENT = 'grammar-change';

/**
 * A singleton that listens to grammar changes in all text editors.
 */

var GrammarForTextEditorsListener = (function () {
  function GrammarForTextEditorsListener() {
    var _this = this;

    _classCallCheck(this, GrammarForTextEditorsListener);

    this._emitter = new EventEmitter();
    this._grammarSubscriptionsMap = new Map();
    this._destroySubscriptionsMap = new Map();
    this._textEditorsSubscription = atom.workspace.observeTextEditors(function (textEditor) {
      var grammarSubscription = textEditor.observeGrammar(function (grammar) {
        _this._emitter.emit(GRAMMAR_CHANGE_EVENT, textEditor);
      });
      _this._grammarSubscriptionsMap.set(textEditor, grammarSubscription);

      var destroySubscription = textEditor.onDidDestroy(function () {
        var subscription = _this._grammarSubscriptionsMap.get(textEditor);
        if (subscription) {
          subscription.dispose();
          _this._grammarSubscriptionsMap['delete'](textEditor);
        }

        destroySubscription.dispose();
        _this._destroySubscriptionsMap['delete'](textEditor);
      });
      _this._destroySubscriptionsMap.set(textEditor, destroySubscription);
    });
  }

  _createClass(GrammarForTextEditorsListener, [{
    key: 'observeGrammarForTextEditors',
    value: function observeGrammarForTextEditors(fn) {
      var _this2 = this;

      function fnWithGrammar(textEditor) {
        fn(textEditor, textEditor.getGrammar());
      }

      // The event was already handled before `fn` was added to the emitter, so
      // we need to call it on all the existing editors.
      atom.workspace.getTextEditors().forEach(fnWithGrammar);
      this._emitter.addListener(GRAMMAR_CHANGE_EVENT, fnWithGrammar);
      return new Disposable(function () {
        _this2._emitter.removeListener(GRAMMAR_CHANGE_EVENT, fnWithGrammar);
      });
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._emitter.removeAllListeners();
      this._grammarSubscriptionsMap.forEach(function (subscription) {
        return subscription.dispose();
      });
      this._grammarSubscriptionsMap.clear();
      this._destroySubscriptionsMap.forEach(function (subscription) {
        return subscription.dispose();
      });
      this._destroySubscriptionsMap.clear();
      this._textEditorsSubscription.dispose();
    }
  }]);

  return GrammarForTextEditorsListener;
})();

var listeners = new WeakMap();

module.exports =
/**
 * Use this to perform an action on every text editor with its latest grammar.
 *
 * @param fn This is called once for every text editor, and then again every
 * time it changes to a grammar.
 */
function observeGrammarForTextEditors(fn) {
  // The listener should be a global singleton but workspaces are destroyed
  // between each test run so we need to reinstantiate the listener to attach
  // to the current workspace.
  var listener = listeners.get(atom.workspace);
  if (!listener) {
    listener = new GrammarForTextEditorsListener();
    listeners.set(atom.workspace, listener);
  }
  return listener.observeGrammarForTextEditors(fn);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm9ic2VydmUtZ3JhbW1hci1mb3ItdGV4dC1lZGl0b3JzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztlQVdxQixPQUFPLENBQUMsTUFBTSxDQUFDOztJQUE3QixVQUFVLFlBQVYsVUFBVTs7Z0JBQ00sT0FBTyxDQUFDLFFBQVEsQ0FBQzs7SUFBakMsWUFBWSxhQUFaLFlBQVk7O0FBRW5CLElBQU0sb0JBQW9CLEdBQUcsZ0JBQWdCLENBQUM7Ozs7OztJQUt4Qyw2QkFBNkI7QUFNdEIsV0FOUCw2QkFBNkIsR0FNbkI7OzswQkFOViw2QkFBNkI7O0FBTy9CLFFBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxZQUFZLEVBQUUsQ0FBQztBQUNuQyxRQUFJLENBQUMsd0JBQXdCLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUMxQyxRQUFJLENBQUMsd0JBQXdCLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUMxQyxRQUFJLENBQUMsd0JBQXdCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxrQkFBa0IsQ0FBQyxVQUFBLFVBQVUsRUFBSTtBQUM5RSxVQUFNLG1CQUFtQixHQUFHLFVBQVUsQ0FBQyxjQUFjLENBQUMsVUFBQSxPQUFPLEVBQUk7QUFDL0QsY0FBSyxRQUFRLENBQUMsSUFBSSxDQUFDLG9CQUFvQixFQUFFLFVBQVUsQ0FBQyxDQUFDO09BQ3RELENBQUMsQ0FBQztBQUNILFlBQUssd0JBQXdCLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDOztBQUVuRSxVQUFNLG1CQUFtQixHQUFHLFVBQVUsQ0FBQyxZQUFZLENBQUMsWUFBTTtBQUN4RCxZQUFNLFlBQVksR0FBRyxNQUFLLHdCQUF3QixDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNuRSxZQUFJLFlBQVksRUFBRTtBQUNoQixzQkFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3ZCLGdCQUFLLHdCQUF3QixVQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7U0FDbEQ7O0FBRUQsMkJBQW1CLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDOUIsY0FBSyx3QkFBd0IsVUFBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO09BQ2xELENBQUMsQ0FBQztBQUNILFlBQUssd0JBQXdCLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO0tBQ3BFLENBQUMsQ0FBQztHQUNKOztlQTVCRyw2QkFBNkI7O1dBOEJMLHNDQUMxQixFQUEyRCxFQUMvQzs7O0FBQ1osZUFBUyxhQUFhLENBQUMsVUFBVSxFQUFFO0FBQ2pDLFVBQUUsQ0FBQyxVQUFVLEVBQUUsVUFBVSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7T0FDekM7Ozs7QUFJRCxVQUFJLENBQUMsU0FBUyxDQUFDLGNBQWMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUN2RCxVQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxvQkFBb0IsRUFBRSxhQUFhLENBQUMsQ0FBQztBQUMvRCxhQUFPLElBQUksVUFBVSxDQUFDLFlBQU07QUFDMUIsZUFBSyxRQUFRLENBQUMsY0FBYyxDQUFDLG9CQUFvQixFQUFFLGFBQWEsQ0FBQyxDQUFDO09BQ25FLENBQUMsQ0FBQztLQUNKOzs7V0FFTSxtQkFBUztBQUNkLFVBQUksQ0FBQyxRQUFRLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztBQUNuQyxVQUFJLENBQUMsd0JBQXdCLENBQUMsT0FBTyxDQUFDLFVBQUEsWUFBWTtlQUFJLFlBQVksQ0FBQyxPQUFPLEVBQUU7T0FBQSxDQUFDLENBQUM7QUFDOUUsVUFBSSxDQUFDLHdCQUF3QixDQUFDLEtBQUssRUFBRSxDQUFDO0FBQ3RDLFVBQUksQ0FBQyx3QkFBd0IsQ0FBQyxPQUFPLENBQUMsVUFBQSxZQUFZO2VBQUksWUFBWSxDQUFDLE9BQU8sRUFBRTtPQUFBLENBQUMsQ0FBQztBQUM5RSxVQUFJLENBQUMsd0JBQXdCLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDdEMsVUFBSSxDQUFDLHdCQUF3QixDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQ3pDOzs7U0FyREcsNkJBQTZCOzs7QUF3RG5DLElBQU0sU0FBaUUsR0FBRyxJQUFJLE9BQU8sRUFBRSxDQUFDOztBQUV4RixNQUFNLENBQUMsT0FBTzs7Ozs7OztBQU9kLFNBQVMsNEJBQTRCLENBQ25DLEVBQTJELEVBQzlDOzs7O0FBSWIsTUFBSSxRQUFRLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDN0MsTUFBSSxDQUFDLFFBQVEsRUFBRTtBQUNiLFlBQVEsR0FBRyxJQUFJLDZCQUE2QixFQUFFLENBQUM7QUFDL0MsYUFBUyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0dBQ3pDO0FBQ0QsU0FBTyxRQUFRLENBQUMsNEJBQTRCLENBQUMsRUFBRSxDQUFDLENBQUM7Q0FDbEQsQ0FBQyIsImZpbGUiOiJvYnNlcnZlLWdyYW1tYXItZm9yLXRleHQtZWRpdG9ycy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IHtEaXNwb3NhYmxlfSA9IHJlcXVpcmUoJ2F0b20nKTtcbmNvbnN0IHtFdmVudEVtaXR0ZXJ9ID0gcmVxdWlyZSgnZXZlbnRzJyk7XG5cbmNvbnN0IEdSQU1NQVJfQ0hBTkdFX0VWRU5UID0gJ2dyYW1tYXItY2hhbmdlJztcblxuLyoqXG4gKiBBIHNpbmdsZXRvbiB0aGF0IGxpc3RlbnMgdG8gZ3JhbW1hciBjaGFuZ2VzIGluIGFsbCB0ZXh0IGVkaXRvcnMuXG4gKi9cbmNsYXNzIEdyYW1tYXJGb3JUZXh0RWRpdG9yc0xpc3RlbmVyIHtcbiAgX2VtaXR0ZXI6IEV2ZW50RW1pdHRlcjtcbiAgX2dyYW1tYXJTdWJzY3JpcHRpb25zTWFwOiBNYXA8VGV4dEVkaXRvciwgSURpc3Bvc2FibGU+O1xuICBfZGVzdHJveVN1YnNjcmlwdGlvbnNNYXA6IE1hcDxUZXh0RWRpdG9yLCBJRGlzcG9zYWJsZT47XG4gIF90ZXh0RWRpdG9yc1N1YnNjcmlwdGlvbjogSURpc3Bvc2FibGU7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fZW1pdHRlciA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgICB0aGlzLl9ncmFtbWFyU3Vic2NyaXB0aW9uc01hcCA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLl9kZXN0cm95U3Vic2NyaXB0aW9uc01hcCA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLl90ZXh0RWRpdG9yc1N1YnNjcmlwdGlvbiA9IGF0b20ud29ya3NwYWNlLm9ic2VydmVUZXh0RWRpdG9ycyh0ZXh0RWRpdG9yID0+IHtcbiAgICAgIGNvbnN0IGdyYW1tYXJTdWJzY3JpcHRpb24gPSB0ZXh0RWRpdG9yLm9ic2VydmVHcmFtbWFyKGdyYW1tYXIgPT4ge1xuICAgICAgICB0aGlzLl9lbWl0dGVyLmVtaXQoR1JBTU1BUl9DSEFOR0VfRVZFTlQsIHRleHRFZGl0b3IpO1xuICAgICAgfSk7XG4gICAgICB0aGlzLl9ncmFtbWFyU3Vic2NyaXB0aW9uc01hcC5zZXQodGV4dEVkaXRvciwgZ3JhbW1hclN1YnNjcmlwdGlvbik7XG5cbiAgICAgIGNvbnN0IGRlc3Ryb3lTdWJzY3JpcHRpb24gPSB0ZXh0RWRpdG9yLm9uRGlkRGVzdHJveSgoKSA9PiB7XG4gICAgICAgIGNvbnN0IHN1YnNjcmlwdGlvbiA9IHRoaXMuX2dyYW1tYXJTdWJzY3JpcHRpb25zTWFwLmdldCh0ZXh0RWRpdG9yKTtcbiAgICAgICAgaWYgKHN1YnNjcmlwdGlvbikge1xuICAgICAgICAgIHN1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gICAgICAgICAgdGhpcy5fZ3JhbW1hclN1YnNjcmlwdGlvbnNNYXAuZGVsZXRlKHRleHRFZGl0b3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgZGVzdHJveVN1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gICAgICAgIHRoaXMuX2Rlc3Ryb3lTdWJzY3JpcHRpb25zTWFwLmRlbGV0ZSh0ZXh0RWRpdG9yKTtcbiAgICAgIH0pO1xuICAgICAgdGhpcy5fZGVzdHJveVN1YnNjcmlwdGlvbnNNYXAuc2V0KHRleHRFZGl0b3IsIGRlc3Ryb3lTdWJzY3JpcHRpb24pO1xuICAgIH0pO1xuICB9XG5cbiAgb2JzZXJ2ZUdyYW1tYXJGb3JUZXh0RWRpdG9ycyhcbiAgICBmbjogKHRleHRFZGl0b3I6IFRleHRFZGl0b3IsIGdyYW1tYXI6IGF0b20kR3JhbW1hcikgPT4gdm9pZCxcbiAgKTogRGlzcG9zYWJsZSB7XG4gICAgZnVuY3Rpb24gZm5XaXRoR3JhbW1hcih0ZXh0RWRpdG9yKSB7XG4gICAgICBmbih0ZXh0RWRpdG9yLCB0ZXh0RWRpdG9yLmdldEdyYW1tYXIoKSk7XG4gICAgfVxuXG4gICAgLy8gVGhlIGV2ZW50IHdhcyBhbHJlYWR5IGhhbmRsZWQgYmVmb3JlIGBmbmAgd2FzIGFkZGVkIHRvIHRoZSBlbWl0dGVyLCBzb1xuICAgIC8vIHdlIG5lZWQgdG8gY2FsbCBpdCBvbiBhbGwgdGhlIGV4aXN0aW5nIGVkaXRvcnMuXG4gICAgYXRvbS53b3Jrc3BhY2UuZ2V0VGV4dEVkaXRvcnMoKS5mb3JFYWNoKGZuV2l0aEdyYW1tYXIpO1xuICAgIHRoaXMuX2VtaXR0ZXIuYWRkTGlzdGVuZXIoR1JBTU1BUl9DSEFOR0VfRVZFTlQsIGZuV2l0aEdyYW1tYXIpO1xuICAgIHJldHVybiBuZXcgRGlzcG9zYWJsZSgoKSA9PiB7XG4gICAgICB0aGlzLl9lbWl0dGVyLnJlbW92ZUxpc3RlbmVyKEdSQU1NQVJfQ0hBTkdFX0VWRU5ULCBmbldpdGhHcmFtbWFyKTtcbiAgICB9KTtcbiAgfVxuXG4gIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5fZW1pdHRlci5yZW1vdmVBbGxMaXN0ZW5lcnMoKTtcbiAgICB0aGlzLl9ncmFtbWFyU3Vic2NyaXB0aW9uc01hcC5mb3JFYWNoKHN1YnNjcmlwdGlvbiA9PiBzdWJzY3JpcHRpb24uZGlzcG9zZSgpKTtcbiAgICB0aGlzLl9ncmFtbWFyU3Vic2NyaXB0aW9uc01hcC5jbGVhcigpO1xuICAgIHRoaXMuX2Rlc3Ryb3lTdWJzY3JpcHRpb25zTWFwLmZvckVhY2goc3Vic2NyaXB0aW9uID0+IHN1YnNjcmlwdGlvbi5kaXNwb3NlKCkpO1xuICAgIHRoaXMuX2Rlc3Ryb3lTdWJzY3JpcHRpb25zTWFwLmNsZWFyKCk7XG4gICAgdGhpcy5fdGV4dEVkaXRvcnNTdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICB9XG59XG5cbmNvbnN0IGxpc3RlbmVyczogV2Vha01hcDxhdG9tJFdvcmtzcGFjZSwgR3JhbW1hckZvclRleHRFZGl0b3JzTGlzdGVuZXI+ID0gbmV3IFdlYWtNYXAoKTtcblxubW9kdWxlLmV4cG9ydHMgPVxuLyoqXG4gKiBVc2UgdGhpcyB0byBwZXJmb3JtIGFuIGFjdGlvbiBvbiBldmVyeSB0ZXh0IGVkaXRvciB3aXRoIGl0cyBsYXRlc3QgZ3JhbW1hci5cbiAqXG4gKiBAcGFyYW0gZm4gVGhpcyBpcyBjYWxsZWQgb25jZSBmb3IgZXZlcnkgdGV4dCBlZGl0b3IsIGFuZCB0aGVuIGFnYWluIGV2ZXJ5XG4gKiB0aW1lIGl0IGNoYW5nZXMgdG8gYSBncmFtbWFyLlxuICovXG5mdW5jdGlvbiBvYnNlcnZlR3JhbW1hckZvclRleHRFZGl0b3JzKFxuICBmbjogKHRleHRFZGl0b3I6IFRleHRFZGl0b3IsIGdyYW1tYXI6IGF0b20kR3JhbW1hcikgPT4gdm9pZCxcbik6IElEaXNwb3NhYmxlIHtcbiAgLy8gVGhlIGxpc3RlbmVyIHNob3VsZCBiZSBhIGdsb2JhbCBzaW5nbGV0b24gYnV0IHdvcmtzcGFjZXMgYXJlIGRlc3Ryb3llZFxuICAvLyBiZXR3ZWVuIGVhY2ggdGVzdCBydW4gc28gd2UgbmVlZCB0byByZWluc3RhbnRpYXRlIHRoZSBsaXN0ZW5lciB0byBhdHRhY2hcbiAgLy8gdG8gdGhlIGN1cnJlbnQgd29ya3NwYWNlLlxuICBsZXQgbGlzdGVuZXIgPSBsaXN0ZW5lcnMuZ2V0KGF0b20ud29ya3NwYWNlKTtcbiAgaWYgKCFsaXN0ZW5lcikge1xuICAgIGxpc3RlbmVyID0gbmV3IEdyYW1tYXJGb3JUZXh0RWRpdG9yc0xpc3RlbmVyKCk7XG4gICAgbGlzdGVuZXJzLnNldChhdG9tLndvcmtzcGFjZSwgbGlzdGVuZXIpO1xuICB9XG4gIHJldHVybiBsaXN0ZW5lci5vYnNlcnZlR3JhbW1hckZvclRleHRFZGl0b3JzKGZuKTtcbn07XG4iXX0=