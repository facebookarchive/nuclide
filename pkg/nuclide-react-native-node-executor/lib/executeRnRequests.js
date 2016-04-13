'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {ExecutorResponse, RnRequest} from './types';

import {CompositeSubscription} from '../../nuclide-commons';
import featureConfig from '../../nuclide-feature-config';
import {
  createProcessStream,
  forkWithExecEnvironment,
  getOutputStream,
} from '../../nuclide-commons/lib/process';
import {getLogger} from '../../nuclide-logging';
import path from 'path';
import {Observable} from '@reactivex/rxjs';

const logger = getLogger();

export function executeRnRequests(rnRequests: Observable<RnRequest>): Observable<ExecutorResponse> {
  const workerProcess = createProcessStream(() => (
    // TODO: The node location/path needs to be more configurable. We need to figure out a way to
    //   handle this across the board.
    forkWithExecEnvironment(
      path.join(__dirname, 'executor.js'),
      [],
      {
        execArgv: ['--debug-brk'],
        execPath: featureConfig.get('nuclide-react-native.pathToNode'),
        silent: true,
      },
    )
  )).share();

  return Observable.merge(
    workerProcess.map(process => ({
      kind: 'pid',
      pid: process.pid,
    })),

    // The messages we're receiving from the worker process.
    (
      workerProcess.flatMap(
        process => Observable.fromEvent(process, 'message')
      ): Observable<ExecutorResponse>
    ),

    Observable.create(() => (
      new CompositeSubscription(
        // Send the incoming requests to the worker process for evaluation.
        rnRequests
          .withLatestFrom(workerProcess, (r, p) => ([r, p]))
          .subscribe(([request, process]) => { process.send(request); }),

        // Pipe output from forked process. This just makes things easier to debug for us.
        workerProcess
          .switchMap(process => getOutputStream(process))
          .subscribe(message => {
            switch (message.kind) {
              case 'error':
                logger.error(message.error.message);
                return;
              case 'stderr':
              case 'stdout':
                logger.info(message.data.toString());
                return;
            }
          }),
      )
    )),

  ).share();
}
