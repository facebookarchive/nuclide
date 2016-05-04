Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

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

var _nuclideCommons = require('../../nuclide-commons');

var _nuclideLogging = require('../../nuclide-logging');

var _ProviderRegistry = require('./ProviderRegistry');

var logger = (0, _nuclideLogging.getLogger)();

var ActiveEditorBasedService = (function () {
  function ActiveEditorBasedService(resultFunction) {
    var config = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
    var eventSources = arguments.length <= 2 || arguments[2] === undefined ? getDefaultEventSources() : arguments[2];

    _classCallCheck(this, ActiveEditorBasedService);

    this._config = this._getConcreteConfig(config);
    this._resultFunction = resultFunction;
    this._providerRegistry = new _ProviderRegistry.ProviderRegistry();
    this._resultsStream = this._createResultsStream(eventSources);
  }

  _createClass(ActiveEditorBasedService, [{
    key: '_getConcreteConfig',
    value: function _getConcreteConfig(config) {
      return _extends({
        updateOnEdit: true
      }, config);
    }
  }, {
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
    value: function _createResultsStream(eventSources) {
      var _this2 = this;

      // Emit a pane change event first, so that clients can do something while waiting for a provider
      // to give a result.
      return eventSources.activeEditors.switchMap(function (editorArg) {
        // Necessary so the type refinement holds in the callback later
        var editor = editorArg;
        if (editor == null) {
          return _rxjs.Observable.of({ kind: 'not-text-editor' });
        }

        return _rxjs.Observable.concat(_rxjs.Observable.of({ kind: 'pane-change' }), _rxjs.Observable.fromPromise(_this2._getResultForEditor(editor)), _this2._resultsForEditor(editor, eventSources));
      });
    }
  }, {
    key: '_resultsForEditor',
    value: function _resultsForEditor(editor, eventSources) {
      var _this3 = this;

      var editorEvents = undefined;
      // The result that we publish when an editor event is emitted
      var eventEmittedResult = undefined;
      if (this._config.updateOnEdit) {
        editorEvents = eventSources.changesForEditor(editor);
        eventEmittedResult = { kind: 'edit' };
      } else {
        editorEvents = eventSources.savesForEditor(editor);
        eventEmittedResult = { kind: 'save' };
      }

      return editorEvents.flatMap(function () {
        return _rxjs.Observable.concat(_rxjs.Observable.of(eventEmittedResult), _rxjs.Observable.fromPromise(_this3._getResultForEditor(editor)));
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

function getDefaultEventSources() {
  return {
    activeEditors: _nuclideAtomHelpers.atomEventDebounce.observeActiveEditorsDebounced(),
    changesForEditor: function changesForEditor(editor) {
      return _nuclideAtomHelpers.atomEventDebounce.editorChangesDebounced(editor);
    },
    savesForEditor: function savesForEditor(editor) {
      return _nuclideCommons.event.observableFromSubscribeFunction(function (callback) {
        return editor.onDidSave(callback);
      }).mapTo(undefined);
    }
  };
}

// Since providers can be slow, the pane-change and edit events are emitted immediately in case
// the UI needs to clear outdated results.

// The editor that the result was computed from

/**
 * If true, we will query providers for updates whenever the text in the editor is changed.
 * Otherwise, we will query only when there is a save event.
 */