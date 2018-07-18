"use strict";

var _RxMin = require("rxjs/bundles/Rx.min.js");

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

function _Epics() {
  const data = require("../lib/redux/Epics");

  _Epics = function () {
    return data;
  };

  return data;
}

function _createStore() {
  const data = _interopRequireDefault(require("../lib/redux/createStore"));

  _createStore = function () {
    return data;
  };

  return data;
}

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
 */
describe('Epics', () => {
  describe('fetchCodeActions', () => {
    const fakeMessageRangeTracker = null;
    const fakeEditor = null;
    const TEST_ACTION = {
      async apply() {},

      dispose() {},

      getTitle: () => Promise.resolve('test')
    };
    const TEST_DIAGNOSTIC = {};
    const fakeMessages = [TEST_DIAGNOSTIC, {}];
    it('fetches code actions for a set of diagnostics', async () => {
      const store = (0, _createStore().default)(fakeMessageRangeTracker);
      store.dispatch(Actions().setCodeActionFetcher({
        async getCodeActionForDiagnostic(editor, message) {
          if (message === TEST_DIAGNOSTIC) {
            return [TEST_ACTION];
          }

          return [];
        }

      }));
      expect((await (0, _Epics().fetchCodeActions)(new (_reduxObservable().ActionsObservable)(_RxMin.Observable.of(Actions().fetchCodeActions(fakeEditor, fakeMessages), // Identical requests should be de-deped.
      Actions().fetchCodeActions(fakeEditor, [...fakeMessages]))), store).toArray().toPromise())).toEqual([Actions().setCodeActions(new Map([[fakeMessages[0], new Map([['test', TEST_ACTION]])], [fakeMessages[1], new Map()]]))]);
    });
  });
});