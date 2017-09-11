'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ATConfigurePathTaskProvider = undefined;

var _showModal;

function _load_showModal() {
  return _showModal = _interopRequireDefault(require('../../../nuclide-ui/showModal'));
}

var _ATCustomDBPathModal;

function _load_ATCustomDBPathModal() {
  return _ATCustomDBPathModal = require('./ui/ATCustomDBPathModal');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _react = _interopRequireWildcard(require('react'));

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

class ATConfigurePathTaskProvider {

  constructor(bridge) {
    this._bridge = bridge;
  }

  getType() {
    return this._bridge.name;
  }

  getName() {
    return `Configure ${this._bridge.debugBridge}`;
  }

  getTask(host) {
    return _rxjsBundlesRxMinJs.Observable.defer(() => this._bridge.getFullConfig(host)).switchMap(fullConfig => {
      return _rxjsBundlesRxMinJs.Observable.create(observer => {
        const disposable = (0, (_showModal || _load_showModal()).default)(dismiss => _react.createElement((_ATCustomDBPathModal || _load_ATCustomDBPathModal()).ATCustomDBPathModal, {
          dismiss: dismiss,
          activePath: fullConfig.active,
          activePort: fullConfig.ports[fullConfig.ports.length - 1],
          currentCustomPath: this._bridge.getCustomDebugBridgePath(host),
          registeredPaths: fullConfig.all,
          setCustomPath: customPath => this._bridge.setCustomDebugBridgePath(host, customPath),
          type: this._bridge.debugBridge
        }), {
          className: 'nuclide-adb-sdb-custom-path-modal',
          onDismiss: () => {
            disposable.dispose();
            observer.complete();
          },
          shouldDismissOnClickOutsideModal: () => false
        });
      });
    });
  }
}
exports.ATConfigurePathTaskProvider = ATConfigurePathTaskProvider;