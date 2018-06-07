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

import * as React from 'react';
import nullthrows from 'nullthrows';
import type {OnboardingTask, OnboardingTaskComponentProps} from './types';

type Props = OnboardingTask & {
  setTaskCompleted: () => Promise<mixed>,
};

export default function OnboardingTaskComponentWrapper(props: Props) {
  nullthrows(props);
  const {description, isCompleted, setTaskCompleted, taskKey, title} = props;
  const TaskComponent = props.taskComponent || DefaultTaskComponent;
  const taskComponentProps: OnboardingTaskComponentProps = {
    // we don't want to pass the taskComponent prop to TaskComponent
    description,
    isCompleted,
    setTaskCompleted,
    taskKey,
    title,
  };
  return (
    <div className="nuclide-onboarding-task-component-wrapper">
      <div className="nuclide-onboarding-task-component-wrapper-header">
        <div className="nuclide-onboarding-task-component-wrapper-title">
          {title}
        </div>
        <div className="nuclide-onboarding-task-component-wrapper-separator" />
        {description != null && <div>{description}</div>}
      </div>
      <TaskComponent {...taskComponentProps} />
    </div>
  );
}

function DefaultTaskComponent(props: OnboardingTaskComponentProps) {
  return <span>{props.title}</span>;
}
