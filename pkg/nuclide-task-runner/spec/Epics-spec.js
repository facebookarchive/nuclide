'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Action, AppState, Store} from '../lib/types';

import {ActionsObservable, combineEpics} from '../../commons-node/redux-observable';
import * as Actions from '../lib/redux/Actions';
import * as Epics from '../lib/redux/Epics';
import {createEmptyAppState} from '../lib/createEmptyAppState';
import * as dummy from './dummy';
import invariant from 'assert';
import {ReplaySubject, Subject} from 'rxjs';

function getRootEpic() {
  const epics = Object.keys(Epics)
    .map(k => Epics[k])
    .filter(epic => typeof epic === 'function');
  return combineEpics(...epics);
}

describe('Epics', () => {

  describe('STOP_TASK', () => {

    it('cancels the current task', () => {
      waitsForPromise(async () => {
        const task = new dummy.Task();
        spyOn(task, 'cancel');
        const state = {
          ...createEmptyAppState(),
          taskStatus: {
            task,
            progress: 0,
          },
        };
        const result = await runActions([{type: Actions.STOP_TASK}], state).toArray().toPromise();
        expect(result.map(action => action.type)).toEqual([Actions.TASK_STOPPED]);
        expect(task.cancel).toHaveBeenCalled();
      });
    });

  });

  describe('RUN_TASK', () => {

    it('runs a task to completion', () => {
      waitsForPromise(async () => {
        const cancelSpy = jasmine.createSpy('task.cancel');
        let completeTask;

        const taskRunner = new dummy.TaskRunner();
        spyOn(taskRunner, 'runTask').andReturn({
          onDidComplete(cb) {
            completeTask = cb;
            return {dispose: () => {}};
          },
          onDidError() {
            return {dispose: () => {}};
          },
          cancel: cancelSpy,
        });

        const state = {
          ...createEmptyAppState(),
          activeTaskId: {
            type: 'test-task',
            taskRunnerId: 'test',
          },
          taskRunners: new Map([['test', taskRunner]]),
          taskLists: new Map([['test', [
            {
              type: 'test-task',
              taskRunnerId: 'test',
              taskRunnerName: 'Build System',
              label: 'Test Task',
              description: 'A great task to test',
              enabled: true,
              icon: 'squirrel',
            },
          ]]]),
        };

        const output = runActions(
          [{
            type: Actions.RUN_TASK,
            payload: {
              taskId: {
                type: 'test-task',
                taskRunnerId: 'test',
              },
            },
          }],
          state,
        );

        invariant(completeTask != null, 'completeTask should be set');
        completeTask();

        const result = await output.toArray().toPromise();
        expect(result.map(action => action.type)).toEqual([
          Actions.TASK_STARTED,
          Actions.TASK_COMPLETED,
        ]);
        expect(cancelSpy).not.toHaveBeenCalled();
      });
    });

  });

});

function createMockStore(state: Object): Store {
  const store = {
    getState: () => state,
  };
  return ((store: any): Store);
}

function runActions(actions: Array<Action>, initialState: AppState): ReplaySubject<Action> {
  const store = createMockStore(initialState);
  const input = new Subject();
  const output = new ReplaySubject();
  getRootEpic()(new ActionsObservable(input), store).subscribe(output);
  actions.forEach(input.next.bind(input));
  input.complete();
  return output;
}
