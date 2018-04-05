'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.observeDevices = observeDevices;
exports.getDevices = getDevices;

var _process;

function _load_process() {
  return _process = require('nuclide-commons/process');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _collection;

function _load_collection() {
  return _collection = require('nuclide-commons/collection');
}

var _shallowequal;

function _load_shallowequal() {
  return _shallowequal = _interopRequireDefault(require('shallowequal'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const poller = createPoller();

// Callback version
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

function observeDevices(callback) {
  const subscription = poller.subscribe(devices => callback(devices));
  return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => subscription.unsubscribe());
}

// Observable version
function getDevices() {
  return poller;
}

function createPoller() {
  return _rxjsBundlesRxMinJs.Observable.interval(2000).startWith(0).switchMap(() => {
    return (0, (_process || _load_process()).runCommand)('fbsimctl', ['--json', '--format=%n%u%s%o%a', 'list']).map(parseFbsimctlJsonOutput).catch(error => {
      const friendlyError = new Error("Can't fetch iOS devices. Make sure that fbsimctl is in your $PATH and that it works properly.");
      if (error.code !== 'ENOENT') {
        (0, (_log4js || _load_log4js()).getLogger)().error(error);
      } else {
        // Keep the code so tooling higher up knows this is due to the tool missing.
        friendlyError.code = 'ENOENT';
      }
      return _rxjsBundlesRxMinJs.Observable.of(friendlyError);
    });
  }).distinctUntilChanged((a, b) => {
    if (Array.isArray(a) && Array.isArray(b)) {
      return (0, (_collection || _load_collection()).arrayEqual)(a, b, (_shallowequal || _load_shallowequal()).default);
    } else if (a instanceof Error && b instanceof Error) {
      return a.message === b.message;
    } else {
      return false;
    }
  }).catch(error => {
    (0, (_log4js || _load_log4js()).getLogger)().error(error);
    return _rxjsBundlesRxMinJs.Observable.of([]);
  }).publishReplay(1).refCount();
}

function parseFbsimctlJsonOutput(output) {
  const devices = [];

  output.split('\n').forEach(line => {
    let event;
    try {
      event = JSON.parse(line);
    } catch (e) {
      return;
    }
    if (!event || !event.event_name || event.event_name !== 'list' || !event.subject) {
      return;
    }
    const device = event.subject;
    const { state, name, udid } = device;

    // TODO (#21958483): Remove this hack when `fbsimctl` produces the right
    // information for new OS devices.
    let { os, arch } = device;
    if (!os && !arch && /^(iPhone|iPad)/.test(name)) {
      os = 'iOS <unknown version>';
      arch = 'x86_64';
    }

    if (!state || !os || !name || !udid || !arch) {
      return;
    }

    if (!os.match(/^iOS (.+)$/)) {
      return;
    }
    const type = typeFromArch(arch);
    if (type == null) {
      return;
    }

    devices.push({
      name,
      udid,
      state,
      os,
      arch,
      type
    });
  });

  return devices;
}

function typeFromArch(arch) {
  switch (arch) {
    case 'x86_64':
    case 'i386':
      return 'simulator';
    case 'arm64':
    case 'armv7':
    case 'armv7s':
      return 'physical_device';
    default:
      return null;
  }
}