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

import type {OnboardingModelState, OnboardingFragment} from './types';

import Model from 'nuclide-commons/Model';
import createUtmUrl from './createUtmUrl';
import featureConfig from 'nuclide-commons-atom/feature-config';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import OnboardingPaneItem, {WORKSPACE_VIEW_URI} from './OnboardingPaneItem';
import * as Immutable from 'immutable';
import createPackage from 'nuclide-commons-atom/createPackage';
import {destroyItemWhere} from 'nuclide-commons-atom/destroyItemWhere';
import {BehaviorSubject} from 'rxjs';
import {shell} from 'electron';

class Activation {
  // A stream of all of the fragments. This is essentially the state of our panel.
  _allOnboardingFragmentsStream: BehaviorSubject<
    Immutable.OrderedMap<string, OnboardingFragment>,
  > = new BehaviorSubject(Immutable.OrderedMap());

  _model: Model<OnboardingModelState> = new Model({
    activeTaskKey: null,
    tasks: new Immutable.OrderedMap(),
  });

  _subscriptions: UniversalDisposable;

  constructor(state: ?Object) {
    this._subscriptions = this._registerCommandAndOpener();
    this._considerDisplayingOnboarding();
    this._model.setState({activeTaskKey: 'editor-ide-experience'});
    // TODO: Go fetch activeTaskKey from disk? or fall back to first item
  }

  setOnboardingFragments(
    onboardingFragments: Array<OnboardingFragment>,
  ): UniversalDisposable {
    let tasks = this._model.state.tasks;
    for (const onboardingFragment of onboardingFragments) {
      tasks = tasks.set(onboardingFragment.taskKey, {
        ...onboardingFragment,
        isCompleted: false, // TODO: Fetch isCompleted from disk
      });
    }
    this._model.setState({tasks});

    return new UniversalDisposable(() => {
      tasks = this._model.state.tasks;
      for (const onboardingFragment of onboardingFragments) {
        tasks = tasks.remove(onboardingFragment.taskKey);
      }
      this._model.setState({tasks});
    });
  }

  dispose(): void {
    this._subscriptions.dispose();
  }

  _considerDisplayingOnboarding() {
    const showOnboarding = featureConfig.get(
      'nuclide-onboarding.showOnboarding',
    );
    // flowlint-next-line sketchy-null-mixed:off
    if (showOnboarding) {
      // eslint-disable-next-line nuclide-internal/atom-apis
      atom.workspace.open(WORKSPACE_VIEW_URI, {searchAllPanes: true});
    }
  }

  _registerCommandAndOpener(): UniversalDisposable {
    return new UniversalDisposable(
      atom.workspace.addOpener(uri => {
        if (uri === WORKSPACE_VIEW_URI) {
          const onboardingPaneItemProps = {
            taskDetails: this._model.toObservable(),
            selectTaskHandler: this._handleTaskSelection,
          };
          return new OnboardingPaneItem(onboardingPaneItemProps);
        }
      }),
      () => destroyItemWhere(item => item instanceof OnboardingPaneItem),
      atom.commands.add('atom-workspace', 'nuclide-onboarding:toggle', () => {
        atom.workspace.toggle(WORKSPACE_VIEW_URI);
      }),
      atom.commands.add('atom-workspace', 'nuclide-docs:open', () => {
        shell.openExternal('https://nuclide.io/');
      }),
      atom.commands.add(
        'atom-workspace',
        // eslint-disable-next-line nuclide-internal/atom-apis
        'nuclide-onboarding:open-docs',
        e => {
          const url = createUtmUrl('https://nuclide.io/docs', 'help');
          shell.openExternal(url);
        },
      ),
    );
  }

  _canBecomeActiveTask(selectedTaskKey: string) {
    const currentActiveTaskKey = this._model.state.activeTaskKey;
    const selectedTask = this._model.state.tasks.get(selectedTaskKey);

    if (selectedTask == null || selectedTaskKey === currentActiveTaskKey) {
      return false;
    }

    const firstIncompleteTask = this._model.state.tasks.find(
      task => task.isCompleted === false,
    );

    let canBecomeActiveTask = selectedTask.isCompleted;

    if (firstIncompleteTask != null) {
      canBecomeActiveTask =
        canBecomeActiveTask || firstIncompleteTask.taskKey === selectedTaskKey;
    }

    return canBecomeActiveTask;
  }

  _handleTaskSelection = (selectedTaskKey: string): void => {
    if (this._canBecomeActiveTask(selectedTaskKey)) {
      this._model.setState({activeTaskKey: selectedTaskKey});
    }
  };
}

createPackage(module.exports, Activation);
