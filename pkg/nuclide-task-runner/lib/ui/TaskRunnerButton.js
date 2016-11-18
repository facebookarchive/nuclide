'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TaskRunnerButton = TaskRunnerButton;

var _Button;

function _load_Button() {
  return _Button = require('../../../nuclide-ui/Button');
}

var _Icon;

function _load_Icon() {
  return _Icon = require('../../../nuclide-ui/Icon');
}

var _reactForAtom = require('react-for-atom');

function TaskRunnerButton(props) {
  const IconComponent = props.iconComponent;
  const buttonProps = Object.assign({}, props);
  delete buttonProps.icon;
  delete buttonProps.label;
  delete buttonProps.iconComponent;
  const icon = props.icon == null ? null : _reactForAtom.React.createElement((_Icon || _load_Icon()).Icon, { icon: props.icon, className: 'nuclide-task-runner-system-task-icon' });
  return _reactForAtom.React.createElement(
    (_Button || _load_Button()).Button,
    Object.assign({}, buttonProps, {
      className: 'nuclide-task-runner-system-task-button' }),
    _reactForAtom.React.createElement(
      'div',
      { className: 'nuclide-task-runner-system-icon-wrapper' },
      _reactForAtom.React.createElement(IconComponent, null)
    ),
    _reactForAtom.React.createElement('div', { className: 'nuclide-task-runner-system-task-button-divider' }),
    icon,
    props.children
  );
}