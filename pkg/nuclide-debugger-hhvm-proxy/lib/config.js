Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.getConfig = getConfig;
exports.setConfig = setConfig;
exports.clearConfig = clearConfig;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _utils = require('./utils');

var _utils2 = _interopRequireDefault(_utils);

var defaultConfig = {
  xdebugPort: 9000,
  logLevel: 'INFO',
  targetUri: '',
  phpRuntimePath: '/usr/local/bin/php'
};

var config = defaultConfig;

function getConfig() {
  return config;
}

function setConfig(newConfig) {
  config = _extends({}, newConfig);
  _utils2['default'].log('Config was set to ' + JSON.stringify(config));
}

function clearConfig() {
  config = defaultConfig;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbmZpZy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztxQkFXbUIsU0FBUzs7OztBQUc1QixJQUFNLGFBQXdDLEdBQUc7QUFDL0MsWUFBVSxFQUFFLElBQUk7QUFDaEIsVUFBUSxFQUFFLE1BQU07QUFDaEIsV0FBUyxFQUFFLEVBQUU7QUFDYixnQkFBYyxFQUFFLG9CQUFvQjtDQUNyQyxDQUFDOztBQUVGLElBQUksTUFBaUMsR0FBRyxhQUFhLENBQUM7O0FBRS9DLFNBQVMsU0FBUyxHQUE4QjtBQUNyRCxTQUFPLE1BQU0sQ0FBQztDQUNmOztBQUVNLFNBQVMsU0FBUyxDQUFDLFNBQW9DLEVBQVE7QUFDcEUsUUFBTSxnQkFDRCxTQUFTLENBQ2IsQ0FBQztBQUNGLHFCQUFPLEdBQUcsd0JBQXNCLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUcsQ0FBQztDQUMzRDs7QUFFTSxTQUFTLFdBQVcsR0FBUztBQUNsQyxRQUFNLEdBQUcsYUFBYSxDQUFDO0NBQ3hCIiwiZmlsZSI6ImNvbmZpZy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCBsb2dnZXIgZnJvbSAnLi91dGlscyc7XG5pbXBvcnQgdHlwZSB7SGh2bURlYnVnZ2VyU2Vzc2lvbkNvbmZpZ30gZnJvbSAnLi9IaHZtRGVidWdnZXJQcm94eVNlcnZpY2UnO1xuXG5jb25zdCBkZWZhdWx0Q29uZmlnOiBIaHZtRGVidWdnZXJTZXNzaW9uQ29uZmlnID0ge1xuICB4ZGVidWdQb3J0OiA5MDAwLFxuICBsb2dMZXZlbDogJ0lORk8nLFxuICB0YXJnZXRVcmk6ICcnLFxuICBwaHBSdW50aW1lUGF0aDogJy91c3IvbG9jYWwvYmluL3BocCcsXG59O1xuXG5sZXQgY29uZmlnOiBIaHZtRGVidWdnZXJTZXNzaW9uQ29uZmlnID0gZGVmYXVsdENvbmZpZztcblxuZXhwb3J0IGZ1bmN0aW9uIGdldENvbmZpZygpOiBIaHZtRGVidWdnZXJTZXNzaW9uQ29uZmlnIHtcbiAgcmV0dXJuIGNvbmZpZztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldENvbmZpZyhuZXdDb25maWc6IEhodm1EZWJ1Z2dlclNlc3Npb25Db25maWcpOiB2b2lkIHtcbiAgY29uZmlnID0ge1xuICAgIC4uLm5ld0NvbmZpZyxcbiAgfTtcbiAgbG9nZ2VyLmxvZyhgQ29uZmlnIHdhcyBzZXQgdG8gJHtKU09OLnN0cmluZ2lmeShjb25maWcpfWApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2xlYXJDb25maWcoKTogdm9pZCB7XG4gIGNvbmZpZyA9IGRlZmF1bHRDb25maWc7XG59XG4iXX0=