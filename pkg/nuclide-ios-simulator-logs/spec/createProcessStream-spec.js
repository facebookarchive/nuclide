'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {fsPromise} from '../../nuclide-commons';
import {_findAvailableDevice} from '../lib/createProcessStream';
import path from 'path';

describe('_findAvailableDevice', () => {

  it('identifies the active simulator', () => {
    waitsForPromise(async () => {
      const simctlOutput = await fsPromise.readFile(
        path.join(__dirname, 'fixtures', 'simctl-output.json')
      );
      const {devices} = JSON.parse(simctlOutput);
      const device = _findAvailableDevice(devices);
      expect(device).toEqual({
        state: 'Booted',
        availability: '(available)',
        name: 'iPhone 6s Plus',
        udid: '721337CC-8D03-4BBC-8119-2DC710B05D14',
      });
    });
  });

});
