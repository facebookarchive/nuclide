'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AdbTunnelButton = AdbTunnelButton;

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _Button;

function _load_Button() {
  return _Button = require('../../../../modules/nuclide-commons-ui/Button');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../../modules/nuclide-commons/nuclideUri'));
}

var _react = _interopRequireWildcard(require('react'));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function AdbTunnelButton(props) {
  const { host, enable, disable, status } = props;
  const className = (0, (_classnames || _load_classnames()).default)('nuclide-device-panel-android-tunnel-control', status);
  const tooltipAction = status === 'inactive' ? 'Reroute adb to know about localhost (where Atom is running) devices' : `Switch adb back to devices on <em>${prettify(host)}</em>`;
  return _react.createElement((_Button || _load_Button()).Button, {
    className: className,
    icon: 'milestone',
    tooltip: {
      title: `Tunneling (${status})<br /><br /><strong>Click:</strong> ${tooltipAction}`,
      delay: { show: 500, hide: 0 },
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
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */

function prettify(host) {
  const FB_HOST_SUFFIX = '.facebook.com';
  const hostName = (_nuclideUri || _load_nuclideUri()).default.getHostname(host);
  return hostName.endsWith(FB_HOST_SUFFIX) ? hostName.substring(0, hostName.length - FB_HOST_SUFFIX.length) : hostName;
}