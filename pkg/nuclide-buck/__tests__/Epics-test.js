'use strict';

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _reduxObservable;

function _load_reduxObservable() {
  return _reduxObservable = require('../../../modules/nuclide-commons/redux-observable');
}

var _nuclideBuckBase;

function _load_nuclideBuckBase() {
  return _nuclideBuckBase = _interopRequireWildcard(require('../../nuclide-buck-base'));
}

var _Actions;

function _load_Actions() {
  return _Actions = _interopRequireWildcard(require('../lib/redux/Actions'));
}

var _Epics;

function _load_Epics() {
  return _Epics = require('../lib/redux/Epics');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

const mockPlatformService = {
  getPlatformGroups(buckRoot, ruleType, buildTarget) {
    return null;
  }
}; /**
    * Copyright (c) 2015-present, Facebook, Inc.
    * All rights reserved.
    *
    * This source code is licensed under the license found in the LICENSE file in
    * the root directory of this source tree.
    *
    * 
    * @format
    */

const mockStore = {
  dispatch(action) {},
  getState() {
    return {
      buckRoot: '/test',
      buildTarget: 'test',
      selectedDevice: { udid: 'two', flavor: 'chocolate' },
      platformService: mockPlatformService
    };
  }
};

describe('setProjectRootEpic', () => {
  it('Sets the Buck root to null for null projects', async () => {
    await (async () => {
      const stream = await (0, (_Epics || _load_Epics()).setProjectRootEpic)(new (_reduxObservable || _load_reduxObservable()).ActionsObservable(_rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).setProjectRoot(null))), mockStore).toArray().toPromise();

      expect(stream).toEqual([{ type: (_Actions || _load_Actions()).SET_BUCK_ROOT, buckRoot: null }, (_Actions || _load_Actions()).setBuildTarget('test')]);
    })();
  });

  it('Gets the Buck root for a real project', async () => {
    await (async () => {
      jest.spyOn(_nuclideBuckBase || _load_nuclideBuckBase(), 'getBuckProjectRoot').mockReturnValue(Promise.resolve('test_buck'));

      const stream = await (0, (_Epics || _load_Epics()).setProjectRootEpic)(new (_reduxObservable || _load_reduxObservable()).ActionsObservable(_rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).setProjectRoot('test'))), mockStore).toArray().toPromise();

      expect(stream).toEqual([{ type: (_Actions || _load_Actions()).SET_BUCK_ROOT, buckRoot: 'test_buck' }, (_Actions || _load_Actions()).setBuildTarget('test')]);
    })();
  });
});

describe('setBuildTargetEpic', () => {
  it('sets a null rule type and resolved build target with an empty build target', async () => {
    await (async () => {
      const stream = await (0, (_Epics || _load_Epics()).setBuildTargetEpic)(new (_reduxObservable || _load_reduxObservable()).ActionsObservable(_rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).setBuildTarget(''))), mockStore).toArray().toPromise();

      expect(stream).toEqual([{ type: (_Actions || _load_Actions()).SET_RULE_TYPE, ruleType: null }]);
    })();
  });

  it('sets the rule type and resolved build target to what buck service resolves', async () => {
    await (async () => {
      const fakeResolvedRule = {};
      jest.spyOn(_nuclideBuckBase || _load_nuclideBuckBase(), 'getBuckService').mockReturnValue({
        buildRuleTypeFor() {
          return Promise.resolve(fakeResolvedRule);
        }
      });

      const stream = await (0, (_Epics || _load_Epics()).setBuildTargetEpic)(new (_reduxObservable || _load_reduxObservable()).ActionsObservable(_rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).setBuildTarget('test'))), mockStore).toArray().toPromise();

      expect(stream).toEqual([{
        type: (_Actions || _load_Actions()).SET_RULE_TYPE,
        ruleType: fakeResolvedRule
      }]);
    })();
  });
});

describe('setRuleTypeEpic', () => {
  it('sets platforms to an empty array for null ruleType', async () => {
    await (async () => {
      const stream = await (0, (_Epics || _load_Epics()).setRuleTypeEpic)(new (_reduxObservable || _load_reduxObservable()).ActionsObservable(_rxjsBundlesRxMinJs.Observable.of({ type: (_Actions || _load_Actions()).SET_RULE_TYPE, ruleType: null })), mockStore).toArray().toPromise();

      expect(stream).toEqual([{ type: (_Actions || _load_Actions()).SET_PLATFORM_GROUPS, platformGroups: [] }]);
    })();
  });

  it('sets platform groups to groups returned from platform service', async () => {
    await (async () => {
      jest.spyOn(mockPlatformService, 'getPlatformGroups').mockReturnValue(_rxjsBundlesRxMinJs.Observable.of('random platforms'));

      const stream = await (0, (_Epics || _load_Epics()).setRuleTypeEpic)(new (_reduxObservable || _load_reduxObservable()).ActionsObservable(_rxjsBundlesRxMinJs.Observable.of({ type: (_Actions || _load_Actions()).SET_RULE_TYPE, ruleType: 'haha' })), mockStore).toArray().toPromise();

      expect(stream).toEqual([{ type: (_Actions || _load_Actions()).SET_PLATFORM_GROUPS, platformGroups: 'random platforms' }]);
    })();
  });
});