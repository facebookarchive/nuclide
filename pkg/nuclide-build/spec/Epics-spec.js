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
        const taskInfo = new dummy.TaskInfo();
        spyOn(taskInfo, 'cancel');
        const state = {
          ...createEmptyAppState(),
          taskStatus: {
            info: taskInfo,
            progress: 0,
          },
        };
        const result = await runActions([{type: Actions.STOP_TASK}], state).toArray().toPromise();
        expect(result.map(action => action.type)).toEqual([Actions.TASK_STOPPED]);
        expect(taskInfo.cancel).toHaveBeenCalled();
      });
    });

  });

  describe('RUN_TASK', () => {

    it('runs a task to completion', () => {
      waitsForPromise(async () => {
        const cancelSpy = jasmine.createSpy('task.cancel');
        let completeTask;

        const buildSystem = new dummy.BuildSystem();
        spyOn(buildSystem, 'runTask').andReturn({
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
          activeBuildSystemId: 'test',
          activeTaskType: 'test-task',
          buildSystems: new Map([['test', buildSystem]]),
          tasks: [
            {
              type: 'test-task',
              label: 'Test Task',
              description: 'A great task to test',
              enabled: true,
              icon: 'squirrel',
            },
          ],
        };

        const output = runActions(
          [{
            type: Actions.RUN_TASK,
            payload: {
              taskType: 'test-task',
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

  describe('REFRESH_TASKS', () => {

    let buildSystem;
    let initialState;

    beforeEach(() => {
      buildSystem = new dummy.BuildSystem();
      const tasks = [{
        type: 'ex',
        label: 'Test Task',
        description: 'A great task to test',
        enabled: true,
        icon: 'squirrel',
      }];
      buildSystem._tasks.next(tasks);
      spyOn(buildSystem, 'observeTasks').andCallThrough();
      initialState = {
        ...createEmptyAppState(),
        activeBuildSystemId: buildSystem.id,
        buildSystems: new Map([[buildSystem.id, buildSystem]]),
      };
    });

    it('updates the tasks if the toolbar is visible', () => {
      waitsForPromise(async () => {
        const result = await runActions(
          [{type: Actions.REFRESH_TASKS}],
          {...initialState, visible: true},
        ).toArray().toPromise();
        expect(result).toEqual([{type: 'UPDATE_TASKS'}]);
      });
    });

    it("doesn't update tasks if the toolbar isn't visible", () => {
      waitsForPromise(async () => {
        const result = await runActions(
          [{type: Actions.REFRESH_TASKS}],
          {...initialState, visible: false},
        ).toArray().toPromise();
        expect(result).toEqual([]);
      });
    });

  });

  describe('UPDATE_TASKS', () => {

    let buildSystem;
    let initialState;

    beforeEach(() => {
      buildSystem = new dummy.BuildSystem();
      const tasks = [{
        type: 'ex',
        label: 'Test Task',
        description: 'A great task to test',
        enabled: true,
        icon: 'squirrel',
      }];
      buildSystem._tasks.next(tasks);
      spyOn(buildSystem, 'observeTasks').andCallThrough();
      initialState = {
        ...createEmptyAppState(),
        activeBuildSystemId: buildSystem.id,
        buildSystems: new Map([[buildSystem.id, buildSystem]]),
      };
    });

    it("clears the tasks immediately (in cases the build system's observeTasks doesn't)", () => {
      waitsForPromise(async () => {
        const result = await runActions([{type: Actions.UPDATE_TASKS}], initialState)
          .first()
          .toPromise();
        expect(result).toEqual({type: 'TASKS_UPDATED', payload: {tasks: []}});
      });
    });

    it('gets tasks from the build system', () => {
      waitsForPromise(async () => {
        const result = await runActions([{type: Actions.UPDATE_TASKS}], initialState)
          .skip(1)
          .take(1)
          .toPromise();
        expect(result).toEqual({
          type: 'TASKS_UPDATED',
          payload: {
            tasks: [{
              type: 'ex',
              label: 'Test Task',
              description: 'A great task to test',
              enabled: true,
              icon: 'squirrel',
            }],
          },
        });
        expect(buildSystem.observeTasks).toHaveBeenCalled();
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
