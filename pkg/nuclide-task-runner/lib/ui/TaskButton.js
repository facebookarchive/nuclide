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

exports.TaskButton = TaskButton;

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

var _nuclideUiLibButton2;

function _nuclideUiLibButton() {
  return _nuclideUiLibButton2 = require('../../../nuclide-ui/lib/Button');
}

var _nuclideUiLibSplitButtonDropdown2;

function _nuclideUiLibSplitButtonDropdown() {
  return _nuclideUiLibSplitButtonDropdown2 = require('../../../nuclide-ui/lib/SplitButtonDropdown');
}

var _TaskRunnerButton2;

function _TaskRunnerButton() {
  return _TaskRunnerButton2 = require('./TaskRunnerButton');
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

function TaskButton(props) {
  var confirmDisabled = props.taskIsRunning || !props.activeTask || !props.activeTask.runnable;
  var run = function run() {
    if (props.activeTask != null) {
      props.runTask(props.activeTask);
    }
  };

  var activeTask = props.activeTask;

  var taskRunnerInfo = props.taskRunnerInfo.slice().sort(function (a, b) {
    return abcSort(a.name, b.name);
  });
  var taskOptions = getTaskOptions(props.taskLists, taskRunnerInfo);

  var ActiveTaskRunnerIcon = props.getActiveTaskRunnerIcon && props.getActiveTaskRunnerIcon();
  var TaskRunnerIcon = ActiveTaskRunnerIcon != null ? ActiveTaskRunnerIcon : function () {
    return (_reactForAtom2 || _reactForAtom()).React.createElement(
      'div',
      null,
      activeTask && activeTask.taskRunnerName
    );
  };

  // If we don't have an active task runner, use a generic button. If we do, use a fancy one that
  // shows its icon.
  var ButtonComponent = activeTask == null ? function (buttonProps) {
    return (_reactForAtom2 || _reactForAtom()).React.createElement(
      (_nuclideUiLibButton2 || _nuclideUiLibButton()).Button,
      buttonProps,
      buttonProps.children
    );
  } : function (buttonProps) {
    return (_reactForAtom2 || _reactForAtom()).React.createElement((_TaskRunnerButton2 || _TaskRunnerButton()).TaskRunnerButton, _extends({}, buttonProps, { iconComponent: TaskRunnerIcon }));
  };

  // If there's only one task runner, and it doesn't have multiple tasks, don't bother showing the
  // dropdown.
  var taskCount = Array.from(props.taskLists.values()).reduce(function (n, taskLists) {
    return n + taskLists.length;
  }, 0);
  if (props.taskLists.size <= 1 && taskCount <= 1) {
    // If there's no active task, just show "Run" (but have it disabled). It's just less weird than
    // some kind of placeholder. The parent component (Toolbar) will explain the situation.
    return (_reactForAtom2 || _reactForAtom()).React.createElement(
      ButtonComponent,
      {
        size: (_nuclideUiLibButton2 || _nuclideUiLibButton()).ButtonSizes.SMALL,
        disabled: confirmDisabled,
        icon: activeTask == null ? 'triangle-right' : activeTask.icon,
        onClick: run },
      activeTask == null ? 'Run' : activeTask.label
    );
  }

  return (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiLibSplitButtonDropdown2 || _nuclideUiLibSplitButtonDropdown()).SplitButtonDropdown, {
    buttonComponent: ButtonComponent,
    value: props.activeTask,
    options: taskOptions,
    onChange: function (value) {
      props.selectTask(value);
    },
    onConfirm: run,
    confirmDisabled: confirmDisabled,
    changeDisabled: props.taskIsRunning,
    size: (_nuclideUiLibButton2 || _nuclideUiLibButton()).ButtonSizes.SMALL
  });
}

var abcSort = function abcSort(a, b) {
  return a.toLowerCase() < b.toLowerCase() ? -1 : 1;
};
var indent = function indent(label) {
  return '   ' + label;
};

function getTaskOptions(taskLists, taskRunnerInfo) {
  var taskOptions = [];
  var tasklessRunners = [];
  var hasRelevantTasks = false;

  // Since we have some fake options, we need a value for them that could never be possible (so they
  // never appear selected).
  var NO_VALUE = {};

  // Add a block for each task runner.
  taskRunnerInfo.forEach(function (info) {
    var taskRunnerName = info.name;
    var taskListForRunner = taskLists.get(info.id) || [];
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
    taskOptions.push.apply(taskOptions, _toConsumableArray(taskListForRunner.map(function (taskMeta) {
      return {
        value: taskMeta,
        label: indent(taskMeta.label),
        selectedLabel: taskMeta.label,
        icon: taskMeta.icon
      };
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
    tasklessRunners.forEach(function (name) {
      taskOptions.push({
        value: NO_VALUE,
        label: indent(name),
        disabled: true
      });
    });
  }

  return taskOptions;
}