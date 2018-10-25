"use strict";

function Actions() {
  const data = _interopRequireWildcard(require("../lib/redux/Actions"));

  Actions = function () {
    return data;
  };

  return data;
}

function _Reducers() {
  const data = require("../lib/redux/Reducers");

  _Reducers = function () {
    return data;
  };

  return data;
}

function dummy() {
  const data = _interopRequireWildcard(require("../__mocks__/dummy"));

  dummy = function () {
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

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 * @emails oncall+nuclide
 */
describe('Reducers', () => {
  describe('consolesForTaskRunners', () => {
    describe('SET_CONSOLES_FOR_TASK_RUNNERS', () => {
      it('disposes all previously created consoles', () => {
        const oldConsole = createMockConsole();
        const newConsole1 = createMockConsole();
        const newConsole2 = createMockConsole();
        const oldState = Immutable().Map([[new (dummy().TaskRunner)(), oldConsole]]);
        const newState = (0, _Reducers().consolesForTaskRunners)(oldState, Actions().setConsolesForTaskRunners(Immutable().Map([[new (dummy().TaskRunner)(), newConsole1], [new (dummy().TaskRunner)(), newConsole2]])));
        expect(newState).not.toBe(oldState);
        expect(newState.count()).toEqual(2);
        expect(consoleIsDisposed(oldConsole)).toEqual(true);
      });
    });
    describe('SET_CONSOLE_SERVICE', () => {
      it('simply clears the created consoles', () => {
        const mockConsole = createMockConsole();
        const oldState = Immutable().Map([[new (dummy().TaskRunner)(), mockConsole]]);
        const newState = (0, _Reducers().consolesForTaskRunners)(oldState, Actions().setConsoleService(null));
        expect(newState).not.toBe(oldState);
        expect(newState.count()).toEqual(0);
        expect(consoleIsDisposed(mockConsole)).toEqual(true);
      });
    });
    describe('ADD_CONSOLE_FOR_TASK_RUNNER', () => {
      it("adds a new console, but doesn't touch the previous ones", () => {
        const oldConsole = createMockConsole();
        const newConsole = createMockConsole();
        const oldState = Immutable().Map([[new (dummy().TaskRunner)(), oldConsole]]);
        const newState = (0, _Reducers().consolesForTaskRunners)(oldState, Actions().addConsoleForTaskRunner(new (dummy().TaskRunner)(), newConsole));
        expect(newState).not.toBe(oldState);
        expect(newState.count()).toEqual(2);
        expect(consoleIsDisposed(oldConsole)).toEqual(false);
      });
    });
    describe('REMOVE_CONSOLE_FOR_TASK_RUNNER', () => {
      it('removes and disposes the console', () => {
        const mockConsole = createMockConsole();
        const taskRunner = new (dummy().TaskRunner)();
        const oldState = Immutable().Map([[taskRunner, mockConsole]]);
        const newState = (0, _Reducers().consolesForTaskRunners)(oldState, Actions().removeConsoleForTaskRunner(taskRunner));
        expect(newState).not.toBe(oldState);
        expect(newState.count()).toEqual(0);
        expect(consoleIsDisposed(mockConsole)).toEqual(true);
      });
    });
  });
});

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