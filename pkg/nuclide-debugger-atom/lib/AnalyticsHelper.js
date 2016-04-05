Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.beginTimerTracking = beginTimerTracking;
exports.failTimerTracking = failTimerTracking;
exports.endTimerTracking = endTimerTracking;

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _nuclideAnalytics = require('../../nuclide-analytics');

var timer = null;

function beginTimerTracking(eventName) {
  timer = (0, _nuclideAnalytics.startTracking)(eventName);
}

function failTimerTracking(err) {
  if (timer !== null) {
    timer.onError(err);
    timer = null;
  }
}

function endTimerTracking() {
  if (timer !== null) {
    timer.onSuccess();
    timer = null;
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkFuYWx5dGljc0hlbHBlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Z0NBVzRCLHlCQUF5Qjs7QUFFckQsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDOztBQUNWLFNBQVMsa0JBQWtCLENBQUMsU0FBaUIsRUFBRTtBQUNwRCxPQUFLLEdBQUcscUNBQWMsU0FBUyxDQUFDLENBQUM7Q0FDbEM7O0FBRU0sU0FBUyxpQkFBaUIsQ0FBQyxHQUFVLEVBQUU7QUFDNUMsTUFBSSxLQUFLLEtBQUssSUFBSSxFQUFFO0FBQ2xCLFNBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDbkIsU0FBSyxHQUFHLElBQUksQ0FBQztHQUNkO0NBQ0Y7O0FBRU0sU0FBUyxnQkFBZ0IsR0FBRztBQUNqQyxNQUFJLEtBQUssS0FBSyxJQUFJLEVBQUU7QUFDbEIsU0FBSyxDQUFDLFNBQVMsRUFBRSxDQUFDO0FBQ2xCLFNBQUssR0FBRyxJQUFJLENBQUM7R0FDZDtDQUNGIiwiZmlsZSI6IkFuYWx5dGljc0hlbHBlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB7c3RhcnRUcmFja2luZ30gZnJvbSAnLi4vLi4vbnVjbGlkZS1hbmFseXRpY3MnO1xuXG5sZXQgdGltZXIgPSBudWxsO1xuZXhwb3J0IGZ1bmN0aW9uIGJlZ2luVGltZXJUcmFja2luZyhldmVudE5hbWU6IHN0cmluZykge1xuICB0aW1lciA9IHN0YXJ0VHJhY2tpbmcoZXZlbnROYW1lKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZhaWxUaW1lclRyYWNraW5nKGVycjogRXJyb3IpIHtcbiAgaWYgKHRpbWVyICE9PSBudWxsKSB7XG4gICAgdGltZXIub25FcnJvcihlcnIpO1xuICAgIHRpbWVyID0gbnVsbDtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZW5kVGltZXJUcmFja2luZygpIHtcbiAgaWYgKHRpbWVyICE9PSBudWxsKSB7XG4gICAgdGltZXIub25TdWNjZXNzKCk7XG4gICAgdGltZXIgPSBudWxsO1xuICB9XG59XG4iXX0=