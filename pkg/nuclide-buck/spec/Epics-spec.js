/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import {Observable} from 'rxjs';
import {ActionsObservable} from '../../commons-node/redux-observable';
import * as BuckBase from '../../nuclide-buck-base';
import * as Actions from '../lib/redux/Actions';
import {
  setProjectRootEpic,
  setBuildTargetEpic,
  setRuleTypeEpic,
} from '../lib/redux/Epics';

const mockPlatformService = {
  getPlatformGroups(buckRoot, ruleType, buildTarget): ?any {
    return null;
  },
};

const mockStore = {
  dispatch(action) {},
  getState(): any {
    return {
      buckRoot: '/test',
      buildTarget: 'test',
      selectedDevice: {udid: 'two', flavor: 'chocolate'},
      platformService: mockPlatformService,
    };
  },
};

describe('setProjectRootEpic', () => {
  it('Sets the Buck root to null for null projects', () => {
    waitsForPromise(async () => {
      const stream = await setProjectRootEpic(
        new ActionsObservable(Observable.of(Actions.setProjectRoot(null))),
        mockStore,
      ).toArray().toPromise();

      expect(stream).toEqual([
        {type: Actions.SET_BUCK_ROOT, buckRoot: null},
        Actions.setBuildTarget('test'),
      ]);
    });
  });

  it('Gets the Buck root for a real project', () => {
    waitsForPromise(async () => {
      spyOn(BuckBase, 'getBuckProjectRoot').andReturn(Promise.resolve('test_buck'));

      const stream = await setProjectRootEpic(
        new ActionsObservable(Observable.of(Actions.setProjectRoot('test'))),
        mockStore,
      ).toArray().toPromise();

      expect(stream).toEqual([
        {type: Actions.SET_BUCK_ROOT, buckRoot: 'test_buck'},
        Actions.setBuildTarget('test'),
      ]);
    });
  });
});

describe('setBuildTargetEpic', () => {
  it('sets a null rule type with an empty build target', () => {
    waitsForPromise(async () => {
      const stream = await setBuildTargetEpic(
        new ActionsObservable(Observable.of(Actions.setBuildTarget(''))),
        mockStore,
      ).toArray().toPromise();

      expect(stream).toEqual([
        {type: Actions.SET_RULE_TYPE, ruleType: null},
      ]);
    });
  });

  it('sets the rule type to what buck service resolves', () => {
    waitsForPromise(async () => {
      spyOn(BuckBase, 'getBuckService').andReturn({
        buildRuleTypeFor() {
          return Promise.resolve('some_rule_type');
        },
      });

      const stream = await setBuildTargetEpic(
        new ActionsObservable(Observable.of(Actions.setBuildTarget('test'))),
        mockStore,
      ).toArray().toPromise();

      expect(stream).toEqual([
        {type: Actions.SET_RULE_TYPE, ruleType: 'some_rule_type'},
      ]);
    });
  });
});

describe('setRuleTypeEpic', () => {
  it('sets platforms to an empty array for null ruleType', () => {
    waitsForPromise(async () => {
      const stream = await setRuleTypeEpic(
        new ActionsObservable(
          Observable.of({type: Actions.SET_RULE_TYPE, ruleType: null})),
          mockStore,
      ).toArray().toPromise();

      expect(stream).toEqual([
        {type: Actions.SET_PLATFORM_GROUPS, platformGroups: []},
      ]);
    });
  });

  it('sets platform groups to groups returned from platform service', () => {
    waitsForPromise(async () => {
      spyOn(mockPlatformService, 'getPlatformGroups').andReturn(
        Observable.of('random platforms'),
      );

      const stream = await setRuleTypeEpic(
        new ActionsObservable(
          Observable.of({type: Actions.SET_RULE_TYPE, ruleType: 'haha'})),
          mockStore,
      ).toArray().toPromise();

      expect(stream).toEqual([
        {type: Actions.SET_PLATFORM_GROUPS, platformGroups: 'random platforms'},
      ]);
    });
  });
});
