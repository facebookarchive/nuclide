Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.default = observeLanguageTextEditors;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _events2;

function _events() {
  return _events2 = require('events');
}

var _observeGrammarForTextEditors2;

function _observeGrammarForTextEditors() {
  return _observeGrammarForTextEditors2 = _interopRequireDefault(require('./observe-grammar-for-text-editors'));
}

var START_OBSERVING_TEXT_EDITOR_EVENT = 'start-observing-text-editor';
var STOP_OBSERVING_TEXT_EDITOR_EVENT = 'stop-observing-text-editor';

/**
 * Use this to perform an action on all text editors of the given grammar set.
 *
 * This exists as its own class to make it possible to reuse instances when
 * multiple callers observe on text editors with the same grammar scopes.
 */

var LanguageTextEditorsListener = (function () {
  function LanguageTextEditorsListener(grammarScopes) {
    var _this = this;

    _classCallCheck(this, LanguageTextEditorsListener);

    this._grammarScopes = grammarScopes;

    this._emitter = new (_events2 || _events()).EventEmitter();
    this._observedTextEditors = new Set();
    this._destroySubscriptionsMap = new Map();

    this._grammarSubscription = (0, (_observeGrammarForTextEditors2 || _observeGrammarForTextEditors()).default)(function (textEditor, grammar) {
      var textEditorHasTheRightGrammar = _this._grammarScopes.has(grammar.scopeName);
      var isTextEditorObserved = _this._observedTextEditors.has(textEditor);
      if (textEditorHasTheRightGrammar && !isTextEditorObserved) {
        _this._emitter.emit(START_OBSERVING_TEXT_EDITOR_EVENT, textEditor);
        _this._observedTextEditors.add(textEditor);
      } else if (!textEditorHasTheRightGrammar && isTextEditorObserved) {
        _this._emitter.emit(STOP_OBSERVING_TEXT_EDITOR_EVENT, textEditor);
        _this._observedTextEditors.delete(textEditor);
      }

      var destroySubscription = textEditor.onDidDestroy(function () {
        // When a text editor that we were observing is destroyed, we need to
        // do clean-up even if its grammar hasn't changed.
        if (_this._observedTextEditors.has(textEditor)) {
          _this._emitter.emit(STOP_OBSERVING_TEXT_EDITOR_EVENT, textEditor);
          _this._observedTextEditors.delete(textEditor);
        }

        destroySubscription.dispose();
        _this._destroySubscriptionsMap.delete(textEditor);
      });
      _this._destroySubscriptionsMap.set(textEditor, destroySubscription);
    });
  }

  /**
   * Perform actions on text editors of a given language.
   *
   * @param grammarScopes The grammar scope names to watch for.
   * @param fn This is called once on every text editor that matches the grammars.
   * @param cleanupFn This is called when a text editor no longer matches the
   * grammars or is destroyed.
   */

  _createClass(LanguageTextEditorsListener, [{
    key: 'observeLanguageTextEditors',
    value: function observeLanguageTextEditors(fn, cleanupFn) {
      var _this2 = this;

      // The event was already handled before `fn` was added to the emitter, so
      // we need to call it on all the existing editors.
      atom.workspace.getTextEditors().filter(function (textEditor) {
        return _this2._grammarScopes.has(textEditor.getGrammar().scopeName);
      })
      // We wrap `fn` instead of passing it directly to `.forEach` so it only
      // gets called with one arg (i.e. it matches the Flow annotation).
      .forEach(function (textEditor) {
        return fn(textEditor);
      });

      this._emitter.addListener(START_OBSERVING_TEXT_EDITOR_EVENT, fn);
      this._emitter.addListener(STOP_OBSERVING_TEXT_EDITOR_EVENT, cleanupFn);
      return new (_atom2 || _atom()).Disposable(function () {
        _this2._emitter.removeListener(START_OBSERVING_TEXT_EDITOR_EVENT, fn);
        _this2._emitter.removeListener(STOP_OBSERVING_TEXT_EDITOR_EVENT, cleanupFn);
      });
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._emitter.removeAllListeners();
      this._observedTextEditors.clear();
      this._destroySubscriptionsMap.forEach(function (subscription) {
        return subscription.dispose();
      });
      this._destroySubscriptionsMap.clear();
      this._grammarSubscription.dispose();
    }
  }]);

  return LanguageTextEditorsListener;
})();

function observeLanguageTextEditors(grammarScopes, fn, cleanupFn) {
  var subscriptions = new (_atom2 || _atom()).CompositeDisposable();
  var listener = new LanguageTextEditorsListener(new Set(grammarScopes));
  subscriptions.add(listener);
  subscriptions.add(listener.observeLanguageTextEditors(fn, cleanupFn || function () {}));
  return subscriptions;
}

module.exports = exports.default;