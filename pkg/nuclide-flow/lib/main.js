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
exports.provideBusySignal = provideBusySignal;
exports.provideDiagnostics = provideDiagnostics;
exports.provideOutlines = provideOutlines;
exports.createTypeHintProvider = createTypeHintProvider;
exports.createCoverageProvider = createCoverageProvider;
exports.createEvaluationExpressionProvider = createEvaluationExpressionProvider;
exports.deactivate = deactivate;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert;

function _load_assert() {
  return _assert = _interopRequireDefault(require('assert'));
}

var _atom;

function _load_atom() {
  return _atom = require('atom');
}

var _commonsAtomFeatureConfig;

function _load_commonsAtomFeatureConfig() {
  return _commonsAtomFeatureConfig = _interopRequireDefault(require('../../commons-atom/featureConfig'));
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _commonsAtomRegisterGrammar;

function _load_commonsAtomRegisterGrammar() {
  return _commonsAtomRegisterGrammar = _interopRequireDefault(require('../../commons-atom/register-grammar'));
}

var _commonsAtomProjects;

function _load_commonsAtomProjects() {
  return _commonsAtomProjects = require('../../commons-atom/projects');
}

var _FlowServiceWatcher;

function _load_FlowServiceWatcher() {
  return _FlowServiceWatcher = require('./FlowServiceWatcher');
}

var _FlowAutocompleteProvider;

function _load_FlowAutocompleteProvider() {
  return _FlowAutocompleteProvider = _interopRequireDefault(require('./FlowAutocompleteProvider'));
}

var _FlowHyperclickProvider;

function _load_FlowHyperclickProvider() {
  return _FlowHyperclickProvider = _interopRequireDefault(require('./FlowHyperclickProvider'));
}

// eslint-disable-next-line nuclide-internal/no-cross-atom-imports

var _nuclideBusySignal;

function _load_nuclideBusySignal() {
  return _nuclideBusySignal = require('../../nuclide-busy-signal');
}

var _FlowDiagnosticsProvider;

function _load_FlowDiagnosticsProvider() {
  return _FlowDiagnosticsProvider = _interopRequireDefault(require('./FlowDiagnosticsProvider'));
}

var _FlowOutlineProvider;

function _load_FlowOutlineProvider() {
  return _FlowOutlineProvider = require('./FlowOutlineProvider');
}

var _FlowTypeHintProvider;

function _load_FlowTypeHintProvider() {
  return _FlowTypeHintProvider = require('./FlowTypeHintProvider');
}

var _FlowEvaluationExpressionProvider;

function _load_FlowEvaluationExpressionProvider() {
  return _FlowEvaluationExpressionProvider = require('./FlowEvaluationExpressionProvider');
}

var _FlowServiceFactory;

function _load_FlowServiceFactory() {
  return _FlowServiceFactory = require('./FlowServiceFactory');
}

var _FlowCoverageProvider;

function _load_FlowCoverageProvider() {
  return _FlowCoverageProvider = require('./FlowCoverageProvider');
}

var _constants;

function _load_constants() {
  return _constants = require('./constants');
}

var GRAMMARS_STRING = (_constants || _load_constants()).JS_GRAMMARS.join(', ');
var diagnosticsOnFlySetting = 'nuclide-flow.diagnosticsOnFly';

var PACKAGE_NAME = 'nuclide-flow';

var busySignalProvider = undefined;

var flowDiagnosticsProvider = undefined;

var disposables = undefined;

function activate() {
  if (!disposables) {
    disposables = new (_atom || _load_atom()).CompositeDisposable();

    var watcher = new (_FlowServiceWatcher || _load_FlowServiceWatcher()).FlowServiceWatcher();
    disposables.add(watcher);

    disposables.add(atom.commands.add(atom.views.getView(atom.workspace), 'nuclide-flow:restart-flow-server', allowFlowServerRestart));

    (0, (_commonsAtomRegisterGrammar || _load_commonsAtomRegisterGrammar()).default)('source.ini', '.flowconfig');
  }
}

/** Provider for autocomplete service. */

function createAutocompleteProvider() {
  var excludeLowerPriority = Boolean((_commonsAtomFeatureConfig || _load_commonsAtomFeatureConfig()).default.get('nuclide-flow.excludeOtherAutocomplete'));

  return {
    selector: (_constants || _load_constants()).JS_GRAMMARS.map(function (grammar) {
      return '.' + grammar;
    }).join(', '),
    disableForSelector: '.source.js .comment',
    inclusionPriority: 1,
    // We want to get ranked higher than the snippets provider.
    suggestionPriority: 5,
    onDidInsertSuggestion: function onDidInsertSuggestion() {
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('nuclide-flow.autocomplete-chosen');
    },
    excludeLowerPriority: excludeLowerPriority,
    getSuggestions: function getSuggestions(request) {
      return (_FlowAutocompleteProvider || _load_FlowAutocompleteProvider()).default.getSuggestions(request);
    }
  };
}

function getHyperclickProvider() {
  var flowHyperclickProvider = new (_FlowHyperclickProvider || _load_FlowHyperclickProvider()).default();
  var getSuggestionForWord = flowHyperclickProvider.getSuggestionForWord.bind(flowHyperclickProvider);
  return {
    wordRegExp: (_constants || _load_constants()).JAVASCRIPT_WORD_REGEX,
    priority: 20,
    providerName: PACKAGE_NAME,
    getSuggestionForWord: getSuggestionForWord
  };
}

function provideBusySignal() {
  if (!busySignalProvider) {
    busySignalProvider = new (_nuclideBusySignal || _load_nuclideBusySignal()).DedupedBusySignalProviderBase();
  }
  return busySignalProvider;
}

function provideDiagnostics() {
  if (!flowDiagnosticsProvider) {
    var busyProvider = this.provideBusySignal();
    var runOnTheFly = (_commonsAtomFeatureConfig || _load_commonsAtomFeatureConfig()).default.get(diagnosticsOnFlySetting);
    flowDiagnosticsProvider = new (_FlowDiagnosticsProvider || _load_FlowDiagnosticsProvider()).default(runOnTheFly, busyProvider);
    (0, (_assert || _load_assert()).default)(disposables);
    disposables.add((0, (_commonsAtomProjects || _load_commonsAtomProjects()).onDidRemoveProjectPath)(function (projectPath) {
      (0, (_assert || _load_assert()).default)(flowDiagnosticsProvider);
      flowDiagnosticsProvider.invalidateProjectPath(projectPath);
    }));
  }
  return flowDiagnosticsProvider;
}

function provideOutlines() {
  var provider = new (_FlowOutlineProvider || _load_FlowOutlineProvider()).FlowOutlineProvider();
  return {
    grammarScopes: (_constants || _load_constants()).JS_GRAMMARS,
    priority: 1,
    name: 'Flow',
    getOutline: provider.getOutline.bind(provider)
  };
}

function createTypeHintProvider() {
  var flowTypeHintProvider = new (_FlowTypeHintProvider || _load_FlowTypeHintProvider()).FlowTypeHintProvider();
  var typeHint = flowTypeHintProvider.typeHint.bind(flowTypeHintProvider);
  return {
    selector: GRAMMARS_STRING,
    providerName: PACKAGE_NAME,
    inclusionPriority: 1,
    typeHint: typeHint
  };
}

function createCoverageProvider() {
  return {
    displayName: 'Flow',
    priority: 10,
    grammarScopes: (_constants || _load_constants()).JS_GRAMMARS,
    getCoverage: function getCoverage(path) {
      return (0, (_FlowCoverageProvider || _load_FlowCoverageProvider()).getCoverage)(path);
    }
  };
}

function createEvaluationExpressionProvider() {
  var evaluationExpressionProvider = new (_FlowEvaluationExpressionProvider || _load_FlowEvaluationExpressionProvider()).FlowEvaluationExpressionProvider();
  var getEvaluationExpression = evaluationExpressionProvider.getEvaluationExpression.bind(evaluationExpressionProvider);
  return {
    selector: GRAMMARS_STRING,
    name: PACKAGE_NAME,
    getEvaluationExpression: getEvaluationExpression
  };
}

function deactivate() {
  // TODO(mbolin): Find a way to unregister the autocomplete provider from
  // ServiceHub, or set a boolean in the autocomplete provider to always return

  var service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getServiceByNuclideUri)('FlowService');
  (0, (_assert || _load_assert()).default)(service);
  service.dispose();
  if (disposables) {
    disposables.dispose();
    disposables = null;
  }
  if (flowDiagnosticsProvider) {
    flowDiagnosticsProvider.dispose();
    flowDiagnosticsProvider = null;
  }
}

function allowFlowServerRestart() {
  for (var service of (0, (_FlowServiceFactory || _load_FlowServiceFactory()).getCurrentServiceInstances)()) {
    service.allowServerRestart();
  }
}
// empty results.