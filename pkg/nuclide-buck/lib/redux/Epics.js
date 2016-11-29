'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setProjectRootEpic = setProjectRootEpic;
exports.setBuildTargetEpic = setBuildTargetEpic;
exports.fetchDevicesEpic = fetchDevicesEpic;

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _nuclideBuckBase;

function _load_nuclideBuckBase() {
  return _nuclideBuckBase = require('../../../nuclide-buck-base');
}

var _nuclideIosCommon;

function _load_nuclideIosCommon() {
  return _nuclideIosCommon = _interopRequireWildcard(require('../../../nuclide-ios-common'));
}

var _Actions;

function _load_Actions() {
  return _Actions = _interopRequireWildcard(require('./Actions'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function setProjectRootEpic(actions, store) {
  return actions.ofType((_Actions || _load_Actions()).SET_PROJECT_ROOT).switchMap(action => {
    if (!(action.type === (_Actions || _load_Actions()).SET_PROJECT_ROOT)) {
      throw new Error('Invariant violation: "action.type === Actions.SET_PROJECT_ROOT"');
    }

    const { projectRoot } = action;
    const rootObs = projectRoot == null ? _rxjsBundlesRxMinJs.Observable.of(null) : _rxjsBundlesRxMinJs.Observable.fromPromise((0, (_nuclideBuckBase || _load_nuclideBuckBase()).getBuckProjectRoot)(projectRoot));
    return rootObs.switchMap(buckRoot => _rxjsBundlesRxMinJs.Observable.of({ type: (_Actions || _load_Actions()).SET_BUCK_ROOT, buckRoot },
    // Also refresh the rule type of the current target.
    (_Actions || _load_Actions()).setBuildTarget(store.getState().buildTarget)));
  });
}

// Intentionally not exposed in Actions; this shouldn't be used externally.
function setRuleType(ruleType) {
  return { type: (_Actions || _load_Actions()).SET_RULE_TYPE, ruleType };
}

function setBuildTargetEpic(actions, store) {
  return actions.ofType((_Actions || _load_Actions()).SET_BUILD_TARGET).switchMap(action => {
    if (!(action.type === (_Actions || _load_Actions()).SET_BUILD_TARGET)) {
      throw new Error('Invariant violation: "action.type === Actions.SET_BUILD_TARGET"');
    }

    const { buildTarget } = action;
    const { buckRoot } = store.getState();
    if (buckRoot == null || buildTarget === '') {
      return _rxjsBundlesRxMinJs.Observable.of(setRuleType(null));
    }
    const buckService = (0, (_nuclideBuckBase || _load_nuclideBuckBase()).getBuckService)(buckRoot);
    if (buckService == null) {
      return _rxjsBundlesRxMinJs.Observable.of(setRuleType(null));
    }
    return _rxjsBundlesRxMinJs.Observable.fromPromise(buckService.buildRuleTypeFor(buckRoot, buildTarget)).catch(() => _rxjsBundlesRxMinJs.Observable.of(null)).switchMap(ruleType => _rxjsBundlesRxMinJs.Observable.concat(_rxjsBundlesRxMinJs.Observable.of(setRuleType(ruleType)),
    // Fetch the device list for iOS devices.
    // TODO: extend this to other target types via provider.
    ruleType === 'apple_bundle' ? _rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).fetchDevices()) : _rxjsBundlesRxMinJs.Observable.empty()));
  });
}

function fetchDevicesEpic(actions, store) {
  return actions.ofType((_Actions || _load_Actions()).FETCH_DEVICES).switchMap(action => {
    return (_nuclideIosCommon || _load_nuclideIosCommon()).getDevices().map(devices => ({ type: (_Actions || _load_Actions()).SET_DEVICES, devices }));
  });
}