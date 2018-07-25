"use strict";

function _process() {
  const data = require("../../../modules/nuclide-commons/process");

  _process = function () {
    return data;
  };

  return data;
}

function _analytics() {
  const data = require("../../../modules/nuclide-commons/analytics");

  _analytics = function () {
    return data;
  };

  return data;
}

function _log4js() {
  const data = _interopRequireDefault(require("log4js"));

  _log4js = function () {
    return data;
  };

  return data;
}

function _waits_for() {
  const data = _interopRequireDefault(require("../../../jest/waits_for"));

  _waits_for = function () {
    return data;
  };

  return data;
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
 * @emails oncall+nuclide
 */
jest.unmock('log4js');
global.NUCLIDE_DO_NOT_LOG = false;
describe('processTrackingAppender', () => {
  it('captures process exits', async () => {
    _log4js().default.configure({
      appenders: [{
        type: require.resolve("../lib/processTrackingAppender"),
        category: _process().LOG_CATEGORY
      }]
    });

    await (0, _process().runCommand)('true', ['1']).toPromise();
    await (0, _waits_for().default)(() => _analytics().trackSampled.mock.calls.length > 0);
    expect(_analytics().trackSampled).toHaveBeenCalledWith('process-exit', 10, {
      command: 'true 1',
      duration: jasmine.any(Number)
    });
  });
});