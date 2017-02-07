'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let connectionToFlowService = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (connection) {
    const flowService = (0, (_FlowServiceFactory || _load_FlowServiceFactory()).getFlowServiceByConnection)(connection);
    const fileNotifier = yield (0, (_nuclideOpenFiles || _load_nuclideOpenFiles()).getNotifierByConnection)(connection);
    const languageService = yield flowService.initialize(fileNotifier);

    return languageService;
  });

  return function connectionToFlowService(_x) {
    return _ref.apply(this, arguments);
  };
})();

exports.activate = activate;
exports.provideBusySignal = provideBusySignal;
exports.createTypeHintProvider = createTypeHintProvider;
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

var _registerGrammar;

function _load_registerGrammar() {
  return _registerGrammar = _interopRequireDefault(require('../../commons-atom/register-grammar'));
}

var _nuclideOpenFiles;

function _load_nuclideOpenFiles() {
  return _nuclideOpenFiles = require('../../nuclide-open-files');
}

var _nuclideLanguageService;

function _load_nuclideLanguageService() {
  return _nuclideLanguageService = require('../../nuclide-language-service');
}

var _nuclideFlowCommon;

function _load_nuclideFlowCommon() {
  return _nuclideFlowCommon = require('../../nuclide-flow-common');
}

var _FlowServiceWatcher;

function _load_FlowServiceWatcher() {
  return _FlowServiceWatcher = require('./FlowServiceWatcher');
}

var _nuclideBusySignal;

function _load_nuclideBusySignal() {
  return _nuclideBusySignal = require('../../nuclide-busy-signal');
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

var _constants;

function _load_constants() {
  return _constants = require('./constants');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const GRAMMARS_STRING = (_constants || _load_constants()).JS_GRAMMARS.join(', ');
// eslint-disable-next-line nuclide-internal/no-cross-atom-imports
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

const PACKAGE_NAME = 'nuclide-flow';

let busySignalProvider;

let disposables;

let flowLanguageService = null;

function activate() {
  if (!disposables) {
    disposables = new _atom.CompositeDisposable();

    flowLanguageService = new (_nuclideLanguageService || _load_nuclideLanguageService()).AtomLanguageService(connectionToFlowService, getLanguageServiceConfig());
    flowLanguageService.activate();

    disposables.add(new (_FlowServiceWatcher || _load_FlowServiceWatcher()).FlowServiceWatcher(), atom.commands.add('atom-workspace', 'nuclide-flow:restart-flow-server', allowFlowServerRestart), flowLanguageService);

    (0, (_registerGrammar || _load_registerGrammar()).default)('source.ini', ['.flowconfig']);
  }
}

function provideBusySignal() {
  if (!busySignalProvider) {
    busySignalProvider = new (_nuclideBusySignal || _load_nuclideBusySignal()).DedupedBusySignalProviderBase();
  }
  return busySignalProvider;
}

function createTypeHintProvider() {
  const flowTypeHintProvider = new (_FlowTypeHintProvider || _load_FlowTypeHintProvider()).FlowTypeHintProvider();
  const typeHint = flowTypeHintProvider.typeHint.bind(flowTypeHintProvider);
  return {
    selector: GRAMMARS_STRING,
    providerName: PACKAGE_NAME,
    inclusionPriority: 1,
    typeHint
  };
}

function createEvaluationExpressionProvider() {
  const evaluationExpressionProvider = new (_FlowEvaluationExpressionProvider || _load_FlowEvaluationExpressionProvider()).FlowEvaluationExpressionProvider();
  const getEvaluationExpression = evaluationExpressionProvider.getEvaluationExpression.bind(evaluationExpressionProvider);
  return {
    selector: GRAMMARS_STRING,
    name: PACKAGE_NAME,
    getEvaluationExpression
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
}

function allowFlowServerRestart() {
  for (const service of (0, (_FlowServiceFactory || _load_FlowServiceFactory()).getCurrentServiceInstances)()) {
    service.allowServerRestart();
  }
}

function getLanguageServiceConfig() {
  const enableHighlight = (_featureConfig || _load_featureConfig()).default.get('nuclide-flow.enableReferencesHighlight');
  const excludeLowerPriority = Boolean((_featureConfig || _load_featureConfig()).default.get('nuclide-flow.excludeOtherAutocomplete'));
  const flowResultsFirst = Boolean((_featureConfig || _load_featureConfig()).default.get('nuclide-flow.flowAutocompleteResultsFirst'));
  return {
    name: 'Flow',
    grammars: (_constants || _load_constants()).JS_GRAMMARS,
    highlight: enableHighlight ? {
      version: '0.0.0',
      priority: 1,
      analyticsEventName: 'flow.codehighlight'
    } : undefined,
    outline: {
      version: '0.0.0',
      priority: 1,
      analyticsEventName: 'flow.outline'
    },
    coverage: {
      version: '0.0.0',
      priority: 10,
      analyticsEventName: 'flow.coverage'
    },
    definition: {
      version: '0.0.0',
      priority: 20,
      definitionEventName: 'flow.get-definition',
      definitionByIdEventName: 'flow.get-definition-by-id'
    },
    autocomplete: {
      version: '2.0.0',
      disableForSelector: '.source.js .comment',
      excludeLowerPriority,
      // We want to get ranked higher than the snippets provider by default,
      // but it's configurable
      suggestionPriority: flowResultsFirst ? 5 : 1,
      inclusionPriority: 1,
      analyticsEventName: 'flow.autocomplete',
      autocompleteCacherConfig: {
        updateResults: (request, results) => (0, (_nuclideFlowCommon || _load_nuclideFlowCommon()).filterResultsByPrefix)(request.prefix, results),
        shouldFilter: (_nuclideFlowCommon || _load_nuclideFlowCommon()).shouldFilter
      },
      onDidInsertSuggestionAnalyticsEventName: 'nuclide-flow.autocomplete-chosen'
    },
    diagnostics: {
      version: '0.1.0',
      shouldRunOnTheFly: false,
      analyticsEventName: 'flow.run-diagnostics'
    }
  };
}