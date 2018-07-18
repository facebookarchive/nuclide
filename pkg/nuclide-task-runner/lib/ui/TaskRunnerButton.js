"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TaskRunnerButton = TaskRunnerButton;

function _Button() {
  const data = require("../../../../modules/nuclide-commons-ui/Button");

  _Button = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

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
function TaskRunnerButton(props) {
  const IconComponent = props.iconComponent;
  const icon = IconComponent ? React.createElement(IconComponent, null) : null;
  const buttonProps = Object.assign({}, props);
  delete buttonProps.iconComponent;
  return React.createElement(_Button().Button, Object.assign({}, buttonProps, {
    className: "nuclide-task-runner-task-runner-button"
  }), React.createElement("div", {
    className: "nuclide-task-runner-task-runner-icon-wrapper"
  }, icon), props.children);
}