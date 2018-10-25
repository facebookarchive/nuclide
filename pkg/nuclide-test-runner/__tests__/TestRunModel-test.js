"use strict";

function _TestRunModel() {
  const data = _interopRequireDefault(require("../lib/TestRunModel"));

  _TestRunModel = function () {
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
 *  strict-local
 * @format
 * @emails oncall+nuclide
 */
const TestRunStatus = _TestRunModel().default.Status;

describe('TestRunModel', () => {
  describe('formatStatusMessage', () => {
    it('prints pretty pass message', () => {
      expect(_TestRunModel().default.formatStatusMessage('Foo', 1.2, TestRunStatus.PASSED)).toEqual('      \u001B[32m✓\u001B[39m Foo 1.200s \u001B[32m(PASS)\u001B[39m');
    });
    it('prints pretty fail message', () => {
      expect(_TestRunModel().default.formatStatusMessage('Bar', 2.22555, TestRunStatus.FAILED)).toEqual('      \u001B[31m✗\u001B[39m Bar 2.226s \u001B[31m(FAIL)\u001B[39m');
    });
  });
});