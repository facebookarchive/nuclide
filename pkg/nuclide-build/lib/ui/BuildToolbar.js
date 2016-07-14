'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {AnnotatedTask, TaskId} from '../types';
import type {ButtonSize} from '../../../nuclide-ui/lib/Button';
import type {Octicon} from '../../../nuclide-ui/lib/Octicons';

import {Button, ButtonSizes} from '../../../nuclide-ui/lib/Button';
import {Icon} from '../../../nuclide-ui/lib/Icon';
import {SplitButtonDropdown} from '../../../nuclide-ui/lib/SplitButtonDropdown';
import {ProgressBar} from './ProgressBar';
import {getTask} from '../getTask';
import {React} from 'react-for-atom';

type BuildSystemInfo = {
  id: string;
  name: string;
};

type Props = {
  buildSystemInfo: Array<BuildSystemInfo>;
  getActiveBuildSystemIcon: () => ?ReactClass<any>;
  getExtraUi: ?() => ReactClass<any>;
  progress: ?number;
  visible: boolean;
  runTask: (taskId?: TaskId) => void;
  activeTaskId: ?TaskId;
  selectTask: (taskId: TaskId) => void;
  stopTask: () => void;
  taskIsRunning: boolean;
  tasks: Map<string, Array<AnnotatedTask>>;
};

export class BuildToolbar extends React.Component {
  props: Props;

  render(): ?React.Element<any> {
    if (!this.props.visible) {
      return null;
    }

    const activeTaskId = this.props.activeTaskId;
    const activeTask = activeTaskId == null
      ? null
      : getTask(activeTaskId, this.props.tasks);

    const ExtraUi = this.props.getExtraUi && this.props.getExtraUi();
    const ActiveBuildSystemIcon = this.props.getActiveBuildSystemIcon();
    const FallbackIcon = () => <div>{activeTask && activeTask.buildSystemName}</div>;
    const IconComponent = ActiveBuildSystemIcon || FallbackIcon;
    const ButtonComponent = props => (
      <BuildSystemIconTaskButton {...props} iconComponent={IconComponent} />
    );

    return (
      <div className="nuclide-build-toolbar">
        <div className="nuclide-build-toolbar-contents padded">
          <div className="inline-block">
            <TaskButton
              activeTask={activeTask}
              buttonComponent={ButtonComponent}
              buildSystemInfo={this.props.buildSystemInfo}
              runTask={this.props.runTask}
              selectTask={this.props.selectTask}
              taskIsRunning={this.props.taskIsRunning}
              tasks={this.props.tasks}
            />
          </div>
          <div className="inline-block">
            <button
              className="btn btn-sm icon icon-primitive-square"
              disabled={!this.props.taskIsRunning || !activeTask || activeTask.cancelable === false}
              onClick={() => { this.props.stopTask(); }}
            />
          </div>
          {ExtraUi && activeTask ? <ExtraUi activeTaskType={activeTask.type} /> : null}
        </div>
        <ProgressBar
          progress={this.props.progress}
          visible={this.props.taskIsRunning}
        />
      </div>
    );
  }

  _renderIcon(): ?React.Element<any> {
    const ActiveBuildSystemIcon = this.props.getActiveBuildSystemIcon();
    if (ActiveBuildSystemIcon == null) { return; }
    return (
      <div className="nuclide-build-system-icon-wrapper inline-block">
        <ActiveBuildSystemIcon />
      </div>
    );
  }

}

type TaskButtonProps = {
  activeTask: ?AnnotatedTask;
  buttonComponent: ReactClass<any>;
  buildSystemInfo: Array<BuildSystemInfo>;
  runTask: (taskId?: TaskId) => void;
  selectTask: (taskId: TaskId) => void;
  taskIsRunning: boolean;
  tasks: Map<string, Array<AnnotatedTask>>;
};

function TaskButton(props: TaskButtonProps): React.Element<any> {
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
    const buildSystemInfo = props.buildSystemInfo.slice().sort((a, b) => abcSort(a.name, b.name));
    let taskOptions = [];
    buildSystemInfo.forEach(info => {
      const buildSystemName = info.name;
      const tasks = props.tasks.get(info.id) || [];
      if (tasks.length === 0) { return; }
      taskOptions.push({
        value: null,
        label: buildSystemName,
        disabled: true,
      });
      taskOptions.push(
        ...tasks.map(task => ({
          value: task,
          label: `  ${task.label}`,
          selectedLabel: task.label,
          icon: task.icon,
        }))
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

type BuildSystemIconTaskButtonProps = {
  icon?: Octicon;
  selected?: boolean;
  size?: ButtonSize;
  children?: mixed;
  iconComponent: ReactClass<any>;
};

function BuildSystemIconTaskButton(props: BuildSystemIconTaskButtonProps): React.Element<any> {
  const IconComponent = props.iconComponent;
  const buttonProps = {...props};
  delete buttonProps.icon;
  delete buttonProps.label;
  const icon = props.icon == null
    ? null
    : <Icon icon={props.icon} className="nuclide-build-system-task-icon" />;
  return (
    // $FlowFixMe
    <Button
      {...buttonProps}
      className="nuclide-build-system-task-button">
      <div className="nuclide-build-system-icon-wrapper">
        <IconComponent />
      </div>
      <div className="nuclide-build-system-task-button-divider" />
      {icon}
      {props.children}
    </Button>
  );
}

const abcSort = (a, b) => (a.toLowerCase() < b.toLowerCase() ? -1 : 1);
