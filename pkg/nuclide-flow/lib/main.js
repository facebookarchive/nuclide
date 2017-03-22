'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let connectionToFlowService = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (connection) {
    const flowService = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getServiceByConnection)('FlowService', connection);
    const fileNotifier = yield (0, (_nuclideOpenFiles || _load_nuclideOpenFiles()).getNotifierByConnection)(connection);
    const config = {
      functionSnippetShouldIncludeArguments: Boolean((_featureConfig || _load_featureConfig()).default.get('nuclide-flow.functionSnippetShouldIncludeArguments')),
      stopFlowOnExit: Boolean((_featureConfig || _load_featureConfig()).default.get('nuclide-flow.stopFlowOnExit'))
    };
    const languageService = yield flowService.initialize(fileNotifier, config);

    return languageService;
  });

  return function connectionToFlowService(_x) {
    return _ref.apply(this, arguments);
  };
})();

let allowFlowServerRestart = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* () {
    const services = yield Promise.all(getConnectionCache().values());
    for (const service of services) {
      service.allowServerRestart();
    }
  });

  return function allowFlowServerRestart() {
    return _ref2.apply(this, arguments);
  };
})();

exports.activate = activate;
exports.deactivate = deactivate;

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('../../commons-atom/featureConfig'));
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

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _FlowServiceWatcher;

function _load_FlowServiceWatcher() {
  return _FlowServiceWatcher = require('./FlowServiceWatcher');
}

var _constants;

function _load_constants() {
  return _constants = require('./constants');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let disposables; /**
                  * Copyright (c) 2015-present, Facebook, Inc.
                  * All rights reserved.
                  *
                  * This source code is licensed under the license found in the LICENSE file in
                  * the root directory of this source tree.
                  *
                  * 
                  */

let connectionCache = null;

function getConnectionCache() {
  if (!(connectionCache != null)) {
    throw new Error('Invariant violation: "connectionCache != null"');
  }

  return connectionCache;
}

function activate() {
  if (!disposables) {
    connectionCache = new (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).ConnectionCache(connectionToFlowService);

    const flowLanguageService = new (_nuclideLanguageService || _load_nuclideLanguageService()).AtomLanguageService(connection => getConnectionCache().get(connection), getLanguageServiceConfig());
    flowLanguageService.activate();

    disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(connectionCache, () => {
      connectionCache = null;
    }, new (_FlowServiceWatcher || _load_FlowServiceWatcher()).FlowServiceWatcher(connectionCache), atom.commands.add('atom-workspace', 'nuclide-flow:restart-flow-server', allowFlowServerRestart), flowLanguageService);

    (0, (_registerGrammar || _load_registerGrammar()).default)('source.ini', ['.flowconfig']);
  }
}

function deactivate() {
  if (disposables != null) {
    disposables.dispose();
    disposables = null;
  }
}

function getLanguageServiceConfig() {
  const enableHighlight = (_featureConfig || _load_featureConfig()).default.get('nuclide-flow.enableReferencesHighlight');
  const excludeLowerPriority = Boolean((_featureConfig || _load_featureConfig()).default.get('nuclide-flow.excludeOtherAutocomplete'));
  const flowResultsFirst = Boolean((_featureConfig || _load_featureConfig()).default.get('nuclide-flow.flowAutocompleteResultsFirst'));
  const enableTypeHints = Boolean((_featureConfig || _load_featureConfig()).default.get('nuclide-flow.enableTypeHints'));
  const enablePushDiagnostics = Boolean((_featureConfig || _load_featureConfig()).default.get('nuclide-flow.enablePushDiagnostics'));
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
    diagnostics: enablePushDiagnostics ? {
      version: '0.2.0',
      analyticsEventName: 'flow.receive-push-diagnostics'
    } : {
      version: '0.1.0',
      shouldRunOnTheFly: false,
      analyticsEventName: 'flow.run-diagnostics'
    },
    typeHint: enableTypeHints ? {
      version: '0.0.0',
      priority: 1,
      analyticsEventName: 'nuclide-flow.typeHint'
    } : undefined,
    evaluationExpression: {
      version: '0.0.0',
      analyticsEventName: 'flow.evaluationExpression'
    }
  };
}