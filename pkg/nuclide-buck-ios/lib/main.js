"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.deactivate = deactivate;
exports.consumePlatformService = consumePlatformService;

function _types() {
  const data = require("./types");

  _types = function () {
    return data;
  };

  return data;
}

function _Platforms() {
  const data = require("./Platforms");

  _Platforms = function () {
    return data;
  };

  return data;
}

function _fsPromise() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/fsPromise"));

  _fsPromise = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _consumeFirstProvider() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/consumeFirstProvider"));

  _consumeFirstProvider = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
let disposable = null;

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
  if (!_types().SUPPORTED_RULE_TYPES.has(ruleType)) {
    return _RxMin.Observable.of(null);
  }

  if (ruleType === 'apple_binary' && buildTarget.endsWith('AppleMac')) {
    return _RxMin.Observable.of(null);
  }

  return _RxMin.Observable.fromPromise(_fsPromise().default.exists(_nuclideUri().default.join(buckRoot, 'mode', 'oculus-mobile'))).switchMap(result => {
    if (result) {
      return _RxMin.Observable.of(null);
    } else {
      return _RxMin.Observable.fromPromise(_getDebuggerCallback(buckRoot)).switchMap(debuggerCallback => {
        return _RxMin.Observable.combineLatest((0, _Platforms().getSimulatorPlatform)(buckRoot, ruleType, debuggerCallback), (0, _Platforms().getDevicePlatform)(buckRoot, ruleType, debuggerCallback)).map(([simulatorPlatform, devicePlatform]) => {
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
  const nativeDebuggerService = await (0, _consumeFirstProvider().default)('debugger.native-debugger-service');

  if (nativeDebuggerService == null) {
    return null;
  }

  return processStream => {
    return nativeDebuggerService.debugTargetFromBuckOutput(buckRoot, processStream);
  };
}