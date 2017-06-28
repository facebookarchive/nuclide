'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.registerProvider = registerProvider;
exports.consumeRecentFilesService = consumeRecentFilesService;

var _RecentFilesProvider;

function _load_RecentFilesProvider() {
  return _RecentFilesProvider = require('./RecentFilesProvider');
}

function registerProvider() {
  return (_RecentFilesProvider || _load_RecentFilesProvider()).RecentFilesProvider;
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

function consumeRecentFilesService(service) {
  (0, (_RecentFilesProvider || _load_RecentFilesProvider()).setRecentFilesService)(service);
}