'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.loadedShellEnvironment = loadedShellEnvironment;

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../commons-node/UniversalDisposable'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

// TODO(T17266325): Remove this module when `atom.whenShellEnvironmentLoaded()` lands.

const emitter = new _rxjsBundlesRxMinJs.ReplaySubject(1);

function loadedShellEnvironment() {
  emitter.next();
}

function whenShellEnvironmentLoaded(cb) {
  return new (_UniversalDisposable || _load_UniversalDisposable()).default(emitter.take(1).subscribe(cb));
}

exports.default = typeof atom === 'undefined' ? null : whenShellEnvironmentLoaded;