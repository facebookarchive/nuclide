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
import type {Action, Store, ToolbarStatePreference} from '../lib/types';

import {ActionsObservable, combineEpics} from '../../commons-node/redux-observable';
import {taskFromObservable} from '../../commons-node/tasks';
import UniversalDisposable from '../../commons-node/UniversalDisposable';
import * as Actions from '../lib/redux/Actions';
import * as Epics from '../lib/redux/Epics';
import * as dummy from './dummy';
import invariant from 'assert';
import {Observable, ReplaySubject, Subject} from 'rxjs';

function getRootEpic() {
  const epics = Object.keys(Epics)
    .map(k => Epics[k])
    .filter(epic => typeof epic === 'function');
  return combineEpics(...epics);
}

describe('Epics', () => {
  describe('SET_PROJECT_ROOT', () => {
    describe('when task runners arent ready', () => {
      const state = {taskRunnersReady: false};

      it('does nothing', () => {
        waitsForPromise(async () => {
          const output = await runActions([Actions.setProjectRoot(null)], state)
            .toArray()
            .toPromise();
          expect(output).toEqual([]);
        });
      });
    });

    describe('when there are no task runners', () => {
      const state = {taskRunnersReady: true, taskRunners: []};

      it('set task runners states to an empty map', () => {
        waitsForPromise(async () => {
          const output = await runActions([Actions.setProjectRoot(null)], state)
            .first()
            .toPromise();
          invariant(output.type === Actions.SET_STATES_FOR_TASK_RUNNERS);
          expect(output.payload.statesForTaskRunners).toEqual(new Map());
        });
      });
    });

    describe('when there are task runners', () => {
      let taskRunner;
      let state;

      beforeEach(() => {
        taskRunner = new dummy.TaskRunner();
        const task = new dummy.createTask('test task');
        taskRunner = {
          ...taskRunner,
          setProjectRoot: (projectRoot, callback) => {
            callback(true, [task]);
            return new UniversalDisposable();
          },
        };
        state = {
          taskRunnersReady: true,
          taskRunners: [taskRunner],
        };
      });

      it('updates states after collecting them from all task runners', () => {
        waitsForPromise(async () => {
          const output = await runActions([Actions.setProjectRoot(null)], state)
            .first()
            .toPromise();
          invariant(output.type === Actions.SET_STATES_FOR_TASK_RUNNERS);
          const runnerState = output.payload.statesForTaskRunners.get(taskRunner);
          invariant(runnerState);
          expect(runnerState.enabled).toEqual(true);
          expect(runnerState.tasks[0].type).toEqual('test task');
        });
      });
    });
  });

  describe('SET_STATES_FOR_TASK_RUNNERS', () => {
    let state;
    let newStates;

    beforeEach(() => {
      const disabledTaskRunner = new dummy.TaskRunner('a');
      const loPriTaskRunner = new dummy.TaskRunner('b');
      let hiPriTaskRunner = new dummy.TaskRunner('c');
      hiPriTaskRunner = {
        ...hiPriTaskRunner,
        getPriority: () => 1,
      };

      newStates = new Map([
        [disabledTaskRunner, {enabled: false, tasks: []}],
        [loPriTaskRunner, {enabled: true, tasks: []}],
        [hiPriTaskRunner, {enabled: true, tasks: []}],
      ]);

      state = {
        projectRoot: {getPath: () => 'foo'},
        taskRunners: [disabledTaskRunner, loPriTaskRunner, hiPriTaskRunner],
        statesForTaskRunners: newStates,
      };
    });

    describe('if this working root doesnt have a preference', () => {
      it('selects an enabled runner with the highest priority', () => {
        waitsForPromise(async () => {
          const output = await runActions([Actions.setStatesForTaskRunners(newStates)], state)
            .toArray()
            .toPromise();
          expect(output.length).toEqual(2);
          const action = output[0];
          invariant(action.type === Actions.SELECT_TASK_RUNNER);
          invariant(action.payload.taskRunner);
          expect(action.payload.taskRunner.id).toEqual('c');
        });
      });

      it('shows the toolbar since it might be useful', () => {
        waitsForPromise(async () => {
          const output = await runActions([Actions.setStatesForTaskRunners(newStates)], state)
            .toArray()
            .toPromise();
          expect(output.length).toEqual(2);
          const action = output[1];
          invariant(action.type === Actions.SET_TOOLBAR_VISIBILITY);
          expect(action.payload.updateUserPreferences).toEqual(true);
          expect(action.payload.visible).toEqual(true);
        });
      });
    });

    describe('if this root has a preference', () => {
      let preference;
      beforeEach(() => {
        preference = {taskRunnerId: 'b', visible: true};
      });

      it('restores task runner and visibility based on the preference', () => {
        waitsForPromise(async () => {
          const output = await runActions(
            [Actions.setStatesForTaskRunners(newStates)],
            state,
            createMockPreferences([{key: 'foo', value: preference}]),
        )
            .toArray()
            .toPromise();
          expect(output.length).toEqual(2);
          const taskRunnerAction = output[0];
          const visibilityAction = output[1];
          invariant(taskRunnerAction.type === Actions.SELECT_TASK_RUNNER);
          invariant(visibilityAction.type === Actions.SET_TOOLBAR_VISIBILITY);
          invariant(taskRunnerAction.payload.taskRunner);
          expect(taskRunnerAction.payload.taskRunner.id).toEqual('b');
          expect(visibilityAction.payload.visible).toEqual(true);
          expect(visibilityAction.payload.updateUserPreferences).toEqual(false);
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
          activeTaskRunner: taskRunner,
          taskRunners: [taskRunner],
        };
        const taskMeta = dummy.createTask('test');

        const actions = [
          Actions.runTask({...taskMeta, taskRunner}, false),
          {type: Actions.TASK_STOPPED,
            payload:
           {taskStatus: {metadata: taskMeta, task, progress: 1}},
          },
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
          activeTaskRunner: taskRunner,
          taskRunners: [taskRunner],
        };
        const taskMeta = dummy.createTask('test');

        const output = runActions(
          [Actions.runTask({...taskMeta, taskRunner}, false)],
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
  initialState: Object,
  preferencesForWorkingRoots: LocalStorageJsonTable<?ToolbarStatePreference>
    = createMockPreferences([]),
): ReplaySubject<Action> {
  const store = createMockStore(initialState);
  const input = new Subject();
  const output = new ReplaySubject();
  const options = {
    preferencesForWorkingRoots,
    states: Observable.never(),
  };
  getRootEpic()(new ActionsObservable(input), store, options).subscribe(output);
  actions.forEach(input.next.bind(input));
  input.complete();
  return output;
}

function createMockPreferences(
  db: Array<{key: string, value: ?ToolbarStatePreference}>,
): LocalStorageJsonTable<?ToolbarStatePreference> {
  return ((new dummy.ToolbarStatePreferences(db): any):
    LocalStorageJsonTable<?ToolbarStatePreference>);
}
