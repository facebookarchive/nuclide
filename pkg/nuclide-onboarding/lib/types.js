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
import * as Immutable from 'immutable';

export type OnboardingModelState = {
  activeTaskKey: ?string,
  tasks: Immutable.OrderedMap<string, OnboardingTask>,
};

export type OnboardingFragment = {
  description?: string,
  taskComponent: React.ComponentType<OnboardingTaskMetadata>,
  taskKey: string,
  title: string,
};

export type OnboardingTaskMetadata = {
  description?: string,
  isCompleted: boolean,
  taskKey: string,
  title: string,
};

export type OnboardingTask = OnboardingFragment & {
  isCompleted: boolean,
};
