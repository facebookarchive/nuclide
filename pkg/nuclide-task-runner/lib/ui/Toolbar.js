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

import type {TaskRunner, TaskMetadata, TaskRunnerState} from '../types';
import type {Option} from 'nuclide-commons-ui/Dropdown';

// eslint-disable-next-line nuclide-internal/no-cross-atom-imports
import {isDebugTask, TASKS} from '../../../nuclide-buck/lib/BuckTaskRunner';
import featureConfig from 'nuclide-commons-atom/feature-config';
import {bindObservableAsProps} from 'nuclide-commons-ui/bindObservableAsProps';
import nullthrows from 'nullthrows';
import {Button, ButtonSizes} from 'nuclide-commons-ui/Button';
import {ButtonGroup} from 'nuclide-commons-ui/ButtonGroup';
import {SplitButtonDropdown} from 'nuclide-commons-ui/SplitButtonDropdown';
import {TaskRunnerButton} from './TaskRunnerButton';
import {Dropdown} from 'nuclide-commons-ui/Dropdown';
import FullWidthProgressBar from '../../../nuclide-ui/FullWidthProgressBar';
import classnames from 'classnames';
import * as React from 'react';
import invariant from 'assert';
import * as Immutable from 'immutable';

const DEBUG_TASK_TYPE_KEY = 'nuclide-task-runner.debugTaskType';

export type Props = {
  toolbarDisabled: boolean,
  taskRunners: Immutable.List<TaskRunner>,
  statesForTaskRunners: Immutable.Map<TaskRunner, TaskRunnerState>,
  activeTaskRunner: ?TaskRunner,
  iconComponent: ?React.ComponentType<any>,
  extraUiComponent: ?React.ComponentType<any>,
  progress: ?number,
  runTask: (taskMeta: TaskMetadata & {taskRunner: TaskRunner}) => void,
  selectTaskRunner: (taskRunner: TaskRunner) => void,
  stopRunningTask: () => void,
  taskIsRunning: boolean,
  runningTaskIsCancelable: boolean | void,
};

export default class Toolbar extends React.Component<Props> {
  render(): React.Node {
    const className = classnames('nuclide-task-runner-toolbar', {
      disabled: this.props.toolbarDisabled,
    });

    const {activeTaskRunner, taskRunners} = this.props;
    let taskRunnerOptions = [];
    let taskRunnerSpecificContent = null;
    let dropdownVisibility = {visibility: 'hidden'};
    if (taskRunners.count() === 0 && !this.props.toolbarDisabled) {
      dropdownVisibility = {display: 'none'};
      taskRunnerSpecificContent = <NoTaskRunnersMessage />;
    } else if (activeTaskRunner) {
      const taskRunnerState = this.props.statesForTaskRunners.get(
        activeTaskRunner,
      );
      if (taskRunnerState) {
        taskRunnerOptions = getTaskRunnerOptions(
          taskRunners,
          this.props.statesForTaskRunners,
        );
        const ExtraUi = this.props.extraUiComponent;
        const extraUi = ExtraUi ? <ExtraUi key="extraui" /> : null;
        const taskButtons = this._renderTaskButtons();
        taskRunnerSpecificContent = [extraUi, taskButtons];
        dropdownVisibility = {};
      }
    }

    const ButtonComponent = buttonProps => (
      <TaskRunnerButton
        {...buttonProps}
        disabled={this.props.taskIsRunning}
        iconComponent={this.props.iconComponent}
      />
    );

    return (
      <div className={`${className} padded`}>
        <div className="nuclide-task-runner-toolbar-contents">
          <span className="inline-block" style={dropdownVisibility}>
            <Dropdown
              buttonComponent={ButtonComponent}
              value={activeTaskRunner}
              options={Array.from(taskRunnerOptions)}
              onChange={value => {
                this.props.selectTaskRunner(value);
              }}
              size="sm"
            />
          </span>
          {taskRunnerSpecificContent}
        </div>
        <FullWidthProgressBar
          progress={this.props.progress}
          visible={this.props.taskIsRunning}
        />
      </div>
    );
  }

  _renderTaskButtons(): ?React.Element<any> {
    const taskButtons = this._getButtonsForTasks();
    return (
      <span
        className="nuclide-task-button-container inline-block"
        key="taskButtons">
        <ButtonGroup>
          {taskButtons}
          <Button
            className="nuclide-task-button"
            key="stop"
            size={ButtonSizes.SMALL}
            icon="primitive-square"
            tooltip={tooltip('Stop')}
            disabled={this.props.runningTaskIsCancelable !== true}
            onClick={this.props.stopRunningTask}
          />
        </ButtonGroup>
      </span>
    );
  }

  _getButtonsForTasks(): Array<?React.Element<any>> {
    const {activeTaskRunner} = this.props;
    invariant(activeTaskRunner);
    const state = this.props.statesForTaskRunners.get(activeTaskRunner);
    if (!state) {
      return [];
    }
    invariant(state);

    const getTaskButton = (task: TaskMetadata): React.Element<any> => {
      const taskTooltip = tooltip(task.description);
      return (
        <Button
          className="nuclide-task-button"
          key={task.type}
          size={ButtonSizes.SMALL}
          icon={task.icon}
          tooltip={taskTooltip}
          disabled={
            task.disabled || this.props.runningTaskIsCancelable === false
          }
          onClick={event => {
            this.props.runTask({
              ...task,
              taskRunner: activeTaskRunner,
            });
          }}
        />
      );
    };

    const debugTasks = state.tasks.filter(task => isDebugTask(task.type));
    const enabledDebugTasks = debugTasks.filter(t => !t.disabled);
    let debugElement;
    if (debugTasks.length === 0) {
      debugElement = null;
    } else if (enabledDebugTasks.length <= 1) {
      debugElement = getTaskButton(enabledDebugTasks[0] || debugTasks[0]);
    } else {
      const tasksMetaByType = new Map(TASKS.map(t => [t.type, t]));
      const debugDropdownOptions = enabledDebugTasks.map(t => ({
        value: t.type,
        label: nullthrows(tasksMetaByType.get(t.type)).label,
      }));

      // eslint-disable-next-line react/no-unused-prop-types
      const DebugDropdownComponent = (props: {debugTaskType: string}) => {
        const selectedDebugTask =
          debugTasks.find(t => t.type === props.debugTaskType) || debugTasks[0];
        const taskTooltip = tooltip(selectedDebugTask.description);

        const buttonDisabled =
          selectedDebugTask.disabled ||
          this.props.runningTaskIsCancelable === false;

        const debugButtonComponent = () => (
          <Button
            icon={selectedDebugTask.icon}
            size={ButtonSizes.SMALL}
            tooltip={taskTooltip}
            disabled={buttonDisabled}
            onClick={() => {
              this.props.runTask({
                ...selectedDebugTask,
                taskRunner: activeTaskRunner,
              });
            }}
          />
        );

        return (
          <SplitButtonDropdown
            className="nuclide-task-button"
            buttonComponent={debugButtonComponent}
            changeDisabled={false}
            size={ButtonSizes.SMALL}
            options={debugDropdownOptions}
            value={selectedDebugTask.type}
            onChange={value => {
              featureConfig.set(DEBUG_TASK_TYPE_KEY, value);
            }}
            onConfirm={() => {}}
          />
        );
      };

      const DebugSectionComponent = bindObservableAsProps(
        featureConfig
          .observeAsStream(DEBUG_TASK_TYPE_KEY)
          .map(debugTaskType => ({debugTaskType})),
        DebugDropdownComponent,
      );
      debugElement = <DebugSectionComponent />;
    }

    return state.tasks
      .filter(task => !isDebugTask(task.type) && task.hidden !== true)
      .map(task => getTaskButton(task))
      .concat([debugElement]);
  }
}

function tooltip(title: string): atom$TooltipsAddOptions {
  return {title, delay: {show: 500, hide: 0}, placement: 'bottom'};
}

function getTaskRunnerOptions(
  taskRunners: Immutable.List<TaskRunner>,
  statesForTaskRunners: Immutable.Map<TaskRunner, TaskRunnerState>,
): Immutable.List<Option> {
  return taskRunners.map(runner => {
    const state = statesForTaskRunners.get(runner);
    return {
      value: runner,
      label: runner.name,
      disabled: !state || !state.enabled,
      selectedLabel: '',
    };
  });
}

function NoTaskRunnersMessage(): ?React.Element<any> {
  const featureLink = 'https://nuclide.io/docs/features/task-runner/';
  return (
    <span style={{'white-space': 'nowrap'}}>
      Install and enable a <a href={featureLink}>task runner</a> to use this
      toolbar
    </span>
  );
}
