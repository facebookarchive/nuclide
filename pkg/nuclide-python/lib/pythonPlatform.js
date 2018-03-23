'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.providePythonPlatformGroup = providePythonPlatformGroup;

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function providePythonPlatformGroup(buckRoot, ruleType, buildTarget) {
  try {
    // $FlowFB
    const fbPythonPlatform = require('./fb-pythonPlatform');
    return fbPythonPlatform.providePythonPlatformGroup(buckRoot, ruleType, buildTarget);
  } catch (error) {
    return _rxjsBundlesRxMinJs.Observable.of(null);
  }
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */