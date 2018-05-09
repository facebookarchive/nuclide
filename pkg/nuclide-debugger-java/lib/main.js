'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));let getAdditionalLogFilesOnLocalServer = (() => {var _ref4 = (0, _asyncToGenerator.default)(





















































































































































  function* (
  deadline)
  {
    // The DebuggerLogger.java file is hard-coded to write logs to certain
    // filepaths (<tmp>/nuclide-<user>-logs/JavaDebuggerServer.log). We have to
    // make sure this function reads from the exact same name.

    // TODO(ljw): It looks like the Java code is writing to JavaDebuggerServer.log
    // but the Nuclide code was reading from .log.0? I don't understand why, so

    try {
      const results = [];
      const files = ['JavaDebuggerServer.log.0', 'JavaDebuggerServer.log'];
      yield Promise.all(
      files.map((() => {var _ref5 = (0, _asyncToGenerator.default)(function* (file) {
          const filepath = (_nuclideUri || _load_nuclideUri()).default.join(
          _os.default.tmpdir(),
          `nuclide-${_os.default.userInfo().username}-logs`,
          file);

          let data = null;
          try {
            const stat = yield (_fsPromise || _load_fsPromise()).default.stat(filepath);
            if (stat.size > 10 * 1024 * 1024) {
              data = 'file too big!'; // TODO(ljw): at least get the first 10Mb of it
            } else {
              data = yield (_fsPromise || _load_fsPromise()).default.readFile(filepath, 'utf8');
            }
          } catch (e) {
            if (!e.message.includes('ENOENT')) {
              data = e.toString();
            }
          }
          if (data != null) {
            results.push({ title: filepath + '.txt', data });
          }
        });return function (_x9) {return _ref5.apply(this, arguments);};})()));

      return results;
    } catch (e) {
      return [];
    }
  });return function getAdditionalLogFilesOnLocalServer(_x8) {return _ref4.apply(this, arguments);};})();exports.createDebuggerProvider = createDebuggerProvider;exports.createJavaDebuggerProvider = createJavaDebuggerProvider;exports.

createJavaAdditionalLogFilesProvider = createJavaAdditionalLogFilesProvider;exports.






consumeDevicePanelServiceApi = consumeDevicePanelServiceApi;var _UniversalDisposable;function _load_UniversalDisposable() {return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));}var _os = _interopRequireDefault(require('os'));var _fsPromise;function _load_fsPromise() {return _fsPromise = _interopRequireDefault(require('nuclide-commons/fsPromise'));}var _nuclideUri;function _load_nuclideUri() {return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));}var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');var _JavaDebuggerServiceHelpers;function _load_JavaDebuggerServiceHelpers() {return _JavaDebuggerServiceHelpers = require('./JavaDebuggerServiceHelpers');}var _JavaLaunchAttachProvider;function _load_JavaLaunchAttachProvider() {return _JavaLaunchAttachProvider = require('./JavaLaunchAttachProvider');}var _JavaDebuggerDevicePanelProvider;function _load_JavaDebuggerDevicePanelProvider() {return _JavaDebuggerDevicePanelProvider = require('./JavaDebuggerDevicePanelProvider');}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function createDebuggerProvider() {return { name: 'java', getLaunchAttachProvider(connection) {return new (_JavaLaunchAttachProvider || _load_JavaLaunchAttachProvider()).JavaLaunchAttachProvider('Java', connection);} };} /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   * Copyright (c) 2015-present, Facebook, Inc.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   * All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   * This source code is licensed under the license found in the LICENSE file in
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   * the root directory of this source tree.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   * 
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   * @format
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   */function createJavaDebuggerProvider() {return { createAndroidDebugInfo: (() => {var _ref = (0, _asyncToGenerator.default)(function* (parameters) {const { targetUri, packageName, activity, action, device } = parameters;const adbServiceUri = parameters.adbServiceUri != null ? parameters.adbServiceUri : parameters.targetUri;const service = parameters.service != null ? parameters.service : null;const adbService = (0, (_JavaDebuggerServiceHelpers || _load_JavaDebuggerServiceHelpers()).getAdbService)(adbServiceUri);const { pid } = yield (0, (_JavaDebuggerServiceHelpers || _load_JavaDebuggerServiceHelpers()).launchAndroidServiceOrActivityAndGetPid)(parameters.pid, adbService, service, activity, action, device, packageName);const subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default();const attachPortTargetInfo = yield (0, (_JavaDebuggerServiceHelpers || _load_JavaDebuggerServiceHelpers()).getAdbAttachPortTargetInfo)(device, adbService, adbServiceUri, targetUri, pid, subscriptions);const clickEvents = new _rxjsBundlesRxMinJs.Subject();const processInfo = yield (0, (_JavaDebuggerServiceHelpers || _load_JavaDebuggerServiceHelpers()).createJavaVspProcessInfo)(targetUri, attachPortTargetInfo, clickEvents);subscriptions.add(clickEvents);processInfo.addCustomDisposable(subscriptions);return { processInfo, subscriptions };});return function createAndroidDebugInfo(_x) {return _ref.apply(this, arguments);};})(), createJavaTestAttachInfo: (() => {var _ref2 = (0, _asyncToGenerator.default)(function* (targetUri, attachPort) {const subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default();const clickEvents = new _rxjsBundlesRxMinJs.Subject();const processInfo = yield (0, (_JavaDebuggerServiceHelpers || _load_JavaDebuggerServiceHelpers()).createJavaVspProcessInfo)(targetUri, { debugMode: 'attach', machineName: (_nuclideUri || _load_nuclideUri()).default.isRemote(targetUri) ? (_nuclideUri || _load_nuclideUri()).default.getHostname(targetUri) : 'localhost', port: attachPort }, clickEvents);subscriptions.add(clickEvents);processInfo.addCustomDisposable(subscriptions);return { subscriptions, processInfo };});return function createJavaTestAttachInfo(_x2, _x3) {return _ref2.apply(this, arguments);};})(), createJavaLaunchInfo: (() => {var _ref3 = (0, _asyncToGenerator.default)(function* (targetUri, mainClass, classPath, runArgs) {const subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default();const clickEvents = new _rxjsBundlesRxMinJs.Subject();const processInfo = yield (0, (_JavaDebuggerServiceHelpers || _load_JavaDebuggerServiceHelpers()).createJavaVspProcessInfo)(targetUri, { debugMode: 'launch', commandLine: mainClass, classPath, runArgs }, clickEvents);subscriptions.add(clickEvents);processInfo.addCustomDisposable(subscriptions);return { subscriptions, processInfo };});return function createJavaLaunchInfo(_x4, _x5, _x6, _x7) {return _ref3.apply(this, arguments);};})() };}function createJavaAdditionalLogFilesProvider() {return { id: 'java-debugger', getAdditionalLogFiles: getAdditionalLogFilesOnLocalServer };}function consumeDevicePanelServiceApi(api) {api.registerProcessTaskProvider(new (_JavaDebuggerDevicePanelProvider || _load_JavaDebuggerDevicePanelProvider()).JavaDebuggerDevicePanelProvider(createJavaDebuggerProvider()));}