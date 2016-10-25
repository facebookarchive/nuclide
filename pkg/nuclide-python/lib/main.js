'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

exports.activate = activate;
exports.createAutocompleteProvider = createAutocompleteProvider;
exports.provideOutlines = provideOutlines;
exports.provideDefinitions = provideDefinitions;
exports.provideReferences = provideReferences;
exports.provideCodeFormat = provideCodeFormat;
exports.provideLint = provideLint;
exports.provideBusySignal = provideBusySignal;
exports.deactivate = deactivate;

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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let busySignalProvider = null;
// eslint-disable-next-line nuclide-internal/no-cross-atom-imports
function activate() {
  busySignalProvider = new (_nuclideBusySignal || _load_nuclideBusySignal()).DedupedBusySignalProviderBase();
}

function createAutocompleteProvider() {
  return {
    selector: '.source.python',
    disableForSelector: '.source.python .comment, .source.python .string',
    inclusionPriority: 5,
    suggestionPriority: 5, // Higher than the snippets provider.
    getSuggestions: function (request) {
      return (_AutocompleteHelpers || _load_AutocompleteHelpers()).default.getAutocompleteSuggestions(request);
    }
  };
}

function provideOutlines() {
  return {
    grammarScopes: Array.from((_constants || _load_constants()).GRAMMAR_SET),
    priority: 1,
    name: 'Python',
    getOutline: function (editor) {
      return (_OutlineHelpers || _load_OutlineHelpers()).default.getOutline(editor);
    }
  };
}

function provideDefinitions() {
  return {
    grammarScopes: Array.from((_constants || _load_constants()).GRAMMAR_SET),
    priority: 20,
    name: 'PythonDefinitionProvider',
    getDefinition: function (editor, position) {
      return (_DefinitionHelpers || _load_DefinitionHelpers()).default.getDefinition(editor, position);
    },
    getDefinitionById: function (filePath, id) {
      return (_DefinitionHelpers || _load_DefinitionHelpers()).default.getDefinitionById(filePath, id);
    }
  };
}

function provideReferences() {
  return {
    isEditorSupported: (() => {
      var _ref = (0, _asyncToGenerator.default)(function* (textEditor) {
        const fileUri = textEditor.getPath();
        if (!fileUri || !(_constants || _load_constants()).GRAMMAR_SET.has(textEditor.getGrammar().scopeName)) {
          return false;
        }
        return true;
      });

      return function isEditorSupported(_x) {
        return _ref.apply(this, arguments);
      };
    })(),
    findReferences: function (editor, position) {
      return (_ReferenceHelpers || _load_ReferenceHelpers()).default.getReferences(editor, position);
    }
  };
}

function provideCodeFormat() {
  return {
    selector: 'source.python',
    inclusionPriority: 1,
    formatEntireFile: function (editor, range) {
      if (!busySignalProvider) {
        throw new Error('Invariant violation: "busySignalProvider"');
      }

      return busySignalProvider.reportBusy(`Python: formatting \`${ editor.getTitle() }\``, () => (_CodeFormatHelpers || _load_CodeFormatHelpers()).default.formatEntireFile(editor, range));
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
    lint: function (editor) {
      if (!busySignalProvider) {
        throw new Error('Invariant violation: "busySignalProvider"');
      }

      return busySignalProvider.reportBusy(`Python: Waiting for flake8 lint results for \`${ editor.getTitle() }\``, () => (_LintHelpers || _load_LintHelpers()).default.lint(editor));
    }
  };
}

function provideBusySignal() {
  if (!busySignalProvider) {
    throw new Error('Invariant violation: "busySignalProvider"');
  }

  return busySignalProvider;
}

function deactivate() {}