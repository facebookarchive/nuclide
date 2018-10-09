"use strict";

function _systemInfo() {
  const data = require("../system-info");

  _systemInfo = function () {
    return data;
  };

  return data;
}

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails oncall+nuclide
 *  strict-local
 * @format
 */
test('isRunningInTest', () => {
  expect((0, _systemInfo().isRunningInTest)()).toBe(true);
});