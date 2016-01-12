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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlRlc3RTdWl0ZU1vZGVsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztJQWFNLGNBQWM7QUFLUCxXQUxQLGNBQWMsQ0FLTixXQUFvQyxFQUFFOzs7MEJBTDlDLGNBQWM7O0FBTWhCLFFBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUM3QixRQUFJLENBQUMsUUFBUSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7QUFDMUIsZUFBVyxDQUFDLE9BQU8sQ0FBQyxVQUFBLFNBQVM7YUFBSSxNQUFLLFdBQVcsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEVBQUUsRUFBRSxTQUFTLENBQUM7S0FBQSxDQUFDLENBQUM7R0FDakY7O2VBVEcsY0FBYzs7V0FXUixvQkFBQyxPQUFvQixFQUFRO0FBQ3JDLFVBQUksT0FBTyxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsRUFBRTs7QUFFdkMsWUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUM7T0FDbEQ7S0FDRjs7Ozs7Ozs7V0FNYywyQkFBWTtBQUN6QixVQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxLQUFLLENBQUMsRUFBRTtBQUMvQixlQUFPLElBQUksQ0FBQztPQUNiLE1BQU07QUFDTCxlQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQztPQUN6RDtLQUNGOzs7U0E1QkcsY0FBYzs7O0FBZ0NwQixNQUFNLENBQUMsT0FBTyxHQUFHLGNBQWMsQ0FBQyIsImZpbGUiOiJUZXN0U3VpdGVNb2RlbC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtUZXN0Q2xhc3NTdW1tYXJ5LCBUZXN0UnVuSW5mb30gZnJvbSAnLi4vLi4vdGVzdC1ydW5uZXItaW50ZXJmYWNlcyc7XG5cbmNsYXNzIFRlc3RTdWl0ZU1vZGVsIHtcblxuICB0ZXN0Q2xhc3NlczogTWFwPG51bWJlciwgVGVzdENsYXNzU3VtbWFyeT47XG4gIHRlc3RSdW5zOiBNYXA8bnVtYmVyLCBUZXN0UnVuSW5mbz47XG5cbiAgY29uc3RydWN0b3IodGVzdENsYXNzZXM6IEFycmF5PFRlc3RDbGFzc1N1bW1hcnk+KSB7XG4gICAgdGhpcy50ZXN0Q2xhc3NlcyA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLnRlc3RSdW5zID0gbmV3IE1hcCgpO1xuICAgIHRlc3RDbGFzc2VzLmZvckVhY2godGVzdENsYXNzID0+IHRoaXMudGVzdENsYXNzZXMuc2V0KHRlc3RDbGFzcy5pZCwgdGVzdENsYXNzKSk7XG4gIH1cblxuICBhZGRUZXN0UnVuKHRlc3RSdW46IFRlc3RSdW5JbmZvKTogdm9pZCB7XG4gICAgaWYgKHRlc3RSdW4uaGFzT3duUHJvcGVydHkoJ3Rlc3RfanNvbicpKSB7XG4gICAgICAvLyAkRmxvd0ZpeE1lKHJvc3NhbGxlbilcbiAgICAgIHRoaXMudGVzdFJ1bnMuc2V0KHRlc3RSdW4udGVzdF9qc29uLmlkLCB0ZXN0UnVuKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybiBgbnVsbGAgaWYgdGhlcmUgYXJlIG5vIHRlc3QgY2xhc3NlcyB0byBydW4sIG90aGVyd2lzZSAwIC0gMTAwIGluZGljYXRpbmcgcGVyY2VudFxuICAgKiBjb21wbGV0aW9uIG9mIHRoaXMgdGVzdCBzdWl0ZS5cbiAgICovXG4gIHByb2dyZXNzUGVyY2VudCgpOiA/bnVtYmVyIHtcbiAgICBpZiAodGhpcy50ZXN0Q2xhc3Nlcy5zaXplID09PSAwKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMudGVzdFJ1bnMuc2l6ZSAvIHRoaXMudGVzdENsYXNzZXMuc2l6ZSAqIDEwMDtcbiAgICB9XG4gIH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRlc3RTdWl0ZU1vZGVsO1xuIl19