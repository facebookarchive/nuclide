Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.createProcessStream = createProcessStream;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _nuclideCommons = require('../../nuclide-commons');

var _nuclideFeatureConfig = require('../../nuclide-feature-config');

var _nuclideFeatureConfig2 = _interopRequireDefault(_nuclideFeatureConfig);

var _reactivexRxjs = require('@reactivex/rxjs');

var _reactivexRxjs2 = _interopRequireDefault(_reactivexRxjs);

function createProcessStream() {
  return (0, _nuclideCommons.observeProcess)(spawnAdbLogcat).map(function (event) {
    if (event.kind === 'error') {
      throw event.error;
    }
    if (event.kind === 'exit') {
      throw new Error('adb logcat exited unexpectedly');
    }
    return event;
  })

  // Only get the text from stdout.
  .filter(function (event) {
    return event.kind === 'stdout';
  }).map(function (event) {
    return event.data && event.data.replace(/\r?\n$/, '');
  })

  // Skip the single historical log. Adb requires us to have at least one (`-T`) but (for now at
  // least) we only want to show live logs. Also, since we're automatically retrying, displaying
  // it would mean users would get an inexplicable old entry.
  .skip(1);
}

function spawnAdbLogcat() {
  return (0, _nuclideCommons.safeSpawn)(_nuclideFeatureConfig2['default'].get('nuclide-adb-logcat.pathToAdb'), ['logcat', '-v', 'long', '-T', '1']);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNyZWF0ZVByb2Nlc3NTdHJlYW0uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OzhCQVd3Qyx1QkFBdUI7O29DQUNyQyw4QkFBOEI7Ozs7NkJBQ3pDLGlCQUFpQjs7OztBQUV6QixTQUFTLG1CQUFtQixHQUEwQjtBQUMzRCxTQUFPLG9DQUFlLGNBQWMsQ0FBQyxDQUNsQyxHQUFHLENBQUMsVUFBQSxLQUFLLEVBQUk7QUFDWixRQUFJLEtBQUssQ0FBQyxJQUFJLEtBQUssT0FBTyxFQUFFO0FBQzFCLFlBQU0sS0FBSyxDQUFDLEtBQUssQ0FBQztLQUNuQjtBQUNELFFBQUksS0FBSyxDQUFDLElBQUksS0FBSyxNQUFNLEVBQUU7QUFDekIsWUFBTSxJQUFJLEtBQUssQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDO0tBQ25EO0FBQ0QsV0FBTyxLQUFLLENBQUM7R0FDZCxDQUFDOzs7R0FHRCxNQUFNLENBQUMsVUFBQSxLQUFLO1dBQUksS0FBSyxDQUFDLElBQUksS0FBSyxRQUFRO0dBQUEsQ0FBQyxDQUN4QyxHQUFHLENBQUMsVUFBQSxLQUFLO1dBQUksS0FBSyxDQUFDLElBQUksSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDO0dBQUEsQ0FBQzs7Ozs7R0FLNUQsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQ1o7O0FBRUQsU0FBUyxjQUFjLEdBQXdDO0FBQzdELFNBQU8sK0JBQ0gsa0NBQWMsR0FBRyxDQUFDLDhCQUE4QixDQUFDLEVBQ25ELENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUNwQyxDQUFDO0NBQ0giLCJmaWxlIjoiY3JlYXRlUHJvY2Vzc1N0cmVhbS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB7b2JzZXJ2ZVByb2Nlc3MsIHNhZmVTcGF3bn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1jb21tb25zJztcbmltcG9ydCBmZWF0dXJlQ29uZmlnIGZyb20gJy4uLy4uL251Y2xpZGUtZmVhdHVyZS1jb25maWcnO1xuaW1wb3J0IFJ4IGZyb20gJ0ByZWFjdGl2ZXgvcnhqcyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVQcm9jZXNzU3RyZWFtKCk6IFJ4Lk9ic2VydmFibGU8c3RyaW5nPiB7XG4gIHJldHVybiBvYnNlcnZlUHJvY2VzcyhzcGF3bkFkYkxvZ2NhdClcbiAgICAubWFwKGV2ZW50ID0+IHtcbiAgICAgIGlmIChldmVudC5raW5kID09PSAnZXJyb3InKSB7XG4gICAgICAgIHRocm93IGV2ZW50LmVycm9yO1xuICAgICAgfVxuICAgICAgaWYgKGV2ZW50LmtpbmQgPT09ICdleGl0Jykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2FkYiBsb2djYXQgZXhpdGVkIHVuZXhwZWN0ZWRseScpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGV2ZW50O1xuICAgIH0pXG5cbiAgICAvLyBPbmx5IGdldCB0aGUgdGV4dCBmcm9tIHN0ZG91dC5cbiAgICAuZmlsdGVyKGV2ZW50ID0+IGV2ZW50LmtpbmQgPT09ICdzdGRvdXQnKVxuICAgIC5tYXAoZXZlbnQgPT4gZXZlbnQuZGF0YSAmJiBldmVudC5kYXRhLnJlcGxhY2UoL1xccj9cXG4kLywgJycpKVxuXG4gICAgLy8gU2tpcCB0aGUgc2luZ2xlIGhpc3RvcmljYWwgbG9nLiBBZGIgcmVxdWlyZXMgdXMgdG8gaGF2ZSBhdCBsZWFzdCBvbmUgKGAtVGApIGJ1dCAoZm9yIG5vdyBhdFxuICAgIC8vIGxlYXN0KSB3ZSBvbmx5IHdhbnQgdG8gc2hvdyBsaXZlIGxvZ3MuIEFsc28sIHNpbmNlIHdlJ3JlIGF1dG9tYXRpY2FsbHkgcmV0cnlpbmcsIGRpc3BsYXlpbmdcbiAgICAvLyBpdCB3b3VsZCBtZWFuIHVzZXJzIHdvdWxkIGdldCBhbiBpbmV4cGxpY2FibGUgb2xkIGVudHJ5LlxuICAgIC5za2lwKDEpO1xufVxuXG5mdW5jdGlvbiBzcGF3bkFkYkxvZ2NhdCgpOiBQcm9taXNlPGNoaWxkX3Byb2Nlc3MkQ2hpbGRQcm9jZXNzPiB7XG4gIHJldHVybiBzYWZlU3Bhd24oXG4gICAgKChmZWF0dXJlQ29uZmlnLmdldCgnbnVjbGlkZS1hZGItbG9nY2F0LnBhdGhUb0FkYicpOiBhbnkpOiBzdHJpbmcpLFxuICAgIFsnbG9nY2F0JywgJy12JywgJ2xvbmcnLCAnLVQnLCAnMSddXG4gICk7XG59XG4iXX0=