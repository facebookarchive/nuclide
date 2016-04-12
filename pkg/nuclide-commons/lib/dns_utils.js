var lookupPreferIpv6 = _asyncToGenerator(function* (host) {
  try {
    return yield lookup(host, 6);
  } catch (e) {
    if (e.code === 'ENOTFOUND') {
      return yield lookup(host, 4);
    }
    throw e;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _dns = require('dns');

var _dns2 = _interopRequireDefault(_dns);

function lookup(host, family) {
  return new Promise(function (resolve, reject) {
    _dns2['default'].lookup(host, family, function (error, address) {
      if (error) {
        reject(error);
      } else if (address != null) {
        resolve(address);
      } else {
        reject('One of error or address must be set.');
      }
    });
  });
}

module.exports = {
  lookup: lookup,
  lookupPreferIpv6: lookupPreferIpv6
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImRuc191dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiSUFlZSxnQkFBZ0IscUJBQS9CLFdBQWdDLElBQVksRUFBbUI7QUFDN0QsTUFBSTtBQUNGLFdBQU8sTUFBTSxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO0dBQzlCLENBQUMsT0FBTyxDQUFDLEVBQUU7QUFDVixRQUFJLENBQUMsQ0FBQyxJQUFJLEtBQUssV0FBVyxFQUFFO0FBQzFCLGFBQU8sTUFBTSxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO0tBQzlCO0FBQ0QsVUFBTSxDQUFDLENBQUM7R0FDVDtDQUNGOzs7Ozs7Ozs7Ozs7OzttQkFiZSxLQUFLOzs7O0FBZXJCLFNBQVMsTUFBTSxDQUFDLElBQVksRUFBRSxNQUFpQixFQUFtQjtBQUNoRSxTQUFPLElBQUksT0FBTyxDQUFDLFVBQUMsT0FBTyxFQUFFLE1BQU0sRUFBSztBQUN0QyxxQkFBSSxNQUFNLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxVQUFDLEtBQUssRUFBVSxPQUFPLEVBQWM7QUFDNUQsVUFBSSxLQUFLLEVBQUU7QUFDVCxjQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7T0FDZixNQUFNLElBQUksT0FBTyxJQUFJLElBQUksRUFBRTtBQUMxQixlQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7T0FDbEIsTUFBTTtBQUNMLGNBQU0sQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDO09BQ2hEO0tBQ0YsQ0FBQyxDQUFDO0dBQ0osQ0FBQyxDQUFDO0NBQ0o7O0FBRUQsTUFBTSxDQUFDLE9BQU8sR0FBRztBQUNmLFFBQU0sRUFBTixNQUFNO0FBQ04sa0JBQWdCLEVBQWhCLGdCQUFnQjtDQUNqQixDQUFDIiwiZmlsZSI6ImRuc191dGlscy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCBkbnMgZnJvbSAnZG5zJztcblxudHlwZSBEbnNGYW1pbHkgPSA0IHwgNjtcblxuYXN5bmMgZnVuY3Rpb24gbG9va3VwUHJlZmVySXB2Nihob3N0OiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICB0cnkge1xuICAgIHJldHVybiBhd2FpdCBsb29rdXAoaG9zdCwgNik7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBpZiAoZS5jb2RlID09PSAnRU5PVEZPVU5EJykge1xuICAgICAgcmV0dXJuIGF3YWl0IGxvb2t1cChob3N0LCA0KTtcbiAgICB9XG4gICAgdGhyb3cgZTtcbiAgfVxufVxuXG5mdW5jdGlvbiBsb29rdXAoaG9zdDogc3RyaW5nLCBmYW1pbHk6IERuc0ZhbWlseSk6IFByb21pc2U8c3RyaW5nPiB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgZG5zLmxvb2t1cChob3N0LCBmYW1pbHksIChlcnJvcjogP0Vycm9yLCBhZGRyZXNzOiA/c3RyaW5nKSA9PiB7XG4gICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgIH0gZWxzZSBpZiAoYWRkcmVzcyAhPSBudWxsKSB7XG4gICAgICAgIHJlc29sdmUoYWRkcmVzcyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZWplY3QoJ09uZSBvZiBlcnJvciBvciBhZGRyZXNzIG11c3QgYmUgc2V0LicpO1xuICAgICAgfVxuICAgIH0pO1xuICB9KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGxvb2t1cCxcbiAgbG9va3VwUHJlZmVySXB2Nixcbn07XG4iXX0=