'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as ActionTypes from '../lib/ActionTypes';
import {applyActionMiddleware} from '../lib/applyActionMiddleware';
import {createEmptyAppState} from '../lib/createEmptyAppState';
import * as dummy from './dummy';
import {Subject} from 'rxjs';

describe('applyActionMiddleware', () => {

  describe('STOP_TASK', () => {

    it('cancels the current task', () => {
      waitsForPromise(async () => {
        const input = new Subject();
        const taskInfo = new dummy.TaskInfo();
        spyOn(taskInfo, 'cancel');
        const state = {
          ...createEmptyAppState(),
          taskStatus: {
            info: taskInfo,
            progress: 0,
          },
        };
        const outputPromise = applyActionMiddleware(input, () => state).toArray().toPromise();
        input.next({
          type: ActionTypes.STOP_TASK,
        });
        input.complete();

        const output = await outputPromise;
        expect(output.map(action => action.type)).toEqual([ActionTypes.TASK_STOPPED]);
        expect(taskInfo.cancel).toHaveBeenCalled();
      });
    });

  });

  describe('REFRESH_TASKS', () => {

    let buildSystem, input, outputStream, outputPromise, tasks;

    beforeEach(() => {
      input = new Subject();
      buildSystem = new dummy.BuildSystem();
      tasks = [{
        type: 'ex',
        label: 'Test Task',
        description: 'A great task to test',
        enabled: true,
        icon: 'squirrel',
      }];
      buildSystem._tasks.next(tasks);
      spyOn(buildSystem, 'observeTasks').andCallThrough();
      const state = {
        ...createEmptyAppState(),
        activeBuildSystemId: buildSystem.id,
        buildSystems: new Map([[buildSystem.id, buildSystem]]),
      };

      outputStream = new Subject();
      applyActionMiddleware(input, () => state).subscribe(outputStream);
      outputPromise = outputStream.toArray().toPromise();
    });

    it("clears the tasks immediately (in cases the build system's observeTasks doesn't )", () => {
      waitsForPromise(async () => {
        input.next({
          type: ActionTypes.TOOLBAR_VISIBILITY_UPDATED,
          payload: {visible: true},
        });
        input.next({
          type: ActionTypes.REFRESH_TASKS,
        });
        outputStream.complete();
        const output = await outputPromise;

        const firstTasksUpdatedAction =
          output.find(action => action.type === ActionTypes.TASKS_UPDATED);
        expect(firstTasksUpdatedAction).toEqual({
          type: 'TASKS_UPDATED',
          payload: {
            tasks: [],
          },
        });
      });
    });

    it('gets tasks from the build system', () => {
      waitsForPromise(async () => {
        input.next({
          type: ActionTypes.TOOLBAR_VISIBILITY_UPDATED,
          payload: {visible: true},
        });
        input.next({
          type: ActionTypes.REFRESH_TASKS,
        });
        outputStream.complete();
        const output = await outputPromise;

        const lastTasksUpdatedAction =
          output.filter(action => action.type === ActionTypes.TASKS_UPDATED).pop();
        expect(lastTasksUpdatedAction).toEqual({
          type: 'TASKS_UPDATED',
          payload: {tasks},
        });
        expect(buildSystem.observeTasks).toHaveBeenCalled();
      });
    });

    it("doesn't request tasks if the panel isn't visible", () => {
      waitsForPromise(async () => {
        input.next({
          type: ActionTypes.TOOLBAR_VISIBILITY_UPDATED,
          payload: {visible: false},
        });
        input.next({
          type: ActionTypes.REFRESH_TASKS,
        });
        expect(buildSystem.observeTasks).not.toHaveBeenCalled();
      });
    });

  });

});
