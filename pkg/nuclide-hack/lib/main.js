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
exports.getHyperclickProvider = getHyperclickProvider;
exports.createCodeFormatProvider = createCodeFormatProvider;
exports.createFindReferencesProvider = createFindReferencesProvider;
exports.createTypeHintProvider = createTypeHintProvider;
exports.createCodeHighlightProvider = createCodeHighlightProvider;
exports.createEvaluationExpressionProvider = createEvaluationExpressionProvider;
exports.provideDiagnostics = provideDiagnostics;
exports.deactivate = deactivate;
exports.provideOutlines = provideOutlines;

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

var _config2;

function _config() {
  return _config2 = require('./config');
}

var _TypeCoverageProvider2;

function _TypeCoverageProvider() {
  return _TypeCoverageProvider2 = require('./TypeCoverageProvider');
}

var _OutlineViewProvider2;

function _OutlineViewProvider() {
  return _OutlineViewProvider2 = require('./OutlineViewProvider');
}

var _nuclideFeatureConfig2;

function _nuclideFeatureConfig() {
  return _nuclideFeatureConfig2 = require('../../nuclide-feature-config');
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var HACK_GRAMMARS_STRING = (_nuclideHackCommon2 || _nuclideHackCommon()).HACK_GRAMMARS.join(', ');
var PACKAGE_NAME = 'nuclide-hack';

var subscriptions = null;
var hackDiagnosticsProvider = undefined;
var busySignalProvider = undefined;
var hackTypeCoverageProviderSubscription = null;
var coverageProvider = null;

function activate() {
  var _require = require('./HackLanguage');

  var getCachedHackLanguageForUri = _require.getCachedHackLanguageForUri;

  var _require2 = require('../../nuclide-atom-helpers');

  var projects = _require2.projects;

  subscriptions = new (_atom2 || _atom()).CompositeDisposable();
  subscriptions.add(projects.onDidRemoveProjectPath(function (projectPath) {
    var hackLanguage = getCachedHackLanguageForUri(projectPath);
    if (hackLanguage) {
      hackLanguage.dispose();
    }
    if (hackDiagnosticsProvider) {
      hackDiagnosticsProvider.invalidateProjectPath(projectPath);
    }
  }));
  subscriptions.add((0, (_nuclideFeatureConfig2 || _nuclideFeatureConfig()).onDidChange)((_config2 || _config()).SHOW_TYPE_COVERAGE_CONFIG_PATH, function (delta) {
    if (delta.newValue) {
      enableCoverageProvider();
    } else {
      disableCoverageProvider();
    }
  }));
  subscriptions.add(atom.commands.add('atom-workspace', 'nuclide-hack:toggle-type-coverage', toggleTypeCoverage));

  if ((0, (_config2 || _config()).getShowTypeCoverage)()) {
    enableCoverageProvider();
  }
}

/** Provider for autocomplete service. */

function createAutocompleteProvider() {
  var AutocompleteProvider = require('./AutocompleteProvider');
  var autocompleteProvider = new AutocompleteProvider();

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

function getHyperclickProvider() {
  var HackHyperclickProvider = require('./HyperclickProvider').HyperclickProvider;
  var hackHyperclickProvider = new HackHyperclickProvider();
  var getSuggestion = hackHyperclickProvider.getSuggestion.bind(hackHyperclickProvider);
  return {
    priority: 20,
    providerName: PACKAGE_NAME,
    getSuggestion: getSuggestion
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
  var _require3 = require('./HackEvaluationExpressionProvider');

  var HackEvaluationExpressionProvider = _require3.HackEvaluationExpressionProvider;

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
  disableCoverageProvider();
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
    var _require4 = require('../../nuclide-busy-signal');

    var BusySignalProviderBase = _require4.BusySignalProviderBase;

    busySignalProvider = new BusySignalProviderBase();
  }
  return busySignalProvider;
}

function enableCoverageProvider() {
  if (coverageProvider == null) {
    coverageProvider = new (_TypeCoverageProvider2 || _TypeCoverageProvider()).TypeCoverageProvider(provideBusySignal());
    (0, (_assert2 || _assert()).default)(hackTypeCoverageProviderSubscription == null);
    hackTypeCoverageProviderSubscription = atom.packages.serviceHub.provide('nuclide-diagnostics-provider', '0.1.0', coverageProvider);
  }
}

function disableCoverageProvider() {
  if (hackTypeCoverageProviderSubscription != null) {
    hackTypeCoverageProviderSubscription.dispose();
    hackTypeCoverageProviderSubscription = null;
  }
  if (coverageProvider != null) {
    coverageProvider.dispose();
    coverageProvider = null;
  }
}

function toggleTypeCoverage() {
  (0, (_config2 || _config()).setShowTypeCoverage)(!(0, (_config2 || _config()).getShowTypeCoverage)());
}