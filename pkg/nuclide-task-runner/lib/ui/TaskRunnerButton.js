Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.TaskRunnerButton = TaskRunnerButton;

var _nuclideUiLibButton2;

function _nuclideUiLibButton() {
  return _nuclideUiLibButton2 = require('../../../nuclide-ui/lib/Button');
}

var _nuclideUiLibIcon2;

function _nuclideUiLibIcon() {
  return _nuclideUiLibIcon2 = require('../../../nuclide-ui/lib/Icon');
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

function TaskRunnerButton(props) {
  var IconComponent = props.iconComponent;
  var buttonProps = _extends({}, props);
  delete buttonProps.icon;
  delete buttonProps.label;
  delete buttonProps.iconComponent;
  var icon = props.icon == null ? null : (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiLibIcon2 || _nuclideUiLibIcon()).Icon, { icon: props.icon, className: 'nuclide-task-runner-system-task-icon' });
  return(
    // $FlowFixMe
    (_reactForAtom2 || _reactForAtom()).React.createElement(
      (_nuclideUiLibButton2 || _nuclideUiLibButton()).Button,
      _extends({}, buttonProps, {
        className: 'nuclide-task-runner-system-task-button' }),
      (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        { className: 'nuclide-task-runner-system-icon-wrapper' },
        (_reactForAtom2 || _reactForAtom()).React.createElement(IconComponent, null)
      ),
      (_reactForAtom2 || _reactForAtom()).React.createElement('div', { className: 'nuclide-task-runner-system-task-button-divider' }),
      icon,
      props.children
    )
  );
}