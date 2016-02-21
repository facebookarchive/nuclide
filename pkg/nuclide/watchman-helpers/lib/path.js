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

var _require = require('../../commons');

var fsPromise = _require.fsPromise;

var WATCHMAN_DEFAULT_PATH = '/usr/local/bin/watchman';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhdGguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQWVzQixxQkFBcUIscUJBQXBDLGFBQXdEO0FBQzdELE1BQUk7QUFDRixRQUFNLEtBQUssR0FBRyxNQUFNLFNBQVMsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQzs7O0FBRzFELFFBQUksS0FBSyxJQUFJLEtBQUssQ0FBQyxNQUFNLEVBQUUsRUFBRTtBQUMzQixhQUFPLHFCQUFxQixDQUFDO0tBQzlCO0dBQ0YsQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUVYOzs7O0FBQUEsQUFFRCxTQUFPLFVBQVUsQ0FBQztDQUNuQjs7Ozs7Ozs7Ozs7Ozs7ZUFqQm1CLE9BQU8sQ0FBQyxlQUFlLENBQUM7O0lBQXJDLFNBQVMsWUFBVCxTQUFTOztBQUVoQixJQUFNLHFCQUFxQixHQUFHLHlCQUF5QixDQUFDIiwiZmlsZSI6InBhdGguanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5jb25zdCB7ZnNQcm9taXNlfSA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbnMnKTtcblxuY29uc3QgV0FUQ0hNQU5fREVGQVVMVF9QQVRIID0gJy91c3IvbG9jYWwvYmluL3dhdGNobWFuJztcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFdhdGNobWFuQmluYXJ5UGF0aCgpOiBQcm9taXNlPHN0cmluZz4ge1xuICB0cnkge1xuICAgIGNvbnN0IHN0YXRzID0gYXdhaXQgZnNQcm9taXNlLnN0YXQoV0FUQ0hNQU5fREVGQVVMVF9QQVRIKTtcbiAgICAvLyBgc3RhdHNgIGNvbnRhaW5zIGEgYG1vZGVgIHByb3BlcnR5LCBhIG51bWJlciB3aGljaCBjYW4gYmUgdXNlZCB0byBkZXRlcm1pbmVcbiAgICAvLyB3aGV0aGVyIHRoaXMgZmlsZSBpcyBleGVjdXRhYmxlLiBIb3dldmVyLCB0aGUgbnVtYmVyIGlzIHBsYXRmb3JtLWRlcGVuZGVudC5cbiAgICBpZiAoc3RhdHMgJiYgc3RhdHMuaXNGaWxlKCkpIHtcbiAgICAgIHJldHVybiBXQVRDSE1BTl9ERUZBVUxUX1BBVEg7XG4gICAgfVxuICB9IGNhdGNoIChlKSB7XG4gICAgLy8gU3VwcHJlc3MgdGhlIGVycm9yLlxuICB9XG4gIC8vIExldCB0aGUgd2F0Y2htYW4gQ2xpZW50IGZpbmQgdGhlIHdhdGNobWFuIGJpbmFyeSB2aWEgdGhlIGRlZmF1bHQgZW52IFBBVEguXG4gIHJldHVybiAnd2F0Y2htYW4nO1xufVxuIl19