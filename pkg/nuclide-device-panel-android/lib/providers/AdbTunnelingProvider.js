'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AdbTunnelingProvider = undefined;

var _bindObservableAsProps;

function _load_bindObservableAsProps() {
  return _bindObservableAsProps = require('../../../../modules/nuclide-commons-ui/bindObservableAsProps');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../../modules/nuclide-commons/nuclideUri'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../../modules/nuclide-commons/UniversalDisposable'));
}

var _Tunneling;

function _load_Tunneling() {
  return _Tunneling = require('../../../nuclide-adb-sdb-base/lib/Tunneling');
}

var _AdbTunnelButton;

function _load_AdbTunnelButton() {
  return _AdbTunnelButton = require('../ui/AdbTunnelButton');
}

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
 *  strict-local
 * @format
 */

let startTunnelingAdb = (_Tunneling || _load_Tunneling()).startTunnelingAdb;
try {
  const {
    fbStartTunnelingAdb
    // $eslint-disable-next-line $FlowFB
  } = require('../../../nuclide-adb-sdb-base/lib/fb-Tunneling');
  startTunnelingAdb = fbStartTunnelingAdb;
} catch (e) {}

class AdbTunnelingProvider {
  constructor() {
    this.getType = () => {
      return 'Android';
    };

    this.observe = (host, callback) => {
      const disposable = new (_UniversalDisposable || _load_UniversalDisposable()).default();
      if (!(_nuclideUri || _load_nuclideUri()).default.isRemote(host)) {
        callback(null);
        return disposable;
      }
      callback({
        position: 'host_selector',
        type: () => {
          const BoundButton = (0, (_bindObservableAsProps || _load_bindObservableAsProps()).bindObservableAsProps)((0, (_Tunneling || _load_Tunneling()).isAdbTunneled)(host).map(value => ({
            host,
            status: value ? 'active' : 'inactive',
            enable: () => {
              let noMoreNotifications = false;
              startTunnelingAdb(host).do(() => noMoreNotifications = true).subscribe({
                error: e => {
                  if (!noMoreNotifications) {
                    atom.notifications.addError(e);
                  }
                  (0, (_Tunneling || _load_Tunneling()).stopTunnelingAdb)(host);
                }
              });
            },
            disable: () => (0, (_Tunneling || _load_Tunneling()).stopTunnelingAdb)(host)
          })), (_AdbTunnelButton || _load_AdbTunnelButton()).AdbTunnelButton);
          return _react.createElement(BoundButton, null);
        },
        key: 'adb tunneling'
      });
      return disposable;
    };
  }

}
exports.AdbTunnelingProvider = AdbTunnelingProvider;