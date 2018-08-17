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

/**
 * This is a standalone program that acts as a worker process to build a
 * development package of the remote server. It communicates with a host
 * process using Node IPC.
 */

import type {DevelopmentZipResult} from '../development';
import type {DevForkProtocol, DevForkErrors} from './types.js';

import * as log4js from 'log4js';

import {createDevZip, packageVersion} from '../development';
import send from './send';

export type {DevForkProtocol};

log4js.configure({
  appenders: [
    {
      type: require.resolve('./send-appender'),
    },
    {
      type: 'console',
    },
  ],
});

function handleError(tag: DevForkErrors): Error => void {
  return (error: Error) =>
    send({
      tag,
      error: error.message + '\n' + error.stack,
    });
}

function sendVersion(version: string): void {
  send({tag: 'packageVersion', version});
}

function sendDeltaPkgData(deltaPkgData: Buffer): void {
  send({tag: 'deltaPkgData', deltaPkgData: deltaPkgData.toString('binary')});
}

function sendFullPkgData(fullPkgData: Buffer): void {
  send({tag: 'fullPkgData', fullPkgData: fullPkgData.toString('binary')});
}

function sendResult(result: DevelopmentZipResult): void {
  send({
    tag: 'result',
    baseVersion: result.baseVersion,
    version: result.version,
    fullPkgFilename: result.fullPkgFilename,
    deltaPkgData: result.deltaPkgData != null,
  });
}

async function main() {
  try {
    packageVersion().then(sendVersion, handleError('packageVersion-error'));

    const result = await createDevZip();

    sendResult(result);

    if (result.deltaPkgData != null) {
      result.deltaPkgData.then(
        sendDeltaPkgData,
        handleError('deltaPkgData-error'),
      );
    }

    result.fullPkgData.then(sendFullPkgData, handleError('fullPkgData-error'));
  } catch (error) {
    handleError('result-error')(error);
  }
}

main();
