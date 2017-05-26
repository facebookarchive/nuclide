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

import type {Process, ProcessTask, ProcessTaskType} from '../types';
import type {IconName} from 'nuclide-commons-ui/Icon';

import {Dropdown} from '../../../nuclide-ui/Dropdown';
import React from 'react';
import {Icon} from 'nuclide-commons-ui/Icon';

type Props = {|
  tasks: ProcessTask[],
  proc: Process,
  icon: IconName,
  taskType: ProcessTaskType,
  children?: any,
  className?: string,
  nameIfManyTasks: string,
|};

export class ProcessTaskButton extends React.Component {
  props: Props;

  _getTaskOptions(): {value: ProcessTask, label: string}[] {
    return this.props.tasks
      .filter(
        task =>
          task.type === this.props.taskType &&
          task.isSupported(this.props.proc),
      )
      .map(task => ({value: task, label: task.name}));
  }

  render(): React.Element<any> {
    const options = this._getTaskOptions();
    if (options.length === 0) {
      return <span>{this.props.children}</span>;
    } else if (options.length === 1) {
      return (
        <span
          onClick={() => options[0].value.run(this.props.proc)}
          className="nuclide-device-panel-text-with-icon">
          <Icon
            icon={this.props.icon}
            title={options[0].label}
            className={this.props.className}
          />
          {this.props.children}
        </span>
      );
    } else {
      const placeholder: any = (
        <Icon icon={this.props.icon} title={this.props.nameIfManyTasks} />
      );
      return (
        <span>
          <Dropdown
            className="nuclide-device-panel-text-with-icon"
            isFlat={true}
            options={options}
            placeholder={placeholder}
            size="xs"
            onChange={(task: ProcessTask) =>
              task != null && task.run(this.props.proc)}
          />
          {this.props.children}
        </span>
      );
    }
  }
}
