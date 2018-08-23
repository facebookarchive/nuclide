"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.startDevPackagerWorker = startDevPackagerWorker;

function _promise() {
  const data = require("../../../nuclide-commons/promise");

  _promise = function () {
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

var child_process = _interopRequireWildcard(require("child_process"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 */
const logger = (0, _log4js().getLogger)('deploy');
/**
 * This will begin a background task (in a child process) to generate a deployment
 * package for development.
 */

function startDevPackagerWorker(devZip, devZipVersion) {
  const deltaPkgData = new (_promise().Deferred)();
  const fullPkgData = new (_promise().Deferred)();
  devZip.promise.catch(error => logger.error('Could not create development package:\n', error));
  devZipVersion.promise.catch(error => logger.error('Could not determine development package version:\n', error));
  deltaPkgData.promise.catch(error => logger.error('Could not create delta development package:\n', error));
  fullPkgData.promise.catch(error => logger.error('Could not create full development package:\n', error));
  const proc = child_process.fork(require.resolve("./dev-worker-process/entry"), [], {
    stdio: ['ipc'],
    // Spawning a child when we both have '--inspect' arguments will cause
    // the child to fail with SIGSEGV. No need to inherit the debug flag.
    execArgv: process.execArgv.filter(arg => !arg.startsWith('--inspect'))
  });

  const cleanUpProc = () => proc.kill(); // Prevent zombie processes in case we are killed before our child exits.
  // NOTE: we remove this listener on the 'exit' event of `proc`.


  process.on('exit', cleanUpProc);
  proc.on('message', childProcessMessageHandler(devZip, devZipVersion, deltaPkgData, fullPkgData));
  proc.stderr.on('data', data => (0, _log4js().getLogger)('worker:deploy').error(new Buffer(data).toString()));
  proc.on('error', error => logger.error('Could not create development package', error));
  proc.on('exit', (code, signal) => {
    const exitMessage = code != null ? `with code ${code}` : `from signal ${signal}`;
    logger.info(`worker process exited ${exitMessage}`); // Reject any promises that have not yet been resolved:

    const errorMessage = `Worker process exited prematurely ${exitMessage}`;
    devZipVersion.reject(new Error(errorMessage));
    devZip.reject(new Error(errorMessage));
    deltaPkgData.reject(new Error(errorMessage));
    fullPkgData.reject(new Error(errorMessage)); // No need to kill the process now, and doing so could accidentally kill a
    // random process that has reused the PID.

    process.removeListener('exit', cleanUpProc);
  });
}

function childProcessMessageHandler(devZip, devZipVersion, deltaPkgData, fullPkgData) {
  return msg => {
    switch (msg.tag) {
      case 'result':
        return devZip.resolve({
          baseVersion: msg.baseVersion,
          version: msg.version,
          deltaPkgData: msg.deltaPkgData ? deltaPkgData.promise : undefined,
          fullPkgData: fullPkgData.promise,
          fullPkgFilename: msg.fullPkgFilename
        });

      case 'result-error':
        return devZip.reject(new Error(msg.error));

      case 'packageVersion':
        return devZipVersion.resolve(msg.version);

      case 'packageVersion-error':
        return devZipVersion.reject(new Error(msg.error));

      case 'deltaPkgData':
        return deltaPkgData.resolve(new Buffer(msg.deltaPkgData, 'binary'));

      case 'deltaPkgData-error':
        return deltaPkgData.reject(new Error(msg.error));

      case 'fullPkgData':
        return fullPkgData.resolve(new Buffer(msg.fullPkgData, 'binary'));

      case 'fullPkgData-error':
        return fullPkgData.reject(new Error(msg.error));

      case 'log':
        return (0, _log4js().getLogger)('worker:' + msg.category)[msg.level](...msg.data);
    }

    return logger.error('Unknown message from child process: ' + JSON.stringify(msg));
  };
}