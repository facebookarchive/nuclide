'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.generateCertificatesAndStartServer = undefined;var _asyncToGenerator = _interopRequireDefault(require('async-to-generator')); /**
                                                                                                                                                                                                                  * Copyright (c) 2017-present, Facebook, Inc.
                                                                                                                                                                                                                  * All rights reserved.
                                                                                                                                                                                                                  *
                                                                                                                                                                                                                  * This source code is licensed under the BSD-style license found in the
                                                                                                                                                                                                                  * LICENSE file in the root directory of this source tree. An additional grant
                                                                                                                                                                                                                  * of patent rights can be found in the PATENTS file in the same directory.
                                                                                                                                                                                                                  *
                                                                                                                                                                                                                  * 
                                                                                                                                                                                                                  * @format
                                                                                                                                                                                                                  */let generateCertificatesAndStartServer = exports.generateCertificatesAndStartServer = (() => {var _ref = (0, _asyncToGenerator.default)(
























  function* ({
    clientCommonName,
    serverCommonName,
    openSSLConfigPath,
    ports,
    timeout,
    expirationDays,
    exclusive,
    jsonOutputFile,
    absolutePathToServerMain,
    serverParams })
  {
    const logger = (0, (_log4js || _load_log4js()).getLogger)();
    logger.info('in generateCertificatesAndStartServer()');

    const paths = yield (0, (_certificates || _load_certificates()).generateCertificates)(
    clientCommonName,
    serverCommonName,
    openSSLConfigPath,
    expirationDays);

    logger.info('generateCertificates() succeeded!');

    const [key, cert, ca] = yield Promise.all([
    (_fs || _load_fs()).default.readFileAsBuffer(paths.serverKey),
    (_fs || _load_fs()).default.readFileAsBuffer(paths.serverCert),
    (_fs || _load_fs()).default.readFileAsBuffer(paths.caCert)]);

    const params = {
      key: key.toString(),
      cert: cert.toString(),
      ca: ca.toString(),
      ports,
      expirationDays,
      exclusive,
      absolutePathToServerMain,
      serverParams };


    // Redirect child stderr to a file so that we can read it.
    // (If we just pipe it, there's no safe way of disconnecting it after.)
    (_temp || _load_temp()).default.track();
    const stderrLog = (_temp || _load_temp()).default.openSync('big-dig-stderr');

    const launcherScript = require.resolve('./launchServer-entry.js');
    logger.info(`About to spawn ${launcherScript} to launch Big Dig server.`);
    const child = _child_process.default.spawn(
    process.execPath,
    [
    // Increase stack trace limit for better debug logs.
    // For reference, Atom/Electron does not have a stack trace limit.
    '--stack-trace-limit=50',
    // Increase the maximum heap size if we have enough memory.
    ...(_os.default.totalmem() > 8 * 1024 * 1024 * 1024 ?
    ['--max-old-space-size=4096'] :
    []),
    launcherScript],

    {
      detached: true,
      stdio: ['ignore', 'ignore', stderrLog.fd, 'ipc'] });


    logger.info(`spawn called for ${launcherScript}`);
    // Send launch parameters over IPC to avoid making them visible in `ps`.
    child.send(params);

    const childPort = yield (0, (_promise || _load_promise()).timeoutPromise)(
    new Promise(function (resolve, reject) {
      const onMessage = function ({ port: result }) {
        resolve(result);
        child.removeAllListeners();
      };
      child.on('message', onMessage);
      child.on('error', reject);
      child.on('exit', (() => {var _ref2 = (0, _asyncToGenerator.default)(function* (code) {
          const stderr = yield (_fs || _load_fs()).default.
          readFileAsString(stderrLog.path).
          catch(function () {return '';});
          reject(
          Error(`Child exited early with code ${code}.\nstderr: ${stderr}`));

        });return function (_x2) {return _ref2.apply(this, arguments);};})());
    }),
    timeout).
    catch(function (err) {
      // Make sure we clean up hung children.
      if (err instanceof (_promise || _load_promise()).TimedOutError) {
        child.kill('SIGKILL');
      }
      return Promise.reject(err);
    });

    const { version } = require('../../package.json');
    const json = JSON.stringify(
    // These properties are the ones currently written by nuclide-server.
    {
      pid: child.pid,
      version,
      hostname: serverCommonName,
      port: childPort,
      ca: ca.toString(),
      ca_path: paths.caCert,
      server_cert_path: paths.serverCert,
      server_key_path: paths.serverKey,
      cert: yield (_fs || _load_fs()).default.readFileAsString(paths.clientCert),
      key: yield (_fs || _load_fs()).default.readFileAsString(paths.clientKey),
      protocol_version: 2,
      success: true });


    yield (_fs || _load_fs()).default.writeFile(jsonOutputFile, json, { mode: 0o600 });
    logger.info(`Server config written to ${jsonOutputFile}.`);
    child.unref();
  });return function generateCertificatesAndStartServer(_x) {return _ref.apply(this, arguments);};})();var _promise;function _load_promise() {return _promise = require('../../../nuclide-commons/promise');}var _fs;function _load_fs() {return _fs = _interopRequireDefault(require('../common/fs'));}var _child_process = _interopRequireDefault(require('child_process'));var _log4js;function _load_log4js() {return _log4js = require('log4js');}var _os = _interopRequireDefault(require('os'));var _temp;function _load_temp() {return _temp = _interopRequireDefault(require('temp'));}var _certificates;function _load_certificates() {return _certificates = require('./certificates');}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}