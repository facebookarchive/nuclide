'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.javaDebugAddBuckTargetSourcePaths = exports.debugJavaDebuggerService = exports.debugAndroidDebuggerService = exports.createJavaVspIProcessConfig = exports.createJavaVspProcessInfo = exports.getAdbAttachPortTargetInfo = exports.launchAndroidServiceOrActivityAndGetPid = undefined;var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));let launchAndroidServiceOrActivityAndGetPid = exports.launchAndroidServiceOrActivityAndGetPid = (() => {var _ref = (0, _asyncToGenerator.default)(

























































  function* (
  providedPid,
  adbService,
  service,
  activity,
  action,
  device,
  packageName)
  {
    let attach = true;
    let pid = providedPid;
    if (service != null) {
      attach = false;
      yield adbService.launchService(device, packageName, service || '', true);
    } else if (activity != null && action != null) {
      // First query the device to be sure the activity exists in the specified package.
      // This will allow us to bubble up a useful error message instead of a cryptic
      // adb failure if the user simply mistyped the activity or package name.
      const activityExists = yield adbService.activityExists(
      device,
      packageName,
      activity || '');


      if (!activityExists) {
        throw Error(
        `Activity ${activity || ''} does not exist in package ` + packageName);

      }

      attach = false;
      yield adbService.launchActivity(
      device,
      packageName,
      activity || '',
      true,
      action);

    }

    if (pid == null) {
      pid = yield adbService.getPidFromPackageName(device, packageName);
      if (!Number.isInteger(pid)) {
        throw Error(`Fail to get pid for package: ${packageName}`);
      }
    }

    return {
      pid,
      attach };

  });return function launchAndroidServiceOrActivityAndGetPid(_x, _x2, _x3, _x4, _x5, _x6, _x7) {return _ref.apply(this, arguments);};})();let getAdbAttachPortTargetInfo = exports.getAdbAttachPortTargetInfo = (() => {var _ref2 = (0, _asyncToGenerator.default)(

  function* (
  device,
  adbService,
  adbServiceUri,
  targetUri,
  pid,
  subscriptions)
  {
    const tunnelRequired =
    (_nuclideUri || _load_nuclideUri()).default.isLocal(adbServiceUri) && (_nuclideUri || _load_nuclideUri()).default.isRemote(targetUri);
    let tunnelService;
    let adbPort;
    if (tunnelRequired) {
      tunnelService = yield (0, (_consumeFirstProvider || _load_consumeFirstProvider()).default)('nuclide.ssh-tunnel');
      adbPort = yield tunnelService.getAvailableServerPort(adbServiceUri);
    } else {
      tunnelService = null;
      const service = (0, (_utils || _load_utils()).getJavaDebuggerHelpersServiceByNuclideUri)(adbServiceUri);
      adbPort = yield service.getPortForJavaDebugger();
    }

    const forwardSpec = yield adbService.forwardJdwpPortToPid(
    device,
    adbPort,
    pid || 0);


    if (cleanupSubject != null) {
      yield cleanupSubject.toPromise();
    }

    cleanupSubject = new _rxjsBundlesRxMinJs.Subject();
    subscriptions.add((0, _asyncToGenerator.default)(function* () {
      const result = yield adbService.removeJdwpForwardSpec(device, forwardSpec);
      if (result.trim().startsWith('error')) {
        // TODO(Ericblue): The OneWorld proxy swaps TCP forward for a local filesystem
        // redirection, which confuses adb and prevents proper removal of
        // the forward spec.  Fall back to removing all specs to avoid leaking
        // the port.
        yield adbService.removeJdwpForwardSpec(device, null);
      }

      if (cleanupSubject != null) {
        cleanupSubject.complete();
      }
    }));

    const attachPort = yield new Promise((() => {var _ref4 = (0, _asyncToGenerator.default)(function* (resolve, reject) {
        if (!tunnelRequired) {
          resolve(adbPort);
          return;
        }if (!
        tunnelService) {throw new Error('Invariant violation: "tunnelService"');}
        const debuggerPort = yield tunnelService.getAvailableServerPort(targetUri);
        const tunnel = {
          description: 'Java debugger',
          from: {
            host: (_nuclideUri || _load_nuclideUri()).default.getHostname(targetUri),
            port: debuggerPort,
            family: 4 },

          to: { host: 'localhost', port: adbPort, family: 4 } };

        const openTunnel = tunnelService.openTunnels([tunnel]).share();
        subscriptions.add(openTunnel.subscribe());
        yield openTunnel.take(1).toPromise();
      });return function (_x14, _x15) {return _ref4.apply(this, arguments);};})());
    return {
      debugMode: 'attach',
      machineName: 'localhost',
      port: attachPort };

  });return function getAdbAttachPortTargetInfo(_x8, _x9, _x10, _x11, _x12, _x13) {return _ref2.apply(this, arguments);};})();let createJavaVspProcessInfo = exports.createJavaVspProcessInfo = (() => {var _ref5 = (0, _asyncToGenerator.default)(
















































  function* (
  targetUri,
  config,
  clickEvents)
  {
    const processConfig = yield createJavaVspIProcessConfig(
    targetUri,
    config,
    clickEvents);

    return new (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VspProcessInfo(
    processConfig.targetUri,
    processConfig.debugMode,
    processConfig.adapterType,
    processConfig.adapterExecutable,
    processConfig.config,
    { threads: true },
    {
      customControlButtons: getCustomControlButtons(clickEvents),
      threadsComponentTitle: 'Threads' });


  });return function createJavaVspProcessInfo(_x16, _x17, _x18) {return _ref5.apply(this, arguments);};})();let getJavaVSAdapterExecutableInfo = (() => {var _ref6 = (0, _asyncToGenerator.default)(

  function* (
  targetUri)
  {
    return (0, (_utils || _load_utils()).getJavaDebuggerHelpersServiceByNuclideUri)(
    targetUri).
    getJavaVSAdapterExecutableInfo((yield (0, (_passesGK || _load_passesGK()).default)((_utils || _load_utils()).NUCLIDE_DEBUGGER_DEV_GK)));
  });return function getJavaVSAdapterExecutableInfo(_x19) {return _ref6.apply(this, arguments);};})();let createJavaVspIProcessConfig = exports.createJavaVspIProcessConfig = (() => {var _ref7 = (0, _asyncToGenerator.default)(

  function* (
  targetUri,
  config,
  clickEvents)
  {
    const adapterExecutable = yield getJavaVSAdapterExecutableInfo(targetUri);
    // If you have built using debug information, then print the debug server port:
    if (yield (0, (_passesGK || _load_passesGK()).default)((_utils || _load_utils()).NUCLIDE_DEBUGGER_DEV_GK)) {
      try {
        const port = adapterExecutable.args[1].split(':')[2].split(',')[0];
        /* eslint-disable no-console */
        console.log('Java Debugger Debug Port:', port);
      } catch (error) {
        /* eslint-disable no-console */
        console.log(
        'Could not find debug server port from adapter executable',
        adapterExecutable);

      }
    }

    return {
      targetUri,
      debugMode: config.debugMode,
      adapterType: (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VsAdapterTypes.JAVA,
      adapterExecutable,
      config,
      capabilities: { threads: true },
      properties: {
        customControlButtons: getCustomControlButtons(clickEvents),
        threadsComponentTitle: 'Threads' } };


  });return function createJavaVspIProcessConfig(_x20, _x21, _x22) {return _ref7.apply(this, arguments);};})();let debugAndroidDebuggerService = exports.debugAndroidDebuggerService = (() => {var _ref8 = (0, _asyncToGenerator.default)(








  function* (
  providedPid,
  adbService,
  service,
  activity,
  action,
  device,
  packageName,
  adbServiceUri,
  targetUri)
  {
    const subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    const { pid, attach } = yield launchAndroidServiceOrActivityAndGetPid(
    providedPid,
    adbService,
    service,
    activity,
    action,
    device,
    packageName);


    const attachPortTargetConfig = yield getAdbAttachPortTargetInfo(
    device,
    adbService,
    adbServiceUri,
    targetUri,
    pid,
    subscriptions);


    yield debugJavaDebuggerService(
    targetUri,
    attachPortTargetConfig,
    subscriptions,
    false /* do not track because we will */);


    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('fb-java-debugger-start', {
      startType: attach ? 'android-attach' : 'android-launch',
      target: packageName,
      targetType: 'android',
      port: attachPortTargetConfig.port,
      deviceName: device.name,
      activity,
      action,
      pid });

  });return function debugAndroidDebuggerService(_x23, _x24, _x25, _x26, _x27, _x28, _x29, _x30, _x31) {return _ref8.apply(this, arguments);};})();let debugJavaDebuggerService = exports.debugJavaDebuggerService = (() => {var _ref9 = (0, _asyncToGenerator.default)(

  function* (
  targetUri,
  config,
  subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default(),
  trackDebug = true)
  {
    const clickEvents = new _rxjsBundlesRxMinJs.Subject();
    const processConfig = yield createJavaVspIProcessConfig(
    targetUri,
    config,
    clickEvents);

    const defaultValues = getDefaultSourceSearchPaths(targetUri);

    const debuggerService = yield (0, (_debugger || _load_debugger()).getDebuggerService)();
    const vspInstance = yield debuggerService.startVspDebugging(processConfig);
    //  The following line must come after `startDebugging` because otherwise
    //    the rpcService has not yet been initialized for us to send custom
    //    commands to
    //  Additionally we set the disposable to be on the vspInstance because
    //    it cannot be in the UI lifecyle. The UI lifecycle disposes its
    //    disposable on componentWillUnmount which has already occurred

    subscriptions.add(
    getDialogValues(clickEvents).
    startWith(getSavedPathsFromConfig()).
    subscribe(function (userValues) {
      vspInstance.customRequest('setSourcePath', {
        sourcePath: getSourcePathString(defaultValues.concat(userValues)) });

    }),
    clickEvents);

    vspInstance.addCustomDisposable(subscriptions);

    if (trackDebug) {
      if (config.debugMode === 'attach') {
        // if attach
        (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('fb-java-debugger-start', {
          startType: 'java-attach',
          machineName: config.machineName,
          port: config.port,
          targetUri });

      } else if (config.debugMode === 'launch') {
        // else launch
        (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('fb-java-debugger-start', {
          startType: 'java-launch',
          commandLine: config.commandLine,
          classPath: config.classPath,
          targetUri });

      }
    }
  });return function debugJavaDebuggerService(_x32, _x33) {return _ref9.apply(this, arguments);};})();let javaDebugSetSourcePaths = (() => {var _ref10 = (0, _asyncToGenerator.default)(




















































  function* (
  processInfo,
  sourcePaths)
  {
    yield processInfo.customRequest('setSourcePath', {
      sourcePath: getSourcePathString(sourcePaths) });

  });return function javaDebugSetSourcePaths(_x34, _x35) {return _ref10.apply(this, arguments);};})();

// Employs a heuristic to try and find the Java source path roots for a buck target.
let javaDebugAddBuckTargetSourcePaths = exports.javaDebugAddBuckTargetSourcePaths = (() => {var _ref11 = (0, _asyncToGenerator.default)(function* (
  processInfo,
  buckRoot,
  targetName)
  {
    const newSourceDirs = new Set();
    const sources = yield (_nuclideBuckRpc || _load_nuclideBuckRpc()).query(
    buckRoot,
    `inputs(deps("${targetName}", 1))`,
    [] /* no extra arguments */);

    for (const sourcePath of sources) {
      const fullPath = (_nuclideUri || _load_nuclideUri()).default.join(buckRoot, sourcePath);
      const javaRootsToTry = ['java', 'com', 'net', 'org'];
      for (const javaRoot of javaRootsToTry) {
        const idx = fullPath.indexOf('/' + javaRoot + '/');
        if (idx > 0) {
          const dirname = fullPath.substring(0, idx);
          newSourceDirs.add(dirname);
          newSourceDirs.add((_nuclideUri || _load_nuclideUri()).default.join(dirname, javaRoot));
        }
      }
    }

    const newDirs = Array.from(newSourceDirs);
    if (newDirs.length > 0) {
      yield javaDebugSetSourcePaths(processInfo, newDirs);
    }
  });return function javaDebugAddBuckTargetSourcePaths(_x36, _x37, _x38) {return _ref11.apply(this, arguments);};})();exports.getAdbService = getAdbService;exports.getDialogValues = getDialogValues;exports.persistSourcePathsToConfig = persistSourcePathsToConfig;exports.getSavedPathsFromConfig = getSavedPathsFromConfig;exports.getDefaultSourceSearchPaths = getDefaultSourceSearchPaths;exports.

getSourcePathString = getSourcePathString;var _nuclideDebuggerCommon;function _load_nuclideDebuggerCommon() {return _nuclideDebuggerCommon = require('nuclide-debugger-common');}var _passesGK;function _load_passesGK() {return _passesGK = _interopRequireDefault(require('../../commons-node/passesGK'));}var _utils;function _load_utils() {return _utils = require('atom-ide-debugger-java/utils');}var _featureConfig;function _load_featureConfig() {return _featureConfig = _interopRequireDefault(require('nuclide-commons-atom/feature-config'));}var _showModal;function _load_showModal() {return _showModal = _interopRequireDefault(require('nuclide-commons-ui/showModal'));}var _UniversalDisposable;function _load_UniversalDisposable() {return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));}var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');var _consumeFirstProvider;function _load_consumeFirstProvider() {return _consumeFirstProvider = _interopRequireDefault(require('nuclide-commons-atom/consumeFirstProvider'));}var _debugger;function _load_debugger() {return _debugger = require('nuclide-commons-atom/debugger');}var _nuclideAnalytics;function _load_nuclideAnalytics() {return _nuclideAnalytics = require('../../nuclide-analytics');}var _nuclideBuckRpc;function _load_nuclideBuckRpc() {return _nuclideBuckRpc = _interopRequireWildcard(require('../../nuclide-buck-rpc'));}var _react = _interopRequireWildcard(require('react'));var _nuclideUri;function _load_nuclideUri() {return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));}var _utils2;function _load_utils2() {return _utils2 = require('nuclide-adb/lib/utils');}var _SourceFilePathsModal;function _load_SourceFilePathsModal() {return _SourceFilePathsModal = require('./SourceFilePathsModal');}function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };} // Only one AdbProcessInfo can be active at a time. Since it ties up a forwarded
// adb port, new instances need to wait for the previous one to clean up before
// they can begin debugging.
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */let cleanupSubject = null;function getAdbService(adbServiceUri) {const service = (0, (_utils2 || _load_utils2()).getAdbServiceByNuclideUri)(adbServiceUri);if (!(service != null)) {throw new Error('Invariant violation: "service != null"');}return service;}function getCustomControlButtons(clickEvents) {return [{ icon: 'file-code', title: 'Set Source Path', onClick: () => clickEvents.next() }];}function getDialogValues(clickEvents) {let userSourcePaths = getSavedPathsFromConfig();return clickEvents.switchMap(() => {return _rxjsBundlesRxMinJs.Observable.create(observer => {const modalDisposable = (0, (_showModal || _load_showModal()).default)(({ dismiss }) => _react.createElement((_SourceFilePathsModal || _load_SourceFilePathsModal()).SourceFilePathsModal, { initialSourcePaths: userSourcePaths, sourcePathsChanged: newPaths => {userSourcePaths = newPaths;persistSourcePathsToConfig(newPaths);observer.next(newPaths);}, onClosed: dismiss }), { className: 'sourcepath-modal-container' });(0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('fb-java-debugger-source-dialog-shown');return () => {modalDisposable.dispose();};});});}function persistSourcePathsToConfig(newSourcePaths) {(_featureConfig || _load_featureConfig()).default.set('nuclide-debugger-java.sourceFilePaths', newSourcePaths.join(';'));}function getSavedPathsFromConfig() {const paths = (_featureConfig || _load_featureConfig()).default.get('nuclide-debugger-java.sourceFilePaths'); // flowlint-next-line sketchy-null-mixed:off
  if (paths && typeof paths === 'string') {return paths.split(';');} else {(_featureConfig || _load_featureConfig()).default.set('nuclide-debugger-java.sourceFilePaths', '');}return [];}function getDefaultSourceSearchPaths(targetUri) {const searchPaths = [];const remote = (_nuclideUri || _load_nuclideUri()).default.isRemote(targetUri); // Add all the project root paths as potential source locations the Java debugger server should
  // check for resolving source.
  // NOTE: the Java debug server will just ignore any directory path that doesn't exist.
  atom.project.getPaths().forEach(path => {if (remote && (_nuclideUri || _load_nuclideUri()).default.isRemote(path) || !remote && (_nuclideUri || _load_nuclideUri()).default.isLocal(path)) {const translatedPath = remote ? (_nuclideUri || _load_nuclideUri()).default.getPath(path) : path;searchPaths.push(translatedPath);try {// $FlowFB
        require('./fb-AndroidSourcePathUtils').addKnownSubdirectoryPaths(remote, translatedPath, searchPaths);} catch (e) {}}});return searchPaths;}function getSourcePathString(searchPaths) {return searchPaths.join(';');}