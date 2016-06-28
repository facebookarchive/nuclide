'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {AppState} from '../lib/types';

import * as ActionTypes from '../lib/ActionTypes';
import Commands from '../lib/Commands';
import invariant from 'assert';
import {Observable} from 'rxjs';

describe('Commands', () => {

  describe('registerOutputProvider', () => {

    it('observes the status', () => {
      const actions = [];
      const getState = () => (({}: any): AppState);
      const observer = {
        next: actions.push.bind(actions),
        error: () => {},
        complete: () => {},
      };
      const commands = new Commands(observer, getState);
      let setStatus;
      const provider = {
        id: 'test',
        messages: Observable.never(),
        observeStatus: cb => { setStatus = cb; },
        start: () => {},
        stop: () => {},
      };
      commands.registerOutputProvider(provider);
      invariant(setStatus != null);
      setStatus('running');
      setStatus('stopped');
      setStatus('running');
      expect(actions.map(action => action.type)).toEqual([
        ActionTypes.PROVIDER_REGISTERED,
        ActionTypes.STATUS_UPDATED,
        ActionTypes.STATUS_UPDATED,
        ActionTypes.STATUS_UPDATED,
      ]);
      expect(actions.slice(1).map(action => action.payload.status))
        .toEqual(['running', 'stopped', 'running']);
    });

  });

});
