"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DeviceTaskButton = void 0;

function _Dropdown() {
  const data = require("../../../../modules/nuclide-commons-ui/Dropdown");

  _Dropdown = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

function _Icon() {
  const data = require("../../../../modules/nuclide-commons-ui/Icon");

  _Icon = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
class DeviceTaskButton extends React.Component {
  render() {
    const options = this.props.tasks;

    if (options.length === 0) {
      return React.createElement("span", null);
    } else {
      const placeholder = React.createElement(_Icon().Icon, {
        icon: this.props.icon,
        title: this.props.title
      });
      return React.createElement("div", {
        className: "nuclide-device-panel-device-action-button"
      }, React.createElement(_Dropdown().Dropdown, {
        isFlat: true,
        options: options.map(option => ({
          value: option,
          label: option.getName()
        })),
        placeholder: placeholder,
        size: "xs",
        onChange: task => task != null && task.start()
      }));
    }
  }

}

exports.DeviceTaskButton = DeviceTaskButton;