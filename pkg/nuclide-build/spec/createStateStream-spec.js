'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Action, AppState} from '../lib/types';

import * as ActionTypes from '../lib/ActionTypes';
import {createEmptyAppState} from '../lib/createEmptyAppState';
import {createStateStream} from '../lib/createStateStream';
import * as dummy from './dummy';
import {Subject} from 'rxjs';

describe('createStateStream', () => {

  describe('REGISTER_BUILD_SYSTEM', () => {

    it('selects the build system if it was the one active in the previous session', () => {
      waitsForPromise(async () => {
        const buildSystem = new dummy.BuildSystem();
        buildSystem.id = 'previous-build-system';
        buildSystem.name = 'Build System';
        const initialState = {
          ...createEmptyAppState(),
          activeBuildSystemId: 'some-build-system',
          previousSessionActiveBuildSystemId: 'previous-build-system',
        };
        const action = {
          type: ActionTypes.REGISTER_BUILD_SYSTEM,
          payload: {buildSystem},
        };
        const finalState = await getStateAfterActions([action], initialState);
        expect(finalState.activeBuildSystemId).toBe('previous-build-system');
      });
    });

  });

  describe('SELECT_BUILD_SYSTEM', () => {

    it(
      "clears previousSessionActiveBuildSystemId so that the user's explicit selections aren't"
        + ' overridden',
      () => {
        waitsForPromise(async () => {
          const initialState = {
            ...createEmptyAppState(),
            activeBuildSystemId: 'some-build-system',
            previousSessionActiveBuildSystemId: 'previous-build-system',
          };
          const action = {
            type: ActionTypes.SELECT_BUILD_SYSTEM,
            payload: {id: 'new-build-system'},
          };
          const finalState = await getStateAfterActions([action], initialState);
          expect(finalState.previousSessionActiveBuildSystemId).toBe(null);
        });
      },
    );

  });

  it('chooses a default activeTaskType if the currently active one goes away', () => {
    waitsForPromise(async () => {
      const initialState = {
        ...createEmptyAppState(),
        activeBuildSystemId: 'some-build-system',
        activeTaskType: 'bark',
        tasks: [createTask('bark'), createTask('purr')],
      };
      const actions = [
        {
          type: ActionTypes.TASKS_UPDATED,
          payload: {
            tasks: [createTask('purr')],
          },
        },
      ];
      const finalState = await getStateAfterActions(actions, initialState);
      expect(finalState.activeTaskType).toBe('purr');

      // It should remember the old one so it can be restored.
      expect(finalState.previousSessionActiveTaskType).toBe('bark');
    });
  });

  it('restores the previous task when it comes back', () => {
    waitsForPromise(async () => {
      const initialState = {
        ...createEmptyAppState(),
        activeBuildSystemId: 'some-build-system',
        activeTaskType: 'purr',
        previousSessionActiveTaskType: 'bark',
        tasks: [createTask('purr')],
      };
      const actions = [
        {
          type: ActionTypes.TASKS_UPDATED,
          payload: {
            tasks: [createTask('bark'), createTask('purr')],
          },
        },
      ];
      const finalState = await getStateAfterActions(actions, initialState);
      expect(finalState.activeTaskType).toBe('bark');
      expect(finalState.previousSessionActiveTaskType).toBe(null);
    });
  });

});

async function getStateAfterActions(
  actions: Array<Action>,
  initialState?: AppState = createEmptyAppState(),
): Promise<AppState> {
  const actionStream = new Subject();
  const states = createStateStream(actionStream, initialState);
  const statePromise = states.toPromise();
  actions.forEach(action => {
    actionStream.next(action);
  });
  actionStream.complete();
  return await statePromise;
}

const createTask = name => ({
  type: name,
  label: name,
  description: name,
  enabled: true,
  icon: 'triangle-right',
});
