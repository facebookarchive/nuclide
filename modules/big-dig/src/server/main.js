/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import type {LauncherScriptParams} from './launchServer';

import {timeoutPromise, TimedOutError} from 'nuclide-commons/promise';
import fs from '../common/fs';
import child_process from 'child_process';
import {getLogger} from 'log4js';
import os from 'os';
import {generateCertificates} from './certificates';

export type StartServerParams = {
  clientCommonName: string,
  serverCommonName: string,
  openSSLConfigPath: string,
  ports: string,
  timeout: number,
  expirationDays: number,
  exclusive: ?string,
  jsonOutputFile: string,
  absolutePathToServerMain: string,
  serverParams: mixed,
};

export async function generateCertificatesAndStartServer({
  clientCommonName,
  serverCommonName,
  openSSLConfigPath,
  ports,
  timeout,
  expirationDays,
  exclusive,
  jsonOutputFile,
  absolutePathToServerMain,
  serverParams,
}: StartServerParams): Promise<void> {
  const logger = getLogger();
  logger.info('in generateCertificatesAndStartServer()');

  const paths = await generateCertificates(
    clientCommonName,
    serverCommonName,
    openSSLConfigPath,
    expirationDays,
  );
  logger.info('generateCertificates() succeeded!');

  const [key, cert, ca] = await Promise.all([
    fs.readFileAsBuffer(paths.serverKey),
    fs.readFileAsBuffer(paths.serverCert),
    fs.readFileAsBuffer(paths.caCert),
  ]);
  const params: LauncherScriptParams = {
    key: key.toString(),
    cert: cert.toString(),
    ca: ca.toString(),
    ports,
    expirationDays,
    exclusive,
    absolutePathToServerMain,
    serverParams,
  };

  const launcherScript = require.resolve('./launchServer-entry.js');
  logger.info(`About to spawn ${launcherScript} to launch Big Dig server.`);
  const child = child_process.spawn(
    process.execPath,
    [
      // Increase stack trace limit for better debug logs.
      // For reference, Atom/Electron does not have a stack trace limit.
      '--stack-trace-limit=50',
      // Increase the maximum heap size if we have enough memory.
      ...(os.totalmem() > 8 * 1024 * 1024 * 1024
        ? ['--max-old-space-size=4096']
        : []),
      // In case anything slips through the exception handler.
      '--abort_on_uncaught_exception',
      launcherScript,
    ],
    {
      detached: true,
      stdio: ['ignore', 'ignore', 'pipe', 'ipc'],
    },
  );
  logger.info(`spawn called for ${launcherScript}`);
  // Send launch parameters over IPC to avoid making them visible in `ps`.
  child.send(params);

  const childPort = await timeoutPromise(
    new Promise((resolve, reject) => {
      let stderr = '';
      child.stderr.on('data', data => {
        stderr += data.toString();
      });
      const onMessage = ({port: result}) => {
        resolve(result);
        child.removeAllListeners();
      };
      child.on('message', onMessage);
      child.on('error', reject);
      child.on('exit', code => {
        reject(
          Error(`Child exited early with code ${code}.\nstderr: ${stderr}`),
        );
      });
    }),
    timeout,
  ).catch(err => {
    // Make sure we clean up hung children.
    if (err instanceof TimedOutError) {
      child.kill('SIGKILL');
    }
    return Promise.reject(err);
  });

  const {version} = require('../../package.json');
  const json = JSON.stringify(
    // These properties are the ones currently written by nuclide-server.
    {
      pid: process.pid,
      version,
      hostname: serverCommonName,
      port: childPort,
      ca: ca.toString(),
      cert: await fs.readFileAsString(paths.clientCert),
      key: await fs.readFileAsString(paths.clientKey),
      success: true,
    },
  );
  await fs.writeFile(jsonOutputFile, json, {mode: 0o600});
  logger.info(`Server config written to ${jsonOutputFile}.`);
  child.unref();
}
