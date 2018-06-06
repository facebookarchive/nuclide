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
import type {OnboardingTask} from './types';

type Props = {
  task: OnboardingTask,
};

const OnboardingTaskComponent = (props: Props) => {
  const {title, description} = props.task;
  return (
    <div>
      <div> Title: ${title}</div>
      {description != null && <div> Description: {description} </div>}
    </div>
  );
};

export default OnboardingTaskComponent;
