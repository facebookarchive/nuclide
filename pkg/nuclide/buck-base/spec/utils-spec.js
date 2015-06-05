'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var utils = require('../lib/utils');

describe('isBuildSuccessful()', () => {
  it('accepts report without failures', () => {
    var report = {
      results: {
        '//:good_rule': {
          success: true,
          type: 'BUILT_LOCALLY',
          output: 'buck-out/gen/good.txt',
        },
      }
    };
    expect(utils.isBuildSuccessful(report)).toBe(true);
  });

  it('rejects report with failure', () => {
    var report = {
      results: {
        '//:good_rule': {
          success: true,
          type: 'BUILT_LOCALLY',
          output: 'buck-out/gen/good.txt',
        },
        '//:bad_rule': {
          success: false,
        },
      }
    };
    expect(utils.isBuildSuccessful(report)).toBe(false);
  });
});
