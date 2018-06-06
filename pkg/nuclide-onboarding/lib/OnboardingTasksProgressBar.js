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

import type {OnboardingTask} from './types';

import classnames from 'classnames';
import * as Immutable from 'immutable';
import {Icon} from 'nuclide-commons-ui/Icon';
import * as React from 'react';

type Props = {
  activeTaskKey: ?string,
  selectTaskHandler: string => void,
  tasks: Immutable.OrderedMap<string, OnboardingTask>,
};

export default function OnboardingTaskProgressBar(props: Props) {
  const {activeTaskKey, tasks, selectTaskHandler} = props;
  const progressPoints = tasks.toIndexedSeq().map((task, taskIndex) => {
    const taskNumber = taskIndex + 1;
    return (
      <div
        key={task.taskKey}
        className={classnames(
          'nuclide-onboarding-progress-point',
          {'nuclide-onboarding-progress-point-completed': task.isCompleted},
          {
            'nuclide-onboarding-progress-point-selected-task':
              task.taskKey === activeTaskKey,
          },
        )}
        onClick={() => selectTaskHandler(task.taskKey)}>
        {task.isCompleted ? (
          <Icon
            className="nuclide-onboarding-progress-point-icon"
            icon="check"
          />
        ) : (
          taskNumber
        )}
      </div>
    );
  });

  return (
    <div className="nuclide-onboarding-tasks-progress-bar">
      <div className="nuclide-onboarding-progress-point-connector" />
      <div className="nuclide-onboarding-progress-points-container">
        {progressPoints}
      </div>
    </div>
  );
}
