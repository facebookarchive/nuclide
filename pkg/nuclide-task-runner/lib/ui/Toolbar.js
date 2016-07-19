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

import {TaskButton} from './TaskButton';
import {TaskRunnerButton} from './TaskRunnerButton';
import {ProgressBar} from './ProgressBar';
import {getTask} from '../getTask';
import {React} from 'react-for-atom';

type Props = {
  taskRunnerInfo: Array<TaskRunnerInfo>,
  getActiveTaskRunnerIcon: () => ?ReactClass<any>,
  getExtraUi: ?() => ReactClass<any>,
  progress: ?number,
  visible: boolean,
  runTask: (taskId?: TaskId) => void,
  activeTaskId: ?TaskId,
  selectTask: (taskId: TaskId) => void,
  stopTask: () => void,
  taskIsRunning: boolean,
  tasks: Map<string, Array<AnnotatedTask>>,
};

export class Toolbar extends React.Component {
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
    const ActiveTaskRunnerIcon = this.props.getActiveTaskRunnerIcon();
    const FallbackIcon = () => <div>{activeTask && activeTask.taskRunnerName}</div>;
    const IconComponent = ActiveTaskRunnerIcon || FallbackIcon;
    const ButtonComponent = props => (
      <TaskRunnerButton {...props} iconComponent={IconComponent} />
    );

    return (
      <div className="nuclide-task-runner-toolbar">
        <div className="nuclide-task-runner-toolbar-contents padded">
          <div className="inline-block">
            <TaskButton
              activeTask={activeTask}
              buttonComponent={ButtonComponent}
              taskRunnerInfo={this.props.taskRunnerInfo}
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

}
