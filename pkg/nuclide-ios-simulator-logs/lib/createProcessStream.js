Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.createProcessStream = createProcessStream;
exports._findAvailableDevice = _findAvailableDevice;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _nuclideCommons = require('../../nuclide-commons');

var _nuclideFeatureConfig = require('../../nuclide-feature-config');

var _nuclideFeatureConfig2 = _interopRequireDefault(_nuclideFeatureConfig);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _rx = require('rx');

var _rx2 = _interopRequireDefault(_rx);

function createProcessStream() {
  // Get a list of devices and their states from `xcrun simctl`.
  var simctlOutput$ = (0, _nuclideCommons.observeProcess)(spawnSimctlList).map(function (event) {
    if (event.kind === 'error') {
      throw event.error;
    }
    return event;
  }).filter(function (event) {
    return event.kind === 'stdout';
  }).map(function (event) {
    return (0, _assert2['default'])(event.data != null), event.data;
  }).reduce(function (acc, next) {
    return acc + next;
  }, '').map(function (rawJson) {
    return JSON.parse(rawJson);
  });

  var udid$ = simctlOutput$.map(function (json) {
    var devices = json.devices;

    var device = _findAvailableDevice(devices);
    if (device == null) {
      throw new Error('No active iOS simulator found');
    }
    return device.udid;
  })
  // Retry every second until we find an active device.
  .retryWhen(function (error$) {
    return error$.delay(1000);
  });

  return udid$.first().flatMap(function (udid) {
    return (0, _nuclideCommons.observeProcess)(function () {
      return tailDeviceLogs(udid);
    }).filter(function (event) {
      return event.kind === 'stdout';
    }).map(function (event) {
      return (0, _assert2['default'])(event.data != null), event.data;
    });
  });
}

/**
 * Finds the first booted available device in a list of devices (formatted in the output style of
 * `simctl`.). Exported for testing only.
 */

function _findAvailableDevice(devices) {
  for (var key of Object.keys(devices)) {
    for (var device of devices[key]) {
      if (device.availability === '(available)' && device.state === 'Booted') {
        return device;
      }
    }
  }
}

function spawnSimctlList() {
  return (0, _nuclideCommons.safeSpawn)('xcrun', ['simctl', 'list', '--json']);
}

function tailDeviceLogs(udid) {
  var logDir = _path2['default'].join(_os2['default'].homedir(), 'Library', 'Logs', 'CoreSimulator', udid, 'asl');
  return (0, _nuclideCommons.safeSpawn)(_nuclideFeatureConfig2['default'].get('nuclide-ios-simulator-logs.pathToSyslog'), ['-w', '-F', 'xml', '-d', logDir]);
}
//# sourceMappingURL=data:application/json;base64,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QUNKLEtBQUssQ0FDTixDQUFDO0FBQ0YsU0FBTywrQkFDSCxrQ0FBYyxHQUFHLENBQUMseUNBQXlDLENBQUMsRUFDOUQsQ0FDRSxJQUFJLEVBQ0osSUFBSSxFQUFFLEtBQUssRUFDWCxJQUFJLEVBQUUsTUFBTSxDQUNiLENBQ0YsQ0FBQztDQUNIIiwiZmlsZSI6ImNyZWF0ZVByb2Nlc3NTdHJlYW0uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge29ic2VydmVQcm9jZXNzLCBzYWZlU3Bhd259IGZyb20gJy4uLy4uL251Y2xpZGUtY29tbW9ucyc7XG5pbXBvcnQgZmVhdHVyZUNvbmZpZyBmcm9tICcuLi8uLi9udWNsaWRlLWZlYXR1cmUtY29uZmlnJztcbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCBvcyBmcm9tICdvcyc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCBSeCBmcm9tICdyeCc7XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVQcm9jZXNzU3RyZWFtKCk6IFJ4Lk9ic2VydmFibGU8c3RyaW5nPiB7XG4gIC8vIEdldCBhIGxpc3Qgb2YgZGV2aWNlcyBhbmQgdGhlaXIgc3RhdGVzIGZyb20gYHhjcnVuIHNpbWN0bGAuXG4gIGNvbnN0IHNpbWN0bE91dHB1dCQgPSBvYnNlcnZlUHJvY2VzcyhzcGF3blNpbWN0bExpc3QpXG4gICAgLm1hcChldmVudCA9PiB7XG4gICAgICBpZiAoZXZlbnQua2luZCA9PT0gJ2Vycm9yJykge1xuICAgICAgICB0aHJvdyBldmVudC5lcnJvcjtcbiAgICAgIH1cbiAgICAgIHJldHVybiBldmVudDtcbiAgICB9KVxuICAgIC5maWx0ZXIoZXZlbnQgPT4gZXZlbnQua2luZCA9PT0gJ3N0ZG91dCcpXG4gICAgLm1hcChldmVudCA9PiAoaW52YXJpYW50KGV2ZW50LmRhdGEgIT0gbnVsbCksIGV2ZW50LmRhdGEpKVxuICAgIC5yZWR1Y2UoKGFjYywgbmV4dCkgPT4gYWNjICsgbmV4dCwgJycpXG4gICAgLm1hcChyYXdKc29uID0+IEpTT04ucGFyc2UocmF3SnNvbikpO1xuXG4gIGNvbnN0IHVkaWQkID0gc2ltY3RsT3V0cHV0JFxuICAgIC5tYXAoanNvbiA9PiB7XG4gICAgICBjb25zdCB7ZGV2aWNlc30gPSBqc29uO1xuICAgICAgY29uc3QgZGV2aWNlID0gX2ZpbmRBdmFpbGFibGVEZXZpY2UoZGV2aWNlcyk7XG4gICAgICBpZiAoZGV2aWNlID09IG51bGwpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBhY3RpdmUgaU9TIHNpbXVsYXRvciBmb3VuZCcpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGRldmljZS51ZGlkO1xuICAgIH0pXG4gICAgLy8gUmV0cnkgZXZlcnkgc2Vjb25kIHVudGlsIHdlIGZpbmQgYW4gYWN0aXZlIGRldmljZS5cbiAgICAucmV0cnlXaGVuKGVycm9yJCA9PiBlcnJvciQuZGVsYXkoMTAwMCkpO1xuXG4gIHJldHVybiB1ZGlkJFxuICAgIC5maXJzdCgpXG4gICAgLmZsYXRNYXAodWRpZCA9PiAoXG4gICAgICBvYnNlcnZlUHJvY2VzcygoKSA9PiB0YWlsRGV2aWNlTG9ncyh1ZGlkKSlcbiAgICAgICAgLmZpbHRlcihldmVudCA9PiBldmVudC5raW5kID09PSAnc3Rkb3V0JylcbiAgICAgICAgLm1hcChldmVudCA9PiAoaW52YXJpYW50KGV2ZW50LmRhdGEgIT0gbnVsbCksIGV2ZW50LmRhdGEpKVxuICAgICkpO1xufVxuXG4vKipcbiAqIEZpbmRzIHRoZSBmaXJzdCBib290ZWQgYXZhaWxhYmxlIGRldmljZSBpbiBhIGxpc3Qgb2YgZGV2aWNlcyAoZm9ybWF0dGVkIGluIHRoZSBvdXRwdXQgc3R5bGUgb2ZcbiAqIGBzaW1jdGxgLikuIEV4cG9ydGVkIGZvciB0ZXN0aW5nIG9ubHkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBfZmluZEF2YWlsYWJsZURldmljZShkZXZpY2VzOiBPYmplY3QpOiA/T2JqZWN0IHtcbiAgZm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMoZGV2aWNlcykpIHtcbiAgICBmb3IgKGNvbnN0IGRldmljZSBvZiBkZXZpY2VzW2tleV0pIHtcbiAgICAgIGlmIChkZXZpY2UuYXZhaWxhYmlsaXR5ID09PSAnKGF2YWlsYWJsZSknICYmIGRldmljZS5zdGF0ZSA9PT0gJ0Jvb3RlZCcpIHtcbiAgICAgICAgcmV0dXJuIGRldmljZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gc3Bhd25TaW1jdGxMaXN0KCk6IFByb21pc2U8Y2hpbGRfcHJvY2VzcyRDaGlsZFByb2Nlc3M+IHtcbiAgcmV0dXJuIHNhZmVTcGF3bigneGNydW4nLCBbXG4gICAgJ3NpbWN0bCcsXG4gICAgJ2xpc3QnLFxuICAgICctLWpzb24nLFxuICBdKTtcbn1cblxuZnVuY3Rpb24gdGFpbERldmljZUxvZ3ModWRpZDogc3RyaW5nKTogUHJvbWlzZTxjaGlsZF9wcm9jZXNzJENoaWxkUHJvY2Vzcz4ge1xuICBjb25zdCBsb2dEaXIgPSBwYXRoLmpvaW4oXG4gICAgb3MuaG9tZWRpcigpLFxuICAgICdMaWJyYXJ5JyxcbiAgICAnTG9ncycsXG4gICAgJ0NvcmVTaW11bGF0b3InLFxuICAgIHVkaWQsXG4gICAgJ2FzbCcsXG4gICk7XG4gIHJldHVybiBzYWZlU3Bhd24oXG4gICAgKChmZWF0dXJlQ29uZmlnLmdldCgnbnVjbGlkZS1pb3Mtc2ltdWxhdG9yLWxvZ3MucGF0aFRvU3lzbG9nJyk6IGFueSk6IHN0cmluZyksXG4gICAgW1xuICAgICAgJy13JyxcbiAgICAgICctRicsICd4bWwnLFxuICAgICAgJy1kJywgbG9nRGlyLFxuICAgIF0sXG4gICk7XG59XG4iXX0=