"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.serverStatusUpdatesToBusyMessages = serverStatusUpdatesToBusyMessages;

function _mouseToPosition() {
  const data = require("../../../modules/nuclide-commons-atom/mouse-to-position");

  _mouseToPosition = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _nuclideAnalytics() {
  const data = require("../../nuclide-analytics");

  _nuclideAnalytics = function () {
    return data;
  };

  return data;
}

function _createPackage() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/createPackage"));

  _createPackage = function () {
    return data;
  };

  return data;
}

function _featureConfig() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/feature-config"));

  _featureConfig = function () {
    return data;
  };

  return data;
}

function _registerGrammar() {
  const data = _interopRequireDefault(require("../../commons-atom/register-grammar"));

  _registerGrammar = function () {
    return data;
  };

  return data;
}

function _passesGK() {
  const data = _interopRequireWildcard(require("../../commons-node/passesGK"));

  _passesGK = function () {
    return data;
  };

  return data;
}

function _nuclideLanguageServiceRpc() {
  const data = require("../../nuclide-language-service-rpc");

  _nuclideLanguageServiceRpc = function () {
    return data;
  };

  return data;
}

function _nuclideOpenFiles() {
  const data = require("../../nuclide-open-files");

  _nuclideOpenFiles = function () {
    return data;
  };

  return data;
}

function _nuclideLanguageService() {
  const data = require("../../nuclide-language-service");

  _nuclideLanguageService = function () {
    return data;
  };

  return data;
}

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _nuclideFlowCommon() {
  const data = require("../../nuclide-flow-common");

  _nuclideFlowCommon = function () {
    return data;
  };

  return data;
}

function _nuclideRemoteConnection() {
  const data = require("../../nuclide-remote-connection");

  _nuclideRemoteConnection = function () {
    return data;
  };

  return data;
}

function _observable() {
  const data = require("../../../modules/nuclide-commons/observable");

  _observable = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _FlowServiceWatcher() {
  const data = require("./FlowServiceWatcher");

  _FlowServiceWatcher = function () {
    return data;
  };

  return data;
}

function _constants() {
  const data = require("./constants");

  _constants = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
    (0, _passesGK().onceGkInitialized)(this._onGKInitialized.bind(this));
  }

  _onGKInitialized() {
    if (this._disposed) {
      return;
    }

    this._activationPromise = (0, _passesGK().isGkEnabled)('nuclide_flow_lsp') ? activateLsp() : activateLegacy();
  }

  dispose() {
    this._disposed = true;

    if (this._activationPromise != null) {
      this._activationPromise.then(activation => activation.dispose());
    }

    this._activationPromise = null;
  }

}

(0, _createPackage().default)(module.exports, Activation);
/* ---------------------------------------------------------
 * LSP Flow IDE connection
 * ---------------------------------------------------------
 */

async function activateLsp() {
  let aboutUrl = 'https://flow.org';

  try {
    // $FlowFB
    const strings = require("./fb-strings");

    aboutUrl = strings.abourUrl;
  } catch (_) {}

  const atomConfig = {
    name: 'Flow',
    grammars: _constants().JS_GRAMMARS,
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
      disableForSelector: '.source.js .comment',
      excludeLowerPriority: Boolean(_featureConfig().default.get('nuclide-flow.excludeOtherAutocomplete')),
      suggestionPriority: Boolean(_featureConfig().default.get('nuclide-flow.flowAutocompleteResultsFirst')) ? 5 : 1,
      inclusionPriority: 1,
      analytics: {
        eventName: 'nuclide-flow',
        shouldLogInsertedSuggestion: false
      },
      autocompleteCacherConfig: {
        updateResults: _nuclideLanguageService().updateAutocompleteResults,
        updateFirstResults: _nuclideLanguageService().updateAutocompleteFirstResults
      },
      supportsResolve: false
    },
    highlight: {
      version: '0.1.0',
      priority: 1,
      analyticsEventName: 'flow.codehighlight'
    },
    outline: {
      version: '0.1.0',
      priority: 1,
      analyticsEventName: 'flow.outline',
      updateOnEdit: false // TODO(ljw): turn on once it's fast enough!

    },
    coverage: {
      version: '0.0.0',
      priority: 10,
      analyticsEventName: 'flow.coverage',
      icon: 'nuclicon-flow'
    },
    findReferences: (await shouldEnableFindRefs()) ? {
      version: '0.1.0',
      analyticsEventName: 'flow.find-references' // TODO(nmote): support indirect-find-refs here

    } : undefined,
    status: {
      version: '0.1.0',
      priority: 99,
      observeEventName: 'flow.status.observe',
      clickEventName: 'flow.status.click',
      icon: 'nuclicon-flow',
      description: `__Flow__ provides provides autocomplete, hyperclick, hover, errors and outline. [more...](${aboutUrl})`
    },
    rename: (await shouldEnableRename()) ? {
      version: '0.0.0',
      priority: 1,
      analyticsEventName: 'flow.rename'
    } : undefined
  };

  const languageServiceFactory = async connection => {
    const [fileNotifier, host] = await Promise.all([(0, _nuclideOpenFiles().getNotifierByConnection)(connection), (0, _nuclideLanguageService().getHostServices)()]);
    const service = (0, _nuclideRemoteConnection().getVSCodeLanguageServiceByConnection)(connection);

    const config = _featureConfig().default.getWithDefaults('nuclide-flow', {
      pathToFlow: 'flow',
      canUseFlowBin: false,
      stopFlowOnExit: true,
      liveSyntaxErrors: true,
      logLevel: 'INFO'
    });

    const command = JSON.stringify({
      kind: 'flow',
      pathToFlow: config.pathToFlow,
      canUseFlowBin: config.canUseFlowBin
    });
    const lazy = (0, _passesGK().isGkEnabled)('nuclide_flow_lazy_mode_ide') ? ['--lazy-mode', 'ide'] : [];
    const autostop = config.stopFlowOnExit ? ['--autostop'] : [];
    const lspService = await service.createMultiLspLanguageService('flow', command, ['lsp', '--from', 'nuclide', ...lazy, ...autostop], {
      fileNotifier,
      host,
      projectFileNames: ['.flowconfig'],
      fileExtensions: ['.js', '.jsx'],
      logCategory: 'flow-language-server',
      logLevel: config.logLevel,
      additionalLogFilesRetentionPeriod: 5 * 60 * 1000,
      // 5 minutes
      waitForDiagnostics: true,
      waitForStatus: true,
      initializationOptions: {
        liveSyntaxErrors: config.liveSyntaxErrors
      }
    });
    return lspService || new (_nuclideLanguageServiceRpc().NullLanguageService)();
  };

  const atomLanguageService = new (_nuclideLanguageService().AtomLanguageService)(languageServiceFactory, atomConfig, null, (0, _log4js().getLogger)('nuclide-flow'));
  atomLanguageService.activate();
  return new (_UniversalDisposable().default)(atomLanguageService);
}
/* ---------------------------------------------------------
 * Legacy Flow language services
 * ---------------------------------------------------------
 */


let connectionCache = null;

function getConnectionCache() {
  if (!(connectionCache != null)) {
    throw new Error("Invariant violation: \"connectionCache != null\"");
  }

  return connectionCache;
}

async function activateLegacy() {
  connectionCache = new (_nuclideRemoteConnection().ConnectionCache)(connectionToFlowService);
  const disposables = new (_UniversalDisposable().default)(connectionCache, () => {
    connectionCache = null;
  }, new (_FlowServiceWatcher().FlowServiceWatcher)(connectionCache), atom.commands.add('atom-workspace', 'nuclide-flow:restart-flow-server', allowFlowServerRestart), _RxMin.Observable.fromPromise(getLanguageServiceConfig()).subscribe(lsConfig => {
    const flowLanguageService = new (_nuclideLanguageService().AtomLanguageService)(connection => getConnectionCache().get(connection), lsConfig);
    flowLanguageService.activate(); // `disposables` is always disposed before it is set to null. If it has been disposed,
    // this subscription will have been disposed as well and we will not enter this callback.

    if (!(disposables != null)) {
      throw new Error("Invariant violation: \"disposables != null\"");
    }

    disposables.add(flowLanguageService);
  }), atom.packages.serviceHub.consume('atom-ide-busy-signal', '0.1.0', // When the package becomes available to us, it invokes this callback:
  service => {
    const disposableForBusyService = consumeBusySignal(service); // When the package becomes no longer available to us, it disposes this object:

    return disposableForBusyService;
  }), atom.packages.serviceHub.consume('find-references-view', '0.1.0', consumeFindReferencesView));
  (0, _registerGrammar().default)('source.ini', ['.flowconfig']);
  return disposables;
}

async function connectionToFlowService(connection) {
  const flowService = (0, _nuclideRemoteConnection().getServiceByConnection)('FlowService', connection);
  const fileNotifier = await (0, _nuclideOpenFiles().getNotifierByConnection)(connection);
  const host = await (0, _nuclideLanguageService().getHostServices)();
  const lazyMode = await (0, _passesGK().default)('nuclide_flow_lazy_mode_ide', 15000);
  const config = {
    functionSnippetShouldIncludeArguments: Boolean(_featureConfig().default.get('nuclide-flow.functionSnippetShouldIncludeArguments')),
    stopFlowOnExit: Boolean(_featureConfig().default.get('nuclide-flow.stopFlowOnExit')),
    lazyMode,
    canUseFlowBin: Boolean(_featureConfig().default.get('nuclide-flow.canUseFlowBin')),
    pathToFlow: _featureConfig().default.get('nuclide-flow.pathToFlow')
  };
  const languageService = await flowService.initialize(fileNotifier, host, config);
  return languageService;
} // Exported only for testing


function serverStatusUpdatesToBusyMessages(statusUpdates, busySignal) {
  return statusUpdates.groupBy(({
    pathToRoot
  }) => pathToRoot).mergeMap(messagesForRoot => {
    return messagesForRoot.let((0, _observable().completingSwitchMap)(nextStatus => {
      // I would use constants here but the constant is in the flow-rpc package which we can't
      // load directly from this package. Casting to the appropriate type is just as safe.
      if (nextStatus.status === 'init' || nextStatus.status === 'busy') {
        const readablePath = _nuclideUri().default.nuclideUriToDisplayString(nextStatus.pathToRoot);

        const readableStatus = nextStatus.status === 'init' ? 'initializing' : 'busy'; // Use an observable to encapsulate clearing the message.
        // The switchMap above will ensure that messages get cleared.

        return _RxMin.Observable.create(observer => {
          const disposable = busySignal.reportBusy(`Flow server is ${readableStatus} (${readablePath})`);
          return () => disposable.dispose();
        });
      }

      return _RxMin.Observable.empty();
    }));
  }).subscribe();
}

let busySignalService = null;

function consumeBusySignal(service) {
  busySignalService = service;
  const serverStatusUpdates = getConnectionCache().observeValues() // mergeAll loses type info
  .mergeMap(x => x).mergeMap(ls => {
    return ls.getServerStatusUpdates().refCount();
  });
  const subscription = serverStatusUpdatesToBusyMessages(serverStatusUpdates, service);
  return new (_UniversalDisposable().default)(() => {
    busySignalService = null;
    subscription.unsubscribe();
  });
}

function consumeFindReferencesView(service) {
  const promise = registerMultiHopFindReferencesCommand(service);
  return new (_UniversalDisposable().default)(() => {
    promise.then(disposable => disposable.dispose());
  });
}

async function registerMultiHopFindReferencesCommand(service) {
  if (!(await shouldEnableFindRefs())) {
    return new (_UniversalDisposable().default)();
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

    return (0, _nuclideAnalytics().trackTiming)('flow.find-indirect-references', async () => {
      const path = editor.getPath();

      if (path == null) {
        return;
      }

      const cursors = editor.getCursors();

      if (cursors.length !== 1) {
        return;
      }

      const cursor = cursors[0];
      const position = lastMouseEvent != null ? (0, _mouseToPosition().bufferPositionForMouseEvent)(lastMouseEvent, editor) : cursor.getBufferPosition();
      lastMouseEvent = null;
      const fileVersion = await (0, _nuclideOpenFiles().getFileVersionOfEditor)(editor);
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
  });
}

async function allowFlowServerRestart() {
  const services = await Promise.all(getConnectionCache().values());

  for (const service of services) {
    service.allowServerRestart();
  }
}

async function getLanguageServiceConfig() {
  const excludeLowerPriority = Boolean(_featureConfig().default.get('nuclide-flow.excludeOtherAutocomplete'));
  const flowResultsFirst = Boolean(_featureConfig().default.get('nuclide-flow.flowAutocompleteResultsFirst'));
  const enableFindRefs = await shouldEnableFindRefs();
  return {
    name: 'Flow',
    grammars: _constants().JS_GRAMMARS,
    highlight: {
      version: '0.1.0',
      priority: 1,
      analyticsEventName: 'flow.codehighlight'
    },
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
        updateResults: (_originalRequest, request, results) => (0, _nuclideFlowCommon().filterResultsByPrefix)(request.prefix, results),
        shouldFilter: _nuclideFlowCommon().shouldFilter
      },
      supportsResolve: false
    },
    diagnostics: {
      version: '0.2.0',
      analyticsEventName: 'flow.receive-push-diagnostics'
    },
    typeHint: {
      version: '0.0.0',
      priority: 1,
      analyticsEventName: 'nuclide-flow.typeHint'
    },
    findReferences: enableFindRefs ? {
      version: '0.1.0',
      analyticsEventName: 'flow.find-references'
    } : undefined
  };
}

async function shouldEnableFindRefs() {
  return (0, _passesGK().default)('nuclide_flow_find_refs', // Wait 15 seconds for the gk check
  15 * 1000);
}

async function shouldEnableRename() {
  return (0, _passesGK().default)('nuclide_flow_rename', // Wait 15 seconds for the gk check
  15 * 1000);
}