

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var invariant = require('assert');

function waitsForPromise() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var shouldReject = undefined;
  var timeout = undefined;
  if (args.length > 1) {
    shouldReject = args[0].shouldReject;
    timeout = args[0].timeout;
  } else {
    shouldReject = false;
    timeout = 0;
  }

  var finished = false;

  runs(function () {
    var fn = args[args.length - 1];
    invariant(typeof fn === 'function');
    var promise = fn();
    if (shouldReject) {
      promise.then(function () {
        jasmine.getEnv().currentSpec.fail('Expected promise to be rejected, but it was resolved');
      }, function () {
        // Do nothing, it's expected.
      }).then(function () {
        finished = true;
      });
    } else {
      promise.then(function () {
        // Do nothing, it's expected.
      }, function (error) {
        var text = error ? error.stack || error.toString() : 'undefined';
        jasmine.getEnv().currentSpec.fail('Expected promise to be resolved, but it was rejected with ' + text);
      }).then(function () {
        finished = true;
      });
    }
  });

  waitsFor(timeout, function () {
    return finished;
  });
}

module.exports = waitsForPromise;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndhaXRzRm9yUHJvbWlzZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBV0EsSUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDOztBQU9wQyxTQUFTLGVBQWUsR0FBc0U7b0NBQWxFLElBQUk7QUFBSixRQUFJOzs7QUFDOUIsTUFBSSxZQUFZLFlBQUEsQ0FBQztBQUNqQixNQUFJLE9BQU8sWUFBQSxDQUFDO0FBQ1osTUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtBQUNuQixnQkFBWSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUM7QUFDcEMsV0FBTyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUM7R0FDM0IsTUFBTTtBQUNMLGdCQUFZLEdBQUcsS0FBSyxDQUFDO0FBQ3JCLFdBQU8sR0FBRyxDQUFDLENBQUM7R0FDYjs7QUFFRCxNQUFJLFFBQVEsR0FBRyxLQUFLLENBQUM7O0FBRXJCLE1BQUksQ0FBQyxZQUFNO0FBQ1QsUUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDakMsYUFBUyxDQUFDLE9BQU8sRUFBRSxLQUFLLFVBQVUsQ0FBQyxDQUFDO0FBQ3BDLFFBQU0sT0FBTyxHQUFHLEVBQUUsRUFBRSxDQUFDO0FBQ3JCLFFBQUksWUFBWSxFQUFFO0FBQ2hCLGFBQU8sQ0FBQyxJQUFJLENBQUMsWUFBTTtBQUNqQixlQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsV0FBVyxDQUFDLElBQUksQ0FDL0Isc0RBQXNELENBQUMsQ0FBQztPQUMzRCxFQUFFLFlBQU07O09BRVIsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFNO0FBQ1osZ0JBQVEsR0FBRyxJQUFJLENBQUM7T0FDakIsQ0FBQyxDQUFDO0tBQ0osTUFBTTtBQUNMLGFBQU8sQ0FBQyxJQUFJLENBQUMsWUFBTTs7T0FFbEIsRUFBRSxVQUFBLEtBQUssRUFBSTtBQUNWLFlBQU0sSUFBSSxHQUFHLEtBQUssR0FBSSxLQUFLLENBQUMsS0FBSyxJQUFJLEtBQUssQ0FBQyxRQUFRLEVBQUUsR0FBSSxXQUFXLENBQUM7QUFDckUsZUFBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLFdBQVcsQ0FBQyxJQUFJLGdFQUM4QixJQUFJLENBQUcsQ0FBQztPQUN4RSxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQU07QUFDWixnQkFBUSxHQUFHLElBQUksQ0FBQztPQUNqQixDQUFDLENBQUM7S0FDSjtHQUNGLENBQUMsQ0FBQzs7QUFFSCxVQUFRLENBQUMsT0FBTyxFQUFFO1dBQU0sUUFBUTtHQUFBLENBQUMsQ0FBQztDQUNuQzs7QUFFRCxNQUFNLENBQUMsT0FBTyxHQUFHLGVBQWUsQ0FBQyIsImZpbGUiOiJ3YWl0c0ZvclByb21pc2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5jb25zdCBpbnZhcmlhbnQgPSByZXF1aXJlKCdhc3NlcnQnKTtcblxudHlwZSBXYWl0c0ZvclByb21pc2VPcHRpb25zID0ge1xuICBzaG91bGRSZWplY3Q/OiBib29sZWFuO1xuICB0aW1lb3V0PzogbnVtYmVyO1xufTtcblxuZnVuY3Rpb24gd2FpdHNGb3JQcm9taXNlKC4uLmFyZ3M6IEFycmF5PFdhaXRzRm9yUHJvbWlzZU9wdGlvbnMgfCAoKSA9PiBQcm9taXNlPG1peGVkPj4pOiB2b2lkIHtcbiAgbGV0IHNob3VsZFJlamVjdDtcbiAgbGV0IHRpbWVvdXQ7XG4gIGlmIChhcmdzLmxlbmd0aCA+IDEpIHtcbiAgICBzaG91bGRSZWplY3QgPSBhcmdzWzBdLnNob3VsZFJlamVjdDtcbiAgICB0aW1lb3V0ID0gYXJnc1swXS50aW1lb3V0O1xuICB9IGVsc2Uge1xuICAgIHNob3VsZFJlamVjdCA9IGZhbHNlO1xuICAgIHRpbWVvdXQgPSAwO1xuICB9XG5cbiAgbGV0IGZpbmlzaGVkID0gZmFsc2U7XG5cbiAgcnVucygoKSA9PiB7XG4gICAgY29uc3QgZm4gPSBhcmdzW2FyZ3MubGVuZ3RoIC0gMV07XG4gICAgaW52YXJpYW50KHR5cGVvZiBmbiA9PT0gJ2Z1bmN0aW9uJyk7XG4gICAgY29uc3QgcHJvbWlzZSA9IGZuKCk7XG4gICAgaWYgKHNob3VsZFJlamVjdCkge1xuICAgICAgcHJvbWlzZS50aGVuKCgpID0+IHtcbiAgICAgICAgamFzbWluZS5nZXRFbnYoKS5jdXJyZW50U3BlYy5mYWlsKFxuICAgICAgICAgICdFeHBlY3RlZCBwcm9taXNlIHRvIGJlIHJlamVjdGVkLCBidXQgaXQgd2FzIHJlc29sdmVkJyk7XG4gICAgICB9LCAoKSA9PiB7XG4gICAgICAgIC8vIERvIG5vdGhpbmcsIGl0J3MgZXhwZWN0ZWQuXG4gICAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgICAgZmluaXNoZWQgPSB0cnVlO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHByb21pc2UudGhlbigoKSA9PiB7XG4gICAgICAgIC8vIERvIG5vdGhpbmcsIGl0J3MgZXhwZWN0ZWQuXG4gICAgICB9LCBlcnJvciA9PiB7XG4gICAgICAgIGNvbnN0IHRleHQgPSBlcnJvciA/IChlcnJvci5zdGFjayB8fCBlcnJvci50b1N0cmluZygpKSA6ICd1bmRlZmluZWQnO1xuICAgICAgICBqYXNtaW5lLmdldEVudigpLmN1cnJlbnRTcGVjLmZhaWwoXG4gICAgICAgICAgYEV4cGVjdGVkIHByb21pc2UgdG8gYmUgcmVzb2x2ZWQsIGJ1dCBpdCB3YXMgcmVqZWN0ZWQgd2l0aCAke3RleHR9YCk7XG4gICAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgICAgZmluaXNoZWQgPSB0cnVlO1xuICAgICAgfSk7XG4gICAgfVxuICB9KTtcblxuICB3YWl0c0Zvcih0aW1lb3V0LCAoKSA9PiBmaW5pc2hlZCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gd2FpdHNGb3JQcm9taXNlO1xuIl19