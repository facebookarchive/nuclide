"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _BuckTaskRunner() {
  const data = require("../../../nuclide-buck/lib/BuckTaskRunner");

  _BuckTaskRunner = function () {
    return data;
  };

  return data;
}

function _featureConfig() {
  const data = _interopRequireDefault(require("../../../../modules/nuclide-commons-atom/feature-config"));

  _featureConfig = function () {
    return data;
  };

  return data;
}

function _bindObservableAsProps() {
  const data = require("../../../../modules/nuclide-commons-ui/bindObservableAsProps");

  _bindObservableAsProps = function () {
    return data;
  };

  return data;
}

function _nullthrows() {
  const data = _interopRequireDefault(require("nullthrows"));

  _nullthrows = function () {
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

function _SplitButtonDropdown() {
  const data = require("../../../../modules/nuclide-commons-ui/SplitButtonDropdown");

  _SplitButtonDropdown = function () {
    return data;
  };

  return data;
}

function _TaskRunnerButton() {
  const data = require("./TaskRunnerButton");

  _TaskRunnerButton = function () {
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

function _FullWidthProgressBar() {
  const data = _interopRequireDefault(require("../../../nuclide-ui/FullWidthProgressBar"));

  _FullWidthProgressBar = function () {
    return data;
  };

  return data;
}

function _classnames() {
  const data = _interopRequireDefault(require("classnames"));

  _classnames = function () {
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
// eslint-disable-next-line nuclide-internal/no-cross-atom-imports
const DEBUG_TASK_TYPE_KEY = 'nuclide-task-runner.debugTaskType';

class Toolbar extends React.Component {
  render() {
    const className = (0, _classnames().default)('nuclide-task-runner-toolbar', {
      disabled: this.props.toolbarDisabled
    });
    const {
      activeTaskRunner,
      taskRunners
    } = this.props;
    let taskRunnerOptions = [];
    let taskRunnerSpecificContent = null;
    let dropdownVisibility = {
      visibility: 'hidden'
    };

    if (taskRunners.count() === 0 && !this.props.toolbarDisabled) {
      dropdownVisibility = {
        display: 'none'
      };
      taskRunnerSpecificContent = React.createElement(NoTaskRunnersMessage, null);
    } else if (activeTaskRunner) {
      const taskRunnerState = this.props.statesForTaskRunners.get(activeTaskRunner);

      if (taskRunnerState) {
        taskRunnerOptions = getTaskRunnerOptions(taskRunners, this.props.statesForTaskRunners);
        const ExtraUi = this.props.extraUiComponent;
        const extraUi = ExtraUi ? React.createElement(ExtraUi, {
          key: "extraui"
        }) : null;

        const taskButtons = this._renderTaskButtons();

        taskRunnerSpecificContent = [extraUi, taskButtons];
        dropdownVisibility = {};
      }
    }

    const ButtonComponent = buttonProps => React.createElement(_TaskRunnerButton().TaskRunnerButton, Object.assign({}, buttonProps, {
      disabled: this.props.taskIsRunning,
      iconComponent: this.props.iconComponent
    }));

    return React.createElement("div", {
      className: `${className} padded`
    }, React.createElement("div", {
      className: "nuclide-task-runner-toolbar-contents"
    }, React.createElement("span", {
      className: "inline-block",
      style: dropdownVisibility
    }, React.createElement(_Dropdown().Dropdown, {
      buttonComponent: ButtonComponent,
      value: activeTaskRunner,
      options: Array.from(taskRunnerOptions),
      onChange: value => {
        this.props.selectTaskRunner(value);
      },
      size: "sm"
    })), taskRunnerSpecificContent), React.createElement(_FullWidthProgressBar().default, {
      progress: this.props.progress,
      visible: this.props.taskIsRunning
    }));
  }

  _renderTaskButtons() {
    const taskButtons = this._getButtonsForTasks();

    return React.createElement("span", {
      className: "nuclide-task-button-container inline-block",
      key: "taskButtons"
    }, React.createElement(_ButtonGroup().ButtonGroup, null, taskButtons, React.createElement(_Button().Button, {
      className: "nuclide-task-button",
      key: "stop",
      size: _Button().ButtonSizes.SMALL,
      icon: "primitive-square",
      tooltip: tooltip('Stop'),
      disabled: this.props.runningTaskIsCancelable !== true,
      onClick: this.props.stopRunningTask
    })));
  }

  _getButtonsForTasks() {
    const {
      activeTaskRunner
    } = this.props;

    if (!activeTaskRunner) {
      throw new Error("Invariant violation: \"activeTaskRunner\"");
    }

    const state = this.props.statesForTaskRunners.get(activeTaskRunner);

    if (!state) {
      return [];
    }

    if (!state) {
      throw new Error("Invariant violation: \"state\"");
    }

    const getTaskButton = task => {
      const taskTooltip = tooltip(task.description);
      return React.createElement(_Button().Button, {
        className: "nuclide-task-button",
        key: task.type,
        size: _Button().ButtonSizes.SMALL,
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

    const debugTasks = state.tasks.filter(task => (0, _BuckTaskRunner().isDebugTask)(task.type));
    const enabledDebugTasks = debugTasks.filter(t => !t.disabled);
    let debugElement;

    if (debugTasks.length === 0) {
      debugElement = null;
    } else if (enabledDebugTasks.length <= 1) {
      debugElement = getTaskButton(enabledDebugTasks[0] || debugTasks[0]);
    } else {
      const tasksMetaByType = new Map(_BuckTaskRunner().TASKS.map(t => [t.type, t]));
      const debugDropdownOptions = enabledDebugTasks.map(t => ({
        value: t.type,
        label: (0, _nullthrows().default)(tasksMetaByType.get(t.type)).label
      })); // eslint-disable-next-line react/no-unused-prop-types

      const DebugDropdownComponent = props => {
        const selectedDebugTask = debugTasks.find(t => t.type === props.debugTaskType) || debugTasks[0];
        const taskTooltip = tooltip(selectedDebugTask.description);
        const buttonDisabled = selectedDebugTask.disabled || this.props.runningTaskIsCancelable === false;

        const debugButtonComponent = () => React.createElement(_Button().Button, {
          icon: selectedDebugTask.icon,
          size: _Button().ButtonSizes.SMALL,
          tooltip: taskTooltip,
          disabled: buttonDisabled,
          onClick: () => {
            this.props.runTask(Object.assign({}, selectedDebugTask, {
              taskRunner: activeTaskRunner
            }));
          }
        });

        return React.createElement(_SplitButtonDropdown().SplitButtonDropdown, {
          className: "nuclide-task-button",
          buttonComponent: debugButtonComponent,
          changeDisabled: false,
          size: _Button().ButtonSizes.SMALL,
          options: debugDropdownOptions,
          value: selectedDebugTask.type,
          onChange: value => {
            _featureConfig().default.set(DEBUG_TASK_TYPE_KEY, value);
          },
          onConfirm: () => {}
        });
      };

      const DebugSectionComponent = (0, _bindObservableAsProps().bindObservableAsProps)(_featureConfig().default.observeAsStream(DEBUG_TASK_TYPE_KEY).map(debugTaskType => ({
        debugTaskType
      })), DebugDropdownComponent);
      debugElement = React.createElement(DebugSectionComponent, null);
    }

    return state.tasks.filter(task => !(0, _BuckTaskRunner().isDebugTask)(task.type) && task.hidden !== true).map(task => getTaskButton(task)).concat([debugElement]);
  }

}

exports.default = Toolbar;

function tooltip(title) {
  return {
    title,
    delay: {
      show: 500,
      hide: 0
    },
    placement: 'bottom'
  };
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
  return React.createElement("span", {
    style: {
      'white-space': 'nowrap'
    }
  }, "Install and enable a ", React.createElement("a", {
    href: featureLink
  }, "task runner"), " to use this toolbar");
}