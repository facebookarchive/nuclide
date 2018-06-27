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

import type {Expected} from 'nuclide-commons/expected';
import type {FbsimctlDevice} from '../../nuclide-fbsimctl-rpc/lib/types';

import {Expect, expectedEqual} from 'nuclide-commons/expected';
import {Observable} from 'rxjs';
import {arrayEqual} from 'nuclide-commons/collection';
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
    .switchMap(() =>
      Observable.defer(async () =>
        Expect.value(await getFbsimctlServiceByNuclideUri('').getDevices()),
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
        return Observable.of(Expect.error(friendlyError));
      }),
    )
    .distinctUntilChanged((a, b) =>
      expectedEqual(
        a,
        b,
        (v1, v2) => arrayEqual(v1, v2, shallowEqual),
        (e1, e2) => e1.message === e2.message,
      ),
    )
    .publishReplay(1)
    .refCount();
}
