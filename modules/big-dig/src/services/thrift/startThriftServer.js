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
import {ConnectableObservable, Observable} from 'rxjs';
import {observeProcess, psTree, killPid} from 'nuclide-commons/process';
import net from 'net';
import {genConfigId} from './config-utils';
import which from 'nuclide-commons/which';

const logger = getLogger('thrift-service-server');
const cache: Map<string, Observable<number>> = new Map();

export function startThriftServer(
  config: ThriftServerConfig,
): ConnectableObservable<number> {
  return Observable.defer(() => {
    const configId = genConfigId(config);
    let thriftServer = cache.get(configId);
    if (thriftServer == null) {
      thriftServer = isValidCommand(config.remoteCommand)
        .switchMap(valid => {
          if (!valid) {
            return Observable.throw(
              new Error(`Remote command not found: ${config.remoteCommand}`),
            );
          }
          return mayKillOldServerProcess(config).switchMap(_ =>
            Observable.merge(
              observeProcess(config.remoteCommand, config.remoteCommandArgs, {
                isExitError: () => true,
                detached: false,
                env: {
                  ...process.env,
                },
              })
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

function isValidCommand(command: string): Observable<boolean> {
  return Observable.defer(() => which(command)).map(path => path != null);
}
