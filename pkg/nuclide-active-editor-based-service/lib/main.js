Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _atom = require('atom');

var _rxjs = require('rxjs');

var _nuclideAtomHelpers = require('../../nuclide-atom-helpers');

var _nuclideLogging = require('../../nuclide-logging');

var _ProviderRegistry = require('./ProviderRegistry');

var logger = (0, _nuclideLogging.getLogger)();

var ActiveEditorBasedService = (function () {
  function ActiveEditorBasedService(resultFunction) {
    _classCallCheck(this, ActiveEditorBasedService);

    this._resultFunction = resultFunction;
    this._providerRegistry = new _ProviderRegistry.ProviderRegistry();
    this._resultsStream = this._createResultsStream();
  }

  _createClass(ActiveEditorBasedService, [{
    key: 'consumeProvider',
    value: function consumeProvider(provider) {
      var _this = this;

      this._providerRegistry.addProvider(provider);
      return new _atom.Disposable(function () {
        _this._providerRegistry.removeProvider(provider);
      });
    }
  }, {
    key: 'getResultsStream',
    value: function getResultsStream() {
      return this._resultsStream;
    }
  }, {
    key: '_createResultsStream',
    value: function _createResultsStream() {
      var _this2 = this;

      var activeEditors = _nuclideAtomHelpers.atomEventDebounce.observeActiveEditorsDebounced();
      // Emit a pane change event first, so that clients can do something while waiting for a provider
      // to give a result.
      return activeEditors.switchMap(function (editorArg) {
        // Necessary so the type refinement holds in the callback later
        var editor = editorArg;
        if (editor == null) {
          return _rxjs.Observable.of({ kind: 'not-text-editor' });
        }

        var editorEvents = _nuclideAtomHelpers.atomEventDebounce.observeEditorChangesDebounced(editor);

        return _rxjs.Observable.concat(_rxjs.Observable.of({ kind: 'pane-change' }), editorEvents.flatMap(function () {
          return _rxjs.Observable.concat(_rxjs.Observable.of({ kind: 'edit' }), _rxjs.Observable.fromPromise(_this2._getResultForEditor(editor)));
        }));
      });
    }
  }, {
    key: '_getResultForEditor',
    value: _asyncToGenerator(function* (editor) {
      var grammar = editor.getGrammar().scopeName;
      var provider = this._providerRegistry.findProvider(grammar);
      if (provider == null) {
        return {
          kind: 'no-provider',
          grammar: editor.getGrammar()
        };
      }
      var result = undefined;
      try {
        result = yield this._resultFunction(provider, editor);
      } catch (e) {
        logger.error('Error from provider for ' + grammar, e);
        return {
          kind: 'provider-error'
        };
      }
      return {
        kind: 'result',
        result: result,
        editor: editor
      };
    })
  }]);

  return ActiveEditorBasedService;
})();

exports.ActiveEditorBasedService = ActiveEditorBasedService;

// Since providers can be slow, the pane-change and edit events are emitted immediately in case
// the UI needs to clear outdated results.

// The editor that the result was computed from