'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.observePackageIsEnabled = observePackageIsEnabled;
exports.disable = disable;

var _event;

function _load_event() {
  return _event = require('nuclide-commons/event');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */

const LINTER_PACKAGE = 'linter';

function observePackageIsEnabled() {
  return _rxjsBundlesRxMinJs.Observable.merge(_rxjsBundlesRxMinJs.Observable.of(atom.packages.isPackageActive(LINTER_PACKAGE)), (0, (_event || _load_event()).observableFromSubscribeFunction)(atom.packages.onDidActivatePackage.bind(atom.packages)).filter(pkg => pkg.name === LINTER_PACKAGE).mapTo(true), (0, (_event || _load_event()).observableFromSubscribeFunction)(atom.packages.onDidDeactivatePackage.bind(atom.packages)).filter(pkg => pkg.name === LINTER_PACKAGE).mapTo(false));
}

function disable() {
  atom.packages.disablePackage(LINTER_PACKAGE);
}