'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ATEmulatorComponentProvider = undefined;

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('nuclide-commons/fsPromise'));
}

var _bindObservableAsProps;

function _load_bindObservableAsProps() {
  return _bindObservableAsProps = require('nuclide-commons-ui/bindObservableAsProps');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _os = _interopRequireDefault(require('os'));

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _process;

function _load_process() {
  return _process = require('nuclide-commons/process');
}

var _ATEmulatorTable;

function _load_ATEmulatorTable() {
  return _ATEmulatorTable = _interopRequireDefault(require('./ui/ATEmulatorTable'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

class ATEmulatorComponentProvider {

  constructor(state) {
    this._avds = [];
  }

  getType() {
    return 'Android';
  }

  getName() {
    return 'Emulators';
  }

  observe(host, callback) {
    this._getEmulator().then(emulator => {
      this._emulator = emulator;
      return emulator == null ? Promise.reject(new Error('No `emulator` found')) : this._getAvds();
    }).then(avds => {
      callback({
        order: 0,
        component: (0, (_bindObservableAsProps || _load_bindObservableAsProps()).bindObservableAsProps)(_rxjsBundlesRxMinJs.Observable.of({ avds, startAvd: this._startAvd.bind(this) }), (_ATEmulatorTable || _load_ATEmulatorTable()).default)
      });
    }).catch(error => {});
    return new (_UniversalDisposable || _load_UniversalDisposable()).default();
  }

  _getEmulator() {
    const androidHome = process.env.ANDROID_HOME;
    const emulator = androidHome != null ? `${androidHome}/tools/emulator` : null;
    if (emulator == null) {
      return Promise.resolve(null);
    }
    return (_fsPromise || _load_fsPromise()).default.exists(emulator).then(exists => {
      return exists ? Promise.resolve(emulator) : Promise.resolve(null);
    });
  }

  _parseAvds(emulatorOutput) {
    return emulatorOutput.trim().split(_os.default.EOL);
  }

  _getAvds() {
    if (!(this._emulator != null)) {
      throw new Error('Invariant violation: "this._emulator != null"');
    }

    return (0, (_process || _load_process()).runCommand)(this._emulator, ['-list-avds']).map(this._parseAvds).toPromise();
  }

  _startAvd(avd) {
    if (!(this._emulator != null)) {
      throw new Error('Invariant violation: "this._emulator != null"');
    }

    (0, (_process || _load_process()).runCommand)(this._emulator, ['@' + avd]).subscribe(stdout => {}, err => {
      atom.notifications.addError(`Failed to start up emulator ${avd}. Perhaps it's already running?`, {
        detail: err,
        dismissable: true
      });
    });
  }
}
exports.ATEmulatorComponentProvider = ATEmulatorComponentProvider;