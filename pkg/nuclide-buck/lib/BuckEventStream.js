'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Level} from '../../nuclide-console/lib/types';
import type {BuckWebSocketMessage} from '../../nuclide-buck-base/lib/BuckProject';
import type {ProcessMessage} from '../../commons-node/process-types';

import {Observable} from 'rxjs';
import stripAnsi from 'strip-ansi';
import {getLogger} from '../../nuclide-logging';

const PROGRESS_OUTPUT_INTERVAL = 5 * 1000;
const BUILD_FAILED_MESSAGE = 'BUILD FAILED:';

export type BuckEvent = {
  type: 'progress';
  progress: ?number;
} | {
  type: 'log';
  message: string;
  level: Level;
};

function convertJavaLevel(level: string): Level {
  switch (level) {
    case 'INFO':
      return 'info';
    case 'WARNING':
      return 'warning';
    case 'SEVERE':
      return 'error';
  }
  return 'log';
}

// Every build finishes with a 100% progress event.
export function isBuildFinishEvent(event: BuckEvent): boolean {
  return event.type === 'progress' && event.progress === 1;
}

export function getEventsFromSocket(
  socketStream: Observable<BuckWebSocketMessage>,
): Observable<BuckEvent> {
  const log = (message, level = 'log') => Observable.of({
    type: 'log',
    message,
    level,
  });

  const eventStream = socketStream
    .flatMap((message: BuckWebSocketMessage) => {
      switch (message.type) {
        case 'ParseStarted':
          return log('Parsing BUCK files...');
        case 'ParseFinished':
          return log('Parsing finished. Starting build...');
        case 'ConsoleEvent':
          return log(message.message, convertJavaLevel(message.level.name));
        case 'InstallFinished':
          return log('Install finished.', 'info');
        case 'BuildFinished':
          return log(
            `Build finished with exit code ${message.exitCode}.`,
            message.exitCode === 0 ? 'info' : 'error',
          );
        case 'BuildProgressUpdated':
          return Observable.of({
            type: 'progress',
            progress: message.progressValue,
          });
      }
      return Observable.empty();
    })
    .catch(err => {
      getLogger().error('Got Buck websocket error', err);
      // Return to indeterminate progress.
      return Observable.of({
        type: 'progress',
        progress: null,
      });
    })
    .share();

  // Periodically emit log events for progress updates.
  return eventStream.merge(
    eventStream
      .flatMap(event => {
        if (event.type === 'progress' && event.progress != null &&
            event.progress > 0 && event.progress < 1) {
          return log(`Building... [${Math.round(event.progress * 100)}%]`);
        }
        return Observable.empty();
      })
      .throttleTime(PROGRESS_OUTPUT_INTERVAL)
  );
}

export function getEventsFromProcess(
  processStream: Observable<ProcessMessage>,
): Observable<BuckEvent> {
  return processStream
    .map(message => {
      switch (message.kind) {
        case 'error':
          return {
            type: 'log',
            message: `Buck failed: ${message.error.message}`,
            level: 'error',
          };
        case 'exit':
          return {
            type: 'log',
            message: `Buck exited with code ${message.exitCode}.`,
            level: 'info',
          };
        case 'stderr':
        case 'stdout':
          return {
            type: 'log',
            // Some Buck steps output ansi escape codes regardless of terminal setting.
            message: stripAnsi(message.data),
            // Build failure messages typically do not show up in the web socket.
            // TODO(hansonw): fix this on the Buck side
            level: message.data.indexOf(BUILD_FAILED_MESSAGE) === -1 ? 'log' : 'error',
          };
        default:
          throw new Error('impossible');
      }
    });
}
