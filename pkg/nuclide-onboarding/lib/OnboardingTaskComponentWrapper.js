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
import type {OnboardingTask, OnboardingTaskMetadata} from './types';

export default function OnboardingTaskComponentWrapper(props: OnboardingTask) {
  nullthrows(props);
  const {description, isCompleted, taskKey, title} = props;
  const TaskComponent = props.taskComponent || DefaultTaskComponent;
  const taskMetaData: OnboardingTaskMetadata = {
    description,
    isCompleted,
    taskKey,
    title,
  };
  return (
    <div className="nuclide-onboarding-task-component-wrapper">
      <div className="nuclide-onboarding-task-component-wrapper-header">
        <h3 className="nuclide-onboarding-task-component-wrapper-title">
          {title}
        </h3>
        <div className="nuclide-onboarding-task-component-wrapper-separator" />
        {description != null ? <span>{description}</span> : null}
      </div>
      <TaskComponent {...taskMetaData} />
    </div>
  );
}

function DefaultTaskComponent(props: OnboardingTaskMetadata) {
  return <span>{props.title}</span>;
}
