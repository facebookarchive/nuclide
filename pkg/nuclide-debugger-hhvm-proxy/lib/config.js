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
  xdebugAttachPort: 9000,
  xdebugLaunchingPort: 10112,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbmZpZy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztxQkFXbUIsU0FBUzs7OztBQUc1QixJQUFNLGFBQXdDLEdBQUc7QUFDL0Msa0JBQWdCLEVBQUUsSUFBSTtBQUN0QixxQkFBbUIsRUFBRSxLQUFLO0FBQzFCLFVBQVEsRUFBRSxNQUFNO0FBQ2hCLFdBQVMsRUFBRSxFQUFFO0FBQ2IsZ0JBQWMsRUFBRSxvQkFBb0I7Q0FDckMsQ0FBQzs7QUFFRixJQUFJLE1BQWlDLEdBQUcsYUFBYSxDQUFDOztBQUUvQyxTQUFTLFNBQVMsR0FBOEI7QUFDckQsU0FBTyxNQUFNLENBQUM7Q0FDZjs7QUFFTSxTQUFTLFNBQVMsQ0FBQyxTQUFvQyxFQUFRO0FBQ3BFLFFBQU0sZ0JBQ0QsU0FBUyxDQUNiLENBQUM7QUFDRixxQkFBTyxHQUFHLHdCQUFzQixJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFHLENBQUM7Q0FDM0Q7O0FBRU0sU0FBUyxXQUFXLEdBQVM7QUFDbEMsUUFBTSxHQUFHLGFBQWEsQ0FBQztDQUN4QiIsImZpbGUiOiJjb25maWcuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgbG9nZ2VyIGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IHR5cGUge0hodm1EZWJ1Z2dlclNlc3Npb25Db25maWd9IGZyb20gJy4vSGh2bURlYnVnZ2VyUHJveHlTZXJ2aWNlJztcblxuY29uc3QgZGVmYXVsdENvbmZpZzogSGh2bURlYnVnZ2VyU2Vzc2lvbkNvbmZpZyA9IHtcbiAgeGRlYnVnQXR0YWNoUG9ydDogOTAwMCxcbiAgeGRlYnVnTGF1bmNoaW5nUG9ydDogMTAxMTIsXG4gIGxvZ0xldmVsOiAnSU5GTycsXG4gIHRhcmdldFVyaTogJycsXG4gIHBocFJ1bnRpbWVQYXRoOiAnL3Vzci9sb2NhbC9iaW4vcGhwJyxcbn07XG5cbmxldCBjb25maWc6IEhodm1EZWJ1Z2dlclNlc3Npb25Db25maWcgPSBkZWZhdWx0Q29uZmlnO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29uZmlnKCk6IEhodm1EZWJ1Z2dlclNlc3Npb25Db25maWcge1xuICByZXR1cm4gY29uZmlnO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0Q29uZmlnKG5ld0NvbmZpZzogSGh2bURlYnVnZ2VyU2Vzc2lvbkNvbmZpZyk6IHZvaWQge1xuICBjb25maWcgPSB7XG4gICAgLi4ubmV3Q29uZmlnLFxuICB9O1xuICBsb2dnZXIubG9nKGBDb25maWcgd2FzIHNldCB0byAke0pTT04uc3RyaW5naWZ5KGNvbmZpZyl9YCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjbGVhckNvbmZpZygpOiB2b2lkIHtcbiAgY29uZmlnID0gZGVmYXVsdENvbmZpZztcbn1cbiJdfQ==