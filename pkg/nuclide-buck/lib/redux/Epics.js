'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setProjectRootEpic = setProjectRootEpic;
exports.setBuckRootEpic = setBuckRootEpic;
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

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../../nuclide-remote-connection');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../../modules/nuclide-commons/nuclideUri'));
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
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

function setBuckRootEpic(actions, store) {
  return actions.ofType((_Actions || _load_Actions()).SET_BUCK_ROOT).switchMap(action => {
    if (!(action.type === (_Actions || _load_Actions()).SET_BUCK_ROOT)) {
      throw new Error('Invariant violation: "action.type === Actions.SET_BUCK_ROOT"');
    }

    const { buckRoot } = action;
    if (buckRoot == null) {
      return _rxjsBundlesRxMinJs.Observable.empty();
    }
    const watcherService = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getFileWatcherServiceByNuclideUri)(buckRoot);
    return _rxjsBundlesRxMinJs.Observable.of(undefined).concat(watcherService.watchWithNode(buckRoot, true).refCount().filter(event => (_nuclideUri || _load_nuclideUri()).default.basename(event.path) === '.buckversion')).switchMap(() => readBuckversionFile(buckRoot)).map(fileContents => (_Actions || _load_Actions()).setBuckversionFileContents(fileContents));
  });
}

async function readBuckversionFile(buckRoot) {
  const fileSystemService = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getFileSystemServiceByNuclideUri)(buckRoot);
  try {
    const data = await fileSystemService.readFile((_nuclideUri || _load_nuclideUri()).default.join(buckRoot, '.buckversion'));
    return String(data);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      (0, (_log4js || _load_log4js()).getLogger)().error(error);
    }
    return error;
  }
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
    return _rxjsBundlesRxMinJs.Observable.defer(() => {
      return buckService.buildRuleTypeFor(buckRoot, buildTarget);
    }).catch(error => {
      (0, (_log4js || _load_log4js()).getLogger)().error(error);
      return _rxjsBundlesRxMinJs.Observable.of(null);
    });
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