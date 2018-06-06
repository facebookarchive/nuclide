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
import type {OnboardingTaskMetadata} from '../../nuclide-onboarding/lib/types';

export default class EditorKeyBindingsComponent extends React.Component<
  OnboardingTaskMetadata,
> {
  render() {
    const {title, description, taskKey, isCompleted} = this.props;
    return (
      <div>
        EditorKeyBindingsComponent
        <span>Title: {title}</span>
        <span>Description: {description}</span>
        <span>Key: {taskKey}</span>
        <span>Completed: {isCompleted}</span>
      </div>
    );
  }
}
