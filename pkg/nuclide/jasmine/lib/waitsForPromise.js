

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var invariant = require('assert');

/*eslint-disable no-unused-vars*/

/*eslint-enable no-unused-vars*/

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndhaXRzRm9yUHJvbWlzZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBV0EsSUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDOzs7Ozs7QUFTcEMsU0FBUyxlQUFlLEdBQXNFO29DQUFsRSxJQUFJO0FBQUosUUFBSTs7O0FBQzlCLE1BQUksWUFBWSxZQUFBLENBQUM7QUFDakIsTUFBSSxPQUFPLFlBQUEsQ0FBQztBQUNaLE1BQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7QUFDbkIsZ0JBQVksR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDO0FBQ3BDLFdBQU8sR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDO0dBQzNCLE1BQU07QUFDTCxnQkFBWSxHQUFHLEtBQUssQ0FBQztBQUNyQixXQUFPLEdBQUcsQ0FBQyxDQUFDO0dBQ2I7O0FBRUQsTUFBSSxRQUFRLEdBQUcsS0FBSyxDQUFDOztBQUVyQixNQUFJLENBQUMsWUFBTTtBQUNULFFBQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ2pDLGFBQVMsQ0FBQyxPQUFPLEVBQUUsS0FBSyxVQUFVLENBQUMsQ0FBQztBQUNwQyxRQUFNLE9BQU8sR0FBRyxFQUFFLEVBQUUsQ0FBQztBQUNyQixRQUFJLFlBQVksRUFBRTtBQUNoQixhQUFPLENBQUMsSUFBSSxDQUFDLFlBQU07QUFDakIsZUFBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQy9CLHNEQUFzRCxDQUFDLENBQUM7T0FDM0QsRUFBRSxZQUFNOztPQUVSLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBTTtBQUNaLGdCQUFRLEdBQUcsSUFBSSxDQUFDO09BQ2pCLENBQUMsQ0FBQztLQUNKLE1BQU07QUFDTCxhQUFPLENBQUMsSUFBSSxDQUFDLFlBQU07O09BRWxCLEVBQUUsVUFBQyxLQUFLLEVBQUs7QUFDWixZQUFNLElBQUksR0FBRyxLQUFLLEdBQUksS0FBSyxDQUFDLEtBQUssSUFBSSxLQUFLLENBQUMsUUFBUSxFQUFFLEdBQUksV0FBVyxDQUFDO0FBQ3JFLGVBQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxXQUFXLENBQUMsSUFBSSxnRUFDOEIsSUFBSSxDQUFHLENBQUM7T0FDeEUsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFNO0FBQ1osZ0JBQVEsR0FBRyxJQUFJLENBQUM7T0FDakIsQ0FBQyxDQUFDO0tBQ0o7R0FDRixDQUFDLENBQUM7O0FBRUgsVUFBUSxDQUFDLE9BQU8sRUFBRTtXQUFNLFFBQVE7R0FBQSxDQUFDLENBQUM7Q0FDbkM7O0FBRUQsTUFBTSxDQUFDLE9BQU8sR0FBRyxlQUFlLENBQUMiLCJmaWxlIjoid2FpdHNGb3JQcm9taXNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuY29uc3QgaW52YXJpYW50ID0gcmVxdWlyZSgnYXNzZXJ0Jyk7XG5cbi8qZXNsaW50LWRpc2FibGUgbm8tdW51c2VkLXZhcnMqL1xudHlwZSBXYWl0c0ZvclByb21pc2VPcHRpb25zID0ge1xuICBzaG91bGRSZWplY3Q/OiBib29sZWFuO1xuICB0aW1lb3V0PzogbnVtYmVyO1xufVxuLyplc2xpbnQtZW5hYmxlIG5vLXVudXNlZC12YXJzKi9cblxuZnVuY3Rpb24gd2FpdHNGb3JQcm9taXNlKC4uLmFyZ3M6IEFycmF5PFdhaXRzRm9yUHJvbWlzZU9wdGlvbnMgfCAoKSA9PiBQcm9taXNlPG1peGVkPj4pOiB2b2lkIHtcbiAgbGV0IHNob3VsZFJlamVjdDtcbiAgbGV0IHRpbWVvdXQ7XG4gIGlmIChhcmdzLmxlbmd0aCA+IDEpIHtcbiAgICBzaG91bGRSZWplY3QgPSBhcmdzWzBdLnNob3VsZFJlamVjdDtcbiAgICB0aW1lb3V0ID0gYXJnc1swXS50aW1lb3V0O1xuICB9IGVsc2Uge1xuICAgIHNob3VsZFJlamVjdCA9IGZhbHNlO1xuICAgIHRpbWVvdXQgPSAwO1xuICB9XG5cbiAgbGV0IGZpbmlzaGVkID0gZmFsc2U7XG5cbiAgcnVucygoKSA9PiB7XG4gICAgY29uc3QgZm4gPSBhcmdzW2FyZ3MubGVuZ3RoIC0gMV07XG4gICAgaW52YXJpYW50KHR5cGVvZiBmbiA9PT0gJ2Z1bmN0aW9uJyk7XG4gICAgY29uc3QgcHJvbWlzZSA9IGZuKCk7XG4gICAgaWYgKHNob3VsZFJlamVjdCkge1xuICAgICAgcHJvbWlzZS50aGVuKCgpID0+IHtcbiAgICAgICAgamFzbWluZS5nZXRFbnYoKS5jdXJyZW50U3BlYy5mYWlsKFxuICAgICAgICAgICdFeHBlY3RlZCBwcm9taXNlIHRvIGJlIHJlamVjdGVkLCBidXQgaXQgd2FzIHJlc29sdmVkJyk7XG4gICAgICB9LCAoKSA9PiB7XG4gICAgICAgIC8vIERvIG5vdGhpbmcsIGl0J3MgZXhwZWN0ZWQuXG4gICAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgICAgZmluaXNoZWQgPSB0cnVlO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHByb21pc2UudGhlbigoKSA9PiB7XG4gICAgICAgIC8vIERvIG5vdGhpbmcsIGl0J3MgZXhwZWN0ZWQuXG4gICAgICB9LCAoZXJyb3IpID0+IHtcbiAgICAgICAgY29uc3QgdGV4dCA9IGVycm9yID8gKGVycm9yLnN0YWNrIHx8IGVycm9yLnRvU3RyaW5nKCkpIDogJ3VuZGVmaW5lZCc7XG4gICAgICAgIGphc21pbmUuZ2V0RW52KCkuY3VycmVudFNwZWMuZmFpbChcbiAgICAgICAgICBgRXhwZWN0ZWQgcHJvbWlzZSB0byBiZSByZXNvbHZlZCwgYnV0IGl0IHdhcyByZWplY3RlZCB3aXRoICR7dGV4dH1gKTtcbiAgICAgIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgICBmaW5pc2hlZCA9IHRydWU7XG4gICAgICB9KTtcbiAgICB9XG4gIH0pO1xuXG4gIHdhaXRzRm9yKHRpbWVvdXQsICgpID0+IGZpbmlzaGVkKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB3YWl0c0ZvclByb21pc2U7XG4iXX0=