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
exports.createCodeFormatProvider = createCodeFormatProvider;
exports.createFindReferencesProvider = createFindReferencesProvider;
exports.createTypeHintProvider = createTypeHintProvider;
exports.createCodeHighlightProvider = createCodeHighlightProvider;
exports.createEvaluationExpressionProvider = createEvaluationExpressionProvider;
exports.provideDiagnostics = provideDiagnostics;
exports.deactivate = deactivate;
exports.provideOutlines = provideOutlines;
exports.provideCoverage = provideCoverage;
exports.provideDefinitions = provideDefinitions;
exports.registerQuickOpenProvider = registerQuickOpenProvider;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _HackSymbolProvider2;

function _HackSymbolProvider() {
  return _HackSymbolProvider2 = require('./HackSymbolProvider');
}

var _CodeHighlightProvider2;

function _CodeHighlightProvider() {
  return _CodeHighlightProvider2 = _interopRequireDefault(require('./CodeHighlightProvider'));
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _nuclideHackCommon2;

function _nuclideHackCommon() {
  return _nuclideHackCommon2 = require('../../nuclide-hack-common');
}

var _TypeCoverageProvider2;

function _TypeCoverageProvider() {
  return _TypeCoverageProvider2 = require('./TypeCoverageProvider');
}

var _OutlineViewProvider2;

function _OutlineViewProvider() {
  return _OutlineViewProvider2 = require('./OutlineViewProvider');
}

var _HackDefinitionProvider2;

function _HackDefinitionProvider() {
  return _HackDefinitionProvider2 = require('./HackDefinitionProvider');
}

var _AutocompleteProvider2;

function _AutocompleteProvider() {
  return _AutocompleteProvider2 = _interopRequireDefault(require('./AutocompleteProvider'));
}

var _FindReferencesProvider2;

function _FindReferencesProvider() {
  return _FindReferencesProvider2 = _interopRequireDefault(require('./FindReferencesProvider'));
}

var _TypeHintProvider2;

function _TypeHintProvider() {
  return _TypeHintProvider2 = _interopRequireDefault(require('./TypeHintProvider'));
}

var _HackEvaluationExpressionProvider2;

function _HackEvaluationExpressionProvider() {
  return _HackEvaluationExpressionProvider2 = require('./HackEvaluationExpressionProvider');
}

var _HackDiagnosticsProvider2;

function _HackDiagnosticsProvider() {
  return _HackDiagnosticsProvider2 = _interopRequireDefault(require('./HackDiagnosticsProvider'));
}

// eslint-disable-next-line nuclide-internal/no-cross-atom-imports

var _nuclideBusySignal2;

function _nuclideBusySignal() {
  return _nuclideBusySignal2 = require('../../nuclide-busy-signal');
}

var _CodeFormatProvider2;

function _CodeFormatProvider() {
  return _CodeFormatProvider2 = _interopRequireDefault(require('./CodeFormatProvider'));
}

var _HackLanguage2;

function _HackLanguage() {
  return _HackLanguage2 = require('./HackLanguage');
}

var HACK_GRAMMARS_STRING = (_nuclideHackCommon2 || _nuclideHackCommon()).HACK_GRAMMARS.join(', ');
var PACKAGE_NAME = 'nuclide-hack';

var subscriptions = null;
var hackDiagnosticsProvider = undefined;
var busySignalProvider = undefined;
var coverageProvider = null;
var definitionProvider = null;

function activate() {
  subscriptions = new (_atom2 || _atom()).CompositeDisposable();
  subscriptions.add(new (_atom2 || _atom()).Disposable((_HackLanguage2 || _HackLanguage()).clearHackLanguageCache));
}

/** Provider for autocomplete service. */

function createAutocompleteProvider() {
  var autocompleteProvider = new (_AutocompleteProvider2 || _AutocompleteProvider()).default();

  return {
    selector: (_nuclideHackCommon2 || _nuclideHackCommon()).HACK_GRAMMARS.map(function (grammar) {
      return '.' + grammar;
    }).join(', '),
    inclusionPriority: 1,
    // The context-sensitive hack autocompletions are more relevant than snippets.
    suggestionPriority: 3,
    excludeLowerPriority: false,

    getSuggestions: function getSuggestions(request) {
      return autocompleteProvider.getAutocompleteSuggestions(request);
    }
  };
}

/** Provider for code format service. */

function createCodeFormatProvider() {
  var codeFormatProvider = new (_CodeFormatProvider2 || _CodeFormatProvider()).default();

  return {
    selector: HACK_GRAMMARS_STRING,
    inclusionPriority: 1,

    formatCode: function formatCode(editor, range) {
      return codeFormatProvider.formatCode(editor, range);
    }
  };
}

function createFindReferencesProvider() {
  return (_FindReferencesProvider2 || _FindReferencesProvider()).default;
}

function createTypeHintProvider() {
  var typeHintProvider = new (_TypeHintProvider2 || _TypeHintProvider()).default();

  return {
    selector: HACK_GRAMMARS_STRING,
    inclusionPriority: 1,
    providerName: PACKAGE_NAME,

    typeHint: function typeHint(editor, position) {
      return typeHintProvider.typeHint(editor, position);
    }
  };
}

function createCodeHighlightProvider() {
  var codeHighlightProvider = new (_CodeHighlightProvider2 || _CodeHighlightProvider()).default();

  return {
    selector: HACK_GRAMMARS_STRING,
    inclusionPriority: 1,
    highlight: function highlight(editor, position) {
      return codeHighlightProvider.highlight(editor, position);
    }
  };
}

function createEvaluationExpressionProvider() {
  var evaluationExpressionProvider = new (_HackEvaluationExpressionProvider2 || _HackEvaluationExpressionProvider()).HackEvaluationExpressionProvider();
  var getEvaluationExpression = evaluationExpressionProvider.getEvaluationExpression.bind(evaluationExpressionProvider);
  return {
    selector: HACK_GRAMMARS_STRING,
    name: PACKAGE_NAME,
    getEvaluationExpression: getEvaluationExpression
  };
}

function provideDiagnostics() {
  if (!hackDiagnosticsProvider) {
    var busyProvider = provideBusySignal();
    hackDiagnosticsProvider = new (_HackDiagnosticsProvider2 || _HackDiagnosticsProvider()).default(false, busyProvider);
  }
  return hackDiagnosticsProvider;
}

function deactivate() {
  if (subscriptions) {
    subscriptions.dispose();
    subscriptions = null;
  }
  if (hackDiagnosticsProvider) {
    hackDiagnosticsProvider.dispose();
    hackDiagnosticsProvider = null;
  }
}

function provideOutlines() {
  var provider = new (_OutlineViewProvider2 || _OutlineViewProvider()).OutlineViewProvider();
  return {
    grammarScopes: (_nuclideHackCommon2 || _nuclideHackCommon()).HACK_GRAMMARS,
    priority: 1,
    name: 'Hack',
    getOutline: provider.getOutline.bind(provider)
  };
}

function provideBusySignal() {
  if (busySignalProvider == null) {
    busySignalProvider = new (_nuclideBusySignal2 || _nuclideBusySignal()).BusySignalProviderBase();
  }
  return busySignalProvider;
}

function provideCoverage() {
  return {
    displayName: 'Hack',
    priority: 10,
    grammarScopes: (_nuclideHackCommon2 || _nuclideHackCommon()).HACK_GRAMMARS,
    getCoverage: function getCoverage(path) {
      return getTypeCoverageProvider().getCoverage(path);
    }
  };
}

function getTypeCoverageProvider() {
  if (coverageProvider == null) {
    coverageProvider = new (_TypeCoverageProvider2 || _TypeCoverageProvider()).TypeCoverageProvider();
  }
  return coverageProvider;
}

function provideDefinitions() {
  if (definitionProvider == null) {
    definitionProvider = new (_HackDefinitionProvider2 || _HackDefinitionProvider()).HackDefinitionProvider();
  }
  return definitionProvider;
}

function registerQuickOpenProvider() {
  return (_HackSymbolProvider2 || _HackSymbolProvider()).HackSymbolProvider;
}