/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

import type {Expected} from 'nuclide-commons/expected';
import type {FbsimctlDevice} from '../../nuclide-fbsimctl-rpc/lib/types';

import {Expect, expectedEqual} from 'nuclide-commons/expected';
import {Observable} from 'rxjs';
import {arrayEqual} from 'nuclide-commons/collection';
// $FlowIgnore untyped import
import shallowEqual from 'shallowequal';
import {getLogger} from 'log4js';
import {track} from '../../nuclide-analytics';
import {getFbsimctlServiceByNuclideUri} from '../../nuclide-remote-connection';

const poller = createPoller();

export function observeIosDevices(): Observable<
  Expected<Array<FbsimctlDevice>>,
> {
  return poller;
}

function createPoller(): Observable<Expected<Array<FbsimctlDevice>>> {
  return Observable.interval(2000)
    .startWith(0)
    .exhaustMap(() => {
      const service = getFbsimctlServiceByNuclideUri('');
      if (service == null) {
        // Gracefully handle a lost remote connection
        return Observable.of(Expect.pending());
      }
      return Observable.fromPromise(service.getDevices())
        .map(devices => Expect.value(devices))
        .catch(error => {
          let message;
          if (error.code === 'ENOENT') {
            message = "'fbsimctl' not found in $PATH.";
          } else if (
            typeof error.message === 'string' &&
            error.message.includes('plist does not exist')
          ) {
            message =
              "Xcode path is invalid, use 'xcode-select' in a terminal to select path to an Xcode installation.";
          } else if (
            // RPC call timed out
            error.name === 'RpcTimeoutError' ||
            // RPC call succeeded, but the fbsimctl call itself timed out
            error.startsWith('Remote Error: Timeout has occurred')
          ) {
            message = 'Request timed out, retrying...';
          } else {
            message = error.message;
          }
          const newError = new Error("Can't fetch iOS devices. " + message);
          // $FlowIgnore
          (newError: any).originalError = error;
          return Observable.of(Expect.error(newError));
        });
    })
    .distinctUntilChanged((a, b) =>
      expectedEqual(
        a,
        b,
        (v1, v2) => arrayEqual(v1, v2, shallowEqual),
        (e1, e2) => e1.message === e2.message,
      ),
    )
    .do(value => {
      if (value.isError) {
        const {error} = value;
        const logger = getLogger('nuclide-fbsimctl');
        logger.warn(value.error.message);
        track('nuclide-fbsimctl:device-poller:error', {error});
      }
    })
    .publishReplay(1)
    .refCount();
}
