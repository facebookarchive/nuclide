"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.activate = activate;
exports.createAutocompleteProvider = createAutocompleteProvider;
exports.createTypeHintProvider = createTypeHintProvider;
exports.provideDefinitions = provideDefinitions;
exports.provideCodeFormat = provideCodeFormat;
exports.provideLinter = provideLinter;
exports.provideOutlineView = provideOutlineView;
exports.provideDeclarationInfo = provideDeclarationInfo;
exports.provideRelatedFiles = provideRelatedFiles;
exports.provideFileFamily = provideFileFamily;
exports.consumeClangConfigurationProvider = consumeClangConfigurationProvider;
exports.provideCodeActions = provideCodeActions;
exports.deactivate = deactivate;

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _AutocompleteHelpers() {
  const data = _interopRequireDefault(require("./AutocompleteHelpers"));

  _AutocompleteHelpers = function () {
    return data;
  };

  return data;
}

function _CodeActions() {
  const data = _interopRequireDefault(require("./CodeActions"));

  _CodeActions = function () {
    return data;
  };

  return data;
}

function _CodeFormatHelpers() {
  const data = _interopRequireDefault(require("./CodeFormatHelpers"));

  _CodeFormatHelpers = function () {
    return data;
  };

  return data;
}

function _DefinitionHelpers() {
  const data = _interopRequireDefault(require("./DefinitionHelpers"));

  _DefinitionHelpers = function () {
    return data;
  };

  return data;
}

function _OutlineViewHelpers() {
  const data = _interopRequireDefault(require("./OutlineViewHelpers"));

  _OutlineViewHelpers = function () {
    return data;
  };

  return data;
}

function _TypeHintHelpers() {
  const data = _interopRequireDefault(require("./TypeHintHelpers"));

  _TypeHintHelpers = function () {
    return data;
  };

  return data;
}

function _ClangLinter() {
  const data = _interopRequireDefault(require("./ClangLinter"));

  _ClangLinter = function () {
    return data;
  };

  return data;
}

function _constants() {
  const data = require("./constants");

  _constants = function () {
    return data;
  };

  return data;
}

function _libclang() {
  const data = require("./libclang");

  _libclang = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */
let subscriptions = null;

function activate() {
  subscriptions = new (_UniversalDisposable().default)(); // Provide a 'Clean and rebuild' command to restart the Clang server for the current file
  // and reset all compilation flags. Useful when BUCK targets or headers change,
  // since those are heavily cached for performance. Also great for testing!

  subscriptions.add(atom.commands.add('atom-workspace', 'nuclide-clang:clean-and-rebuild', async () => {
    const editor = atom.workspace.getActiveTextEditor();

    if (editor == null) {
      return;
    }

    const path = editor.getPath();

    if (path == null) {
      return;
    }

    await (0, _libclang().resetForSource)(editor); // Save the file to trigger compilation.

    await editor.save();
  }));
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
    suggestionPriority: 5,

    // Higher than the snippets provider.
    getSuggestions(request) {
      return _AutocompleteHelpers().default.getAutocompleteSuggestions(request);
    }

  };
}

function createTypeHintProvider() {
  return {
    inclusionPriority: 1,
    providerName: _constants().PACKAGE_NAME,
    selector: Array.from(_constants().GRAMMAR_SET).join(', '),

    typeHint(editor, position) {
      return _TypeHintHelpers().default.typeHint(editor, position);
    }

  };
}

function provideDefinitions() {
  return {
    name: _constants().PACKAGE_NAME,
    priority: 20,
    grammarScopes: _constants().GRAMMARS,
    wordRegExp: null,

    getDefinition(editor, position) {
      return _DefinitionHelpers().default.getDefinition(editor, position);
    }

  };
}

function provideCodeFormat() {
  return {
    grammarScopes: Array.from(_constants().GRAMMAR_SET),
    priority: 1,

    formatEntireFile(editor, range) {
      return _CodeFormatHelpers().default.formatEntireFile(editor, range);
    }

  };
}

function provideLinter() {
  return {
    grammarScopes: Array.from(_constants().GRAMMAR_SET),
    scope: 'file',
    lintOnFly: false,
    name: 'Clang',
    lint: editor => _ClangLinter().default.lint(editor)
  };
}

function provideOutlineView() {
  return {
    name: _constants().PACKAGE_NAME,
    priority: 10,
    grammarScopes: Array.from(_constants().GRAMMAR_SET),
    updateOnEdit: false,

    getOutline(editor) {
      return _OutlineViewHelpers().default.getOutline(editor);
    }

  };
}

function provideDeclarationInfo() {
  return {
    getDeclarationInfo: _libclang().getDeclarationInfo
  };
}

function provideRelatedFiles() {
  return {
    getRelatedFiles(filePath) {
      return (0, _libclang().getRelatedSourceOrHeader)(filePath).then(related => related == null ? [] : [related]);
    }

  };
}

function provideFileFamily() {
  return {
    async getRelatedFiles(filePath) {
      const relatedSourceOrHeader = await (0, _libclang().getRelatedSourceOrHeader)(filePath);

      if (relatedSourceOrHeader == null) {
        return {
          files: new Map(),
          relations: []
        };
      }

      return {
        files: new Map([[filePath, {
          labels: new Set()
        }], [relatedSourceOrHeader, {
          labels: new Set()
        }]]),
        relations: [{
          from: filePath,
          to: relatedSourceOrHeader,
          labels: new Set(['alternate']),
          directed: true
        }]
      };
    }

  };
}

function consumeClangConfigurationProvider(provider) {
  return (0, _libclang().registerClangProvider)(provider);
}

function provideCodeActions() {
  return {
    grammarScopes: Array.from(_constants().GRAMMAR_SET),
    priority: 1,

    getCodeActions(editor, range, diagnostics) {
      return _CodeActions().default.getCodeActions(editor, range, diagnostics);
    }

  };
}

function deactivate() {
  if (subscriptions != null) {
    subscriptions.dispose();
    subscriptions = null;
  }
}