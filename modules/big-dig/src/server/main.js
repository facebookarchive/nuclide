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

import child_process from 'child_process';
import {timeoutPromise, TimedOutError} from 'nuclide-commons/promise';
import fs from '../common/fs';
import invariant from 'assert';
import nuclideUri from 'nuclide-commons/nuclideUri';
import {getLogger} from 'log4js';
import os from 'os';
import {generateCertificates} from './certificates';

export type StartServerParams = {
  clientCommonName: string,
  serverCommonName: string,
  openSSLConfigPath: string,
  port: number,
  timeout: number,
  expirationDays: number,
  jsonOutputFile: string,
  absolutePathToServerMain: string,
  serverParams: mixed,
};

export async function generateCertificatesAndStartServer({
  clientCommonName,
  serverCommonName,
  openSSLConfigPath,
  port,
  timeout,
  expirationDays,
  jsonOutputFile,
  absolutePathToServerMain,
  serverParams,
}: StartServerParams): Promise<void> {
  const logger = getLogger();
  logger.info('in generateCertificatesAndStartServer()');

  // flowlint-next-line sketchy-null-string:off
  const homeDir = process.env.HOME || process.env.USERPROFILE;
  // flowlint-next-line sketchy-null-string:off
  invariant(homeDir);

  const sharedCertsDir = nuclideUri.join(homeDir, '.certs');
  try {
    await fs.mkdir(sharedCertsDir);
  } catch (error) {
    if (error.code !== 'EEXIST') {
      throw error;
    }
  }

  // HACK: kill existing servers on the given port.
  try {
    child_process.execFileSync('pkill', [
      '-f',
      `launchServer-entry.js.*"port":${port}`,
    ]);
  } catch (e) {}

  const paths = await generateCertificates(
    clientCommonName,
    serverCommonName,
    openSSLConfigPath,
    sharedCertsDir,
    expirationDays,
  );
  logger.info('generateCertificates() succeeded!');

  const [key, cert, ca] = await Promise.all([
    fs.readFileAsBuffer(paths.serverKey),
    fs.readFileAsBuffer(paths.serverCert),
    fs.readFileAsBuffer(paths.caCert),
  ]);
  const params = {
    key: key.toString(),
    cert: cert.toString(),
    ca: ca.toString(),
    port,
    launcher: absolutePathToServerMain,
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
      JSON.stringify(params),
    ],
    {
      detached: true,
      stdio: ['ignore', 'ignore', 'ignore', 'ipc'],
    },
  );
  logger.info(`spawn called for ${launcherScript}`);

  const childPort = await timeoutPromise(
    new Promise((resolve, reject) => {
      const onMessage = ({port: result}) => {
        resolve(result);
        child.removeAllListeners();
      };
      child.on('message', onMessage);
      child.on('error', reject);
      child.on('exit', code => {
        logger.info(`${launcherScript} exited with code ${code}`);
        reject(Error(`child exited early with code ${code}`));
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
