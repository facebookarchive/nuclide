'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generateCertificatesAndStartServer = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let generateCertificatesAndStartServer = exports.generateCertificatesAndStartServer = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (clientCommonName, serverCommonName, openSSLConfigPath, port, expirationDays, jsonOutputFile, absolutePathToServerMain, serverParams) {
    const logger = (0, (_log4js || _load_log4js()).getLogger)();
    logger.info('in generateCertificatesAndStartServer()');

    // flowlint-next-line sketchy-null-string:off
    const homeDir = process.env.HOME || process.env.USERPROFILE;
    // flowlint-next-line sketchy-null-string:off

    if (!homeDir) {
      throw new Error('Invariant violation: "homeDir"');
    }

    const sharedCertsDir = (_nuclideUri || _load_nuclideUri()).default.join(homeDir, '.certs');
    try {
      yield (_fs || _load_fs()).default.mkdir(sharedCertsDir);
    } catch (error) {
      if (error.code !== 'EEXIST') {
        throw error;
      }
    }

    // HACK: kill existing servers on the given port.
    try {
      _child_process.default.execFileSync('pkill', ['-f', `launchServer-entry.js.*"port":${port}`]);
    } catch (e) {}

    const paths = yield (0, (_certificates || _load_certificates()).generateCertificates)(clientCommonName, serverCommonName, openSSLConfigPath, sharedCertsDir, expirationDays);
    logger.info('generateCertificates() succeeded!');

    const [key, cert, ca] = yield Promise.all([(_fs || _load_fs()).default.readFileAsBuffer(paths.serverKey), (_fs || _load_fs()).default.readFileAsBuffer(paths.serverCert), (_fs || _load_fs()).default.readFileAsBuffer(paths.caCert)]);
    const params = {
      key: key.toString(),
      cert: cert.toString(),
      ca: ca.toString(),
      port,
      launcher: absolutePathToServerMain,
      serverParams
    };

    const launcherScript = require.resolve('./launchServer-entry.js');
    logger.info(`About to spawn ${launcherScript} to launch Big Dig server.`);
    const child = _child_process.default.spawn(process.execPath, [launcherScript, JSON.stringify(params)], {
      detached: true,
      stdio: ['ignore', 'ignore', 'ignore', 'ipc']
    });
    logger.info(`spawn called for ${launcherScript}`);

    const childPort = yield new Promise(function (resolve, reject) {
      const onMessage = function ({ port: result }) {
        resolve(result);
        child.removeAllListeners();
      };
      child.on('message', onMessage);
      child.on('error', reject);
      child.on('exit', function (code) {
        logger.info(`${launcherScript} exited with code ${code}`);
        reject(Error(`child exited early with code ${code}`));
      });
    });

    const { version } = require('../../package.json');
    const json = JSON.stringify(
    // These properties are the ones currently written by nuclide-server.
    {
      pid: process.pid,
      version,
      hostname: serverCommonName,
      port: childPort,
      ca: ca.toString(),
      cert: yield (_fs || _load_fs()).default.readFileAsString(paths.clientCert),
      key: yield (_fs || _load_fs()).default.readFileAsString(paths.clientKey),
      success: true
    });
    yield (_fs || _load_fs()).default.writeFile(jsonOutputFile, json, { mode: 0o600 });
    logger.info(`Server config written to ${jsonOutputFile}.`);
    child.unref();
  });

  return function generateCertificatesAndStartServer(_x, _x2, _x3, _x4, _x5, _x6, _x7, _x8) {
    return _ref.apply(this, arguments);
  };
})(); /**
       * Copyright (c) 2017-present, Facebook, Inc.
       * All rights reserved.
       *
       * This source code is licensed under the BSD-style license found in the
       * LICENSE file in the root directory of this source tree. An additional grant
       * of patent rights can be found in the PATENTS file in the same directory.
       *
       * 
       * @format
       */

var _child_process = _interopRequireDefault(require('child_process'));

var _fs;

function _load_fs() {
  return _fs = _interopRequireDefault(require('../common/fs'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _certificates;

function _load_certificates() {
  return _certificates = require('./certificates');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }