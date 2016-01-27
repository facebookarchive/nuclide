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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm9ic2VydmUtZ3JhbW1hci1mb3ItdGV4dC1lZGl0b3JzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztlQVdxQixPQUFPLENBQUMsTUFBTSxDQUFDOztJQUE3QixVQUFVLFlBQVYsVUFBVTs7Z0JBQ00sT0FBTyxDQUFDLFFBQVEsQ0FBQzs7SUFBakMsWUFBWSxhQUFaLFlBQVk7O0FBRW5CLElBQU0sb0JBQW9CLEdBQUcsZ0JBQWdCLENBQUM7Ozs7OztJQUt4Qyw2QkFBNkI7QUFNdEIsV0FOUCw2QkFBNkIsR0FNbkI7OzswQkFOViw2QkFBNkI7O0FBTy9CLFFBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxZQUFZLEVBQUUsQ0FBQztBQUNuQyxRQUFJLENBQUMsd0JBQXdCLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUMxQyxRQUFJLENBQUMsd0JBQXdCLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUMxQyxRQUFJLENBQUMsd0JBQXdCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxrQkFBa0IsQ0FBQyxVQUFBLFVBQVUsRUFBSTtBQUM5RSxVQUFNLG1CQUFtQixHQUFHLFVBQVUsQ0FBQyxjQUFjLENBQUMsVUFBQSxPQUFPLEVBQUk7QUFDL0QsY0FBSyxRQUFRLENBQUMsSUFBSSxDQUFDLG9CQUFvQixFQUFFLFVBQVUsQ0FBQyxDQUFDO09BQ3RELENBQUMsQ0FBQztBQUNILFlBQUssd0JBQXdCLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDOztBQUVuRSxVQUFNLG1CQUFtQixHQUFHLFVBQVUsQ0FBQyxZQUFZLENBQUMsWUFBTTtBQUN4RCxZQUFNLFlBQVksR0FBRyxNQUFLLHdCQUF3QixDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNuRSxZQUFJLFlBQVksRUFBRTtBQUNoQixzQkFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3ZCLGdCQUFLLHdCQUF3QixVQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7U0FDbEQ7O0FBRUQsMkJBQW1CLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDOUIsY0FBSyx3QkFBd0IsVUFBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO09BQ2xELENBQUMsQ0FBQztBQUNILFlBQUssd0JBQXdCLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO0tBQ3BFLENBQUMsQ0FBQztHQUNKOztlQTVCRyw2QkFBNkI7O1dBOEJMLHNDQUMxQixFQUEyRCxFQUMvQzs7O0FBQ1osZUFBUyxhQUFhLENBQUMsVUFBVSxFQUFFO0FBQ2pDLFVBQUUsQ0FBQyxVQUFVLEVBQUUsVUFBVSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7T0FDekM7Ozs7QUFJRCxVQUFJLENBQUMsU0FBUyxDQUFDLGNBQWMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUN2RCxVQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxvQkFBb0IsRUFBRSxhQUFhLENBQUMsQ0FBQztBQUMvRCxhQUFPLElBQUksVUFBVSxDQUFDLFlBQU07QUFDMUIsZUFBSyxRQUFRLENBQUMsY0FBYyxDQUFDLG9CQUFvQixFQUFFLGFBQWEsQ0FBQyxDQUFDO09BQ25FLENBQUMsQ0FBQztLQUNKOzs7V0FFTSxtQkFBUztBQUNkLFVBQUksQ0FBQyxRQUFRLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztBQUNuQyxVQUFJLENBQUMsd0JBQXdCLENBQUMsT0FBTyxDQUFDLFVBQUEsWUFBWTtlQUFJLFlBQVksQ0FBQyxPQUFPLEVBQUU7T0FBQSxDQUFDLENBQUM7QUFDOUUsVUFBSSxDQUFDLHdCQUF3QixDQUFDLEtBQUssRUFBRSxDQUFDO0FBQ3RDLFVBQUksQ0FBQyx3QkFBd0IsQ0FBQyxPQUFPLENBQUMsVUFBQSxZQUFZO2VBQUksWUFBWSxDQUFDLE9BQU8sRUFBRTtPQUFBLENBQUMsQ0FBQztBQUM5RSxVQUFJLENBQUMsd0JBQXdCLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDdEMsVUFBSSxDQUFDLHdCQUF3QixDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQ3pDOzs7U0FyREcsNkJBQTZCOzs7QUF3RG5DLElBQU0sU0FBaUUsR0FBRyxJQUFJLE9BQU8sRUFBRSxDQUFDOztBQUV4RixNQUFNLENBQUMsT0FBTzs7Ozs7OztBQU9kLFNBQVMsNEJBQTRCLENBQ25DLEVBQTJELEVBQ3pDOzs7O0FBSWxCLE1BQUksUUFBUSxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQzdDLE1BQUksQ0FBQyxRQUFRLEVBQUU7QUFDYixZQUFRLEdBQUcsSUFBSSw2QkFBNkIsRUFBRSxDQUFDO0FBQy9DLGFBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQztHQUN6QztBQUNELFNBQU8sUUFBUSxDQUFDLDRCQUE0QixDQUFDLEVBQUUsQ0FBQyxDQUFDO0NBQ2xELENBQUMiLCJmaWxlIjoib2JzZXJ2ZS1ncmFtbWFyLWZvci10ZXh0LWVkaXRvcnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5jb25zdCB7RGlzcG9zYWJsZX0gPSByZXF1aXJlKCdhdG9tJyk7XG5jb25zdCB7RXZlbnRFbWl0dGVyfSA9IHJlcXVpcmUoJ2V2ZW50cycpO1xuXG5jb25zdCBHUkFNTUFSX0NIQU5HRV9FVkVOVCA9ICdncmFtbWFyLWNoYW5nZSc7XG5cbi8qKlxuICogQSBzaW5nbGV0b24gdGhhdCBsaXN0ZW5zIHRvIGdyYW1tYXIgY2hhbmdlcyBpbiBhbGwgdGV4dCBlZGl0b3JzLlxuICovXG5jbGFzcyBHcmFtbWFyRm9yVGV4dEVkaXRvcnNMaXN0ZW5lciB7XG4gIF9lbWl0dGVyOiBFdmVudEVtaXR0ZXI7XG4gIF9ncmFtbWFyU3Vic2NyaXB0aW9uc01hcDogTWFwPFRleHRFZGl0b3IsIGF0b20kRGlzcG9zYWJsZT47XG4gIF9kZXN0cm95U3Vic2NyaXB0aW9uc01hcDogTWFwPFRleHRFZGl0b3IsIGF0b20kRGlzcG9zYWJsZT47XG4gIF90ZXh0RWRpdG9yc1N1YnNjcmlwdGlvbjogYXRvbSREaXNwb3NhYmxlO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX2VtaXR0ZXIgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gICAgdGhpcy5fZ3JhbW1hclN1YnNjcmlwdGlvbnNNYXAgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5fZGVzdHJveVN1YnNjcmlwdGlvbnNNYXAgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5fdGV4dEVkaXRvcnNTdWJzY3JpcHRpb24gPSBhdG9tLndvcmtzcGFjZS5vYnNlcnZlVGV4dEVkaXRvcnModGV4dEVkaXRvciA9PiB7XG4gICAgICBjb25zdCBncmFtbWFyU3Vic2NyaXB0aW9uID0gdGV4dEVkaXRvci5vYnNlcnZlR3JhbW1hcihncmFtbWFyID0+IHtcbiAgICAgICAgdGhpcy5fZW1pdHRlci5lbWl0KEdSQU1NQVJfQ0hBTkdFX0VWRU5ULCB0ZXh0RWRpdG9yKTtcbiAgICAgIH0pO1xuICAgICAgdGhpcy5fZ3JhbW1hclN1YnNjcmlwdGlvbnNNYXAuc2V0KHRleHRFZGl0b3IsIGdyYW1tYXJTdWJzY3JpcHRpb24pO1xuXG4gICAgICBjb25zdCBkZXN0cm95U3Vic2NyaXB0aW9uID0gdGV4dEVkaXRvci5vbkRpZERlc3Ryb3koKCkgPT4ge1xuICAgICAgICBjb25zdCBzdWJzY3JpcHRpb24gPSB0aGlzLl9ncmFtbWFyU3Vic2NyaXB0aW9uc01hcC5nZXQodGV4dEVkaXRvcik7XG4gICAgICAgIGlmIChzdWJzY3JpcHRpb24pIHtcbiAgICAgICAgICBzdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICAgICAgICAgIHRoaXMuX2dyYW1tYXJTdWJzY3JpcHRpb25zTWFwLmRlbGV0ZSh0ZXh0RWRpdG9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGRlc3Ryb3lTdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICAgICAgICB0aGlzLl9kZXN0cm95U3Vic2NyaXB0aW9uc01hcC5kZWxldGUodGV4dEVkaXRvcik7XG4gICAgICB9KTtcbiAgICAgIHRoaXMuX2Rlc3Ryb3lTdWJzY3JpcHRpb25zTWFwLnNldCh0ZXh0RWRpdG9yLCBkZXN0cm95U3Vic2NyaXB0aW9uKTtcbiAgICB9KTtcbiAgfVxuXG4gIG9ic2VydmVHcmFtbWFyRm9yVGV4dEVkaXRvcnMoXG4gICAgZm46ICh0ZXh0RWRpdG9yOiBUZXh0RWRpdG9yLCBncmFtbWFyOiBhdG9tJEdyYW1tYXIpID0+IHZvaWQsXG4gICk6IERpc3Bvc2FibGUge1xuICAgIGZ1bmN0aW9uIGZuV2l0aEdyYW1tYXIodGV4dEVkaXRvcikge1xuICAgICAgZm4odGV4dEVkaXRvciwgdGV4dEVkaXRvci5nZXRHcmFtbWFyKCkpO1xuICAgIH1cblxuICAgIC8vIFRoZSBldmVudCB3YXMgYWxyZWFkeSBoYW5kbGVkIGJlZm9yZSBgZm5gIHdhcyBhZGRlZCB0byB0aGUgZW1pdHRlciwgc29cbiAgICAvLyB3ZSBuZWVkIHRvIGNhbGwgaXQgb24gYWxsIHRoZSBleGlzdGluZyBlZGl0b3JzLlxuICAgIGF0b20ud29ya3NwYWNlLmdldFRleHRFZGl0b3JzKCkuZm9yRWFjaChmbldpdGhHcmFtbWFyKTtcbiAgICB0aGlzLl9lbWl0dGVyLmFkZExpc3RlbmVyKEdSQU1NQVJfQ0hBTkdFX0VWRU5ULCBmbldpdGhHcmFtbWFyKTtcbiAgICByZXR1cm4gbmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgdGhpcy5fZW1pdHRlci5yZW1vdmVMaXN0ZW5lcihHUkFNTUFSX0NIQU5HRV9FVkVOVCwgZm5XaXRoR3JhbW1hcik7XG4gICAgfSk7XG4gIH1cblxuICBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuX2VtaXR0ZXIucmVtb3ZlQWxsTGlzdGVuZXJzKCk7XG4gICAgdGhpcy5fZ3JhbW1hclN1YnNjcmlwdGlvbnNNYXAuZm9yRWFjaChzdWJzY3JpcHRpb24gPT4gc3Vic2NyaXB0aW9uLmRpc3Bvc2UoKSk7XG4gICAgdGhpcy5fZ3JhbW1hclN1YnNjcmlwdGlvbnNNYXAuY2xlYXIoKTtcbiAgICB0aGlzLl9kZXN0cm95U3Vic2NyaXB0aW9uc01hcC5mb3JFYWNoKHN1YnNjcmlwdGlvbiA9PiBzdWJzY3JpcHRpb24uZGlzcG9zZSgpKTtcbiAgICB0aGlzLl9kZXN0cm95U3Vic2NyaXB0aW9uc01hcC5jbGVhcigpO1xuICAgIHRoaXMuX3RleHRFZGl0b3JzU3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgfVxufVxuXG5jb25zdCBsaXN0ZW5lcnM6IFdlYWtNYXA8YXRvbSRXb3Jrc3BhY2UsIEdyYW1tYXJGb3JUZXh0RWRpdG9yc0xpc3RlbmVyPiA9IG5ldyBXZWFrTWFwKCk7XG5cbm1vZHVsZS5leHBvcnRzID1cbi8qKlxuICogVXNlIHRoaXMgdG8gcGVyZm9ybSBhbiBhY3Rpb24gb24gZXZlcnkgdGV4dCBlZGl0b3Igd2l0aCBpdHMgbGF0ZXN0IGdyYW1tYXIuXG4gKlxuICogQHBhcmFtIGZuIFRoaXMgaXMgY2FsbGVkIG9uY2UgZm9yIGV2ZXJ5IHRleHQgZWRpdG9yLCBhbmQgdGhlbiBhZ2FpbiBldmVyeVxuICogdGltZSBpdCBjaGFuZ2VzIHRvIGEgZ3JhbW1hci5cbiAqL1xuZnVuY3Rpb24gb2JzZXJ2ZUdyYW1tYXJGb3JUZXh0RWRpdG9ycyhcbiAgZm46ICh0ZXh0RWRpdG9yOiBUZXh0RWRpdG9yLCBncmFtbWFyOiBhdG9tJEdyYW1tYXIpID0+IHZvaWQsXG4pOiBhdG9tJElEaXNwb3NhYmxlIHtcbiAgLy8gVGhlIGxpc3RlbmVyIHNob3VsZCBiZSBhIGdsb2JhbCBzaW5nbGV0b24gYnV0IHdvcmtzcGFjZXMgYXJlIGRlc3Ryb3llZFxuICAvLyBiZXR3ZWVuIGVhY2ggdGVzdCBydW4gc28gd2UgbmVlZCB0byByZWluc3RhbnRpYXRlIHRoZSBsaXN0ZW5lciB0byBhdHRhY2hcbiAgLy8gdG8gdGhlIGN1cnJlbnQgd29ya3NwYWNlLlxuICBsZXQgbGlzdGVuZXIgPSBsaXN0ZW5lcnMuZ2V0KGF0b20ud29ya3NwYWNlKTtcbiAgaWYgKCFsaXN0ZW5lcikge1xuICAgIGxpc3RlbmVyID0gbmV3IEdyYW1tYXJGb3JUZXh0RWRpdG9yc0xpc3RlbmVyKCk7XG4gICAgbGlzdGVuZXJzLnNldChhdG9tLndvcmtzcGFjZSwgbGlzdGVuZXIpO1xuICB9XG4gIHJldHVybiBsaXN0ZW5lci5vYnNlcnZlR3JhbW1hckZvclRleHRFZGl0b3JzKGZuKTtcbn07XG4iXX0=