"use strict";

var _RxMin = require("rxjs/bundles/Rx.min.js");

var _atom = require("atom");

function _ProviderRegistry() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons-atom/ProviderRegistry"));

  _ProviderRegistry = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _promise() {
  const data = require("../../../../nuclide-commons/promise");

  _promise = function () {
    return data;
  };

  return data;
}

function _testHelpers() {
  const data = require("../../../../nuclide-commons/test-helpers");

  _testHelpers = function () {
    return data;
  };

  return data;
}

function _refactorStore() {
  const data = require("../lib/refactorStore");

  _refactorStore = function () {
    return data;
  };

  return data;
}

function Actions() {
  const data = _interopRequireWildcard(require("../lib/refactorActions"));

  Actions = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 * @emails oncall+nuclide
 */
// sentinel value
const NO_ERROR = {}; // This tests the integration of the reducers and epics

describe('refactorStore', () => {
  let store = null;
  let providers = null;
  let stateStream;
  let currentState;
  let provider = null;
  let refactoringsAtPointReturn = null;
  let refactorReturn = null;
  let renameReturn;
  let lastError = null;

  function expectNoUncaughtErrors() {
    // expect(lastError).toBe(NO_ERROR) results in 'obj.hasOwnProperty is not a function' in some
    // cases...
    expect(lastError === NO_ERROR).toBeTruthy();
  }

  let errorSubscription = null;

  const waitForPhase = phaseType => {
    return currentState.filter(s => {
      return s.type === 'open' && s.phase.type === phaseType;
    }).first().toPromise();
  };

  const waitForClose = () => {
    return currentState.filter(s => s.type === 'closed').first().toPromise();
  };

  beforeEach(() => {
    lastError = NO_ERROR;
    errorSubscription = (0, _refactorStore().getErrors)().subscribe(error => {
      lastError = error;
    });
    provider = {
      grammarScopes: ['text.plain', 'text.plain.null-grammar'],
      priority: 1,

      refactorings(editor, range) {
        return refactoringsAtPointReturn;
      },

      refactor(request) {
        return refactorReturn;
      },

      rename(editor, position, newName) {
        return renameReturn;
      }

    }; // TODO spy on the provider and call through

    refactoringsAtPointReturn = Promise.resolve([]);
    refactorReturn = _RxMin.Observable.empty();
    renameReturn = Promise.resolve();
    providers = new (_ProviderRegistry().default)();
    store = (0, _refactorStore().getStore)(providers); // $FlowIssue no symbol support

    const stream = _RxMin.Observable.from(store);

    stateStream = stream // Filter out duplicate states. This happens during error handling, for example.
    .distinctUntilChanged() // publishReplay() and connect means it will
    .publishReplay();
    stateStream.connect(); // stateStream will replay, but it's also useful to be able to wait for particular states before
    // proceeding.

    currentState = new _RxMin.BehaviorSubject(store.getState());
    stateStream.subscribe(currentState);
  });
  afterEach(() => {
    errorSubscription.unsubscribe();
  });
  it('starts closed', () => {
    expect(store.getState()).toEqual({
      type: 'closed'
    });
  });
  it('handles a missing editor', async () => {
    store.dispatch(Actions().open('generic'));
    await (0, _testHelpers().expectObservableToStartWith)(stateStream, [{
      type: 'closed'
    }, {
      type: 'open',
      ui: 'generic',
      phase: {
        type: 'get-refactorings'
      }
    }, {
      type: 'closed'
    }]);
  });
  describe('with an open text editor', () => {
    let openEditor = null;
    beforeEach(async () => {
      openEditor = await atom.workspace.open(TEST_FILE);
    });
    it('handles a missing provider', async () => {
      store.dispatch(Actions().open('generic'));
      await (0, _testHelpers().expectObservableToStartWith)(stateStream, [{
        type: 'closed'
      }, {
        type: 'open',
        ui: 'generic',
        phase: {
          type: 'get-refactorings'
        }
      }, {
        type: 'closed'
      }]);
    });
    describe('with an available provider', () => {
      beforeEach(() => {
        providers.addProvider(provider);
      });
      it('runs the refactor', async () => {
        refactorReturn = _RxMin.Observable.of({
          type: 'edit',
          edits: new Map([[TEST_FILE, TEST_FILE_EDITS]])
        });
        const displayRenameRequest = [openEditor, provider, TEST_FILE_SELECTED_TEXT, TEST_FILE_MOUNT_POINT, TEST_FILE_SYMBOL_POINT];
        store.dispatch(Actions().displayRename(...displayRenameRequest));
        await waitForPhase('rename');
        const rename = {
          kind: 'rename',
          position: TEST_FILE_SYMBOL_POINT,
          editor: openEditor,
          newName: 'bar'
        };
        store.dispatch(Actions().execute(provider, rename));
        await waitForClose();
        expect(openEditor.getText()).toEqual('bar\nbar\nbar\n');
      });
      it('does not allow refactoring of an unsaved file', async () => {
        await atom.workspace.open();
        store.dispatch(Actions().open('generic'));
        await (0, _testHelpers().expectObservableToStartWith)(stateStream, [{
          type: 'closed'
        }, {
          type: 'open',
          ui: 'generic',
          phase: {
            type: 'get-refactorings'
          }
        }, {
          type: 'closed'
        }]);
        await (0, _promise().nextTick)();
        expectNoUncaughtErrors();
      });
      it('tolerates a provider returning available refactorings after a close action', async () => {
        const deferred = new (_promise().Deferred)();
        refactoringsAtPointReturn = deferred.promise;
        store.dispatch(Actions().open('generic'));
        await waitForPhase('get-refactorings');
        store.dispatch(Actions().close());
        await waitForClose();
        deferred.resolve([]);
        await (0, _promise().nextTick)();
        expectNoUncaughtErrors();
      });
      it('tolerates a provider returning refactor results after a close action', async () => {
        const deferred = new _RxMin.Subject();
        refactorReturn = deferred;
        const displayRenameRequest = [openEditor, provider, TEST_FILE_SELECTED_TEXT, TEST_FILE_MOUNT_POINT, TEST_FILE_SYMBOL_POINT];
        store.dispatch(Actions().displayRename(...displayRenameRequest));
        await waitForPhase('rename');
        const rename = {
          kind: 'rename',
          position: TEST_FILE_SYMBOL_POINT,
          editor: openEditor,
          newName: 'bar'
        };
        store.dispatch(Actions().execute(provider, rename));
        await waitForPhase('execute');
        store.dispatch(Actions().close());
        await waitForClose();
        deferred.next({
          type: 'edit',
          edits: new Map([[TEST_FILE, TEST_FILE_EDITS]])
        });
        await (0, _promise().nextTick)();
        expectNoUncaughtErrors();
      }); // TODO also test the method actually throwing, as well as returning a rejected promise.

      it('tolerates a provider throwing in refactoringsAtPoint', async () => {
        refactoringsAtPointReturn = Promise.reject(new Error());
        store.dispatch(Actions().open('generic'));
        await waitForPhase('get-refactorings');
        await waitForClose();
        await (0, _promise().nextTick)();
        expectNoUncaughtErrors();
      }); // TODO also test the method actually throwing, as well as returning a rejected promise.

      it('tolerates a provider throwing in refactor', async () => {
        refactorReturn = _RxMin.Observable.throw(new Error());
        const displayRenameRequest = [openEditor, provider, TEST_FILE_SELECTED_TEXT, TEST_FILE_MOUNT_POINT, TEST_FILE_SYMBOL_POINT];
        store.dispatch(Actions().displayRename(...displayRenameRequest));
        await waitForPhase('rename');
        const rename = {
          kind: 'rename',
          position: TEST_FILE_SYMBOL_POINT,
          editor: openEditor,
          newName: 'bar'
        };
        store.dispatch(Actions().execute(provider, rename));
        await waitForClose();
        await (0, _promise().nextTick)();
        expectNoUncaughtErrors();
      });
      it('tolerates a provider returning empty from refactor', async () => {
        refactorReturn = _RxMin.Observable.empty();
        const displayRenameRequest = [openEditor, provider, TEST_FILE_SELECTED_TEXT, TEST_FILE_MOUNT_POINT, TEST_FILE_SYMBOL_POINT];
        store.dispatch(Actions().displayRename(...displayRenameRequest));
        await waitForPhase('rename');
        const rename = {
          kind: 'rename',
          position: TEST_FILE_SYMBOL_POINT,
          editor: openEditor,
          newName: 'bar'
        };
        store.dispatch(Actions().execute(provider, rename));
        await waitForClose();
        await (0, _promise().nextTick)();
        expectNoUncaughtErrors();
      });
      it('fails gracefully when the edits do not apply', async () => {
        const edits = [{
          oldRange: new _atom.Range([0, 0], [0, 3]),
          // intentionally not 'foo' in order to trigger a conflict when we attempt to apply this
          // edit.
          oldText: 'foz',
          newText: 'bar'
        }];
        refactorReturn = _RxMin.Observable.of({
          type: 'edit',
          edits: new Map([[TEST_FILE, edits]])
        });
        const displayRenameRequest = [openEditor, provider, TEST_FILE_SELECTED_TEXT, TEST_FILE_MOUNT_POINT, TEST_FILE_SYMBOL_POINT];
        store.dispatch(Actions().displayRename(...displayRenameRequest));
        await waitForPhase('rename');
        const rename = {
          kind: 'rename',
          position: TEST_FILE_SYMBOL_POINT,
          editor: openEditor,
          newName: 'bar'
        };
        store.dispatch(Actions().execute(provider, rename)); // TODO should display an error somewhere

        await waitForClose();
        expect(openEditor.getText()).toEqual('foo\nbar\nfoo\n'); // TODO test this with multiple files. it will become much more complex. We need to make
        // sure that we can apply the entire refactoring transactionally. this means if something
        // goes wrong we need to roll back the rest.

        await (0, _promise().nextTick)();
        expectNoUncaughtErrors();
      });
    });
    describe('with a freeform provider', () => {
      const refactoring = {
        kind: 'freeform',
        id: 'asyncify',
        name: 'Asyncify',
        description: 'Convert this method to async',
        range: new _atom.Range([0, 0], [0, 0]),
        arguments: [{
          description: 'New name for method',
          name: 'new_name',
          type: 'string',
          default: 'genKittensAndRainbows'
        }]
      };
      beforeEach(() => {
        provider = {
          priority: 1,
          grammarScopes: ['text.plain', 'text.plain.null-grammar'],

          async refactorings() {
            return [refactoring];
          },

          refactor(request) {
            if (!(request.kind === 'freeform')) {
              throw new Error("Invariant violation: \"request.kind === 'freeform'\"");
            }

            const edits = [{
              oldRange: new _atom.Range([0, 0], [0, 3]),
              oldText: 'foo',
              newText: String(request.arguments.get('new_name'))
            }];
            return _RxMin.Observable.of({
              type: 'edit',
              edits: new Map([[TEST_FILE, edits]])
            });
          }

        };
        providers.addProvider(provider);
      });
      it('runs the refactor', async () => {
        store.dispatch(Actions().open('generic'));
        await waitForPhase('pick');
        store.dispatch(Actions().pickedRefactor(refactoring));
        await waitForPhase('freeform');
        const state = store.getState();

        if (!(state.type === 'open')) {
          throw new Error("Invariant violation: \"state.type === 'open'\"");
        }

        if (!(state.phase.type === 'freeform')) {
          throw new Error("Invariant violation: \"state.phase.type === 'freeform'\"");
        }

        expect(state.phase.refactoring).toEqual(refactoring);
        const asyncify = {
          kind: 'freeform',
          originalRange: new _atom.Range(TEST_FILE_SYMBOL_POINT, TEST_FILE_SYMBOL_POINT),
          editor: openEditor,
          id: 'asyncify',
          range: new _atom.Range([0, 0], [0, 0]),
          arguments: new Map([['new_name', 'test']])
        };
        store.dispatch(Actions().execute(provider, asyncify));
        await waitForClose();
        expect(openEditor.getText()).toEqual('test\nbar\nfoo\n');
      });
    });
  });
}); // This is all just dummy data, so I'm keeping it down here to avoid drawing attention to it over
// the important test logic.

const TEST_FILE = _nuclideUri().default.join(__dirname, '../__mocks__/fixtures', 'refactor-fixture.txt');

const TEST_FILE_SELECTED_TEXT = 'foo';
const TEST_FILE_MOUNT_POINT = new _atom.Point(0, 0);
const TEST_FILE_SYMBOL_POINT = new _atom.Point(0, 1);
const TEST_FILE_EDITS = [{
  oldRange: new _atom.Range([0, 0], [0, 3]),
  oldText: TEST_FILE_SELECTED_TEXT,
  newText: 'bar'
}, {
  oldRange: new _atom.Range([2, 0], [2, 3]),
  oldText: TEST_FILE_SELECTED_TEXT,
  newText: 'bar'
}];