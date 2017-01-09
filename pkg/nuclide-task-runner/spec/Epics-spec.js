/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {LocalStorageJsonTable} from '../../commons-atom/LocalStorageJsonTable';
import type {Action, AppState, Store} from '../lib/types';
import type {Directory} from '../../nuclide-remote-connection';

import {ActionsObservable, combineEpics} from '../../commons-node/redux-observable';
import {taskFromObservable} from '../../commons-node/tasks';
import * as Actions from '../lib/redux/Actions';
import * as Epics from '../lib/redux/Epics';
import {createEmptyAppState} from '../lib/createEmptyAppState';
import * as dummy from './dummy';
import {createTask} from './dummy';
import invariant from 'assert';
import {Observable, ReplaySubject, Subject} from 'rxjs';

function getRootEpic() {
  const epics = Object.keys(Epics)
    .map(k => Epics[k])
    .filter(epic => typeof epic === 'function');
  return combineEpics(...epics);
}

describe('Epics', () => {
  describe('initializeViewEpic', () => {
    describe("when there's no visiblity from the previous session", () => {
      describe("when there's an active task", () => {
        it('shows the toolbar if the active task is explicitly enabled', () => {
          waitsForPromise(async () => {
            const initialState = {
              ...createEmptyAppState(),
              projectRoot: createMockDirectory('/a'),
              activeTaskId: {taskRunnerId: 'build-system', type: 'test'},
              taskLists: new Map([['build-system', [createTask('build-system', 'test', false)]]]),
              projectWasOpened: true,
            };
            const output = await runActions([Actions.tasksReady()], initialState)
              .first()
              .toPromise();
            invariant(output.type === Actions.INITIALIZE_VIEW);
            expect(output.payload.visible).toBe(true);
          });
        });

        it("doesn't show the toolbar if the active task doesn't have a disabled value", () => {
          waitsForPromise(async () => {
            const initialState = {
              ...createEmptyAppState(),
              projectRoot: createMockDirectory('/a'),
              activeTaskId: {taskRunnerId: 'build-system', type: 'test'},
              taskLists: new Map([['build-system', [createTask('build-system', 'test')]]]),
              projectWasOpened: true,
            };
            const output = await runActions([Actions.tasksReady()], initialState)
              .first()
              .toPromise();
            invariant(output.type === Actions.INITIALIZE_VIEW);
            expect(output.payload.visible).toBe(false);
          });
        });
      });

      it('hides the toolbar the first time tasks become ready without an active task', () => {
        waitsForPromise(async () => {
          const initialState = {
            ...createEmptyAppState(),
            projectRoot: createMockDirectory('/a'),
            activeTaskId: null,
            taskLists: new Map([['build-system', [createTask('build-system', 'test')]]]),
            projectWasOpened: true,
          };
          const output = await runActions([Actions.tasksReady()], initialState)
            .first()
            .toPromise();
          invariant(output.type === Actions.INITIALIZE_VIEW);
          expect(output.payload.visible).toBe(false);
        });
      });
    });

    describe("when there's a serialized visibility from the previous session", () => {
      it('shows the toolbar if the value is true (even with no task)', () => {
        waitsForPromise(async () => {
          const initialState = {
            ...createEmptyAppState(),
            projectRoot: createMockDirectory('/a'),
            activeTaskId: null,
            taskLists: new Map([['build-system', [createTask('build-system', 'test')]]]),
            projectWasOpened: true,
          };
          const output = await runActions(
            [Actions.tasksReady()],
            initialState,
            {visibilityTable: createMockVisibilityTable([{key: '/a', value: true}])},
          )
            .first()
            .toPromise();
          invariant(output.type === Actions.INITIALIZE_VIEW);
          expect(output.payload.visible).toBe(true);
        });
      });

      it('hides the toolbar if the value is false (even with an enabled task)', () => {
        waitsForPromise(async () => {
          const initialState = {
            ...createEmptyAppState(),
            projectRoot: createMockDirectory('/a'),
            activeTaskId: {taskRunnerId: 'build-system', type: 'test'},
            taskLists: new Map([['build-system', [createTask('build-system', 'test')]]]),
            projectWasOpened: true,
          };
          const output = await runActions(
            [Actions.tasksReady()],
            initialState,
            {visibilityTable: createMockVisibilityTable([{key: '/a', value: false}])},
          )
            .first()
            .toPromise();
          invariant(output.type === Actions.INITIALIZE_VIEW);
          expect(output.payload.visible).toBe(false);
        });
      });
    });
  });

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
          activeTaskRunnerId: 'test',
          taskRunners: new Map([['test', taskRunner]]),
          taskLists: new Map([['test', [
            {
              type: 'test-task',
              taskRunnerId: 'test',
              taskRunnerName: 'Build System',
              label: 'Test Task',
              description: 'A great task to test',
              runnable: true,
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
          activeTaskRunnerId: 'test',
          taskRunners: new Map([['test', taskRunner]]),
          taskLists: new Map([['test', [
            {
              type: 'test-task',
              taskRunnerId: 'test',
              taskRunnerName: 'Build System',
              label: 'Test Task',
              description: 'A great task to test',
              runnable: true,
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

function runActions(
  actions: Array<Action>,
  initialState: AppState,
  options_?: Object,
): ReplaySubject<Action> {
  const store = createMockStore(initialState);
  const input = new Subject();
  const output = new ReplaySubject();
  const options = {
    visibilityTable: options_ && options_.visibilityTable || createMockVisibilityTable([]),
    states: Observable.never(),
  };
  getRootEpic()(new ActionsObservable(input), store, options).subscribe(output);
  actions.forEach(input.next.bind(input));
  input.complete();
  return output;
}

function createMockDirectory(path: string): Directory {
  const directory = {
    getPath: () => path,
  };
  return ((directory: any): Directory);
}

function createMockVisibilityTable(
  db: Array<{key: string, value: boolean}>,
): LocalStorageJsonTable<boolean> {
  return ((new dummy.VisibilityTable(db): any): LocalStorageJsonTable<boolean>);
}
