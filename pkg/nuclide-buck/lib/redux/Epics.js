'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setProjectRootEpic = setProjectRootEpic;
exports.setBuildTargetEpic = setBuildTargetEpic;
exports.setRuleTypeEpic = setRuleTypeEpic;

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _nuclideBuckBase;

function _load_nuclideBuckBase() {
  return _nuclideBuckBase = require('../../../nuclide-buck-base');
}

var _Actions;

function _load_Actions() {
  return _Actions = _interopRequireWildcard(require('./Actions'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

function setProjectRootEpic(actions, store) {
  return actions.ofType((_Actions || _load_Actions()).SET_PROJECT_ROOT).switchMap(action => {
    if (!(action.type === (_Actions || _load_Actions()).SET_PROJECT_ROOT)) {
      throw new Error('Invariant violation: "action.type === Actions.SET_PROJECT_ROOT"');
    }

    const { projectRoot } = action;
    const rootObs = projectRoot == null ? _rxjsBundlesRxMinJs.Observable.of(null) : _rxjsBundlesRxMinJs.Observable.fromPromise((0, (_nuclideBuckBase || _load_nuclideBuckBase()).getBuckProjectRoot)(projectRoot));
    return rootObs.switchMap(buckRoot => _rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).setBuckRoot(buckRoot),
    // Also refresh the rule type of the current target.
    (_Actions || _load_Actions()).setBuildTarget(store.getState().buildTarget)));
  });
}

// Intentionally not exposed in Actions; this shouldn't be used externally.
function setRuleType(ruleType) {
  return { type: (_Actions || _load_Actions()).SET_RULE_TYPE, ruleType };
}

function setPlatformGroups(platformGroups) {
  return { type: (_Actions || _load_Actions()).SET_PLATFORM_GROUPS, platformGroups };
}

function setBuildTargetEpic(actions, store) {
  return actions.ofType((_Actions || _load_Actions()).SET_BUILD_TARGET).switchMap(action => {
    if (!(action.type === (_Actions || _load_Actions()).SET_BUILD_TARGET)) {
      throw new Error('Invariant violation: "action.type === Actions.SET_BUILD_TARGET"');
    }

    const { buildTarget } = action;
    const { buckRoot } = store.getState();
    if (buckRoot == null || buildTarget === '') {
      return _rxjsBundlesRxMinJs.Observable.of(null);
    }
    const buckService = (0, (_nuclideBuckBase || _load_nuclideBuckBase()).getBuckService)(buckRoot);
    if (buckService == null) {
      return _rxjsBundlesRxMinJs.Observable.of(null);
    }
    return _rxjsBundlesRxMinJs.Observable.defer(() => buckService.buildRuleTypeFor(buckRoot, buildTarget)).catch(() => _rxjsBundlesRxMinJs.Observable.of(null));
  }).switchMap(ruleType => _rxjsBundlesRxMinJs.Observable.of(setRuleType(ruleType)));
}

function setRuleTypeEpic(actions, store) {
  return actions.ofType((_Actions || _load_Actions()).SET_RULE_TYPE).switchMap(action => {
    if (!(action.type === (_Actions || _load_Actions()).SET_RULE_TYPE)) {
      throw new Error('Invariant violation: "action.type === Actions.SET_RULE_TYPE"');
    }

    const { ruleType } = action;
    if (ruleType) {
      const state = store.getState();
      // flowlint-next-line sketchy-null-string:off

      if (!state.buckRoot) {
        throw new Error('Invariant violation: "state.buckRoot"');
      }

      return state.platformService.getPlatformGroups(state.buckRoot, ruleType.type, state.buildTarget).map(platformGroups => setPlatformGroups(platformGroups));
    } else {
      return _rxjsBundlesRxMinJs.Observable.of(setPlatformGroups([]));
    }
  });
}