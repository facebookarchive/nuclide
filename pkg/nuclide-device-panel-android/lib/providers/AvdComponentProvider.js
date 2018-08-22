"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AvdComponentProvider = void 0;

function _nuclideWatchmanHelpers() {
  const data = require("../../../../modules/nuclide-watchman-helpers");

  _nuclideWatchmanHelpers = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _expected() {
  const data = require("../../../../modules/nuclide-commons/expected");

  _expected = function () {
    return data;
  };

  return data;
}

function _fsPromise() {
  const data = _interopRequireDefault(require("../../../../modules/nuclide-commons/fsPromise"));

  _fsPromise = function () {
    return data;
  };

  return data;
}

function _bindObservableAsProps() {
  const data = require("../../../../modules/nuclide-commons-ui/bindObservableAsProps");

  _bindObservableAsProps = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

var _os = _interopRequireDefault(require("os"));

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _process() {
  const data = require("../../../../modules/nuclide-commons/process");

  _process = function () {
    return data;
  };

  return data;
}

function _nuclideAnalytics() {
  const data = require("../../../nuclide-analytics");

  _nuclideAnalytics = function () {
    return data;
  };

  return data;
}

function _AvdTable() {
  const data = _interopRequireDefault(require("../ui/AvdTable"));

  _AvdTable = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */
const AVD_DIRECTORY = `${_os.default.homedir()}/.android/avd`;
const AVD_LOCKFILE = 'hardware-qemu.ini.lock'; // We create a temporary .watchmanconfig so Watchman recognizes the AVD
// directory as a project root.

const AVD_WATCHMAN_CONFIG = `${AVD_DIRECTORY}/.watchmanconfig`;

class AvdComponentProvider {
  constructor() {
    this._refresh = new _RxMin.Subject();

    this._populateAvdPIDs = avds => {
      return _RxMin.Observable.fromPromise(Promise.all(avds.map(this._populateAvdPID)));
    };

    this._refreshAvds = () => {
      this._refresh.next();
    };

    this._startAvd = avd => {
      (0, _nuclideAnalytics().track)('nuclide-device-panel-android.start-emulator');

      if (!(this._emulator != null)) {
        throw new Error("Invariant violation: \"this._emulator != null\"");
      }

      (0, _process().runCommand)(this._emulator, ['@' + avd.name]).subscribe(stdout => {}, err => {
        atom.notifications.addError(`Failed to start up emulator ${avd.name}.`, {
          detail: err,
          dismissable: true
        });
      });
    };
  }

  getType() {
    return 'Android';
  }

  observe(host, callback) {
    // TODO (T26257016): Don't hide the table when ADB tunneling is on.
    if (_nuclideUri().default.isRemote(host)) {
      callback(null);
      return new (_UniversalDisposable().default)();
    }

    const disposables = this._watchAvdDirectory();

    const getProps = this._getAvds().map(avds => {
      return {
        avds,
        startAvd: this._startAvd
      };
    });

    const props = getProps.concat(this._refresh.exhaustMap(_ => getProps));
    callback({
      position: 'below_table',
      type: (0, _bindObservableAsProps().bindObservableAsProps)(props, _AvdTable().default),
      key: 'emulators'
    });
    return disposables;
  }

  _watchAvdDirectory() {
    const watchAvdDirectory = (async () => {
      const avdDirectoryExists = await _fsPromise().default.exists(AVD_DIRECTORY);

      if (!avdDirectoryExists) {
        return () => {};
      } // Create a .watchmanconfig so Watchman recognizes the AVD directory as a
      // project root.


      await _fsPromise().default.writeFile(AVD_WATCHMAN_CONFIG, '{}');
      const watchmanClient = new (_nuclideWatchmanHelpers().WatchmanClient)();
      const watchmanSubscription = await watchmanClient.watchDirectoryRecursive(AVD_DIRECTORY, AVD_DIRECTORY, {
        expression: ['match', '*.avd']
      });
      watchmanSubscription.on('change', () => {
        this._refreshAvds();
      });
      return () => _fsPromise().default.unlink(AVD_WATCHMAN_CONFIG).catch(() => {});
    })();

    return {
      dispose: () => {
        watchAvdDirectory.then(dispose => {
          dispose();
        });
      }
    };
  }

  _getEmulator() {
    return _RxMin.Observable.defer(async () => {
      const androidHome = process.env.ANDROID_HOME;
      const emulator = androidHome != null ? `${androidHome}/tools/emulator` : null;

      if (emulator == null) {
        return null;
      }

      const exists = await _fsPromise().default.exists(emulator);
      this._emulator = exists ? emulator : null;
      return this._emulator;
    });
  }

  _parseAvds(emulatorOutput) {
    const trimmedOutput = emulatorOutput.trim();
    return trimmedOutput === '' ? [] : trimmedOutput.split(_os.default.EOL);
  }

  async _populateAvdPID(avdName) {
    const lockFile = `${AVD_DIRECTORY}/${avdName}.avd/${AVD_LOCKFILE}`;

    if (await _fsPromise().default.exists(lockFile)) {
      const pid = parseInt((await _fsPromise().default.readFile(lockFile, 'utf8')), 10);
      return {
        name: avdName,
        running: true,
        pid
      };
    } else {
      return {
        name: avdName,
        running: false
      };
    }
  }

  _getAvds() {
    return this._getEmulator().switchMap(emulator => {
      return emulator != null ? (0, _process().runCommand)(emulator, ['-list-avds']).map(this._parseAvds).switchMap(this._populateAvdPIDs).map(_expected().Expect.value) : _RxMin.Observable.of(_expected().Expect.error(new Error("Cannot find 'emulator' command.")));
    });
  }

}

exports.AvdComponentProvider = AvdComponentProvider;