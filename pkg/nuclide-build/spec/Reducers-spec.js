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
      const buildSystem = new dummy.BuildSystem();
      buildSystem.id = 'previous-build-system';
      buildSystem.name = 'Build System';
      const initialState = {
        ...createEmptyAppState(),
        activeTaskId: {
          type: 'test',
          buildSystemId: 'some-build-system',
        },
        previousSessionActiveTaskId: {
          type: 'other',
          buildSystemId: 'previous-build-system',
        },
      };
      const action = {
        type: Actions.TASKS_UPDATED,
        payload: {
          buildSystemId: 'previous-build-system',
          tasks: [createTask('other')],
        },
      };
      const finalState = [action].reduce(Reducers.app, initialState);
      expect(finalState.activeTaskId)
        .toEqual({buildSystemId: 'previous-build-system', type: 'other'});
    });

  });

});

const createTask = name => ({
  type: name,
  label: name,
  description: name,
  enabled: true,
  icon: 'triangle-right',
});
