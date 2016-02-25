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

var _analytics = require('../../../analytics');

var timer = null;

function beginTimerTracking(eventName) {
  timer = (0, _analytics.startTracking)(eventName);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkFuYWx5dGljc0hlbHBlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7eUJBVzRCLG9CQUFvQjs7QUFFaEQsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDOztBQUNWLFNBQVMsa0JBQWtCLENBQUMsU0FBaUIsRUFBRTtBQUNwRCxPQUFLLEdBQUcsOEJBQWMsU0FBUyxDQUFDLENBQUM7Q0FDbEM7O0FBRU0sU0FBUyxpQkFBaUIsQ0FBQyxHQUFVLEVBQUU7QUFDNUMsTUFBSSxLQUFLLEtBQUssSUFBSSxFQUFFO0FBQ2xCLFNBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDbkIsU0FBSyxHQUFHLElBQUksQ0FBQztHQUNkO0NBQ0Y7O0FBRU0sU0FBUyxnQkFBZ0IsR0FBRztBQUNqQyxNQUFJLEtBQUssS0FBSyxJQUFJLEVBQUU7QUFDbEIsU0FBSyxDQUFDLFNBQVMsRUFBRSxDQUFDO0FBQ2xCLFNBQUssR0FBRyxJQUFJLENBQUM7R0FDZDtDQUNGIiwiZmlsZSI6IkFuYWx5dGljc0hlbHBlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB7c3RhcnRUcmFja2luZ30gZnJvbSAnLi4vLi4vLi4vYW5hbHl0aWNzJztcblxubGV0IHRpbWVyID0gbnVsbDtcbmV4cG9ydCBmdW5jdGlvbiBiZWdpblRpbWVyVHJhY2tpbmcoZXZlbnROYW1lOiBzdHJpbmcpIHtcbiAgdGltZXIgPSBzdGFydFRyYWNraW5nKGV2ZW50TmFtZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmYWlsVGltZXJUcmFja2luZyhlcnI6IEVycm9yKSB7XG4gIGlmICh0aW1lciAhPT0gbnVsbCkge1xuICAgIHRpbWVyLm9uRXJyb3IoZXJyKTtcbiAgICB0aW1lciA9IG51bGw7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGVuZFRpbWVyVHJhY2tpbmcoKSB7XG4gIGlmICh0aW1lciAhPT0gbnVsbCkge1xuICAgIHRpbWVyLm9uU3VjY2VzcygpO1xuICAgIHRpbWVyID0gbnVsbDtcbiAgfVxufVxuIl19