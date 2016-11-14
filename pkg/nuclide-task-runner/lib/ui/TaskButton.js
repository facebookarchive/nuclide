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
exports.TaskButton = TaskButton;

var _Button;

function _load_Button() {
  return _Button = require('../../../nuclide-ui/Button');
}

var _SplitButtonDropdown;

function _load_SplitButtonDropdown() {
  return _SplitButtonDropdown = require('../../../nuclide-ui/SplitButtonDropdown');
}

var _TaskRunnerButton;

function _load_TaskRunnerButton() {
  return _TaskRunnerButton = require('./TaskRunnerButton');
}

var _reactForAtom = require('react-for-atom');

function TaskButton(props) {
  const confirmDisabled = props.taskIsRunning || !props.activeTask || !props.activeTask.runnable;
  const run = () => {
    if (props.activeTask != null) {
      props.runTask(props.activeTask);
    }
  };

  const activeTask = props.activeTask;

  const taskRunnerInfo = props.taskRunnerInfo.slice().sort((a, b) => abcSort(a.name, b.name));
  const taskOptions = getTaskOptions(props.taskLists, taskRunnerInfo);

  const ActiveTaskRunnerIcon = props.getActiveTaskRunnerIcon && props.getActiveTaskRunnerIcon();
  const TaskRunnerIcon = ActiveTaskRunnerIcon != null ? ActiveTaskRunnerIcon : () => _reactForAtom.React.createElement(
    'div',
    null,
    activeTask && activeTask.taskRunnerName
  );

  // If we don't have an active task runner, use a generic button. If we do, use a fancy one that
  // shows its icon.
  const ButtonComponent = activeTask == null
  // If there's no active task, just show "Run" (but have it disabled). It's just less weird than
  // some kind of placeholder. The parent component (Toolbar) will explain the situation.
  ? buttonProps => _reactForAtom.React.createElement(
    (_Button || _load_Button()).Button,
    Object.assign({}, buttonProps, { icon: 'triangle-right' }),
    'Run'
  ) : buttonProps => _reactForAtom.React.createElement((_TaskRunnerButton || _load_TaskRunnerButton()).TaskRunnerButton, Object.assign({}, buttonProps, { iconComponent: TaskRunnerIcon }));

  // If there's only one task runner, and it doesn't have multiple tasks, don't bother showing the
  // dropdown.
  const taskCount = Array.from(props.taskLists.values()).reduce((n, taskLists) => n + taskLists.length, 0);
  if (props.taskLists.size <= 1 && taskCount <= 1) {
    return _reactForAtom.React.createElement(
      ButtonComponent,
      {
        size: (_Button || _load_Button()).ButtonSizes.SMALL,
        disabled: confirmDisabled,
        icon: activeTask == null ? 'triangle-right' : activeTask.icon,
        onClick: run },
      activeTask == null ? 'Run' : activeTask.label
    );
  }

  return _reactForAtom.React.createElement((_SplitButtonDropdown || _load_SplitButtonDropdown()).SplitButtonDropdown, {
    buttonComponent: ButtonComponent,
    value: props.activeTask,
    options: taskOptions,
    onChange: value => {
      props.selectTask(value);
    },
    onConfirm: run,
    confirmDisabled: confirmDisabled,
    changeDisabled: props.taskIsRunning,
    size: (_Button || _load_Button()).ButtonSizes.SMALL
  });
}

const abcSort = (a, b) => a.toLowerCase() < b.toLowerCase() ? -1 : 1;
const indent = label => `   ${ label }`;

function getTaskOptions(taskLists, taskRunnerInfo) {
  const taskOptions = [];
  const tasklessRunners = [];
  let hasRelevantTasks = false;

  // Since we have some fake options, we need a value for them that could never be possible (so they
  // never appear selected).
  const NO_VALUE = {};

  // Add a block for each task runner.
  taskRunnerInfo.forEach(info => {
    const taskRunnerName = info.name;
    const taskListForRunner = taskLists.get(info.id) || [];
    if (taskListForRunner.length === 0) {
      tasklessRunners.push(taskRunnerName);
      return;
    }
    hasRelevantTasks = true;
    taskOptions.push({
      value: NO_VALUE,
      label: taskRunnerName,
      disabled: true
    });
    taskOptions.push(...taskListForRunner.map(taskMeta => ({
      value: taskMeta,
      label: indent(taskMeta.label),
      selectedLabel: taskMeta.label,
      icon: taskMeta.icon,
      disabled: taskMeta.disabled
    })));
  });

  // Add a section for runners without active tasks.
  if (tasklessRunners.length > 0) {
    if (hasRelevantTasks) {
      taskOptions.push({ type: 'separator' });
    }
    taskOptions.push({
      value: NO_VALUE,
      label: 'Waiting for tasks from:',
      disabled: true
    });
    tasklessRunners.forEach(name => {
      taskOptions.push({
        value: NO_VALUE,
        label: indent(name),
        disabled: true
      });
    });
  }

  return taskOptions;
}