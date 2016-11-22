'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {AnnotatedTaskMetadata, TaskId, TaskRunnerInfo} from '../types';

import {CommonControls} from './CommonControls';
import {ProgressBar} from './ProgressBar';
import {getTaskMetadata} from '../getTaskMetadata';
import {React} from 'react-for-atom';

type Props = {
  taskRunnerInfo: Array<TaskRunnerInfo>,
  getActiveTaskRunnerIcon: () => ?ReactClass<any>,
  getExtraUi: ?() => ReactClass<any>,
  progress: ?number,
  runTask: (taskId?: TaskId) => void,
  activeTaskId: ?TaskId,
  selectTask: (taskId: TaskId) => void,
  stopTask: () => void,
  taskIsRunning: boolean,
  taskLists: Map<string, Array<AnnotatedTaskMetadata>>,
};

export class Toolbar extends React.Component {
  props: Props;

  _renderExtraUi(): ?React.Element<any> {
    if (this.props.activeTaskId) {
      const ExtraUi = this.props.getExtraUi && this.props.getExtraUi();
      return ExtraUi ? <ExtraUi activeTaskType={this.props.activeTaskId.type} /> : null;
    }
    const runnerCount = this.props.taskRunnerInfo.length;
    if (runnerCount === 0) {
      return <span>Please install and enable a task runner</span>;
    } else {
      const waitingForTasks = !Array.from(this.props.taskLists.values())
        .some(taskList => taskList.length > 0);
      if (waitingForTasks) {
        if (runnerCount === 1) {
          const runnerName = this.props.taskRunnerInfo[0].name;
          return <span>Waiting for tasks from {runnerName}...</span>;
        }
        return <span>Waiting for tasks from {runnerCount} task runners...</span>;
      }
      return <span>No Task Selected</span>;
    }
  }

  render(): ?React.Element<any> {
    const activeTaskId = this.props.activeTaskId;
    const activeTask = activeTaskId == null
      ? null
      : getTaskMetadata(activeTaskId, this.props.taskLists);

    return (
      <div className="nuclide-task-runner-toolbar">
        <div className="nuclide-task-runner-toolbar-contents padded">
          <CommonControls
            activeTask={activeTask}
            getActiveTaskRunnerIcon={this.props.getActiveTaskRunnerIcon}
            taskRunnerInfo={this.props.taskRunnerInfo}
            runTask={this.props.runTask}
            selectTask={this.props.selectTask}
            taskIsRunning={this.props.taskIsRunning}
            taskLists={this.props.taskLists}
            stopTask={this.props.stopTask}
          />
          {this._renderExtraUi()}
        </div>
        <ProgressBar
          progress={this.props.progress}
          visible={this.props.taskIsRunning}
        />
      </div>
    );
  }

}
