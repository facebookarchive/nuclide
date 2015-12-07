'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {activateAllPackages, deactivateAllPackages} from '../lib/package-utils';

describe('activate/deactivate all packages', () => {
  it('activates and deactivates packages correctly and without hanging', () => {
    waitsForPromise({timeout: 240000}, async () => {
      expect(atom.packages.getActivePackages().length).toBe(0);
      const activatedPackages = await activateAllPackages();
      expect(activatedPackages.length).toBe(atom.packages.getActivePackages().length);
      deactivateAllPackages();
      expect(atom.packages.getActivePackages().length).toBe(0);
    });
  });
});
