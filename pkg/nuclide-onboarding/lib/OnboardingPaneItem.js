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

import type {OnboardingFragment, OnboardingTask} from './types';
import type {BehaviorSubject} from 'rxjs';

import * as Immutable from 'immutable';
import * as React from 'react';
import OnboardingTaskComponent from './OnboardingTaskComponent';
import OnboardingTasksProgressBar from './OnboardingTasksProgressBar';
import NuclideLogo from './NuclideLogo';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';

export const WORKSPACE_VIEW_URI = 'atom://nuclide/onboarding';

type Props = {
  allOnboardingFragmentsStream: BehaviorSubject<
    Immutable.Map<string, OnboardingFragment>,
  >,
};

export default class OnboardingPaneItem extends React.Component<
  Props,
  {
    allOnboardingTasks: Immutable.Map<string, OnboardingTask>,
    currentTaskKey: ?string,
  },
> {
  _disposables: ?UniversalDisposable;

  constructor(props: Props) {
    super(props);
    this.state = {allOnboardingTasks: Immutable.Map(), currentTaskKey: null};
  }

  componentDidMount() {
    // TODO: get current task key from store
    this.setState({currentTaskKey: 'test-task'});
    // Note: We're assuming that the allOnboardingFragmentsStream prop never changes.
    this._disposables = new UniversalDisposable(
      this.props.allOnboardingFragmentsStream.subscribe(
        allOnboardingFragments => {
          const allOnboardingTasks = allOnboardingFragments.map(fragment => ({
            ...fragment,
            isCompleted: this.isTaskCompleted(fragment.key),
          }));
          this.setState({allOnboardingTasks});
        },
      ),
    );
  }

  render() {
    const {allOnboardingTasks, currentTaskKey} = this.state;
    const currentTask =
      currentTaskKey != null ? allOnboardingTasks.get(currentTaskKey) : null;
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
          allOnboardingTasks={allOnboardingTasks}
          selectedTaskKey={currentTaskKey}
        />
        {currentTask != null && <OnboardingTaskComponent task={currentTask} />}
      </div>
    );
  }

  // TODO: Get value from store
  isTaskCompleted(taskKey: string): boolean {
    return false;
  }

  getTitle(): string {
    return 'Onboarding';
  }

  getIconName(): string {
    return 'onboarding';
  }

  // Return false to prevent the tab getting split (since we only update a singleton health pane).
  copy() {
    return false;
  }

  getURI(): string {
    return WORKSPACE_VIEW_URI;
  }

  getDefaultLocation(): string {
    return 'center';
  }

  componentWillUnmount() {
    if (this._disposables != null) {
      this._disposables.dispose();
    }
  }
}
