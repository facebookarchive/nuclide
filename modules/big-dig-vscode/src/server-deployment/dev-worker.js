/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow strict-local
 * @format
 */

import type {DevForkProtocol} from './dev-worker-process';
import type {DevelopmentZipResult} from './development';

import {Deferred} from 'nuclide-commons/promise';
import {getLogger} from 'log4js';
import * as child_process from 'child_process';

const logger = getLogger('deploy');

/**
 * This will begin a background task (in a child process) to generate a deployment
 * package for development.
 */
export function startDevPackagerWorker(
  devZip: Deferred<DevelopmentZipResult>,
  devZipVersion: Deferred<string>,
): void {
  const deltaPkgData = new Deferred();
  const fullPkgData = new Deferred();

  devZip.promise.catch(error =>
    logger.error('Could not create development package:\n', error),
  );
  devZipVersion.promise.catch(error =>
    logger.error('Could not determine development package version:\n', error),
  );
  deltaPkgData.promise.catch(error =>
    logger.error('Could not create delta development package:\n', error),
  );
  fullPkgData.promise.catch(error =>
    logger.error('Could not create full development package:\n', error),
  );

  const proc = child_process.fork(
    require.resolve('./dev-worker-process/entry'),
    [],
    {
      stdio: ['ipc'],
      // Spawning a child when we both have '--inspect' arguments will cause
      // the child to fail with SIGSEGV. No need to inherit the debug flag.
      execArgv: process.execArgv.filter(arg => !arg.startsWith('--inspect')),
    },
  );

  const cleanUpProc = () => proc.kill();
  // Prevent zombie processes in case we are killed before our child exits.
  // NOTE: we remove this listener on the 'exit' event of `proc`.
  process.on('exit', cleanUpProc);

  proc.on(
    'message',
    childProcessMessageHandler(
      devZip,
      devZipVersion,
      deltaPkgData,
      fullPkgData,
    ),
  );
  proc.stderr.on('data', data =>
    getLogger('worker:deploy').error(new Buffer(data).toString()),
  );
  proc.on('error', error =>
    logger.error('Could not create development package', error),
  );
  proc.on('exit', (code, signal) => {
    const exitMessage =
      code != null ? `with code ${code}` : `from signal ${signal}`;
    logger.info(`worker process exited ${exitMessage}`);

    // Reject any promises that have not yet been resolved:
    const errorMessage = `Worker process exited prematurely ${exitMessage}`;
    devZipVersion.reject(new Error(errorMessage));
    devZip.reject(new Error(errorMessage));
    deltaPkgData.reject(new Error(errorMessage));
    fullPkgData.reject(new Error(errorMessage));

    // No need to kill the process now, and doing so could accidentally kill a
    // random process that has reused the PID.
    process.removeListener('exit', cleanUpProc);
  });
}

function childProcessMessageHandler(
  devZip: Deferred<DevelopmentZipResult>,
  devZipVersion: Deferred<string>,
  deltaPkgData: Deferred<Buffer>,
  fullPkgData: Deferred<Buffer>,
): DevForkProtocol => void {
  return msg => {
    switch (msg.tag) {
      case 'result':
        return devZip.resolve({
          baseVersion: msg.baseVersion,
          version: msg.version,
          deltaPkgData: msg.deltaPkgData ? deltaPkgData.promise : undefined,
          fullPkgData: fullPkgData.promise,
          fullPkgFilename: msg.fullPkgFilename,
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
        return getLogger('worker:' + msg.category)[msg.level](...msg.data);
    }

    return logger.error(
      'Unknown message from child process: ' + JSON.stringify(msg),
    );
  };
}
