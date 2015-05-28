'use babel';
/* @flow */

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
