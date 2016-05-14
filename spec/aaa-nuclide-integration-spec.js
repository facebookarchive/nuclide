'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import util from 'util';

import {
  activateAllPackages,
  deactivateAllPackages,
  jasmineIntegrationTestSetup,
} from '../pkg/nuclide-integration-test-helpers';

describe('aaa-nuclide', () => {
  it('print the environment', () => {
    // eslint-disable-next-line no-console
    console.log(util.inspect(process.env));

    const userConfigPath = atom.config.getUserConfigPath();
    const rawConfig = atom.config.getRawValue('', {sources: userConfigPath});

    // eslint-disable-next-line no-console
    console.log(util.inspect(rawConfig, {depth: null}));

    expect(true).toBe(true);
  });

  it('deactivates cleanly', () => {
    // This test has a high timeout because when it runs on the CI, the
    // transpile cache is cold. This test, among other things, warms up the
    // cache as a side-effect.
    waitsForPromise({timeout: 30000}, async () => {
      jasmineIntegrationTestSetup();

      await activateAllPackages();
      await sleep(500);
      spyOn(console, 'error').andCallThrough();
      deactivateAllPackages();
      await sleep(500);

      // eslint-disable-next-line no-console
      console.error.argsForCall.forEach(args => {
        // If this test is failing for you, the easiest way to repro is to
        // "disable" Nuclide from the Settings view.
        expect(args[0]).not.toMatch(/^Error deactivating/i);
      });
    });
  });
});

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
