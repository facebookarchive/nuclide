/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {Device} from '../../nuclide-fbsimctl-rpc/lib/types';

import {Observable} from 'rxjs';
import {arrayEqual} from 'nuclide-commons/collection';
import shallowEqual from 'shallowequal';
import {getLogger} from 'log4js';
import {track} from '../../nuclide-analytics';
import {getFbsimctlServiceByNuclideUri} from '../../nuclide-remote-connection';

const poller = createPoller();

export function getDevices(): Observable<Array<Device> | Error> {
  return poller;
}

function createPoller(): Observable<Array<Device> | Error> {
  return Observable.interval(2000)
    .startWith(0)
    .switchMap(() =>
      Observable.defer(() =>
        getFbsimctlServiceByNuclideUri('').getDevices(),
      ).catch(error => {
        const friendlyError = new Error(
          "Can't fetch iOS devices. Make sure that fbsimctl is in your $PATH and that it works properly.",
        );
        if (error.code !== 'ENOENT') {
          track('nuclide-fbsimctl:error', {error});
          getLogger().error(error);
        } else {
          // Keep the code so tooling higher up knows this is due to the tool missing.
          (friendlyError: any).code = 'ENOENT';
        }
        return Observable.of(friendlyError);
      }),
    )
    .distinctUntilChanged((a, b) => {
      if (Array.isArray(a) && Array.isArray(b)) {
        return arrayEqual(a, b, shallowEqual);
      } else if (a instanceof Error && b instanceof Error) {
        return a.message === b.message;
      } else {
        return false;
      }
    })
    .catch(error => {
      getLogger().error(error);
      return Observable.of([]);
    })
    .publishReplay(1)
    .refCount();
}
