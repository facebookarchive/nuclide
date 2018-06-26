'use strict';

var _Actions;

function _load_Actions() {
  return _Actions = _interopRequireWildcard(require('../lib/redux/Actions'));
}

var _Reducers;

function _load_Reducers() {
  return _Reducers = require('../lib/redux/Reducers');
}

var _dummy;

function _load_dummy() {
  return _dummy = _interopRequireWildcard(require('../__mocks__/dummy'));
}

var _immutable;

function _load_immutable() {
  return _immutable = _interopRequireWildcard(require('immutable'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

describe('Reducers', () => {
  describe('consolesForTaskRunners', () => {
    describe('SET_CONSOLES_FOR_TASK_RUNNERS', () => {
      it('disposes all previously created consoles', () => {
        const oldConsole = createMockConsole();
        const newConsole1 = createMockConsole();
        const newConsole2 = createMockConsole();
        const oldState = (_immutable || _load_immutable()).Map([[new (_dummy || _load_dummy()).TaskRunner(), oldConsole]]);
        const newState = (0, (_Reducers || _load_Reducers()).consolesForTaskRunners)(oldState, (_Actions || _load_Actions()).setConsolesForTaskRunners((_immutable || _load_immutable()).Map([[new (_dummy || _load_dummy()).TaskRunner(), newConsole1], [new (_dummy || _load_dummy()).TaskRunner(), newConsole2]])));
        expect(newState).not.toBe(oldState);
        expect(newState.count()).toEqual(2);
        expect(consoleIsDisposed(oldConsole)).toEqual(true);
      });
    });
    describe('SET_CONSOLE_SERVICE', () => {
      it('simply clears the created consoles', () => {
        const mockConsole = createMockConsole();
        const oldState = (_immutable || _load_immutable()).Map([[new (_dummy || _load_dummy()).TaskRunner(), mockConsole]]);
        const newState = (0, (_Reducers || _load_Reducers()).consolesForTaskRunners)(oldState, (_Actions || _load_Actions()).setConsoleService(null));
        expect(newState).not.toBe(oldState);
        expect(newState.count()).toEqual(0);
        expect(consoleIsDisposed(mockConsole)).toEqual(true);
      });
    });
    describe('ADD_CONSOLE_FOR_TASK_RUNNER', () => {
      it("adds a new console, but doesn't touch the previous ones", () => {
        const oldConsole = createMockConsole();
        const newConsole = createMockConsole();
        const oldState = (_immutable || _load_immutable()).Map([[new (_dummy || _load_dummy()).TaskRunner(), oldConsole]]);
        const newState = (0, (_Reducers || _load_Reducers()).consolesForTaskRunners)(oldState, (_Actions || _load_Actions()).addConsoleForTaskRunner(new (_dummy || _load_dummy()).TaskRunner(), newConsole));
        expect(newState).not.toBe(oldState);
        expect(newState.count()).toEqual(2);
        expect(consoleIsDisposed(oldConsole)).toEqual(false);
      });
    });
    describe('REMOVE_CONSOLE_FOR_TASK_RUNNER', () => {
      it('removes and disposes the console', () => {
        const mockConsole = createMockConsole();
        const taskRunner = new (_dummy || _load_dummy()).TaskRunner();
        const oldState = (_immutable || _load_immutable()).Map([[taskRunner, mockConsole]]);
        const newState = (0, (_Reducers || _load_Reducers()).consolesForTaskRunners)(oldState, (_Actions || _load_Actions()).removeConsoleForTaskRunner(taskRunner));
        expect(newState).not.toBe(oldState);
        expect(newState.count()).toEqual(0);
        expect(consoleIsDisposed(mockConsole)).toEqual(true);
      });
    });
  });
}); /**
     * Copyright (c) 2015-present, Facebook, Inc.
     * All rights reserved.
     *
     * This source code is licensed under the license found in the LICENSE file in
     * the root directory of this source tree.
     *
     * 
     * @format
     */

function createMockConsole() {
  let disposed = false;
  return {
    isDisposed: () => disposed,
    dispose: () => {
      disposed = true;
    }
  };
}

function consoleIsDisposed(consoleApi) {
  return consoleApi.isDisposed();
}