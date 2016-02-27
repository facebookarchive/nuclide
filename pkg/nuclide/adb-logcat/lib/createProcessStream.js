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

var _commons = require('../../commons');

var _rx = require('rx');

var _rx2 = _interopRequireDefault(_rx);

function createProcessStream() {
  return (0, _commons.observeProcess)(spawnAdbLogcat).map(function (event) {
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
  return (0, _commons.safeSpawn)('adb', ['logcat', '-v', 'long', '-T', '1']);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNyZWF0ZVByb2Nlc3NTdHJlYW0uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O3VCQVd3QyxlQUFlOztrQkFDeEMsSUFBSTs7OztBQUVaLFNBQVMsbUJBQW1CLEdBQTBCO0FBQzNELFNBQU8sNkJBQWUsY0FBYyxDQUFDLENBQ2xDLEdBQUcsQ0FBQyxVQUFBLEtBQUssRUFBSTtBQUNaLFFBQUksS0FBSyxDQUFDLElBQUksS0FBSyxNQUFNLEVBQUU7QUFDekIsWUFBTSxJQUFJLEtBQUssQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDO0tBQ25EO0FBQ0QsV0FBTyxLQUFLLENBQUM7R0FDZCxDQUFDOzs7R0FHRCxNQUFNLENBQUMsVUFBQSxLQUFLO1dBQUksS0FBSyxDQUFDLElBQUksS0FBSyxRQUFRO0dBQUEsQ0FBQyxDQUN4QyxHQUFHLENBQUMsVUFBQSxLQUFLO1dBQUksS0FBSyxDQUFDLElBQUksSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDO0dBQUEsQ0FBQzs7Ozs7R0FLNUQsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQ1o7O0FBRUQsU0FBUyxjQUFjLEdBQXdDO0FBQzdELFNBQU8sd0JBQVUsS0FBSyxFQUFFLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7Q0FDOUQiLCJmaWxlIjoiY3JlYXRlUHJvY2Vzc1N0cmVhbS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB7b2JzZXJ2ZVByb2Nlc3MsIHNhZmVTcGF3bn0gZnJvbSAnLi4vLi4vY29tbW9ucyc7XG5pbXBvcnQgUnggZnJvbSAncngnO1xuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlUHJvY2Vzc1N0cmVhbSgpOiBSeC5PYnNlcnZhYmxlPHN0cmluZz4ge1xuICByZXR1cm4gb2JzZXJ2ZVByb2Nlc3Moc3Bhd25BZGJMb2djYXQpXG4gICAgLm1hcChldmVudCA9PiB7XG4gICAgICBpZiAoZXZlbnQua2luZCA9PT0gJ2V4aXQnKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignYWRiIGxvZ2NhdCBleGl0ZWQgdW5leHBlY3RlZGx5Jyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gZXZlbnQ7XG4gICAgfSlcblxuICAgIC8vIE9ubHkgZ2V0IHRoZSB0ZXh0IGZyb20gc3Rkb3V0LlxuICAgIC5maWx0ZXIoZXZlbnQgPT4gZXZlbnQua2luZCA9PT0gJ3N0ZG91dCcpXG4gICAgLm1hcChldmVudCA9PiBldmVudC5kYXRhICYmIGV2ZW50LmRhdGEucmVwbGFjZSgvXFxyP1xcbiQvLCAnJykpXG5cbiAgICAvLyBTa2lwIHRoZSBzaW5nbGUgaGlzdG9yaWNhbCBsb2cuIEFkYiByZXF1aXJlcyB1cyB0byBoYXZlIGF0IGxlYXN0IG9uZSAoYC1UYCkgYnV0IChmb3Igbm93IGF0XG4gICAgLy8gbGVhc3QpIHdlIG9ubHkgd2FudCB0byBzaG93IGxpdmUgbG9ncy4gQWxzbywgc2luY2Ugd2UncmUgYXV0b21hdGljYWxseSByZXRyeWluZywgZGlzcGxheWluZ1xuICAgIC8vIGl0IHdvdWxkIG1lYW4gdXNlcnMgd291bGQgZ2V0IGFuIGluZXhwbGljYWJsZSBvbGQgZW50cnkuXG4gICAgLnNraXAoMSk7XG59XG5cbmZ1bmN0aW9uIHNwYXduQWRiTG9nY2F0KCk6IFByb21pc2U8Y2hpbGRfcHJvY2VzcyRDaGlsZFByb2Nlc3M+IHtcbiAgcmV0dXJuIHNhZmVTcGF3bignYWRiJywgWydsb2djYXQnLCAnLXYnLCAnbG9uZycsICctVCcsICcxJ10pO1xufVxuIl19