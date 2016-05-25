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
exports.deactivate = deactivate;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

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

function activate() {}

function createAutocompleteProvider() {
  return {
    selector: '.source.python',
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

function deactivate() {}