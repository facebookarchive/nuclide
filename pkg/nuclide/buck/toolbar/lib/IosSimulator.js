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
//# sourceMappingURL=data:application/json;base64,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QztBQUNILFNBQU8sa0JBQWtCLENBQUM7Q0FDM0I7O0FBR0QsTUFBTSxDQUFDLE9BQU8sR0FBRztBQUNmLGFBQVcsRUFBWCxXQUFXO0FBQ1gsWUFBVSxFQUFWLFVBQVU7QUFDViw4QkFBNEIsRUFBNUIsNEJBQTRCO0FBQzVCLGNBQVksRUFBWixZQUFZO0NBQ2IsQ0FBQyIsImZpbGUiOiJJb3NTaW11bGF0b3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5jb25zdCB7YXJyYXksIGFzeW5jRXhlY3V0ZX0gPSByZXF1aXJlKCcuLi8uLi8uLi9jb21tb25zJyk7XG5cbmV4cG9ydCB0eXBlIERldmljZSA9IHtcbiAgbmFtZTogc3RyaW5nO1xuICB1ZGlkOiBzdHJpbmc7XG4gIHN0YXRlOiBzdHJpbmc7XG4gIG9zOiBzdHJpbmc7XG59XG5cbmNvbnN0IERldmljZVN0YXRlID0ge1xuICBDcmVhdGluZzogJ0NyZWF0aW5nJyxcbiAgQm9vdGluZzogJ0Jvb3RpbmcnLFxuICBTaHV0dGluZ0Rvd246ICdTaHV0dGluZyBEb3duJyxcbiAgU2h1dGRvd246ICdTaHV0ZG93bicsXG4gIEJvb3RlZDogJ0Jvb3RlZCcsXG59O1xuXG5mdW5jdGlvbiBwYXJzZURldmljZXNGcm9tU2ltY3RsT3V0cHV0KG91dHB1dDogc3RyaW5nKTogRGV2aWNlW10ge1xuICBjb25zdCBkZXZpY2VzID0gW107XG4gIGxldCBjdXJyZW50T1MgPSBudWxsO1xuXG4gIG91dHB1dC5zcGxpdCgnXFxuJykuZm9yRWFjaChsaW5lID0+IHtcbiAgICBjb25zdCBzZWN0aW9uID0gbGluZS5tYXRjaCgvXi0tICguKykgLS0kLyk7XG4gICAgaWYgKHNlY3Rpb24pIHtcbiAgICAgIGNvbnN0IGhlYWRlciA9IHNlY3Rpb25bMV0ubWF0Y2goL15pT1MgKC4rKSQvKTtcbiAgICAgIGlmIChoZWFkZXIpIHtcbiAgICAgICAgY3VycmVudE9TID0gaGVhZGVyWzFdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY3VycmVudE9TID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBkZXZpY2UgPSBsaW5lLm1hdGNoKC9eWyBdKihbXigpXSspIFxcKChbXigpXSspXFwpIFxcKChDcmVhdGluZ3xCb290aW5nfFNodXR0aW5nIERvd258U2h1dGRvd258Qm9vdGVkKVxcKS8pO1xuICAgIGlmIChkZXZpY2UgJiYgY3VycmVudE9TKSB7XG4gICAgICBjb25zdCBbLCBuYW1lLCB1ZGlkLCBzdGF0ZV0gPSBkZXZpY2U7XG4gICAgICBkZXZpY2VzLnB1c2goe25hbWUsIHVkaWQsIHN0YXRlLCBvczogY3VycmVudE9TfSk7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gZGV2aWNlcztcbn1cblxuYXN5bmMgZnVuY3Rpb24gZ2V0RGV2aWNlcygpOiBQcm9taXNlPERldmljZVtdPiB7XG4gIGxldCB4Y3J1bk91dHB1dDtcbiAgdHJ5IHtcbiAgICBjb25zdCB7c3Rkb3V0fSA9IGF3YWl0IGFzeW5jRXhlY3V0ZSgneGNydW4nLCBbJ3NpbWN0bCcsICdsaXN0JywgJ2RldmljZXMnXSk7XG4gICAgeGNydW5PdXRwdXQgPSBzdGRvdXQ7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICAvLyBVc2VycyBtYXkgbm90IGhhdmUgeGNydW4gaW5zdGFsbGVkLCBwYXJ0aWN1bGFybHkgaWYgdGhleSBhcmUgdXNpbmcgQnVjayBmb3Igbm9uLWlPUyBwcm9qZWN0cy5cbiAgICByZXR1cm4gW107XG4gIH1cbiAgcmV0dXJuIHBhcnNlRGV2aWNlc0Zyb21TaW1jdGxPdXRwdXQoeGNydW5PdXRwdXQpO1xufVxuXG5mdW5jdGlvbiBzZWxlY3REZXZpY2UoZGV2aWNlczogRGV2aWNlW10pOiBudW1iZXIge1xuICBjb25zdCBib290ZWREZXZpY2VJbmRleCA9IGFycmF5LmZpbmRJbmRleChcbiAgICBkZXZpY2VzLFxuICAgIGRldmljZSA9PiBkZXZpY2Uuc3RhdGUgPT09IERldmljZVN0YXRlLkJvb3RlZFxuICApO1xuICBpZiAoYm9vdGVkRGV2aWNlSW5kZXggPiAtMSkge1xuICAgIHJldHVybiBib290ZWREZXZpY2VJbmRleDtcbiAgfVxuXG4gIGxldCBkZWZhdWx0RGV2aWNlSW5kZXggPSAwO1xuICBsZXQgbGFzdE9TID0gJyc7XG4gIGRldmljZXMuZm9yRWFjaCgoZGV2aWNlLCBpbmRleCkgPT4ge1xuICAgIGlmIChkZXZpY2UubmFtZSA9PT0gJ2lQaG9uZSA1cycpIHtcbiAgICAgIGlmIChkZXZpY2Uub3MgPiBsYXN0T1MpIHtcbiAgICAgICAgZGVmYXVsdERldmljZUluZGV4ID0gaW5kZXg7XG4gICAgICAgIGxhc3RPUyA9IGRldmljZS5vcztcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuICByZXR1cm4gZGVmYXVsdERldmljZUluZGV4O1xufVxuXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBEZXZpY2VTdGF0ZSxcbiAgZ2V0RGV2aWNlcyxcbiAgcGFyc2VEZXZpY2VzRnJvbVNpbWN0bE91dHB1dCxcbiAgc2VsZWN0RGV2aWNlLFxufTtcbiJdfQ==