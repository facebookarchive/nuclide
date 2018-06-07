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

import type {
  OnboardingModelState,
  OnboardingFragment,
  OnboardingTask,
} from './types';

import AsyncStorage from 'idb-keyval';
import Model from 'nuclide-commons/Model';
import createUtmUrl from './createUtmUrl';
import featureConfig from 'nuclide-commons-atom/feature-config';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import OnboardingPaneItem, {WORKSPACE_VIEW_URI} from './OnboardingPaneItem';
import OnboardingTasksCompletedComponent from './OnboardingTasksCompletedComponent';
import * as Immutable from 'immutable';
import {destroyItemWhere} from 'nuclide-commons-atom/destroyItemWhere';
import {shell} from 'electron';

export const ACTIVE_TASK_KEY = 'nuclide-onboarding-active-task-key';
export const TASK_STORAGE_PREFIX = 'nuclide-onboarding-task-';

export default class Activation {
  // Array of isCompleted promises allowing us to wait for promises to be
  // resolved after calling setFragments in specs
  _allTasksCompletedStatuses: Array<Promise<any>>;

  _model: Model<OnboardingModelState> = new Model({
    activeTaskKey: null,
    tasks: new Immutable.OrderedMap(),
  });

  _subscriptions: UniversalDisposable;

  constructor(state: ?Object) {
    this._allTasksCompletedStatuses = [];
    this._subscriptions = this._registerCommandAndOpener();
    this._considerDisplayingOnboarding();
  }

  setOnboardingFragments(
    onboardingFragments: Array<OnboardingFragment>,
  ): UniversalDisposable {
    const disposable = new UniversalDisposable();
    this._allTasksCompletedStatuses.push(
      Promise.all(
        onboardingFragments.map(fragment => {
          return this._getInitialTaskIsCompleted(fragment.taskKey);
        }),
      )
        .then(completedStatuses => {
          if (disposable.disposed) {
            return;
          }

          let tasks = this._model.state.tasks;
          for (const [
            fragmentIndex,
            isCompleted,
          ] of completedStatuses.entries()) {
            const fragment = onboardingFragments[fragmentIndex];
            const taskKey = fragment.taskKey;
            if (tasks.has(taskKey)) {
              throw new Error(
                'Attempted to add duplicate onboarding task key: ' + taskKey,
              );
            }
            tasks = tasks.set(taskKey, {
              ...fragment,
              isCompleted,
            });
          }
          tasks = tasks.sort((taskA, taskB) => taskA.priority - taskB.priority);
          this._model.setState({tasks});
          this._initializeActiveTaskKey();
        })
        .catch(error => {
          atom.notifications.addError(error.message);
          throw error;
        }),
    );

    disposable.add(() => {
      let tasks = this._model.state.tasks;
      for (const onboardingFragment of onboardingFragments) {
        tasks = tasks.remove(onboardingFragment.taskKey);
      }
      this._model.setState({tasks});
    });

    return disposable;
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
            selectTaskHandler: this._handleTaskSelection,
            setTaskCompletedHandler: (taskKey: string) =>
              this._setTaskIsCompleted(taskKey),
            taskDetails: this._model.toObservable(),
          };
          return new OnboardingPaneItem(onboardingPaneItemProps);
        }
      }),
      () => destroyItemWhere(item => item instanceof OnboardingPaneItem),
      atom.commands.add('atom-workspace', 'nuclide-onboarding:toggle', () => {
        atom.workspace.toggle(WORKSPACE_VIEW_URI);
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

  async _initializeActiveTaskKey() {
    let activeTask;
    let activeTaskKey = await AsyncStorage.get(ACTIVE_TASK_KEY);

    if (activeTaskKey != null) {
      activeTask = this._model.state.tasks.get(activeTaskKey);
    }

    const firstIncompleteTask = this._getFirstIncompleteTask();

    if (activeTask != null) {
      // If new incomplete task is added with greater priority than stored
      // active task, that task should become active
      if (activeTask.priority > firstIncompleteTask.priority) {
        activeTaskKey = firstIncompleteTask.taskKey;
      }
    } else {
      activeTaskKey = firstIncompleteTask.taskKey;
    }
    this._model.setState({activeTaskKey});
  }

  _getAllTasksCompletedStatuses(): Promise<any> {
    return Promise.all(this._allTasksCompletedStatuses);
  }

  // Guaranteed to return an OnboardingTask since the final task cannot have isComplete=true
  _getFirstIncompleteTask(): OnboardingTask {
    return this._model.state.tasks.find(task => task.isCompleted === false);
  }

  async _getInitialTaskIsCompleted(taskKey: string) {
    const taskStorageKey = TASK_STORAGE_PREFIX + taskKey;
    let isTaskCompleted = false;

    const storedTaskData = await AsyncStorage.get(taskStorageKey);

    if (storedTaskData != null) {
      isTaskCompleted = storedTaskData.isCompleted || false;
    }

    return isTaskCompleted;
  }

  async _setActiveTaskKey(activeTaskKey: string) {
    this._model.setState({activeTaskKey});
    await AsyncStorage.set(ACTIVE_TASK_KEY, activeTaskKey);
  }

  async _setTaskIsCompleted(taskKey: string) {
    const task = this._model.state.tasks.get(taskKey);

    if (task != null) {
      task.isCompleted = true;
      const tasks = this._model.state.tasks.set(taskKey, task);
      const activeTaskKey = this._getFirstIncompleteTask().taskKey;
      this._model.setState({activeTaskKey, tasks});

      const taskStorageKey = TASK_STORAGE_PREFIX + taskKey;
      await Promise.all([
        AsyncStorage.set(taskStorageKey, {isCompleted: true}),
        AsyncStorage.set(ACTIVE_TASK_KEY, activeTaskKey),
      ]);
    } else {
      atom.notifications.addWarning(
        `Attempting to mark task ${taskKey} completed, but ${taskKey} is not a valid Onboarding task`,
      );
    }
  }

  _canBecomeActiveTask(selectedTaskKey: string) {
    const currentActiveTaskKey = this._model.state.activeTaskKey;
    const selectedTask = this._model.state.tasks.get(selectedTaskKey);

    if (selectedTask == null || selectedTaskKey === currentActiveTaskKey) {
      return false;
    }

    const firstIncompleteTask = this._getFirstIncompleteTask();
    let canBecomeActiveTask;

    if (firstIncompleteTask == null) {
      canBecomeActiveTask = selectedTask.isCompleted;
    } else {
      canBecomeActiveTask =
        selectedTask.isCompleted ||
        firstIncompleteTask.taskKey === selectedTaskKey;
    }

    return canBecomeActiveTask;
  }

  _handleTaskSelection = (selectedTaskKey: string): void => {
    if (this._canBecomeActiveTask(selectedTaskKey)) {
      this._setActiveTaskKey(selectedTaskKey);
    }
  };

  getOnboardingTasksCompletedFragment(): Array<OnboardingFragment> {
    return [
      {
        priority: 11,
        taskComponent: OnboardingTasksCompletedComponent,
        description:
          'Congratulations! You have completed all of the onboarding tasks!',
        taskKey: 'onboarding-tasks-completed',
        title: 'All Onboarding Tasks Completed',
      },
    ];
  }
}
