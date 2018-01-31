'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

exports.activate = activate;
exports.createAutocompleteProvider = createAutocompleteProvider;
exports.createTypeHintProvider = createTypeHintProvider;
exports.provideDefinitions = provideDefinitions;
exports.provideCodeFormat = provideCodeFormat;
exports.provideLinter = provideLinter;
exports.provideOutlineView = provideOutlineView;
exports.provideRefactoring = provideRefactoring;
exports.provideDeclarationInfo = provideDeclarationInfo;
exports.provideRelatedFiles = provideRelatedFiles;
exports.consumeClangConfigurationProvider = consumeClangConfigurationProvider;
exports.provideCodeActions = provideCodeActions;
exports.deactivate = deactivate;

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('nuclide-commons-atom/feature-config'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _AutocompleteHelpers;

function _load_AutocompleteHelpers() {
  return _AutocompleteHelpers = _interopRequireDefault(require('./AutocompleteHelpers'));
}

var _CodeActions;

function _load_CodeActions() {
  return _CodeActions = _interopRequireDefault(require('./CodeActions'));
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let subscriptions = null; /**
                           * Copyright (c) 2015-present, Facebook, Inc.
                           * All rights reserved.
                           *
                           * This source code is licensed under the license found in the LICENSE file in
                           * the root directory of this source tree.
                           *
                           * 
                           * @format
                           */

function activate() {
  subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default();
  // Provide a 'Clean and rebuild' command to restart the Clang server for the current file
  // and reset all compilation flags. Useful when BUCK targets or headers change,
  // since those are heavily cached for performance. Also great for testing!
  subscriptions.add(atom.commands.add('atom-workspace', 'nuclide-clang:clean-and-rebuild', (0, _asyncToGenerator.default)(function* () {
    const editor = atom.workspace.getActiveTextEditor();
    if (editor == null) {
      return;
    }
    const path = editor.getPath();
    if (path == null) {
      return;
    }
    yield (0, (_libclang || _load_libclang()).resetForSource)(editor);
    // Save the file to trigger compilation.
    yield editor.save();
  })));
  if ((_featureConfig || _load_featureConfig()).default.get('nuclide-cquery-lsp.use-cquery')) {
    const deactivateSelf = () => {
      if (atom.packages.isPackageActive((_constants || _load_constants()).PACKAGE_NAME)) {
        atom.packages.deactivatePackage((_constants || _load_constants()).PACKAGE_NAME);
      }
    };
    if (subscriptions != null) {
      subscriptions.add(atom.packages.onDidActivatePackage(deactivateSelf));
      deactivateSelf();
    }
  }
}

/** Provider for autocomplete service. */
function createAutocompleteProvider() {
  return {
    analytics: {
      eventName: 'nuclide-clang',
      shouldLogInsertedSuggestion: false
    },
    selector: '.source.objc, .source.objcpp, .source.cpp, .source.c',
    inclusionPriority: 1,
    suggestionPriority: 5, // Higher than the snippets provider.
    getSuggestions(request) {
      return (_AutocompleteHelpers || _load_AutocompleteHelpers()).default.getAutocompleteSuggestions(request);
    }
  };
}

function createTypeHintProvider() {
  return {
    inclusionPriority: 1,
    providerName: (_constants || _load_constants()).PACKAGE_NAME,
    selector: Array.from((_constants || _load_constants()).GRAMMAR_SET).join(', '),
    typeHint(editor, position) {
      return (_TypeHintHelpers || _load_TypeHintHelpers()).default.typeHint(editor, position);
    }
  };
}

function provideDefinitions() {
  return {
    name: (_constants || _load_constants()).PACKAGE_NAME,
    priority: 20,
    grammarScopes: (_constants || _load_constants()).GRAMMARS,
    getDefinition(editor, position) {
      return (_DefinitionHelpers || _load_DefinitionHelpers()).default.getDefinition(editor, position);
    }
  };
}

function provideCodeFormat() {
  return {
    grammarScopes: Array.from((_constants || _load_constants()).GRAMMAR_SET),
    priority: 1,
    formatEntireFile(editor, range) {
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
    lint: editor => (_ClangLinter || _load_ClangLinter()).default.lint(editor)
  };
}

function provideOutlineView() {
  return {
    name: (_constants || _load_constants()).PACKAGE_NAME,
    priority: 10,
    grammarScopes: Array.from((_constants || _load_constants()).GRAMMAR_SET),
    updateOnEdit: false,
    getOutline(editor) {
      return (_OutlineViewHelpers || _load_OutlineViewHelpers()).default.getOutline(editor);
    }
  };
}

function provideRefactoring() {
  return {
    grammarScopes: Array.from((_constants || _load_constants()).GRAMMAR_SET),
    priority: 1,
    refactorings(editor, range) {
      return (_Refactoring || _load_Refactoring()).default.refactorings(editor, range);
    },
    refactor(request) {
      return (_Refactoring || _load_Refactoring()).default.refactor(request);
    }
  };
}

function provideDeclarationInfo() {
  return {
    getDeclarationInfo: (_libclang || _load_libclang()).getDeclarationInfo
  };
}

function provideRelatedFiles() {
  return {
    getRelatedFiles(filePath) {
      return (0, (_libclang || _load_libclang()).getRelatedSourceOrHeader)(filePath).then(related => related == null ? [] : [related]);
    }
  };
}

function consumeClangConfigurationProvider(provider) {
  return (0, (_libclang || _load_libclang()).registerClangProvider)(provider);
}

function provideCodeActions() {
  return {
    grammarScopes: Array.from((_constants || _load_constants()).GRAMMAR_SET),
    priority: 1,
    getCodeActions(editor, range, diagnostics) {
      return (_CodeActions || _load_CodeActions()).default.getCodeActions(editor, range, diagnostics);
    }
  };
}

function deactivate() {
  if (subscriptions != null) {
    subscriptions.dispose();
    subscriptions = null;
  }
}