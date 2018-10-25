"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AddTargetButton = AddTargetButton;

var React = _interopRequireWildcard(require("react"));

function _ButtonGroup() {
  const data = require("../../../../../nuclide-commons-ui/ButtonGroup");

  _ButtonGroup = function () {
    return data;
  };

  return data;
}

function _Dropdown() {
  const data = require("../../../../../nuclide-commons-ui/Dropdown");

  _Dropdown = function () {
    return data;
  };

  return data;
}

function _goToLocation() {
  const data = require("../../../../../nuclide-commons-atom/go-to-location");

  _goToLocation = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 */
const DEVICE_PANEL_URL = 'atom://nuclide/devices';

function AddTargetButton(className) {
  return React.createElement(_ButtonGroup().ButtonGroup, {
    className: className
  }, React.createElement(_Dropdown().Dropdown, {
    className: "debugger-stepping-svg-button",
    tooltip: {
      title: 'Start debugging an additional debug target...'
    },
    options: [{
      label: 'Add target...',
      value: null,
      hidden: true
    }, {
      label: 'Attach debugger...',
      value: 'attach'
    }, {
      label: 'Launch debugger...',
      value: 'launch'
    }, {
      label: 'Manage devices...',
      value: 'devices'
    }],
    onChange: value => {
      switch (value) {
        case 'attach':
          {
            atom.commands.dispatch(atom.views.getView(atom.workspace), 'debugger:show-attach-dialog');
            break;
          }

        case 'launch':
          {
            atom.commands.dispatch(atom.views.getView(atom.workspace), 'debugger:show-launch-dialog');
            break;
          }

        case 'devices':
          {
            (0, _goToLocation().goToLocation)(DEVICE_PANEL_URL);
            break;
          }

        default:
          break;
      }
    }
  }));
}