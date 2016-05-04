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
  runTask: () => void;
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

    // If there are no tasks, just show "Run" (but have it disabled). It's just less weird than
    // some kind of placeholder.
    const taskOptions = this.props.tasks.length === 0
      ? [{value: null, label: 'Run', icon: 'triangle-right'}]
      : this.props.tasks.map(task => ({
        value: task.type,
        label: task.label,
        icon: task.icon,
      }));

    const activeBuildSystemIcon = this.props.getActiveBuildSystemIcon();
    const activeTask = this.props.tasks.find(task => task.type === this.props.activeTaskType);
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
            <SplitButtonDropdown
              value={this.props.activeTaskType}
              options={taskOptions}
              onChange={value => { this.props.selectTask(value); }}
              onConfirm={() => { this.props.runTask(); }}
              confirmDisabled={this.props.taskIsRunning || !activeTask || !activeTask.enabled}
              changeDisabled={this.props.taskIsRunning}
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
