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

import * as Immutable from 'immutable';
import * as React from 'react';

type Props = {
  allOnboardingTasks: Immutable.OrderedMap<string, OnboardingTask>,
  selectedTaskKey: ?string,
};

export default function OnboardingTaskProgressBar(props: Props) {
  const completedTasks: Immutable.OrderedMap<
    string,
    OnboardingTask,
  > = props.allOnboardingTasks.filter(task => task.isCompleted);
  const selectedTaskKey = props.selectedTaskKey;

  return (
    <div>
      {selectedTaskKey != null && <div>Selected Task: {selectedTaskKey}</div>}
      <div>
        Completed Tasks:
        {completedTasks.filter(task => !task.isCompleted).toArray()}
      </div>
    </div>
  );
}
