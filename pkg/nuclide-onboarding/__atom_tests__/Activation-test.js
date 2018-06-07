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

import type {OnboardingTaskComponentProps} from '../../nuclide-onboarding/lib/types';

import AsyncStorage from 'idb-keyval';
import * as React from 'react';
import Activation from '../lib/Activation';
import {ACTIVE_TASK_KEY, TASK_STORAGE_PREFIX} from '../lib/Activation';
import * as Gatekeeper from '../../commons-node/passesGK';

function mockComponent(props: OnboardingTaskComponentProps) {
  return (
    <div>
      <span>Title: {props.title}</span>
      <span>Description: {props.description}</span>
    </div>
  );
}

describe('Activation', () => {
  let main;
  const mockTask1Key = 'mock-task-1';
  const mockTask2Key = 'mock-task-2';

  const mockTask1StorageKey = TASK_STORAGE_PREFIX + mockTask1Key;
  const mockTask2StorageKey = TASK_STORAGE_PREFIX + mockTask2Key;

  const mockFragments = [
    {
      description: 'Mock task 1',
      priority: 1,
      taskComponent: mockComponent,
      taskKey: mockTask1Key,
      title: 'Mock Task 1',
    },
    {
      description: 'Mock task 2',
      priority: 2,
      taskComponent: mockComponent,
      taskKey: mockTask2Key,
      title: 'Mock Task 2',
    },
  ];

  const mockIndexedDb = {
    [ACTIVE_TASK_KEY]: mockTask1Key,
    [mockTask1StorageKey]: {
      isCompleted: true,
    },
    [mockTask2StorageKey]: {
      isCompleted: false,
    },
  };

  const mockPriorityTask1Key = 'mock-priority-task-1';
  const mockPriorityTask2Key = 'mock-priority-task-2';

  const mockPriorityFragments = [
    {
      description: 'Mock priority task 1',
      priority: 0,
      taskComponent: mockComponent,
      taskKey: mockPriorityTask1Key,
      title: 'Mock Priority Task 1',
    },
    {
      description: 'Mock priority task 2',
      priority: 10,
      taskComponent: mockComponent,
      taskKey: mockPriorityTask2Key,
      title: 'Mock Priority Task 2',
    },
  ];

  beforeEach(() => {
    jest.spyOn(Gatekeeper, 'default').mockImplementation(async gkKey => true);
    jest
      .spyOn(AsyncStorage, 'get')
      .mockImplementation(async itemKey => mockIndexedDb[itemKey]);
    main = new Activation();
  });

  it('initializes activeTaskKey and isCompleted using the indexedDB values', async () => {
    main.setOnboardingFragments(mockFragments);
    await main._getAllTasksCompletedStatuses();
    expect(main._model.state.activeTaskKey).toEqual(
      mockTask1Key,
      'mockTask1 should be the active task',
    );
    expect(main._model.state.tasks.count()).toEqual(
      2,
      'there should be two tasks in _model.state.tasks',
    );
    expect(main._model.state.tasks.get(mockTask1Key)).toEqual(
      {
        ...mockFragments[0],
        isCompleted: true,
      },
      '_model.state.tasks should contain mockTask1 with isCompleted true',
    );
    expect(main._model.state.tasks.get(mockTask2Key)).toEqual(
      {
        ...mockFragments[1],
        isCompleted: false,
      },
      '_model.state.tasks should contain mockTask2 with isCompleted false',
    );
  });

  it('orders the tasks by priority', async () => {
    main.setOnboardingFragments(mockFragments.concat(mockPriorityFragments));
    await main._getAllTasksCompletedStatuses();
    expect(main._model.state.tasks.count()).toEqual(
      4,
      'there should be four tasks in _model.state.tasks',
    );
    const orderedTaskKeys = main._model.state.tasks.keySeq();
    expect(orderedTaskKeys.indexOf(mockPriorityTask1Key)).toEqual(
      0,
      'mockPriorityTask1 should be the first task in the map',
    );
    expect(orderedTaskKeys.indexOf(mockTask1Key)).toEqual(
      1,
      'mockTask1 should be the second task in the map',
    );
    expect(orderedTaskKeys.indexOf(mockTask2Key)).toEqual(
      2,
      'mockTask2 should be the third task in the map',
    );
    expect(orderedTaskKeys.indexOf(mockPriorityTask2Key)).toEqual(
      3,
      'mockPriorityTask2 should be the fourth task in the map',
    );
  });

  it('sets the active task to first incomplete task with greater priority than current active task', async () => {
    main.setOnboardingFragments(mockFragments);
    main.setOnboardingFragments(mockPriorityFragments);
    await main._getAllTasksCompletedStatuses();
    expect(main._model.state.tasks.count()).toEqual(
      4,
      'there should be four tasks in _model.state.tasks',
    );
    expect(main._model.state.activeTaskKey).toEqual(
      mockPriorityTask1Key,
      'mockPriorityTask1 should be the active task',
    );
  });

  describe('setOnboardingFragments', () => {
    it('shows an error notification when called with fragments with duplicate taskKeys', async () => {
      main.setOnboardingFragments([mockFragments[0]]);
      await main._getAllTasksCompletedStatuses();
      main.setOnboardingFragments([mockFragments[0]]);
      await expect(main._getAllTasksCompletedStatuses()).rejects.toThrowError(
        `Attempted to add duplicate onboarding task key: ${mockTask1Key}`,
      );
      expect(atom.notifications.getNotifications().length).toBe(1);
    });

    it('updates the model state with consumed fragments', async () => {
      main.setOnboardingFragments(mockFragments);
      await main._getAllTasksCompletedStatuses();
      expect(main._model.state.tasks.count()).toEqual(
        2,
        'there should be two tasks in _model.state.tasks',
      );
      expect(main._model.state.tasks.has(mockTask1Key)).toBe(
        true,
        '_model.state.tasks should contain mockTask1',
      );
      expect(main._model.state.tasks.has(mockTask2Key)).toBe(
        true,
        '_model.state.tasks should contain mockTask2',
      );
    });

    it('does not modify the model state if the disposable is already disposed', async () => {
      const disposable = main.setOnboardingFragments(mockFragments);
      disposable.dispose();
      await main._getAllTasksCompletedStatuses();
      expect(main._model.state.tasks.count()).toEqual(
        0,
        'there should not be any tasks in _model.state.tasks',
      );
    });
  });
});
