Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

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

var _rxjs2;

function _rxjs() {
  return _rxjs2 = require('rxjs');
}

var _nuclideAtomHelpers2;

function _nuclideAtomHelpers() {
  return _nuclideAtomHelpers2 = require('../../nuclide-atom-helpers');
}

var _nuclideCommons2;

function _nuclideCommons() {
  return _nuclideCommons2 = require('../../nuclide-commons');
}

var _nuclideLogging2;

function _nuclideLogging() {
  return _nuclideLogging2 = require('../../nuclide-logging');
}

var logger = (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)();

var _ProviderRegistry2;

function _ProviderRegistry() {
  return _ProviderRegistry2 = require('./ProviderRegistry');
}

var DEFAULT_CONFIG = {
  updateOnEdit: true
};

function getConcreteConfig(config) {
  return _extends({}, DEFAULT_CONFIG, config);
}

var ActiveEditorBasedService = (function () {
  function ActiveEditorBasedService(resultFunction) {
    var config = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
    var eventSources = arguments.length <= 2 || arguments[2] === undefined ? getDefaultEventSources() : arguments[2];

    _classCallCheck(this, ActiveEditorBasedService);

    this._config = getConcreteConfig(config);
    this._resultFunction = resultFunction;
    this._providerRegistry = new (_ProviderRegistry2 || _ProviderRegistry()).ProviderRegistry();
    this._resultsStream = this._createResultsStream(eventSources);
  }

  _createClass(ActiveEditorBasedService, [{
    key: 'consumeProvider',
    value: function consumeProvider(provider) {
      var _this = this;

      this._providerRegistry.addProvider(provider);
      return new (_atom2 || _atom()).Disposable(function () {
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

      var results = eventSources.activeEditors.switchMap(function (editorArg) {
        // Necessary so the type refinement holds in the callback later
        var editor = editorArg;
        if (editor == null) {
          return (_rxjs2 || _rxjs()).Observable.of({ kind: 'not-text-editor' });
        }

        return (_rxjs2 || _rxjs()).Observable.concat(
        // Emit a pane change event first, so that clients can do something while waiting for a
        // provider to give a result.
        (_rxjs2 || _rxjs()).Observable.of({ kind: 'pane-change' }), (_rxjs2 || _rxjs()).Observable.fromPromise(_this2._getResultForEditor(_this2._getProviderForEditor(editor), editor)), _this2._resultsForEditor(editor, eventSources));
      });
      return (0, (_nuclideCommons2 || _nuclideCommons()).cacheWhileSubscribed)(results);
    }
  }, {
    key: '_resultsForEditor',
    value: function _resultsForEditor(editor, eventSources) {
      var _this3 = this;

      // It's possible that the active provider for an editor changes over time.
      // Thus, we have to subscribe to both edits and saves.
      return (_rxjs2 || _rxjs()).Observable.merge(eventSources.changesForEditor(editor).map(function () {
        return 'edit';
      }), eventSources.savesForEditor(editor).map(function () {
        return 'save';
      })).flatMap(function (event) {
        var provider = _this3._getProviderForEditor(editor);
        if (provider != null) {
          var _updateOnEdit = provider.updateOnEdit;
          // Fall back to the config's updateOnEdit if not provided.
          if (_updateOnEdit == null) {
            _updateOnEdit = _this3._config.updateOnEdit;
          }
          if (_updateOnEdit !== (event === 'edit')) {
            return (_rxjs2 || _rxjs()).Observable.empty();
          }
        }
        return (_rxjs2 || _rxjs()).Observable.concat(
        // $FlowIssue: {kind: edit | save} <=> {kind: edit} | {kind: save}
        (_rxjs2 || _rxjs()).Observable.of({ kind: event }), (_rxjs2 || _rxjs()).Observable.fromPromise(_this3._getResultForEditor(provider, editor)));
      });
    }
  }, {
    key: '_getProviderForEditor',
    value: function _getProviderForEditor(editor) {
      var grammar = editor.getGrammar().scopeName;
      return this._providerRegistry.findProvider(grammar);
    }
  }, {
    key: '_getResultForEditor',
    value: _asyncToGenerator(function* (provider, editor) {
      if (provider == null) {
        return {
          kind: 'no-provider',
          grammar: editor.getGrammar()
        };
      }
      try {
        return {
          kind: 'result',
          result: yield this._resultFunction(provider, editor),
          editor: editor
        };
      } catch (e) {
        logger.error('Error from provider for ' + editor.getGrammar(), e);
        return {
          kind: 'provider-error'
        };
      }
    })
  }]);

  return ActiveEditorBasedService;
})();

exports.ActiveEditorBasedService = ActiveEditorBasedService;

function getDefaultEventSources() {
  return {
    activeEditors: (_nuclideAtomHelpers2 || _nuclideAtomHelpers()).atomEventDebounce.observeActiveEditorsDebounced(),
    changesForEditor: function changesForEditor(editor) {
      return (_nuclideAtomHelpers2 || _nuclideAtomHelpers()).atomEventDebounce.editorChangesDebounced(editor);
    },
    savesForEditor: function savesForEditor(editor) {
      return (_nuclideCommons2 || _nuclideCommons()).event.observableFromSubscribeFunction(function (callback) {
        return editor.onDidSave(callback);
      }).mapTo(undefined);
    }
  };
}

// This overrides the updateOnEdit setting in ActiveEditorBasedService's config.

// Since providers can be slow, the pane-change and edit events are emitted immediately in case
// the UI needs to clear outdated results.

// The editor that the result was computed from

/**
 * If true, we will query providers for updates whenever the text in the editor is changed.
 * Otherwise, we will query only when there is a save event.
 */