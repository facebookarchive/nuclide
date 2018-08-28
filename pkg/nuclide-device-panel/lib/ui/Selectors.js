"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Selectors = void 0;

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

function Immutable() {
  const data = _interopRequireWildcard(require("immutable"));

  Immutable = function () {
    return data;
  };

  return data;
}

function _Dropdown() {
  const data = require("../../../../modules/nuclide-commons-ui/Dropdown");

  _Dropdown = function () {
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

function _ButtonGroup() {
  const data = require("../../../../modules/nuclide-commons-ui/ButtonGroup");

  _ButtonGroup = function () {
    return data;
  };

  return data;
}

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
const FB_HOST_SUFFIX = '.facebook.com';

class Selectors extends React.Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this._getHostSelectorNodes = () => {
      return this.props.hostSelectorComponents.map(component => {
        const Type = component.type;
        return React.createElement(Type, {
          key: component.key
        });
      });
    }, _temp;
  }

  componentDidMount() {
    if (this.props.deviceTypes.length > 0) {
      this._setDeviceType(this.props.deviceTypes[0]);
    }
  }

  _getLabelForHost(host) {
    if (host === '') {
      return 'local';
    }

    const hostName = _nuclideUri().default.getHostname(host);

    return hostName.endsWith(FB_HOST_SUFFIX) ? hostName.substring(0, hostName.length - FB_HOST_SUFFIX.length) : hostName;
  }

  _getHostOptions() {
    return this.props.hosts.map(host => {
      return {
        value: host,
        label: this._getLabelForHost(host)
      };
    });
  }

  _getTypesButtons() {
    return this.props.deviceTypes.map(deviceType => {
      if (deviceType === this.props.deviceType) {
        return React.createElement(_Button().Button, {
          key: deviceType,
          buttonType: _Button().ButtonTypes.PRIMARY
        }, deviceType);
      }

      return React.createElement(_Button().Button, {
        key: deviceType,
        onClick: () => this._setDeviceType(deviceType)
      }, deviceType);
    });
  }

  _setDeviceType(deviceType) {
    this.props.setDeviceType(deviceType);
    this.props.toggleDevicePolling(true);
  }

  _getTypesSelector() {
    return React.createElement(_ButtonGroup().ButtonGroup, {
      size: _ButtonGroup().ButtonGroupSizes.SMALL
    }, this._getTypesButtons());
  }

  _getHostSelector() {
    return React.createElement("div", {
      className: "nuclide-device-panel-host-selector"
    }, this._getHostSelectorNodes(), React.createElement(_Dropdown().Dropdown, {
      options: this._getHostOptions(),
      onChange: host => {
        this.props.setHost(host);

        this._updateDeviceType();
      },
      value: this.props.host,
      key: "connection"
    }));
  }

  _updateDeviceType() {
    if (this.props.deviceTypes.length > 0) {
      this._setDeviceType(this.props.deviceType != null ? this.props.deviceType : this.props.deviceTypes[0]);
    }
  }

  render() {
    return React.createElement("div", {
      className: "block nuclide-device-panel-navigation-row"
    }, this._getTypesSelector(), this._getHostSelector());
  }

}

exports.Selectors = Selectors;