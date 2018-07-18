"use strict";

function _reduxObservable() {
  const data = require("../../../../nuclide-commons/redux-observable");

  _reduxObservable = function () {
    return data;
  };

  return data;
}

function Actions() {
  const data = _interopRequireWildcard(require("../lib/redux/Actions"));

  Actions = function () {
    return data;
  };

  return data;
}

function Epics() {
  const data = _interopRequireWildcard(require("../lib/redux/Epics"));

  Epics = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

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
 */
describe('Epics', () => {
  describe('registerOutputProviderEpic', () => {
    it('observes the status', () => {
      const mockStore = {
        dispatch: () => {},
        getState: () => ({})
      };
      let setStatus;
      const provider = {
        id: 'test',
        messages: _RxMin.Observable.never(),
        observeStatus: cb => {
          setStatus = cb;
        },
        start: () => {},
        stop: () => {}
      };
      const actions = new (_reduxObservable().ActionsObservable)(_RxMin.Observable.of(Actions().registerOutputProvider(provider)));
      let results = [];
      Epics().registerRecordProviderEpic(actions, mockStore).subscribe(results.push.bind(results));

      if (!(setStatus != null)) {
        throw new Error("Invariant violation: \"setStatus != null\"");
      }

      setStatus('running');
      setStatus('stopped');
      setStatus('running');
      results = results.filter(action => action.type === Actions().UPDATE_STATUS);
      expect(results.length).toBe(3);
      expect(results.map(action => {
        if (!(action.type === Actions().UPDATE_STATUS)) {
          throw new Error("Invariant violation: \"action.type === Actions.UPDATE_STATUS\"");
        }

        return action.payload.status;
      })).toEqual(['running', 'stopped', 'running']);
    });
  });
});