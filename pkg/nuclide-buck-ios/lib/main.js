'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.deactivate = deactivate;
exports.consumePlatformService = consumePlatformService;

var _types;

function _load_types() {
  return _types = require('./types');
}

var _Platforms;

function _load_Platforms() {
  return _Platforms = require('./Platforms');
}

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('../../../modules/nuclide-commons/fsPromise'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _consumeFirstProvider;

function _load_consumeFirstProvider() {
  return _consumeFirstProvider = _interopRequireDefault(require('../../../modules/nuclide-commons-atom/consumeFirstProvider'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let disposable = null; /**
                        * Copyright (c) 2015-present, Facebook, Inc.
                        * All rights reserved.
                        *
                        * This source code is licensed under the license found in the LICENSE file in
                        * the root directory of this source tree.
                        *
                        *  strict-local
                        * @format
                        */

function deactivate() {
  if (disposable != null) {
    disposable.dispose();
    disposable = null;
  }
}

function consumePlatformService(service) {
  disposable = service.register(provideIosPlatformGroup);
}

function provideIosPlatformGroup(buckRoot, ruleType, buildTarget) {
  if (!(_types || _load_types()).SUPPORTED_RULE_TYPES.has(ruleType)) {
    return _rxjsBundlesRxMinJs.Observable.of(null);
  }
  if (ruleType === 'apple_binary' && buildTarget.endsWith('AppleMac')) {
    return _rxjsBundlesRxMinJs.Observable.of(null);
  }

  return _rxjsBundlesRxMinJs.Observable.fromPromise((_fsPromise || _load_fsPromise()).default.exists((_nuclideUri || _load_nuclideUri()).default.join(buckRoot, 'mode', 'oculus-mobile'))).switchMap(result => {
    if (result) {
      return _rxjsBundlesRxMinJs.Observable.of(null);
    } else {
      return _rxjsBundlesRxMinJs.Observable.fromPromise(_getDebuggerCallback(buckRoot)).switchMap(debuggerCallback => {
        return _rxjsBundlesRxMinJs.Observable.combineLatest((0, (_Platforms || _load_Platforms()).getSimulatorPlatform)(buckRoot, ruleType, debuggerCallback), (0, (_Platforms || _load_Platforms()).getDevicePlatform)(buckRoot, ruleType, debuggerCallback)).map(([simulatorPlatform, devicePlatform]) => {
          return {
            name: 'iOS',
            platforms: [simulatorPlatform, devicePlatform]
          };
        });
      });
    }
  });
}

async function _getDebuggerCallback(buckRoot) {
  const nativeDebuggerService = await (0, (_consumeFirstProvider || _load_consumeFirstProvider()).default)('debugger.native-debugger-service');

  if (nativeDebuggerService == null) {
    return null;
  }

  return processStream => {
    return nativeDebuggerService.debugTargetFromBuckOutput(buckRoot, processStream);
  };
}