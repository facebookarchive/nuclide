'use strict';

var _TestRunModel;

function _load_TestRunModel() {
  return _TestRunModel = _interopRequireDefault(require('../lib/TestRunModel'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const TestRunStatus = (_TestRunModel || _load_TestRunModel()).default.Status; /**
                                                                               * Copyright (c) 2015-present, Facebook, Inc.
                                                                               * All rights reserved.
                                                                               *
                                                                               * This source code is licensed under the license found in the LICENSE file in
                                                                               * the root directory of this source tree.
                                                                               *
                                                                               *  strict-local
                                                                               * @format
                                                                               */

describe('TestRunModel', () => {
  describe('formatStatusMessage', () => {
    it('prints pretty pass message', () => {
      expect((_TestRunModel || _load_TestRunModel()).default.formatStatusMessage('Foo', 1.2, TestRunStatus.PASSED)).toEqual('      \u001B[32m✓\u001B[39m Foo 1.200s \u001B[32m(PASS)\u001B[39m');
    });

    it('prints pretty fail message', () => {
      expect((_TestRunModel || _load_TestRunModel()).default.formatStatusMessage('Bar', 2.22555, TestRunStatus.FAILED)).toEqual('      \u001B[31m✗\u001B[39m Bar 2.226s \u001B[31m(FAIL)\u001B[39m');
    });
  });
});