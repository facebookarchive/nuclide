Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.instrumentConsole = instrumentConsole;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _net = require('net');

var _net2 = _interopRequireDefault(_net);

/* eslint-disable no-console */

// TODO(mbolin): This redefinition of console.log() does not appear to be bulletproof.
// For example, if you do: `./bin/atom-script ./samples/keybindings.js | head`, you get
// an error.

/**
 * Logic to work around this issue: https://github.com/atom/atom/issues/10952.
 * Specifically, we want to ensure that `console.log()` writes "clean" output to stdout.
 * This means we need to wrap the appropriate functions so they do not include the extra
 * information added by Chromium's chatty logger.
 */

function instrumentConsole(stdout) {
  console.log = function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var message = args.join(' ');
    var socket = _net2['default'].connect({ path: stdout }, function () {
      return socket.write(message + '\n');
    });
  };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbnNvbGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O21CQVdnQixLQUFLOzs7Ozs7Ozs7Ozs7Ozs7OztBQWNkLFNBQVMsaUJBQWlCLENBQUMsTUFBYyxFQUFFO0FBQ2hELFNBQU8sQ0FBQyxHQUFHLEdBQUcsWUFBdUI7c0NBQW5CLElBQUk7QUFBSixVQUFJOzs7QUFDcEIsUUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUMvQixRQUFNLE1BQU0sR0FBRyxpQkFBSSxPQUFPLENBQ3hCLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBQyxFQUNkO2FBQU0sTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO0tBQUEsQ0FDbkMsQ0FBQztHQUNILENBQUM7Q0FDSCIsImZpbGUiOiJjb25zb2xlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IG5ldCBmcm9tICduZXQnO1xuXG4vKiBlc2xpbnQtZGlzYWJsZSBuby1jb25zb2xlICovXG5cbi8vIFRPRE8obWJvbGluKTogVGhpcyByZWRlZmluaXRpb24gb2YgY29uc29sZS5sb2coKSBkb2VzIG5vdCBhcHBlYXIgdG8gYmUgYnVsbGV0cHJvb2YuXG4vLyBGb3IgZXhhbXBsZSwgaWYgeW91IGRvOiBgLi9iaW4vYXRvbS1zY3JpcHQgLi9zYW1wbGVzL2tleWJpbmRpbmdzLmpzIHwgaGVhZGAsIHlvdSBnZXRcbi8vIGFuIGVycm9yLlxuXG4vKipcbiAqIExvZ2ljIHRvIHdvcmsgYXJvdW5kIHRoaXMgaXNzdWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9hdG9tL2F0b20vaXNzdWVzLzEwOTUyLlxuICogU3BlY2lmaWNhbGx5LCB3ZSB3YW50IHRvIGVuc3VyZSB0aGF0IGBjb25zb2xlLmxvZygpYCB3cml0ZXMgXCJjbGVhblwiIG91dHB1dCB0byBzdGRvdXQuXG4gKiBUaGlzIG1lYW5zIHdlIG5lZWQgdG8gd3JhcCB0aGUgYXBwcm9wcmlhdGUgZnVuY3Rpb25zIHNvIHRoZXkgZG8gbm90IGluY2x1ZGUgdGhlIGV4dHJhXG4gKiBpbmZvcm1hdGlvbiBhZGRlZCBieSBDaHJvbWl1bSdzIGNoYXR0eSBsb2dnZXIuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbnN0cnVtZW50Q29uc29sZShzdGRvdXQ6IHN0cmluZykge1xuICBjb25zb2xlLmxvZyA9ICguLi5hcmdzOiBzdHJpbmdbXSkgPT4ge1xuICAgIGNvbnN0IG1lc3NhZ2UgPSBhcmdzLmpvaW4oJyAnKTtcbiAgICBjb25zdCBzb2NrZXQgPSBuZXQuY29ubmVjdChcbiAgICAgIHtwYXRoOiBzdGRvdXR9LFxuICAgICAgKCkgPT4gc29ja2V0LndyaXRlKG1lc3NhZ2UgKyAnXFxuJyksXG4gICAgKTtcbiAgfTtcbn1cbiJdfQ==