Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.getOsType = getOsType;
exports.isRunningInWindows = isRunningInWindows;
exports.getOsVersion = getOsVersion;

var getFlowVersion = _asyncToGenerator(function* () {
  // $UPFixMe: This should use nuclide-features-config
  var flowPath = global.atom && global.atom.config.get('nuclide-flow.pathToFlow') || 'flow';

  var _ref = yield (0, _process.asyncExecute)(flowPath, ['--version']);

  var stdout = _ref.stdout;

  return stdout.trim();
});

exports.getFlowVersion = getFlowVersion;

var getClangVersion = _asyncToGenerator(function* () {
  var _ref2 = yield (0, _process.asyncExecute)('clang', ['--version']);

  var stdout = _ref2.stdout;

  return stdout.trim();
});

exports.getClangVersion = getClangVersion;
exports.getRuntimePath = getRuntimePath;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _process = require('./process');

var OS_TYPE = {
  WIN32: 'win32',
  WIN64: 'win64',
  LINUX: 'linux',
  OSX: 'darwin'
};

exports.OS_TYPE = OS_TYPE;

function getOsType() {
  return _os2['default'].platform();
}

function isRunningInWindows() {
  return getOsType() === OS_TYPE.WIN32 || getOsType() === OS_TYPE.WIN64;
}

function getOsVersion() {
  return _os2['default'].release();
}

function getRuntimePath() {
  // "resourcesPath" only exists in Atom. It's as close as you can get to
  // Atom's path without having to manually clean some string for different
  // environments. In the general case, it looks like this:
  // Mac: "/Applications/Atom.app/Contents/Resources"
  // Linux: "/usr/share/atom/resources"
  if (global.atom && typeof process.resourcesPath === 'string') {
    return process.resourcesPath;
  } else {
    return process.execPath;
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN5c3RlbUluZm8uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OztJQWlDc0IsY0FBYyxxQkFBN0IsYUFBaUQ7O0FBRXRELE1BQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxJQUFJLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLHlCQUF5QixDQUFDLElBQUksTUFBTSxDQUFDOzthQUMzRSxNQUFNLDJCQUFhLFFBQVEsRUFBRSxDQUFDLFdBQVcsQ0FBQyxDQUFDOztNQUFyRCxNQUFNLFFBQU4sTUFBTTs7QUFDYixTQUFPLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztDQUN0Qjs7OztJQUVxQixlQUFlLHFCQUE5QixhQUFrRDtjQUN0QyxNQUFNLDJCQUFhLE9BQU8sRUFBRSxDQUFDLFdBQVcsQ0FBQyxDQUFDOztNQUFwRCxNQUFNLFNBQU4sTUFBTTs7QUFDYixTQUFPLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztDQUN0Qjs7Ozs7Ozs7Ozs7Ozs7Ozs7a0JBaENjLElBQUk7Ozs7dUJBQ1EsV0FBVzs7QUFFL0IsSUFBTSxPQUFPLEdBQUc7QUFDckIsT0FBSyxFQUFFLE9BQU87QUFDZCxPQUFLLEVBQUUsT0FBTztBQUNkLE9BQUssRUFBRSxPQUFPO0FBQ2QsS0FBRyxFQUFFLFFBQVE7Q0FDZCxDQUFDOzs7O0FBRUssU0FBUyxTQUFTLEdBQVc7QUFDbEMsU0FBTyxnQkFBRyxRQUFRLEVBQUUsQ0FBQztDQUN0Qjs7QUFFTSxTQUFTLGtCQUFrQixHQUFZO0FBQzVDLFNBQU8sU0FBUyxFQUFFLEtBQUssT0FBTyxDQUFDLEtBQUssSUFBSSxTQUFTLEVBQUUsS0FBSyxPQUFPLENBQUMsS0FBSyxDQUFDO0NBQ3ZFOztBQUVNLFNBQVMsWUFBWSxHQUFXO0FBQ3JDLFNBQU8sZ0JBQUcsT0FBTyxFQUFFLENBQUM7Q0FDckI7O0FBY00sU0FBUyxjQUFjLEdBQVc7Ozs7OztBQU12QyxNQUFJLE1BQU0sQ0FBQyxJQUFJLElBQUksT0FBTyxPQUFPLENBQUMsYUFBYSxLQUFLLFFBQVEsRUFBRTtBQUM1RCxXQUFPLEFBQUMsT0FBTyxDQUFPLGFBQWEsQ0FBQztHQUNyQyxNQUFNO0FBQ0wsV0FBTyxPQUFPLENBQUMsUUFBUSxDQUFDO0dBQ3pCO0NBQ0YiLCJmaWxlIjoic3lzdGVtSW5mby5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCBvcyBmcm9tICdvcyc7XG5pbXBvcnQge2FzeW5jRXhlY3V0ZX0gZnJvbSAnLi9wcm9jZXNzJztcblxuZXhwb3J0IGNvbnN0IE9TX1RZUEUgPSB7XG4gIFdJTjMyOiAnd2luMzInLFxuICBXSU42NDogJ3dpbjY0JyxcbiAgTElOVVg6ICdsaW51eCcsXG4gIE9TWDogJ2RhcndpbicsXG59O1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0T3NUeXBlKCk6IHN0cmluZyB7XG4gIHJldHVybiBvcy5wbGF0Zm9ybSgpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNSdW5uaW5nSW5XaW5kb3dzKCk6IGJvb2xlYW4ge1xuICByZXR1cm4gZ2V0T3NUeXBlKCkgPT09IE9TX1RZUEUuV0lOMzIgfHwgZ2V0T3NUeXBlKCkgPT09IE9TX1RZUEUuV0lONjQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRPc1ZlcnNpb24oKTogc3RyaW5nIHtcbiAgcmV0dXJuIG9zLnJlbGVhc2UoKTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEZsb3dWZXJzaW9uKCk6IFByb21pc2U8c3RyaW5nPiB7XG4gIC8vICRVUEZpeE1lOiBUaGlzIHNob3VsZCB1c2UgbnVjbGlkZS1mZWF0dXJlcy1jb25maWdcbiAgY29uc3QgZmxvd1BhdGggPSBnbG9iYWwuYXRvbSAmJiBnbG9iYWwuYXRvbS5jb25maWcuZ2V0KCdudWNsaWRlLWZsb3cucGF0aFRvRmxvdycpIHx8ICdmbG93JztcbiAgY29uc3Qge3N0ZG91dH0gPSBhd2FpdCBhc3luY0V4ZWN1dGUoZmxvd1BhdGgsIFsnLS12ZXJzaW9uJ10pO1xuICByZXR1cm4gc3Rkb3V0LnRyaW0oKTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldENsYW5nVmVyc2lvbigpOiBQcm9taXNlPHN0cmluZz4ge1xuICBjb25zdCB7c3Rkb3V0fSA9IGF3YWl0IGFzeW5jRXhlY3V0ZSgnY2xhbmcnLCBbJy0tdmVyc2lvbiddKTtcbiAgcmV0dXJuIHN0ZG91dC50cmltKCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRSdW50aW1lUGF0aCgpOiBzdHJpbmcge1xuICAvLyBcInJlc291cmNlc1BhdGhcIiBvbmx5IGV4aXN0cyBpbiBBdG9tLiBJdCdzIGFzIGNsb3NlIGFzIHlvdSBjYW4gZ2V0IHRvXG4gIC8vIEF0b20ncyBwYXRoIHdpdGhvdXQgaGF2aW5nIHRvIG1hbnVhbGx5IGNsZWFuIHNvbWUgc3RyaW5nIGZvciBkaWZmZXJlbnRcbiAgLy8gZW52aXJvbm1lbnRzLiBJbiB0aGUgZ2VuZXJhbCBjYXNlLCBpdCBsb29rcyBsaWtlIHRoaXM6XG4gIC8vIE1hYzogXCIvQXBwbGljYXRpb25zL0F0b20uYXBwL0NvbnRlbnRzL1Jlc291cmNlc1wiXG4gIC8vIExpbnV4OiBcIi91c3Ivc2hhcmUvYXRvbS9yZXNvdXJjZXNcIlxuICBpZiAoZ2xvYmFsLmF0b20gJiYgdHlwZW9mIHByb2Nlc3MucmVzb3VyY2VzUGF0aCA9PT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gKHByb2Nlc3M6IGFueSkucmVzb3VyY2VzUGF0aDtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gcHJvY2Vzcy5leGVjUGF0aDtcbiAgfVxufVxuIl19