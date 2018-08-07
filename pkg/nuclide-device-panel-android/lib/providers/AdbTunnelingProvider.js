"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AdbTunnelingProvider = void 0;

function _bindObservableAsProps() {
  const data = require("../../../../modules/nuclide-commons-ui/bindObservableAsProps");

  _bindObservableAsProps = function () {
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

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _Tunneling() {
  const data = require("../../../../modules/nuclide-adb/lib/Tunneling");

  _Tunneling = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _AdbTunnelButton() {
  const data = require("../ui/AdbTunnelButton");

  _AdbTunnelButton = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
let startTunnelingAdb = _Tunneling().startTunnelingAdb;

try {
  const {
    fbStartTunnelingAdb // $eslint-disable-next-line $FlowFB

  } = require("../../../../modules/nuclide-adb/lib/fb-Tunneling");

  startTunnelingAdb = fbStartTunnelingAdb;
} catch (e) {}

class AdbTunnelingProvider {
  constructor() {
    this.getType = () => {
      return 'Android';
    };

    this.observe = (host, callback) => {
      const disposable = new (_UniversalDisposable().default)();

      if (!_nuclideUri().default.isRemote(host)) {
        callback(null);
        return disposable;
      }

      callback({
        position: 'host_selector',
        type: () => {
          const BoundButton = (0, _bindObservableAsProps().bindObservableAsProps)((0, _Tunneling().isAdbTunneled)(host).map(value => ({
            host,
            status: value ? 'active' : 'inactive',
            enable: () => startTunnelingAdb(host).catch(() => _RxMin.Observable.empty()),
            disable: () => (0, _Tunneling().stopTunnelingAdb)(host)
          })), _AdbTunnelButton().AdbTunnelButton);
          return React.createElement(BoundButton, null);
        },
        key: 'adb tunneling'
      });
      return disposable;
    };
  }

}

exports.AdbTunnelingProvider = AdbTunnelingProvider;