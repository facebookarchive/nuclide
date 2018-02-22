'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TaskRunnerButton = TaskRunnerButton;

var _Button;

function _load_Button() {
  return _Button = require('nuclide-commons-ui/Button');
}

var _react = _interopRequireWildcard(require('react'));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function TaskRunnerButton(props) {
  const IconComponent = props.iconComponent;
  const icon = IconComponent ? _react.createElement(IconComponent, null) : null;
  const buttonProps = Object.assign({}, props);
  delete buttonProps.label;
  delete buttonProps.iconComponent;
  return _react.createElement(
    (_Button || _load_Button()).Button,
    Object.assign({}, buttonProps, { className: 'nuclide-task-runner-task-runner-button' }),
    _react.createElement(
      'div',
      { className: 'nuclide-task-runner-task-runner-icon-wrapper' },
      icon
    ),
    props.children
  );
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