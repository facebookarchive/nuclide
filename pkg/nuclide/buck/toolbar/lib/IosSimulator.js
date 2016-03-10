Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var getDevices = _asyncToGenerator(function* () {
  var xcrunOutput = undefined;
  try {
    var _ref = yield asyncExecute('xcrun', ['simctl', 'list', 'devices']);

    var stdout = _ref.stdout;

    xcrunOutput = stdout;
  } catch (e) {
    // Users may not have xcrun installed, particularly if they are using Buck for non-iOS projects.
    return [];
  }
  return parseDevicesFromSimctlOutput(xcrunOutput);
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _require = require('../../../commons');

var array = _require.array;
var asyncExecute = _require.asyncExecute;

var DeviceState = {
  Creating: 'Creating',
  Booting: 'Booting',
  ShuttingDown: 'Shutting Down',
  Shutdown: 'Shutdown',
  Booted: 'Booted'
};

function parseDevicesFromSimctlOutput(output) {
  var devices = [];
  var currentOS = null;

  output.split('\n').forEach(function (line) {
    var section = line.match(/^-- (.+) --$/);
    if (section) {
      var header = section[1].match(/^iOS (.+)$/);
      if (header) {
        currentOS = header[1];
      } else {
        currentOS = null;
      }
      return;
    }

    var device = line.match(/^[ ]*([^()]+) \(([^()]+)\) \((Creating|Booting|Shutting Down|Shutdown|Booted)\)/);
    if (device && currentOS) {
      var _device = _slicedToArray(device, 4);

      var _name = _device[1];
      var _udid = _device[2];
      var _state = _device[3];

      devices.push({ name: _name, udid: _udid, state: _state, os: currentOS });
    }
  });

  return devices;
}

function selectDevice(devices) {
  var bootedDeviceIndex = array.findIndex(devices, function (device) {
    return device.state === DeviceState.Booted;
  });
  if (bootedDeviceIndex > -1) {
    return bootedDeviceIndex;
  }

  var defaultDeviceIndex = 0;
  var lastOS = '';
  devices.forEach(function (device, index) {
    if (device.name === 'iPhone 5s') {
      if (device.os > lastOS) {
        defaultDeviceIndex = index;
        lastOS = device.os;
      }
    }
  });
  return defaultDeviceIndex;
}

module.exports = {
  DeviceState: DeviceState,
  getDevices: getDevices,
  parseDevicesFromSimctlOutput: parseDevicesFromSimctlOutput,
  selectDevice: selectDevice
};
//# sourceMappingURL=data:application/json;base64,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QztBQUNILFNBQU8sa0JBQWtCLENBQUM7Q0FDM0I7O0FBR0QsTUFBTSxDQUFDLE9BQU8sR0FBRztBQUNmLGFBQVcsRUFBWCxXQUFXO0FBQ1gsWUFBVSxFQUFWLFVBQVU7QUFDViw4QkFBNEIsRUFBNUIsNEJBQTRCO0FBQzVCLGNBQVksRUFBWixZQUFZO0NBQ2IsQ0FBQyIsImZpbGUiOiJJb3NTaW11bGF0b3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5jb25zdCB7YXJyYXksIGFzeW5jRXhlY3V0ZX0gPSByZXF1aXJlKCcuLi8uLi8uLi9jb21tb25zJyk7XG5cbmV4cG9ydCB0eXBlIERldmljZSA9IHtcbiAgbmFtZTogc3RyaW5nO1xuICB1ZGlkOiBzdHJpbmc7XG4gIHN0YXRlOiBzdHJpbmc7XG4gIG9zOiBzdHJpbmc7XG59XG5cbmNvbnN0IERldmljZVN0YXRlID0ge1xuICBDcmVhdGluZzogJ0NyZWF0aW5nJyxcbiAgQm9vdGluZzogJ0Jvb3RpbmcnLFxuICBTaHV0dGluZ0Rvd246ICdTaHV0dGluZyBEb3duJyxcbiAgU2h1dGRvd246ICdTaHV0ZG93bicsXG4gIEJvb3RlZDogJ0Jvb3RlZCcsXG59O1xuXG5mdW5jdGlvbiBwYXJzZURldmljZXNGcm9tU2ltY3RsT3V0cHV0KG91dHB1dDogc3RyaW5nKTogRGV2aWNlW10ge1xuICBjb25zdCBkZXZpY2VzID0gW107XG4gIGxldCBjdXJyZW50T1MgPSBudWxsO1xuXG4gIG91dHB1dC5zcGxpdCgnXFxuJykuZm9yRWFjaChsaW5lID0+IHtcbiAgICBjb25zdCBzZWN0aW9uID0gbGluZS5tYXRjaCgvXi0tICguKykgLS0kLyk7XG4gICAgaWYgKHNlY3Rpb24pIHtcbiAgICAgIGNvbnN0IGhlYWRlciA9IHNlY3Rpb25bMV0ubWF0Y2goL15pT1MgKC4rKSQvKTtcbiAgICAgIGlmIChoZWFkZXIpIHtcbiAgICAgICAgY3VycmVudE9TID0gaGVhZGVyWzFdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY3VycmVudE9TID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBkZXZpY2UgPVxuICAgICAgbGluZS5tYXRjaCgvXlsgXSooW14oKV0rKSBcXCgoW14oKV0rKVxcKSBcXCgoQ3JlYXRpbmd8Qm9vdGluZ3xTaHV0dGluZyBEb3dufFNodXRkb3dufEJvb3RlZClcXCkvKTtcbiAgICBpZiAoZGV2aWNlICYmIGN1cnJlbnRPUykge1xuICAgICAgY29uc3QgWywgbmFtZSwgdWRpZCwgc3RhdGVdID0gZGV2aWNlO1xuICAgICAgZGV2aWNlcy5wdXNoKHtuYW1lLCB1ZGlkLCBzdGF0ZSwgb3M6IGN1cnJlbnRPU30pO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIGRldmljZXM7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGdldERldmljZXMoKTogUHJvbWlzZTxEZXZpY2VbXT4ge1xuICBsZXQgeGNydW5PdXRwdXQ7XG4gIHRyeSB7XG4gICAgY29uc3Qge3N0ZG91dH0gPSBhd2FpdCBhc3luY0V4ZWN1dGUoJ3hjcnVuJywgWydzaW1jdGwnLCAnbGlzdCcsICdkZXZpY2VzJ10pO1xuICAgIHhjcnVuT3V0cHV0ID0gc3Rkb3V0O1xuICB9IGNhdGNoIChlKSB7XG4gICAgLy8gVXNlcnMgbWF5IG5vdCBoYXZlIHhjcnVuIGluc3RhbGxlZCwgcGFydGljdWxhcmx5IGlmIHRoZXkgYXJlIHVzaW5nIEJ1Y2sgZm9yIG5vbi1pT1MgcHJvamVjdHMuXG4gICAgcmV0dXJuIFtdO1xuICB9XG4gIHJldHVybiBwYXJzZURldmljZXNGcm9tU2ltY3RsT3V0cHV0KHhjcnVuT3V0cHV0KTtcbn1cblxuZnVuY3Rpb24gc2VsZWN0RGV2aWNlKGRldmljZXM6IERldmljZVtdKTogbnVtYmVyIHtcbiAgY29uc3QgYm9vdGVkRGV2aWNlSW5kZXggPSBhcnJheS5maW5kSW5kZXgoXG4gICAgZGV2aWNlcyxcbiAgICBkZXZpY2UgPT4gZGV2aWNlLnN0YXRlID09PSBEZXZpY2VTdGF0ZS5Cb290ZWRcbiAgKTtcbiAgaWYgKGJvb3RlZERldmljZUluZGV4ID4gLTEpIHtcbiAgICByZXR1cm4gYm9vdGVkRGV2aWNlSW5kZXg7XG4gIH1cblxuICBsZXQgZGVmYXVsdERldmljZUluZGV4ID0gMDtcbiAgbGV0IGxhc3RPUyA9ICcnO1xuICBkZXZpY2VzLmZvckVhY2goKGRldmljZSwgaW5kZXgpID0+IHtcbiAgICBpZiAoZGV2aWNlLm5hbWUgPT09ICdpUGhvbmUgNXMnKSB7XG4gICAgICBpZiAoZGV2aWNlLm9zID4gbGFzdE9TKSB7XG4gICAgICAgIGRlZmF1bHREZXZpY2VJbmRleCA9IGluZGV4O1xuICAgICAgICBsYXN0T1MgPSBkZXZpY2Uub3M7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIGRlZmF1bHREZXZpY2VJbmRleDtcbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgRGV2aWNlU3RhdGUsXG4gIGdldERldmljZXMsXG4gIHBhcnNlRGV2aWNlc0Zyb21TaW1jdGxPdXRwdXQsXG4gIHNlbGVjdERldmljZSxcbn07XG4iXX0=