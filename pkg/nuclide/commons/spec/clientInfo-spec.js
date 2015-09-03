'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {SMALLEST_NUCLIDE_BUILD_NUMBER} = require('../lib/clientInfo').__test__;

var spiedVersion = '';

function testIsRunningInNuclide(version: string, expected: boolean): void {
  spiedVersion = version;
  var {isRunningInNuclide} = require('../lib/clientInfo');
  expect(isRunningInNuclide()).toBe(expected);
}

describe('nuclide information test suite', () => {
  beforeEach(() => {
    global.atom = {
      getVersion: () => spiedVersion,
    };
  });

  afterEach(() => {
    delete global.atom;
  });

  it('tells if running in Nuclide', () => {
    // Atom release versions.
    testIsRunningInNuclide('1.0.0', false);
    testIsRunningInNuclide('1.0.2', false);
    // Atom development build versions.
    testIsRunningInNuclide('1.0.2-9432598', false);
    testIsRunningInNuclide('0.204.0-67f9d50', false);
    // Nuclide release versions.
    testIsRunningInNuclide('1.0.13332683', true);
    testIsRunningInNuclide('0.211.12184260', true);
    // Edge cases.
    testIsRunningInNuclide(`0.1.${SMALLEST_NUCLIDE_BUILD_NUMBER}`, true);
    testIsRunningInNuclide(`0.2.${SMALLEST_NUCLIDE_BUILD_NUMBER - 1}`, false);
  });
});
