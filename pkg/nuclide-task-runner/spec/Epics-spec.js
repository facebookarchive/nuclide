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
import {taskFromObservable} from '../../commons-node/tasks';
import * as Actions from '../lib/redux/Actions';
import * as Epics from '../lib/redux/Epics';
import {createEmptyAppState} from '../lib/createEmptyAppState';
import * as dummy from './dummy';
import {ReplaySubject, Subject} from 'rxjs';

function getRootEpic() {
  const epics = Object.keys(Epics)
    .map(k => Epics[k])
    .filter(epic => typeof epic === 'function');
  return combineEpics(...epics);
}

describe('Epics', () => {

  describe('TASK_STOPPED', () => {

    it('cancels the current task', () => {
      waitsForPromise(async () => {
        const task = taskFromObservable(new Subject());
        const taskRunner = new dummy.TaskRunner();
        spyOn(taskRunner, 'runTask').andReturn(task);
        spyOn(task, 'cancel');
        const state = {
          ...createEmptyAppState(),
          activeTaskId: {type: 'test-task', taskRunnerId: 'test'},
          taskRunners: new Map([['test', taskRunner]]),
          taskLists: new Map([['test', [
            {
              type: 'test-task',
              taskRunnerId: 'test',
              taskRunnerName: 'Build System',
              label: 'Test Task',
              description: 'A great task to test',
              runnable: true,
              icon: 'squirrel',
            },
          ]]]),
        };
        const actions = [
          Actions.runTask({type: 'test-task', taskRunnerId: 'test'}),
          {type: Actions.TASK_STOPPED, payload: {task}},
        ];
        await runActions(actions, state).toArray().toPromise();
        expect(task.cancel).toHaveBeenCalled();
      });
    });

  });

  describe('RUN_TASK', () => {

    it('runs a task to completion', () => {
      waitsForPromise(async () => {
        const taskRunner = new dummy.TaskRunner();
        const taskEvents = new Subject();
        const task = taskFromObservable(taskEvents);
        spyOn(task, 'cancel');
        spyOn(task, 'onDidComplete').andCallThrough();
        spyOn(taskRunner, 'runTask').andReturn(task);

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
              runnable: true,
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

        expect(task.onDidComplete).toHaveBeenCalled();
        taskEvents.complete();

        const result = await output.toArray().toPromise();
        expect(result.map(action => action.type).slice(-2)).toEqual([
          Actions.TASK_STARTED,
          Actions.TASK_COMPLETED,
        ]);
        expect(task.cancel).not.toHaveBeenCalled();
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
