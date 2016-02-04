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

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function lookup(host, family) {
  return new Promise(function (resolve, reject) {
    var dns = require('dns');
    dns.lookup(host, family, function (error, address) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImRuc191dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiSUFhZSxnQkFBZ0IscUJBQS9CLFdBQWdDLElBQVksRUFBbUI7QUFDN0QsTUFBSTtBQUNGLFdBQU8sTUFBTSxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO0dBQzlCLENBQUMsT0FBTyxDQUFDLEVBQUU7QUFDVixRQUFJLENBQUMsQ0FBQyxJQUFJLEtBQUssV0FBVyxFQUFFO0FBQzFCLGFBQU8sTUFBTSxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO0tBQzlCO0FBQ0QsVUFBTSxDQUFDLENBQUM7R0FDVDtDQUNGOzs7Ozs7Ozs7Ozs7QUFFRCxTQUFTLE1BQU0sQ0FBQyxJQUFZLEVBQUUsTUFBaUIsRUFBbUI7QUFDaEUsU0FBTyxJQUFJLE9BQU8sQ0FBQyxVQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUs7QUFDdEMsUUFBTSxHQUFHLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzNCLE9BQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxVQUFDLEtBQUssRUFBVSxPQUFPLEVBQWM7QUFDNUQsVUFBSSxLQUFLLEVBQUU7QUFDVCxjQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7T0FDZixNQUFNLElBQUksT0FBTyxJQUFJLElBQUksRUFBRTtBQUMxQixlQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7T0FDbEIsTUFBTTtBQUNMLGNBQU0sQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDO09BQ2hEO0tBQ0YsQ0FBQyxDQUFDO0dBQ0osQ0FBQyxDQUFDO0NBQ0o7O0FBRUQsTUFBTSxDQUFDLE9BQU8sR0FBRztBQUNmLFFBQU0sRUFBTixNQUFNO0FBQ04sa0JBQWdCLEVBQWhCLGdCQUFnQjtDQUNqQixDQUFDIiwiZmlsZSI6ImRuc191dGlscy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbnR5cGUgRG5zRmFtaWx5ID0gNCB8IDY7XG5cbmFzeW5jIGZ1bmN0aW9uIGxvb2t1cFByZWZlcklwdjYoaG9zdDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gYXdhaXQgbG9va3VwKGhvc3QsIDYpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgaWYgKGUuY29kZSA9PT0gJ0VOT1RGT1VORCcpIHtcbiAgICAgIHJldHVybiBhd2FpdCBsb29rdXAoaG9zdCwgNCk7XG4gICAgfVxuICAgIHRocm93IGU7XG4gIH1cbn1cblxuZnVuY3Rpb24gbG9va3VwKGhvc3Q6IHN0cmluZywgZmFtaWx5OiBEbnNGYW1pbHkpOiBQcm9taXNlPHN0cmluZz4ge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnN0IGRucyA9IHJlcXVpcmUoJ2RucycpO1xuICAgIGRucy5sb29rdXAoaG9zdCwgZmFtaWx5LCAoZXJyb3I6ID9FcnJvciwgYWRkcmVzczogP3N0cmluZykgPT4ge1xuICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICB9IGVsc2UgaWYgKGFkZHJlc3MgIT0gbnVsbCkge1xuICAgICAgICByZXNvbHZlKGFkZHJlc3MpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVqZWN0KCdPbmUgb2YgZXJyb3Igb3IgYWRkcmVzcyBtdXN0IGJlIHNldC4nKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBsb29rdXAsXG4gIGxvb2t1cFByZWZlcklwdjYsXG59O1xuIl19