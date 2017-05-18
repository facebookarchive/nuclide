/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {Process, ProcessKiller} from '../types';
import type {Props as TaskButtonPropsType} from './TaskButton';
import type {TaskEvent} from '../../../commons-node/tasks';

import {bindObservableAsProps} from 'nuclide-commons-ui/bindObservableAsProps';
import {DeviceTask} from '../DeviceTask';
import {Subscription} from 'rxjs';
import {Icon} from 'nuclide-commons-ui/Icon';
import React from 'react';
import {InfoTable} from './InfoTable';
import {ProcessTable} from './ProcessTable';
import {TaskButton} from './TaskButton';

type Props = {
  startFetchingProcesses: () => Subscription,
  goToRootPanel: () => void,
  infoTables: Map<string, Map<string, string>>,
  processes: Process[],
  killProcess: ?ProcessKiller,
  deviceTasks: DeviceTask[],
};

export class DevicePanel extends React.Component {
  props: Props;

  _createInfoTables(): React.Element<any>[] {
    return Array.from(
      this.props.infoTables.entries(),
    ).map(([title, infoTable]) => (
      <div className="block" key={title}>
        <InfoTable title={title} table={infoTable} />
      </div>
    ));
  }

  _createProcessTable(): React.Element<any> {
    return (
      <div className="block" key="process-table">
        <ProcessTable
          processes={this.props.processes}
          killProcess={this.props.killProcess}
          startFetchingProcesses={this.props.startFetchingProcesses}
        />
      </div>
    );
  }

  _taskEventsToProps(
    task: DeviceTask,
    taskEvent: ?TaskEvent,
  ): TaskButtonPropsType {
    return {
      name: task.getName(),
      start: () => task.start(),
      cancel: () => task.cancel(),
      isRunning: taskEvent != null,
      progress: null,
    };
  }

  _getTasks(): React.Element<any> {
    const tasks = Array.from(this.props.deviceTasks).map(task => {
      const StreamedTaskButton = bindObservableAsProps(
        task
          .getTaskEvents()
          .distinctUntilChanged()
          .map(taskEvent => this._taskEventsToProps(task, taskEvent)),
        TaskButton,
      );
      return <StreamedTaskButton key={task.getName()} />;
    });
    return (
      <div className="block nuclide-device-panel-tasks-container">
        {tasks}
      </div>
    );
  }

  _getBackButton(): React.Element<any> {
    return (
      <div className="block">
        <span
          className="nuclide-device-panel-link-with-icon"
          onClick={() => this.props.goToRootPanel()}>
          <Icon icon="chevron-left">
            Choose another device
          </Icon>
        </span>
      </div>
    );
  }

  render(): React.Element<any> {
    return (
      <div>
        {this._getBackButton()}
        {this._getTasks()}
        {this._createInfoTables()}
        {this._createProcessTable()}
      </div>
    );
  }
}
