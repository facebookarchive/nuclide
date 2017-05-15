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
import type {DeviceTask} from '../types';

import {Subscription} from 'rxjs';
import {Icon} from '../../../nuclide-ui/Icon';
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

  _getTasks(): React.Element<any> {
    const tasks = this.props.deviceTasks.map(task => (
      <TaskButton task={task} key={task.name} />
    ));
    return (
      <div className="block nuclide-device-panel-tasks-container">
        {tasks}
      </div>
    );
  }

  _getBackButton(): React.Element<any> {
    return (
      <div className="block">
        <span>
          <a
            className="nuclide-device-panel-link-with-icon"
            onClick={() => this.props.goToRootPanel()}>
            <Icon icon="chevron-left">
              Choose another device
            </Icon>
          </a>
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
