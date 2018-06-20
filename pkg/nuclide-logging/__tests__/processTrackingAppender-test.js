'use strict';

var _log4js;

function _load_log4js() {
  return _log4js = _interopRequireDefault(require('log4js'));
}

var _process;

function _load_process() {
  return _process = require('../../../modules/nuclide-commons/process');
}

var _waits_for;

function _load_waits_for() {
  return _waits_for = _interopRequireDefault(require('../../../jest/waits_for'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

jest.unmock('log4js');
jest.unmock('../../../modules/nuclide-commons/analytics');
jest.unmock('../../nuclide-analytics');

global.NUCLIDE_DO_NOT_LOG = false;

describe('processTrackingAppender', () => {
  const trackSpy = jest.spyOn(require('../../../modules/nuclide-commons/analytics'), 'trackSampled');
  it('captures process exits', async () => {
    (_log4js || _load_log4js()).default.configure({
      appenders: [{
        type: require.resolve('../lib/processTrackingAppender'),
        category: (_process || _load_process()).LOG_CATEGORY
      }]
    });

    await (0, (_process || _load_process()).runCommand)('true', ['1']).toPromise();

    await (0, (_waits_for || _load_waits_for()).default)(() => trackSpy.mock.calls.length > 0);

    expect(trackSpy).toHaveBeenCalledWith('process-exit', 10, {
      command: 'true 1',
      duration: jasmine.any(Number)
    });
  });
});