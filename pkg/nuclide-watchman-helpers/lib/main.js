Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _WatchmanClient2;

function _WatchmanClient() {
  return _WatchmanClient2 = _interopRequireDefault(require('./WatchmanClient'));
}

var _WatchmanSubscription2;

function _WatchmanSubscription() {
  return _WatchmanSubscription2 = _interopRequireDefault(require('./WatchmanSubscription'));
}

exports.WatchmanClient = (_WatchmanClient2 || _WatchmanClient()).default;
exports.WatchmanSubscription = (_WatchmanSubscription2 || _WatchmanSubscription()).default;