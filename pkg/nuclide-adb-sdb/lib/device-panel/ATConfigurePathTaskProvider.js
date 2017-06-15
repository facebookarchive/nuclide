'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ATConfigurePathTaskProvider = undefined;

var _Actions;

function _load_Actions() {
  return _Actions = _interopRequireWildcard(require('../redux/Actions'));
}

var _showModal;

function _load_showModal() {
  return _showModal = _interopRequireDefault(require('../../../nuclide-ui/showModal'));
}

var _ATCustomDBPathModal;

function _load_ATCustomDBPathModal() {
  return _ATCustomDBPathModal = require('./ui/ATCustomDBPathModal');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _react = _interopRequireDefault(require('react'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

class ATConfigurePathTaskProvider {

  constructor(type, rpcFactory, store) {
    this._type = type;
    this._rpcFactory = rpcFactory;
    this._dbType = this._type === 'android' ? 'adb' : 'sdb';
    this._store = store;
  }

  getType() {
    return this._type;
  }

  getName() {
    return `Configure ${this._dbType}`;
  }

  _getPathsInfo(host) {
    return this._rpcFactory(host).getCurrentPathsInfo();
  }

  _getCurrentCustomPath(host) {
    const state = this._store.getState();
    return this._dbType === 'adb' ? state.customAdbPaths.get(host) : state.customSdbPaths.get(host);
  }

  _setCustomPath(host, path) {
    this._store.dispatch(this._dbType === 'adb' ? (_Actions || _load_Actions()).setCustomAdbPath(host, path) : (_Actions || _load_Actions()).setCustomSdbPath(host, path));
  }

  getTask(host) {
    return _rxjsBundlesRxMinJs.Observable.defer(() => this._getPathsInfo(host)).switchMap(pathsInfo => {
      return _rxjsBundlesRxMinJs.Observable.create(observer => {
        const disposable = (0, (_showModal || _load_showModal()).default)(dismiss => _react.default.createElement((_ATCustomDBPathModal || _load_ATCustomDBPathModal()).ATCustomDBPathModal, {
          dismiss: dismiss,
          currentActivePath: pathsInfo.active,
          currentCustomPath: this._getCurrentCustomPath(host),
          registeredPaths: pathsInfo.all,
          setCustomPath: customPath => this._setCustomPath(host, customPath),
          type: this._dbType
        }), {
          className: 'nuclide-adb-sdb-custom-path-modal',
          onDismiss: () => {
            disposable.dispose();
            observer.complete();
          },
          disableDismissOnClickOutsideModal: true
        });
      });
    });
  }
}
exports.ATConfigurePathTaskProvider = ATConfigurePathTaskProvider;