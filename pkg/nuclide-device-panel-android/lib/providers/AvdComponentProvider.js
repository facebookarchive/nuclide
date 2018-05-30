'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AvdComponentProvider = undefined;

var _nuclideWatchmanHelpers;

function _load_nuclideWatchmanHelpers() {
  return _nuclideWatchmanHelpers = require('../../../../modules/nuclide-watchman-helpers');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../../modules/nuclide-commons/nuclideUri'));
}

var _expected;

function _load_expected() {
  return _expected = require('../../../../modules/nuclide-commons/expected');
}

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('../../../../modules/nuclide-commons/fsPromise'));
}

var _bindObservableAsProps;

function _load_bindObservableAsProps() {
  return _bindObservableAsProps = require('../../../../modules/nuclide-commons-ui/bindObservableAsProps');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../../modules/nuclide-commons/UniversalDisposable'));
}

var _os = _interopRequireDefault(require('os'));

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _process;

function _load_process() {
  return _process = require('../../../../modules/nuclide-commons/process');
}

var _AvdTable;

function _load_AvdTable() {
  return _AvdTable = _interopRequireDefault(require('../ui/AvdTable'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const AVD_DIRECTORY = `${_os.default.homedir()}/.android/avd`; /**
                                                                * Copyright (c) 2015-present, Facebook, Inc.
                                                                * All rights reserved.
                                                                *
                                                                * This source code is licensed under the license found in the LICENSE file in
                                                                * the root directory of this source tree.
                                                                *
                                                                *  strict-local
                                                                * @format
                                                                */

const AVD_LOCKFILE = 'hardware-qemu.ini.lock';
// We create a temporary .watchmanconfig so Watchman recognizes the AVD
// directory as a project root.
const AVD_WATCHMAN_CONFIG = `${AVD_DIRECTORY}/.watchmanconfig`;

class AvdComponentProvider {
  constructor() {
    this._refresh = new _rxjsBundlesRxMinJs.Subject();

    this._populateAvdPIDs = avds => {
      return _rxjsBundlesRxMinJs.Observable.fromPromise(Promise.all(avds.map(this._populateAvdPID)));
    };

    this._refreshAvds = () => {
      this._refresh.next();
    };

    this._startAvd = avd => {
      if (!(this._emulator != null)) {
        throw new Error('Invariant violation: "this._emulator != null"');
      }

      (0, (_process || _load_process()).runCommand)(this._emulator, ['@' + avd.name]).subscribe(stdout => {}, err => {
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
    if ((_nuclideUri || _load_nuclideUri()).default.isRemote(host)) {
      callback(null);
      return new (_UniversalDisposable || _load_UniversalDisposable()).default();
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
      type: (0, (_bindObservableAsProps || _load_bindObservableAsProps()).bindObservableAsProps)(props, (_AvdTable || _load_AvdTable()).default),
      key: 'emulators'
    });

    return disposables;
  }

  _watchAvdDirectory() {
    const watchAvdDirectory = (async () => {
      const avdDirectoryExists = await (_fsPromise || _load_fsPromise()).default.exists(AVD_DIRECTORY);
      if (!avdDirectoryExists) {
        return () => {};
      }

      // Create a .watchmanconfig so Watchman recognizes the AVD directory as a
      // project root.
      await (_fsPromise || _load_fsPromise()).default.writeFile(AVD_WATCHMAN_CONFIG, '{}');

      const watchmanClient = new (_nuclideWatchmanHelpers || _load_nuclideWatchmanHelpers()).WatchmanClient();
      const watchmanSubscription = await watchmanClient.watchDirectoryRecursive(AVD_DIRECTORY, AVD_DIRECTORY, {
        expression: ['match', '*.avd']
      });
      watchmanSubscription.on('change', () => {
        this._refreshAvds();
      });

      return () => (_fsPromise || _load_fsPromise()).default.unlink(AVD_WATCHMAN_CONFIG).catch(() => {});
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
    return _rxjsBundlesRxMinJs.Observable.defer(async () => {
      const androidHome = process.env.ANDROID_HOME;
      const emulator = androidHome != null ? `${androidHome}/tools/emulator` : null;
      if (emulator == null) {
        return null;
      }
      const exists = await (_fsPromise || _load_fsPromise()).default.exists(emulator);
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
    if (await (_fsPromise || _load_fsPromise()).default.exists(lockFile)) {
      const pid = parseInt((await (_fsPromise || _load_fsPromise()).default.readFile(lockFile, 'utf8')), 10);
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
      return emulator != null ? (0, (_process || _load_process()).runCommand)(emulator, ['-list-avds']).map(this._parseAvds).switchMap(this._populateAvdPIDs).map((_expected || _load_expected()).Expect.value) : _rxjsBundlesRxMinJs.Observable.of((_expected || _load_expected()).Expect.error(new Error("Cannot find 'emulator' command.")));
    });
  }

}
exports.AvdComponentProvider = AvdComponentProvider;