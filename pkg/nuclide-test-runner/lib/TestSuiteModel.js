var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var TestSuiteModel = (function () {
  function TestSuiteModel(testClasses) {
    var _this = this;

    _classCallCheck(this, TestSuiteModel);

    this.testClasses = new Map();
    this.testRuns = new Map();
    testClasses.forEach(function (testClass) {
      return _this.testClasses.set(testClass.id, testClass);
    });
  }

  _createClass(TestSuiteModel, [{
    key: 'addTestRun',
    value: function addTestRun(testRun) {
      if (testRun.hasOwnProperty('test_json')) {
        // $FlowFixMe(rossallen)
        this.testRuns.set(testRun.test_json.id, testRun);
      }
    }

    /**
     * @return `null` if there are no test classes to run, otherwise 0 - 100 indicating percent
     * completion of this test suite.
     */
  }, {
    key: 'progressPercent',
    value: function progressPercent() {
      if (this.testClasses.size === 0) {
        return null;
      } else {
        return this.testRuns.size / this.testClasses.size * 100;
      }
    }
  }]);

  return TestSuiteModel;
})();

module.exports = TestSuiteModel;