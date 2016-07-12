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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

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

var _commonsAtomProjects2;

function _commonsAtomProjects() {
  return _commonsAtomProjects2 = require('../../commons-atom/projects');
}

var _AutocompleteProvider2;

function _AutocompleteProvider() {
  return _AutocompleteProvider2 = _interopRequireDefault(require('./AutocompleteProvider'));
}

var HACK_GRAMMARS_STRING = (_nuclideHackCommon2 || _nuclideHackCommon()).HACK_GRAMMARS.join(', ');
var PACKAGE_NAME = 'nuclide-hack';

var subscriptions = null;
var hackDiagnosticsProvider = undefined;
var busySignalProvider = undefined;
var coverageProvider = null;
var definitionProvider = null;

function activate() {
  var _require = require('./HackLanguage');

  var getCachedHackLanguageForUri = _require.getCachedHackLanguageForUri;

  subscriptions = new (_atom2 || _atom()).CompositeDisposable();
  subscriptions.add((0, (_commonsAtomProjects2 || _commonsAtomProjects()).onDidRemoveProjectPath)(function (projectPath) {
    var hackLanguage = getCachedHackLanguageForUri(projectPath);
    if (hackLanguage) {
      hackLanguage.dispose();
    }
    if (hackDiagnosticsProvider) {
      hackDiagnosticsProvider.invalidateProjectPath(projectPath);
    }
  }));
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
  var CodeFormatProvider = require('./CodeFormatProvider');
  var codeFormatProvider = new CodeFormatProvider();

  return {
    selector: HACK_GRAMMARS_STRING,
    inclusionPriority: 1,

    formatCode: function formatCode(editor, range) {
      return codeFormatProvider.formatCode(editor, range);
    }
  };
}

function createFindReferencesProvider() {
  return require('./FindReferencesProvider');
}

function createTypeHintProvider() {
  var TypeHintProvider = require('./TypeHintProvider');
  var typeHintProvider = new TypeHintProvider();

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
  var _require2 = require('./HackEvaluationExpressionProvider');

  var HackEvaluationExpressionProvider = _require2.HackEvaluationExpressionProvider;

  var evaluationExpressionProvider = new HackEvaluationExpressionProvider();
  var getEvaluationExpression = evaluationExpressionProvider.getEvaluationExpression.bind(evaluationExpressionProvider);
  return {
    selector: HACK_GRAMMARS_STRING,
    name: PACKAGE_NAME,
    getEvaluationExpression: getEvaluationExpression
  };
}

function provideDiagnostics() {
  if (!hackDiagnosticsProvider) {
    var HackDiagnosticsProvider = require('./HackDiagnosticsProvider');
    var busyProvider = provideBusySignal();
    hackDiagnosticsProvider = new HackDiagnosticsProvider(false, busyProvider);
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
    var _require3 = require('../../nuclide-busy-signal');

    var BusySignalProviderBase = _require3.BusySignalProviderBase;

    busySignalProvider = new BusySignalProviderBase();
  }
  return busySignalProvider;
}

function provideCoverage() {
  return {
    displayName: 'Hack',
    priority: 10,
    grammarScopes: (_nuclideHackCommon2 || _nuclideHackCommon()).HACK_GRAMMARS,
    getCoverage: function getCoverage(path) {
      return getTypeCoverageProvider().getTypeCoverage(path);
    }
  };
}

function getTypeCoverageProvider() {
  if (coverageProvider == null) {
    coverageProvider = new (_TypeCoverageProvider2 || _TypeCoverageProvider()).TypeCoverageProvider(provideBusySignal());
  }
  return coverageProvider;
}

function provideDefinitions() {
  if (definitionProvider == null) {
    definitionProvider = new (_HackDefinitionProvider2 || _HackDefinitionProvider()).HackDefinitionProvider();
  }
  return definitionProvider;
}