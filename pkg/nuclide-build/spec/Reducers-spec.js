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

  describe('REGISTER_BUILD_SYSTEM', () => {

    it('selects the build system if it was the one active in the previous session', () => {
      const buildSystem = new dummy.BuildSystem();
      buildSystem.id = 'previous-build-system';
      buildSystem.name = 'Build System';
      const initialState = {
        ...createEmptyAppState(),
        activeBuildSystemId: 'some-build-system',
        previousSessionActiveBuildSystemId: 'previous-build-system',
      };
      const action = {
        type: Actions.REGISTER_BUILD_SYSTEM,
        payload: {buildSystem},
      };
      const finalState = [action].reduce(Reducers.app, initialState);
      expect(finalState.activeBuildSystemId).toBe('previous-build-system');
    });

  });

  describe('SELECT_BUILD_SYSTEM', () => {

    it(
      "clears previousSessionActiveBuildSystemId so that the user's explicit selections aren't"
        + ' overridden',
      () => {
        const initialState = {
          ...createEmptyAppState(),
          activeBuildSystemId: 'some-build-system',
          previousSessionActiveBuildSystemId: 'previous-build-system',
        };
        const action = {
          type: Actions.SELECT_BUILD_SYSTEM,
          payload: {id: 'new-build-system'},
        };
        const finalState = [action].reduce(Reducers.app, initialState);
        expect(finalState.previousSessionActiveBuildSystemId).toBe(null);
      },
    );

  });

  it('chooses a default activeTaskType if the currently active one goes away', () => {
    const initialState = {
      ...createEmptyAppState(),
      activeBuildSystemId: 'some-build-system',
      activeTaskType: 'bark',
      tasks: [createTask('bark'), createTask('purr')],
    };
    const actions = [
      {
        type: Actions.TASKS_UPDATED,
        payload: {
          tasks: [createTask('purr')],
        },
      },
    ];
    const finalState = actions.reduce(Reducers.app, initialState);
    expect(finalState.activeTaskType).toBe('purr');

    // It should remember the old one so it can be restored.
    expect(finalState.previousSessionActiveTaskType).toBe('bark');
  });

  it('restores the previous task when it comes back', () => {
    const initialState = {
      ...createEmptyAppState(),
      activeBuildSystemId: 'some-build-system',
      activeTaskType: 'purr',
      previousSessionActiveTaskType: 'bark',
      tasks: [createTask('purr')],
    };
    const actions = [
      {
        type: Actions.TASKS_UPDATED,
        payload: {
          tasks: [createTask('bark'), createTask('purr')],
        },
      },
    ];
    const finalState = actions.reduce(Reducers.app, initialState);
    expect(finalState.activeTaskType).toBe('bark');
    expect(finalState.previousSessionActiveTaskType).toBe(null);
  });

});

const createTask = name => ({
  type: name,
  label: name,
  description: name,
  enabled: true,
  icon: 'triangle-right',
});
