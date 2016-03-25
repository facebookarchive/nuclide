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
  var simctlOutput$ = (0, _nuclideCommons.observeProcess)(spawnSimctlList).filter(function (event) {
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
  return (0, _nuclideCommons.safeSpawn)('syslog', ['-w', '-F', 'xml', '-d', logDir]);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNyZWF0ZVByb2Nlc3NTdHJlYW0uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs4QkFXd0MsdUJBQXVCOztzQkFDekMsUUFBUTs7OztrQkFDZixJQUFJOzs7O29CQUNGLE1BQU07Ozs7a0JBQ1IsSUFBSTs7OztBQUVaLFNBQVMsbUJBQW1CLEdBQTBCOztBQUUzRCxNQUFNLGFBQWEsR0FBRyxvQ0FBZSxlQUFlLENBQUMsQ0FDbEQsTUFBTSxDQUFDLFVBQUEsS0FBSztXQUFJLEtBQUssQ0FBQyxJQUFJLEtBQUssUUFBUTtHQUFBLENBQUMsQ0FDeEMsR0FBRyxDQUFDLFVBQUEsS0FBSztXQUFLLHlCQUFVLEtBQUssQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLEVBQUUsS0FBSyxDQUFDLElBQUk7R0FBQyxDQUFDLENBQ3pELE1BQU0sQ0FBQyxVQUFDLEdBQUcsRUFBRSxJQUFJO1dBQUssR0FBRyxHQUFHLElBQUk7R0FBQSxFQUFFLEVBQUUsQ0FBQyxDQUNyQyxHQUFHLENBQUMsVUFBQSxPQUFPO1dBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUM7R0FBQSxDQUFDLENBQUM7O0FBRXZDLE1BQU0sS0FBSyxHQUFHLGFBQWEsQ0FDeEIsR0FBRyxDQUFDLFVBQUEsSUFBSSxFQUFJO1FBQ0osT0FBTyxHQUFJLElBQUksQ0FBZixPQUFPOztBQUNkLFFBQU0sTUFBTSxHQUFHLG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQzdDLFFBQUksTUFBTSxJQUFJLElBQUksRUFBRTtBQUNsQixZQUFNLElBQUksS0FBSyxDQUFDLCtCQUErQixDQUFDLENBQUM7S0FDbEQ7QUFDRCxXQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUM7R0FDcEIsQ0FBQzs7R0FFRCxTQUFTLENBQUMsVUFBQSxNQUFNO1dBQUksTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUM7R0FBQSxDQUFDLENBQUM7O0FBRTNDLFNBQU8sS0FBSyxDQUNULEtBQUssRUFBRSxDQUNQLE9BQU8sQ0FBQyxVQUFBLElBQUk7V0FDWCxvQ0FBZTthQUFNLGNBQWMsQ0FBQyxJQUFJLENBQUM7S0FBQSxDQUFDLENBQ3ZDLE1BQU0sQ0FBQyxVQUFBLEtBQUs7YUFBSSxLQUFLLENBQUMsSUFBSSxLQUFLLFFBQVE7S0FBQSxDQUFDLENBQ3hDLEdBQUcsQ0FBQyxVQUFBLEtBQUs7YUFBSyx5QkFBVSxLQUFLLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxFQUFFLEtBQUssQ0FBQyxJQUFJO0tBQUMsQ0FBQztHQUM3RCxDQUFDLENBQUM7Q0FDTjs7Ozs7OztBQU1NLFNBQVMsb0JBQW9CLENBQUMsT0FBZSxFQUFXO0FBQzdELE9BQUssSUFBTSxHQUFHLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRTtBQUN0QyxTQUFLLElBQU0sTUFBTSxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRTtBQUNqQyxVQUFJLE1BQU0sQ0FBQyxZQUFZLEtBQUssYUFBYSxJQUFJLE1BQU0sQ0FBQyxLQUFLLEtBQUssUUFBUSxFQUFFO0FBQ3RFLGVBQU8sTUFBTSxDQUFDO09BQ2Y7S0FDRjtHQUNGO0NBQ0Y7O0FBRUQsU0FBUyxlQUFlLEdBQXdDO0FBQzlELFNBQU8sK0JBQVUsT0FBTyxFQUFFLENBQ3hCLFFBQVEsRUFDUixNQUFNLEVBQ04sUUFBUSxDQUNULENBQUMsQ0FBQztDQUNKOztBQUVELFNBQVMsY0FBYyxDQUFDLElBQVksRUFBdUM7QUFDekUsTUFBTSxNQUFNLEdBQUcsa0JBQUssSUFBSSxDQUN0QixnQkFBRyxPQUFPLEVBQUUsRUFDWixTQUFTLEVBQ1QsTUFBTSxFQUNOLGVBQWUsRUFDZixJQUFJLEVBQ0osS0FBSyxDQUNOLENBQUM7QUFDRixTQUFPLCtCQUFVLFFBQVEsRUFBRSxDQUN6QixJQUFJLEVBQ0osSUFBSSxFQUFFLEtBQUssRUFDWCxJQUFJLEVBQUUsTUFBTSxDQUNiLENBQUMsQ0FBQztDQUNKIiwiZmlsZSI6ImNyZWF0ZVByb2Nlc3NTdHJlYW0uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge29ic2VydmVQcm9jZXNzLCBzYWZlU3Bhd259IGZyb20gJy4uLy4uL251Y2xpZGUtY29tbW9ucyc7XG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQgb3MgZnJvbSAnb3MnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgUnggZnJvbSAncngnO1xuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlUHJvY2Vzc1N0cmVhbSgpOiBSeC5PYnNlcnZhYmxlPHN0cmluZz4ge1xuICAvLyBHZXQgYSBsaXN0IG9mIGRldmljZXMgYW5kIHRoZWlyIHN0YXRlcyBmcm9tIGB4Y3J1biBzaW1jdGxgLlxuICBjb25zdCBzaW1jdGxPdXRwdXQkID0gb2JzZXJ2ZVByb2Nlc3Moc3Bhd25TaW1jdGxMaXN0KVxuICAgIC5maWx0ZXIoZXZlbnQgPT4gZXZlbnQua2luZCA9PT0gJ3N0ZG91dCcpXG4gICAgLm1hcChldmVudCA9PiAoaW52YXJpYW50KGV2ZW50LmRhdGEgIT0gbnVsbCksIGV2ZW50LmRhdGEpKVxuICAgIC5yZWR1Y2UoKGFjYywgbmV4dCkgPT4gYWNjICsgbmV4dCwgJycpXG4gICAgLm1hcChyYXdKc29uID0+IEpTT04ucGFyc2UocmF3SnNvbikpO1xuXG4gIGNvbnN0IHVkaWQkID0gc2ltY3RsT3V0cHV0JFxuICAgIC5tYXAoanNvbiA9PiB7XG4gICAgICBjb25zdCB7ZGV2aWNlc30gPSBqc29uO1xuICAgICAgY29uc3QgZGV2aWNlID0gX2ZpbmRBdmFpbGFibGVEZXZpY2UoZGV2aWNlcyk7XG4gICAgICBpZiAoZGV2aWNlID09IG51bGwpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBhY3RpdmUgaU9TIHNpbXVsYXRvciBmb3VuZCcpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGRldmljZS51ZGlkO1xuICAgIH0pXG4gICAgLy8gUmV0cnkgZXZlcnkgc2Vjb25kIHVudGlsIHdlIGZpbmQgYW4gYWN0aXZlIGRldmljZS5cbiAgICAucmV0cnlXaGVuKGVycm9yJCA9PiBlcnJvciQuZGVsYXkoMTAwMCkpO1xuXG4gIHJldHVybiB1ZGlkJFxuICAgIC5maXJzdCgpXG4gICAgLmZsYXRNYXAodWRpZCA9PiAoXG4gICAgICBvYnNlcnZlUHJvY2VzcygoKSA9PiB0YWlsRGV2aWNlTG9ncyh1ZGlkKSlcbiAgICAgICAgLmZpbHRlcihldmVudCA9PiBldmVudC5raW5kID09PSAnc3Rkb3V0JylcbiAgICAgICAgLm1hcChldmVudCA9PiAoaW52YXJpYW50KGV2ZW50LmRhdGEgIT0gbnVsbCksIGV2ZW50LmRhdGEpKVxuICAgICkpO1xufVxuXG4vKipcbiAqIEZpbmRzIHRoZSBmaXJzdCBib290ZWQgYXZhaWxhYmxlIGRldmljZSBpbiBhIGxpc3Qgb2YgZGV2aWNlcyAoZm9ybWF0dGVkIGluIHRoZSBvdXRwdXQgc3R5bGUgb2ZcbiAqIGBzaW1jdGxgLikuIEV4cG9ydGVkIGZvciB0ZXN0aW5nIG9ubHkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBfZmluZEF2YWlsYWJsZURldmljZShkZXZpY2VzOiBPYmplY3QpOiA/T2JqZWN0IHtcbiAgZm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMoZGV2aWNlcykpIHtcbiAgICBmb3IgKGNvbnN0IGRldmljZSBvZiBkZXZpY2VzW2tleV0pIHtcbiAgICAgIGlmIChkZXZpY2UuYXZhaWxhYmlsaXR5ID09PSAnKGF2YWlsYWJsZSknICYmIGRldmljZS5zdGF0ZSA9PT0gJ0Jvb3RlZCcpIHtcbiAgICAgICAgcmV0dXJuIGRldmljZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gc3Bhd25TaW1jdGxMaXN0KCk6IFByb21pc2U8Y2hpbGRfcHJvY2VzcyRDaGlsZFByb2Nlc3M+IHtcbiAgcmV0dXJuIHNhZmVTcGF3bigneGNydW4nLCBbXG4gICAgJ3NpbWN0bCcsXG4gICAgJ2xpc3QnLFxuICAgICctLWpzb24nLFxuICBdKTtcbn1cblxuZnVuY3Rpb24gdGFpbERldmljZUxvZ3ModWRpZDogc3RyaW5nKTogUHJvbWlzZTxjaGlsZF9wcm9jZXNzJENoaWxkUHJvY2Vzcz4ge1xuICBjb25zdCBsb2dEaXIgPSBwYXRoLmpvaW4oXG4gICAgb3MuaG9tZWRpcigpLFxuICAgICdMaWJyYXJ5JyxcbiAgICAnTG9ncycsXG4gICAgJ0NvcmVTaW11bGF0b3InLFxuICAgIHVkaWQsXG4gICAgJ2FzbCcsXG4gICk7XG4gIHJldHVybiBzYWZlU3Bhd24oJ3N5c2xvZycsIFtcbiAgICAnLXcnLFxuICAgICctRicsICd4bWwnLFxuICAgICctZCcsIGxvZ0RpcixcbiAgXSk7XG59XG4iXX0=