'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Ansi;

function _load_Ansi() {
  return _Ansi = _interopRequireDefault(require('./Ansi'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Status codes returned in the "status" field of the testing utility's JSON response.
 */
const Status = Object.freeze({
  PASSED: 1,
  FAILED: 2,
  SKIPPED: 3,
  FATAL: 4,
  TIMEOUT: 5
}); /**
     * Copyright (c) 2015-present, Facebook, Inc.
     * All rights reserved.
     *
     * This source code is licensed under the license found in the LICENSE file in
     * the root directory of this source tree.
     *
     * 
     * @format
     */

const StatusSymbol = {};
StatusSymbol[Status.PASSED] = `${(_Ansi || _load_Ansi()).default.GREEN}✓${(_Ansi || _load_Ansi()).default.RESET}`;
StatusSymbol[Status.FAILED] = `${(_Ansi || _load_Ansi()).default.RED}✗${(_Ansi || _load_Ansi()).default.RESET}`;
StatusSymbol[Status.SKIPPED] = `${(_Ansi || _load_Ansi()).default.YELLOW}?${(_Ansi || _load_Ansi()).default.RESET}`;
StatusSymbol[Status.FATAL] = `${(_Ansi || _load_Ansi()).default.RED}✘${(_Ansi || _load_Ansi()).default.RESET}`;
StatusSymbol[Status.TIMEOUT] = `${(_Ansi || _load_Ansi()).default.BLUE}✉${(_Ansi || _load_Ansi()).default.RESET}`;

const StatusMessage = {};
StatusMessage[Status.PASSED] = `${(_Ansi || _load_Ansi()).default.GREEN}(PASS)${(_Ansi || _load_Ansi()).default.RESET}`;
StatusMessage[Status.FAILED] = `${(_Ansi || _load_Ansi()).default.RED}(FAIL)${(_Ansi || _load_Ansi()).default.RESET}`;
StatusMessage[Status.SKIPPED] = `${(_Ansi || _load_Ansi()).default.YELLOW}(SKIP)${(_Ansi || _load_Ansi()).default.RESET}`;
StatusMessage[Status.FATAL] = `${(_Ansi || _load_Ansi()).default.RED}(FATAL)${(_Ansi || _load_Ansi()).default.RESET}`;
StatusMessage[Status.TIMEOUT] = `${(_Ansi || _load_Ansi()).default.BLUE}(TIMEOUT)${(_Ansi || _load_Ansi()).default.RESET}`;

class TestRunModel {

  constructor(label, dispose) {
    this.label = label;
    this.dispose = dispose;
  }

  getDuration() {
    // flowlint-next-line sketchy-null-number:off
    if (this.startTime && this.endTime) {
      return this.endTime - this.startTime;
    }
  }

  start() {
    this.startTime = Date.now();
  }

  stop() {
    this.endTime = Date.now();
  }

  /**
   * @return A summary of the test run including its name, its duration, and whether it passed,
   * failed, skipped, etc.
   */
  static formatStatusMessage(name, duration, status) {
    const durationStr = duration.toFixed(3);
    return `      ${StatusSymbol[status]} ${name} ${durationStr}s ${StatusMessage[status]}`;
  }
}
exports.default = TestRunModel;
TestRunModel.Status = Status;