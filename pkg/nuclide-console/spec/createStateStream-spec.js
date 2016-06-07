'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Executor} from '../lib/types';

import * as ActionTypes from '../lib/ActionTypes';
import createStateStream from '../lib/createStateStream';
import Rx from 'rxjs';

const emptyAppState = {
  currentExecutorId: null,
  maxMessageCount: Number.POSITIVE_INFINITY,
  executors: new Map(),
  providers: new Map(),
  providerSubscriptions: new Map(),
  records: [],
};

describe('createStateStream', () => {

  describe('MESSAGE_RECEIVED', () => {
    let finalState;
    let initialRecords;

    beforeEach(() => {
      waitsForPromise(async () => {
        initialRecords = [];
        const initialState = {
          ...emptyAppState,
          maxMessageCount: 2,
          records: initialRecords,
        };
        const action$ = new Rx.Subject();
        const state$ = createStateStream(action$, initialState).publishLast();
        state$.connect();
        for (let i = 0; i < 5; i++) {
          action$.next({
            type: ActionTypes.MESSAGE_RECEIVED,
            payload: {
              record: {
                level: 'info',
                text: i.toString(),
              },
            },
          });
        }
        action$.complete();
        finalState = await state$.toPromise();
      });
    });

    it('adds records', () => {
      expect(finalState.records.length).toBeGreaterThan(0);
    });

    it('truncates the record list using `maxMessageCount`', () => {
      expect(finalState.records.length).toBe(2);
    });

    it('truncates the least recent records', () => {
      expect(finalState.records.map(record => record.text))
        .toEqual(['3', '4']);
    });

    it("doesn't mutate the original records list", () => {
      expect(initialRecords.length).toBe(0);
    });

  });

  describe('PROVIDER_REGISTERED', () => {
    let initialProviders;
    let finalState;

    beforeEach(() => {
      waitsForPromise(async () => {
        initialProviders = new Map();
        const initialState = {
          ...emptyAppState,
          providers: initialProviders,
        };
        const action$ = new Rx.Subject();
        const state$ = createStateStream(action$, initialState).publishLast();
        state$.connect();
        action$.next({
          type: ActionTypes.PROVIDER_REGISTERED,
          payload: {
            recordProvider: {
              sourceId: 'test',
              records: Rx.Observable.empty(),
            },
          },
        });
        action$.complete();
        finalState = await state$.toPromise();
      });
    });

    it('adds providers to the registry', () => {
      expect(finalState.providers.size).toBe(1);
    });

    it("doesn't mutate the original provider map", () => {
      expect(initialProviders.size).toBe(0);
    });

  });

  describe('RECORDS_CLEARED', () => {
    let initialRecords;
    let finalState;

    beforeEach(() => {
      waitsForPromise(async () => {
        initialRecords = [{
          kind: 'message',
          sourceId: 'Test',
          level: 'info',
          text: 'test',
          scopeName: null,
          result: null,
        }];
        const initialState = {
          ...emptyAppState,
          records: initialRecords,
        };
        const action$ = new Rx.Subject();
        const state$ = createStateStream(action$, initialState).publishLast();
        state$.connect();
        action$.next({
          type: ActionTypes.RECORDS_CLEARED,
        });
        action$.complete();
        finalState = await state$.toPromise();
      });
    });

    it('clears the records', () => {
      expect(finalState.records.length).toBe(0);
    });

    it("doesn't mutate the original records list", () => {
      expect(initialRecords.length).toBe(1);
    });

  });

  describe('executor registration', () => {
    let initialExecutors;
    let finalState;
    let action$;
    let state$;

    beforeEach(() => {
      initialExecutors = new Map([['a', createDummyExecutor('a')]]);
      const initialState = {
        ...emptyAppState,
        executors: initialExecutors,
      };
      action$ = new Rx.Subject();
      state$ = createStateStream(action$, initialState).publishLast();
      state$.connect();
    });

    describe('REGISTER_EXECUTOR', () => {

      beforeEach(() => {
        waitsForPromise(async () => {
          action$.next({
            type: ActionTypes.REGISTER_EXECUTOR,
            payload: {
              executor: createDummyExecutor('b'),
            },
          });
          action$.complete();
          finalState = await state$.toPromise();
        });
      });

      it('adds an executor', () => {
        expect(finalState.executors.size).toBe(2);
      });

      it("doesn't mutate the original executor map", () => {
        expect(initialExecutors.size).toBe(1);
      });

    });

    describe('UNREGISTER_EXECUTOR', () => {

      beforeEach(() => {
        waitsForPromise(async () => {
          action$.next({
            type: ActionTypes.UNREGISTER_EXECUTOR,
            payload: {
              executor: initialExecutors.get('a'),
            },
          });
          action$.complete();
          finalState = await state$.toPromise();
        });
      });


      it('removes an executor', () => {
        expect(finalState.executors.size).toBe(0);
      });

      it("doesn't mutate the original executor map", () => {
        expect(initialExecutors.size).toBe(1);
      });

    });

  });

});

function createDummyExecutor(id: string): Executor {
  return {
    id,
    name: id,
    send: (code: string) => {},
    output: Rx.Observable.create(observer => {}),
  };
}
