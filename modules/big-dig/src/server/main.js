"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.startServer = startServer;

function _promise() {
  const data = require("../../../nuclide-commons/promise");

  _promise = function () {
    return data;
  };

  return data;
}

function _fs() {
  const data = _interopRequireDefault(require("../common/fs"));

  _fs = function () {
    return data;
  };

  return data;
}

var _child_process = _interopRequireDefault(require("child_process"));

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

var _os = _interopRequireDefault(require("os"));

function _temp() {
  const data = _interopRequireDefault(require("temp"));

  _temp = function () {
    return data;
  };

  return data;
}

function _certificates() {
  const data = require("./certificates");

  _certificates = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
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
async function startServer({
  certificateStrategy,
  ports,
  timeout,
  expirationDays,
  exclusive,
  jsonOutputFile,
  absolutePathToServerMain,
  serverParams
}) {
  const logger = (0, _log4js().getLogger)();
  logger.info('in startServer()');
  let paths;
  let certificateGeneratorOutput = {};

  switch (certificateStrategy.type) {
    case 'generate':
      const {
        clientCommonName,
        serverCommonName,
        openSSLConfigPath
      } = certificateStrategy;
      paths = await (0, _certificates().generateCertificates)(clientCommonName, serverCommonName, openSSLConfigPath, expirationDays);
      logger.info('generateCertificates() succeeded!');
      certificateGeneratorOutput = {
        hostname: serverCommonName,
        cert: await _fs().default.readFileAsString(paths.clientCert),
        key: await _fs().default.readFileAsString(paths.clientKey)
      };
      break;

    case 'reuse':
      paths = certificateStrategy.paths;
      logger.info('reusing existing certificates');
      break;

    default:
      certificateStrategy.type;
      throw new Error('invalid certificate strategy');
  }

  const [key, cert, ca] = await Promise.all([_fs().default.readFileAsBuffer(paths.serverKey), _fs().default.readFileAsBuffer(paths.serverCert), _fs().default.readFileAsBuffer(paths.caCert)]);
  const params = {
    key: key.toString(),
    cert: cert.toString(),
    ca: ca.toString(),
    ports,
    expirationDays,
    exclusive,
    absolutePathToServerMain,
    serverParams
  }; // Redirect child stderr to a file so that we can read it.
  // (If we just pipe it, there's no safe way of disconnecting it after.)

  _temp().default.track();

  const stderrLog = _temp().default.openSync('big-dig-stderr');

  const launcherScript = require.resolve("./launchServer-entry.js");

  logger.info(`About to spawn ${launcherScript} to launch Big Dig server.`);

  const child = _child_process.default.spawn(process.execPath, [// Increase stack trace limit for better debug logs.
  // For reference, Atom/Electron does not have a stack trace limit.
  '--stack-trace-limit=50', // Increase the maximum heap size if we have enough memory.
  ...(_os.default.totalmem() > 8 * 1024 * 1024 * 1024 ? ['--max-old-space-size=4096'] : []), launcherScript], {
    detached: true,
    stdio: ['ignore', 'ignore', stderrLog.fd, 'ipc']
  });

  logger.info(`spawn called for ${launcherScript}`); // Send launch parameters over IPC to avoid making them visible in `ps`.

  child.send(params);
  const childPort = await (0, _promise().timeoutPromise)(new Promise((resolve, reject) => {
    const onMessage = ({
      port: result
    }) => {
      resolve(result);
      child.removeAllListeners();
    };

    child.on('message', onMessage);
    child.on('error', reject);
    child.on('exit', async code => {
      const stderr = await _fs().default.readFileAsString(stderrLog.path).catch(() => '');
      reject(Error(`Child exited early with code ${code}.\nstderr: ${stderr}`));
    });
  }), timeout).catch(err => {
    // Make sure we clean up hung children.
    if (err instanceof _promise().TimedOutError) {
      child.kill('SIGKILL');
    }

    return Promise.reject(err);
  });

  const {
    version
  } = require("../../package.json");

  const json = JSON.stringify( // These properties are the ones currently written by nuclide-server.
  Object.assign({}, certificateGeneratorOutput, {
    pid: child.pid,
    version,
    port: childPort,
    ca: ca.toString(),
    ca_path: paths.caCert,
    server_cert_path: paths.serverCert,
    server_key_path: paths.serverKey,
    protocol_version: 2,
    success: true
  }));
  await _fs().default.writeFile(jsonOutputFile, json, {
    mode: 0o600
  });
  logger.info(`Server config written to ${jsonOutputFile}.`);
  child.unref();
}