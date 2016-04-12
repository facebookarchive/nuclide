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

var _rx = require('rx');

var _rx2 = _interopRequireDefault(_rx);

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNyZWF0ZVByb2Nlc3NTdHJlYW0uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OzhCQVd3Qyx1QkFBdUI7O29DQUNyQyw4QkFBOEI7Ozs7a0JBQ3pDLElBQUk7Ozs7QUFFWixTQUFTLG1CQUFtQixHQUEwQjtBQUMzRCxTQUFPLG9DQUFlLGNBQWMsQ0FBQyxDQUNsQyxHQUFHLENBQUMsVUFBQSxLQUFLLEVBQUk7QUFDWixRQUFJLEtBQUssQ0FBQyxJQUFJLEtBQUssT0FBTyxFQUFFO0FBQzFCLFlBQU0sS0FBSyxDQUFDLEtBQUssQ0FBQztLQUNuQjtBQUNELFFBQUksS0FBSyxDQUFDLElBQUksS0FBSyxNQUFNLEVBQUU7QUFDekIsWUFBTSxJQUFJLEtBQUssQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDO0tBQ25EO0FBQ0QsV0FBTyxLQUFLLENBQUM7R0FDZCxDQUFDOzs7R0FHRCxNQUFNLENBQUMsVUFBQSxLQUFLO1dBQUksS0FBSyxDQUFDLElBQUksS0FBSyxRQUFRO0dBQUEsQ0FBQyxDQUN4QyxHQUFHLENBQUMsVUFBQSxLQUFLO1dBQUksS0FBSyxDQUFDLElBQUksSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDO0dBQUEsQ0FBQzs7Ozs7R0FLNUQsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQ1o7O0FBRUQsU0FBUyxjQUFjLEdBQXdDO0FBQzdELFNBQU8sK0JBQ0gsa0NBQWMsR0FBRyxDQUFDLDhCQUE4QixDQUFDLEVBQ25ELENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUNwQyxDQUFDO0NBQ0giLCJmaWxlIjoiY3JlYXRlUHJvY2Vzc1N0cmVhbS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB7b2JzZXJ2ZVByb2Nlc3MsIHNhZmVTcGF3bn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1jb21tb25zJztcbmltcG9ydCBmZWF0dXJlQ29uZmlnIGZyb20gJy4uLy4uL251Y2xpZGUtZmVhdHVyZS1jb25maWcnO1xuaW1wb3J0IFJ4IGZyb20gJ3J4JztcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVByb2Nlc3NTdHJlYW0oKTogUnguT2JzZXJ2YWJsZTxzdHJpbmc+IHtcbiAgcmV0dXJuIG9ic2VydmVQcm9jZXNzKHNwYXduQWRiTG9nY2F0KVxuICAgIC5tYXAoZXZlbnQgPT4ge1xuICAgICAgaWYgKGV2ZW50LmtpbmQgPT09ICdlcnJvcicpIHtcbiAgICAgICAgdGhyb3cgZXZlbnQuZXJyb3I7XG4gICAgICB9XG4gICAgICBpZiAoZXZlbnQua2luZCA9PT0gJ2V4aXQnKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignYWRiIGxvZ2NhdCBleGl0ZWQgdW5leHBlY3RlZGx5Jyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gZXZlbnQ7XG4gICAgfSlcblxuICAgIC8vIE9ubHkgZ2V0IHRoZSB0ZXh0IGZyb20gc3Rkb3V0LlxuICAgIC5maWx0ZXIoZXZlbnQgPT4gZXZlbnQua2luZCA9PT0gJ3N0ZG91dCcpXG4gICAgLm1hcChldmVudCA9PiBldmVudC5kYXRhICYmIGV2ZW50LmRhdGEucmVwbGFjZSgvXFxyP1xcbiQvLCAnJykpXG5cbiAgICAvLyBTa2lwIHRoZSBzaW5nbGUgaGlzdG9yaWNhbCBsb2cuIEFkYiByZXF1aXJlcyB1cyB0byBoYXZlIGF0IGxlYXN0IG9uZSAoYC1UYCkgYnV0IChmb3Igbm93IGF0XG4gICAgLy8gbGVhc3QpIHdlIG9ubHkgd2FudCB0byBzaG93IGxpdmUgbG9ncy4gQWxzbywgc2luY2Ugd2UncmUgYXV0b21hdGljYWxseSByZXRyeWluZywgZGlzcGxheWluZ1xuICAgIC8vIGl0IHdvdWxkIG1lYW4gdXNlcnMgd291bGQgZ2V0IGFuIGluZXhwbGljYWJsZSBvbGQgZW50cnkuXG4gICAgLnNraXAoMSk7XG59XG5cbmZ1bmN0aW9uIHNwYXduQWRiTG9nY2F0KCk6IFByb21pc2U8Y2hpbGRfcHJvY2VzcyRDaGlsZFByb2Nlc3M+IHtcbiAgcmV0dXJuIHNhZmVTcGF3bihcbiAgICAoKGZlYXR1cmVDb25maWcuZ2V0KCdudWNsaWRlLWFkYi1sb2djYXQucGF0aFRvQWRiJyk6IGFueSk6IHN0cmluZyksXG4gICAgWydsb2djYXQnLCAnLXYnLCAnbG9uZycsICctVCcsICcxJ11cbiAgKTtcbn1cbiJdfQ==