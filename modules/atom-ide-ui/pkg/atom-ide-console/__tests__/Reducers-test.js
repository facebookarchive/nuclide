"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createDummyExecutor = createDummyExecutor;

function Actions() {
  const data = _interopRequireWildcard(require("../lib/redux/Actions"));

  Actions = function () {
    return data;
  };

  return data;
}

function _Reducers() {
  const data = _interopRequireDefault(require("../lib/redux/Reducers"));

  _Reducers = function () {
    return data;
  };

  return data;
}

function Immutable() {
  const data = _interopRequireWildcard(require("immutable"));

  Immutable = function () {
    return data;
  };

  return data;
}

function _uuid() {
  const data = _interopRequireDefault(require("uuid"));

  _uuid = function () {
    return data;
  };

  return data;
}

var _rxjsCompatUmdMin = require("rxjs-compat/bundles/rxjs-compat.umd.min.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
const emptyAppState = {
  createPasteFunction: null,
  currentExecutorId: null,
  maxMessageCount: Number.POSITIVE_INFINITY,
  executors: new Map(),
  providers: new Map(),
  providerStatuses: new Map(),
  records: Immutable().List(),
  incompleteRecords: Immutable().List(),
  history: []
};
describe('createStateStream', () => {
  describe('RECORD_RECEIVED', () => {
    let finalState;
    let initialRecords;
    beforeEach(() => {
      initialRecords = Immutable().List();
      const initialState = Object.assign({}, emptyAppState, {
        maxMessageCount: 2,
        records: initialRecords
      });
      const actions = [];

      for (let i = 0; i < 5; i++) {
        actions.push({
          type: Actions().RECORD_RECEIVED,
          payload: {
            record: {
              level: 'info',
              text: i.toString()
            }
          }
        });
      }

      finalState = actions.reduce(_Reducers().default, initialState);
    });
    it('adds records', () => {
      expect(finalState.records.size).toBeGreaterThan(0);
    });
    it('truncates the record list using `maxMessageCount`', () => {
      expect(finalState.records.size).toBe(2);
    });
    it('truncates the least recent records', () => {
      expect(finalState.records.map(record => record.text).toArray()).toEqual(['3', '4']);
    });
    it("doesn't mutate the original records list", () => {
      expect(initialRecords.size).toBe(0);
    });
  });
  describe('RECORD_UPDATED', () => {
    let finalState;
    let initialRecords;
    let messageIds = [];
    beforeEach(() => {
      messageIds = [];
      initialRecords = Immutable().List();
      const initialState = Object.assign({}, emptyAppState, {
        maxMessageCount: 2,
        records: initialRecords
      });
      const actions = [];

      for (let i = 0; i < 2; i++) {
        messageIds[i] = _uuid().default.v4();
        actions.push({
          type: Actions().RECORD_RECEIVED,
          payload: {
            record: {
              level: 'info',
              text: i.toString(),
              incomplete: true,
              messageId: messageIds[i]
            }
          }
        });
      } // Check that appending updates the text on the correct record
      // and doesn't modify others.


      actions.push({
        type: Actions().RECORD_UPDATED,
        payload: {
          messageId: messageIds[0],
          appendText: '!',
          overrideLevel: 'warning',
          setComplete: false
        }
      }); // Appending twice updates the record correctly.

      actions.push({
        type: Actions().RECORD_UPDATED,
        payload: {
          messageId: messageIds[0],
          appendText: '!',
          overrideLevel: 'warning',
          setComplete: false
        }
      });
      finalState = actions.reduce(_Reducers().default, initialState);
    });
    it('Updates incomplete records test and level correctly', () => {
      expect(finalState.records.size).toBe(0);
      expect(finalState.incompleteRecords.size).toBe(2);
      const message0 = finalState.incompleteRecords.get(0);

      if (!(message0 != null)) {
        throw new Error("Invariant violation: \"message0 != null\"");
      }

      expect(message0.messageId).toBe(messageIds[0]);
      expect(message0.text).toBe('0!!');
      expect(message0.level).toBe('warning');
      expect(message0.incomplete).toBe(true); // Message 1 was not mutated.

      const message1 = finalState.incompleteRecords.get(1);

      if (!(message1 != null)) {
        throw new Error("Invariant violation: \"message1 != null\"");
      }

      expect(message1.messageId).toBe(messageIds[1]);
      expect(message1.text).toBe('1');
      expect(message1.level).toBe('info');
      expect(message1.incomplete).toBe(true);
    });
    it('Completes the records', () => {
      let newState = [{
        type: Actions().RECORD_UPDATED,
        payload: {
          messageId: messageIds[0],
          appendText: null,
          overrideLevel: null,
          setComplete: true
        }
      }].reduce(_Reducers().default, finalState);
      let message0 = newState.records.get(0);
      let message1 = newState.incompleteRecords.get(0);

      const verify = () => {
        expect(newState.records.size).toBe(1);
        expect(newState.incompleteRecords.size).toBe(1);

        if (!(message0 != null)) {
          throw new Error("Invariant violation: \"message0 != null\"");
        }

        expect(message0.messageId).toBe(messageIds[0]);
        expect(message0.text).toBe('0!!');
        expect(message0.level).toBe('warning');
        expect(message0.incomplete).toBe(false);

        if (!(message1 != null)) {
          throw new Error("Invariant violation: \"message1 != null\"");
        }

        expect(message1.messageId).toBe(messageIds[1]);
        expect(message1.text).toBe('1');
        expect(message1.level).toBe('info');
        expect(message1.incomplete).toBe(true);
      };

      verify(); // Attempting to update a completed message throws and doesn't
      // change the state.

      let thrown = false;

      try {
        newState = [{
          type: Actions().RECORD_UPDATED,
          payload: {
            messageId: messageIds[0],
            appendText: '!',
            overrideLevel: null,
            setComplete: true
          }
        }].reduce(_Reducers().default, newState);
      } catch (_) {
        thrown = true;
      }

      expect(thrown).toBe(true);
      message0 = newState.records.get(0);
      message1 = newState.incompleteRecords.get(0);
      verify();
    });
  });
  describe('REGISTER_SOURCE', () => {
    let initialProviders;
    let finalState;
    beforeEach(() => {
      initialProviders = new Map();
      const initialState = Object.assign({}, emptyAppState, {
        providers: initialProviders
      });
      const actions = [{
        type: Actions().REGISTER_SOURCE,
        payload: {
          source: {
            id: 'test',
            records: _rxjsCompatUmdMin.Observable.empty()
          }
        }
      }];
      finalState = actions.reduce(_Reducers().default, initialState);
    });
    it('adds providers to the registry', () => {
      expect(finalState.providers.size).toBe(1);
    });
    it("doesn't mutate the original provider map", () => {
      expect(initialProviders.size).toBe(0);
    });
  });
  describe('CLEAR_RECORDS', () => {
    let initialRecords;
    let finalState;
    beforeEach(() => {
      initialRecords = Immutable().List([{
        kind: 'message',
        sourceId: 'test-source',
        sourceName: 'Test',
        level: 'info',
        text: 'test',
        scopeName: null,
        timestamp: new Date('2017-01-01T12:34:56.789Z'),
        data: null,
        repeatCount: 1,
        incomplete: false
      }]);
      const initialState = Object.assign({}, emptyAppState, {
        records: initialRecords
      });
      const actions = [{
        type: Actions().CLEAR_RECORDS
      }];
      finalState = actions.reduce(_Reducers().default, initialState);
    });
    it('clears the records', () => {
      expect(finalState.records.size).toBe(0);
    });
    it("doesn't mutate the original records list", () => {
      expect(initialRecords.size).toBe(1);
    });
  });
  describe('executor registration', () => {
    let dummyExecutor;
    let initialExecutors;
    let initialState;
    let finalState;
    beforeEach(() => {
      dummyExecutor = createDummyExecutor('a');
      initialExecutors = new Map([['a', dummyExecutor]]);
      initialState = Object.assign({}, emptyAppState, {
        executors: initialExecutors
      });
    });
    describe('REGISTER_EXECUTOR', () => {
      beforeEach(() => {
        const actions = [{
          type: Actions().REGISTER_EXECUTOR,
          payload: {
            executor: createDummyExecutor('b')
          }
        }];
        finalState = actions.reduce(_Reducers().default, initialState);
      });
      it('adds an executor', () => {
        expect(finalState.executors.size).toBe(2);
      });
      it("doesn't mutate the original executor map", () => {
        expect(initialExecutors.size).toBe(1);
      });
    });
    describe('unregisterExecutor', () => {
      beforeEach(() => {
        const actions = [Actions().unregisterExecutor(dummyExecutor)];
        finalState = actions.reduce(_Reducers().default, initialState);
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

function createDummyExecutor(id) {
  return {
    id,
    name: id,
    scopeName: () => 'text.plain',
    send: code => {},
    output: _rxjsCompatUmdMin.Observable.create(observer => {})
  };
}