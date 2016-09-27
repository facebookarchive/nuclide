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

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _commonsAtomFeatureConfig2;

function _commonsAtomFeatureConfig() {
  return _commonsAtomFeatureConfig2 = _interopRequireDefault(require('../../commons-atom/featureConfig'));
}

var _nuclideRemoteConnection2;

function _nuclideRemoteConnection() {
  return _nuclideRemoteConnection2 = require('../../nuclide-remote-connection');
}

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../nuclide-analytics');
}

var _commonsAtomRegisterGrammar2;

function _commonsAtomRegisterGrammar() {
  return _commonsAtomRegisterGrammar2 = _interopRequireDefault(require('../../commons-atom/register-grammar'));
}

var _commonsAtomProjects2;

function _commonsAtomProjects() {
  return _commonsAtomProjects2 = require('../../commons-atom/projects');
}

var _FlowServiceWatcher2;

function _FlowServiceWatcher() {
  return _FlowServiceWatcher2 = require('./FlowServiceWatcher');
}

var _FlowAutocompleteProvider2;

function _FlowAutocompleteProvider() {
  return _FlowAutocompleteProvider2 = _interopRequireDefault(require('./FlowAutocompleteProvider'));
}

var _FlowHyperclickProvider2;

function _FlowHyperclickProvider() {
  return _FlowHyperclickProvider2 = _interopRequireDefault(require('./FlowHyperclickProvider'));
}

// eslint-disable-next-line nuclide-internal/no-cross-atom-imports

var _nuclideBusySignal2;

function _nuclideBusySignal() {
  return _nuclideBusySignal2 = require('../../nuclide-busy-signal');
}

var _FlowDiagnosticsProvider2;

function _FlowDiagnosticsProvider() {
  return _FlowDiagnosticsProvider2 = _interopRequireDefault(require('./FlowDiagnosticsProvider'));
}

var _FlowOutlineProvider2;

function _FlowOutlineProvider() {
  return _FlowOutlineProvider2 = require('./FlowOutlineProvider');
}

var _FlowTypeHintProvider2;

function _FlowTypeHintProvider() {
  return _FlowTypeHintProvider2 = require('./FlowTypeHintProvider');
}

var _FlowEvaluationExpressionProvider2;

function _FlowEvaluationExpressionProvider() {
  return _FlowEvaluationExpressionProvider2 = require('./FlowEvaluationExpressionProvider');
}

var _FlowServiceFactory2;

function _FlowServiceFactory() {
  return _FlowServiceFactory2 = require('./FlowServiceFactory');
}

var _FlowCoverageProvider2;

function _FlowCoverageProvider() {
  return _FlowCoverageProvider2 = require('./FlowCoverageProvider');
}

var _constants2;

function _constants() {
  return _constants2 = require('./constants');
}

var GRAMMARS_STRING = (_constants2 || _constants()).JS_GRAMMARS.join(', ');
var diagnosticsOnFlySetting = 'nuclide-flow.diagnosticsOnFly';

var PACKAGE_NAME = 'nuclide-flow';

var busySignalProvider = undefined;

var flowDiagnosticsProvider = undefined;

var disposables = undefined;

function activate() {
  if (!disposables) {
    disposables = new (_atom2 || _atom()).CompositeDisposable();

    var watcher = new (_FlowServiceWatcher2 || _FlowServiceWatcher()).FlowServiceWatcher();
    disposables.add(watcher);

    disposables.add(atom.commands.add(atom.views.getView(atom.workspace), 'nuclide-flow:restart-flow-server', allowFlowServerRestart));

    (0, (_commonsAtomRegisterGrammar2 || _commonsAtomRegisterGrammar()).default)('source.ini', '.flowconfig');
  }
}

/** Provider for autocomplete service. */

function createAutocompleteProvider() {
  var excludeLowerPriority = Boolean((_commonsAtomFeatureConfig2 || _commonsAtomFeatureConfig()).default.get('nuclide-flow.excludeOtherAutocomplete'));

  return {
    selector: (_constants2 || _constants()).JS_GRAMMARS.map(function (grammar) {
      return '.' + grammar;
    }).join(', '),
    disableForSelector: '.source.js .comment',
    inclusionPriority: 1,
    // We want to get ranked higher than the snippets provider.
    suggestionPriority: 5,
    onDidInsertSuggestion: function onDidInsertSuggestion() {
      (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)('nuclide-flow.autocomplete-chosen');
    },
    excludeLowerPriority: excludeLowerPriority,
    getSuggestions: function getSuggestions(request) {
      return (_FlowAutocompleteProvider2 || _FlowAutocompleteProvider()).default.getSuggestions(request);
    }
  };
}

function getHyperclickProvider() {
  var flowHyperclickProvider = new (_FlowHyperclickProvider2 || _FlowHyperclickProvider()).default();
  var getSuggestionForWord = flowHyperclickProvider.getSuggestionForWord.bind(flowHyperclickProvider);
  return {
    wordRegExp: (_constants2 || _constants()).JAVASCRIPT_WORD_REGEX,
    priority: 20,
    providerName: PACKAGE_NAME,
    getSuggestionForWord: getSuggestionForWord
  };
}

function provideBusySignal() {
  if (!busySignalProvider) {
    busySignalProvider = new (_nuclideBusySignal2 || _nuclideBusySignal()).DedupedBusySignalProviderBase();
  }
  return busySignalProvider;
}

function provideDiagnostics() {
  if (!flowDiagnosticsProvider) {
    var busyProvider = this.provideBusySignal();
    var runOnTheFly = (_commonsAtomFeatureConfig2 || _commonsAtomFeatureConfig()).default.get(diagnosticsOnFlySetting);
    flowDiagnosticsProvider = new (_FlowDiagnosticsProvider2 || _FlowDiagnosticsProvider()).default(runOnTheFly, busyProvider);
    (0, (_assert2 || _assert()).default)(disposables);
    disposables.add((0, (_commonsAtomProjects2 || _commonsAtomProjects()).onDidRemoveProjectPath)(function (projectPath) {
      (0, (_assert2 || _assert()).default)(flowDiagnosticsProvider);
      flowDiagnosticsProvider.invalidateProjectPath(projectPath);
    }));
  }
  return flowDiagnosticsProvider;
}

function provideOutlines() {
  var provider = new (_FlowOutlineProvider2 || _FlowOutlineProvider()).FlowOutlineProvider();
  return {
    grammarScopes: (_constants2 || _constants()).JS_GRAMMARS,
    priority: 1,
    name: 'Flow',
    getOutline: provider.getOutline.bind(provider)
  };
}

function createTypeHintProvider() {
  var flowTypeHintProvider = new (_FlowTypeHintProvider2 || _FlowTypeHintProvider()).FlowTypeHintProvider();
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
    grammarScopes: (_constants2 || _constants()).JS_GRAMMARS,
    getCoverage: function getCoverage(path) {
      return (0, (_FlowCoverageProvider2 || _FlowCoverageProvider()).getCoverage)(path);
    }
  };
}

function createEvaluationExpressionProvider() {
  var evaluationExpressionProvider = new (_FlowEvaluationExpressionProvider2 || _FlowEvaluationExpressionProvider()).FlowEvaluationExpressionProvider();
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

  var service = (0, (_nuclideRemoteConnection2 || _nuclideRemoteConnection()).getServiceByNuclideUri)('FlowService');
  (0, (_assert2 || _assert()).default)(service);
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
  for (var service of (0, (_FlowServiceFactory2 || _FlowServiceFactory()).getCurrentServiceInstances)()) {
    service.allowServerRestart();
  }
}
// empty results.