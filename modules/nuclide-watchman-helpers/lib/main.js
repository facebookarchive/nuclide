'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WatchmanSubscription = exports.WatchmanClient = undefined;

var _WatchmanClient;

function _load_WatchmanClient() {
  return _WatchmanClient = _interopRequireDefault(require('./WatchmanClient'));
}

var _WatchmanSubscription;

function _load_WatchmanSubscription() {
  return _WatchmanSubscription = _interopRequireDefault(require('./WatchmanSubscription'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.WatchmanClient = (_WatchmanClient || _load_WatchmanClient()).default;
exports.WatchmanSubscription = (_WatchmanSubscription || _load_WatchmanSubscription()).default; /**
                                                                                                 * Copyright (c) 2017-present, Facebook, Inc.
                                                                                                 * All rights reserved.
                                                                                                 *
                                                                                                 * This source code is licensed under the BSD-style license found in the
                                                                                                 * LICENSE file in the root directory of this source tree. An additional grant
                                                                                                 * of patent rights can be found in the PATENTS file in the same directory.
                                                                                                 *
                                                                                                 *  strict-local
                                                                                                 * @format
                                                                                                 */