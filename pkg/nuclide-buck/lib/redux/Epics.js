"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setProjectRootEpic = setProjectRootEpic;
exports.setBuckRootEpic = setBuckRootEpic;
exports.setBuildTargetEpic = setBuildTargetEpic;
exports.setRuleTypeEpic = setRuleTypeEpic;

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _nuclideBuckBase() {
  const data = require("../../../nuclide-buck-base");

  _nuclideBuckBase = function () {
    return data;
  };

  return data;
}

function Actions() {
  const data = _interopRequireWildcard(require("./Actions"));

  Actions = function () {
    return data;
  };

  return data;
}

function _nuclideRemoteConnection() {
  const data = require("../../../nuclide-remote-connection");

  _nuclideRemoteConnection = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
  return actions.ofType(Actions().SET_PROJECT_ROOT).switchMap(action => {
    if (!(action.type === Actions().SET_PROJECT_ROOT)) {
      throw new Error("Invariant violation: \"action.type === Actions.SET_PROJECT_ROOT\"");
    }

    const {
      projectRoot
    } = action;
    const rootObs = projectRoot == null ? _RxMin.Observable.of(null) : _RxMin.Observable.fromPromise((0, _nuclideBuckBase().getBuckProjectRoot)(projectRoot));
    return rootObs.switchMap(buckRoot => _RxMin.Observable.of(Actions().setBuckRoot(buckRoot), // Also refresh the rule type of the current target.
    Actions().setBuildTarget(store.getState().buildTarget)));
  });
}

function setBuckRootEpic(actions, store) {
  return actions.ofType(Actions().SET_BUCK_ROOT).switchMap(action => {
    if (!(action.type === Actions().SET_BUCK_ROOT)) {
      throw new Error("Invariant violation: \"action.type === Actions.SET_BUCK_ROOT\"");
    }

    const {
      buckRoot
    } = action;

    if (buckRoot == null) {
      return _RxMin.Observable.empty();
    }

    const watcherService = (0, _nuclideRemoteConnection().getFileWatcherServiceByNuclideUri)(buckRoot);
    return _RxMin.Observable.of(undefined).concat(watcherService.watchWithNode(buckRoot, true).refCount().filter(event => _nuclideUri().default.basename(event.path) === '.buckversion')).switchMap(() => readBuckversionFile(buckRoot)).map(fileContents => Actions().setBuckversionFileContents(fileContents));
  });
}

async function readBuckversionFile(buckRoot) {
  const fileSystemService = (0, _nuclideRemoteConnection().getFileSystemServiceByNuclideUri)(buckRoot);

  try {
    const data = await fileSystemService.readFile(_nuclideUri().default.join(buckRoot, '.buckversion'));
    return String(data);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      (0, _log4js().getLogger)().error(error);
    }

    return error;
  }
} // Intentionally not exposed in Actions; this shouldn't be used externally.


function setRuleType(ruleType) {
  return {
    type: Actions().SET_RULE_TYPE,
    ruleType
  };
}

function setPlatformGroups(platformGroups) {
  return {
    type: Actions().SET_PLATFORM_GROUPS,
    platformGroups
  };
}

function setBuildTargetEpic(actions, store) {
  return actions.ofType(Actions().SET_BUILD_TARGET).switchMap(action => {
    if (!(action.type === Actions().SET_BUILD_TARGET)) {
      throw new Error("Invariant violation: \"action.type === Actions.SET_BUILD_TARGET\"");
    }

    const {
      buildTarget
    } = action;
    const {
      buckRoot
    } = store.getState();

    if (buckRoot == null || buildTarget === '') {
      return _RxMin.Observable.of(null);
    }

    const buckService = (0, _nuclideBuckBase().getBuckService)(buckRoot);

    if (buckService == null) {
      return _RxMin.Observable.of(null);
    }

    return _RxMin.Observable.defer(() => {
      return buckService.buildRuleTypeFor(buckRoot, buildTarget);
    }).catch(error => {
      (0, _log4js().getLogger)().error(error);
      return _RxMin.Observable.of(null);
    });
  }).switchMap(ruleType => _RxMin.Observable.of(setRuleType(ruleType)));
}

function setRuleTypeEpic(actions, store) {
  return actions.ofType(Actions().SET_RULE_TYPE).switchMap(action => {
    if (!(action.type === Actions().SET_RULE_TYPE)) {
      throw new Error("Invariant violation: \"action.type === Actions.SET_RULE_TYPE\"");
    }

    const {
      ruleType
    } = action;

    if (ruleType) {
      const state = store.getState(); // flowlint-next-line sketchy-null-string:off

      if (!state.buckRoot) {
        throw new Error("Invariant violation: \"state.buckRoot\"");
      }

      return state.platformService.getPlatformGroups(state.buckRoot, ruleType.type, state.buildTarget).map(platformGroups => setPlatformGroups(platformGroups));
    } else {
      return _RxMin.Observable.of(setPlatformGroups([]));
    }
  });
}