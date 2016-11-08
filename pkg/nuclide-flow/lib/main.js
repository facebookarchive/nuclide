'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
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

var _atom = require('atom');

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('../../commons-atom/featureConfig'));
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _registerGrammar;

function _load_registerGrammar() {
  return _registerGrammar = _interopRequireDefault(require('../../commons-atom/register-grammar'));
}

var _projects;

function _load_projects() {
  return _projects = require('../../commons-atom/projects');
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// eslint-disable-next-line nuclide-internal/no-cross-atom-imports
const GRAMMARS_STRING = (_constants || _load_constants()).JS_GRAMMARS.join(', ');
const diagnosticsOnFlySetting = 'nuclide-flow.diagnosticsOnFly';

const PACKAGE_NAME = 'nuclide-flow';

let busySignalProvider;

let flowDiagnosticsProvider;

let disposables;

function activate() {
  if (!disposables) {
    disposables = new _atom.CompositeDisposable();

    const watcher = new (_FlowServiceWatcher || _load_FlowServiceWatcher()).FlowServiceWatcher();
    disposables.add(watcher);

    disposables.add(atom.commands.add('atom-workspace', 'nuclide-flow:restart-flow-server', allowFlowServerRestart));

    (0, (_registerGrammar || _load_registerGrammar()).default)('source.ini', '.flowconfig');
  }
}

/** Provider for autocomplete service. */
function createAutocompleteProvider() {
  const excludeLowerPriority = Boolean((_featureConfig || _load_featureConfig()).default.get('nuclide-flow.excludeOtherAutocomplete'));

  return {
    selector: (_constants || _load_constants()).JS_GRAMMARS.map(grammar => '.' + grammar).join(', '),
    disableForSelector: '.source.js .comment',
    inclusionPriority: 1,
    // We want to get ranked higher than the snippets provider.
    suggestionPriority: 5,
    onDidInsertSuggestion: () => {
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('nuclide-flow.autocomplete-chosen');
    },
    excludeLowerPriority: excludeLowerPriority,
    getSuggestions: function (request) {
      return (_FlowAutocompleteProvider || _load_FlowAutocompleteProvider()).default.getSuggestions(request);
    }
  };
}

function getHyperclickProvider() {
  const flowHyperclickProvider = new (_FlowHyperclickProvider || _load_FlowHyperclickProvider()).default();
  const getSuggestionForWord = flowHyperclickProvider.getSuggestionForWord.bind(flowHyperclickProvider);
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
    const busyProvider = this.provideBusySignal();
    const runOnTheFly = (_featureConfig || _load_featureConfig()).default.get(diagnosticsOnFlySetting);
    flowDiagnosticsProvider = new (_FlowDiagnosticsProvider || _load_FlowDiagnosticsProvider()).default(runOnTheFly, busyProvider);

    if (!disposables) {
      throw new Error('Invariant violation: "disposables"');
    }

    disposables.add((0, (_projects || _load_projects()).onDidRemoveProjectPath)(projectPath => {
      if (!flowDiagnosticsProvider) {
        throw new Error('Invariant violation: "flowDiagnosticsProvider"');
      }

      flowDiagnosticsProvider.invalidateProjectPath(projectPath);
    }));
  }
  return flowDiagnosticsProvider;
}

function provideOutlines() {
  const provider = new (_FlowOutlineProvider || _load_FlowOutlineProvider()).FlowOutlineProvider();
  return {
    grammarScopes: (_constants || _load_constants()).JS_GRAMMARS,
    priority: 1,
    name: 'Flow',
    getOutline: provider.getOutline.bind(provider)
  };
}

function createTypeHintProvider() {
  const flowTypeHintProvider = new (_FlowTypeHintProvider || _load_FlowTypeHintProvider()).FlowTypeHintProvider();
  const typeHint = flowTypeHintProvider.typeHint.bind(flowTypeHintProvider);
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
    getCoverage: function (path) {
      return (0, (_FlowCoverageProvider || _load_FlowCoverageProvider()).getCoverage)(path);
    }
  };
}

function createEvaluationExpressionProvider() {
  const evaluationExpressionProvider = new (_FlowEvaluationExpressionProvider || _load_FlowEvaluationExpressionProvider()).FlowEvaluationExpressionProvider();
  const getEvaluationExpression = evaluationExpressionProvider.getEvaluationExpression.bind(evaluationExpressionProvider);
  return {
    selector: GRAMMARS_STRING,
    name: PACKAGE_NAME,
    getEvaluationExpression: getEvaluationExpression
  };
}

function deactivate() {
  // TODO(mbolin): Find a way to unregister the autocomplete provider from
  // ServiceHub, or set a boolean in the autocomplete provider to always return
  const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getServiceByNuclideUri)('FlowService');

  if (!service) {
    throw new Error('Invariant violation: "service"');
  }

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
  for (const service of (0, (_FlowServiceFactory || _load_FlowServiceFactory()).getCurrentServiceInstances)()) {
    service.allowServerRestart();
  }
}