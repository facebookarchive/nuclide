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

import type {ProcessMessage} from 'nuclide-commons/process';
import type {ThriftServerConfig} from 'big-dig/src/services/thrift/types';

import escapeRegExp from 'escape-string-regexp';
import {getLogger} from 'log4js';
import {track} from 'nuclide-commons/analytics';
import {getAvailableServerPort} from 'nuclide-commons/serverPort';
import {ConnectableObservable, Observable} from 'rxjs';
import {observeProcess, psTree, killPid} from 'nuclide-commons/process';
import net from 'net';
import {genConfigId} from './config-utils';
import which from 'nuclide-commons/which';
import path from 'path';
// @fb-only: import {getEnv} from './fb-env';

const logger = getLogger('thrift-service-server');
const cache: Map<string, Observable<number>> = new Map();

export function startThriftServer(
  originalConfig: ThriftServerConfig,
): ConnectableObservable<number> {
  return Observable.defer(() => {
    const configId = genConfigId(originalConfig);
    let thriftServer = cache.get(configId);
    if (thriftServer == null) {
      thriftServer = Observable.defer(() => validateConfig(originalConfig))
        .switchMap(validationResult => {
          if (!validationResult.valid) {
            return Observable.throw(new Error(validationResult.error));
          }
          return Observable.defer(() => replacePlaceholders(originalConfig))
            .switchMap(config =>
              mayKillOldServerProcess(config).map(_ => config),
            )
            .switchMap(config =>
              Observable.merge(
                observeServerProcess(config)
                  .do(logProcessMessage(configId))
                  .ignoreElements(),
                observeServerStatus(config.remotePort)
                  .do(() =>
                    logger.info(`(${config.name}) `, 'Thrift Server is ready'),
                  )
                  .map(() => config.remotePort),
              ),
            );
        })
        .finally(() => {
          cache.delete(configId);
          logger.info('Thrift Server has been closed ', configId);
        })
        .publishReplay(1)
        .refCount();

      cache.set(configId, thriftServer);
    }
    return thriftServer;
  }).publish();
}

async function replacePlaceholders(
  config: ThriftServerConfig,
): Promise<ThriftServerConfig> {
  return replaceEnvironmentPlaceholder(
    await replaceRemotePortPlaceholder(config),
  );
}

function replaceEnvironmentPlaceholder(
  config: ThriftServerConfig,
): ThriftServerConfig {
  const replace = value =>
    value.replace('{BIG_DIG_SERVICES_PATH}', path.join(__dirname, '../../../'));
  return {
    ...config,
    remoteCommand: replace(config.remoteCommand),
    remoteCommandArgs: config.remoteCommandArgs.map(replace),
  };
}

async function replaceRemotePortPlaceholder(
  config: ThriftServerConfig,
): Promise<ThriftServerConfig> {
  if (config.remotePort === 0) {
    const remotePort = await getAvailableServerPort();
    const remoteCommandArgs = config.remoteCommandArgs.map(arg =>
      arg.replace('{PORT}', String(remotePort)),
    );
    return {
      ...config,
      remotePort,
      remoteCommandArgs,
    };
  }
  return config;
}

function mayKillOldServerProcess(config: ThriftServerConfig): Observable<void> {
  return Observable.defer(async () => {
    if (!config.killOldThriftServerProcess) {
      return;
    }
    const processes = await psTree();
    processes
      .filter(
        processInfo =>
          processInfo.commandWithArgs.search(
            `${escapeRegExp(config.remoteCommand)}.*${escapeRegExp(
              config.remoteCommandArgs.join(' '),
            )}`,
          ) > -1,
      )
      .forEach(processInfo => {
        logger.info(
          `Old ${genConfigId(config)} (pid ${processInfo.pid}) was killed`,
        );
        track('thrift-service-server:kill-server');
        killPid(processInfo.pid);
      });
  });
}

function observeServerProcess(
  config: ThriftServerConfig,
): Observable<ProcessMessage> {
  return observeProcess(config.remoteCommand, config.remoteCommandArgs, {
    isExitError: () => true,
    detached: false,
    killTreeWhenDone: true,
    // @fb-only: env: getEnv(),
    env: process.env, // @oss-only
  });
}

/**
 * Streams `true` when thrift server is listening in the given port.
 * If server is not ready, it tries to reconnects.
 */
function observeServerStatus(port: number): Observable<true> {
  const maxAttempts = 10;
  return Observable.create(observer => {
    let ready = false;
    const client = net
      .connect({port})
      .on('connect', () => {
        client.destroy();
        ready = true;
        observer.next(ready);
      })
      .on('error', () => {
        client.destroy();
        if (!ready) {
          observer.error(
            new Error('Occurred an error when connecting to the thrift server'),
          );
        }
      })
      .once('close', () => {
        if (!ready) {
          observer.error(
            new Error('Connection closed but server is not ready'),
          );
        }
      });
  }).retryWhen(throwOrRetry(maxAttempts));
}

function throwOrRetry(
  maxAttempts: number,
): (errorStream: Observable<Error>) => Observable<number> {
  return errorStream =>
    errorStream.switchMap((error, i) => {
      const attempt = i + 1;
      if (attempt > maxAttempts) {
        throw error;
      }
      logger.error(
        `(${attempt}/${maxAttempts}) Retrying to connect to thrift server after error `,
        error,
      );
      return Observable.timer(attempt * 1000);
    });
}

function logProcessMessage(name: string): ProcessMessage => void {
  return message => {
    switch (message.kind) {
      case 'stdout':
        logger.info(`(${name}) `, message.data);
        return;
      case 'stderr':
        if (message.data.includes('[ERROR]')) {
          logger.error(`(${name}) `, message.data);
        } else {
          logger.info(`(${name}) `, message.data);
        }
        return;
      case 'exit':
        logger.info(`(${name}) `, 'Exited with code ', message.exitCode);
        return;
    }
  };
}

async function validateConfig(
  config: ThriftServerConfig,
): Promise<{valid: true} | {valid: false, error: string}> {
  if (config.remotePort === 0) {
    const hasPlaceholderForPort =
      config.remoteCommandArgs.find(arg => arg.includes('{PORT}')) != null;
    if (!hasPlaceholderForPort) {
      return {
        valid: false,
        error: 'Expected placeholder "{PORT}" for remote port',
      };
    }
  }

  const hasValidCommand =
    (await which(replaceEnvironmentPlaceholder(config).remoteCommand)) != null;
  if (!hasValidCommand) {
    return {
      valid: false,
      error: `Remote command not found: ${config.remoteCommand}`,
    };
  }
  return {valid: true};
}
