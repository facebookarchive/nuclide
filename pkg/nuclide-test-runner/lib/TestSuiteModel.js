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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlRlc3RTdWl0ZU1vZGVsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztJQWFNLGNBQWM7QUFLUCxXQUxQLGNBQWMsQ0FLTixXQUFvQyxFQUFFOzs7MEJBTDlDLGNBQWM7O0FBTWhCLFFBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUM3QixRQUFJLENBQUMsUUFBUSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7QUFDMUIsZUFBVyxDQUFDLE9BQU8sQ0FBQyxVQUFBLFNBQVM7YUFBSSxNQUFLLFdBQVcsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEVBQUUsRUFBRSxTQUFTLENBQUM7S0FBQSxDQUFDLENBQUM7R0FDakY7O2VBVEcsY0FBYzs7V0FXUixvQkFBQyxPQUFvQixFQUFRO0FBQ3JDLFVBQUksT0FBTyxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsRUFBRTs7QUFFdkMsWUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUM7T0FDbEQ7S0FDRjs7Ozs7Ozs7V0FNYywyQkFBWTtBQUN6QixVQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxLQUFLLENBQUMsRUFBRTtBQUMvQixlQUFPLElBQUksQ0FBQztPQUNiLE1BQU07QUFDTCxlQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQztPQUN6RDtLQUNGOzs7U0E1QkcsY0FBYzs7O0FBZ0NwQixNQUFNLENBQUMsT0FBTyxHQUFHLGNBQWMsQ0FBQyIsImZpbGUiOiJUZXN0U3VpdGVNb2RlbC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtUZXN0Q2xhc3NTdW1tYXJ5LCBUZXN0UnVuSW5mb30gZnJvbSAnLi4vLi4vbnVjbGlkZS10ZXN0LXJ1bm5lci1pbnRlcmZhY2VzJztcblxuY2xhc3MgVGVzdFN1aXRlTW9kZWwge1xuXG4gIHRlc3RDbGFzc2VzOiBNYXA8bnVtYmVyLCBUZXN0Q2xhc3NTdW1tYXJ5PjtcbiAgdGVzdFJ1bnM6IE1hcDxudW1iZXIsIFRlc3RSdW5JbmZvPjtcblxuICBjb25zdHJ1Y3Rvcih0ZXN0Q2xhc3NlczogQXJyYXk8VGVzdENsYXNzU3VtbWFyeT4pIHtcbiAgICB0aGlzLnRlc3RDbGFzc2VzID0gbmV3IE1hcCgpO1xuICAgIHRoaXMudGVzdFJ1bnMgPSBuZXcgTWFwKCk7XG4gICAgdGVzdENsYXNzZXMuZm9yRWFjaCh0ZXN0Q2xhc3MgPT4gdGhpcy50ZXN0Q2xhc3Nlcy5zZXQodGVzdENsYXNzLmlkLCB0ZXN0Q2xhc3MpKTtcbiAgfVxuXG4gIGFkZFRlc3RSdW4odGVzdFJ1bjogVGVzdFJ1bkluZm8pOiB2b2lkIHtcbiAgICBpZiAodGVzdFJ1bi5oYXNPd25Qcm9wZXJ0eSgndGVzdF9qc29uJykpIHtcbiAgICAgIC8vICRGbG93Rml4TWUocm9zc2FsbGVuKVxuICAgICAgdGhpcy50ZXN0UnVucy5zZXQodGVzdFJ1bi50ZXN0X2pzb24uaWQsIHRlc3RSdW4pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIGBudWxsYCBpZiB0aGVyZSBhcmUgbm8gdGVzdCBjbGFzc2VzIHRvIHJ1biwgb3RoZXJ3aXNlIDAgLSAxMDAgaW5kaWNhdGluZyBwZXJjZW50XG4gICAqIGNvbXBsZXRpb24gb2YgdGhpcyB0ZXN0IHN1aXRlLlxuICAgKi9cbiAgcHJvZ3Jlc3NQZXJjZW50KCk6ID9udW1iZXIge1xuICAgIGlmICh0aGlzLnRlc3RDbGFzc2VzLnNpemUgPT09IDApIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy50ZXN0UnVucy5zaXplIC8gdGhpcy50ZXN0Q2xhc3Nlcy5zaXplICogMTAwO1xuICAgIH1cbiAgfVxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gVGVzdFN1aXRlTW9kZWw7XG4iXX0=