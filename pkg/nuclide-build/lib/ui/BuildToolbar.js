'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {IconButtonOption, Task} from '../types';

import {Button} from '../../../nuclide-ui/lib/Button';
import {SplitButtonDropdown} from '../../../nuclide-ui/lib/SplitButtonDropdown';
import {BuildSystemButton} from './BuildSystemButton';
import {ProgressBar} from './ProgressBar';
import {React} from 'react-for-atom';

type Props = {
  activeBuildSystemId: ?string;
  buildSystemOptions: Array<IconButtonOption>;
  getActiveBuildSystemIcon: () => ?ReactClass;
  getExtraUi: ?() => ReactClass;
  progress: ?number;
  visible: boolean;
  runTask: (taskType?: string) => void;
  activeTaskType: ?string;
  selectBuildSystem: (id: string) => void;
  selectTask: (taskType: ?string) => void;
  stopTask: () => void;
  taskIsRunning: boolean;
  tasks: Array<Task>;
};

export class BuildToolbar extends React.Component {
  props: Props;

  render(): ?React.Element {
    if (!this.props.visible || this.props.activeBuildSystemId == null) {
      return null;
    }

    const activeBuildSystemIcon = this.props.getActiveBuildSystemIcon();
    // Default to the first task if no task is currently active.
    const activeTaskType = this.props.activeTaskType ||
      (this.props.tasks[0] && this.props.tasks[0].type);
    const activeTask = this.props.tasks.find(task => task.type === activeTaskType);
    const ExtraUi = this.props.getExtraUi && this.props.getExtraUi();

    return (
      <div className="nuclide-build-toolbar">
        <div className="nuclide-build-toolbar-contents padded">
          <BuildSystemButton
            icon={activeBuildSystemIcon}
            value={this.props.activeBuildSystemId}
            options={this.props.buildSystemOptions}
            disabled={this.props.taskIsRunning}
            onChange={value => { this.props.selectBuildSystem(value); }}
          />
          <div className="inline-block">
            <TaskButton
              activeTask={activeTask}
              runTask={this.props.runTask}
              selectTask={this.props.selectTask}
              taskIsRunning={this.props.taskIsRunning}
              tasks={this.props.tasks}
            />
          </div>
          <div className="inline-block">
            <button
              className="btn icon icon-primitive-square"
              disabled={!this.props.taskIsRunning || !activeTask || activeTask.cancelable === false}
              onClick={() => { this.props.stopTask(); }}
            />
          </div>
          {ExtraUi ? <ExtraUi /> : null}
        </div>
        <ProgressBar
          progress={this.props.progress}
          visible={this.props.taskIsRunning}
        />
      </div>
    );
  }

}

type TaskButtonProps = {
  activeTask: ?Task;
  runTask: (taskType?: string) => void;
  selectTask: (taskType: ?string) => void;
  taskIsRunning: boolean;
  tasks: Array<Task>;
};

function TaskButton(props: TaskButtonProps): React.Element {
  const activeTaskType = props.activeTask == null ? undefined : props.activeTask.type;

  if (props.tasks.length <= 1) {
    // If there are no tasks, just show "Run" (but have it disabled). It's just less weird than some
    // kind of placeholder.
    const task = props.tasks[0] || {value: null, label: 'Run', icon: 'triangle-right'};
    return (
      <Button
        disabled={!task.enabled}
        icon={task.icon}
        onClick={() => { props.runTask(activeTaskType); }}>
        {task.label}
      </Button>
    );
  } else {
    const taskOptions = props.tasks.map(task => ({
      value: task.type,
      label: task.label,
      icon: task.icon,
    }));

    return (
      <SplitButtonDropdown
        value={activeTaskType}
        options={taskOptions}
        onChange={value => { props.selectTask(value); }}
        onConfirm={() => { props.runTask(activeTaskType); }}
        confirmDisabled={props.taskIsRunning || !props.activeTask || !props.activeTask.enabled}
        changeDisabled={props.taskIsRunning}
      />
    );
  }
}
