'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _BuckTaskRunner;

function _load_BuckTaskRunner() {
  return _BuckTaskRunner = require('../../../nuclide-buck/lib/BuckTaskRunner');
}

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('../../../../modules/nuclide-commons-atom/feature-config'));
}

var _bindObservableAsProps;

function _load_bindObservableAsProps() {
  return _bindObservableAsProps = require('../../../../modules/nuclide-commons-ui/bindObservableAsProps');
}

var _nullthrows;

function _load_nullthrows() {
  return _nullthrows = _interopRequireDefault(require('nullthrows'));
}

var _Button;

function _load_Button() {
  return _Button = require('../../../../modules/nuclide-commons-ui/Button');
}

var _ButtonGroup;

function _load_ButtonGroup() {
  return _ButtonGroup = require('../../../../modules/nuclide-commons-ui/ButtonGroup');
}

var _SplitButtonDropdown;

function _load_SplitButtonDropdown() {
  return _SplitButtonDropdown = require('../../../../modules/nuclide-commons-ui/SplitButtonDropdown');
}

var _TaskRunnerButton;

function _load_TaskRunnerButton() {
  return _TaskRunnerButton = require('./TaskRunnerButton');
}

var _Dropdown;

function _load_Dropdown() {
  return _Dropdown = require('../../../../modules/nuclide-commons-ui/Dropdown');
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

var _immutable;

function _load_immutable() {
  return _immutable = _interopRequireWildcard(require('immutable'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const DEBUG_TASK_TYPE_KEY = 'nuclide-task-runner.debugTaskType';

// eslint-disable-next-line nuclide-internal/no-cross-atom-imports
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

class Toolbar extends _react.Component {
  render() {
    const className = (0, (_classnames || _load_classnames()).default)('nuclide-task-runner-toolbar', {
      disabled: this.props.toolbarDisabled
    });

    const { activeTaskRunner, taskRunners } = this.props;
    let taskRunnerOptions = [];
    let taskRunnerSpecificContent = null;
    let dropdownVisibility = { visibility: 'hidden' };
    if (taskRunners.count() === 0 && !this.props.toolbarDisabled) {
      dropdownVisibility = { display: 'none' };
      taskRunnerSpecificContent = _react.createElement(NoTaskRunnersMessage, null);
    } else if (activeTaskRunner) {
      const taskRunnerState = this.props.statesForTaskRunners.get(activeTaskRunner);
      if (taskRunnerState) {
        taskRunnerOptions = getTaskRunnerOptions(taskRunners, this.props.statesForTaskRunners);
        const ExtraUi = this.props.extraUiComponent;
        const extraUi = ExtraUi ? _react.createElement(ExtraUi, { key: 'extraui' }) : null;
        const taskButtons = this._renderTaskButtons();
        taskRunnerSpecificContent = [extraUi, taskButtons];
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
            options: Array.from(taskRunnerOptions),
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
      {
        className: 'nuclide-task-button-container inline-block',
        key: 'taskButtons' },
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

    const getTaskButton = task => {
      const taskTooltip = tooltip(task.description);
      return _react.createElement((_Button || _load_Button()).Button, {
        className: 'nuclide-task-button',
        key: task.type,
        size: (_Button || _load_Button()).ButtonSizes.SMALL,
        icon: task.icon,
        tooltip: taskTooltip,
        disabled: task.disabled || this.props.runningTaskIsCancelable === false,
        onClick: event => {
          this.props.runTask(Object.assign({}, task, {
            taskRunner: activeTaskRunner
          }));
        }
      });
    };

    const debugTasks = state.tasks.filter(task => (0, (_BuckTaskRunner || _load_BuckTaskRunner()).isDebugTask)(task.type));
    const enabledDebugTasks = debugTasks.filter(t => !t.disabled);
    let debugElement;
    if (debugTasks.length === 0) {
      debugElement = null;
    } else if (enabledDebugTasks.length <= 1) {
      debugElement = getTaskButton(enabledDebugTasks[0] || debugTasks[0]);
    } else {
      const tasksMetaByType = new Map((_BuckTaskRunner || _load_BuckTaskRunner()).TASKS.map(t => [t.type, t]));
      const debugDropdownOptions = enabledDebugTasks.map(t => ({
        value: t.type,
        label: (0, (_nullthrows || _load_nullthrows()).default)(tasksMetaByType.get(t.type)).label
      }));

      // eslint-disable-next-line react/no-unused-prop-types
      const DebugDropdownComponent = props => {
        const selectedDebugTask = debugTasks.find(t => t.type === props.debugTaskType) || debugTasks[0];
        const taskTooltip = tooltip(selectedDebugTask.description);

        const buttonDisabled = selectedDebugTask.disabled || this.props.runningTaskIsCancelable === false;

        const debugButtonComponent = () => _react.createElement((_Button || _load_Button()).Button, {
          icon: selectedDebugTask.icon,
          size: (_Button || _load_Button()).ButtonSizes.SMALL,
          tooltip: taskTooltip,
          disabled: buttonDisabled,
          onClick: () => {
            this.props.runTask(Object.assign({}, selectedDebugTask, {
              taskRunner: activeTaskRunner
            }));
          }
        });

        return _react.createElement((_SplitButtonDropdown || _load_SplitButtonDropdown()).SplitButtonDropdown, {
          className: 'nuclide-task-button',
          buttonComponent: debugButtonComponent,
          changeDisabled: false,
          size: (_Button || _load_Button()).ButtonSizes.SMALL,
          options: debugDropdownOptions,
          value: selectedDebugTask.type,
          onChange: value => {
            (_featureConfig || _load_featureConfig()).default.set(DEBUG_TASK_TYPE_KEY, value);
          },
          onConfirm: () => {}
        });
      };

      const DebugSectionComponent = (0, (_bindObservableAsProps || _load_bindObservableAsProps()).bindObservableAsProps)((_featureConfig || _load_featureConfig()).default.observeAsStream(DEBUG_TASK_TYPE_KEY).map(debugTaskType => ({ debugTaskType })), DebugDropdownComponent);
      debugElement = _react.createElement(DebugSectionComponent, null);
    }

    return state.tasks.filter(task => !(0, (_BuckTaskRunner || _load_BuckTaskRunner()).isDebugTask)(task.type) && task.hidden !== true).map(task => getTaskButton(task)).concat([debugElement]);
  }
}

exports.default = Toolbar;
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