"use strict";

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _reduxObservable() {
  const data = require("../../../modules/nuclide-commons/redux-observable");

  _reduxObservable = function () {
    return data;
  };

  return data;
}

function BuckBase() {
  const data = _interopRequireWildcard(require("../../nuclide-buck-base"));

  BuckBase = function () {
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
const mockPlatformService = {
  getPlatformGroups(buckRoot, ruleType, buildTarget) {
    return null;
  }

};
const mockStore = {
  dispatch(action) {},

  getState() {
    return {
      buckRoot: '/test',
      buildTarget: 'test',
      selectedDevice: {
        udid: 'two',
        flavor: 'chocolate'
      },
      platformService: mockPlatformService
    };
  }

};
describe('setProjectRootEpic', () => {
  it('Sets the Buck root to null for null projects', async () => {
    const stream = await (0, _Epics().setProjectRootEpic)(new (_reduxObservable().ActionsObservable)(_RxMin.Observable.of(Actions().setProjectRoot(null))), mockStore).toArray().toPromise();
    expect(stream).toEqual([{
      type: Actions().SET_BUCK_ROOT,
      buckRoot: null
    }, Actions().setBuildTarget('test')]);
  });
  it('Gets the Buck root for a real project', async () => {
    jest.spyOn(BuckBase(), 'getBuckProjectRoot').mockReturnValue(Promise.resolve('test_buck'));
    const stream = await (0, _Epics().setProjectRootEpic)(new (_reduxObservable().ActionsObservable)(_RxMin.Observable.of(Actions().setProjectRoot('test'))), mockStore).toArray().toPromise();
    expect(stream).toEqual([{
      type: Actions().SET_BUCK_ROOT,
      buckRoot: 'test_buck'
    }, Actions().setBuildTarget('test')]);
  });
});
describe('setBuildTargetEpic', () => {
  it('sets a null rule type and resolved build target with an empty build target', async () => {
    const stream = await (0, _Epics().setBuildTargetEpic)(new (_reduxObservable().ActionsObservable)(_RxMin.Observable.of(Actions().setBuildTarget(''))), mockStore).toArray().toPromise();
    expect(stream).toEqual([{
      type: Actions().SET_RULE_TYPE,
      ruleType: null
    }]);
  });
  it('sets the rule type and resolved build target to what buck service resolves', async () => {
    await (async () => {
      const fakeResolvedRule = {};
      jest.spyOn(BuckBase(), 'getBuckService').mockReturnValue({
        buildRuleTypeFor() {
          return Promise.resolve(fakeResolvedRule);
        }

      });
      const stream = await (0, _Epics().setBuildTargetEpic)(new (_reduxObservable().ActionsObservable)(_RxMin.Observable.of(Actions().setBuildTarget('test'))), mockStore).toArray().toPromise();
      expect(stream).toEqual([{
        type: Actions().SET_RULE_TYPE,
        ruleType: fakeResolvedRule
      }]);
    })();
  });
});
describe('setRuleTypeEpic', () => {
  it('sets platforms to an empty array for null ruleType', async () => {
    const stream = await (0, _Epics().setRuleTypeEpic)(new (_reduxObservable().ActionsObservable)(_RxMin.Observable.of({
      type: Actions().SET_RULE_TYPE,
      ruleType: null
    })), mockStore).toArray().toPromise();
    expect(stream).toEqual([{
      type: Actions().SET_PLATFORM_GROUPS,
      platformGroups: []
    }]);
  });
  it('sets platform groups to groups returned from platform service', async () => {
    jest.spyOn(mockPlatformService, 'getPlatformGroups').mockReturnValue(_RxMin.Observable.of('random platforms'));
    const stream = await (0, _Epics().setRuleTypeEpic)(new (_reduxObservable().ActionsObservable)(_RxMin.Observable.of({
      type: Actions().SET_RULE_TYPE,
      ruleType: 'haha'
    })), mockStore).toArray().toPromise();
    expect(stream).toEqual([{
      type: Actions().SET_PLATFORM_GROUPS,
      platformGroups: 'random platforms'
    }]);
  });
});