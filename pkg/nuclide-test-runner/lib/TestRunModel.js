"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _Ansi() {
  const data = _interopRequireDefault(require("./Ansi"));

  _Ansi = function () {
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
 */

/**
 * Status codes returned in the "status" field of the testing utility's JSON response.
 */
const Status = Object.freeze({
  PASSED: 1,
  FAILED: 2,
  SKIPPED: 3,
  FATAL: 4,
  TIMEOUT: 5
});
const StatusSymbol = {};
StatusSymbol[Status.PASSED] = `${_Ansi().default.GREEN}✓${_Ansi().default.RESET}`;
StatusSymbol[Status.FAILED] = `${_Ansi().default.RED}✗${_Ansi().default.RESET}`;
StatusSymbol[Status.SKIPPED] = `${_Ansi().default.YELLOW}?${_Ansi().default.RESET}`;
StatusSymbol[Status.FATAL] = `${_Ansi().default.RED}✘${_Ansi().default.RESET}`;
StatusSymbol[Status.TIMEOUT] = `${_Ansi().default.BLUE}✉${_Ansi().default.RESET}`;
const StatusMessage = {};
StatusMessage[Status.PASSED] = `${_Ansi().default.GREEN}(PASS)${_Ansi().default.RESET}`;
StatusMessage[Status.FAILED] = `${_Ansi().default.RED}(FAIL)${_Ansi().default.RESET}`;
StatusMessage[Status.SKIPPED] = `${_Ansi().default.YELLOW}(SKIP)${_Ansi().default.RESET}`;
StatusMessage[Status.FATAL] = `${_Ansi().default.RED}(FATAL)${_Ansi().default.RESET}`;
StatusMessage[Status.TIMEOUT] = `${_Ansi().default.BLUE}(TIMEOUT)${_Ansi().default.RESET}`;

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