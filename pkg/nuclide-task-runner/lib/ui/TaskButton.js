'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {AnnotatedTask, TaskId, TaskRunnerInfo} from '../types';

import {ButtonSizes} from '../../../nuclide-ui/lib/Button';
import {SplitButtonDropdown} from '../../../nuclide-ui/lib/SplitButtonDropdown';
import {React} from 'react-for-atom';

type Props = {
  activeTask: ?AnnotatedTask,
  buttonComponent: ReactClass<any>,
  taskRunnerInfo: Array<TaskRunnerInfo>,
  runTask: (taskId?: TaskId) => void,
  selectTask: (taskId: TaskId) => void,
  taskIsRunning: boolean,
  tasks: Map<string, Array<AnnotatedTask>>,
};

export function TaskButton(props: Props): React.Element<any> {
  const confirmDisabled = props.taskIsRunning || !props.activeTask || !props.activeTask.enabled;
  const run = () => {
    if (props.activeTask != null) {
      props.runTask(props.activeTask);
    }
  };

  const taskCount = Array.from(props.tasks.values()).reduce((n, tasks) => n + tasks.length, 0);
  const ButtonComponent = props.buttonComponent;

  if (taskCount <= 1) {
    // If there are no tasks, just show "Run" (but have it disabled). It's just less weird than some
    // kind of placeholder.
    const task = props.activeTask || {value: null, label: 'Run', icon: 'triangle-right'};
    return (
      <ButtonComponent
        size={ButtonSizes.SMALL}
        disabled={confirmDisabled}
        icon={task.icon}
        onClick={run}>
        {task.label}
      </ButtonComponent>
    );
  } else {
    const taskRunnerInfo = props.taskRunnerInfo.slice().sort((a, b) => abcSort(a.name, b.name));
    let taskOptions = [];
    taskRunnerInfo.forEach(info => {
      const taskRunnerName = info.name;
      const tasks = props.tasks.get(info.id) || [];
      if (tasks.length === 0) { return; }
      taskOptions.push({
        value: null,
        label: taskRunnerName,
        disabled: true,
      });
      taskOptions.push(
        ...tasks.map(task => ({
          value: task,
          label: `  ${task.label}`,
          selectedLabel: task.label,
          icon: task.icon,
        })),
      );
    });
    return (
      <SplitButtonDropdown
        buttonComponent={ButtonComponent}
        value={props.activeTask}
        options={taskOptions}
        onChange={value => { props.selectTask(value); }}
        onConfirm={run}
        confirmDisabled={confirmDisabled}
        changeDisabled={props.taskIsRunning}
        size={ButtonSizes.SMALL}
      />
    );
  }
}

const abcSort = (a, b) => (a.toLowerCase() < b.toLowerCase() ? -1 : 1);
