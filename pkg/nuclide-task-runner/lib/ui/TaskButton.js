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

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

function TaskButton(props) {
  var confirmDisabled = props.taskIsRunning || !props.activeTask || !props.activeTask.enabled;
  var run = function run() {
    if (props.activeTask != null) {
      props.runTask(props.activeTask);
    }
  };

  var taskCount = Array.from(props.tasks.values()).reduce(function (n, tasks) {
    return n + tasks.length;
  }, 0);
  var ButtonComponent = props.buttonComponent;

  if (taskCount <= 1) {
    // If there are no tasks, just show "Run" (but have it disabled). It's just less weird than some
    // kind of placeholder.
    var task = props.activeTask || { value: null, label: 'Run', icon: 'triangle-right' };
    return (_reactForAtom2 || _reactForAtom()).React.createElement(
      ButtonComponent,
      {
        size: (_nuclideUiLibButton2 || _nuclideUiLibButton()).ButtonSizes.SMALL,
        disabled: confirmDisabled,
        icon: task.icon,
        onClick: run },
      task.label
    );
  } else {
    var _ret = (function () {
      var taskRunnerInfo = props.taskRunnerInfo.slice().sort(function (a, b) {
        return abcSort(a.name, b.name);
      });
      var taskOptions = [];
      taskRunnerInfo.forEach(function (info) {
        var taskRunnerName = info.name;
        var tasks = props.tasks.get(info.id) || [];
        if (tasks.length === 0) {
          return;
        }
        taskOptions.push({
          value: null,
          label: taskRunnerName,
          disabled: true
        });
        taskOptions.push.apply(taskOptions, _toConsumableArray(tasks.map(function (task) {
          return {
            value: task,
            label: '  ' + task.label,
            selectedLabel: task.label,
            icon: task.icon
          };
        })));
      });
      return {
        v: (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiLibSplitButtonDropdown2 || _nuclideUiLibSplitButtonDropdown()).SplitButtonDropdown, {
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
        })
      };
    })();

    if (typeof _ret === 'object') return _ret.v;
  }
}

var abcSort = function abcSort(a, b) {
  return a.toLowerCase() < b.toLowerCase() ? -1 : 1;
};