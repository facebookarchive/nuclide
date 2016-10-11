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

var _assert;

function _load_assert() {
  return _assert = _interopRequireDefault(require('assert'));
}

// eslint-disable-next-line nuclide-internal/no-cross-atom-imports

var _nuclideBusySignal;

function _load_nuclideBusySignal() {
  return _nuclideBusySignal = require('../../nuclide-busy-signal');
}

var _constants;

function _load_constants() {
  return _constants = require('./constants');
}

var _config;

function _load_config() {
  return _config = require('./config');
}

var _AutocompleteHelpers;

function _load_AutocompleteHelpers() {
  return _AutocompleteHelpers = _interopRequireDefault(require('./AutocompleteHelpers'));
}

var _DefinitionHelpers;

function _load_DefinitionHelpers() {
  return _DefinitionHelpers = _interopRequireDefault(require('./DefinitionHelpers'));
}

var _OutlineHelpers;

function _load_OutlineHelpers() {
  return _OutlineHelpers = _interopRequireDefault(require('./OutlineHelpers'));
}

var _ReferenceHelpers;

function _load_ReferenceHelpers() {
  return _ReferenceHelpers = _interopRequireDefault(require('./ReferenceHelpers'));
}

var _CodeFormatHelpers;

function _load_CodeFormatHelpers() {
  return _CodeFormatHelpers = _interopRequireDefault(require('./CodeFormatHelpers'));
}

var _LintHelpers;

function _load_LintHelpers() {
  return _LintHelpers = _interopRequireDefault(require('./LintHelpers'));
}

var busySignalProvider = null;

function activate() {
  busySignalProvider = new (_nuclideBusySignal || _load_nuclideBusySignal()).DedupedBusySignalProviderBase();
}

function createAutocompleteProvider() {
  return {
    selector: '.source.python',
    disableForSelector: '.source.python .comment, .source.python .string',
    inclusionPriority: 5,
    suggestionPriority: 5, // Higher than the snippets provider.
    getSuggestions: function getSuggestions(request) {
      return (_AutocompleteHelpers || _load_AutocompleteHelpers()).default.getAutocompleteSuggestions(request);
    }
  };
}

function provideOutlines() {
  return {
    grammarScopes: Array.from((_constants || _load_constants()).GRAMMAR_SET),
    priority: 1,
    name: 'Python',
    getOutline: function getOutline(editor) {
      return (_OutlineHelpers || _load_OutlineHelpers()).default.getOutline(editor);
    }
  };
}

function provideDefinitions() {
  return {
    grammarScopes: Array.from((_constants || _load_constants()).GRAMMAR_SET),
    priority: 20,
    name: 'PythonDefinitionProvider',
    getDefinition: function getDefinition(editor, position) {
      return (_DefinitionHelpers || _load_DefinitionHelpers()).default.getDefinition(editor, position);
    },
    getDefinitionById: function getDefinitionById(filePath, id) {
      return (_DefinitionHelpers || _load_DefinitionHelpers()).default.getDefinitionById(filePath, id);
    }
  };
}

function provideReferences() {
  return {
    isEditorSupported: _asyncToGenerator(function* (textEditor) {
      var fileUri = textEditor.getPath();
      if (!fileUri || !(_constants || _load_constants()).GRAMMAR_SET.has(textEditor.getGrammar().scopeName)) {
        return false;
      }
      return true;
    }),
    findReferences: function findReferences(editor, position) {
      return (_ReferenceHelpers || _load_ReferenceHelpers()).default.getReferences(editor, position);
    }
  };
}

function provideCodeFormat() {
  return {
    selector: 'source.python',
    inclusionPriority: 1,
    formatEntireFile: function formatEntireFile(editor, range) {
      (0, (_assert || _load_assert()).default)(busySignalProvider);
      return busySignalProvider.reportBusy('Python: formatting `' + editor.getTitle() + '`', function () {
        return (_CodeFormatHelpers || _load_CodeFormatHelpers()).default.formatEntireFile(editor, range);
      });
    }
  };
}

function provideLint() {
  return {
    grammarScopes: Array.from((_constants || _load_constants()).GRAMMAR_SET),
    scope: 'file',
    lintOnFly: (0, (_config || _load_config()).getLintOnFly)(),
    name: 'nuclide-python',
    invalidateOnClose: true,
    lint: function lint(editor) {
      (0, (_assert || _load_assert()).default)(busySignalProvider);
      return busySignalProvider.reportBusy('Python: Waiting for flake8 lint results for `' + editor.getTitle() + '`', function () {
        return (_LintHelpers || _load_LintHelpers()).default.lint(editor);
      });
    }
  };
}

function provideBusySignal() {
  (0, (_assert || _load_assert()).default)(busySignalProvider);
  return busySignalProvider;
}

function deactivate() {}