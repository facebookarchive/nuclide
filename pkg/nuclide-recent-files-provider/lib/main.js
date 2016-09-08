Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

exports.registerProvider = registerProvider;
exports.consumeRecentFilesService = consumeRecentFilesService;

var _RecentFilesProvider2;

function _RecentFilesProvider() {
  return _RecentFilesProvider2 = require('./RecentFilesProvider');
}

function registerProvider() {
  return (_RecentFilesProvider2 || _RecentFilesProvider()).RecentFilesProvider;
}

function consumeRecentFilesService(service) {
  // $FlowFixMe
  (_RecentFilesProvider2 || _RecentFilesProvider()).RecentFilesProvider.setRecentFilesService(service);
}