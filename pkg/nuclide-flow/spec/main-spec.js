/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {ServerStatusUpdate} from '../../nuclide-flow-rpc';
import type {BusySignalMessage} from '../../nuclide-busy-signal/lib/types';

import {Observable} from 'rxjs';

import {addMatchers} from '../../nuclide-test-helpers';

import {serverStatusUpdatesToBusyMessages} from '..';

describe('serverStatusUpdatesToBusyMessages', () => {
  beforeEach(function() {
    addMatchers(this);
  });

  it('should work', () => {
    waitsForPromise(async () => {
      const input: Array<ServerStatusUpdate> = [
        {
          pathToRoot: 'nuclide://host.example.com/remote/root',
          status: 'not running',
        },
        {
          pathToRoot: '/local/root',
          status: 'busy',
        },
        {
          pathToRoot: 'nuclide://host.example.com/remote/root',
          status: 'init',
        },
        {
          pathToRoot: '/local/root',
          status: 'ready',
        },
        {
          pathToRoot: 'nuclide://host.example.com/remote/root',
          status: 'ready',
        },
      ];
      const expected: Array<BusySignalMessage> = [
        {
          status: 'busy',
          id: 0,
          message: 'Flow server is busy (/local/root)',
        },
        {
          status: 'busy',
          id: 1,
          message: 'Flow server is initializing (host.example.com:/remote/root)',
        },
        {
          status: 'done',
          id: 0,
        },
        {
          status: 'done',
          id: 1,
        },
      ];

      expect(
        await serverStatusUpdatesToBusyMessages(Observable.from(input)).toArray().toPromise(),
      ).diffJson(expected);
    });
  });
});
