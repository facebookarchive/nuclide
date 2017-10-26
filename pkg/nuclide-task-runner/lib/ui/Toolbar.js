'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Toolbar = undefined;

var _Button;

function _load_Button() {
  return _Button = require('nuclide-commons-ui/Button');
}

var _ButtonGroup;

function _load_ButtonGroup() {
  return _ButtonGroup = require('nuclide-commons-ui/ButtonGroup');
}

var _TaskRunnerButton;

function _load_TaskRunnerButton() {
  return _TaskRunnerButton = require('./TaskRunnerButton');
}

var _Dropdown;

function _load_Dropdown() {
  return _Dropdown = require('../../../nuclide-ui/Dropdown');
}

var _FullWidthProgressBar;

function _load_FullWidthProgressBar() {
  return _FullWidthProgressBar = _interopRequireDefault(require('../../../nuclide-ui/FullWidthProgressBar'));
}

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _react = _interopRequireWildcard(require('react'));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Toolbar extends _react.Component {
  render() {
    const className = (0, (_classnames || _load_classnames()).default)('nuclide-task-runner-toolbar', {
      disabled: this.props.toolbarDisabled
    });

    const { activeTaskRunner, taskRunners } = this.props;
    let taskRunnerOptions = [];
    let taskRunnerSpecificContent = null;
    let dropdownVisibility = { visibility: 'hidden' };
    if (taskRunners.length === 0 && !this.props.toolbarDisabled) {
      dropdownVisibility = { display: 'none' };
      taskRunnerSpecificContent = _react.createElement(NoTaskRunnersMessage, null);
    } else if (activeTaskRunner) {
      const taskRunnerState = this.props.statesForTaskRunners.get(activeTaskRunner);
      if (taskRunnerState) {
        taskRunnerOptions = getTaskRunnerOptions(taskRunners, this.props.statesForTaskRunners);
        const ExtraUi = this.props.extraUiComponent;
        const extraUi = ExtraUi ? _react.createElement(ExtraUi, { key: 'extraui' }) : null;
        const taskButtons = this._renderTaskButtons();
        taskRunnerSpecificContent = [taskButtons, extraUi];
        dropdownVisibility = {};
      }
    }

    const ButtonComponent = buttonProps => _react.createElement((_TaskRunnerButton || _load_TaskRunnerButton()).TaskRunnerButton, Object.assign({}, buttonProps, {
      disabled: this.props.taskIsRunning,
      iconComponent: this.props.iconComponent
    }));

    return _react.createElement(
      'div',
      { className: `${className} padded` },
      _react.createElement(
        'div',
        { className: 'nuclide-task-runner-toolbar-contents' },
        _react.createElement(
          'span',
          { className: 'inline-block', style: dropdownVisibility },
          _react.createElement((_Dropdown || _load_Dropdown()).Dropdown, {
            buttonComponent: ButtonComponent,
            value: activeTaskRunner,
            options: taskRunnerOptions,
            onChange: value => {
              this.props.selectTaskRunner(value);
            },
            size: 'sm'
          })
        ),
        taskRunnerSpecificContent
      ),
      _react.createElement((_FullWidthProgressBar || _load_FullWidthProgressBar()).default, {
        progress: this.props.progress,
        visible: this.props.taskIsRunning
      })
    );
  }

  _renderTaskButtons() {
    const taskButtons = this._getButtonsForTasks();
    return _react.createElement(
      'span',
      { className: 'inline-block', key: 'taskButtons' },
      _react.createElement(
        (_ButtonGroup || _load_ButtonGroup()).ButtonGroup,
        null,
        taskButtons,
        _react.createElement((_Button || _load_Button()).Button, {
          className: 'nuclide-task-button',
          key: 'stop',
          size: (_Button || _load_Button()).ButtonSizes.SMALL,
          icon: 'primitive-square',
          tooltip: tooltip('Stop'),
          disabled: this.props.runningTaskIsCancelable !== true,
          onClick: this.props.stopRunningTask
        })
      )
    );
  }

  _getButtonsForTasks() {
    const { activeTaskRunner } = this.props;

    if (!activeTaskRunner) {
      throw new Error('Invariant violation: "activeTaskRunner"');
    }

    const state = this.props.statesForTaskRunners.get(activeTaskRunner);
    if (!state) {
      return [];
    }

    if (!state) {
      throw new Error('Invariant violation: "state"');
    }

    return state.tasks.filter(task => task.hidden !== true).map(task => {
      return _react.createElement((_Button || _load_Button()).Button, {
        className: 'nuclide-task-button',
        key: task.type,
        size: (_Button || _load_Button()).ButtonSizes.SMALL,
        icon: task.icon,
        tooltip: tooltip(task.label),
        disabled: task.disabled || this.props.runningTaskIsCancelable === false,
        onClick: () => this.props.runTask(Object.assign({}, task, { taskRunner: activeTaskRunner }))
      });
    });
  }
}

exports.Toolbar = Toolbar; /**
                            * Copyright (c) 2015-present, Facebook, Inc.
                            * All rights reserved.
                            *
                            * This source code is licensed under the license found in the LICENSE file in
                            * the root directory of this source tree.
                            *
                            * 
                            * @format
                            */

function tooltip(title) {
  return { title, delay: { show: 500, hide: 0 }, placement: 'bottom' };
}

function getTaskRunnerOptions(taskRunners, statesForTaskRunners) {
  return taskRunners.map(runner => {
    const state = statesForTaskRunners.get(runner);
    return {
      value: runner,
      label: runner.name,
      disabled: !state || !state.enabled,
      selectedLabel: ''
    };
  });
}

function NoTaskRunnersMessage() {
  const featureLink = 'https://nuclide.io/docs/features/task-runner/';
  return _react.createElement(
    'span',
    { style: { 'white-space': 'nowrap' } },
    'Install and enable a ',
    _react.createElement(
      'a',
      { href: featureLink },
      'task runner'
    ),
    ' to use this toolbar'
  );
}