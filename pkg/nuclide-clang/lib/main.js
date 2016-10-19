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
exports.createTypeHintProvider = createTypeHintProvider;
exports.provideDefinitions = provideDefinitions;
exports.provideBusySignal = provideBusySignal;
exports.provideCodeFormat = provideCodeFormat;
exports.provideLinter = provideLinter;
exports.provideOutlineView = provideOutlineView;
exports.provideRefactoring = provideRefactoring;
exports.deactivate = deactivate;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert;

function _load_assert() {
  return _assert = _interopRequireDefault(require('assert'));
}

var _atom;

function _load_atom() {
  return _atom = require('atom');
}

// eslint-disable-next-line nuclide-internal/no-cross-atom-imports

var _nuclideBusySignal;

function _load_nuclideBusySignal() {
  return _nuclideBusySignal = require('../../nuclide-busy-signal');
}

var _AutocompleteHelpers;

function _load_AutocompleteHelpers() {
  return _AutocompleteHelpers = _interopRequireDefault(require('./AutocompleteHelpers'));
}

var _CodeFormatHelpers;

function _load_CodeFormatHelpers() {
  return _CodeFormatHelpers = _interopRequireDefault(require('./CodeFormatHelpers'));
}

var _DefinitionHelpers;

function _load_DefinitionHelpers() {
  return _DefinitionHelpers = _interopRequireDefault(require('./DefinitionHelpers'));
}

var _OutlineViewHelpers;

function _load_OutlineViewHelpers() {
  return _OutlineViewHelpers = _interopRequireDefault(require('./OutlineViewHelpers'));
}

var _TypeHintHelpers;

function _load_TypeHintHelpers() {
  return _TypeHintHelpers = _interopRequireDefault(require('./TypeHintHelpers'));
}

var _Refactoring;

function _load_Refactoring() {
  return _Refactoring = _interopRequireDefault(require('./Refactoring'));
}

var _ClangLinter;

function _load_ClangLinter() {
  return _ClangLinter = _interopRequireDefault(require('./ClangLinter'));
}

var _constants;

function _load_constants() {
  return _constants = require('./constants');
}

var _libclang;

function _load_libclang() {
  return _libclang = require('./libclang');
}

var busySignalProvider = null;
var subscriptions = null;

function activate() {
  subscriptions = new (_atom || _load_atom()).CompositeDisposable();
  // Provide a 'Clean and rebuild' command to restart the Clang server for the current file
  // and reset all compilation flags. Useful when BUCK targets or headers change,
  // since those are heavily cached for performance. Also great for testing!
  subscriptions.add(atom.commands.add('atom-workspace', 'nuclide-clang:clean-and-rebuild', _asyncToGenerator(function* () {
    var editor = atom.workspace.getActiveTextEditor();
    if (editor == null) {
      return;
    }
    var path = editor.getPath();
    if (path == null) {
      return;
    }
    yield (0, (_libclang || _load_libclang()).reset)(editor);
  })));

  busySignalProvider = new (_nuclideBusySignal || _load_nuclideBusySignal()).BusySignalProviderBase();
}

/** Provider for autocomplete service. */

function createAutocompleteProvider() {
  return {
    selector: '.source.objc, .source.objcpp, .source.cpp, .source.c',
    inclusionPriority: 1,
    suggestionPriority: 5, // Higher than the snippets provider.
    getSuggestions: function getSuggestions(request) {
      return (_AutocompleteHelpers || _load_AutocompleteHelpers()).default.getAutocompleteSuggestions(request);
    }
  };
}

function createTypeHintProvider() {
  return {
    inclusionPriority: 1,
    providerName: (_constants || _load_constants()).PACKAGE_NAME,
    selector: Array.from((_constants || _load_constants()).GRAMMAR_SET).join(', '),
    typeHint: function typeHint(editor, position) {
      return (_TypeHintHelpers || _load_TypeHintHelpers()).default.typeHint(editor, position);
    }
  };
}

function provideDefinitions() {
  return {
    name: (_constants || _load_constants()).PACKAGE_NAME,
    priority: 20,
    grammarScopes: (_constants || _load_constants()).GRAMMARS,
    getDefinition: function getDefinition(editor, position) {
      return (_DefinitionHelpers || _load_DefinitionHelpers()).default.getDefinition(editor, position);
    },
    getDefinitionById: function getDefinitionById(filePath, id) {
      return (_DefinitionHelpers || _load_DefinitionHelpers()).default.getDefinitionById(filePath, id);
    }
  };
}

function provideBusySignal() {
  (0, (_assert || _load_assert()).default)(busySignalProvider);
  return busySignalProvider;
}

function provideCodeFormat() {
  return {
    selector: Array.from((_constants || _load_constants()).GRAMMAR_SET).join(', '),
    inclusionPriority: 1,
    formatEntireFile: function formatEntireFile(editor, range) {
      return (_CodeFormatHelpers || _load_CodeFormatHelpers()).default.formatEntireFile(editor, range);
    }
  };
}

function provideLinter() {
  return {
    grammarScopes: Array.from((_constants || _load_constants()).GRAMMAR_SET),
    scope: 'file',
    lintOnFly: false,
    name: 'Clang',
    invalidateOnClose: true,
    lint: function lint(editor) {
      var getResult = function getResult() {
        return (_ClangLinter || _load_ClangLinter()).default.lint(editor);
      };
      if (busySignalProvider) {
        return busySignalProvider.reportBusy('Clang: compiling `' + editor.getTitle() + '`', getResult);
      }
      return getResult();
    }
  };
}

function provideOutlineView() {
  return {
    name: (_constants || _load_constants()).PACKAGE_NAME,
    priority: 10,
    grammarScopes: Array.from((_constants || _load_constants()).GRAMMAR_SET),
    updateOnEdit: false,
    getOutline: function getOutline(editor) {
      return (_OutlineViewHelpers || _load_OutlineViewHelpers()).default.getOutline(editor);
    }
  };
}

function provideRefactoring() {
  return {
    grammarScopes: Array.from((_constants || _load_constants()).GRAMMAR_SET),
    priority: 1,
    refactoringsAtPoint: function refactoringsAtPoint(editor, point) {
      return (_Refactoring || _load_Refactoring()).default.refactoringsAtPoint(editor, point);
    },
    refactor: function refactor(request) {
      return (_Refactoring || _load_Refactoring()).default.refactor(request);
    }
  };
}

function deactivate() {
  if (subscriptions != null) {
    subscriptions.dispose();
    subscriptions = null;
  }
}