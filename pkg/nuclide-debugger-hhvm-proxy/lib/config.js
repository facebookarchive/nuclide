Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.getConfig = getConfig;
exports.setConfig = setConfig;
exports.clearConfig = clearConfig;

var defaultConfig = {
  xdebugPort: 9000,
  logLevel: 'INFO',
  targetUri: '',
  hhvmBinaryPath: '/usr/local/hphpi/bin/hhvm'
};

var config = defaultConfig;

function getConfig() {
  return config;
}

function setConfig(newConfig) {
  config = _extends({}, newConfig);
}

function clearConfig() {
  config = defaultConfig;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbmZpZy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFhQSxJQUFNLGFBQWlDLEdBQUc7QUFDeEMsWUFBVSxFQUFFLElBQUk7QUFDaEIsVUFBUSxFQUFFLE1BQU07QUFDaEIsV0FBUyxFQUFFLEVBQUU7QUFDYixnQkFBYyxFQUFFLDJCQUEyQjtDQUM1QyxDQUFDOztBQUVGLElBQUksTUFBMEIsR0FBRyxhQUFhLENBQUM7O0FBRXhDLFNBQVMsU0FBUyxHQUF1QjtBQUM5QyxTQUFPLE1BQU0sQ0FBQztDQUNmOztBQUVNLFNBQVMsU0FBUyxDQUFDLFNBQTZCLEVBQVE7QUFDN0QsUUFBTSxnQkFDRCxTQUFTLENBQ2IsQ0FBQztDQUNIOztBQUVNLFNBQVMsV0FBVyxHQUFTO0FBQ2xDLFFBQU0sR0FBRyxhQUFhLENBQUM7Q0FDeEIiLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0hodm1EZWJ1Z2dlckNvbmZpZ30gZnJvbSAnLi4nO1xuXG5jb25zdCBkZWZhdWx0Q29uZmlnOiBIaHZtRGVidWdnZXJDb25maWcgPSB7XG4gIHhkZWJ1Z1BvcnQ6IDkwMDAsXG4gIGxvZ0xldmVsOiAnSU5GTycsXG4gIHRhcmdldFVyaTogJycsXG4gIGhodm1CaW5hcnlQYXRoOiAnL3Vzci9sb2NhbC9ocGhwaS9iaW4vaGh2bScsXG59O1xuXG5sZXQgY29uZmlnOiBIaHZtRGVidWdnZXJDb25maWcgPSBkZWZhdWx0Q29uZmlnO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29uZmlnKCk6IEhodm1EZWJ1Z2dlckNvbmZpZyB7XG4gIHJldHVybiBjb25maWc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRDb25maWcobmV3Q29uZmlnOiBIaHZtRGVidWdnZXJDb25maWcpOiB2b2lkIHtcbiAgY29uZmlnID0ge1xuICAgIC4uLm5ld0NvbmZpZyxcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNsZWFyQ29uZmlnKCk6IHZvaWQge1xuICBjb25maWcgPSBkZWZhdWx0Q29uZmlnO1xufVxuIl19