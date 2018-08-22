"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AdbTunnelButton = AdbTunnelButton;

function _classnames() {
  const data = _interopRequireDefault(require("classnames"));

  _classnames = function () {
    return data;
  };

  return data;
}

function _Button() {
  const data = require("../../../../modules/nuclide-commons-ui/Button");

  _Button = function () {
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
 * 
 * @format
 */
function AdbTunnelButton(props) {
  const {
    host,
    enable,
    disable,
    status
  } = props;
  const className = (0, _classnames().default)('nuclide-device-panel-android-tunnel-control', status);
  const tooltipAction = status === 'inactive' ? 'Reroute adb to know about localhost (where Atom is running) devices' : `Switch adb back to devices on <em>${prettify(host)}</em>`;
  return React.createElement(_Button().Button, {
    className: className,
    icon: "milestone",
    tooltip: {
      title: `Tunneling (${status})<br /><br /><strong>Click:</strong> ${tooltipAction}`,
      delay: {
        show: 500,
        hide: 0
      },
      placement: 'bottom'
    },
    onClick: () => {
      if (status === 'inactive') {
        enable();
      } else {
        disable();
      }
    }
  });
}

function prettify(host) {
  const FB_HOST_SUFFIX = '.facebook.com';

  const hostName = _nuclideUri().default.getHostname(host);

  return hostName.endsWith(FB_HOST_SUFFIX) ? hostName.substring(0, hostName.length - FB_HOST_SUFFIX.length) : hostName;
}