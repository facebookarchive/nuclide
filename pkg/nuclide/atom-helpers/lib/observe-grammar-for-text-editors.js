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

var CompositeDisposable = _require.CompositeDisposable;
var Emitter = _require.Emitter;

var GRAMMAR_CHANGE_EVENT = 'grammar-change';

/**
 * A singleton that listens to grammar changes in all text editors.
 */

var GrammarForTextEditorsListener = (function () {
  function GrammarForTextEditorsListener() {
    var _this = this;

    _classCallCheck(this, GrammarForTextEditorsListener);

    this._emitter = new Emitter();
    this._subscriptions = new CompositeDisposable();
    this._subscriptions.add(this._emitter, atom.workspace.observeTextEditors(function (textEditor) {
      var grammarSubscription = textEditor.observeGrammar(function (grammar) {
        _this._emitter.emit(GRAMMAR_CHANGE_EVENT, textEditor);
      });
      var destroySubscription = textEditor.onDidDestroy(function () {
        grammarSubscription.dispose();
        destroySubscription.dispose();
      });
      _this._subscriptions.add(grammarSubscription, destroySubscription);
    }));
  }

  _createClass(GrammarForTextEditorsListener, [{
    key: 'observeGrammarForTextEditors',
    value: function observeGrammarForTextEditors(fn) {
      function fnWithGrammar(textEditor) {
        fn(textEditor, textEditor.getGrammar());
      }

      // The event was already handled before `fn` was added to the emitter, so
      // we need to call it on all the existing editors.
      atom.workspace.getTextEditors().forEach(fnWithGrammar);
      return this._emitter.on(GRAMMAR_CHANGE_EVENT, fnWithGrammar);
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._subscriptions.dispose();
    }
  }]);

  return GrammarForTextEditorsListener;
})();

var grammarForTextEditorsListener = undefined;

/**
 * Use this to perform an action on every text editor with its latest grammar.
 *
 * @param fn This is called once for every text editor, and then again every
 * time it changes to a grammar.
 */
function observeGrammarForTextEditors(fn) {
  if (!grammarForTextEditorsListener) {
    grammarForTextEditorsListener = new GrammarForTextEditorsListener();
  }
  return grammarForTextEditorsListener.observeGrammarForTextEditors(fn);
}

if (atom.inSpecMode()) {
  observeGrammarForTextEditors.__reset__ = function () {
    if (grammarForTextEditorsListener) {
      grammarForTextEditorsListener.dispose();
      grammarForTextEditorsListener = null;
    }
  };
}

module.exports = observeGrammarForTextEditors;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm9ic2VydmUtZ3JhbW1hci1mb3ItdGV4dC1lZGl0b3JzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztlQVd1QyxPQUFPLENBQUMsTUFBTSxDQUFDOztJQUEvQyxtQkFBbUIsWUFBbkIsbUJBQW1CO0lBQUUsT0FBTyxZQUFQLE9BQU87O0FBRW5DLElBQU0sb0JBQW9CLEdBQUcsZ0JBQWdCLENBQUM7Ozs7OztJQUt4Qyw2QkFBNkI7QUFJdEIsV0FKUCw2QkFBNkIsR0FJbkI7OzswQkFKViw2QkFBNkI7O0FBSy9CLFFBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQztBQUM5QixRQUFJLENBQUMsY0FBYyxHQUFHLElBQUksbUJBQW1CLEVBQUUsQ0FBQztBQUNoRCxRQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FDckIsSUFBSSxDQUFDLFFBQVEsRUFDYixJQUFJLENBQUMsU0FBUyxDQUFDLGtCQUFrQixDQUFDLFVBQUEsVUFBVSxFQUFJO0FBQzlDLFVBQU0sbUJBQW1CLEdBQUcsVUFBVSxDQUFDLGNBQWMsQ0FBQyxVQUFBLE9BQU8sRUFBSTtBQUMvRCxjQUFLLFFBQVEsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsVUFBVSxDQUFDLENBQUM7T0FDdEQsQ0FBQyxDQUFDO0FBQ0gsVUFBTSxtQkFBbUIsR0FBRyxVQUFVLENBQUMsWUFBWSxDQUFDLFlBQU07QUFDeEQsMkJBQW1CLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDOUIsMkJBQW1CLENBQUMsT0FBTyxFQUFFLENBQUM7T0FDL0IsQ0FBQyxDQUFDO0FBQ0gsWUFBSyxjQUFjLENBQUMsR0FBRyxDQUFDLG1CQUFtQixFQUFFLG1CQUFtQixDQUFDLENBQUM7S0FDbkUsQ0FBQyxDQUNILENBQUM7R0FDSDs7ZUFwQkcsNkJBQTZCOztXQXNCTCxzQ0FDMUIsRUFBMkQsRUFDOUM7QUFDYixlQUFTLGFBQWEsQ0FBQyxVQUFVLEVBQUU7QUFDakMsVUFBRSxDQUFDLFVBQVUsRUFBRSxVQUFVLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztPQUN6Qzs7OztBQUlELFVBQUksQ0FBQyxTQUFTLENBQUMsY0FBYyxFQUFFLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQ3ZELGFBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsb0JBQW9CLEVBQUUsYUFBYSxDQUFDLENBQUM7S0FDOUQ7OztXQUVNLG1CQUFTO0FBQ2QsVUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUMvQjs7O1NBckNHLDZCQUE2Qjs7O0FBd0NuQyxJQUFJLDZCQUE2RCxZQUFBLENBQUM7Ozs7Ozs7O0FBUWxFLFNBQVMsNEJBQTRCLENBQ25DLEVBQTJELEVBQzlDO0FBQ2IsTUFBSSxDQUFDLDZCQUE2QixFQUFFO0FBQ2xDLGlDQUE2QixHQUFHLElBQUksNkJBQTZCLEVBQUUsQ0FBQztHQUNyRTtBQUNELFNBQU8sNkJBQTZCLENBQUMsNEJBQTRCLENBQUMsRUFBRSxDQUFDLENBQUM7Q0FDdkU7O0FBRUQsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFLEVBQUU7QUFDckIsOEJBQTRCLENBQUMsU0FBUyxHQUFHLFlBQVc7QUFDbEQsUUFBSSw2QkFBNkIsRUFBRTtBQUNqQyxtQ0FBNkIsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUN4QyxtQ0FBNkIsR0FBRyxJQUFJLENBQUM7S0FDdEM7R0FDRixDQUFDO0NBQ0g7O0FBRUQsTUFBTSxDQUFDLE9BQU8sR0FBRyw0QkFBNEIsQ0FBQyIsImZpbGUiOiJvYnNlcnZlLWdyYW1tYXItZm9yLXRleHQtZWRpdG9ycy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IHtDb21wb3NpdGVEaXNwb3NhYmxlLCBFbWl0dGVyfSA9IHJlcXVpcmUoJ2F0b20nKTtcblxuY29uc3QgR1JBTU1BUl9DSEFOR0VfRVZFTlQgPSAnZ3JhbW1hci1jaGFuZ2UnO1xuXG4vKipcbiAqIEEgc2luZ2xldG9uIHRoYXQgbGlzdGVucyB0byBncmFtbWFyIGNoYW5nZXMgaW4gYWxsIHRleHQgZWRpdG9ycy5cbiAqL1xuY2xhc3MgR3JhbW1hckZvclRleHRFZGl0b3JzTGlzdGVuZXIge1xuICBfZW1pdHRlcjogRW1pdHRlcjtcbiAgX3N1YnNjcmlwdGlvbnM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fZW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICB0aGlzLl9lbWl0dGVyLFxuICAgICAgYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZVRleHRFZGl0b3JzKHRleHRFZGl0b3IgPT4ge1xuICAgICAgICBjb25zdCBncmFtbWFyU3Vic2NyaXB0aW9uID0gdGV4dEVkaXRvci5vYnNlcnZlR3JhbW1hcihncmFtbWFyID0+IHtcbiAgICAgICAgICB0aGlzLl9lbWl0dGVyLmVtaXQoR1JBTU1BUl9DSEFOR0VfRVZFTlQsIHRleHRFZGl0b3IpO1xuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgZGVzdHJveVN1YnNjcmlwdGlvbiA9IHRleHRFZGl0b3Iub25EaWREZXN0cm95KCgpID0+IHtcbiAgICAgICAgICBncmFtbWFyU3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgICAgICAgICBkZXN0cm95U3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKGdyYW1tYXJTdWJzY3JpcHRpb24sIGRlc3Ryb3lTdWJzY3JpcHRpb24pO1xuICAgICAgfSksXG4gICAgKTtcbiAgfVxuXG4gIG9ic2VydmVHcmFtbWFyRm9yVGV4dEVkaXRvcnMoXG4gICAgZm46ICh0ZXh0RWRpdG9yOiBUZXh0RWRpdG9yLCBncmFtbWFyOiBhdG9tJEdyYW1tYXIpID0+IHZvaWQsXG4gICk6IElEaXNwb3NhYmxlIHtcbiAgICBmdW5jdGlvbiBmbldpdGhHcmFtbWFyKHRleHRFZGl0b3IpIHtcbiAgICAgIGZuKHRleHRFZGl0b3IsIHRleHRFZGl0b3IuZ2V0R3JhbW1hcigpKTtcbiAgICB9XG5cbiAgICAvLyBUaGUgZXZlbnQgd2FzIGFscmVhZHkgaGFuZGxlZCBiZWZvcmUgYGZuYCB3YXMgYWRkZWQgdG8gdGhlIGVtaXR0ZXIsIHNvXG4gICAgLy8gd2UgbmVlZCB0byBjYWxsIGl0IG9uIGFsbCB0aGUgZXhpc3RpbmcgZWRpdG9ycy5cbiAgICBhdG9tLndvcmtzcGFjZS5nZXRUZXh0RWRpdG9ycygpLmZvckVhY2goZm5XaXRoR3JhbW1hcik7XG4gICAgcmV0dXJuIHRoaXMuX2VtaXR0ZXIub24oR1JBTU1BUl9DSEFOR0VfRVZFTlQsIGZuV2l0aEdyYW1tYXIpO1xuICB9XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgfVxufVxuXG5sZXQgZ3JhbW1hckZvclRleHRFZGl0b3JzTGlzdGVuZXI6ID9HcmFtbWFyRm9yVGV4dEVkaXRvcnNMaXN0ZW5lcjtcblxuLyoqXG4gKiBVc2UgdGhpcyB0byBwZXJmb3JtIGFuIGFjdGlvbiBvbiBldmVyeSB0ZXh0IGVkaXRvciB3aXRoIGl0cyBsYXRlc3QgZ3JhbW1hci5cbiAqXG4gKiBAcGFyYW0gZm4gVGhpcyBpcyBjYWxsZWQgb25jZSBmb3IgZXZlcnkgdGV4dCBlZGl0b3IsIGFuZCB0aGVuIGFnYWluIGV2ZXJ5XG4gKiB0aW1lIGl0IGNoYW5nZXMgdG8gYSBncmFtbWFyLlxuICovXG5mdW5jdGlvbiBvYnNlcnZlR3JhbW1hckZvclRleHRFZGl0b3JzKFxuICBmbjogKHRleHRFZGl0b3I6IFRleHRFZGl0b3IsIGdyYW1tYXI6IGF0b20kR3JhbW1hcikgPT4gdm9pZCxcbik6IElEaXNwb3NhYmxlIHtcbiAgaWYgKCFncmFtbWFyRm9yVGV4dEVkaXRvcnNMaXN0ZW5lcikge1xuICAgIGdyYW1tYXJGb3JUZXh0RWRpdG9yc0xpc3RlbmVyID0gbmV3IEdyYW1tYXJGb3JUZXh0RWRpdG9yc0xpc3RlbmVyKCk7XG4gIH1cbiAgcmV0dXJuIGdyYW1tYXJGb3JUZXh0RWRpdG9yc0xpc3RlbmVyLm9ic2VydmVHcmFtbWFyRm9yVGV4dEVkaXRvcnMoZm4pO1xufVxuXG5pZiAoYXRvbS5pblNwZWNNb2RlKCkpIHtcbiAgb2JzZXJ2ZUdyYW1tYXJGb3JUZXh0RWRpdG9ycy5fX3Jlc2V0X18gPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoZ3JhbW1hckZvclRleHRFZGl0b3JzTGlzdGVuZXIpIHtcbiAgICAgIGdyYW1tYXJGb3JUZXh0RWRpdG9yc0xpc3RlbmVyLmRpc3Bvc2UoKTtcbiAgICAgIGdyYW1tYXJGb3JUZXh0RWRpdG9yc0xpc3RlbmVyID0gbnVsbDtcbiAgICB9XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gb2JzZXJ2ZUdyYW1tYXJGb3JUZXh0RWRpdG9ycztcbiJdfQ==