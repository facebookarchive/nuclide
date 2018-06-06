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

import type {OnboardingModelState} from './types';

import * as React from 'react';
import OnboardingTaskComponentWrapper from './OnboardingTaskComponentWrapper';
import OnboardingTasksProgressBar from './OnboardingTasksProgressBar';
import NuclideLogo from './NuclideLogo';

export const WORKSPACE_VIEW_URI = 'atom://nuclide/onboarding';

export default function OnboardingPaneContents(
  props: OnboardingModelState,
): React.Node {
  const {tasks, activeTaskKey} = props;
  const currentTask = activeTaskKey != null ? tasks.get(activeTaskKey) : null;
  return (
    // Re-use styles from the Atom welcome pane where possible.
    <div className="nuclide-onboarding pane-item padded nuclide-onboarding-containers">
      <div key="welcome" className="nuclide-onboarding-container">
        <section className="text-left">
          <h1 className="nuclide-onboarding-title">
            Welcome to <NuclideLogo className="nuclide-onboarding-logo" />{' '}
            Nuclide, let's get you set up!
          </h1>
        </section>
      </div>
      <OnboardingTasksProgressBar
        allOnboardingTasks={tasks}
        selectedTaskKey={activeTaskKey}
      />
      {currentTask != null && (
        <OnboardingTaskComponentWrapper {...currentTask} />
      )}
    </div>
  );
}
