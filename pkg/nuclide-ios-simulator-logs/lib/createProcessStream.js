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

var _reactivexRxjs = require('@reactivex/rxjs');

var _reactivexRxjs2 = _interopRequireDefault(_reactivexRxjs);

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
//# sourceMappingURL=data:application/json;base64,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SSxFQUNKLEtBQUssQ0FDTixDQUFDO0FBQ0YsU0FBTywrQkFDSCxrQ0FBYyxHQUFHLENBQUMseUNBQXlDLENBQUMsRUFDOUQsQ0FDRSxJQUFJLEVBQ0osSUFBSSxFQUFFLEtBQUssRUFDWCxJQUFJLEVBQUUsTUFBTSxDQUNiLENBQ0YsQ0FBQztDQUNIIiwiZmlsZSI6ImNyZWF0ZVByb2Nlc3NTdHJlYW0uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge29ic2VydmVQcm9jZXNzLCBzYWZlU3Bhd259IGZyb20gJy4uLy4uL251Y2xpZGUtY29tbW9ucyc7XG5pbXBvcnQgZmVhdHVyZUNvbmZpZyBmcm9tICcuLi8uLi9udWNsaWRlLWZlYXR1cmUtY29uZmlnJztcbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCBvcyBmcm9tICdvcyc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCBSeCBmcm9tICdAcmVhY3RpdmV4L3J4anMnO1xuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlUHJvY2Vzc1N0cmVhbSgpOiBSeC5PYnNlcnZhYmxlPHN0cmluZz4ge1xuICAvLyBHZXQgYSBsaXN0IG9mIGRldmljZXMgYW5kIHRoZWlyIHN0YXRlcyBmcm9tIGB4Y3J1biBzaW1jdGxgLlxuICBjb25zdCBzaW1jdGxPdXRwdXQkID0gb2JzZXJ2ZVByb2Nlc3Moc3Bhd25TaW1jdGxMaXN0KVxuICAgIC5tYXAoZXZlbnQgPT4ge1xuICAgICAgaWYgKGV2ZW50LmtpbmQgPT09ICdlcnJvcicpIHtcbiAgICAgICAgdGhyb3cgZXZlbnQuZXJyb3I7XG4gICAgICB9XG4gICAgICByZXR1cm4gZXZlbnQ7XG4gICAgfSlcbiAgICAuZmlsdGVyKGV2ZW50ID0+IGV2ZW50LmtpbmQgPT09ICdzdGRvdXQnKVxuICAgIC5tYXAoZXZlbnQgPT4gKGludmFyaWFudChldmVudC5kYXRhICE9IG51bGwpLCBldmVudC5kYXRhKSlcbiAgICAucmVkdWNlKChhY2MsIG5leHQpID0+IGFjYyArIG5leHQsICcnKVxuICAgIC5tYXAocmF3SnNvbiA9PiBKU09OLnBhcnNlKHJhd0pzb24pKTtcblxuICBjb25zdCB1ZGlkJCA9IHNpbWN0bE91dHB1dCRcbiAgICAubWFwKGpzb24gPT4ge1xuICAgICAgY29uc3Qge2RldmljZXN9ID0ganNvbjtcbiAgICAgIGNvbnN0IGRldmljZSA9IF9maW5kQXZhaWxhYmxlRGV2aWNlKGRldmljZXMpO1xuICAgICAgaWYgKGRldmljZSA9PSBudWxsKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTm8gYWN0aXZlIGlPUyBzaW11bGF0b3IgZm91bmQnKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBkZXZpY2UudWRpZDtcbiAgICB9KVxuICAgIC8vIFJldHJ5IGV2ZXJ5IHNlY29uZCB1bnRpbCB3ZSBmaW5kIGFuIGFjdGl2ZSBkZXZpY2UuXG4gICAgLnJldHJ5V2hlbihlcnJvciQgPT4gZXJyb3IkLmRlbGF5KDEwMDApKTtcblxuICByZXR1cm4gdWRpZCRcbiAgICAuZmlyc3QoKVxuICAgIC5mbGF0TWFwKHVkaWQgPT4gKFxuICAgICAgb2JzZXJ2ZVByb2Nlc3MoKCkgPT4gdGFpbERldmljZUxvZ3ModWRpZCkpXG4gICAgICAgIC5maWx0ZXIoZXZlbnQgPT4gZXZlbnQua2luZCA9PT0gJ3N0ZG91dCcpXG4gICAgICAgIC5tYXAoZXZlbnQgPT4gKGludmFyaWFudChldmVudC5kYXRhICE9IG51bGwpLCBldmVudC5kYXRhKSlcbiAgICApKTtcbn1cblxuLyoqXG4gKiBGaW5kcyB0aGUgZmlyc3QgYm9vdGVkIGF2YWlsYWJsZSBkZXZpY2UgaW4gYSBsaXN0IG9mIGRldmljZXMgKGZvcm1hdHRlZCBpbiB0aGUgb3V0cHV0IHN0eWxlIG9mXG4gKiBgc2ltY3RsYC4pLiBFeHBvcnRlZCBmb3IgdGVzdGluZyBvbmx5LlxuICovXG5leHBvcnQgZnVuY3Rpb24gX2ZpbmRBdmFpbGFibGVEZXZpY2UoZGV2aWNlczogT2JqZWN0KTogP09iamVjdCB7XG4gIGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKGRldmljZXMpKSB7XG4gICAgZm9yIChjb25zdCBkZXZpY2Ugb2YgZGV2aWNlc1trZXldKSB7XG4gICAgICBpZiAoZGV2aWNlLmF2YWlsYWJpbGl0eSA9PT0gJyhhdmFpbGFibGUpJyAmJiBkZXZpY2Uuc3RhdGUgPT09ICdCb290ZWQnKSB7XG4gICAgICAgIHJldHVybiBkZXZpY2U7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHNwYXduU2ltY3RsTGlzdCgpOiBQcm9taXNlPGNoaWxkX3Byb2Nlc3MkQ2hpbGRQcm9jZXNzPiB7XG4gIHJldHVybiBzYWZlU3Bhd24oJ3hjcnVuJywgW1xuICAgICdzaW1jdGwnLFxuICAgICdsaXN0JyxcbiAgICAnLS1qc29uJyxcbiAgXSk7XG59XG5cbmZ1bmN0aW9uIHRhaWxEZXZpY2VMb2dzKHVkaWQ6IHN0cmluZyk6IFByb21pc2U8Y2hpbGRfcHJvY2VzcyRDaGlsZFByb2Nlc3M+IHtcbiAgY29uc3QgbG9nRGlyID0gcGF0aC5qb2luKFxuICAgIG9zLmhvbWVkaXIoKSxcbiAgICAnTGlicmFyeScsXG4gICAgJ0xvZ3MnLFxuICAgICdDb3JlU2ltdWxhdG9yJyxcbiAgICB1ZGlkLFxuICAgICdhc2wnLFxuICApO1xuICByZXR1cm4gc2FmZVNwYXduKFxuICAgICgoZmVhdHVyZUNvbmZpZy5nZXQoJ251Y2xpZGUtaW9zLXNpbXVsYXRvci1sb2dzLnBhdGhUb1N5c2xvZycpOiBhbnkpOiBzdHJpbmcpLFxuICAgIFtcbiAgICAgICctdycsXG4gICAgICAnLUYnLCAneG1sJyxcbiAgICAgICctZCcsIGxvZ0RpcixcbiAgICBdLFxuICApO1xufVxuIl19