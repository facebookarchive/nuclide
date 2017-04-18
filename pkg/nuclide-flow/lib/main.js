'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.activate = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let activate = exports.activate = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* () {
    if (!disposables) {
      connectionCache = new (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).ConnectionCache(connectionToFlowService);

      disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(connectionCache, function () {
        connectionCache = null;
      }, new (_FlowServiceWatcher || _load_FlowServiceWatcher()).FlowServiceWatcher(connectionCache), atom.commands.add('atom-workspace', 'nuclide-flow:restart-flow-server', allowFlowServerRestart), _rxjsBundlesRxMinJs.Observable.fromPromise(getLanguageServiceConfig()).subscribe(function (lsConfig) {
        const flowLanguageService = new (_nuclideLanguageService || _load_nuclideLanguageService()).AtomLanguageService(function (connection) {
          return getConnectionCache().get(connection);
        }, lsConfig);
        flowLanguageService.activate();
        // `disposables` is always disposed before it is set to null. If it has been disposed,
        // this subscription will have been disposed as well and we will not enter this callback.

        if (!(disposables != null)) {
          throw new Error('Invariant violation: "disposables != null"');
        }

        disposables.add(flowLanguageService);
      }));

      (0, (_registerGrammar || _load_registerGrammar()).default)('source.ini', ['.flowconfig']);
    }
  });

  return function activate() {
    return _ref.apply(this, arguments);
  };
})();

let connectionToFlowService = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* (connection) {
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
    return _ref2.apply(this, arguments);
  };
})();

// Exported only for testing


let allowFlowServerRestart = (() => {
  var _ref3 = (0, _asyncToGenerator.default)(function* () {
    const services = yield Promise.all(getConnectionCache().values());
    for (const service of services) {
      service.allowServerRestart();
    }
  });

  return function allowFlowServerRestart() {
    return _ref3.apply(this, arguments);
  };
})();

let getLanguageServiceConfig = (() => {
  var _ref4 = (0, _asyncToGenerator.default)(function* () {
    const enableHighlight = (_featureConfig || _load_featureConfig()).default.get('nuclide-flow.enableReferencesHighlight');
    const excludeLowerPriority = Boolean((_featureConfig || _load_featureConfig()).default.get('nuclide-flow.excludeOtherAutocomplete'));
    const flowResultsFirst = Boolean((_featureConfig || _load_featureConfig()).default.get('nuclide-flow.flowAutocompleteResultsFirst'));
    const enableTypeHints = Boolean((_featureConfig || _load_featureConfig()).default.get('nuclide-flow.enableTypeHints'));
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
          updateResults: function (request, results) {
            return (0, (_nuclideFlowCommon || _load_nuclideFlowCommon()).filterResultsByPrefix)(request.prefix, results);
          },
          shouldFilter: (_nuclideFlowCommon || _load_nuclideFlowCommon()).shouldFilter
        },
        onDidInsertSuggestionAnalyticsEventName: 'nuclide-flow.autocomplete-chosen'
      },
      diagnostics: (yield shouldUsePushDiagnostics()) ? {
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
        analyticsEventName: 'flow.evaluationExpression',
        regexp: (_nuclideFlowCommon || _load_nuclideFlowCommon()).JAVASCRIPT_IDENTIFIER_REGEX
      }
    };
  });

  return function getLanguageServiceConfig() {
    return _ref4.apply(this, arguments);
  };
})();

let shouldUsePushDiagnostics = (() => {
  var _ref5 = (0, _asyncToGenerator.default)(function* () {
    const settingEnabled = Boolean((_featureConfig || _load_featureConfig()).default.get('nuclide-flow.enablePushDiagnostics'));

    (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().info('Checking the Flow persistent connection gk...');

    // Wait 15 seconds for the gk check
    const doesPassGK = yield (0, (_passesGK || _load_passesGK()).default)('nuclide_flow_persistent_connection', 15 * 1000);
    (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().info(`Got Flow persistent connection gk: ${String(doesPassGK)}`);
    const result = settingEnabled || doesPassGK;
    (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().info(`Enabling Flow persistent connection: ${String(result)}`);
    return result;
  });

  return function shouldUsePushDiagnostics() {
    return _ref5.apply(this, arguments);
  };
})();

exports.serverStatusUpdatesToBusyMessages = serverStatusUpdatesToBusyMessages;
exports.provideBusySignal = provideBusySignal;
exports.deactivate = deactivate;

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('../../commons-atom/featureConfig'));
}

var _registerGrammar;

function _load_registerGrammar() {
  return _registerGrammar = _interopRequireDefault(require('../../commons-atom/register-grammar'));
}

var _passesGK;

function _load_passesGK() {
  return _passesGK = _interopRequireDefault(require('../../commons-node/passesGK'));
}

var _nuclideOpenFiles;

function _load_nuclideOpenFiles() {
  return _nuclideOpenFiles = require('../../nuclide-open-files');
}

var _nuclideLanguageService;

function _load_nuclideLanguageService() {
  return _nuclideLanguageService = require('../../nuclide-language-service');
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
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

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
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

function serverStatusUpdatesToBusyMessages(statusUpdates) {
  let nextMessageId = 0;
  const getMessageId = () => {
    const id = nextMessageId;
    nextMessageId++;
    return id;
  };
  return statusUpdates.groupBy(({ pathToRoot }) => pathToRoot).mergeMap(messagesForRoot => {
    return messagesForRoot.scan(({ lastBusyMessage }, nextStatus) => {
      const messages = [];
      // Invalidate the previous busy message, if there is one
      if (lastBusyMessage != null) {
        messages.push({ status: 'done', id: lastBusyMessage.id });
      }
      let currentBusyMessage = null;
      // I would use constants here but the constant is in the flow-rpc package which we can't
      // load directly from this package. Casting to the appropriate type is just as safe.
      if (nextStatus.status === 'init' || nextStatus.status === 'busy') {
        const readablePath = (_nuclideUri || _load_nuclideUri()).default.nuclideUriToDisplayString(nextStatus.pathToRoot);
        const readableStatus = nextStatus.status === 'init' ? 'initializing' : 'busy';
        currentBusyMessage = {
          status: 'busy',
          id: getMessageId(),
          message: `Flow server is ${readableStatus} (${readablePath})`
        };
        messages.push(currentBusyMessage);
      }
      return { lastBusyMessage: currentBusyMessage, messages };
    }, { lastBusyMessage: null, messages: [] }).concatMap(({ messages }) => _rxjsBundlesRxMinJs.Observable.from(messages));
  });
}

function provideBusySignal() {
  const serverStatusUpdates = getConnectionCache().observeValues()
  // mergeAll loses type info
  .mergeMap(x => x).mergeMap(ls => {
    return ls.getServerStatusUpdates().refCount();
  });

  return {
    messages: serverStatusUpdatesToBusyMessages(serverStatusUpdates)
  };
}

function deactivate() {
  if (disposables != null) {
    disposables.dispose();
    disposables = null;
  }
}