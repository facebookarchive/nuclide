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

exports.activate = activate;
exports.createAutocompleteProvider = createAutocompleteProvider;
exports.provideOutlines = provideOutlines;
exports.provideDefinitions = provideDefinitions;
exports.provideReferences = provideReferences;
exports.provideCodeFormat = provideCodeFormat;
exports.provideLint = provideLint;
exports.provideBusySignal = provideBusySignal;
exports.deactivate = deactivate;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _nuclideBusySignal2;

function _nuclideBusySignal() {
  return _nuclideBusySignal2 = require('../../nuclide-busy-signal');
}

var _constants2;

function _constants() {
  return _constants2 = require('./constants');
}

var _AutocompleteHelpers2;

function _AutocompleteHelpers() {
  return _AutocompleteHelpers2 = _interopRequireDefault(require('./AutocompleteHelpers'));
}

var _DefinitionHelpers2;

function _DefinitionHelpers() {
  return _DefinitionHelpers2 = _interopRequireDefault(require('./DefinitionHelpers'));
}

var _OutlineHelpers2;

function _OutlineHelpers() {
  return _OutlineHelpers2 = _interopRequireDefault(require('./OutlineHelpers'));
}

var _ReferenceHelpers2;

function _ReferenceHelpers() {
  return _ReferenceHelpers2 = _interopRequireDefault(require('./ReferenceHelpers'));
}

var _CodeFormatHelpers2;

function _CodeFormatHelpers() {
  return _CodeFormatHelpers2 = _interopRequireDefault(require('./CodeFormatHelpers'));
}

var _LintHelpers2;

function _LintHelpers() {
  return _LintHelpers2 = _interopRequireDefault(require('./LintHelpers'));
}

var busySignalProvider = null;

function activate() {
  busySignalProvider = new (_nuclideBusySignal2 || _nuclideBusySignal()).DedupedBusySignalProviderBase();
}

function createAutocompleteProvider() {
  return {
    selector: '.source.python',
    disableForSelector: '.source.python .comment, .source.python .string',
    inclusionPriority: 5,
    suggestionPriority: 5, // Higher than the snippets provider.
    getSuggestions: function getSuggestions(request) {
      return (_AutocompleteHelpers2 || _AutocompleteHelpers()).default.getAutocompleteSuggestions(request);
    }
  };
}

function provideOutlines() {
  return {
    grammarScopes: Array.from((_constants2 || _constants()).GRAMMAR_SET),
    priority: 1,
    name: 'Python',
    getOutline: function getOutline(editor) {
      return (_OutlineHelpers2 || _OutlineHelpers()).default.getOutline(editor);
    }
  };
}

function provideDefinitions() {
  return {
    grammarScopes: Array.from((_constants2 || _constants()).GRAMMAR_SET),
    priority: 20,
    name: 'PythonDefinitionProvider',
    getDefinition: function getDefinition(editor, position) {
      return (_DefinitionHelpers2 || _DefinitionHelpers()).default.getDefinition(editor, position);
    }
  };
}

function provideReferences() {
  return {
    isEditorSupported: _asyncToGenerator(function* (textEditor) {
      var fileUri = textEditor.getPath();
      if (!fileUri || !(_constants2 || _constants()).GRAMMAR_SET.has(textEditor.getGrammar().scopeName)) {
        return false;
      }
      return true;
    }),
    findReferences: function findReferences(editor, position) {
      return (_ReferenceHelpers2 || _ReferenceHelpers()).default.getReferences(editor, position);
    }
  };
}

function provideCodeFormat() {
  return {
    selector: 'source.python',
    inclusionPriority: 1,
    formatEntireFile: function formatEntireFile(editor, range) {
      return (_CodeFormatHelpers2 || _CodeFormatHelpers()).default.formatEntireFile(editor, range);
    }
  };
}

function provideLint() {
  return {
    grammarScopes: Array.from((_constants2 || _constants()).GRAMMAR_SET),
    scope: 'file',
    lintOnFly: false,
    name: 'nuclide-python',
    lint: function lint(editor) {
      (0, (_assert2 || _assert()).default)(busySignalProvider);
      return busySignalProvider.reportBusy('Python: Waiting for flake8 lint results for `' + editor.getTitle() + '`', function () {
        return (_LintHelpers2 || _LintHelpers()).default.lint(editor);
      });
    }
  };
}

function provideBusySignal() {
  (0, (_assert2 || _assert()).default)(busySignalProvider);
  return busySignalProvider;
}

function deactivate() {}