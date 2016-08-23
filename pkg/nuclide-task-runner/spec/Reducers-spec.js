'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {createEmptyAppState} from '../lib/createEmptyAppState';
import * as Actions from '../lib/redux/Actions';
import * as Reducers from '../lib/redux/Reducers';
import * as dummy from './dummy';

describe('Reducers', () => {

  describe('UPDATE_TASKS', () => {

    it("selects the previous session's active task if it becomes available", () => {
      const taskRunner = new dummy.TaskRunner();
      taskRunner.id = 'previous-build-system';
      taskRunner.name = 'Build System';
      const initialState = {
        ...createEmptyAppState(),
        activeTaskId: {
          type: 'test',
          taskRunnerId: 'some-build-system',
        },
        previousSessionActiveTaskId: {
          type: 'other',
          taskRunnerId: 'previous-build-system',
        },
      };
      const action = {
        type: Actions.TASK_LIST_UPDATED,
        payload: {
          taskRunnerId: 'previous-build-system',
          taskList: [createTask('other')],
        },
      };
      const finalState = [action].reduce(Reducers.app, initialState);
      expect(finalState.activeTaskId)
        .toEqual({taskRunnerId: 'previous-build-system', type: 'other'});
    });

  });

  describe('UNREGISTER_TASK_RUNNER', () => {

    it("doesn't leave an invalid task selected", () => {
      const taskRunner = new dummy.TaskRunner();
      taskRunner.id = 'previous-build-system';
      taskRunner.name = 'Build System';
      const initialState = {
        ...createEmptyAppState(),
        activeTaskId: {
          type: 'test',
          taskRunnerId: 'some-build-system',
        },
        taskRunners: new Map([['some-build-system', taskRunner]]),
      };
      const action = {
        type: Actions.UNREGISTER_TASK_RUNNER,
        payload: {id: 'some-build-system'},
      };
      const finalState = [action].reduce(Reducers.app, initialState);
      expect(finalState.activeTaskId).toBe(null);
    });

  });

});

const createTask = name => ({
  type: name,
  label: name,
  description: name,
  runnable: true,
  icon: 'triangle-right',
});
