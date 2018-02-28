'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AvdComponentProvider = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _View;

function _load_View() {
  return _View = require('nuclide-commons-ui/View');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _react = _interopRequireWildcard(require('react'));

var _renderReactRoot;

function _load_renderReactRoot() {
  return _renderReactRoot = require('nuclide-commons-ui/renderReactRoot');
}

var _expected;

function _load_expected() {
  return _expected = require('../../../commons-node/expected');
}

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

var _AvdTable;

function _load_AvdTable() {
  return _AvdTable = _interopRequireDefault(require('./ui/AvdTable'));
}

var _AvdTableHeader;

function _load_AvdTableHeader() {
  return _AvdTableHeader = _interopRequireDefault(require('./ui/AvdTableHeader'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

const AVD_LOCKFILE = 'hardware-qemu.ini.lock';

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

  getName() {
    return 'Emulators';
  }

  observe(host, callback) {
    // TODO (T26257016): Don't hide the table when ADB tunneling is on.
    if ((_nuclideUri || _load_nuclideUri()).default.isRemote(host)) {
      callback(null);
      return new (_UniversalDisposable || _load_UniversalDisposable()).default();
    }

    const headerElement = _react.createElement((_View || _load_View()).View, {
      item: (0, (_renderReactRoot || _load_renderReactRoot()).renderReactRoot)(_react.createElement((_AvdTableHeader || _load_AvdTableHeader()).default, { refreshAvds: this._refreshAvds }))
    });
    const getProps = this._getAvds().map(avds => {
      return {
        avds,
        headerElement,
        startAvd: this._startAvd
      };
    });
    const props = getProps.concat(this._refresh.exhaustMap(_ => getProps));
    callback({
      order: 0,
      component: (0, (_bindObservableAsProps || _load_bindObservableAsProps()).bindObservableAsProps)(props, (_AvdTable || _load_AvdTable()).default)
    });
    return new (_UniversalDisposable || _load_UniversalDisposable()).default();
  }

  _getEmulator() {
    var _this = this;

    return _rxjsBundlesRxMinJs.Observable.defer((0, _asyncToGenerator.default)(function* () {
      const androidHome = process.env.ANDROID_HOME;
      const emulator = androidHome != null ? `${androidHome}/tools/emulator` : null;
      if (emulator == null) {
        return null;
      }
      const exists = yield (_fsPromise || _load_fsPromise()).default.exists(emulator);
      _this._emulator = exists ? emulator : null;
      return _this._emulator;
    }));
  }

  _parseAvds(emulatorOutput) {
    const trimmedOutput = emulatorOutput.trim();
    return trimmedOutput === '' ? [] : trimmedOutput.split(_os.default.EOL);
  }

  _populateAvdPID(avdName) {
    return (0, _asyncToGenerator.default)(function* () {
      const lockFile = `${_os.default.homedir()}/.android/avd/${avdName}.avd/${AVD_LOCKFILE}`;
      if (yield (_fsPromise || _load_fsPromise()).default.exists(lockFile)) {
        const pid = parseInt((yield (_fsPromise || _load_fsPromise()).default.readFile(lockFile, 'utf8')), 10);
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
    })();
  }

  _getAvds() {
    return this._getEmulator().switchMap(emulator => {
      return emulator != null ? (0, (_process || _load_process()).runCommand)(emulator, ['-list-avds']).map(this._parseAvds).switchMap(this._populateAvdPIDs).map((_expected || _load_expected()).Expect.value) : _rxjsBundlesRxMinJs.Observable.of((_expected || _load_expected()).Expect.error(new Error("Cannot find 'emulator' command.")));
    });
  }

}
exports.AvdComponentProvider = AvdComponentProvider;