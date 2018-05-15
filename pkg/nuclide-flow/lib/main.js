'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

















































































/* ---------------------------------------------------------
                                                                                                                                                           * LSP Flow IDE connection
                                                                                                                                                           * ---------------------------------------------------------
                                                                                                                                                           */let activateLsp = (() => {var _ref = (0, _asyncToGenerator.default)(

  function* () {
    const atomConfig = {
      name: 'Flow',
      grammars: (_constants || _load_constants()).JS_GRAMMARS,
      typeHint: {
        version: '0.0.0',
        priority: 1,
        analyticsEventName: 'nuclide-flow.typeHint' },

      diagnostics: {
        version: '0.2.0',
        analyticsEventName: 'flow.receive-push-diagnostics' },

      definition: {
        version: '0.1.0',
        priority: 20,
        definitionEventName: 'flow.get-definition' },

      autocomplete: {
        inclusionPriority: 1,
        suggestionPriority: 3,
        disableForSelector: null,
        excludeLowerPriority: false,
        analytics: {
          eventName: 'nuclide-flow',
          shouldLogInsertedSuggestion: false },

        autocompleteCacherConfig: {
          updateResults: (_nuclideLanguageService || _load_nuclideLanguageService()).updateAutocompleteResults,
          updateFirstResults: (_nuclideLanguageService || _load_nuclideLanguageService()).updateAutocompleteFirstResults },

        supportsResolve: false } };



    const languageServiceFactory = (() => {var _ref2 = (0, _asyncToGenerator.default)(

      function* (connection) {
        const [fileNotifier, host] = yield Promise.all([
        (0, (_nuclideOpenFiles || _load_nuclideOpenFiles()).getNotifierByConnection)(connection),
        (0, (_nuclideLanguageService || _load_nuclideLanguageService()).getHostServices)()]);

        const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getVSCodeLanguageServiceByConnection)(connection);
        const pathToFlow = (_featureConfig || _load_featureConfig()).default.get(
        'nuclide-flow.pathToFlow');

        const lspService = yield service.createMultiLspLanguageService(
        'flow',
        pathToFlow,
        ['lsp', '--from', 'nuclide'],
        {
          fileNotifier,
          host,
          projectFileNames: ['.flowconfig'],
          fileExtensions: ['.js'],
          logCategory: 'flow-language-server',
          logLevel: 'ALL' });


        // TODO(ljw):
        // stopFlowOnExit: Boolean(featureConfig.get('nuclide-flow.stopFlowOnExit')),
        // '--lazy-mode ide': Boolean(featureConfig.get('nuclide-flow.lazyServer'))
        //   and passesGK('nuclide_flow_lazy_mode_ide')
        // canUseFlowBin: canUseFlowBin: Boolean(featureConfig.get('nuclide-flow.canUseFlowBin')),
        return lspService || new (_nuclideLanguageServiceRpc || _load_nuclideLanguageServiceRpc()).NullLanguageService();
      });return function languageServiceFactory(_x) {return _ref2.apply(this, arguments);};})();

    const atomLanguageService = new (_nuclideLanguageService || _load_nuclideLanguageService()).AtomLanguageService(
    languageServiceFactory,
    atomConfig,
    null,
    (0, (_log4js || _load_log4js()).getLogger)('nuclide-flow'));

    atomLanguageService.activate();

    return new (_UniversalDisposable || _load_UniversalDisposable()).default(atomLanguageService);
  });return function activateLsp() {return _ref.apply(this, arguments);};})();

/* ---------------------------------------------------------
                                                                                * Legacy Flow language services
                                                                                * ---------------------------------------------------------
                                                                                */let activateLegacy = (() => {var _ref3 = (0, _asyncToGenerator.default)(








  function* () {
    connectionCache = new (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).ConnectionCache(connectionToFlowService);

    const disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(
    connectionCache,
    function () {
      connectionCache = null;
    },
    new (_FlowServiceWatcher || _load_FlowServiceWatcher()).FlowServiceWatcher(connectionCache),
    atom.commands.add(
    'atom-workspace',
    'nuclide-flow:restart-flow-server',
    allowFlowServerRestart),

    _rxjsBundlesRxMinJs.Observable.fromPromise(getLanguageServiceConfig()).subscribe(function (lsConfig) {
      const flowLanguageService = new (_nuclideLanguageService || _load_nuclideLanguageService()).AtomLanguageService(
      function (connection) {return getConnectionCache().get(connection);},
      lsConfig);

      flowLanguageService.activate();
      // `disposables` is always disposed before it is set to null. If it has been disposed,
      // this subscription will have been disposed as well and we will not enter this callback.
      if (!(disposables != null)) {throw new Error('Invariant violation: "disposables != null"');}
      disposables.add(flowLanguageService);
    }),
    atom.packages.serviceHub.consume(
    'atom-ide-busy-signal',
    '0.1.0',
    // When the package becomes available to us, it invokes this callback:
    function (service) {
      const disposableForBusyService = consumeBusySignal(service);
      // When the package becomes no longer available to us, it disposes this object:
      return disposableForBusyService;
    }));



    (0, (_registerGrammar || _load_registerGrammar()).default)('source.ini', ['.flowconfig']);

    return disposables;
  });return function activateLegacy() {return _ref3.apply(this, arguments);};})();let connectionToFlowService = (() => {var _ref4 = (0, _asyncToGenerator.default)(

  function* (
  connection)
  {
    const flowService = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getServiceByConnection)(
    'FlowService',
    connection);

    const fileNotifier = yield (0, (_nuclideOpenFiles || _load_nuclideOpenFiles()).getNotifierByConnection)(connection);
    const host = yield (0, (_nuclideLanguageService || _load_nuclideLanguageService()).getHostServices)();
    (0, (_log4js || _load_log4js()).getLogger)('nuclide-flow').info(
    'Checking the nuclide_flow_lazy_mode_ide gk...');

    const ideLazyMode = yield (0, (_passesGK || _load_passesGK()).default)(
    'nuclide_flow_lazy_mode_ide',
    15 * 1000 // 15 second timeout
    );
    (0, (_log4js || _load_log4js()).getLogger)('nuclide-flow').info('ideLazyMode: %s', ideLazyMode);
    const config = {
      functionSnippetShouldIncludeArguments: Boolean(
      (_featureConfig || _load_featureConfig()).default.get('nuclide-flow.functionSnippetShouldIncludeArguments')),

      stopFlowOnExit: Boolean((_featureConfig || _load_featureConfig()).default.get('nuclide-flow.stopFlowOnExit')),
      lazyServer: Boolean((_featureConfig || _load_featureConfig()).default.get('nuclide-flow.lazyServer')),
      ideLazyMode,
      canUseFlowBin: Boolean((_featureConfig || _load_featureConfig()).default.get('nuclide-flow.canUseFlowBin')),
      pathToFlow: (_featureConfig || _load_featureConfig()).default.get('nuclide-flow.pathToFlow') };

    const languageService = yield flowService.initialize(
    fileNotifier,
    host,
    config);


    return languageService;
  });return function connectionToFlowService(_x2) {return _ref4.apply(this, arguments);};})();

// Exported only for testing
let allowFlowServerRestart = (() => {var _ref5 = (0, _asyncToGenerator.default)(























































  function* () {
    const services = yield Promise.all(getConnectionCache().values());
    for (const service of services) {
      service.allowServerRestart();
    }
  });return function allowFlowServerRestart() {return _ref5.apply(this, arguments);};})();let getLanguageServiceConfig = (() => {var _ref6 = (0, _asyncToGenerator.default)(

  function* () {
    const enableHighlight = (_featureConfig || _load_featureConfig()).default.get(
    'nuclide-flow.enableReferencesHighlight');

    const excludeLowerPriority = Boolean(
    (_featureConfig || _load_featureConfig()).default.get('nuclide-flow.excludeOtherAutocomplete'));

    const flowResultsFirst = Boolean(
    (_featureConfig || _load_featureConfig()).default.get('nuclide-flow.flowAutocompleteResultsFirst'));

    const enableTypeHints = Boolean(
    (_featureConfig || _load_featureConfig()).default.get('nuclide-flow.enableTypeHints'));

    const enableFindRefs =
    Boolean((_featureConfig || _load_featureConfig()).default.get('nuclide-flow.enableFindReferences')) || (
    yield (0, (_passesGK || _load_passesGK()).default)(
    'nuclide_flow_find_refs',
    // Wait 15 seconds for the gk check
    15 * 1000));

    return {
      name: 'Flow',
      grammars: (_constants || _load_constants()).JS_GRAMMARS,
      // flowlint-next-line sketchy-null-mixed:off
      highlight: enableHighlight ?
      {
        version: '0.1.0',
        priority: 1,
        analyticsEventName: 'flow.codehighlight' } :

      undefined,
      outline: {
        version: '0.1.0',
        priority: 1,
        analyticsEventName: 'flow.outline',
        // Disabled as it's responsible for many calls/spawns that:
        // In aggregate degrades the performance siginificantly.
        updateOnEdit: false },

      coverage: {
        version: '0.0.0',
        priority: 10,
        analyticsEventName: 'flow.coverage',
        icon: 'nuclicon-flow' },

      definition: {
        version: '0.1.0',
        priority: 20,
        definitionEventName: 'flow.get-definition' },

      autocomplete: {
        disableForSelector: '.source.js .comment',
        excludeLowerPriority,
        // We want to get ranked higher than the snippets provider by default,
        // but it's configurable
        suggestionPriority: flowResultsFirst ? 5 : 1,
        inclusionPriority: 1,
        analytics: {
          eventName: 'nuclide-flow',
          shouldLogInsertedSuggestion: false },

        autocompleteCacherConfig: {
          // TODO: update the ranges once Flow LSP starts returning TextEdits.
          updateResults: function (_originalRequest, request, results) {return (
              (0, (_nuclideFlowCommon || _load_nuclideFlowCommon()).filterResultsByPrefix)(request.prefix, results));},
          shouldFilter: (_nuclideFlowCommon || _load_nuclideFlowCommon()).shouldFilter },

        supportsResolve: false },

      diagnostics: (yield shouldUsePushDiagnostics()) ?
      {
        version: '0.2.0',
        analyticsEventName: 'flow.receive-push-diagnostics' } :

      {
        version: '0.1.0',
        shouldRunOnTheFly: false,
        analyticsEventName: 'flow.run-diagnostics' },

      typeHint: enableTypeHints ?
      {
        version: '0.0.0',
        priority: 1,
        analyticsEventName: 'nuclide-flow.typeHint' } :

      undefined,
      findReferences: enableFindRefs ?
      {
        version: '0.1.0',
        analyticsEventName: 'flow.find-references' } :

      undefined };

  });return function getLanguageServiceConfig() {return _ref6.apply(this, arguments);};})();let shouldUsePushDiagnostics = (() => {var _ref7 = (0, _asyncToGenerator.default)(

  function* () {
    const settingEnabled = Boolean(
    (_featureConfig || _load_featureConfig()).default.get('nuclide-flow.enablePushDiagnostics'));


    (0, (_log4js || _load_log4js()).getLogger)('nuclide-flow').info(
    'Checking the Flow persistent connection gk...');


    // Wait 15 seconds for the gk check
    const doesPassGK = yield (0, (_passesGK || _load_passesGK()).default)(
    'nuclide_flow_persistent_connection',
    15 * 1000);

    (0, (_log4js || _load_log4js()).getLogger)('nuclide-flow').info(
    `Got Flow persistent connection gk: ${String(doesPassGK)}`);

    const result = settingEnabled || doesPassGK;
    (0, (_log4js || _load_log4js()).getLogger)('nuclide-flow').info(
    `Enabling Flow persistent connection: ${String(result)}`);

    return result;
  });return function shouldUsePushDiagnostics() {return _ref7.apply(this, arguments);};})();exports.serverStatusUpdatesToBusyMessages = serverStatusUpdatesToBusyMessages;var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');var _createPackage;function _load_createPackage() {return _createPackage = _interopRequireDefault(require('../../../modules/nuclide-commons-atom/createPackage'));}var _featureConfig;function _load_featureConfig() {return _featureConfig = _interopRequireDefault(require('../../../modules/nuclide-commons-atom/feature-config'));}var _registerGrammar;function _load_registerGrammar() {return _registerGrammar = _interopRequireDefault(require('../../commons-atom/register-grammar'));}var _passesGK;function _load_passesGK() {return _passesGK = _interopRequireDefault(require('../../commons-node/passesGK'));}var _passesGK2;function _load_passesGK2() {return _passesGK2 = require('../../commons-node/passesGK');}var _nuclideLanguageServiceRpc;function _load_nuclideLanguageServiceRpc() {return _nuclideLanguageServiceRpc = require('../../nuclide-language-service-rpc');}var _nuclideOpenFiles;function _load_nuclideOpenFiles() {return _nuclideOpenFiles = require('../../nuclide-open-files');}var _nuclideLanguageService;function _load_nuclideLanguageService() {return _nuclideLanguageService = require('../../nuclide-language-service');}var _log4js;function _load_log4js() {return _log4js = require('log4js');}var _nuclideFlowCommon;function _load_nuclideFlowCommon() {return _nuclideFlowCommon = require('../../nuclide-flow-common');}var _nuclideRemoteConnection;function _load_nuclideRemoteConnection() {return _nuclideRemoteConnection = require('../../nuclide-remote-connection');}var _observable;function _load_observable() {return _observable = require('../../../modules/nuclide-commons/observable');}var _UniversalDisposable;function _load_UniversalDisposable() {return _UniversalDisposable = _interopRequireDefault(require('../../../modules/nuclide-commons/UniversalDisposable'));}var _nuclideUri;function _load_nuclideUri() {return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));}var _FlowServiceWatcher;function _load_FlowServiceWatcher() {return _FlowServiceWatcher = require('./FlowServiceWatcher');}var _constants;function _load_constants() {return _constants = require('./constants');}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}class Activation {constructor() {(0, (_passesGK2 || _load_passesGK2()).onceGkInitialized)(this._onGKInitialized.bind(this));}_onGKInitialized() {if (this._disposed) {return;}this._activationPromise = (0, (_passesGK2 || _load_passesGK2()).isGkEnabled)('nuclide_flow_lsp') ? activateLsp() : activateLegacy();}dispose() {this._disposed = true;if (this._activationPromise != null) {this._activationPromise.then(activation => activation.dispose());}this._activationPromise = null;}} /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Copyright (c) 2015-present, Facebook, Inc.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * This source code is licensed under the license found in the LICENSE file in
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * the root directory of this source tree.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * 
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @format
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);let connectionCache = null;function getConnectionCache() {if (!(connectionCache != null)) {throw new Error('Invariant violation: "connectionCache != null"');}return connectionCache;}function serverStatusUpdatesToBusyMessages(statusUpdates, busySignal) {return statusUpdates.groupBy(({ pathToRoot }) => pathToRoot).mergeMap(messagesForRoot => {return messagesForRoot.let((0, (_observable || _load_observable()).completingSwitchMap)(nextStatus => {// I would use constants here but the constant is in the flow-rpc package which we can't
      // load directly from this package. Casting to the appropriate type is just as safe.
      if (nextStatus.status === 'init' || nextStatus.status === 'busy') {const readablePath = (_nuclideUri || _load_nuclideUri()).default.nuclideUriToDisplayString(nextStatus.pathToRoot);const readableStatus = nextStatus.status === 'init' ? 'initializing' : 'busy'; // Use an observable to encapsulate clearing the message.
        // The switchMap above will ensure that messages get cleared.
        return _rxjsBundlesRxMinJs.Observable.create(observer => {const disposable = busySignal.reportBusy(`Flow server is ${readableStatus} (${readablePath})`);return () => disposable.dispose();});}return _rxjsBundlesRxMinJs.Observable.empty();}));}).subscribe();}function consumeBusySignal(service) {const serverStatusUpdates = getConnectionCache().observeValues() // mergeAll loses type info
  .mergeMap(x => x).mergeMap(ls => {return ls.getServerStatusUpdates().refCount();});const subscription = serverStatusUpdatesToBusyMessages(serverStatusUpdates, service);return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {subscription.unsubscribe();});}