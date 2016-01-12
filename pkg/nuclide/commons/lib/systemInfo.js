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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN5c3RlbUluZm8uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OztJQWlDc0IsY0FBYyxxQkFBN0IsYUFBaUQ7O0FBRXRELE1BQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxJQUFJLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLHlCQUF5QixDQUFDLElBQUksTUFBTSxDQUFDOzthQUMzRSxNQUFNLDJCQUFhLFFBQVEsRUFBRSxDQUFDLFdBQVcsQ0FBQyxDQUFDOztNQUFyRCxNQUFNLFFBQU4sTUFBTTs7QUFDYixTQUFPLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztDQUN0Qjs7OztJQUVxQixlQUFlLHFCQUE5QixhQUFrRDtjQUN0QyxNQUFNLDJCQUFhLE9BQU8sRUFBRSxDQUFDLFdBQVcsQ0FBQyxDQUFDOztNQUFwRCxNQUFNLFNBQU4sTUFBTTs7QUFDYixTQUFPLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztDQUN0Qjs7Ozs7Ozs7Ozs7Ozs7OztrQkFoQ2MsSUFBSTs7Ozt1QkFDUSxXQUFXOztBQUUvQixJQUFNLE9BQU8sR0FBRztBQUNyQixPQUFLLEVBQUUsT0FBTztBQUNkLE9BQUssRUFBRSxPQUFPO0FBQ2QsT0FBSyxFQUFFLE9BQU87QUFDZCxLQUFHLEVBQUUsUUFBUTtDQUNkLENBQUM7Ozs7QUFFSyxTQUFTLFNBQVMsR0FBVztBQUNsQyxTQUFPLGdCQUFHLFFBQVEsRUFBRSxDQUFDO0NBQ3RCOztBQUVNLFNBQVMsa0JBQWtCLEdBQVk7QUFDNUMsU0FBTyxTQUFTLEVBQUUsS0FBSyxPQUFPLENBQUMsS0FBSyxJQUFJLFNBQVMsRUFBRSxLQUFLLE9BQU8sQ0FBQyxLQUFLLENBQUM7Q0FDdkU7O0FBRU0sU0FBUyxZQUFZLEdBQVc7QUFDckMsU0FBTyxnQkFBRyxPQUFPLEVBQUUsQ0FBQztDQUNyQiIsImZpbGUiOiJzeXN0ZW1JbmZvLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IG9zIGZyb20gJ29zJztcbmltcG9ydCB7YXN5bmNFeGVjdXRlfSBmcm9tICcuL3Byb2Nlc3MnO1xuXG5leHBvcnQgY29uc3QgT1NfVFlQRSA9IHtcbiAgV0lOMzI6ICd3aW4zMicsXG4gIFdJTjY0OiAnd2luNjQnLFxuICBMSU5VWDogJ2xpbnV4JyxcbiAgT1NYOiAnZGFyd2luJyxcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRPc1R5cGUoKTogc3RyaW5nIHtcbiAgcmV0dXJuIG9zLnBsYXRmb3JtKCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1J1bm5pbmdJbldpbmRvd3MoKTogYm9vbGVhbiB7XG4gIHJldHVybiBnZXRPc1R5cGUoKSA9PT0gT1NfVFlQRS5XSU4zMiB8fCBnZXRPc1R5cGUoKSA9PT0gT1NfVFlQRS5XSU42NDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldE9zVmVyc2lvbigpOiBzdHJpbmcge1xuICByZXR1cm4gb3MucmVsZWFzZSgpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0Rmxvd1ZlcnNpb24oKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgLy8gJFVQRml4TWU6IFRoaXMgc2hvdWxkIHVzZSBudWNsaWRlLWZlYXR1cmVzLWNvbmZpZ1xuICBjb25zdCBmbG93UGF0aCA9IGdsb2JhbC5hdG9tICYmIGdsb2JhbC5hdG9tLmNvbmZpZy5nZXQoJ251Y2xpZGUtZmxvdy5wYXRoVG9GbG93JykgfHwgJ2Zsb3cnO1xuICBjb25zdCB7c3Rkb3V0fSA9IGF3YWl0IGFzeW5jRXhlY3V0ZShmbG93UGF0aCwgWyctLXZlcnNpb24nXSk7XG4gIHJldHVybiBzdGRvdXQudHJpbSgpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0Q2xhbmdWZXJzaW9uKCk6IFByb21pc2U8c3RyaW5nPiB7XG4gIGNvbnN0IHtzdGRvdXR9ID0gYXdhaXQgYXN5bmNFeGVjdXRlKCdjbGFuZycsIFsnLS12ZXJzaW9uJ10pO1xuICByZXR1cm4gc3Rkb3V0LnRyaW0oKTtcbn1cbiJdfQ==