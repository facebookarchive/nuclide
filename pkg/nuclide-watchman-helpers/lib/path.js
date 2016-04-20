Object.defineProperty(exports, '__esModule', {
  value: true
});

var getWatchmanBinaryPath = _asyncToGenerator(function* () {
  try {
    var stats = yield fsPromise.stat(WATCHMAN_DEFAULT_PATH);
    // `stats` contains a `mode` property, a number which can be used to determine
    // whether this file is executable. However, the number is platform-dependent.
    if (stats && stats.isFile()) {
      return WATCHMAN_DEFAULT_PATH;
    }
  } catch (e) {}
  // Suppress the error.

  // Let the watchman Client find the watchman binary via the default env PATH.
  return 'watchman';
});

exports.getWatchmanBinaryPath = getWatchmanBinaryPath;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _require = require('../../nuclide-commons');

var fsPromise = _require.fsPromise;

var WATCHMAN_DEFAULT_PATH = '/usr/local/bin/watchman';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhdGguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQWVzQixxQkFBcUIscUJBQXBDLGFBQXdEO0FBQzdELE1BQUk7QUFDRixRQUFNLEtBQUssR0FBRyxNQUFNLFNBQVMsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQzs7O0FBRzFELFFBQUksS0FBSyxJQUFJLEtBQUssQ0FBQyxNQUFNLEVBQUUsRUFBRTtBQUMzQixhQUFPLHFCQUFxQixDQUFDO0tBQzlCO0dBQ0YsQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUVYOzs7O0FBQUEsQUFFRCxTQUFPLFVBQVUsQ0FBQztDQUNuQjs7Ozs7Ozs7Ozs7Ozs7ZUFqQm1CLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQzs7SUFBN0MsU0FBUyxZQUFULFNBQVM7O0FBRWhCLElBQU0scUJBQXFCLEdBQUcseUJBQXlCLENBQUMiLCJmaWxlIjoicGF0aC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IHtmc1Byb21pc2V9ID0gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS1jb21tb25zJyk7XG5cbmNvbnN0IFdBVENITUFOX0RFRkFVTFRfUEFUSCA9ICcvdXNyL2xvY2FsL2Jpbi93YXRjaG1hbic7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRXYXRjaG1hbkJpbmFyeVBhdGgoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBzdGF0cyA9IGF3YWl0IGZzUHJvbWlzZS5zdGF0KFdBVENITUFOX0RFRkFVTFRfUEFUSCk7XG4gICAgLy8gYHN0YXRzYCBjb250YWlucyBhIGBtb2RlYCBwcm9wZXJ0eSwgYSBudW1iZXIgd2hpY2ggY2FuIGJlIHVzZWQgdG8gZGV0ZXJtaW5lXG4gICAgLy8gd2hldGhlciB0aGlzIGZpbGUgaXMgZXhlY3V0YWJsZS4gSG93ZXZlciwgdGhlIG51bWJlciBpcyBwbGF0Zm9ybS1kZXBlbmRlbnQuXG4gICAgaWYgKHN0YXRzICYmIHN0YXRzLmlzRmlsZSgpKSB7XG4gICAgICByZXR1cm4gV0FUQ0hNQU5fREVGQVVMVF9QQVRIO1xuICAgIH1cbiAgfSBjYXRjaCAoZSkge1xuICAgIC8vIFN1cHByZXNzIHRoZSBlcnJvci5cbiAgfVxuICAvLyBMZXQgdGhlIHdhdGNobWFuIENsaWVudCBmaW5kIHRoZSB3YXRjaG1hbiBiaW5hcnkgdmlhIHRoZSBkZWZhdWx0IGVudiBQQVRILlxuICByZXR1cm4gJ3dhdGNobWFuJztcbn1cbiJdfQ==