Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.default = observeGrammarForTextEditors;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

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

var GRAMMAR_CHANGE_EVENT = 'grammar-change';

/**
 * A singleton that listens to grammar changes in all text editors.
 */

var GrammarForTextEditorsListener = (function () {
  function GrammarForTextEditorsListener() {
    var _this = this;

    _classCallCheck(this, GrammarForTextEditorsListener);

    this._emitter = new (_atom2 || _atom()).Emitter();
    this._subscriptions = new (_atom2 || _atom()).CompositeDisposable();
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
module.exports = exports.default;