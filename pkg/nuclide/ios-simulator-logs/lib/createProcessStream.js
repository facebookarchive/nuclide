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

var _commons = require('../../commons');

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
  var simctlOutput$ = (0, _commons.observeProcess)(spawnSimctlList).filter(function (event) {
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
    return (0, _commons.observeProcess)(function () {
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
  return (0, _commons.safeSpawn)('xcrun', ['simctl', 'list', '--json']);
}

function tailDeviceLogs(udid) {
  var logDir = _path2['default'].join(_os2['default'].homedir(), 'Library', 'Logs', 'CoreSimulator', udid, 'asl');
  return (0, _commons.safeSpawn)('syslog', ['-w', '-F', 'xml', '-d', logDir]);
}
//# sourceMappingURL=data:application/json;base64,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c0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHtvYnNlcnZlUHJvY2Vzcywgc2FmZVNwYXdufSBmcm9tICcuLi8uLi9jb21tb25zJztcbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCBvcyBmcm9tICdvcyc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCBSeCBmcm9tICdyeCc7XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVQcm9jZXNzU3RyZWFtKCk6IFJ4Lk9ic2VydmFibGU8c3RyaW5nPiB7XG4gIC8vIEdldCBhIGxpc3Qgb2YgZGV2aWNlcyBhbmQgdGhlaXIgc3RhdGVzIGZyb20gYHhjcnVuIHNpbWN0bGAuXG4gIGNvbnN0IHNpbWN0bE91dHB1dCQgPSBvYnNlcnZlUHJvY2VzcyhzcGF3blNpbWN0bExpc3QpXG4gICAgLmZpbHRlcihldmVudCA9PiBldmVudC5raW5kID09PSAnc3Rkb3V0JylcbiAgICAubWFwKGV2ZW50ID0+IChpbnZhcmlhbnQoZXZlbnQuZGF0YSAhPSBudWxsKSwgZXZlbnQuZGF0YSkpXG4gICAgLnJlZHVjZSgoYWNjLCBuZXh0KSA9PiBhY2MgKyBuZXh0LCAnJylcbiAgICAubWFwKHJhd0pzb24gPT4gSlNPTi5wYXJzZShyYXdKc29uKSk7XG5cbiAgY29uc3QgdWRpZCQgPSBzaW1jdGxPdXRwdXQkXG4gICAgLm1hcChqc29uID0+IHtcbiAgICAgIGNvbnN0IHtkZXZpY2VzfSA9IGpzb247XG4gICAgICBjb25zdCBkZXZpY2UgPSBfZmluZEF2YWlsYWJsZURldmljZShkZXZpY2VzKTtcbiAgICAgIGlmIChkZXZpY2UgPT0gbnVsbCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIGFjdGl2ZSBpT1Mgc2ltdWxhdG9yIGZvdW5kJyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gZGV2aWNlLnVkaWQ7XG4gICAgfSlcbiAgICAvLyBSZXRyeSBldmVyeSBzZWNvbmQgdW50aWwgd2UgZmluZCBhbiBhY3RpdmUgZGV2aWNlLlxuICAgIC5yZXRyeVdoZW4oZXJyb3IkID0+IGVycm9yJC5kZWxheSgxMDAwKSk7XG5cbiAgcmV0dXJuIHVkaWQkXG4gICAgLmZpcnN0KClcbiAgICAuZmxhdE1hcCh1ZGlkID0+IChcbiAgICAgIG9ic2VydmVQcm9jZXNzKCgpID0+IHRhaWxEZXZpY2VMb2dzKHVkaWQpKVxuICAgICAgICAuZmlsdGVyKGV2ZW50ID0+IGV2ZW50LmtpbmQgPT09ICdzdGRvdXQnKVxuICAgICAgICAubWFwKGV2ZW50ID0+IChpbnZhcmlhbnQoZXZlbnQuZGF0YSAhPSBudWxsKSwgZXZlbnQuZGF0YSkpXG4gICAgKSk7XG59XG5cbi8qKlxuICogRmluZHMgdGhlIGZpcnN0IGJvb3RlZCBhdmFpbGFibGUgZGV2aWNlIGluIGEgbGlzdCBvZiBkZXZpY2VzIChmb3JtYXR0ZWQgaW4gdGhlIG91dHB1dCBzdHlsZSBvZlxuICogYHNpbWN0bGAuKS4gRXhwb3J0ZWQgZm9yIHRlc3Rpbmcgb25seS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIF9maW5kQXZhaWxhYmxlRGV2aWNlKGRldmljZXM6IE9iamVjdCk6ID9PYmplY3Qge1xuICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhkZXZpY2VzKSkge1xuICAgIGZvciAoY29uc3QgZGV2aWNlIG9mIGRldmljZXNba2V5XSkge1xuICAgICAgaWYgKGRldmljZS5hdmFpbGFiaWxpdHkgPT09ICcoYXZhaWxhYmxlKScgJiYgZGV2aWNlLnN0YXRlID09PSAnQm9vdGVkJykge1xuICAgICAgICByZXR1cm4gZGV2aWNlO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBzcGF3blNpbWN0bExpc3QoKTogUHJvbWlzZTxjaGlsZF9wcm9jZXNzJENoaWxkUHJvY2Vzcz4ge1xuICByZXR1cm4gc2FmZVNwYXduKCd4Y3J1bicsIFtcbiAgICAnc2ltY3RsJyxcbiAgICAnbGlzdCcsXG4gICAgJy0tanNvbicsXG4gIF0pO1xufVxuXG5mdW5jdGlvbiB0YWlsRGV2aWNlTG9ncyh1ZGlkOiBzdHJpbmcpOiBQcm9taXNlPGNoaWxkX3Byb2Nlc3MkQ2hpbGRQcm9jZXNzPiB7XG4gIGNvbnN0IGxvZ0RpciA9IHBhdGguam9pbihcbiAgICBvcy5ob21lZGlyKCksXG4gICAgJ0xpYnJhcnknLFxuICAgICdMb2dzJyxcbiAgICAnQ29yZVNpbXVsYXRvcicsXG4gICAgdWRpZCxcbiAgICAnYXNsJyxcbiAgKTtcbiAgcmV0dXJuIHNhZmVTcGF3bignc3lzbG9nJywgW1xuICAgICctdycsXG4gICAgJy1GJywgJ3htbCcsXG4gICAgJy1kJywgbG9nRGlyLFxuICBdKTtcbn1cbiJdfQ==