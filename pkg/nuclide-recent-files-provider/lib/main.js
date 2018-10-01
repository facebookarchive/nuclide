"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.registerProvider = registerProvider;
exports.consumeRecentFilesService = consumeRecentFilesService;

function _RecentFilesProvider() {
  const data = require("./RecentFilesProvider");

  _RecentFilesProvider = function () {
    return data;
  };

  return data;
}

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
function registerProvider() {
  return _RecentFilesProvider().RecentFilesProvider;
}

function consumeRecentFilesService(service) {
  (0, _RecentFilesProvider().setRecentFilesService)(service);
}