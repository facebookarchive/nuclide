'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {
  RefactorProvider,
  AvailableRefactoring,
  RefactorRequest,
  RefactorResponse,
  RenameRefactoring,
  RenameRequest,
} from '..';
import type {
  Store,
  RefactorState,
} from '../lib/types';

import {Observable, BehaviorSubject} from 'rxjs';
import {Range} from 'atom';

import ProviderRegistry from '../../commons-atom/ProviderRegistry';
import nuclideUri from '../../commons-node/nuclideUri';
import {expectObservableToStartWith} from '../../nuclide-test-helpers';

import {getStore} from '../lib/refactorStore';
import * as Actions from '../lib/refactorActions';

// This tests the integration of the reducers and epics
describe('refactorStore', () => {
  let store: Store = (null: any);
  let providers: ProviderRegistry<RefactorProvider> = (null: any);
  let stateStream: Observable<RefactorState>;
  let currentState: BehaviorSubject<RefactorState>;

  let provider: RefactorProvider = (null: any);
  let refactoringsAtPointReturn: Promise<Array<AvailableRefactoring>> = (null: any);
  let refactorReturn: Promise<?RefactorResponse> = (null: any);

  const waitForPhase = (phaseType: string) => {
    return currentState
      .filter(s => {
        return s.type === 'open' && s.phase.type === phaseType;
      })
      .first()
      .toPromise();
  };

  const waitForClose = () => {
    return currentState
      .filter(s => s.type === 'closed')
      .first()
      .toPromise();
  };

  beforeEach(() => {
    provider = {
      grammarScopes: ['text.plain', 'text.plain.null-grammar'],
      priority: 1,
      refactoringsAtPoint(
        editor: atom$TextEditor,
        point: atom$Point,
      ): Promise<Array<AvailableRefactoring>> {
        return refactoringsAtPointReturn;
      },
      refactor(request: RefactorRequest): Promise<?RefactorResponse> {
        return refactorReturn;
      },
    };
    // TODO spy on the provider and call through
    refactoringsAtPointReturn = Promise.resolve([]);
    refactorReturn = Promise.resolve(null);

    providers = new ProviderRegistry();
    store = getStore(providers);
    // $FlowIssue no symbol support
    const stream: Observable<RefactorState> = Observable.from(store);
    stateStream = stream
      // Filter out duplicate states. This happens during error handling, for example.
      .distinctUntilChanged()
      // publishReplay() and connect means it will
      .publishReplay();
    stateStream.connect();
    // stateStream will replay, but it's also useful to be able to wait for particular states before
    // proceeding.
    currentState = new BehaviorSubject(store.getState());
    stateStream.subscribe(currentState);
  });

  it('starts closed', () => {
    expect(store.getState()).toEqual({type: 'closed'});
  });

  it('handles a missing editor', () => {
    waitsForPromise(async () => {
      store.dispatch(Actions.open());
      await expectObservableToStartWith(stateStream, [
        {type: 'closed'},
        {
          type: 'open',
          phase: {type: 'get-refactorings'},
        },
        {type: 'closed'},
      ]);
    });
  });

  describe('with an open text editor', () => {
    let openEditor: atom$TextEditor = (null: any);
    beforeEach(() => {
      waitsForPromise(async () => {
        openEditor = await atom.workspace.open(TEST_FILE);
      });
    });
    it('handles a missing provider', () => {
      waitsForPromise(async () => {
        store.dispatch(Actions.open());
        await expectObservableToStartWith(stateStream, [
          {type: 'closed'},
          {
            type: 'open',
            phase: {type: 'get-refactorings'},
          },
          {type: 'closed'},
        ]);
      });
    });

    describe('with an available provider', () => {
      beforeEach(() => {
        providers.addProvider(provider);
      });

      it('runs the refactor', () => {
        waitsForPromise(async () => {
          refactoringsAtPointReturn = Promise.resolve([
            TEST_FILE_RENAME,
          ]);
          refactorReturn = Promise.resolve({
            edits: new Map([[TEST_FILE, TEST_FILE_EDITS]]),
          });

          store.dispatch(Actions.open());
          await waitForPhase('pick');
          store.dispatch(Actions.pickedRefactor(TEST_FILE_RENAME));
          await waitForPhase('rename');
          const rename: RenameRequest = {
            kind: 'rename',
            symbolAtPoint: TEST_FILE_SYMBOL_AT_POINT,
            editor: openEditor,
            newName: 'bar',
          };
          store.dispatch(Actions.execute(provider, rename));
          await waitForClose();
          expect(openEditor.getText()).toEqual('bar\nbar\nbar\n');
        });
      });
    });
  });
});

// This is all just dummy data, so I'm keeping it down here to avoid drawing attention to it over
// the important test logic.
const TEST_FILE = nuclideUri.join(__dirname, 'fixtures', 'refactor-fixture.txt');
const TEST_FILE_SYMBOL_AT_POINT = {
  text: 'foo',
  range: new Range([0, 0], [0, 3]),
};
const TEST_FILE_RENAME: RenameRefactoring = {
  kind: 'rename',
  symbolAtPoint: TEST_FILE_SYMBOL_AT_POINT,
};
const TEST_FILE_EDITS = [
  {
    oldRange: new Range([0, 0], [0, 3]),
    oldText: 'foo',
    newText: 'bar',
  },
  {
    oldRange: new Range([2, 0], [2, 3]),
    oldText: 'foo',
    newText: 'bar',
  },
];
