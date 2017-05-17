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

import type {DeviceTask} from '../types';

import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {Button, ButtonSizes} from 'nuclide-commons-ui/Button';
import React from 'react';

type Props = {
  task: DeviceTask,
};

type State = {
  isRunning: boolean,
};

export class TaskButton extends React.Component {
  props: Props;
  state: State;
  _disposables: UniversalDisposable = new UniversalDisposable();

  constructor(props: Props) {
    super(props);
    this.state = {isRunning: this.props.task.task.isRunning()};
    (this: any)._startTask = this._startTask.bind(this);
    (this: any)._cancelTask = this._cancelTask.bind(this);
    this._subscribeToTask();
  }

  _subscribeToTask(): void {
    const task = this.props.task;
    this._disposables.add(
      task.task.onDidComplete(() => {
        this.setState({isRunning: false});
        atom.notifications.addSuccess(`Device task '${task.name}' succeeded.`);
      }),
    );
    this._disposables.add(
      task.task.onDidError(() => {
        this.setState({isRunning: false});
        atom.notifications.addError(`Device task '${task.name}' failed.`);
      }),
    );
  }

  _getLabel(): string | React.Element<any> {
    const name = this.props.task.name;
    if (!this.state.isRunning) {
      return name;
    }
    return <i>Running '{name}'... Click to cancel</i>;
  }

  _startTask(): void {
    this.props.task.task.start();
    this.setState({isRunning: true});
  }

  _cancelTask(): void {
    this.props.task.task.cancel();
    this.setState({isRunning: false});
    atom.notifications.addInfo(
      `Device task '${this.props.task.name}' was cancelled.`,
    );
  }

  render(): React.Element<any> {
    return (
      <Button
        size={ButtonSizes.SMALL}
        onClick={this.state.isRunning ? this._cancelTask : this._startTask}
        key={this.props.task.name}>
        {this._getLabel()}
      </Button>
    );
  }
}
