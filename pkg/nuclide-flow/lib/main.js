'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.serverStatusUpdatesToBusyMessages = serverStatusUpdatesToBusyMessages;

var _mouseToPosition;

function _load_mouseToPosition() {
  return _mouseToPosition = require('../../../modules/nuclide-commons-atom/mouse-to-position');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('../../../modules/nuclide-commons-atom/createPackage'));
}

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('../../../modules/nuclide-commons-atom/feature-config'));
}

var _registerGrammar;

function _load_registerGrammar() {
  return _registerGrammar = _interopRequireDefault(require('../../commons-atom/register-grammar'));
}

var _passesGK;

function _load_passesGK() {
  return _passesGK = _interopRequireDefault(require('../../commons-node/passesGK'));
}

var _passesGK2;

function _load_passesGK2() {
  return _passesGK2 = require('../../commons-node/passesGK');
}

var _nuclideLanguageServiceRpc;

function _load_nuclideLanguageServiceRpc() {
  return _nuclideLanguageServiceRpc = require('../../nuclide-language-service-rpc');
}

var _nuclideOpenFiles;

function _load_nuclideOpenFiles() {
  return _nuclideOpenFiles = require('../../nuclide-open-files');
}

var _nuclideLanguageService;

function _load_nuclideLanguageService() {
  return _nuclideLanguageService = require('../../nuclide-language-service');
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _nuclideFlowCommon;

function _load_nuclideFlowCommon() {
  return _nuclideFlowCommon = require('../../nuclide-flow-common');
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _observable;

function _load_observable() {
  return _observable = require('../../../modules/nuclide-commons/observable');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../modules/nuclide-commons/UniversalDisposable'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
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

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

class Activation {

  constructor() {
    (0, (_passesGK2 || _load_passesGK2()).onceGkInitialized)(this._onGKInitialized.bind(this));
  }

  _onGKInitialized() {
    if (this._disposed) {
      return;
    }
    this._activationPromise = (0, (_passesGK2 || _load_passesGK2()).isGkEnabled)('nuclide_flow_lsp') ? activateLsp() : activateLegacy();
  }

  dispose() {
    this._disposed = true;
    if (this._activationPromise != null) {
      this._activationPromise.then(activation => activation.dispose());
    }
    this._activationPromise = null;
  }
}

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);

/* ---------------------------------------------------------
 * LSP Flow IDE connection
 * ---------------------------------------------------------
 */

async function activateLsp() {
  const atomConfig = {
    name: 'Flow',
    grammars: (_constants || _load_constants()).JS_GRAMMARS,
    typeHint: {
      version: '0.0.0',
      priority: 1,
      analyticsEventName: 'nuclide-flow.typeHint'
    },
    diagnostics: {
      version: '0.2.0',
      analyticsEventName: 'flow.receive-push-diagnostics'
    },
    definition: {
      version: '0.1.0',
      priority: 20,
      definitionEventName: 'flow.get-definition'
    },
    autocomplete: {
      inclusionPriority: 1,
      suggestionPriority: 3,
      disableForSelector: null,
      excludeLowerPriority: false,
      analytics: {
        eventName: 'nuclide-flow',
        shouldLogInsertedSuggestion: false
      },
      autocompleteCacherConfig: {
        updateResults: (_nuclideLanguageService || _load_nuclideLanguageService()).updateAutocompleteResults,
        updateFirstResults: (_nuclideLanguageService || _load_nuclideLanguageService()).updateAutocompleteFirstResults
      },
      supportsResolve: false
    }
  };

  const languageServiceFactory = async connection => {
    const [fileNotifier, host] = await Promise.all([(0, (_nuclideOpenFiles || _load_nuclideOpenFiles()).getNotifierByConnection)(connection), (0, (_nuclideLanguageService || _load_nuclideLanguageService()).getHostServices)()]);
    const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getVSCodeLanguageServiceByConnection)(connection);
    const pathToFlow = (_featureConfig || _load_featureConfig()).default.get('nuclide-flow.pathToFlow');
    const lspService = await service.createMultiLspLanguageService('flow', pathToFlow, ['lsp', '--from', 'nuclide'], {
      fileNotifier,
      host,
      projectFileNames: ['.flowconfig'],
      fileExtensions: ['.js'],
      logCategory: 'flow-language-server',
      logLevel: 'ALL',
      additionalLogFilesRetentionPeriod: 5 * 60 * 1000 // 5 minutes
    });
    // TODO(ljw):
    // stopFlowOnExit: Boolean(featureConfig.get('nuclide-flow.stopFlowOnExit')),
    // '--lazy-mode ide': Boolean(featureConfig.get('nuclide-flow.lazyServer'))
    //   and passesGK('nuclide_flow_lazy_mode_ide')
    // canUseFlowBin: canUseFlowBin: Boolean(featureConfig.get('nuclide-flow.canUseFlowBin')),
    return lspService || new (_nuclideLanguageServiceRpc || _load_nuclideLanguageServiceRpc()).NullLanguageService();
  };

  const atomLanguageService = new (_nuclideLanguageService || _load_nuclideLanguageService()).AtomLanguageService(languageServiceFactory, atomConfig, null, (0, (_log4js || _load_log4js()).getLogger)('nuclide-flow'));
  atomLanguageService.activate();

  return new (_UniversalDisposable || _load_UniversalDisposable()).default(atomLanguageService);
}

/* ---------------------------------------------------------
 * Legacy Flow language services
 * ---------------------------------------------------------
 */

let connectionCache = null;

function getConnectionCache() {
  if (!(connectionCache != null)) {
    throw new Error('Invariant violation: "connectionCache != null"');
  }

  return connectionCache;
}

async function activateLegacy() {
  connectionCache = new (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).ConnectionCache(connectionToFlowService);

  const disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(connectionCache, () => {
    connectionCache = null;
  }, new (_FlowServiceWatcher || _load_FlowServiceWatcher()).FlowServiceWatcher(connectionCache), atom.commands.add('atom-workspace', 'nuclide-flow:restart-flow-server', allowFlowServerRestart), _rxjsBundlesRxMinJs.Observable.fromPromise(getLanguageServiceConfig()).subscribe(lsConfig => {
    const flowLanguageService = new (_nuclideLanguageService || _load_nuclideLanguageService()).AtomLanguageService(connection => getConnectionCache().get(connection), lsConfig);
    flowLanguageService.activate();
    // `disposables` is always disposed before it is set to null. If it has been disposed,
    // this subscription will have been disposed as well and we will not enter this callback.

    if (!(disposables != null)) {
      throw new Error('Invariant violation: "disposables != null"');
    }

    disposables.add(flowLanguageService);
  }), atom.packages.serviceHub.consume('atom-ide-busy-signal', '0.1.0',
  // When the package becomes available to us, it invokes this callback:
  service => {
    const disposableForBusyService = consumeBusySignal(service);
    // When the package becomes no longer available to us, it disposes this object:
    return disposableForBusyService;
  }), atom.packages.serviceHub.consume('find-references-view', '0.1.0', consumeFindReferencesView));

  (0, (_registerGrammar || _load_registerGrammar()).default)('source.ini', ['.flowconfig']);

  return disposables;
}

async function connectionToFlowService(connection) {
  const flowService = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getServiceByConnection)('FlowService', connection);
  const fileNotifier = await (0, (_nuclideOpenFiles || _load_nuclideOpenFiles()).getNotifierByConnection)(connection);
  const host = await (0, (_nuclideLanguageService || _load_nuclideLanguageService()).getHostServices)();
  (0, (_log4js || _load_log4js()).getLogger)('nuclide-flow').info('Checking the nuclide_flow_lazy_mode_ide gk...');
  const ideLazyMode = await (0, (_passesGK || _load_passesGK()).default)('nuclide_flow_lazy_mode_ide', 15 * 1000 // 15 second timeout
  );
  (0, (_log4js || _load_log4js()).getLogger)('nuclide-flow').info('ideLazyMode: %s', ideLazyMode);
  const config = {
    functionSnippetShouldIncludeArguments: Boolean((_featureConfig || _load_featureConfig()).default.get('nuclide-flow.functionSnippetShouldIncludeArguments')),
    stopFlowOnExit: Boolean((_featureConfig || _load_featureConfig()).default.get('nuclide-flow.stopFlowOnExit')),
    lazyServer: Boolean((_featureConfig || _load_featureConfig()).default.get('nuclide-flow.lazyServer')),
    ideLazyMode,
    canUseFlowBin: Boolean((_featureConfig || _load_featureConfig()).default.get('nuclide-flow.canUseFlowBin')),
    pathToFlow: (_featureConfig || _load_featureConfig()).default.get('nuclide-flow.pathToFlow')
  };
  const languageService = await flowService.initialize(fileNotifier, host, config);

  return languageService;
}

// Exported only for testing
function serverStatusUpdatesToBusyMessages(statusUpdates, busySignal) {
  return statusUpdates.groupBy(({ pathToRoot }) => pathToRoot).mergeMap(messagesForRoot => {
    return messagesForRoot.let((0, (_observable || _load_observable()).completingSwitchMap)(nextStatus => {
      // I would use constants here but the constant is in the flow-rpc package which we can't
      // load directly from this package. Casting to the appropriate type is just as safe.
      if (nextStatus.status === 'init' || nextStatus.status === 'busy') {
        const readablePath = (_nuclideUri || _load_nuclideUri()).default.nuclideUriToDisplayString(nextStatus.pathToRoot);
        const readableStatus = nextStatus.status === 'init' ? 'initializing' : 'busy';
        // Use an observable to encapsulate clearing the message.
        // The switchMap above will ensure that messages get cleared.
        return _rxjsBundlesRxMinJs.Observable.create(observer => {
          const disposable = busySignal.reportBusy(`Flow server is ${readableStatus} (${readablePath})`);
          return () => disposable.dispose();
        });
      }
      return _rxjsBundlesRxMinJs.Observable.empty();
    }));
  }).subscribe();
}

let busySignalService = null;

function consumeBusySignal(service) {
  busySignalService = service;
  const serverStatusUpdates = getConnectionCache().observeValues()
  // mergeAll loses type info
  .mergeMap(x => x).mergeMap(ls => {
    return ls.getServerStatusUpdates().refCount();
  });

  const subscription = serverStatusUpdatesToBusyMessages(serverStatusUpdates, service);
  return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
    busySignalService = null;
    subscription.unsubscribe();
  });
}

function consumeFindReferencesView(service) {
  const promise = registerMultiHopFindReferencesCommand(service);
  return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
    promise.then(disposable => disposable.dispose());
  });
}

async function registerMultiHopFindReferencesCommand(service) {
  if (!(await shouldEnableFindRefs())) {
    return new (_UniversalDisposable || _load_UniversalDisposable()).default();
  }
  let lastMouseEvent = null;
  atom.contextMenu.add({
    'atom-text-editor[data-grammar="source js jsx"]': [{
      label: 'Find Indirect References (slower)',
      command: 'nuclide-flow:find-indirect-references',
      created: event => {
        lastMouseEvent = event;
      }
    }]
  });
  return atom.commands.add('atom-text-editor', 'nuclide-flow:find-indirect-references', async () => {
    const editor = atom.workspace.getActiveTextEditor();
    if (editor == null) {
      return;
    }
    const path = editor.getPath();
    if (path == null) {
      return;
    }
    const cursors = editor.getCursors();
    if (cursors.length !== 1) {
      return;
    }
    const cursor = cursors[0];
    const position = lastMouseEvent != null ? (0, (_mouseToPosition || _load_mouseToPosition()).bufferPositionForMouseEvent)(lastMouseEvent, editor) : cursor.getBufferPosition();
    lastMouseEvent = null;
    const fileVersion = await (0, (_nuclideOpenFiles || _load_nuclideOpenFiles()).getFileVersionOfEditor)(editor);
    const flowLS = await getConnectionCache().getForUri(path);
    if (flowLS == null) {
      return;
    }
    if (fileVersion == null) {
      return;
    }
    const getReferences = () => flowLS.customFindReferences(fileVersion, position, true, true).refCount().toPromise();
    let result;
    if (busySignalService == null) {
      result = await getReferences();
    } else {
      result = await busySignalService.reportBusyWhile('Running Flow find-indirect-references (this may take a while)', getReferences, {
        revealTooltip: true,
        waitingFor: 'computer'
      });
    }
    if (result == null) {
      atom.notifications.addInfo('No find references results available');
    } else if (result.type === 'data') {
      service.viewResults(result);
    } else {
      atom.notifications.addWarning(`Flow find-indirect-references issued an error: "${result.message}"`);
    }
  });
}

async function allowFlowServerRestart() {
  const services = await Promise.all(getConnectionCache().values());
  for (const service of services) {
    service.allowServerRestart();
  }
}

async function getLanguageServiceConfig() {
  const enableHighlight = (_featureConfig || _load_featureConfig()).default.get('nuclide-flow.enableReferencesHighlight');
  const excludeLowerPriority = Boolean((_featureConfig || _load_featureConfig()).default.get('nuclide-flow.excludeOtherAutocomplete'));
  const flowResultsFirst = Boolean((_featureConfig || _load_featureConfig()).default.get('nuclide-flow.flowAutocompleteResultsFirst'));
  const enableTypeHints = Boolean((_featureConfig || _load_featureConfig()).default.get('nuclide-flow.enableTypeHints'));
  const enableFindRefs = await shouldEnableFindRefs();
  return {
    name: 'Flow',
    grammars: (_constants || _load_constants()).JS_GRAMMARS,
    // flowlint-next-line sketchy-null-mixed:off
    highlight: enableHighlight ? {
      version: '0.1.0',
      priority: 1,
      analyticsEventName: 'flow.codehighlight'
    } : undefined,
    outline: {
      version: '0.1.0',
      priority: 1,
      analyticsEventName: 'flow.outline',
      // Disabled as it's responsible for many calls/spawns that:
      // In aggregate degrades the performance siginificantly.
      updateOnEdit: false
    },
    coverage: {
      version: '0.0.0',
      priority: 10,
      analyticsEventName: 'flow.coverage',
      icon: 'nuclicon-flow'
    },
    definition: {
      version: '0.1.0',
      priority: 20,
      definitionEventName: 'flow.get-definition'
    },
    autocomplete: {
      disableForSelector: '.source.js .comment',
      excludeLowerPriority,
      // We want to get ranked higher than the snippets provider by default,
      // but it's configurable
      suggestionPriority: flowResultsFirst ? 5 : 1,
      inclusionPriority: 1,
      analytics: {
        eventName: 'nuclide-flow',
        shouldLogInsertedSuggestion: false
      },
      autocompleteCacherConfig: {
        // TODO: update the ranges once Flow LSP starts returning TextEdits.
        updateResults: (_originalRequest, request, results) => (0, (_nuclideFlowCommon || _load_nuclideFlowCommon()).filterResultsByPrefix)(request.prefix, results),
        shouldFilter: (_nuclideFlowCommon || _load_nuclideFlowCommon()).shouldFilter
      },
      supportsResolve: false
    },
    diagnostics: (await shouldUsePushDiagnostics()) ? {
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
    findReferences: enableFindRefs ? {
      version: '0.1.0',
      analyticsEventName: 'flow.find-references'
    } : undefined
  };
}

async function shouldUsePushDiagnostics() {
  const settingEnabled = Boolean((_featureConfig || _load_featureConfig()).default.get('nuclide-flow.enablePushDiagnostics'));

  (0, (_log4js || _load_log4js()).getLogger)('nuclide-flow').info('Checking the Flow persistent connection gk...');

  // Wait 15 seconds for the gk check
  const doesPassGK = await (0, (_passesGK || _load_passesGK()).default)('nuclide_flow_persistent_connection', 15 * 1000);
  (0, (_log4js || _load_log4js()).getLogger)('nuclide-flow').info(`Got Flow persistent connection gk: ${String(doesPassGK)}`);
  const result = settingEnabled || doesPassGK;
  (0, (_log4js || _load_log4js()).getLogger)('nuclide-flow').info(`Enabling Flow persistent connection: ${String(result)}`);
  return result;
}

async function shouldEnableFindRefs() {
  return Boolean((_featureConfig || _load_featureConfig()).default.get('nuclide-flow.enableFindReferences')) || (0, (_passesGK || _load_passesGK()).default)('nuclide_flow_find_refs',
  // Wait 15 seconds for the gk check
  15 * 1000);
}