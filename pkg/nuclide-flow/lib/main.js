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
exports.createEvaluationExpressionProvider = createEvaluationExpressionProvider;
exports.deactivate = deactivate;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _atom = require('atom');

var _nuclideFeatureConfig = require('../../nuclide-feature-config');

var _nuclideFeatureConfig2 = _interopRequireDefault(_nuclideFeatureConfig);

var _nuclideClient = require('../../nuclide-client');

var _nuclideAnalytics = require('../../nuclide-analytics');

var _constants = require('./constants');

var GRAMMARS_STRING = _constants.JS_GRAMMARS.join(', ');
var diagnosticsOnFlySetting = 'nuclide-flow.diagnosticsOnFly';

var PACKAGE_NAME = 'nuclide-flow';

var busySignalProvider = undefined;

var flowDiagnosticsProvider = undefined;

var disposables = undefined;

function activate() {
  if (!disposables) {
    disposables = new _atom.CompositeDisposable();

    var _require = require('./FlowServiceWatcher');

    var FlowServiceWatcher = _require.FlowServiceWatcher;

    var watcher = new FlowServiceWatcher();
    disposables.add(watcher);

    disposables.add(atom.commands.add(atom.views.getView(atom.workspace), 'nuclide-flow:restart-flow-server', allowFlowServerRestart));

    var _require2 = require('../../nuclide-atom-helpers');

    var registerGrammarForFileExtension = _require2.registerGrammarForFileExtension;

    registerGrammarForFileExtension('source.ini', '.flowconfig');
  }
}

/** Provider for autocomplete service. */

function createAutocompleteProvider() {
  var AutocompleteProvider = require('./FlowAutocompleteProvider');
  var autocompleteProvider = new AutocompleteProvider();
  var getSuggestions = autocompleteProvider.getSuggestions.bind(autocompleteProvider);

  var excludeLowerPriority = Boolean(_nuclideFeatureConfig2['default'].get('nuclide-flow.excludeOtherAutocomplete'));

  return {
    selector: _constants.JS_GRAMMARS.map(function (grammar) {
      return '.' + grammar;
    }).join(', '),
    disableForSelector: '.source.js .comment',
    inclusionPriority: 1,
    // We want to get ranked higher than the snippets provider.
    suggestionPriority: 5,
    onDidInsertSuggestion: function onDidInsertSuggestion() {
      (0, _nuclideAnalytics.track)('nuclide-flow.autocomplete-chosen');
    },
    excludeLowerPriority: excludeLowerPriority,
    getSuggestions: getSuggestions
  };
}

function getHyperclickProvider() {
  var FlowHyperclickProvider = require('./FlowHyperclickProvider');
  var flowHyperclickProvider = new FlowHyperclickProvider();
  var getSuggestionForWord = flowHyperclickProvider.getSuggestionForWord.bind(flowHyperclickProvider);
  return {
    wordRegExp: _constants.JAVASCRIPT_WORD_REGEX,
    priority: 20,
    providerName: PACKAGE_NAME,
    getSuggestionForWord: getSuggestionForWord
  };
}

function provideBusySignal() {
  if (!busySignalProvider) {
    var _require3 = require('../../nuclide-busy-signal');

    var DedupedBusySignalProviderBase = _require3.DedupedBusySignalProviderBase;

    busySignalProvider = new DedupedBusySignalProviderBase();
  }
  return busySignalProvider;
}

function provideDiagnostics() {
  if (!flowDiagnosticsProvider) {
    var busyProvider = this.provideBusySignal();
    var FlowDiagnosticsProvider = require('./FlowDiagnosticsProvider');
    var runOnTheFly = _nuclideFeatureConfig2['default'].get(diagnosticsOnFlySetting);
    flowDiagnosticsProvider = new FlowDiagnosticsProvider(runOnTheFly, busyProvider);
    (0, _assert2['default'])(disposables);

    var _require4 = require('../../nuclide-atom-helpers');

    var projects = _require4.projects;

    disposables.add(projects.onDidRemoveProjectPath(function (projectPath) {
      (0, _assert2['default'])(flowDiagnosticsProvider);
      flowDiagnosticsProvider.invalidateProjectPath(projectPath);
    }));
  }
  return flowDiagnosticsProvider;
}

function provideOutlines() {
  var _require5 = require('./FlowOutlineProvider');

  var FlowOutlineProvider = _require5.FlowOutlineProvider;

  var provider = new FlowOutlineProvider();
  return {
    grammarScopes: _constants.JS_GRAMMARS,
    priority: 1,
    name: 'Flow',
    getOutline: provider.getOutline.bind(provider)
  };
}

function createTypeHintProvider() {
  var _require6 = require('./FlowTypeHintProvider');

  var FlowTypeHintProvider = _require6.FlowTypeHintProvider;

  var flowTypeHintProvider = new FlowTypeHintProvider();
  var typeHint = flowTypeHintProvider.typeHint.bind(flowTypeHintProvider);
  return {
    selector: GRAMMARS_STRING,
    providerName: PACKAGE_NAME,
    inclusionPriority: 1,
    typeHint: typeHint
  };
}

function createEvaluationExpressionProvider() {
  var _require7 = require('./FlowEvaluationExpressionProvider');

  var FlowEvaluationExpressionProvider = _require7.FlowEvaluationExpressionProvider;

  var evaluationExpressionProvider = new FlowEvaluationExpressionProvider();
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
  // empty results.
  var service = (0, _nuclideClient.getServiceByNuclideUri)('FlowService');
  (0, _assert2['default'])(service);
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
  var _require8 = require('./FlowServiceFactory');

  var getCurrentServiceInstances = _require8.getCurrentServiceInstances;

  for (var service of getCurrentServiceInstances()) {
    service.allowServerRestart();
  }
}