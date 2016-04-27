var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * Status codes returned in the "status" field of the testing utility's JSON response.
 */
var Ansi = require('./Ansi');

var Status = Object.freeze({
  PASSED: 1,
  FAILED: 2,
  SKIPPED: 3,
  FATAL: 4,
  TIMEOUT: 5
});

var StatusSymbol = {};
StatusSymbol[Status.PASSED] = Ansi.GREEN + '✓' + Ansi.RESET;
StatusSymbol[Status.FAILED] = Ansi.RED + '✗' + Ansi.RESET;
StatusSymbol[Status.SKIPPED] = Ansi.YELLOW + '?' + Ansi.RESET;
StatusSymbol[Status.FATAL] = Ansi.RED + '✘' + Ansi.RESET;
StatusSymbol[Status.TIMEOUT] = Ansi.BLUE + '✉' + Ansi.RESET;

var StatusMessage = {};
StatusMessage[Status.PASSED] = Ansi.GREEN + '(PASS)' + Ansi.RESET;
StatusMessage[Status.FAILED] = Ansi.RED + '(FAIL)' + Ansi.RESET;
StatusMessage[Status.SKIPPED] = Ansi.YELLOW + '(SKIP)' + Ansi.RESET;
StatusMessage[Status.FATAL] = Ansi.RED + '(FATAL)' + Ansi.RESET;
StatusMessage[Status.TIMEOUT] = Ansi.BLUE + '(TIMEOUT)' + Ansi.RESET;

var TestRunModel = (function () {
  _createClass(TestRunModel, null, [{
    key: 'Status',
    value: Status,
    enumerable: true
  }]);

  function TestRunModel(label, dispose) {
    _classCallCheck(this, TestRunModel);

    this.label = label;
    this.dispose = dispose;
  }

  _createClass(TestRunModel, [{
    key: 'getDuration',
    value: function getDuration() {
      if (this.startTime && this.endTime) {
        return this.endTime - this.startTime;
      }
    }
  }, {
    key: 'start',
    value: function start() {
      this.startTime = Date.now();
    }
  }, {
    key: 'stop',
    value: function stop() {
      this.endTime = Date.now();
    }

    /**
     * @return A summary of the test run including its name, its duration, and whether it passed,
     * failed, skipped, etc.
     */
  }], [{
    key: 'formatStatusMessage',
    value: function formatStatusMessage(name, duration, status) {
      var durationStr = duration.toFixed(3);
      return '      ' + StatusSymbol[status] + ' ' + name + ' ' + durationStr + 's ' + StatusMessage[status];
    }
  }]);

  return TestRunModel;
})();

module.exports = TestRunModel;